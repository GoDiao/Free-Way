## Claude Code 设置指南

按照以下步骤将 Claude Code 与 Freeway 连接。

### 1. 设置环境变量

```bash
export ANTHROPIC_BASE_URL=http://localhost:8787
export ANTHROPIC_API_KEY=your_freeway_api_key
```

在 Windows (PowerShell) 上：

```powershell
$env:ANTHROPIC_BASE_URL="http://localhost:8787"
$env:ANTHROPIC_API_KEY="your_freeway_api_key" or "any non-empty string"
```

---

### 2. 运行 Claude Code

设置环境变量后启动 Claude Code。

---

### 3. 验证设置

运行一个简单的测试提示，并确认响应通过 Freeway 路由。

---

### 4. 注意事项

* Freeway 自动将请求路由到最佳可用的免费提供商。
* 在测试前确保 Freeway 服务器正在运行。