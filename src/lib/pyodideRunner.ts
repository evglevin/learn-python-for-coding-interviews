import type { RunResult, RuntimeStatus, TestCase } from '../types/course';

type StatusListener = (status: RuntimeStatus, error?: string) => void;

interface PendingRequest {
  resolve: (result: RunResult) => void;
  timer: ReturnType<typeof setTimeout>;
  mode: 'run' | 'submit';
  expectedOutput: string;
}

const EXECUTION_TIMEOUT_MS = 6000;

class PyodideRunner {
  private worker: Worker | null = null;
  private status: RuntimeStatus = 'loading';
  private initError: string | undefined;
  private listeners = new Set<StatusListener>();
  private requestCounter = 0;
  private pending = new Map<number, PendingRequest>();

  constructor() {
    this.spawnWorker();
  }

  private setStatus(status: RuntimeStatus, error?: string) {
    this.status = status;
    this.initError = error;
    for (const listener of this.listeners) {
      listener(status, error);
    }
  }

  public getStatus(): { status: RuntimeStatus; error?: string } {
    return { status: this.status, error: this.initError };
  }

  public subscribe(listener: StatusListener): () => void {
    this.listeners.add(listener);
    listener(this.status, this.initError);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private spawnWorker() {
    if (this.worker) {
      this.worker.terminate();
      this.worker = null;
    }

    this.setStatus('loading');
    const worker = new Worker(
      new URL('../workers/pyodideWorker.ts', import.meta.url),
      { type: 'module' }
    );

    worker.onmessage = (event: MessageEvent) => {
      const data = event.data;
      if (data.type === 'ready') {
        this.setStatus('ready');
      } else if (data.type === 'init-error') {
        this.setStatus('error', data.error);
      } else if (data.type === 'result') {
        const req = this.pending.get(data.requestId);
        if (req) {
          clearTimeout(req.timer);
          this.pending.delete(data.requestId);
          this.setStatus('ready');
          req.resolve(data.result);
        }
      }
    };

    worker.onerror = (err) => {
      const message = err.message || 'Python runtime worker crashed.';
      for (const [, req] of this.pending) {
        clearTimeout(req.timer);
        req.resolve({
          mode: req.mode,
          stdout: '',
          stderr: '',
          expectedOutput: req.expectedOutput,
          outputMatches: false,
          runtimeMs: 0,
          error: message,
          testResults: [],
          allTestsPassed: false,
        });
      }
      this.pending.clear();
      this.setStatus('error', message);
    };

    this.worker = worker;
    worker.postMessage({ type: 'init' });
  }

  public stopExecution(reason = 'Execution stopped by user.'): void {
    if (this.pending.size === 0) return;

    for (const [, req] of this.pending) {
      clearTimeout(req.timer);
      req.resolve({
        mode: req.mode,
        stdout: '',
        stderr: '',
        expectedOutput: req.expectedOutput,
        outputMatches: false,
        runtimeMs: EXECUTION_TIMEOUT_MS,
        error: reason,
        testResults: [],
        allTestsPassed: false,
      });
    }
    this.pending.clear();
    this.spawnWorker();
  }

  public execute(params: {
    mode: 'run' | 'submit';
    code: string;
    expectedOutput: string;
    testCases: TestCase[];
  }): Promise<RunResult> {
    if (!this.worker || this.status === 'error') {
      this.spawnWorker();
    }

    const requestId = ++this.requestCounter;
    this.setStatus('running');

    return new Promise<RunResult>((resolve) => {
      const timer = setTimeout(() => {
        if (this.pending.has(requestId)) {
          this.stopExecution(
            `Time Limit Exceeded (${EXECUTION_TIMEOUT_MS / 1000}s). Check for infinite loops and try again.`
          );
        }
      }, EXECUTION_TIMEOUT_MS);

      this.pending.set(requestId, {
        resolve,
        timer,
        mode: params.mode,
        expectedOutput: params.expectedOutput,
      });

      this.worker!.postMessage({
        type: 'execute',
        requestId,
        mode: params.mode,
        code: params.code,
        expectedOutput: params.expectedOutput,
        testCases: params.testCases,
      });
    });
  }
}

export const pyodideRunner = new PyodideRunner();
