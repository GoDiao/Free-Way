import http from 'http';
import path from 'path';
import { readFile } from 'fs/promises';
import type { ChatCompletionRequest } from './types.js';
import { routeChatCompletion } from './router.js';
import {
  anthropicStreamStart,
  createAnthropicStreamTransformer,
  fromAnthropicRequest,
  toAnthropicResponse,
  type AnthropicRequest,
} from './anthropic-bridge.js';
import { estimateAnthropicCountTokens, estimateUsage, normalizeOpenAIResponseUsage } from './usage.js';
import { usageTracker } from './usage-tracker.js';

// Configure HTTP proxy for all fetch() calls if HTTP_PROXY is set
try {
  // @ts-ignore — undici is bundled with Node.js 18+
  const undici = await import('undici');
  if (process.env.HTTP_PROXY && undici.ProxyAgent && undici.setGlobalDispatcher) {
    undici.setGlobalDispatcher(new undici.ProxyAgent(process.env.HTTP_PROXY));
    console.log(`[Proxy] Using ${process.env.HTTP_PROXY}`);
  }
} catch {
  // undici not available, skip proxy setup
}
import { buildCatalogSummary, listProviderEnvVars, listProviderSummaries } from './catalog.js';
import { listCanonicalModels } from './models/registry.js';
import { getConfigMeta, getFreewayApiKey, initializePersistedApiKeys, persistRuntimeApiKeys, setFreewayApiKey, setRuntimeApiKey } from './config.js';
import { checkAllProvidersHealth, checkProviderHealth } from './health.js';
import { loadAllModelCaches, refreshAllProviderModels } from './providers/index.js';

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 8787;
const WEB_ROOT = path.resolve(process.cwd(), 'src', 'web');
const STATIC_ROOT = path.resolve(WEB_ROOT, 'static');
const allowedEnvVars = new Set(listProviderEnvVars());
const DEBUG_TRACE = process.env.FREEWAY_DEBUG_TRACE === '1';

function trace(event: string, payload?: Record<string, unknown>) {
  if (!DEBUG_TRACE) return;
  const ts = new Date().toISOString();
  if (!payload) {
    console.log(`[Trace ${ts}] ${event}`);
    return;
  }
  console.log(`[Trace ${ts}] ${event} ${JSON.stringify(payload)}`);
}

function authHeaderMode(req: http.IncomingMessage): 'none' | 'bearer' | 'other' {
  const auth = req.headers.authorization;
  if (!auth) return 'none';
  if (/^Bearer\s+/i.test(auth)) return 'bearer';
  return 'other';
}

function sendJSON(res: http.ServerResponse, status: number, data: unknown) {
  const body = JSON.stringify(data);
  res.writeHead(status, {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(body),
  });
  res.end(body);
}

function sendText(res: http.ServerResponse, status: number, body: string, contentType: string) {
  res.writeHead(status, {
    'Content-Type': contentType,
    'Content-Length': Buffer.byteLength(body),
  });
  res.end(body);
}

function sendStream(res: http.ServerResponse, status: number) {
  res.writeHead(status, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive',
  });
}

function sendNoContent(res: http.ServerResponse, allow: string) {
  res.writeHead(204, { Allow: allow });
  res.end();
}

async function readBody(req: http.IncomingMessage): Promise<string> {
  const chunks: Buffer[] = [];
  for await (const chunk of req) {
    chunks.push(chunk);
  }
  return Buffer.concat(chunks).toString('utf-8');
}

async function serveStatic(url: string, res: http.ServerResponse): Promise<boolean> {
  if (url === '/' || url === '/index.html') {
    const html = await readFile(path.join(WEB_ROOT, 'templates', 'index.html'), 'utf-8');
    sendText(res, 200, html, 'text/html; charset=utf-8');
    return true;
  }

  if (!url.startsWith('/static/')) {
    return false;
  }

  const requestedPath = decodeURIComponent(url.slice('/static/'.length));
  const safePath = path.normalize(requestedPath).replace(/^([.][.][/\\])+/, '');
  const filePath = path.resolve(STATIC_ROOT, safePath);

  if (!filePath.startsWith(STATIC_ROOT + path.sep) && filePath !== STATIC_ROOT) {
    sendJSON(res, 403, { error: { message: 'Forbidden', type: 'invalid_request_error' } });
    return true;
  }

  const content = await readFile(filePath);
  const ext = path.extname(filePath);
  const contentType = ext === '.css'
    ? 'text/css; charset=utf-8'
    : ext === '.js'
      ? 'application/javascript; charset=utf-8'
      : 'application/octet-stream';

  res.writeHead(200, { 'Content-Type': contentType, 'Content-Length': content.length });
  res.end(content);
  return true;
}

function checkGatewayAuth(req: http.IncomingMessage, res: http.ServerResponse): boolean {
  const gatewayKey = getFreewayApiKey();
  if (!gatewayKey) {
    trace('auth.skip', { reason: 'gateway_key_not_set' });
    return true;
  }

  const bearer = (req.headers.authorization ?? '').match(/^Bearer\s+(.+)$/)?.[1] ?? '';
  const apiKeyHeader = typeof req.headers['x-api-key'] === 'string' ? req.headers['x-api-key'] : '';
  const ok = bearer === gatewayKey || apiKeyHeader === gatewayKey;
  trace('auth.check', {
    mode: authHeaderMode(req),
    hasAuthHeader: !!req.headers.authorization,
    ok,
  });

  if (!ok) {
    sendJSON(res, 401, {
      error: {
        message: 'Incorrect API key provided. You can find your API key at http://localhost:8787.',
        type: 'authentication_error',
        param: null,
        code: 'invalid_api_key',
      },
    });
    return false;
  }
  return true;
}

const server = http.createServer(async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, HEAD, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-api-key');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const requestUrl = req.url ?? '/';
  const pathname = new URL(requestUrl, `http://${req.headers.host ?? 'localhost'}`).pathname;
  trace('request.in', {
    method: req.method ?? 'UNKNOWN',
    url: requestUrl,
    pathname,
    userAgent: req.headers['user-agent'] ?? '',
  });

  try {
    if (await serveStatic(pathname, res)) {
      return;
    }

    if (pathname === '/api/catalog' && req.method === 'GET') {
      sendJSON(res, 200, buildCatalogSummary());
      return;
    }

    if (pathname === '/api/health/check-all' && req.method === 'POST') {
      const health = await checkAllProvidersHealth();
      sendJSON(res, 200, { health });
      return;
    }

    if (pathname.startsWith('/api/health/check/') && req.method === 'POST') {
      const providerName = decodeURIComponent(pathname.slice('/api/health/check/'.length));
      const health = await checkProviderHealth(providerName);
      sendJSON(res, 200, { health });
      return;
    }

    if (pathname === '/api/models/refresh' && req.method === 'POST') {
      const result = await refreshAllProviderModels();
      sendJSON(res, 200, {
        ok: true,
        refreshed: result.refreshed,
        failed: result.failed,
        syncedAt: Date.now(),
      });
      return;
    }

    if (pathname === '/api/usage' && req.method === 'GET') {
      sendJSON(res, 200, { records: usageTracker.getStats() });
      return;
    }

    if (pathname === '/api/usage' && req.method === 'DELETE') {
      sendJSON(res, 200, { records: usageTracker.clear() });
      return;
    }

    if (pathname === '/api/config/keys' && req.method === 'POST') {
      const raw = await readBody(req);
      const payload = JSON.parse(raw) as { keys?: Record<string, string>; gatewayKey?: string };
      const keys = payload.keys ?? {};
      const updated: string[] = [];
      const ignored: string[] = [];

      for (const [envVar, value] of Object.entries(keys)) {
        if (!allowedEnvVars.has(envVar)) {
          ignored.push(envVar);
          continue;
        }
        setRuntimeApiKey(envVar, value);
        updated.push(envVar);
      }

      if (payload.gatewayKey !== undefined) {
        setFreewayApiKey(payload.gatewayKey);
        if (payload.gatewayKey) updated.push('FREEWAY_API_KEY');
      }

      await persistRuntimeApiKeys(allowedEnvVars);
      const meta = getConfigMeta();
      sendJSON(res, 200, {
        ok: true,
        updated,
        ignored,
        persisted: true,
        persistedPath: meta.persistedPath,
        persistedUpdatedAt: meta.persistedUpdatedAt,
      });
      return;
    }

    if (pathname === '/v1/models' && req.method === 'GET') {
      if (!checkGatewayAuth(req, res)) return;
      const models = listCanonicalModels().map(m => ({
        id: m.id,
        object: 'model' as const,
        owned_by: m.providers.map(p => p.name).join(', '),
      }));
      sendJSON(res, 200, {
        object: 'list',
        data: models,
      });
      return;
    }

    if (pathname === '/v1/chat/completions' && req.method === 'POST') {
      if (!checkGatewayAuth(req, res)) return;
      const raw = await readBody(req);
      const request = JSON.parse(raw) as ChatCompletionRequest;

      trace('openai.request', {
        model: request.model ?? null,
        stream: !!request.stream,
      });

      if (!request.model) {
        sendJSON(res, 400, { error: { message: 'Missing "model" field', type: 'invalid_request_error' } });
        return;
      }

      const { response, provider } = await routeChatCompletion(request);
      trace('openai.route', {
        model: request.model,
        provider: provider.name,
        status: response.status,
      });
      const contentType = response.headers.get('content-type') ?? 'application/json';
      res.setHeader('Content-Type', contentType);
      res.setHeader('X-Freeway-Provider', provider.name);

      if (request.stream) {
        sendStream(res, response.status);
        let completionBuffer = '';
        let streamUsage: Record<string, number> | null = null;
        if (response.body) {
          const reader = response.body.getReader();
          const decoder = new TextDecoder();
          let sseBuffer = '';
          try {
            while (true) {
              const { done, value } = await reader.read();
              if (done) break;
              res.write(value);
              sseBuffer += decoder.decode(value, { stream: true });
              const lines = sseBuffer.split('\n');
              sseBuffer = lines.pop() ?? '';
              for (const line of lines) {
                if (line.startsWith('data: ')) {
                  const json = line.slice(6);
                  if (json === '[DONE]') continue;
                  try {
                    const parsed = JSON.parse(json) as Record<string, unknown>;
                    const delta = ((parsed.choices as Array<Record<string, unknown>> | undefined)?.[0]?.delta as Record<string, unknown> | undefined)?.content;
                    if (typeof delta === 'string') completionBuffer += delta;
                    const usage = (parsed.usage as Record<string, number> | undefined);
                    if (usage) streamUsage = usage;
                  } catch {
                    // skip malformed
                  }
                }
              }
            }
            if (sseBuffer.trim().startsWith('data: ')) {
              const json = sseBuffer.trim().slice(6);
              if (json && json !== '[DONE]') {
                try {
                  const parsed = JSON.parse(json) as Record<string, unknown>;
                  const delta = ((parsed.choices as Array<Record<string, unknown>> | undefined)?.[0]?.delta as Record<string, unknown> | undefined)?.content;
                  if (typeof delta === 'string') completionBuffer += delta;
                  const usage = (parsed.usage as Record<string, number> | undefined);
                  if (usage) streamUsage = usage;
                } catch {
                  // skip malformed
                }
              }
            }
          } finally {
            reader.releaseLock();
          }
        }
        if (streamUsage) {
          usageTracker.record(request.model, provider.name, streamUsage.prompt_tokens ?? 0, streamUsage.completion_tokens ?? 0);
        } else if (completionBuffer) {
          const promptText = JSON.stringify(request.messages ?? []);
          const est = estimateUsage({ promptText, completionText: completionBuffer });
          usageTracker.record(request.model, provider.name, est.prompt_tokens, est.completion_tokens);
        }
        res.end();
      } else {
        const rawBody = await response.text();
        const parsedBody = JSON.parse(rawBody) as Record<string, unknown>;
        const completionText = String(
          ((parsedBody.choices as Array<Record<string, unknown>> | undefined)?.[0]?.message as Record<string, unknown> | undefined)?.content ?? ''
        );
        const promptText = JSON.stringify(request.messages ?? []);
        const normalizedBody = normalizeOpenAIResponseUsage(parsedBody, promptText, completionText);
        const usage = (normalizedBody.usage as Record<string, number> | undefined);
        if (usage) {
          usageTracker.record(request.model, provider.name, usage.prompt_tokens ?? 0, usage.completion_tokens ?? 0);
        }
        const body = JSON.stringify(normalizedBody);
        res.setHeader('Content-Length', Buffer.byteLength(body));
        res.writeHead(response.status);
        res.end(body);
      }
      return;
    }

    /* ── Anthropic-compatible endpoint ── */

    if (pathname === '/v1/messages' && (req.method === 'HEAD' || req.method === 'OPTIONS')) {
      if (!checkGatewayAuth(req, res)) return;
      sendNoContent(res, 'POST, HEAD, OPTIONS');
      return;
    }

    if (pathname === '/v1/messages/count_tokens' && (req.method === 'HEAD' || req.method === 'OPTIONS')) {
      if (!checkGatewayAuth(req, res)) return;
      sendNoContent(res, 'POST, HEAD, OPTIONS');
      return;
    }

    if (pathname === '/v1/messages/count_tokens' && req.method === 'POST') {
      if (!checkGatewayAuth(req, res)) return;
      const raw = await readBody(req);
      const payload = JSON.parse(raw) as Record<string, unknown>;
      const result = estimateAnthropicCountTokens({
        messages: payload.messages,
        system: payload.system,
        tools: payload.tools,
      });
      sendJSON(res, 200, result);
      return;
    }

    if (pathname === '/v1/messages' && req.method === 'POST') {
      if (!checkGatewayAuth(req, res)) return;
      const raw = await readBody(req);
      const anthropicReq = JSON.parse(raw) as AnthropicRequest;

      trace('anthropic.request', {
        model: anthropicReq.model ?? null,
        stream: !!anthropicReq.stream,
        hasTools: Array.isArray(anthropicReq.tools) && anthropicReq.tools.length > 0,
      });

      if (!anthropicReq.model) {
        sendJSON(res, 400, { error: { message: 'Missing "model" field', type: 'invalid_request_error' } });
        return;
      }

      const openAIReq = fromAnthropicRequest(anthropicReq);
      trace('anthropic.bridge', {
        inputModel: anthropicReq.model,
        bridgedModel: openAIReq.model,
      });

      try {
        const { response, provider } = await routeChatCompletion(openAIReq);
        trace('anthropic.route', {
          model: openAIReq.model,
          provider: provider.name,
          status: response.status,
        });

        if (anthropicReq.stream) {
          res.setHeader('Content-Type', 'text/event-stream');
          res.setHeader('Cache-Control', 'no-cache');
          res.setHeader('Connection', 'keep-alive');
          res.setHeader('X-Freeway-Provider', provider.name);
          res.writeHead(200);

          res.write(anthropicStreamStart(anthropicReq.model));
          const streamTransformer = createAnthropicStreamTransformer();
          let completionBuffer = '';

          if (response.body) {
            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let buffer = '';

            try {
              while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                buffer += decoder.decode(value, { stream: true });
                const segments = buffer.split('\n\n');
                buffer = segments.pop() ?? '';

                for (const segment of segments) {
                  const line = segment
                    .split('\n')
                    .map(l => l.trim())
                    .find(l => l.startsWith('data: '));
                  if (!line) continue;

                  const json = line.slice(6);
                  if (json === '[DONE]') continue;

                  try {
                    const parsed = JSON.parse(json) as Record<string, unknown>;
                    const delta = ((parsed.choices as Array<Record<string, unknown>> | undefined)?.[0]?.delta as Record<string, unknown> | undefined)?.content;
                    if (typeof delta === 'string') completionBuffer += delta;
                    const transformed = streamTransformer.transform(parsed);
                    if (transformed) res.write(transformed);
                  } catch {
                    // skip malformed
                  }
                }
              }

              if (buffer.trim().startsWith('data: ')) {
                const json = buffer.trim().slice(6);
                if (json && json !== '[DONE]') {
                  try {
                    const parsed = JSON.parse(json) as Record<string, unknown>;
                    const delta = ((parsed.choices as Array<Record<string, unknown>> | undefined)?.[0]?.delta as Record<string, unknown> | undefined)?.content;
                    if (typeof delta === 'string') completionBuffer += delta;
                    const transformed = streamTransformer.transform(parsed);
                    if (transformed) res.write(transformed);
                  } catch {
                    // skip malformed
                  }
                }
              }
            } finally {
              reader.releaseLock();
            }
          }

          res.write(streamTransformer.end());
          if (completionBuffer) {
            const promptText = JSON.stringify(openAIReq.messages ?? []);
            const est = estimateUsage({ promptText, completionText: completionBuffer });
            usageTracker.record(openAIReq.model, provider.name, est.prompt_tokens, est.completion_tokens);
          }
          res.end();
        } else {
          const openAIBody = (await response.json()) as Record<string, unknown>;
          const anthropicRes = toAnthropicResponse(openAIBody, anthropicReq.model);
          const u = (anthropicRes.usage as Record<string, number> | undefined);
          if (u) {
            usageTracker.record(openAIReq.model, provider.name, u.input_tokens ?? 0, u.output_tokens ?? 0);
          }
          const body = JSON.stringify(anthropicRes);
          res.setHeader('Content-Type', 'application/json');
          res.setHeader('X-Freeway-Provider', provider.name);
          res.setHeader('Content-Length', Buffer.byteLength(body));
          res.writeHead(response.status);
          res.end(body);
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Internal server error';
        sendJSON(res, 500, { error: { message, type: 'internal_error' } });
      }
      return;
    }

    if (pathname === '/health' && req.method === 'GET') {
      sendJSON(res, 200, { status: 'ok' });
      return;
    }

    sendJSON(res, 404, { error: { message: 'Not found', type: 'invalid_request_error' } });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    sendJSON(res, 500, { error: { message, type: 'internal_error' } });
  }
});

export async function startServer() {
  await initializePersistedApiKeys(allowedEnvVars);
  await usageTracker.init();

  // Load cached model lists so we have something at boot
  await loadAllModelCaches();

  // Refresh all providers in the background without blocking startup
  refreshAllProviderModels().then((result) => {
    console.log(`[Sync] Refreshed: ${result.refreshed.join(', ')}`);
    if (result.failed.length) {
      console.warn(`[Sync] Failed: ${result.failed.join(', ')}`);
    }
  }).catch((err) => {
    console.error('[Sync] Background refresh failed:', err instanceof Error ? err.message : String(err));
  });

  server.listen(PORT, () => {
    console.log(`Freeway running on http://localhost:${PORT}`);
    console.log(`  GET  /`);
    console.log(`  GET  /api/catalog`);
    console.log(`  GET  /api/usage`);
    console.log(`  POST /api/health/check/:provider`);
    console.log(`  POST /api/health/check-all`);
    console.log(`  POST /api/config/keys`);
    console.log(`  POST /api/models/refresh`);
    console.log(`  POST /v1/chat/completions`);
    console.log(`  GET  /v1/models`);
    console.log(`  POST /v1/messages`);
    console.log(`  GET  /health`);
  });
}
