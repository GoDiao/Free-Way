import type { ChatCompletionRequest, ProviderModel } from '../types.js';
import { getEffectiveApiKey } from '../config.js';
import { fetchWithProviderTimeout } from './timeout.js';

export interface ProviderConfig {
  name: string;
  baseURL: string;
  apiKeyEnvVar: string;
  models: ProviderModel[];
  headers?: Record<string, string>;
  website?: string;
}

export abstract class BaseProvider {
  readonly name: string;
  readonly baseURL: string;
  models: ProviderModel[];
  readonly apiKeyEnvVar: string;
  readonly customHeaders: Record<string, string>;
  readonly website?: string;

  constructor(config: ProviderConfig) {
    this.name = config.name;
    this.baseURL = config.baseURL;
    this.models = config.models;
    this.apiKeyEnvVar = config.apiKeyEnvVar;
    this.customHeaders = config.headers ?? {};
    this.website = config.website;
  }

  updateModels(models: ProviderModel[]): void {
    this.models = models;
  }

  get apiKey(): string | undefined {
    return getEffectiveApiKey(this.apiKeyEnvVar);
  }

  get isAvailable(): boolean {
    return !!this.apiKey;
  }

  supportsModel(modelId: string): ProviderModel | undefined {
    const bareModelId = modelId.startsWith(`${this.name}/`) ? modelId.slice(this.name.length + 1) : modelId;
    return this.models.find(m => m.id === bareModelId);
  }

  resolveModelId(modelId: string): string {
    const bareModelId = modelId.startsWith(`${this.name}/`) ? modelId.slice(this.name.length + 1) : modelId;
    const model = this.supportsModel(bareModelId);
    return model?.providerModelId ?? bareModelId;
  }

  async chatCompletion(request: ChatCompletionRequest): Promise<Response> {
    const url = `${this.baseURL}/chat/completions`;
    const body = this.transformRequest(request);

    const response = await fetchWithProviderTimeout(
      { providerName: this.name, operation: 'chat completion' },
      url,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiKey}`,
          ...this.customHeaders,
        },
        body: JSON.stringify(body),
      },
    );

    return response;
  }

  protected transformRequest(request: ChatCompletionRequest): ChatCompletionRequest {
    return {
      ...request,
      model: this.resolveModelId(request.model),
    };
  }

  listModels(): ProviderModel[] {
    return this.models;
  }
}
