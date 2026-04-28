## Cline Setup Guide

Follow these steps to connect the Cline VS Code extension to Freeway.

### 1. Open Cline provider settings

In VS Code, open Cline settings and switch it to an OpenAI-compatible provider.

### 2. Fill in the connection values

Use these values in the provider form:

- Base URL: `http://localhost:8787/v1`
- API key: your `FREEWAY_API_KEY`
- Model: any Freeway model ID from the model catalog

Recommended starter models:

- `llama-3.3-70b`
- `gpt-4.1-mini` if your catalog exposes it
- any fast free model currently marked healthy in the Freeway console

### 3. Verify setup

Ask Cline for a short response, then check the Freeway web console **Usage** tab to confirm the request was recorded.
