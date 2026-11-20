import { SORTEDCONTAINERS_PY } from './sortedcontainersPolyfill';
import type { TestCase, TestCaseResult } from '../types/course';

interface PyodideInstance {
  FS: {
    writeFile(path: string, data: string): void;
  };
  globals: {
    set(name: string, value: unknown): void;
    delete(name: string): void;
  };
  runPythonAsync(code: string): Promise<unknown>;
}

interface ExecuteMessage {
  type: 'execute';
  requestId: number;
  mode: 'run' | 'submit';
  code: string;
  expectedOutput: string;
  testCases: TestCase[];
}

interface InitMessage {
  type: 'init';
}

type IncomingMessage = ExecuteMessage | InitMessage;

let pyodidePromise: Promise<PyodideInstance> | null = null;

async function initPyodide(): Promise<PyodideInstance> {
  if (!pyodidePromise) {
    pyodidePromise = (async () => {
      const origin = self.location.origin;
      const pyodideUrl = `${origin}/pyodide/pyodide.mjs`;
      const mod = await import(/* @vite-ignore */ pyodideUrl);
      const pyodide: PyodideInstance = await mod.loadPyodide({
        indexURL: `${origin}/pyodide/`,
      });

      // Install pure-Python sortedcontainers into Pyodide's sys.path
      pyodide.FS.writeFile('/home/pyodide/sortedcontainers.py', SORTEDCONTAINERS_PY);
      await pyodide.runPythonAsync(`
import sys
if '/home/pyodide' not in sys.path:
    sys.path.insert(0, '/home/pyodide')
import sortedcontainers
`);
      return pyodide;
    })();
  }
  return pyodidePromise;
}

const PYTHON_HARNESS = `
import io
import json
import sys
import time
import traceback
from contextlib import redirect_stdout, redirect_stderr

def _format_user_traceback(exc_type, exc_value, exc_tb, filename="<solution.py>"):
    tb_entries = traceback.extract_tb(exc_tb)
    filtered = [frame for frame in tb_entries if frame.filename == filename]
    lines = ["Traceback (most recent call last):"]
    target_frames = filtered if filtered else tb_entries[-3:]
    for frame in target_frames:
        lines.append(f'  File "{frame.filename}", line {frame.lineno}, in {frame.name}')
        if frame.line:
            lines.append(f"    {frame.line}")
    lines.extend(traceback.format_exception_only(exc_type, exc_value))
    return "".join(lines).rstrip()

def _run_user_code(user_code, mode, expected_output, test_cases_json):
    start = time.perf_counter()
    stdout_buf = io.StringIO()
    stderr_buf = io.StringIO()
    namespace = {"__name__": "__main__"}
    exec_error = None

    try:
        compiled = compile(user_code, "<solution.py>", "exec")
        with redirect_stdout(stdout_buf), redirect_stderr(stderr_buf):
            exec(compiled, namespace)
    except BaseException as exc:
        if isinstance(exc, SystemExit):
            pass
        else:
            exec_error = _format_user_traceback(type(exc), exc, exc.__traceback__)

    stdout_text = stdout_buf.getvalue()
    stderr_text = stderr_buf.getvalue()

    norm_actual = "\\n".join(line.rstrip() for line in stdout_text.strip().splitlines())
    norm_expected = "\\n".join(line.rstrip() for line in expected_output.strip().splitlines())
    output_matches = (exec_error is None) and (norm_actual == norm_expected)

    result = {
        "mode": mode,
        "stdout": stdout_text,
        "stderr": stderr_text,
        "expectedOutput": expected_output,
        "outputMatches": output_matches,
        "runtimeMs": round((time.perf_counter() - start) * 1000, 1),
        "error": exec_error,
    }

    if mode == "submit":
        test_cases = json.loads(test_cases_json)
        test_results = []
        all_passed = exec_error is None

        if exec_error is not None:
            for tc in test_cases:
                test_results.append({
                    "name": tc["name"],
                    "inputDisplay": tc["inputDisplay"],
                    "expectedDisplay": tc["expectedDisplay"],
                    "actualDisplay": "Error before tests ran",
                    "passed": False,
                    "error": exec_error,
                })
        else:
            for tc in test_cases:
                tc_ns = dict(namespace)
                tc_stdout = io.StringIO()
                tc_stderr = io.StringIO()
                try:
                    compiled_tc = compile(tc["testCode"], "<test_case>", "exec")
                    with redirect_stdout(tc_stdout), redirect_stderr(tc_stderr):
                        exec(compiled_tc, tc_ns)

                    actual_val = tc_ns.get("_actual")
                    expected_val = tc_ns.get("_expected")
                    custom_passed = tc_ns.get("_passed", None)
                    custom_msg = tc_ns.get("_message", None)

                    if custom_passed is not None:
                        passed = bool(custom_passed)
                    else:
                        passed = (actual_val == expected_val)

                    if not passed:
                        all_passed = False

                    test_results.append({
                        "name": tc["name"],
                        "inputDisplay": tc["inputDisplay"],
                        "expectedDisplay": tc["expectedDisplay"],
                        "actualDisplay": repr(actual_val),
                        "passed": passed,
                        "message": custom_msg,
                    })
                except BaseException as exc:
                    all_passed = False
                    tb_str = _format_user_traceback(type(exc), exc, exc.__traceback__, "<solution.py>")
                    test_results.append({
                        "name": tc["name"],
                        "inputDisplay": tc["inputDisplay"],
                        "expectedDisplay": tc["expectedDisplay"],
                        "actualDisplay": f"{type(exc).__name__}: {exc}",
                        "passed": False,
                        "error": tb_str,
                    })

        result["testResults"] = test_results
        result["allTestsPassed"] = all_passed and len(test_results) > 0
        result["runtimeMs"] = round((time.perf_counter() - start) * 1000, 1)

    return json.dumps(result)
`;

let harnessInstalled = false;

async function ensureReady(): Promise<PyodideInstance> {
  const pyodide = await initPyodide();
  if (!harnessInstalled) {
    await pyodide.runPythonAsync(PYTHON_HARNESS);
    harnessInstalled = true;
  }
  return pyodide;
}

self.onmessage = async (event: MessageEvent<IncomingMessage>) => {
  const msg = event.data;

  if (msg.type === 'init') {
    try {
      await ensureReady();
      self.postMessage({ type: 'ready' });
    } catch (err) {
      self.postMessage({
        type: 'init-error',
        error: err instanceof Error ? err.message : String(err),
      });
    }
    return;
  }

  if (msg.type === 'execute') {
    try {
      const pyodide = await ensureReady();
      pyodide.globals.set('_req_code', msg.code);
      pyodide.globals.set('_req_mode', msg.mode);
      pyodide.globals.set('_req_expected', msg.expectedOutput);
      pyodide.globals.set('_req_tests', JSON.stringify(msg.testCases));

      const jsonResult = (await pyodide.runPythonAsync(
        '_run_user_code(_req_code, _req_mode, _req_expected, _req_tests)'
      )) as string;

      pyodide.globals.delete('_req_code');
      pyodide.globals.delete('_req_mode');
      pyodide.globals.delete('_req_expected');
      pyodide.globals.delete('_req_tests');

      const parsed = JSON.parse(jsonResult) as {
        mode: 'run' | 'submit';
        stdout: string;
        stderr: string;
        expectedOutput: string;
        outputMatches: boolean;
        runtimeMs: number;
        error?: string;
        testResults?: TestCaseResult[];
        allTestsPassed?: boolean;
      };

      self.postMessage({
        type: 'result',
        requestId: msg.requestId,
        result: parsed,
      });
    } catch (err) {
      self.postMessage({
        type: 'result',
        requestId: msg.requestId,
        result: {
          mode: msg.mode,
          stdout: '',
          stderr: '',
          expectedOutput: msg.expectedOutput,
          outputMatches: false,
          runtimeMs: 0,
          error: err instanceof Error ? err.message : String(err),
          testResults: [],
          allTestsPassed: false,
        },
      });
    }
  }
};
