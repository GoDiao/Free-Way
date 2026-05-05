import { getProviderTimeoutMs, resolveProviderTimeoutMs } from '../config.js';

const DEFAULT_PROVIDER_OPERATION = 'provider request';

export class ProviderTimeoutError extends Error {
  readonly providerName: string;
  readonly operation: string;
  readonly timeoutMs: number;

  constructor(providerName: string, operation: string, timeoutMs: number) {
    super(`Provider "${providerName}" timed out after ${timeoutMs}ms during ${operation}`);
    this.name = 'ProviderTimeoutError';
    this.providerName = providerName;
    this.operation = operation;
    this.timeoutMs = timeoutMs;
  }
}

export interface ProviderTimeoutOptions {
  providerName: string;
  operation?: string;
  timeoutMs?: number;
  signal?: AbortSignal | null;
}

type ProviderFetchTimeoutOptions = Omit<ProviderTimeoutOptions, 'signal'>;

function linkAbortSignal(
  source: AbortSignal | null | undefined,
  controller: AbortController,
): (() => void) | undefined {
  if (!source) {
    return undefined;
  }

  if (source.aborted) {
    controller.abort(source.reason);
    return undefined;
  }

  const abort = () => controller.abort(source.reason);
  source.addEventListener('abort', abort, { once: true });

  return () => source.removeEventListener('abort', abort);
}

export async function withProviderTimeout<T>(
  options: ProviderTimeoutOptions,
  task: (signal: AbortSignal) => Promise<T>,
): Promise<T> {
  const timeoutMs = options.timeoutMs === undefined
    ? getProviderTimeoutMs()
    : resolveProviderTimeoutMs(options.timeoutMs);
  const operation = options.operation ?? DEFAULT_PROVIDER_OPERATION;
  const controller = new AbortController();
  const timeoutError = new ProviderTimeoutError(options.providerName, operation, timeoutMs);
  let timedOut = false;

  const unlinkAbortSignal = linkAbortSignal(options.signal, controller);
  const timeoutId = setTimeout(() => {
    timedOut = true;
    controller.abort(timeoutError);
  }, timeoutMs);

  try {
    return await task(controller.signal);
  } catch (error) {
    if (timedOut) {
      throw timeoutError;
    }

    throw error;
  } finally {
    clearTimeout(timeoutId);
    unlinkAbortSignal?.();
  }
}

export function fetchWithProviderTimeout(
  options: ProviderFetchTimeoutOptions,
  input: RequestInfo | URL,
  init: RequestInit = {},
): Promise<Response> {
  const { signal, ...fetchInit } = init;

  return withProviderTimeout(
    { ...options, signal },
    (timeoutSignal) => fetch(input, { ...fetchInit, signal: timeoutSignal }),
  );
}
