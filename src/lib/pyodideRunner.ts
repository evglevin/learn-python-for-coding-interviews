import type { RunResult, RuntimeStatus, TestCase } from '../types/course';
import { makeErrorResult } from './runResult';

type StatusListener = (status: RuntimeStatus, error?: string) => void;

interface PendingRequest {
  id: number;
  resolve: (result: RunResult) => void;
  mode: 'run' | 'submit';
  expectedOutput: string;
  /** performance.now() when the code was handed to the worker; 0 while waiting for init. */
  startedAt: number;
  timer?: ReturnType<typeof setTimeout>;
}

const EXECUTION_TIMEOUT_MS = 6000;

class PyodideRunner {
  private worker: Worker | null = null;
  private status: RuntimeStatus = 'loading';
  private statusError: string | undefined;
  private listeners = new Set<StatusListener>();
  private requestCounter = 0;
  /** At most one execution is in flight; stop and timeout replace the worker. */
  private pending: PendingRequest | null = null;
  /** Settles once the current worker has finished (or failed) loading Pyodide. */
  private ready: Promise<void> = Promise.resolve();

  constructor() {
    this.spawnWorker();
  }

  private setStatus(status: RuntimeStatus, error?: string) {
    this.status = status;
    this.statusError = error;
    for (const listener of this.listeners) {
      listener(status, error);
    }
  }

  public subscribe(listener: StatusListener): () => void {
    this.listeners.add(listener);
    listener(this.status, this.statusError);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private spawnWorker() {
    this.worker?.terminate();
    this.setStatus('loading');

    const worker = new Worker(
      new URL('../workers/pyodideWorker.ts', import.meta.url),
      { type: 'module' }
    );
    this.worker = worker;

    let markReady: () => void = () => {};
    let markFailed: () => void = () => {};
    this.ready = new Promise<void>((resolve, reject) => {
      markReady = resolve;
      markFailed = () => reject(new Error('Python runtime failed to load.'));
    });
    // Rejection is handled via fail(); keep it from surfacing as unhandled.
    this.ready.catch(() => {});

    const fail = (message: string) => {
      markFailed();
      const req = this.pending;
      if (req) this.settle(makeErrorResult(req.mode, req.expectedOutput, message));
      this.setStatus('error', message);
    };

    worker.onmessage = (event: MessageEvent) => {
      const data = event.data;
      if (data.type === 'ready') {
        markReady();
        if (!this.pending) this.setStatus('ready');
      } else if (data.type === 'init-error') {
        fail(data.error);
      } else if (data.type === 'result' && data.requestId === this.pending?.id) {
        this.settle(data.result);
        this.setStatus('ready');
      }
    };

    worker.onerror = (err) => {
      fail(err.message || 'Python runtime worker crashed.');
    };

    worker.postMessage({ type: 'init' });
  }

  private settle(result: RunResult) {
    const req = this.pending;
    if (!req) return;
    clearTimeout(req.timer);
    this.pending = null;
    req.resolve(result);
  }

  public stopExecution(reason = 'Execution stopped by user.'): void {
    const req = this.pending;
    if (!req) return;
    const elapsed = req.startedAt ? Math.round(performance.now() - req.startedAt) : 0;
    this.settle(makeErrorResult(req.mode, req.expectedOutput, reason, elapsed));
    this.spawnWorker();
  }

  public execute(params: {
    mode: 'run' | 'submit';
    code: string;
    expectedOutput: string;
    testCases: TestCase[];
  }): Promise<RunResult> {
    if (this.pending) {
      return Promise.resolve(
        makeErrorResult(params.mode, params.expectedOutput, 'Another execution is already running.')
      );
    }
    if (!this.worker || this.status === 'error') {
      this.spawnWorker();
    }

    this.setStatus('running');

    return new Promise<RunResult>((resolve) => {
      const req: PendingRequest = {
        id: ++this.requestCounter,
        resolve,
        mode: params.mode,
        expectedOutput: params.expectedOutput,
        startedAt: 0,
      };
      this.pending = req;

      // Start the clock only once Pyodide is loaded, so startup time never
      // counts against the user's time limit.
      this.ready.then(
        () => {
          if (this.pending !== req) return; // stopped while the runtime was loading
          req.startedAt = performance.now();
          req.timer = setTimeout(() => {
            this.stopExecution(
              `Time Limit Exceeded (${EXECUTION_TIMEOUT_MS / 1000}s). Check for infinite loops and try again.`
            );
          }, EXECUTION_TIMEOUT_MS);
          this.worker!.postMessage({
            type: 'execute',
            requestId: req.id,
            mode: params.mode,
            code: params.code,
            expectedOutput: params.expectedOutput,
            testCases: params.testCases,
          });
        },
        () => {
          // Init failed: fail() has already settled this request with the error.
        }
      );
    });
  }
}

export const pyodideRunner = new PyodideRunner();
