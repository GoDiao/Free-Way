## Claude Code Setup Guide

Follow these steps to connect Claude Code with Free-Way.

### 1. Set Environment Variables

```bash
export ANTHROPIC_BASE_URL=http://localhost:8787
export ANTHROPIC_API_KEY=your_freeway_api_key
```

The `ANTHROPIC_API_KEY` can be any non-empty string if Free-Way's gateway auth is disabled. To set a custom gateway key, go to the **Free-Way console → API Keys tab** and enter your desired `FREEWAY_API_KEY` — then use that same value here.

On Windows (PowerShell):

```powershell
$env:ANTHROPIC_BASE_URL="http://localhost:8787"
$env:ANTHROPIC_API_KEY="your_freeway_api_key"
```

---

### 2. Run Claude Code

Start Claude Code after setting environment variables.

---

### 3. Verify Setup

Run a simple test prompt and confirm that responses are routed through Free-Way.

---

### 4. Notes

* Free-Way automatically routes requests to the best available free provider.
* Ensure Free-Way server is running before testing.
