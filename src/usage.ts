export interface NormalizedUsage {
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
  estimated: boolean;
}

export interface UsageEstimationInput {
  promptText: string;
  completionText: string;
}

export interface AnthropicCountTokenInput {
  messages?: unknown;
  system?: unknown;
  tools?: unknown;
}

function estimateTokens(text: string): number {
  const trimmed = text.trim();
  if (!trimmed) return 0;
  return Math.max(1, Math.ceil(trimmed.length / 4));
}

export function estimateUsage(input: UsageEstimationInput): NormalizedUsage {
  const prompt_tokens = estimateTokens(input.promptText);
  const completion_tokens = estimateTokens(input.completionText);

  return {
    prompt_tokens,
    completion_tokens,
    total_tokens: prompt_tokens + completion_tokens,
    estimated: true,
  };
}

export function normalizeOpenAIUsage(value: unknown): NormalizedUsage | null {
  if (!value || typeof value !== 'object') return null;

  const usage = value as Record<string, unknown>;
  const prompt_tokens = Number(usage.prompt_tokens ?? 0);
  const completion_tokens = Number(usage.completion_tokens ?? 0);
  const total_tokens = Number(usage.total_tokens ?? prompt_tokens + completion_tokens);

  if (!Number.isFinite(prompt_tokens) || !Number.isFinite(completion_tokens) || !Number.isFinite(total_tokens)) {
    return null;
  }

  return {
    prompt_tokens: Math.max(0, prompt_tokens),
    completion_tokens: Math.max(0, completion_tokens),
    total_tokens: Math.max(0, total_tokens),
    estimated: false,
  };
}

export function ensureUsage(value: unknown, input: UsageEstimationInput): NormalizedUsage {
  return normalizeOpenAIUsage(value) ?? estimateUsage(input);
}

export function toOpenAIUsage(usage: NormalizedUsage) {
  return {
    prompt_tokens: usage.prompt_tokens,
    completion_tokens: usage.completion_tokens,
    total_tokens: usage.total_tokens,
  };
}

export function toAnthropicUsage(usage: NormalizedUsage) {
  return {
    input_tokens: usage.prompt_tokens,
    output_tokens: usage.completion_tokens,
  };
}

export function normalizeOpenAIResponseUsage(
  payload: Record<string, unknown>,
  promptText: string,
  completionText: string,
) {
  const normalizedUsage = ensureUsage(payload.usage, {
    promptText,
    completionText,
  });

  return {
    ...payload,
    usage: toOpenAIUsage(normalizedUsage),
  };
}

export function estimateAnthropicCountTokens(input: AnthropicCountTokenInput) {
  const promptText = JSON.stringify({
    system: input.system ?? null,
    messages: input.messages ?? [],
    tools: input.tools ?? [],
  });

  const usage = estimateUsage({
    promptText,
    completionText: '',
  });

  return {
    input_tokens: usage.prompt_tokens,
  };
}
