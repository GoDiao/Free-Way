import { getPersistedConfigPath, loadPersistedConfig, savePersistedConfig } from './config-store.js';

const runtimeApiKeys = new Map<string, string>();
const persistedApiKeys = new Map<string, string>();

export const DEFAULT_PROVIDER_TIMEOUT_MS = 30_000;

const MAX_PROVIDER_TIMEOUT_MS = 2_147_483_647;

let configMeta: { persistedPath: string | null; persistedUpdatedAt: number | null } = {
  persistedPath: null,
  persistedUpdatedAt: null,
};

export function resolveProviderTimeoutMs(value: string | number | undefined): number {
  const raw = typeof value === 'string' ? value.trim() : value;
  if (raw === undefined || raw === '') {
    return DEFAULT_PROVIDER_TIMEOUT_MS;
  }

  const timeoutMs = typeof raw === 'number' ? raw : Number(raw);
  if (!Number.isSafeInteger(timeoutMs) || timeoutMs <= 0 || timeoutMs > MAX_PROVIDER_TIMEOUT_MS) {
    return DEFAULT_PROVIDER_TIMEOUT_MS;
  }

  return timeoutMs;
}

export function getProviderTimeoutMs(): number {
  return resolveProviderTimeoutMs(process.env.FREEWAY_PROVIDER_TIMEOUT_MS);
}

export function setRuntimeApiKey(envVar: string, value: string) {
  const trimmed = value.trim();
  if (trimmed) {
    runtimeApiKeys.set(envVar, trimmed);
  } else {
    runtimeApiKeys.delete(envVar);
  }
}

export function getRuntimeApiKey(envVar: string): string | undefined {
  return runtimeApiKeys.get(envVar);
}

export function getEffectiveApiKey(envVar: string): string | undefined {
  return getRuntimeApiKey(envVar) ?? process.env[envVar] ?? persistedApiKeys.get(envVar);
}

export function hasConfiguredApiKey(envVar: string): boolean {
  return !!getEffectiveApiKey(envVar);
}

export function exportConfigurableApiKeys(allowedEnvVars: Set<string>): Record<string, string> {
  const keys: Record<string, string> = {};

  for (const envVar of allowedEnvVars) {
    const persisted = persistedApiKeys.get(envVar);
    if (persisted) keys[envVar] = persisted;
  }

  for (const envVar of allowedEnvVars) {
    const runtime = runtimeApiKeys.get(envVar);
    if (runtime) {
      keys[envVar] = runtime;
    }
  }

  return keys;
}

export async function initializePersistedApiKeys(allowedEnvVars: Set<string>): Promise<void> {
  const persisted = await loadPersistedConfig(allowedEnvVars);
  persistedApiKeys.clear();
  if (!persisted) {
    configMeta = { persistedPath: null, persistedUpdatedAt: null };
    return;
  }

  for (const [envVar, value] of Object.entries(persisted.keys)) {
    persistedApiKeys.set(envVar, value);
  }

  configMeta = {
    persistedPath: getPersistedConfigPath(),
    persistedUpdatedAt: persisted.updatedAt,
  };
}

export async function persistRuntimeApiKeys(allowedEnvVars: Set<string>): Promise<void> {
  const keys = exportConfigurableApiKeys(allowedEnvVars);
  const result = await savePersistedConfig(keys, allowedEnvVars);

  persistedApiKeys.clear();
  for (const [envVar, value] of Object.entries(keys)) {
    persistedApiKeys.set(envVar, value);
  }

  configMeta = {
    persistedPath: result.path,
    persistedUpdatedAt: result.updatedAt,
  };
}

export function getConfigMeta(): { persistedPath: string | null; persistedUpdatedAt: number | null } {
  return configMeta;
}

/* ── Gateway API Key ── */

let freewayApiKey: string | undefined = process.env.FREEWAY_API_KEY;

export function getFreewayApiKey(): string | undefined {
  return freewayApiKey;
}

export function setFreewayApiKey(value: string): void {
  const trimmed = value.trim();
  freewayApiKey = trimmed || undefined;
}
