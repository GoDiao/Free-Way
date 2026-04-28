## OpenCode Setup Guide

Follow these steps to connect OpenCode to Freeway.

### 1. Set environment variables

```bash
export OPENAI_BASE_URL=http://localhost:8787/v1
export OPENAI_API_KEY=<your FREEWAY_API_KEY>
```

### 2. Start OpenCode normally

OpenCode will use the configured OpenAI-compatible endpoint and forward requests through Freeway.

### 3. Pick a model

Use any Freeway model ID that is currently available in the local model catalog. Good starting options are the fast models marked healthy in the Freeway console.

### 4. Verify setup

Run a simple prompt in OpenCode, then check Freeway's **Usage** tab to verify the request was recorded.
