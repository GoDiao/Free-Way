import { BaseProvider, type ProviderConfig } from './base.js';
import { CohereProvider } from './cohere.js';

class GenericProvider extends BaseProvider {}

function p(config: ProviderConfig): BaseProvider {
  return new GenericProvider(config);
}

export const providers: BaseProvider[] = [
  p({
    name: 'openrouter',
    baseURL: 'https://openrouter.ai/api/v1',
    apiKeyEnvVar: 'OPENROUTER_API_KEY',
    website: 'https://openrouter.ai',
    models: [
      { id: 'deepseek-r1', providerModelId: 'deepseek/deepseek-r1-0528:free', context: 163000, maxOutput: 163000, modality: 'Text' },
      { id: 'deepseek-chat', providerModelId: 'deepseek/deepseek-chat-v3-0324:free', context: 163000, maxOutput: 163000, modality: 'Text' },
      { id: 'qwen3.6-plus', providerModelId: 'qwen/qwen3.6-plus:free', context: 1000000, maxOutput: 65000, modality: 'Text' },
      { id: 'llama-4-scout', providerModelId: 'meta-llama/llama-4-scout:free', context: 10000000, maxOutput: 16000, modality: 'Multimodal' },
      { id: 'llama-4-maverick', providerModelId: 'meta-llama/llama-4-maverick:free', context: 1000000, maxOutput: 16000, modality: 'Multimodal' },
      { id: 'llama-3.3-70b', providerModelId: 'meta-llama/llama-3.3-70b-instruct:free', context: 65000, maxOutput: 16000, modality: 'Text' },
      { id: 'gemma-4-31b', providerModelId: 'google/gemma-4-31b-it:free', context: 256000, maxOutput: 8000, modality: 'Multimodal' },
      { id: 'nemotron-3-super', providerModelId: 'nvidia/nemotron-3-super-120b-a12b:free', context: 1000000, maxOutput: 32000, modality: 'Text' },
      { id: 'gpt-oss-120b', providerModelId: 'openai/gpt-oss-120b:free', context: 131000, maxOutput: 131000, modality: 'Text' },
      { id: 'minimax-m2.5', providerModelId: 'minimax/minimax-m2.5:free', context: 196000, maxOutput: 8000, modality: 'Text' },
      { id: 'devstral', providerModelId: 'mistralai/devstral-2512:free', context: 256000, maxOutput: 32000, modality: 'Text' },
    ],
  }),
  p({
    name: 'groq',
    baseURL: 'https://api.groq.com/openai/v1',
    apiKeyEnvVar: 'GROQ_API_KEY',
    website: 'https://console.groq.com',
    models: [
      { id: 'llama-3.3-70b', providerModelId: 'llama-3.3-70b-versatile', context: 131000, maxOutput: 32000, modality: 'Text' },
      { id: 'llama-3.1-8b', providerModelId: 'llama-3.1-8b-instant', context: 131000, maxOutput: 131000, modality: 'Text' },
      { id: 'llama-4-scout', providerModelId: 'llama-4-scout-17b-16e-instruct', context: 131000, maxOutput: 8000, modality: 'Text + Vision' },
      { id: 'llama-4-maverick', providerModelId: 'llama-4-maverick-17b-128e-instruct', context: 131000, maxOutput: 8000, modality: 'Text + Vision' },
      { id: 'qwen3-32b', providerModelId: 'qwen3-32b', context: 131000, maxOutput: 131000, modality: 'Text' },
      { id: 'gpt-oss-120b', providerModelId: 'gpt-oss-120b', context: 131000, maxOutput: 32000, modality: 'Text' },
      { id: 'kimi-k2', providerModelId: 'kimi-k2-instruct', context: 262000, maxOutput: 262000, modality: 'Text' },
      { id: 'deepseek-r1-distill-70b', providerModelId: 'deepseek-r1-distill-70b', context: 131000, maxOutput: 8000, modality: 'Text' },
      { id: 'whisper-large', providerModelId: 'whisper-large-v3', modality: 'Audio → Text' },
      { id: 'whisper-large-turbo', providerModelId: 'whisper-large-v3-turbo', modality: 'Audio → Text' },
    ],
  }),
  p({
    name: 'github',
    baseURL: 'https://models.inference.ai.azure.com',
    apiKeyEnvVar: 'GITHUB_TOKEN',
    website: 'https://github.com/marketplace/models',
    models: [
      { id: 'gpt-4o', providerModelId: 'gpt-4o', context: 128000, maxOutput: 16000, modality: 'Text + Vision' },
      { id: 'gpt-4o-mini', providerModelId: 'gpt-4o-mini', context: 128000, maxOutput: 16000, modality: 'Text + Vision' },
      { id: 'o1', providerModelId: 'o1', context: 200000, maxOutput: 100000, modality: 'Text' },
      { id: 'o1-mini', providerModelId: 'o1-mini', context: 128000, maxOutput: 65000, modality: 'Text' },
      { id: 'o3-mini', providerModelId: 'o3-mini', context: 200000, maxOutput: 100000, modality: 'Text' },
      { id: 'llama-3.3-70b', providerModelId: 'Meta-Llama-3.3-70B-Instruct', context: 128000, maxOutput: 4000, modality: 'Text' },
      { id: 'llama-3.1-405b', providerModelId: 'Meta-Llama-3.1-405B-Instruct', context: 128000, maxOutput: 4000, modality: 'Text' },
      { id: 'deepseek-r1', providerModelId: 'DeepSeek-R1', context: 64000, maxOutput: 8000, modality: 'Text' },
      { id: 'deepseek-v3', providerModelId: 'DeepSeek-V3-0324', context: 64000, maxOutput: 8000, modality: 'Text' },
      { id: 'phi-4', providerModelId: 'Phi-4', context: 16000, maxOutput: 4000, modality: 'Text' },
    ],
  }),
  p({
    name: 'cloudflare',
    baseURL: 'https://api.cloudflare.com/client/v4/accounts',
    apiKeyEnvVar: 'CLOUDFLARE_API_KEY',
    website: 'https://ai.cloudflare.com',
    models: [
      { id: 'llama-3.3-70b', providerModelId: '@cf/meta/llama-3.3-70b-instruct-fp8', context: 128000, maxOutput: 4000, modality: 'Text' },
      { id: 'llama-4-scout', providerModelId: '@cf/meta/llama-4-scout-instruct', context: 128000, maxOutput: 4000, modality: 'Text' },
      { id: 'llama-3.1-8b', providerModelId: '@cf/meta/llama-3.1-8b-instruct-fp8', context: 128000, maxOutput: 4000, modality: 'Text' },
      { id: 'qwen3-30b', providerModelId: '@cf/qwen/qwen3-30b-a3b-fp8', context: 32000, maxOutput: 4000, modality: 'Text' },
      { id: 'gemma-3-12b', providerModelId: '@cf/google/gemma-3-12b-instruct', context: 8000, maxOutput: 4000, modality: 'Text' },
      { id: 'mistral-small-3.1', providerModelId: '@cf/mistral/mistral-small-3.1-24b-instruct', context: 128000, maxOutput: 4000, modality: 'Text' },
      { id: 'gpt-oss-120b', providerModelId: '@cf/openai/gpt-oss-120b', context: 128000, maxOutput: 8000, modality: 'Text' },
      { id: 'deepseek-r1-distill-qwen-32b', providerModelId: '@cf/deepseek-ai/deepseek-r1-distill-qwen-32b', context: 64000, maxOutput: 8000, modality: 'Text' },
    ],
  }),
  p({
    name: 'siliconflow',
    baseURL: 'https://api.siliconflow.cn/v1',
    apiKeyEnvVar: 'SILICONFLOW_API_KEY',
    website: 'https://siliconflow.cn',
    models: [
      { id: 'qwen3-8b', providerModelId: 'Qwen/Qwen3-8B', context: 131000, maxOutput: 131000, modality: 'Text' },
      { id: 'deepseek-r1-qwen3-8b', providerModelId: 'deepseek-ai/DeepSeek-R1-0528-Qwen3-8B', context: 33000, maxOutput: 16000, modality: 'Text' },
      { id: 'deepseek-r1-distill-qwen-7b', providerModelId: 'deepseek-ai/DeepSeek-R1-Distill-Qwen-7B', context: 131000, modality: 'Text' },
      { id: 'glm-4-9b', providerModelId: 'THUDM/glm-4-9b-chat', context: 32000, maxOutput: 32000, modality: 'Text' },
      { id: 'glm-4.1v-9b', providerModelId: 'THUDM/GLM-4.1V-9B-Thinking', context: 66000, maxOutput: 66000, modality: 'Vision + Text' },
      { id: 'deepseek-ocr', providerModelId: 'deepseek-ai/DeepSeek-OCR', maxOutput: 8000, modality: 'Vision (OCR)' },
    ],
  }),
  p({
    name: 'cerebras',
    baseURL: 'https://api.cerebras.ai/v1',
    apiKeyEnvVar: 'CEREBRAS_API_KEY',
    website: 'https://cloud.cerebras.ai',
    models: [
      { id: 'llama-3.1-8b', providerModelId: 'llama3.1-8b', context: 128000, maxOutput: 8000, modality: 'Text' },
      { id: 'gpt-oss-120b', providerModelId: 'gpt-oss-120b', context: 128000, maxOutput: 8000, modality: 'Text' },
      { id: 'qwen-3-235b', providerModelId: 'qwen-3-235b-a22b-instruct-2507', context: 131000, maxOutput: 8000, modality: 'Text' },
      { id: 'zai-glm-4.7', providerModelId: 'zai-glm-4.7', context: 128000, maxOutput: 8000, modality: 'Text' },
    ],
  }),
  p({
    name: 'mistral',
    baseURL: 'https://api.mistral.ai/v1',
    apiKeyEnvVar: 'MISTRAL_API_KEY',
    website: 'https://console.mistral.ai',
    models: [
      { id: 'mistral-small-4', providerModelId: 'mistral-small-4', context: 256000, maxOutput: 256000, modality: 'Text + Image + Code' },
      { id: 'mistral-medium-3', providerModelId: 'mistral-medium-3', context: 128000, maxOutput: 128000, modality: 'Text' },
      { id: 'mistral-large-3', providerModelId: 'mistral-large-3', context: 256000, maxOutput: 256000, modality: 'Text' },
      { id: 'mistral-nemo', providerModelId: 'mistral-nemo', context: 128000, maxOutput: 128000, modality: 'Text' },
      { id: 'codestral', providerModelId: 'codestral', context: 256000, maxOutput: 256000, modality: 'Code' },
      { id: 'pixtral-large', providerModelId: 'pixtral-large', context: 128000, maxOutput: 128000, modality: 'Text + Image' },
    ],
  }),
  new CohereProvider({
    name: 'cohere',
    baseURL: 'https://api.cohere.com/v2',
    apiKeyEnvVar: 'COHERE_API_KEY',
    website: 'https://dashboard.cohere.com',
    models: [
      { id: 'command-a', providerModelId: 'command-a', context: 256000, maxOutput: 4000, modality: 'Text' },
      { id: 'command-r-plus', providerModelId: 'command-r-plus', context: 128000, maxOutput: 4000, modality: 'Text' },
      { id: 'command-r', providerModelId: 'command-r', context: 128000, maxOutput: 4000, modality: 'Text' },
      { id: 'command-r7b', providerModelId: 'command-r7b', context: 128000, maxOutput: 4000, modality: 'Text' },
    ],
  }),
  p({
    name: 'nvidia',
    baseURL: 'https://integrate.api.nvidia.com/v1',
    apiKeyEnvVar: 'NVIDIA_API_KEY',
    website: 'https://build.nvidia.com',
    models: [
      { id: 'deepseek-r1', providerModelId: 'deepseek-ai/deepseek-r1', context: 128000, maxOutput: 163000, modality: 'Text' },
      { id: 'llama-3.1-nemotron-ultra', providerModelId: 'nvidia/llama-3.1-nemotron-ultra-253b-v1', context: 128000, maxOutput: 4000, modality: 'Text' },
      { id: 'nemotron-3-super', providerModelId: 'nvidia/nemotron-3-super-120b-a12b', context: 262000, maxOutput: 262000, modality: 'Text' },
      { id: 'llama-3.1-405b', providerModelId: 'meta/llama-3.1-405b-instruct', context: 128000, maxOutput: 4000, modality: 'Text' },
      { id: 'qwen2.5-72b', providerModelId: 'qwen/qwen2.5-72b-instruct', context: 128000, maxOutput: 8000, modality: 'Text' },
      { id: 'gemma-4-31b', providerModelId: 'google/gemma-4-31b', context: 128000, maxOutput: 8000, modality: 'Text' },
    ],
  }),
  p({
    name: 'llm7',
    baseURL: 'https://api.llm7.io/v1',
    apiKeyEnvVar: 'LLM7_API_KEY',
    website: 'https://llm7.io',
    models: [
      { id: 'deepseek-r1', providerModelId: 'deepseek-r1-0528', modality: 'Text' },
      { id: 'deepseek-chat', providerModelId: 'deepseek-v3-0324', modality: 'Text' },
      { id: 'gemini-2.5-flash-lite', providerModelId: 'gemini-2.5-flash-lite', modality: 'Text + Vision' },
      { id: 'gpt-4o-mini', providerModelId: 'gpt-4o-mini', modality: 'Text + Vision' },
      { id: 'mistral-small-3.1', providerModelId: 'mistral-small-3.1-24b', context: 32000, modality: 'Text' },
      { id: 'qwen2.5-coder-32b', providerModelId: 'qwen2.5-coder-32b', modality: 'Text' },
    ],
  }),
  p({
    name: 'kilo',
    baseURL: 'https://api.kilo.ai/api/gateway',
    apiKeyEnvVar: 'KILO_API_KEY',
    website: 'https://kilo.ai',
    models: [
      { id: 'kilo-auto-free', providerModelId: 'kilo-auto/free', modality: 'Text' },
      { id: 'dola-seed-2-pro', providerModelId: 'bytedance-seed/dola-seed-2.0-pro:free', modality: 'Text' },
      { id: 'grok-code-fast', providerModelId: 'x-ai/grok-code-fast-1:optimized:free', modality: 'Text' },
      { id: 'nemotron-3-super', providerModelId: 'nvidia/nemotron-3-super-120b-a12b:free', modality: 'Text' },
      { id: 'trinity-large-thinking', providerModelId: 'arcee-ai/trinity-large-thinking:free', modality: 'Text' },
    ],
  }),
  p({
    name: 'zhipu',
    baseURL: 'https://open.bigmodel.cn/api/paas/v4',
    apiKeyEnvVar: 'ZHIPU_API_KEY',
    website: 'https://open.bigmodel.cn',
    models: [
      { id: 'glm-4.7-flash', providerModelId: 'glm-4.7-flash', context: 200000, maxOutput: 128000, modality: 'Text' },
      { id: 'glm-4.5-flash', providerModelId: 'glm-4.5-flash', context: 128000, maxOutput: 8000, modality: 'Text' },
      { id: 'glm-4.6v-flash', providerModelId: 'glm-4.6v-flash', context: 128000, maxOutput: 4000, modality: 'Text + Image' },
    ],
  }),
  p({
    name: 'opencode',
    baseURL: 'https://opencode.ai/zen/v1',
    apiKeyEnvVar: 'OPENCODE_API_KEY',
    website: 'https://opencode.ai',
    models: [
      { id: 'minimax-m2.5-free', providerModelId: 'minimax-m2.5-free', modality: 'Text' },
      { id: 'ling-2.6-flash-free', providerModelId: 'ling-2.6-flash-free', modality: 'Text' },
      { id: 'trinity-large-preview-free', providerModelId: 'trinity-large-preview-free', modality: 'Text' },
      { id: 'nemotron-3-super-free', providerModelId: 'nemotron-3-super-free', modality: 'Text' },
    ],
  }),
  p({
    name: 'zenmux',
    baseURL: 'https://zenmux.ai/api/v1',
    apiKeyEnvVar: 'ZENMUX_API_KEY',
    website: 'https://zenmux.ai',
    models: [
      { id: 'deepseek-v4-flash-free', providerModelId: 'deepseek/deepseek-v4-flash-free', context: 1000000, modality: 'Text' },
      { id: 'deepseek-v4-pro-free', providerModelId: 'deepseek/deepseek-v4-pro-free', context: 1000000, modality: 'Text' },
      { id: 'glm-4.7-flash-free', providerModelId: 'z-ai/glm-4.7-flash-free', context: 200000, modality: 'Text' },
      { id: 'glm-4.6v-flash-free', providerModelId: 'z-ai/glm-4.6v-flash-free', context: 200000, modality: 'Text + Image' },
    ],
  }),
];

export function getAvailableProviders(): BaseProvider[] {
  return providers.filter(p => p.isAvailable);
}

export function findProvidersForModel(modelId: string): BaseProvider[] {
  const available = getAvailableProviders();

  // Explicit provider prefix: "provider/model"
  const slashIdx = modelId.indexOf('/');
  if (slashIdx > 0) {
    const prefix = modelId.slice(0, slashIdx);
    const bareModel = modelId.slice(slashIdx + 1);
    const provider = available.find(p => p.name === prefix);
    if (provider && provider.supportsModel(bareModel)) {
      return [provider];
    }
    return [];
  }

  return available.filter(p => p.supportsModel(modelId));
}

export function listAllModels(): { id: string; provider: string }[] {
  const result: { id: string; provider: string }[] = [];
  for (const p of getAvailableProviders()) {
    for (const m of p.listModels()) {
      result.push({ id: `${p.name}/${m.id}`, provider: p.name });
    }
  }
  return result;
}

/* ── Dynamic model sync for all providers ── */

import { fetchOpenRouterModels, loadOpenRouterCache, saveOpenRouterCache } from '../models/openrouter-sync.js';
import { fetchOpenAIModels, loadProviderModelCache, mergeWithAllowlist, saveProviderModelCache } from '../models/sync.js';
import { fetchCohereModels, mergeCohereWithAllowlist } from '../models/cohere-sync.js';
import { fetchGitHubModels, loadGitHubCache, mergeGitHubWithAllowlist, saveGitHubCache } from '../models/github-sync.js';
import { fetchCloudflareModels, loadCloudflareCache, mergeCloudflareWithAllowlist, saveCloudflareCache } from '../models/cloudflare-sync.js';
import { fetchOpenCodeModels, loadOpenCodeCache, saveOpenCodeCache } from '../models/opencode-sync.js';
import { fetchZenMuxModels, mergeZenMuxWithAllowlist } from '../models/zenmux-sync.js';

const syncMeta = new Map<string, { updatedAt: number; source: string }>();

type ProviderSyncStatus = 'refreshed' | 'skipped';

export interface RefreshAllProviderModelsResult {
  refreshed: string[];
  failed: string[];
  skipped: string[];
}

export function getProviderSyncMeta(providerName: string): { updatedAt: number; source: string } | undefined {
  return syncMeta.get(providerName);
}

export function getAllSyncMetas(): Map<string, { updatedAt: number; source: string }> {
  return new Map(syncMeta);
}

async function syncProviderModels(provider: BaseProvider): Promise<ProviderSyncStatus> {
  const apiKey = provider.apiKey;
  if (!apiKey) return 'skipped';

  if (provider.name === 'openrouter') {
    try {
      const models = await fetchOpenRouterModels(apiKey);
      provider.updateModels(models);
      syncMeta.set(provider.name, { updatedAt: Date.now(), source: 'api' });
      await saveOpenRouterCache(models);
      console.log(`[${provider.name}] Synced ${models.length} free models`);
    } catch (err) {
      console.warn(`[${provider.name}] API sync failed:`, err instanceof Error ? err.message : String(err));
      const cached = await loadOpenRouterCache();
      if (cached) {
        provider.updateModels(cached.models);
        syncMeta.set(provider.name, { updatedAt: cached.updatedAt, source: 'cache' });
        console.log(`[${provider.name}] Fell back to cached ${cached.models.length} models`);
      }
    }
    return 'refreshed';
  }

  if (provider.name === 'cohere') {
    try {
      const fetched = await fetchCohereModels(apiKey);
      const merged = mergeCohereWithAllowlist(fetched, provider.models);
      if (merged.length > 0) {
        provider.updateModels(merged);
        syncMeta.set(provider.name, { updatedAt: Date.now(), source: 'api' });
        await saveProviderModelCache(provider.name, merged);
        console.log(`[${provider.name}] Synced ${merged.length} models`);
      } else {
        console.warn(`[${provider.name}] API returned no matching models from allowlist`);
      }
    } catch (err) {
      console.warn(`[${provider.name}] API sync failed:`, err instanceof Error ? err.message : String(err));
      const cached = await loadProviderModelCache(provider.name);
      if (cached) {
        provider.updateModels(cached.models);
        syncMeta.set(provider.name, { updatedAt: cached.updatedAt, source: 'cache' });
        console.log(`[${provider.name}] Fell back to cached ${cached.models.length} models`);
      }
    }
    return 'refreshed';
  }

  if (provider.name === 'github') {
    try {
      const fetched = await fetchGitHubModels(apiKey);
      const merged = mergeGitHubWithAllowlist(fetched, provider.models);
      if (merged.length > 0) {
        provider.updateModels(merged);
        syncMeta.set(provider.name, { updatedAt: Date.now(), source: 'api' });
        await saveGitHubCache(merged);
        console.log(`[${provider.name}] Synced ${merged.length} models`);
      } else {
        console.warn(`[${provider.name}] API returned no matching models from allowlist`);
      }
    } catch (err) {
      console.warn(`[${provider.name}] API sync failed:`, err instanceof Error ? err.message : String(err));
      const cached = await loadGitHubCache();
      if (cached) {
        provider.updateModels(cached.models);
        syncMeta.set(provider.name, { updatedAt: cached.updatedAt, source: 'cache' });
        console.log(`[${provider.name}] Fell back to cached ${cached.models.length} models`);
      }
    }
    return 'refreshed';
  }

  if (provider.name === 'cloudflare') {
    const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
    if (!accountId) {
      console.warn(`[${provider.name}] Missing CLOUDFLARE_ACCOUNT_ID environment variable`);
      return 'skipped';
    }
    try {
      const fetched = await fetchCloudflareModels(apiKey, accountId);
      const merged = mergeCloudflareWithAllowlist(fetched, provider.models);
      if (merged.length > 0) {
        provider.updateModels(merged);
        syncMeta.set(provider.name, { updatedAt: Date.now(), source: 'api' });
        await saveCloudflareCache(merged);
        console.log(`[${provider.name}] Synced ${merged.length} models`);
      } else {
        console.warn(`[${provider.name}] API returned no matching models from allowlist`);
      }
    } catch (err) {
      console.warn(`[${provider.name}] API sync failed:`, err instanceof Error ? err.message : String(err));
      const cached = await loadCloudflareCache();
      if (cached) {
        provider.updateModels(cached.models);
        syncMeta.set(provider.name, { updatedAt: cached.updatedAt, source: 'cache' });
        console.log(`[${provider.name}] Fell back to cached ${cached.models.length} models`);
      }
    }
    return 'refreshed';
  }

  if (provider.name === 'opencode') {
    try {
      const fetched = await fetchOpenCodeModels();
      provider.updateModels(fetched);
      syncMeta.set(provider.name, { updatedAt: Date.now(), source: 'api' });
      await saveOpenCodeCache(fetched);
      console.log(`[${provider.name}] Synced ${fetched.length} free models`);
    } catch (err) {
      console.warn(`[${provider.name}] API sync failed:`, err instanceof Error ? err.message : String(err));
      const cached = await loadOpenCodeCache();
      if (cached) {
        provider.updateModels(cached.models);
        syncMeta.set(provider.name, { updatedAt: cached.updatedAt, source: 'cache' });
        console.log(`[${provider.name}] Fell back to cached ${cached.models.length} models`);
      }
    }
    return 'refreshed';
  }

  if (provider.name === 'zenmux') {
    try {
      const fetched = await fetchZenMuxModels(apiKey);
      const merged = mergeZenMuxWithAllowlist(fetched, provider.models);
      if (merged.length > 0) {
        provider.updateModels(merged);
        syncMeta.set(provider.name, { updatedAt: Date.now(), source: 'api' });
        await saveProviderModelCache(provider.name, merged);
        console.log(`[${provider.name}] Synced ${merged.length} free models`);
      } else {
        console.warn(`[${provider.name}] API returned no free models from allowlist`);
      }
    } catch (err) {
      console.warn(`[${provider.name}] API sync failed:`, err instanceof Error ? err.message : String(err));
      const cached = await loadProviderModelCache(provider.name);
      if (cached) {
        provider.updateModels(cached.models);
        syncMeta.set(provider.name, { updatedAt: cached.updatedAt, source: 'cache' });
        console.log(`[${provider.name}] Fell back to cached ${cached.models.length} models`);
      }
    }
    return 'refreshed';
  }

  // Generic OpenAI-compatible provider
  try {
    const fetched = await fetchOpenAIModels(provider.baseURL, apiKey);
    const merged = mergeWithAllowlist(fetched, provider.models);
    if (merged.length > 0) {
      provider.updateModels(merged);
      syncMeta.set(provider.name, { updatedAt: Date.now(), source: 'api' });
      await saveProviderModelCache(provider.name, merged);
      console.log(`[${provider.name}] Synced ${merged.length} models`);
    } else {
      console.warn(`[${provider.name}] API returned no matching models from allowlist`);
    }
  } catch (err) {
    console.warn(`[${provider.name}] API sync failed:`, err instanceof Error ? err.message : String(err));
    const cached = await loadProviderModelCache(provider.name);
    if (cached) {
      provider.updateModels(cached.models);
      syncMeta.set(provider.name, { updatedAt: cached.updatedAt, source: 'cache' });
      console.log(`[${provider.name}] Fell back to cached ${cached.models.length} models`);
    }
  }
  return 'refreshed';
}

export async function loadAllModelCaches(): Promise<void> {
  for (const provider of providers) {
    if (provider.name === 'openrouter') {
      const cached = await loadOpenRouterCache();
      if (cached) {
        provider.updateModels(cached.models);
        syncMeta.set(provider.name, { updatedAt: cached.updatedAt, source: 'cache' });
      }
      continue;
    }
    if (provider.name === 'github') {
      const cached = await loadGitHubCache();
      if (cached) {
        provider.updateModels(cached.models);
        syncMeta.set(provider.name, { updatedAt: cached.updatedAt, source: 'cache' });
      }
      continue;
    }
    if (provider.name === 'cloudflare') {
      const cached = await loadCloudflareCache();
      if (cached) {
        provider.updateModels(cached.models);
        syncMeta.set(provider.name, { updatedAt: cached.updatedAt, source: 'cache' });
      }
      continue;
    }
    if (provider.name === 'opencode') {
      const cached = await loadOpenCodeCache();
      if (cached) {
        provider.updateModels(cached.models);
        syncMeta.set(provider.name, { updatedAt: cached.updatedAt, source: 'cache' });
      }
      continue;
    }
    if (provider.name === 'zenmux') {
      const cached = await loadProviderModelCache(provider.name);
      if (cached) {
        provider.updateModels(cached.models);
        syncMeta.set(provider.name, { updatedAt: cached.updatedAt, source: 'cache' });
      }
      continue;
    }
    const cached = await loadProviderModelCache(provider.name);
    if (cached) {
      provider.updateModels(cached.models);
      syncMeta.set(provider.name, { updatedAt: cached.updatedAt, source: 'cache' });
    }
  }
}

export async function refreshAllProviderModels(): Promise<RefreshAllProviderModelsResult> {
  const refreshed: string[] = [];
  const failed: string[] = [];
  const skipped: string[] = [];

  for (const provider of providers) {
    try {
      const status = await syncProviderModels(provider);
      if (status === 'skipped') {
        skipped.push(provider.name);
      } else {
        refreshed.push(provider.name);
      }
    } catch {
      failed.push(provider.name);
    }
  }

  return { refreshed, failed, skipped };
}
