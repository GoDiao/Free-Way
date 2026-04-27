## Claude Code Setup Guide

Follow these steps to connect Claude Code with Freeway.

### 1. Set Environment Variables

```bash
export ANTHROPIC_BASE_URL=http://localhost:8787
export ANTHROPIC_API_KEY=your_freeway_api_key
```

On Windows (PowerShell):

```powershell
$env:ANTHROPIC_BASE_URL="http://localhost:8787"
$env:ANTHROPIC_API_KEY="your_freeway_api_key" or "any non-empty string"
```

---

### 2. Run Claude Code

Start Claude Code after setting environment variables.

---

### 3. Verify Setup

Run a simple test prompt and confirm that responses are routed through Freeway.

---

### 4. Notes

* Freeway automatically routes requests to the best available free provider.
* Ensure Freeway server is running before testing.