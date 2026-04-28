<p align="center">
  <img src="Assets/Head.png" alt="Freeway header" width="960" />
</p>

<h1 align="center">Freeway</h1>

<p align="center">
  <strong>A local control plane for free LLM APIs.</strong>
</p>

<p align="center">
  Freeway is an open-source gateway that aggregates the fast-moving free LLM ecosystem behind a unified local API surface. Bring your own keys — Freeway normalizes OpenAI/Anthropic protocols, routes requests, and falls back across providers. All from localhost.
</p>

<p align="center">
  <a href="./README.zh-CN.md">简体中文</a> ·
  <a href="./CONTRIBUTING.md">Contributing (EN)</a> ·
  <a href="./contribution.md">贡献指南 (中文)</a>
</p>

## Mission

Freeway is a local control plane for free LLM APIs. It normalizes protocol differences, resolves models, checks route availability, and falls back when a provider fails — all from localhost.

The goal is not to wrap one provider. The goal is to offer one gateway layer that can keep absorbing the providers, models, and compatibility quirks that matter across the free-model ecosystem.

## Why this exists

The free-model ecosystem is expanding quickly, but the developer experience is still fragmented:

- provider APIs differ in behavior and response shape
- model availability changes quickly
- free tiers appear, move, rate-limit, or disappear
- clients and coding agents still want one predictable local endpoint

Freeway compresses that fragmentation into a single local gateway that is easier to operate, easier to integrate, and easier to extend.

## What Freeway provides

- **Protocol normalization** — OpenAI and Anthropic compatible endpoints from one server
- **Fallback routing** — when a provider is rate-limited or unavailable, Freeway tries another
- **Model discovery** — fetch available models from supported providers and keep a unified free-tier catalog updated
- **Runtime API key management** — configure provider keys through the web UI or REST API, no restart required
- **Health checks** — monitor provider availability and latency from the console
- **Local web console** — browse providers and models, check health, configure keys, test requests
- **Works with Claude Code, Cursor, Continue.dev, OpenCode, and any OpenAI/Anthropic-compatible client**

## Coverage philosophy

Freeway is not positioned as a thin wrapper for one API vendor.

It is an aggregation layer designed to keep up with the free LLM landscape over time. That means tracking useful providers, normalizing compatibility gaps, and making the resulting surface more stable for local tools, scripts, and agent workflows.

The ambition is broad coverage. The implementation stays pragmatic: integrate what matters, keep the gateway reliable, and improve compatibility as the ecosystem shifts.

## Ecosystem references

Freeway tracks the broader free-model ecosystem through public resource collections, including:

- [awesome-free-llm-apis](https://github.com/mnfst/awesome-free-llm-apis)
- [free-llm-api-resources](https://github.com/cheahjs/free-llm-api-resources)

These are ecosystem references, not hard dependencies. They help guide ongoing provider coverage and compatibility work.

## Current capabilities

### Compatibility layer

- OpenAI-compatible chat completions
- OpenAI-compatible model listing
- Anthropic-compatible messages API bridging
- Stable non-stream usage normalization across OpenAI-compatible and Anthropic-compatible responses
- Conservative Anthropic streaming behavior without fake zero-usage placeholders

### Gateway operations

- Provider health checks and status summaries
- Model catalog refresh and cache fallback
- Local runtime key management
- Optional gateway auth with `FREEWAY_API_KEY`
- Optional outbound proxy support with `HTTP_PROXY`

### Local console

- Browse providers and models
- Check provider health and latency
- Configure provider keys
- Refresh model catalogs
- Test local requests from the browser

## Supported Providers

Currently wired through `src/providers/index.ts`:

`openrouter`, `groq`, `github`, `cloudflare`, `siliconflow`, `cerebras`, `mistral`, `cohere`, `nvidia`, `llm7`, `kilo`, `zhipu`, `opencode`

## Quick Start

### 1. Prerequisites

- Node.js 18+
- npm

### 2. Install and launch

```bash
npm install
npm run build
npm start
```

Default server address:

- `http://localhost:8787`

### 3. Open the console

Visit:

- `http://localhost:8787/`

Then configure provider keys in the **API Keys** tab, or provide them with environment variables.

## Configuration

## Configure your agent

Freeway exposes **both** OpenAI and Anthropic compatible endpoints, so most coding agents and LLM clients can connect directly.

> Detailed per-agent setup guides are available in [`docs/agents/`](./docs/agents/).

- [OpenCode setup guide](./docs/agents/opencode.md)

### Claude Code

Set the base URL to Freeway:

```bash
export ANTHROPIC_BASE_URL=http://localhost:8787
export ANTHROPIC_API_KEY=<your FREEWAY_API_KEY or any non-empty string>
```

Then run `claude` normally. Freeway routes Claude Code's Anthropic API calls to the best available free provider.

### Cursor

In Cursor Settings → Models → OpenAI API Key:
- Base URL: `http://localhost:8787/v1`
- API Key: your `FREEWAY_API_KEY` (or leave empty if gateway auth is off)

### Continue.dev

In `config.json`:

```json
{
  "models": [
    {
      "title": "Freeway",
      "provider": "openai",
      "model": "llama-3.3-70b",
      "apiBase": "http://localhost:8787/v1",
      "apiKey": "your FREEWAY_API_KEY"
    }
  ]
}
```

### OpenCode

Set environment variables before running:

```bash
export OPENAI_BASE_URL=http://localhost:8787/v1
export OPENAI_API_KEY=<your FREEWAY_API_KEY>
```

### Any other OpenAI/Anthropic client

Point the base URL to `http://localhost:8787` (Anthropic) or `http://localhost:8787/v1` (OpenAI) and provide your gateway key if configured.

### API key precedence

Effective key precedence is:

1. Runtime key set via UI/API
2. Environment variable
3. Persisted `.freeway/config.json`

### Common environment variables

| Variable | Purpose |
|---|---|
| `FREEWAY_API_KEY` | Optional gateway auth key for clients calling Freeway |
| `OPENROUTER_API_KEY` | OpenRouter key |
| `GROQ_API_KEY` | Groq key |
| `GITHUB_TOKEN` | GitHub Models token |
| `CLOUDFLARE_API_KEY` | Cloudflare API key |
| `CLOUDFLARE_ACCOUNT_ID` | Required for Cloudflare model sync |
| `SILICONFLOW_API_KEY` | SiliconFlow key |
| `CEREBRAS_API_KEY` | Cerebras key |
| `MISTRAL_API_KEY` | Mistral key |
| `COHERE_API_KEY` | Cohere key |
| `NVIDIA_API_KEY` | NVIDIA NIM key |
| `LLM7_API_KEY` | LLM7 key |
| `KILO_API_KEY` | Kilo key |
| `ZHIPU_API_KEY` | Zhipu / BigModel key |
| `OPENCODE_API_KEY` | OpenCode key |
| `HTTP_PROXY` | Optional global HTTP proxy for outbound provider calls |

## API Examples

### OpenAI-compatible chat completion

```bash
curl http://localhost:8787/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $FREEWAY_API_KEY" \
  -d '{
    "model": "llama-3.3-70b",
    "messages": [{"role": "user", "content": "Say hello from Freeway"}],
    "stream": false
  }'
```

### Force a provider explicitly

```json
{
  "model": "groq/llama-3.3-70b"
}
```

### Anthropic-compatible messages request

```bash
curl http://localhost:8787/v1/messages \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $FREEWAY_API_KEY" \
  -d '{
    "model": "llama-3.3-70b",
    "max_tokens": 256,
    "messages": [{"role": "user", "content": "Hello"}]
  }'
```

### Claude-style local base URL usage

For Anthropic-compatible clients that let you override the base URL, point them at:

- `http://localhost:8787`

Freeway serves the compatibility routes under that origin.

## HTTP Endpoints

| Method | Path | Description |
|---|---|---|
| `GET` | `/` | Web console |
| `GET` | `/health` | Service health |
| `GET` | `/api/catalog` | Provider / model / health summary |
| `POST` | `/api/health/check/:provider` | Check one provider |
| `POST` | `/api/health/check-all` | Check all providers |
| `POST` | `/api/models/refresh` | Refresh provider model lists |
| `POST` | `/api/config/keys` | Save runtime / persisted keys |
| `GET` | `/v1/models` | OpenAI-compatible models list |
| `POST` | `/v1/chat/completions` | OpenAI-compatible chat completions |
| `POST` | `/v1/messages` | Anthropic-compatible messages |

## Project Structure

```text
src/
  index.ts                # Entry point
  server.ts               # HTTP server + routes + static hosting
  router.ts               # Provider routing and retry logic
  providers/              # Provider definitions and model sync orchestration
  models/                 # Canonical model registry + sync/cache adapters
  web/                    # Console UI (HTML/CSS/JS)
  config*.ts              # Runtime + persisted key config
  health.ts               # Provider health checks and summary
  anthropic-bridge.ts     # Anthropic <-> OpenAI request/response bridge
  usage.ts                # Gateway-level usage normalization helpers
```

## Development

```bash
npm run dev
npm run build
npm start
npm run test:usage
```

## Contributing

- English: [CONTRIBUTING.md](./CONTRIBUTING.md)
- 中文： [contribution.md](./contribution.md)

## License

MIT
