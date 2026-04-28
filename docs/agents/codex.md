## Codex CLI Setup Guide

Follow these steps to connect Codex CLI to Freeway.

### 1. Set environment variables

```bash
export OPENAI_BASE_URL=http://localhost:8787/v1
export OPENAI_API_KEY=<your FREEWAY_API_KEY>
```

### 2. Choose a model

Codex CLI uses OpenAI-style model IDs, so point it at any model ID exposed by Freeway. For example:

```bash
export OPENAI_MODEL=llama-3.3-70b
```

If you prefer, you can also select the model in Codex CLI's own config flow, as long as the model name matches a Freeway catalog entry.

### 3. Verify setup

Run a simple Codex CLI request and confirm the request appears in Freeway's **Usage** tab or request logs.
