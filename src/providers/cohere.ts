import { BaseProvider, type ProviderConfig } from './base.js';
import type { ChatCompletionRequest, ChatMessage } from '../types.js';
import { withProviderTimeout } from './timeout.js';

interface CohereMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  tool_calls?: Array<Record<string, unknown>>;
}

interface CohereChatResponse {
  id?: string;
  message?: {
    role?: string;
    content?: CohereContentBlock[] | string;
    tool_calls?: Array<Record<string, unknown>>;
  };
  text?: string;
  generation_id?: string;
  finish_reason?: string;
  usage?: {
    billed_units?: { input_tokens?: number; output_tokens?: number };
    tokens?: { input_tokens?: number; output_tokens?: number };
  };
}

interface CohereContentBlock {
  type: 'text';
  text: string;
}

function normalizeContent(content: unknown): string {
  if (typeof content === 'string') return content;

  if (Array.isArray(content)) {
    return content
      .map((part) => {
        if (typeof part === 'string') return part;
        if (part && typeof part === 'object' && (part as { type?: string }).type === 'text') {
          return String((part as { text?: unknown }).text ?? '');
        }
        return '';
      })
      .join('');
  }

  if (content == null) return '';
  return String(content);
}

function mapToolResultToUserContent(message: OpenAIBridgeMessage): string {
  const toolCallId = typeof message.tool_call_id === 'string' ? message.tool_call_id : '';
  const content = normalizeContent(message.content);
  return toolCallId ? `[tool_result:${toolCallId}] ${content}` : content;
}

type OpenAIBridgeMessage = ChatMessage & {
  tool_calls?: Array<Record<string, unknown>>;
  tool_call_id?: string;
};

function toCohereMessages(messages: OpenAIBridgeMessage[]): CohereMessage[] {
  return messages.map((m) => {
    const role = m.role;

    if (role === 'user') {
      return {
        role: 'user',
        content: normalizeContent(m.content),
      };
    }

    if (role === 'assistant') {
      const msg: CohereMessage = {
        role: 'assistant',
        content: normalizeContent(m.content),
      };

      if (Array.isArray(m.tool_calls)) {
        msg.tool_calls = m.tool_calls as Array<Record<string, unknown>>;
      }

      return msg;
    }

    if (role === 'tool') {
      return {
        role: 'user',
        content: mapToolResultToUserContent(m),
      };
    }

    return {
      role: 'system',
      content: normalizeContent(m.content),
    };
  });
}

export class CohereProvider extends BaseProvider {
  constructor(config: ProviderConfig) {
    super(config);
  }

  async chatCompletion(request: ChatCompletionRequest): Promise<Response> {
    const url = `${this.baseURL}/chat`;
    const modelId = this.resolveModelId(request.model);

    const body: Record<string, unknown> = {
      model: modelId,
      messages: toCohereMessages(request.messages),
      max_tokens: request.max_tokens,
      temperature: request.temperature,
      stream: request.stream,
    };

    if (request.tools) body.tools = request.tools;
    if (request.tool_choice) body.tool_choice = request.tool_choice;

    return withProviderTimeout(
      { providerName: this.name, operation: 'chat completion' },
      async (signal) => {
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.apiKey}`,
            ...this.customHeaders,
          },
          body: JSON.stringify(body),
          signal,
        });

        if (request.stream) {
          return response;
        }

        const cohereData = (await response.json()) as CohereChatResponse;

        let content = '';
        if (cohereData.message?.content) {
          if (typeof cohereData.message.content === 'string') {
            content = cohereData.message.content;
          } else {
            content = cohereData.message.content.map((c) => c.text).join('');
          }
        } else if (cohereData.text) {
          content = cohereData.text;
        }

        const tokens = cohereData.usage?.tokens ?? cohereData.usage?.billed_units;
        const toolCalls = Array.isArray(cohereData.message?.tool_calls)
          ? cohereData.message?.tool_calls
          : undefined;

        const message: Record<string, unknown> = { role: 'assistant', content };
        if (toolCalls?.length) {
          message.tool_calls = toolCalls;
        }

        const finishReason = toolCalls?.length
          ? 'tool_calls'
          : cohereData.finish_reason === 'COMPLETE'
            ? 'stop'
            : cohereData.finish_reason ?? 'stop';

        const openAIResponse = {
          id: cohereData.id ?? cohereData.generation_id ?? `cohere-${Date.now()}`,
          object: 'chat.completion',
          created: Math.floor(Date.now() / 1000),
          model: request.model,
          choices: [
            {
              index: 0,
              message,
              finish_reason: finishReason,
            },
          ],
          usage: {
            prompt_tokens: tokens?.input_tokens ?? 0,
            completion_tokens: tokens?.output_tokens ?? 0,
            total_tokens: (tokens?.input_tokens ?? 0) + (tokens?.output_tokens ?? 0),
          },
        };

        return new Response(JSON.stringify(openAIResponse), {
          status: response.status,
          headers: { 'Content-Type': 'application/json' },
        });
      }
    );
  }
}
