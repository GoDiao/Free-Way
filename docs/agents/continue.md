# Continue.dev Setup Guide

Follow these steps to connect Continue.dev to Free-Way through the OpenAI-compatible endpoint.

## 1. Confirm the Free-Way endpoint

OpenAI-compatible clients should use:

```text
http://localhost:8787/v1
```

Anthropic-compatible clients should use `http://localhost:8787` without `/v1`.

## 2. Add a model to Continue

Add this entry to your Continue `config.json`:

```json
{
  "models": [
    {
      "title": "Free-Way",
      "provider": "openai",
      "model": "llama-3.3-70b",
      "apiBase": "http://localhost:8787/v1",
      "apiKey": "your FREEWAY_API_KEY"
    }
  ]
}
```

Use a model ID that appears in your local Free-Way model catalog. If gateway auth is disabled, the API key can be any non-empty placeholder value.

## 3. Verify the connection

Run a simple chat request from Continue, then check Free-Way's **Usage** tab to confirm the request reached your local gateway.

## Troubleshooting

| Problem | Check |
| --- | --- |
| Connection refused | Free-Way is running on `localhost:8787` |
| Model not found | The configured model exists in the Free-Way model catalog |
| Unauthorized | `FREEWAY_API_KEY` matches the gateway key configured in Free-Way |
| Requests do not appear in Usage | Continue is using this model entry and `apiBase` includes `/v1` |
