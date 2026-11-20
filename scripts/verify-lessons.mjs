import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');

// Use esbuild (bundled with vite) to transpile the TS course data, polyfill and harness.
const esbuildPath = path.join(rootDir, 'node_modules', 'esbuild', 'lib', 'main.js');
const esbuild = await import(esbuildPath);

const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'py-course-verify-'));

const entries = {
  course: path.join(rootDir, 'src', 'data', 'index.ts'),
  polyfill: path.join(rootDir, 'src', 'workers', 'sortedcontainersPolyfill.ts'),
  harness: path.join(rootDir, 'src', 'workers', 'pythonHarness.ts'),
};
await esbuild.build({
  entryPoints: entries,
  bundle: true,
  format: 'esm',
  outdir: tmpDir,
  outExtension: { '.js': '.mjs' },
});

const { LESSONS, SECTIONS } = await import(path.join(tmpDir, 'course.mjs'));
const { SORTEDCONTAINERS_PY } = await import(path.join(tmpDir, 'polyfill.mjs'));
const { PYTHON_HARNESS } = await import(path.join(tmpDir, 'harness.mjs'));

// Python imports the exact polyfill and harness the browser worker uses.
fs.writeFileSync(path.join(tmpDir, 'sortedcontainers.py'), SORTEDCONTAINERS_PY, 'utf8');
fs.writeFileSync(path.join(tmpDir, 'course_harness.py'), PYTHON_HARNESS, 'utf8');

console.log(`Verifying ${LESSONS.length} lessons across ${SECTIONS.length} sections...\n`);

const verifierPy = `
import json
import sys

sys.path.insert(0, sys.argv[1])
from course_harness import _run_user_code

lessons = json.load(open(sys.argv[2], "r", encoding="utf-8"))
failures = []

def grade(code, lesson):
    return json.loads(_run_user_code(code, "submit", lesson["expectedOutput"], json.dumps(lesson["testCases"])))

for lesson in lessons:
    tag = f"[{lesson['index']}] {lesson['id']}"

    # 1. The reference solution must print expectedOutput exactly and pass every test.
    sol = grade(lesson["solutionCode"], lesson)
    if sol["error"]:
        failures.append(f"{tag}: solutionCode raised\\n{sol['error']}")
        continue
    if not sol["outputMatches"]:
        failures.append(
            f"{tag}: expectedOutput mismatch!\\n--- ACTUAL ---\\n{sol['stdout'].strip()}\\n--- EXPECTED ---\\n{lesson['expectedOutput'].strip()}"
        )
    for tr in sol["testResults"]:
        if not tr["passed"]:
            detail = tr.get("error") or f"actual={tr['actualDisplay']} expected={tr['expectedDisplay']}"
            failures.append(f"{tag} test '{tr['name']}' FAILED on solution: {detail}")
    if not sol["testResults"]:
        failures.append(f"{tag}: has no test cases")

    # 2. The starter code must compile and must NOT already pass all tests.
    try:
        compile(lesson["starterCode"], "<starter>", "exec")
    except SyntaxError as e:
        failures.append(f"{tag}: starterCode has SyntaxError: {e}")
        continue
    if grade(lesson["starterCode"], lesson)["allTestsPassed"]:
        failures.append(f"{tag}: starterCode unexpectedly passed all test cases!")

if failures:
    print("VERIFICATION FAILED:")
    for f in failures:
        print("  -", f)
    sys.exit(1)
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
