# OpenRouter Provider Setup

## Getting an OpenRouter API Key

Create an account on OpenRouter and generate an API key from the dashboard.

Do not share your API key publicly.

---

## Linux/macOS Setup

```bash
export OPENROUTER_API_KEY="your_api_key_here"
```

---

## Windows PowerShell Setup

```powershell
$env:OPENROUTER_API_KEY="your_api_key_here"
```

---

## Verify Configuration

### Check available models

```bash
curl http://localhost:8787/v1/models \
  -H "Authorization: Bearer YOUR_FREEWAY_API_KEY"
```

---

## Chat Completion Example

```bash
curl http://localhost:8787/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_FREEWAY_API_KEY" \
  -d '{
    "model": "openrouter/deepseek-r1",
    "messages": [
      {
        "role": "user",
        "content": "Hello from OpenRouter"
      }
    ]
  }'
```

---

## Model ID Examples

Canonical model ID:

```text
deepseek-r1
```

Provider-prefixed model ID:

```text
openrouter/deepseek-r1
```

---

Use placeholder values in examples and never expose real API keys.
