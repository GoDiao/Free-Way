import assert from 'node:assert/strict';
import {
  anthropicStreamStart,
  createAnthropicStreamTransformer,
  toAnthropicResponse,
} from '../dist/anthropic-bridge.js';
import {
  ensureUsage,
  estimateAnthropicCountTokens,
  normalizeOpenAIResponseUsage,
  toOpenAIUsage,
} from '../dist/usage.js';

const responseWithoutUsage = {
  id: 'chatcmpl-test',
  choices: [
    {
      finish_reason: 'stop',
      message: {
        role: 'assistant',
        content: 'hello world',
      },
    },
  ],
};

const anthropic = toAnthropicResponse(responseWithoutUsage, 'demo-model');
assert.equal(typeof anthropic.usage?.input_tokens, 'number');
assert.equal(typeof anthropic.usage?.output_tokens, 'number');
assert.notEqual(anthropic.usage.input_tokens, 0);
assert.notEqual(anthropic.usage.output_tokens, 0);

const normalized = ensureUsage(null, {
  promptText: 'system: ping\nuser: ping',
  completionText: 'pong',
});
const openaiUsage = toOpenAIUsage(normalized);
assert.equal(typeof openaiUsage.prompt_tokens, 'number');
assert.equal(typeof openaiUsage.completion_tokens, 'number');
assert.equal(openaiUsage.total_tokens, openaiUsage.prompt_tokens + openaiUsage.completion_tokens);

const startEvent = anthropicStreamStart('demo-model');
assert.equal(startEvent.includes('"usage"'), false);

const transformer = createAnthropicStreamTransformer();
const endEvent = transformer.end();
assert.equal(endEvent.includes('"usage"'), false);

const normalizedResponse = normalizeOpenAIResponseUsage(
  {
    id: 'chatcmpl-openai',
    choices: [{ message: { role: 'assistant', content: 'pong' }, finish_reason: 'stop' }],
  },
  'user: ping',
  'pong',
);
assert.equal(typeof normalizedResponse.usage.prompt_tokens, 'number');
assert.equal(typeof normalizedResponse.usage.completion_tokens, 'number');
assert.equal(
  normalizedResponse.usage.total_tokens,
  normalizedResponse.usage.prompt_tokens + normalizedResponse.usage.completion_tokens,
);

const normalizedCohereUsage = ensureUsage(
  {
    prompt_tokens: 12,
    completion_tokens: 8,
    total_tokens: 20,
  },
  { promptText: 'ignored', completionText: 'ignored' },
);
assert.equal(normalizedCohereUsage.prompt_tokens, 12);
assert.equal(normalizedCohereUsage.completion_tokens, 8);
assert.equal(normalizedCohereUsage.total_tokens, 20);
assert.equal(normalizedCohereUsage.estimated, false);

const estimatedCount = estimateAnthropicCountTokens({
  messages: [{ role: 'user', content: 'ping' }],
  system: 'You are helpful.',
  tools: [{ name: 'lookup', description: 'demo', input_schema: { type: 'object' } }],
});
assert.equal(typeof estimatedCount.input_tokens, 'number');
assert.notEqual(estimatedCount.input_tokens, 0);

console.log('usage regression checks passed');
