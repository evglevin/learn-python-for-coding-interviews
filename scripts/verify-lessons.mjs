import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');

// Use esbuild (bundled with vite) to transpile our TS data + polyfill into a temp JS bundle
const esbuildPath = path.join(rootDir, 'node_modules', 'esbuild', 'lib', 'main.js');
const esbuild = await import(esbuildPath);

const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'py-course-verify-'));
const bundleFile = path.join(tmpDir, 'course-bundle.mjs');

await esbuild.build({
  entryPoints: [path.join(rootDir, 'src', 'data', 'index.ts')],
  bundle: true,
  format: 'esm',
  outfile: bundleFile,
});

const polyfillBundle = path.join(tmpDir, 'polyfill-bundle.mjs');
await esbuild.build({
  entryPoints: [path.join(rootDir, 'src', 'workers', 'sortedcontainersPolyfill.ts')],
  bundle: true,
  format: 'esm',
  outfile: polyfillBundle,
});

const { LESSONS, SECTIONS } = await import(bundleFile);
const { SORTEDCONTAINERS_PY } = await import(polyfillBundle);

// Write sortedcontainers.py into tmpDir so Python imports our exact polyfill
fs.writeFileSync(path.join(tmpDir, 'sortedcontainers.py'), SORTEDCONTAINERS_PY, 'utf8');

console.log(`Verifying ${LESSONS.length} lessons across ${SECTIONS.length} sections...\n`);

if (LESSONS.length !== 40) {
  console.error(`FAIL: Expected 40 lessons, found ${LESSONS.length}`);
  process.exit(1);
}

// Verify consecutive indices 0..39
for (let i = 0; i < LESSONS.length; i++) {
  if (LESSONS[i].index !== i) {
    console.error(`FAIL: Lesson at position ${i} has index ${LESSONS[i].index}`);
    process.exit(1);
  }
}

const verifierPy = `
import io
import json
import sys
import traceback
from contextlib import redirect_stdout

sys.path.insert(0, sys.argv[1])
lessons = json.load(open(sys.argv[2], "r", encoding="utf-8"))

failures = []

for lesson in lessons:
    idx = lesson["index"]
    lid = lesson["id"]

    # 1. Verify solutionCode stdout matches expectedOutput AND passes all testCases
    ns = {"__name__": "__main__"}
    buf = io.StringIO()
    try:
        with redirect_stdout(buf):
            exec(compile(lesson["solutionCode"], f"<{lid}_sol>", "exec"), ns)
    except Exception as e:
        failures.append(f"[{idx}] {lid}: solutionCode raised {e}\\n{traceback.format_exc()}")
        continue

    actual_out = "\\n".join(line.rstrip() for line in buf.getvalue().strip().splitlines())
    expected_out = "\\n".join(line.rstrip() for line in lesson["expectedOutput"].strip().splitlines())
    if actual_out != expected_out:
        failures.append(
            f"[{idx}] {lid}: expectedOutput mismatch!\\n--- ACTUAL ---\\n{actual_out}\\n--- EXPECTED ---\\n{expected_out}"
        )

    for tc in lesson["testCases"]:
        tc_ns = dict(ns)
        try:
            exec(compile(tc["testCode"], f"<{lid}_{tc['name']}>", "exec"), tc_ns)
            custom_passed = tc_ns.get("_passed", None)
            passed = bool(custom_passed) if custom_passed is not None else (tc_ns.get("_actual") == tc_ns.get("_expected"))
            if not passed:
                failures.append(
                    f"[{idx}] {lid} test '{tc['name']}' FAILED on solution: actual={tc_ns.get('_actual')!r} expected={tc_ns.get('_expected')!r}"
                )
        except Exception as e:
            failures.append(f"[{idx}] {lid} test '{tc['name']}' raised {e}")

    # 2. Verify starterCode runs cleanly without syntax errors and does NOT pass all tests
    starter_ns = {"__name__": "__main__"}
    starter_buf = io.StringIO()
    starter_errored = False
    try:
        with redirect_stdout(starter_buf):
            exec(compile(lesson["starterCode"], f"<{lid}_starter>", "exec"), starter_ns)
    except SyntaxError as e:
        failures.append(f"[{idx}] {lid}: starterCode has SyntaxError: {e}")
        continue
    except Exception:
        starter_errored = True

    if not starter_errored:
        starter_passed_all = True
        for tc in lesson["testCases"]:
            tc_ns = dict(starter_ns)
            try:
                exec(compile(tc["testCode"], f"<{lid}_s_{tc['name']}>", "exec"), tc_ns)
                custom_passed = tc_ns.get("_passed", None)
                passed = bool(custom_passed) if custom_passed is not None else (tc_ns.get("_actual") == tc_ns.get("_expected"))
                if not passed:
                    starter_passed_all = False
                    break
            except Exception:
                starter_passed_all = False
                break
        if starter_passed_all:
            failures.append(f"[{idx}] {lid}: starterCode unexpectedly passed all test cases!")

if failures:
    print("VERIFICATION FAILED:")
    for f in failures:
        print("  -", f)
    sys.exit(1)
else:
    print(f"ALL {len(lessons)} LESSONS PASSED VERIFICATION (exact stdout + all unit tests + starter checks)!")
`;

const lessonsJsonPath = path.join(tmpDir, 'lessons.json');
const verifierPyPath = path.join(tmpDir, 'verify.py');
fs.writeFileSync(lessonsJsonPath, JSON.stringify(LESSONS), 'utf8');
fs.writeFileSync(verifierPyPath, verifierPy, 'utf8');

const py = spawnSync('python3', [verifierPyPath, tmpDir, lessonsJsonPath], {
  stdio: 'inherit',
});

fs.rmSync(tmpDir, { recursive: true, force: true });
process.exit(py.status ?? 1);
