import assert from 'node:assert/strict';
import {
  createAnthropicStreamTransformer,
  fromAnthropicRequest,
  toAnthropicResponse,
} from '../dist/anthropic-bridge.js';
import { createServer } from '../dist/server.js';
import { setFreewayApiKey } from '../dist/config.js';
import { usageTracker } from '../dist/usage-tracker.js';

setFreewayApiKey('');

const provider = { name: 'mock-provider' };
const calls = [];
const recordUsage = usageTracker.record.bind(usageTracker);
usageTracker.record = () => {};

function jsonResponse(payload, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

function sseResponse(chunks, status = 200) {
  const encoder = new TextEncoder();
  return new Response(
    new ReadableStream({
      start(controller) {
        for (const chunk of chunks) {
          controller.enqueue(encoder.encode(chunk));
        }
        controller.close();
      },
    }),
    {
      status,
      headers: { 'Content-Type': 'text/event-stream' },
    },
  );
}

async function mockRouteChatCompletion(request) {
  calls.push(request);

  if (request.model === 'openai-non-stream') {
    return {
      provider,
      response: jsonResponse({
        id: 'chatcmpl-openai-non-stream',
        object: 'chat.completion',
        created: 1,
        model: request.model,
        choices: [
          {
            index: 0,
            message: { role: 'assistant', content: 'OpenAI compatibility OK' },
            finish_reason: 'stop',
          },
        ],
      }),
    };
  }

  if (request.model === 'openai-stream') {
    return {
      provider,
      response: sseResponse([
        'data: {"choices":[{"delta":{"role":"assistant"}}]}\n\n',
        'data: {"choices":[{"delta":{"content":"OpenAI "}}]}\n\n',
        'data: {"choices":[{"delta":{"content":"stream OK"},"finish_reason":"stop"}],"usage":{"prompt_tokens":6,"completion_tokens":3,"total_tokens":9}}\n\n',
        'data: [DONE]\n\n',
      ]),
    };
  }

  if (request.model === 'anthropic-non-stream') {
    return {
      provider,
      response: jsonResponse({
        id: 'chatcmpl-anthropic-tool',
        object: 'chat.completion',
        created: 1,
        model: request.model,
        choices: [
          {
            index: 0,
            message: {
              role: 'assistant',
              content: '',
              tool_calls: [
                {
                  id: 'call_weather',
                  type: 'function',
                  function: {
                    name: 'lookup_weather',
                    arguments: '{"city":"Paris"}',
                  },
                },
              ],
            },
            finish_reason: 'tool_calls',
          },
        ],
        usage: {
          prompt_tokens: 12,
          completion_tokens: 5,
          total_tokens: 17,
        },
      }),
    };
  }

  if (request.model === 'anthropic-stream') {
    return {
      provider,
      response: sseResponse([
        'data: {"choices":[{"delta":{"content":"Anthropic "}}]}\n\n',
        'data: {"choices":[{"delta":{"content":"stream OK"},"finish_reason":"stop"}]}\n\n',
        'data: [DONE]\n\n',
      ]),
    };
  }

  if (request.model === 'provider-401') {
    return {
      provider,
      response: jsonResponse({ error: { message: 'bad key', type: 'authentication_error' } }, 401),
    };
  }

  if (request.model === 'provider-429') {
    return {
      provider,
      response: jsonResponse({ error: { message: 'rate limited', type: 'rate_limit_error' } }, 429),
    };
  }

  if (request.model === 'provider-500') {
    return {
      provider,
      response: jsonResponse({ error: { message: 'upstream failed', type: 'server_error' } }, 500),
    };
  }

  if (request.model === 'provider-non-json') {
    return {
      provider,
      response: new Response('upstream temporarily unavailable', {
        status: 500,
        headers: { 'Content-Type': 'text/plain' },
      }),
    };
  }

  throw new Error(`Unexpected mock model: ${request.model}`);
}

function listen(server) {
  return new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', () => {
      server.off('error', reject);
      const address = server.address();
      assert(address && typeof address === 'object');
      resolve(`http://127.0.0.1:${address.port}`);
    });
  });
}

function close(server) {
  return new Promise((resolve, reject) => {
    server.close((err) => {
      if (err) reject(err);
      else resolve();
    });
  });
}

async function postJson(baseUrl, pathname, payload) {
  return fetch(`${baseUrl}${pathname}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
}

function parseAnthropicSse(body) {
  return body
    .split(/\r?\n\r?\n/)
    .flatMap((segment) => segment.split(/\r?\n/).filter((line) => line.startsWith('data: ')))
    .map((line) => JSON.parse(line.slice('data: '.length)));
}

function assertAnthropicBridgeConversions() {
  const bridgedToolResult = fromAnthropicRequest({
    model: 'anthropic-bridge',
    stream: true,
    messages: [
      {
        role: 'assistant',
        content: [
          { type: 'text', text: 'Checking weather' },
          {
            type: 'tool_use',
            id: 'toolu_weather',
            name: 'lookup_weather',
            input: { city: 'Paris' },
          },
        ],
      },
      {
        role: 'user',
        content: [
          {
            type: 'tool_result',
            tool_use_id: 'toolu_weather',
            content: [{ type: 'text', text: 'sunny' }],
          },
        ],
      },
    ],
    tools: [
      {
        name: 'lookup_weather',
        input_schema: {
          type: 'object',
          properties: { city: { type: 'string' } },
        },
      },
    ],
    tool_choice: { type: 'any' },
  });

  assert.equal(bridgedToolResult.stream, true);
  assert.equal(bridgedToolResult.messages[0].role, 'assistant');
  assert.equal(bridgedToolResult.messages[0].content, 'Checking weather');
  assert.equal(bridgedToolResult.messages[0].tool_calls[0].id, 'toolu_weather');
  assert.equal(bridgedToolResult.messages[0].tool_calls[0].function.name, 'lookup_weather');
  assert.equal(bridgedToolResult.messages[0].tool_calls[0].function.arguments, '{"city":"Paris"}');
  assert.equal(bridgedToolResult.messages[1].role, 'tool');
  assert.equal(bridgedToolResult.messages[1].tool_call_id, 'toolu_weather');
  assert.equal(bridgedToolResult.messages[1].content, 'sunny');
  assert.equal(bridgedToolResult.tool_choice, 'required');
  assert.equal(bridgedToolResult.tools[0].function.parameters.properties.city.type, 'string');

  const autoToolChoice = fromAnthropicRequest({
    model: 'anthropic-bridge',
    messages: [{ role: 'user', content: 'hello' }],
    tool_choice: { type: 'auto' },
  });
  assert.equal(autoToolChoice.tool_choice, 'auto');

  const textResponse = toAnthropicResponse(
    {
      id: 'chatcmpl-text',
      choices: [
        {
          message: { role: 'assistant', content: 'Done' },
          finish_reason: 'stop',
        },
      ],
      usage: { prompt_tokens: 4, completion_tokens: 2, total_tokens: 6 },
    },
    'anthropic-bridge',
  );
  assert.equal(textResponse.stop_reason, 'end_turn');
  assert.deepEqual(textResponse.content, [{ type: 'text', text: 'Done' }]);
  assert.equal(textResponse.usage.input_tokens, 4);
  assert.equal(textResponse.usage.output_tokens, 2);

  const lengthResponse = toAnthropicResponse(
    {
      id: 'chatcmpl-length',
      choices: [
        {
          message: { role: 'assistant', content: 'Partial' },
          finish_reason: 'length',
        },
      ],
      usage: { prompt_tokens: 3, completion_tokens: 7, total_tokens: 10 },
    },
    'anthropic-bridge',
  );
  assert.equal(lengthResponse.stop_reason, 'max_tokens');

  const invalidToolArgsResponse = toAnthropicResponse(
    {
      id: 'chatcmpl-invalid-tool-args',
      choices: [
        {
          message: {
            role: 'assistant',
            content: '',
            tool_calls: [
              {
                id: 'call_invalid',
                type: 'function',
                function: {
                  name: 'lookup_weather',
                  arguments: 'not json',
                },
              },
            ],
          },
          finish_reason: 'tool_calls',
        },
      ],
      usage: { prompt_tokens: 1, completion_tokens: 1, total_tokens: 2 },
    },
    'anthropic-bridge',
  );
  assert.equal(invalidToolArgsResponse.stop_reason, 'tool_use');
  assert.deepEqual(invalidToolArgsResponse.content[0].input, {});

  const transformer = createAnthropicStreamTransformer();
  const toolStart = transformer.transform({
    choices: [
      {
        delta: {
          tool_calls: [
            {
              index: 0,
              id: 'call_stream_weather',
              type: 'function',
              function: { name: 'lookup_weather', arguments: '{"city"' },
            },
          ],
        },
      },
    ],
  });
  const toolDelta = transformer.transform({
    choices: [
      {
        delta: {
          tool_calls: [
            {
              index: 0,
              type: 'function',
              function: { arguments: ':"Paris"}' },
            },
          ],
        },
        finish_reason: 'tool_calls',
      },
    ],
  });
  const toolEnd = transformer.end();
  const streamToolEvents = parseAnthropicSse(toolStart + toolDelta + toolEnd);
  assert.deepEqual(
    streamToolEvents.map((event) => event.type),
    [
      'content_block_start',
      'content_block_delta',
      'content_block_delta',
      'content_block_stop',
      'message_delta',
      'message_stop',
    ],
  );
  assert.equal(streamToolEvents[0].content_block.type, 'tool_use');
  assert.equal(streamToolEvents[0].content_block.id, 'call_stream_weather');
  assert.equal(streamToolEvents[0].content_block.name, 'lookup_weather');
  assert.equal(
    streamToolEvents
      .filter((event) => event.type === 'content_block_delta')
      .map((event) => event.delta.partial_json)
      .join(''),
    '{"city":"Paris"}',
  );
  assert.equal(streamToolEvents[4].delta.stop_reason, 'tool_use');
}

const server = createServer({ routeChatCompletion: mockRouteChatCompletion });
const baseUrl = await listen(server);

try {
  assertAnthropicBridgeConversions();

  const openAIResponse = await postJson(baseUrl, '/v1/chat/completions', {
    model: 'openai-non-stream',
    messages: [{ role: 'user', content: 'ping' }],
  });
  assert.equal(openAIResponse.status, 200);
  assert.equal(openAIResponse.headers.get('x-freeway-provider'), provider.name);
  const openAIBody = await openAIResponse.json();
  assert.equal(openAIBody.choices[0].message.content, 'OpenAI compatibility OK');
  assert.equal(typeof openAIBody.usage.prompt_tokens, 'number');
  assert.equal(typeof openAIBody.usage.completion_tokens, 'number');
  assert.equal(openAIBody.usage.total_tokens, openAIBody.usage.prompt_tokens + openAIBody.usage.completion_tokens);

  const openAIStreamResponse = await postJson(baseUrl, '/v1/chat/completions', {
    model: 'openai-stream',
    stream: true,
    messages: [{ role: 'user', content: 'stream please' }],
  });
  assert.equal(openAIStreamResponse.status, 200);
  assert.match(openAIStreamResponse.headers.get('content-type') ?? '', /text\/event-stream/);
  const openAIStreamBody = await openAIStreamResponse.text();
  assert.match(openAIStreamBody, /data: \[DONE\]/);
  assert.match(openAIStreamBody, /OpenAI /);
  assert.match(openAIStreamBody, /stream OK/);

  const anthropicResponse = await postJson(baseUrl, '/v1/messages', {
    model: 'anthropic-non-stream',
    max_tokens: 64,
    system: 'Use tools when needed',
    messages: [
      {
        role: 'user',
        content: [{ type: 'text', text: 'Look up Paris weather' }],
      },
    ],
    tools: [
      {
        name: 'lookup_weather',
        description: 'Return weather for a city',
        input_schema: {
          type: 'object',
          properties: { city: { type: 'string' } },
          required: ['city'],
        },
      },
    ],
    tool_choice: { type: 'tool', name: 'lookup_weather' },
  });
  assert.equal(anthropicResponse.status, 200);
  assert.equal(anthropicResponse.headers.get('x-freeway-provider'), provider.name);
  const anthropicBody = await anthropicResponse.json();
  assert.equal(anthropicBody.type, 'message');
  assert.equal(anthropicBody.role, 'assistant');
  assert.equal(anthropicBody.stop_reason, 'tool_use');
  assert.equal(anthropicBody.usage.input_tokens, 12);
  assert.equal(anthropicBody.usage.output_tokens, 5);
  assert.equal(anthropicBody.content[0].type, 'tool_use');
  assert.equal(anthropicBody.content[0].name, 'lookup_weather');
  assert.deepEqual(anthropicBody.content[0].input, { city: 'Paris' });

  const anthropicCall = calls.find((call) => call.model === 'anthropic-non-stream');
  assert(anthropicCall);
  assert.equal(anthropicCall.messages[0].role, 'system');
  assert.equal(anthropicCall.messages[0].content, 'Use tools when needed');
  assert.equal(anthropicCall.tools[0].type, 'function');
  assert.equal(anthropicCall.tools[0].function.name, 'lookup_weather');
  assert.equal(anthropicCall.tools[0].function.parameters.properties.city.type, 'string');
  assert.deepEqual(anthropicCall.tool_choice, {
    type: 'function',
    function: { name: 'lookup_weather' },
  });

  const anthropicStreamResponse = await postJson(baseUrl, '/v1/messages', {
    model: 'anthropic-stream',
    max_tokens: 64,
    stream: true,
    messages: [{ role: 'user', content: 'stream please' }],
  });
  assert.equal(anthropicStreamResponse.status, 200);
  assert.match(anthropicStreamResponse.headers.get('content-type') ?? '', /text\/event-stream/);
  const anthropicStreamBody = await anthropicStreamResponse.text();
  const anthropicEvents = parseAnthropicSse(anthropicStreamBody);
  assert.deepEqual(
    anthropicEvents.map((event) => event.type),
    [
      'message_start',
      'content_block_start',
      'content_block_delta',
      'content_block_delta',
      'content_block_stop',
      'message_delta',
      'message_stop',
    ],
  );
  assert.equal(
    anthropicEvents
      .filter((event) => event.type === 'content_block_delta')
      .map((event) => event.delta.text)
      .join(''),
    'Anthropic stream OK',
  );

  for (const [model, status, message] of [
    ['provider-401', 401, 'bad key'],
    ['provider-429', 429, 'rate limited'],
    ['provider-500', 500, 'upstream failed'],
  ]) {
    const providerErrorResponse = await postJson(baseUrl, '/v1/chat/completions', {
      model,
      messages: [{ role: 'user', content: 'trigger provider error' }],
    });
    assert.equal(providerErrorResponse.status, status);
    const providerErrorBody = await providerErrorResponse.json();
    assert.equal(providerErrorBody.error.message, message);
  }

  const nonJsonErrorResponse = await postJson(baseUrl, '/v1/chat/completions', {
    model: 'provider-non-json',
    messages: [{ role: 'user', content: 'trigger non-json error' }],
  });
  assert.equal(nonJsonErrorResponse.status, 500);
  const nonJsonErrorBody = await nonJsonErrorResponse.json();
  assert.equal(nonJsonErrorBody.error.type, 'internal_error');

  console.log('compat regression checks passed');
} finally {
  usageTracker.record = recordUsage;
  await close(server);
}
