import { providers } from './providers/index.js';

export type ProviderHealthState = 'missing_key' | 'configured' | 'healthy' | 'unhealthy';

export interface ProviderHealth {
  provider: string;
  state: ProviderHealthState;
  message: string;
  checkedAt: number | null;
  latencyMs?: number | null;
  lastStatusCode?: number | null;
  lastError?: string | null;
  lastSuccessAt?: number | null;
}

export interface HealthSummary {
  total: number;
  missing_key: number;
  configured: number;
  healthy: number;
  unhealthy: number;
  lastCheckedAt: number | null;
}

const healthStore = new Map<string, ProviderHealth>();

function getDefaultHealth(providerName: string, hasKey: boolean): ProviderHealth {
  return {
    provider: providerName,
    state: hasKey ? 'configured' : 'missing_key',
    message: hasKey ? 'Key configured, not tested yet' : 'Missing API key',
    checkedAt: null,
    latencyMs: null,
    lastStatusCode: null,
    lastError: null,
    lastSuccessAt: null,
  };
}

export function getProviderHealth(providerName: string, hasKey: boolean): ProviderHealth {
  const current = healthStore.get(providerName);
  if (!current) {
    const initial = getDefaultHealth(providerName, hasKey);
    healthStore.set(providerName, initial);
    return initial;
  }

  if (!hasKey && current.state !== 'missing_key') {
    const reset = getDefaultHealth(providerName, false);
    healthStore.set(providerName, reset);
    return reset;
  }

  if (hasKey && current.state === 'missing_key') {
    const reset = getDefaultHealth(providerName, true);
    healthStore.set(providerName, reset);
    return reset;
  }

  return current;
}

export function getAllProviderHealth(): ProviderHealth[] {
  return providers.map(provider => getProviderHealth(provider.name, provider.isAvailable));
}

export async function checkProviderHealth(providerName: string): Promise<ProviderHealth> {
  const provider = providers.find(p => p.name === providerName);
  if (!provider) {
    throw new Error(`Unknown provider: ${providerName}`);
  }

  if (!provider.isAvailable) {
    const missing = getDefaultHealth(provider.name, false);
    healthStore.set(provider.name, missing);
    return missing;
  }

  const previous = getProviderHealth(provider.name, true);
  const sampleModel = provider.models[0];
  if (!sampleModel) {
    const now = Date.now();
    const noModel: ProviderHealth = {
      provider: provider.name,
      state: 'unhealthy',
      message: 'No models configured for provider',
      checkedAt: now,
      latencyMs: null,
      lastStatusCode: null,
      lastError: 'No models configured for provider',
      lastSuccessAt: previous.lastSuccessAt ?? null,
    };
    healthStore.set(provider.name, noModel);
    return noModel;
  }

  const startedAt = Date.now();

  try {
    let response: Response;

    if (provider.name === 'cohere') {
      response = await fetch(`${provider.baseURL}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${provider.apiKey}`,
        },
        body: JSON.stringify({
          model: sampleModel.providerModelId,
          messages: [{ role: 'user', content: 'ping' }],
          max_tokens: 8,
          temperature: 0,
        }),
      });
    } else {
      response = await provider.chatCompletion({
        model: `${provider.name}/${sampleModel.id}`,
        messages: [{ role: 'user', content: 'ping' }],
        max_tokens: 8,
        temperature: 0,
        stream: false,
      });
    }

    const now = Date.now();
    const latencyMs = now - startedAt;

    if (response.ok) {
      const healthy: ProviderHealth = {
        provider: provider.name,
        state: 'healthy',
        message: 'Connectivity test passed',
        checkedAt: now,
        latencyMs,
        lastStatusCode: response.status,
        lastError: null,
        lastSuccessAt: now,
      };
      healthStore.set(provider.name, healthy);
      return healthy;
    }

    const body = await response.text().catch(() => '');
    const errorMessage = `HTTP ${response.status}${body ? `: ${body.slice(0, 120)}` : ''}`;
    const unhealthy: ProviderHealth = {
      provider: provider.name,
      state: 'unhealthy',
      message: errorMessage,
      checkedAt: now,
      latencyMs,
      lastStatusCode: response.status,
      lastError: errorMessage,
      lastSuccessAt: previous.lastSuccessAt ?? null,
    };
    healthStore.set(provider.name, unhealthy);
    return unhealthy;
  } catch (error) {
    const now = Date.now();
    const errorMessage = error instanceof Error ? error.message : String(error);
    const unhealthy: ProviderHealth = {
      provider: provider.name,
      state: 'unhealthy',
      message: errorMessage,
      checkedAt: now,
      latencyMs: now - startedAt,
      lastStatusCode: null,
      lastError: errorMessage,
      lastSuccessAt: previous.lastSuccessAt ?? null,
    };
    healthStore.set(provider.name, unhealthy);
    return unhealthy;
  }
}

export async function checkAllProvidersHealth(): Promise<ProviderHealth[]> {
  const results = await Promise.allSettled(
    providers.map((provider) => checkProviderHealth(provider.name))
  );

  return results.map((result, index): ProviderHealth => {
    const provider = providers[index]; // 
    if (result.status === "fulfilled") {
      return result.value;
    } else {
      const reason = (result as PromiseRejectedResult).reason;
      return {
        provider: provider.name, // 
        state: "unhealthy" as const,
        message: String(reason),
        checkedAt: Date.now(),
        latencyMs: 0,
        lastStatusCode: null,
        lastError: String(reason),
        lastSuccessAt: null,
      };
    }
  });
}
export function getHealthSummary(): HealthSummary {
  const items = getAllProviderHealth();
  const summary: HealthSummary = {
    total: items.length,
    missing_key: 0,
    configured: 0,
    healthy: 0,
    unhealthy: 0,
    lastCheckedAt: null,
  };

  for (const item of items) {
    summary[item.state] += 1;
    if (item.checkedAt && (!summary.lastCheckedAt || item.checkedAt > summary.lastCheckedAt)) {
      summary.lastCheckedAt = item.checkedAt;
    }
  }

  return summary;
}
