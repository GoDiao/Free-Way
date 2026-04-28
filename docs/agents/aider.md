## Aider Setup Guide

Follow these steps to connect Aider to Freeway.

### 1. Start Freeway

Make sure Freeway is running locally at `http://localhost:8787`.

### 2. Point Aider at Freeway

You can either pass flags directly:

```bash
aider --openai-api-base http://localhost:8787/v1 \
  --openai-api-key "$FREEWAY_API_KEY" \
  --model llama-3.3-70b
```

Or export the same values before running Aider:

```bash
export OPENAI_API_BASE=http://localhost:8787/v1
export OPENAI_API_KEY=<your FREEWAY_API_KEY>
aider --model llama-3.3-70b
```

### 3. Pick a model

Use any Freeway model ID that appears in the local model catalog. A good starting point is `llama-3.3-70b`, then switch to another available model if you prefer.

### 4. Verify setup

Run a simple prompt in Aider, then open Freeway's **Usage** tab or request logs to confirm the call was routed through the gateway.
