# Cline / Roo Code Setup Guide

Follow these steps to connect Cline or Roo Code to Free-Way through the OpenAI-compatible endpoint.

## 1. Choose an OpenAI-compatible provider mode

In Cline or Roo Code, choose the OpenAI-compatible provider option and set:

```text
Base URL: http://localhost:8787/v1
API key: your FREEWAY_API_KEY
Model: llama-3.3-70b
```

Use a model ID that appears in your local Free-Way model catalog. If Free-Way gateway auth is disabled, the API key can be any non-empty placeholder value.

## 2. Keep the path shape exact

Use `http://localhost:8787/v1` for OpenAI-compatible clients.

Do not use `http://localhost:8787` in OpenAI-compatible provider mode, because the client will usually append `/chat/completions` or `/models` under `/v1`.

## 3. Verify the connection

Send a small prompt from Cline or Roo Code, then check Free-Way's **Usage** tab to confirm the request reached your local gateway.

## Troubleshooting

| Problem | Check |
| --- | --- |
| 404 or route not found | The base URL includes `/v1` |
| Model not found | The model ID exists in Free-Way's model catalog |
| Unauthorized | `FREEWAY_API_KEY` matches the gateway key configured in Free-Way |
| No request in Usage | The selected provider mode is OpenAI-compatible and points to localhost |
