import type { ChatCompletionRequest, ChatMessage } from './types.js';
import { ensureUsage, toAnthropicUsage } from './usage.js';

export interface AnthropicTextBlock {
  type: 'text';
  text: string;
}

export interface AnthropicToolUseBlock {
  type: 'tool_use';
  id: string;
  name: string;
  input: Record<string, unknown>;
}

export interface AnthropicToolResultBlock {
  type: 'tool_result';
  tool_use_id: string;
  content: string | Array<{ type: 'text'; text: string }>;
}

export type AnthropicMessageContent =
  | string
  | Array<AnthropicTextBlock | AnthropicToolUseBlock | AnthropicToolResultBlock>;

export interface AnthropicMessage {
  role: 'user' | 'assistant';
  content: AnthropicMessageContent;
}

export interface AnthropicRequest {
  model: string;
  messages: AnthropicMessage[];
  max_tokens?: number;
  temperature?: number;
  top_p?: number;
  system?: string;
  stream?: boolean;
  tools?: Array<Record<string, unknown>>;
  tool_choice?: unknown;
  [key: string]: unknown;
}

export type AnthropicResponseContentBlock = AnthropicTextBlock | AnthropicToolUseBlock;

export interface AnthropicResponse {
  id: string;
  type: 'message';
  role: 'assistant';
  content: AnthropicResponseContentBlock[];
  model: string;
  stop_reason: string | null;
  usage: {
    input_tokens: number;
    output_tokens: number;
  };
}

function extractText(value: unknown): string {
  if (typeof value === 'string') return value;

  if (Array.isArray(value)) {
    return value
      .map((part) => {
        if (typeof part === 'string') return part;
        if (part && typeof part === 'object' && (part as { type?: string }).type === 'text') {
          return String((part as { text?: unknown }).text ?? '');
        }
        return '';
      })
      .join('');
  }

  if (value == null) return '';
  return String(value);
}

function toOpenAITools(tools: unknown): ChatCompletionRequest['tools'] | undefined {
  if (!Array.isArray(tools)) return undefined;

  const mapped = tools
    .map((tool) => {
      const t = (tool ?? {}) as Record<string, unknown>;
      const name = typeof t.name === 'string' ? t.name : '';
      if (!name) return null;

      return {
        type: 'function' as const,
        function: {
          name,
          description: typeof t.description === 'string' ? t.description : undefined,
          parameters: (t.input_schema as Record<string, unknown>) ?? {
            type: 'object',
            properties: {},
          },
        },
      };
    })
    .filter((x): x is NonNullable<typeof x> => x !== null);

  return mapped.length ? mapped : undefined;
}

function toOpenAIToolChoice(choice: unknown): ChatCompletionRequest['tool_choice'] | undefined {
  if (!choice || typeof choice !== 'object') return undefined;

  const c = choice as Record<string, unknown>;
  const type = String(c.type ?? '');

  if (type === 'auto') return 'auto';
  if (type === 'any') return 'required';

  if (type === 'tool') {
    const name = typeof c.name === 'string' ? c.name : '';
    if (!name) return undefined;
    return {
      type: 'function',
      function: { name },
    };
  }

  return undefined;
}

function parseJsonObject(value: string): Record<string, unknown> {
  if (!value) return {};
  try {
    const parsed = JSON.parse(value);
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      return parsed as Record<string, unknown>;
    }
  } catch {
    return {};
  }
  return {};
}

type OpenAIBridgeMessage = ChatMessage & {
  tool_calls?: Array<Record<string, unknown>>;
  tool_call_id?: string;
};

export function fromAnthropicRequest(req: AnthropicRequest): ChatCompletionRequest {
  const messages: OpenAIBridgeMessage[] = [];

  if (req.system) {
    messages.push({ role: 'system', content: extractText(req.system) });
  }

  for (const m of req.messages) {
    if (typeof m.content === 'string') {
      messages.push({ role: m.role, content: m.content });
      continue;
    }

    const blocks = Array.isArray(m.content) ? m.content : [];

    if (m.role === 'assistant') {
      const textParts: string[] = [];
      const toolCalls: Array<Record<string, unknown>> = [];

      for (const block of blocks) {
        if (block.type === 'text') {
          textParts.push(block.text ?? '');
        }

        if (block.type === 'tool_use') {
          toolCalls.push({
            id: block.id,
            type: 'function',
            function: {
              name: block.name,
              arguments: JSON.stringify(block.input ?? {}),
            },
          });
        }
      }

      if (textParts.length || toolCalls.length) {
        const assistantMessage: OpenAIBridgeMessage = {
          role: 'assistant',
          content: textParts.join(''),
        };

        if (toolCalls.length) {
          assistantMessage.tool_calls = toolCalls;
        }

        messages.push(assistantMessage);
      }

      continue;
    }

    for (const block of blocks) {
      if (block.type === 'text') {
        messages.push({ role: 'user', content: block.text ?? '' });
      }

      if (block.type === 'tool_result') {
        const toolMessage: OpenAIBridgeMessage = {
          role: 'tool',
          content: extractText(block.content),
        };
        if (block.tool_use_id) {
          toolMessage.tool_call_id = block.tool_use_id;
        }
        messages.push(toolMessage);
      }
    }
  }

  return {
    model: req.model,
    messages,
    max_tokens: req.max_tokens,
    temperature: req.temperature,
    top_p: req.top_p,
    stream: req.stream,
    tools: toOpenAITools(req.tools),
    tool_choice: toOpenAIToolChoice(req.tool_choice),
  };
}

export function toAnthropicResponse(
  openAIResponse: Record<string, unknown>,
  modelId: string
): AnthropicResponse {
  const choices = (openAIResponse.choices as Array<Record<string, unknown>>) ?? [];
  const firstChoice = choices[0] ?? {};
  const message = (firstChoice.message as Record<string, unknown>) ?? {};
  const contentText = String(message.content ?? '');
  const normalizedUsage = ensureUsage(openAIResponse.usage, {
    promptText: JSON.stringify((openAIResponse.messages as unknown[]) ?? [message]),
    completionText: contentText,
  });

  const toolCallsRaw = Array.isArray(message.tool_calls)
    ? (message.tool_calls as Array<Record<string, unknown>>)
    : [];

  const content: AnthropicResponseContentBlock[] = [];

  if (contentText) {
    content.push({ type: 'text', text: contentText });
  }

  for (const tc of toolCallsRaw) {
    const fn = (tc.function as Record<string, unknown>) ?? {};
    const id = typeof tc.id === 'string' && tc.id ? tc.id : `toolu_${Date.now()}`;
    const name = typeof fn.name === 'string' ? fn.name : 'tool';
    const input = parseJsonObject(String(fn.arguments ?? ''));

    content.push({
      type: 'tool_use',
      id,
      name,
      input,
    });
  }

  const finishReason = String(firstChoice.finish_reason ?? '');
  const stopReason = toolCallsRaw.length || finishReason === 'tool_calls'
    ? 'tool_use'
    : finishReason === 'stop'
      ? 'end_turn'
      : finishReason === 'length'
        ? 'max_tokens'
        : null;

  return {
    id: String(openAIResponse.id ?? `msg-${Date.now()}`),
    type: 'message',
    role: 'assistant',
    content,
    model: modelId,
    stop_reason: stopReason,
    usage: toAnthropicUsage(normalizedUsage),
  };
}

function sseEvent(event: Record<string, unknown>): string {
  const eventName = typeof event.type === 'string' && event.type ? event.type : 'message';
  return `event: ${eventName}\ndata: ${JSON.stringify(event)}\n\n`;
}

export function anthropicStreamStart(modelId: string): string {
  const event = {
    type: 'message_start',
    message: {
      id: `msg-${Date.now()}`,
      type: 'message',
      role: 'assistant',
      content: [],
      model: modelId,
      stop_reason: null,
    },
  };
  return sseEvent(event);
}

export function createAnthropicStreamTransformer() {
  let textStarted = false;
  const toolBlocks = new Set<number>();
  let sawToolUse = false;
  let finishReason: string | null = null;

  return {
    transform(openAIChunk: Record<string, unknown>): string {
      const choices = (openAIChunk.choices as Array<Record<string, unknown>>) ?? [];
      const choice = choices[0] ?? {};
      const delta = (choice.delta as Record<string, unknown>) ?? {};
      const text = String(delta.content ?? '');

      let out = '';

      if (text) {
        if (!textStarted) {
          out += sseEvent({
            type: 'content_block_start',
            index: 0,
            content_block: { type: 'text', text: '' },
          });
          textStarted = true;
        }

        out += sseEvent({
          type: 'content_block_delta',
          index: 0,
          delta: { type: 'text_delta', text },
        });
      }

      const toolCalls = Array.isArray(delta.tool_calls)
        ? (delta.tool_calls as Array<Record<string, unknown>>)
        : [];

      for (const call of toolCalls) {
        sawToolUse = true;

        const fn = (call.function as Record<string, unknown>) ?? {};
        const openAIIndex = Number(call.index ?? 0);
        const index = Number.isFinite(openAIIndex)
          ? openAIIndex + (textStarted ? 1 : 0)
          : textStarted
            ? 1
            : 0;

        if (!toolBlocks.has(index)) {
          const id = typeof call.id === 'string' && call.id ? call.id : `toolu_${Date.now()}_${index}`;
          const name = typeof fn.name === 'string' && fn.name ? fn.name : 'tool';

          out += sseEvent({
            type: 'content_block_start',
            index,
            content_block: {
              type: 'tool_use',
              id,
              name,
              input: {},
            },
          });

          toolBlocks.add(index);
        }

        const argsDelta = typeof fn.arguments === 'string' ? fn.arguments : '';
        if (argsDelta) {
          out += sseEvent({
            type: 'content_block_delta',
            index,
            delta: {
              type: 'input_json_delta',
              partial_json: argsDelta,
            },
          });
        }
      }

      const fr = choice.finish_reason;
      if (typeof fr === 'string' && fr) {
        finishReason = fr;
      }

      return out;
    },

    end(): string {
      let out = '';

      if (textStarted) {
        out += sseEvent({ type: 'content_block_stop', index: 0 });
      }

      for (const index of Array.from(toolBlocks).sort((a, b) => a - b)) {
        out += sseEvent({ type: 'content_block_stop', index });
      }

      const stopReason = sawToolUse || finishReason === 'tool_calls'
        ? 'tool_use'
        : finishReason === 'length'
          ? 'max_tokens'
          : 'end_turn';

      out += sseEvent({
        type: 'message_delta',
        delta: { stop_reason: stopReason, stop_sequence: null },
      });
      out += sseEvent({ type: 'message_stop' });

      return out;
    },
  };
}
