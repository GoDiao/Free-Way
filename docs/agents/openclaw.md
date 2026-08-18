# OpenClaw Setup Guide

## What is OpenClaw?

[OpenClaw](https://github.com/openclaw/openclaw) is an open-source AI agent gateway that manages multiple AI models, plugins, and agent workflows. It supports OpenAI-compatible APIs, custom base URLs, and extensible plugin architecture.

## Integration with Free-Way

### 1. Configuration

Set the following environment variables in your OpenClaw config:

```yaml
# config.yaml
plugins:
  free-way:
    baseUrl: "http://localhost:8787/v1"
    apiKey: "FREEWAY_API_KEY"
```

Or via environment:

```bash
export FREEWAY_BASE_URL=http://localhost:8787/v1
export FREEWAY_API_KEY=FREEWAY_API_KEY
```

### 2. Verification

Check the integration is working:

```bash
curl -X POST http://localhost:8787/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer FREEWAY_API_KEY" \
  -d '{
    "model": "gpt-4",
    "messages": [{"role": "user", "content": "Hello"}]
  }'
```

Expected: `200 OK` with a valid chat completion response.

### 3. Usage

Once configured, OpenClaw routes requests through Free-Way's API endpoint. All OpenClaw plugins and agents automatically inherit the connection through the base URL configuration.

## Troubleshooting

- **Connection refused**: Ensure Free-Way is running on port 8787
- **401 Unauthorized**: Verify `FREEWAY_API_KEY` is correct
- **Timeout**: Check network connectivity between OpenClaw and Free-Way
