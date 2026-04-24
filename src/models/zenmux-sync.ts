import type { ProviderModel } from '../types.js';

interface ZenMuxModelEntry {
  id: string;
  object: string;
  display_name?: string;
  created?: number;
  owned_by?: string;
  context_length?: number;
  pricings?: {
    prompt?: Array<{ value: number; unit: string; currency: string; conditions?: unknown }>;
    [key: string]: unknown;
  };
}

interface ZenMuxModelsResponse {
  data: ZenMuxModelEntry[];
  object: string;
}

export async function fetchZenMuxModels(apiKey: string): Promise<ZenMuxModelEntry[]> {
  const response = await fetch('https://zenmux.ai/api/v1/models', {
    headers: { Authorization: `Bearer ${apiKey}` },
  });
  if (!response.ok) {
    throw new Error(`Models fetch failed: ${response.status}`);
  }
  const payload = (await response.json()) as ZenMuxModelsResponse;
  return payload.data ?? [];
}

export function isZenMuxFreeModel(model: ZenMuxModelEntry): boolean {
  const promptPricing = model.pricings?.prompt;
  if (!Array.isArray(promptPricing) || promptPricing.length === 0) {
    return false;
  }
  return promptPricing.every((p) => p.value === 0);
}

export function mergeZenMuxWithAllowlist(
  fetched: ZenMuxModelEntry[],
  allowlist: ProviderModel[]
): ProviderModel[] {
  const fetchedMap = new Map(fetched.map((m) => [m.id, m]));
  const result: ProviderModel[] = [];

  for (const allowed of allowlist) {
    const found = fetchedMap.get(allowed.providerModelId);
    if (found && isZenMuxFreeModel(found)) {
      result.push({
        ...allowed,
        providerModelId: found.id,
        context: found.context_length ?? allowed.context,
      });
    }
  }

  return result;
}
