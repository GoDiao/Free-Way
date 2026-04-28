## OpenClaw Setup Guide

Follow these steps to connect OpenClaw to Freeway.

### 1. Configure the OpenAI-compatible endpoint

Set OpenClaw to use Freeway's OpenAI-compatible endpoint:

- Base URL: `http://localhost:8787/v1`
- API key: your `FREEWAY_API_KEY`

Depending on your setup, this can be provided through environment variables or the active OpenClaw config.

Example environment variables:

```bash
export OPENAI_BASE_URL=http://localhost:8787/v1
export OPENAI_API_KEY=<your FREEWAY_API_KEY>
```

### 2. Choose a model

Pick any model ID currently exposed by Freeway's model catalog.

### 3. Verify setup

Send a short test prompt from OpenClaw, then confirm the request shows up in Freeway's **Usage** tab.
