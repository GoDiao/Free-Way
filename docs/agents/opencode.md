## OpenCode Setup Guide

Follow these steps to connect OpenCode to Free-Way.

### 1. Set environment variables

```bash
export OPENAI_BASE_URL=http://localhost:8787/v1
export OPENAI_API_KEY=<your FREEWAY_API_KEY>
```

### 2. Start OpenCode normally

OpenCode will use the configured OpenAI-compatible endpoint and forward requests through Free-Way.

### 3. Pick a model

Use any Free-Way model ID that is currently available in the local model catalog. Good starting options are the fast models marked healthy in the Free-Way console.

### 4. Verify setup

Run a simple prompt in OpenCode, then check Free-Way's **Usage** tab to verify the request was recorded.
