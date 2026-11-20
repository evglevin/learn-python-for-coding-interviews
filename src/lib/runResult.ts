import type { RunResult } from '../types/course';

/** A RunResult for executions that never produced output (crash, stop, timeout, init failure). */
export function makeErrorResult(
  mode: RunResult['mode'],
  expectedOutput: string,
  error: string,
  runtimeMs = 0
): RunResult {
  return {
    mode,
    stdout: '',
    stderr: '',
    expectedOutput,
    outputMatches: false,
    runtimeMs,
    error,
    testResults: [],
    allTestsPassed: false,
  };
}
