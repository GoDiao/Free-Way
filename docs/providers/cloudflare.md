# Cloudflare Workers AI

## Prerequisites

- A [Cloudflare](https://www.cloudflare.com/) account
- At least one Workers AI model enabled in your Cloudflare dashboard

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `CLOUDFLARE_API_KEY` | Yes | Cloudflare API key with Workers AI read access |
| `CLOUDFLARE_ACCOUNT_ID` | Yes | Your Cloudflare account ID (required for model sync) |

## Getting Your Credentials

### `CLOUDFLARE_ACCOUNT_ID`

1. Log in to the [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. In the right sidebar, find your **Account ID** (a 32-character hex string)
3. Copy this value

### `CLOUDFLARE_API_KEY`

1. In the Cloudflare Dashboard, go to **My Profile** → **API Tokens**
2. Click **Create Token**
3. Use the **"Read"** template or create a custom token with `Workers AI` read permission
4. Copy the generated token

## Configuration

### Environment Variables

```bash
export CLOUDFLARE_API_KEY="your-api-key-here"
export CLOUDFLARE_ACCOUNT_ID="your-account-id-here"
```

### Web UI

1. Start Freeway: `npm run dev`
2. Open the web console (default: `http://localhost:3000`)
3. Go to the **API Keys** tab
4. Enter your `CLOUDFLARE_API_KEY` and `CLOUDFLARE_ACCOUNT_ID`
5. Click **Save**

## Available Models

Cloudflare Workers AI models are synced automatically when both environment variables are set. Common models include:

- `@cf/meta/llama-3.1-8b-instruct`
- `@cf/meta/llama-2-7b-chat-int8`
- `@cf/mistral/mistral-7b-instruct-v0.1`
- `@cf/google/gemma-7b-it`

To refresh the model catalog:

```bash
curl -X POST http://localhost:3000/api/models/refresh
```

## Troubleshooting

### "model sync failed" or empty model list

- Verify both `CLOUDFLARE_API_KEY` and `CLOUDFLARE_ACCOUNT_ID` are set
- Check that your API token has Workers AI read access
- Run a health check: `curl -X POST http://localhost:3000/api/health/check/cloudflare`

### "account_id required" error

Cloudflare Workers AI requires both the API key AND the account ID. The account ID is needed for the model discovery endpoint. Make sure `CLOUDFLARE_ACCOUNT_ID` is set in addition to `CLOUDFLARE_API_KEY`.
