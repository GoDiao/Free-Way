<h1 align="center">Free-Way</h1>

<p align="center">
  <strong>把你已有 Key 的免费 LLM API，收敛到一个 localhost 网关。</strong>
</p>

<p align="center">
  <strong>Star us&nbsp;→</strong>
  <a href="https://github.com/GoDiao/Free-Way" title="Star Free-Way on GitHub">
    <img src="https://img.shields.io/github/stars/GoDiao/Free-Way?style=for-the-badge&logo=github&label=Star&color=4ade80&labelColor=0b0f0d" alt="Star Free-Way on GitHub" height="28" align="absmiddle" />
  </a>
  &nbsp;·&nbsp;
  <a href="https://godiao.github.io/Free-Way/" title="打开 Free-Way 项目页面">
    <img src="https://img.shields.io/badge/Homepage-Free--Way-4ade80?style=for-the-badge&labelColor=0b0f0d" alt="Free-Way 项目页面" height="28" align="absmiddle" />
  </a>
  &nbsp;·&nbsp;
  <a href="./docs/agents/" title="阅读 Free-Way Agent 配置指南">
    <img src="https://img.shields.io/badge/Agent%20Guides-Docs-60a5fa?style=for-the-badge&labelColor=0b0f0d" alt="Free-Way Agent 配置指南" height="28" align="absmiddle" />
  </a>
  &nbsp;·&nbsp;
  <a href="./LICENSE" title="Free-Way 使用 MIT 许可证">
    <img src="https://img.shields.io/badge/License-MIT-f0a500?style=for-the-badge&labelColor=0b0f0d" alt="MIT License" height="28" align="absmiddle" />
  </a>
</p>

<p align="center">
  自备 Provider Key。Free-Way 暴露 OpenAI / Anthropic 兼容接口，
  负责模型发现、请求路由和兼容 Provider 间的自动回退。
  你的工具只需要一个 base URL：<code>http://localhost:8787</code>。
</p>

<p align="center">
  <a href="./README.md">English</a>
  ·
  <a href="./CONTRIBUTING.md">Contributing</a>
  ·
  <a href="./contribution.md">中文贡献指南</a>
</p>

## 为什么值得 Star

- **一个本地入口接入 AI 工具**：Claude Code、Cursor、Continue.dev、OpenCode 或任何兼容客户端，都可以指向同一个网关
- **BYOK，本地优先**：Free-Way 不托管代理、不共享 Key 池、不售卖 API 访问；Provider Key 留在你的机器上
- **同时兼容 OpenAI 和 Anthropic**：支持 `/v1/chat/completions`、`/v1/models` 和 `/v1/messages`
- **自动回退路由**：某个兼容 Provider 限流或不可用时，可以尝试其他可用路由
- **自带本地控制台**：在浏览器里配置 Key、浏览模型、刷新目录、检查健康状态、测试请求

> Free-Way 不提供免费 API 访问。它帮你把自己已有的免费额度或 Provider Key，统一管理成一个本地 API 面。

## 快速开始

### 1. 安装并启动

```bash
git clone https://github.com/GoDiao/Free-Way.git
cd Free-Way
npm install
npm run build
npm start
```

默认服务地址：

- `http://localhost:8787`

### 2. 配置 Provider Key

打开本地控制台：

- `http://localhost:8787/`

然后在 **API Keys** 页面配置 Provider Key，或直接通过环境变量提供。

### 3. 把你的 Agent 指向 Free-Way

- OpenAI 兼容客户端：`http://localhost:8787/v1`
- Anthropic 兼容客户端：`http://localhost:8787`

各 Agent 的详细配置指南请参考 [`docs/agents/`](./docs/agents/) 目录。

## 已支持 Provider

当前在 `src/providers/index.ts` 中接入：

`openrouter`、`groq`、`github`、`cloudflare`、`siliconflow`、`cerebras`、`mistral`、`cohere`、`nvidia`、`llm7`、`kilo`、`zhipu`、`opencode`、`zenmux`

## 项目使命

Free-Way 是一个面向免费 LLM API 的本地控制平面。它归一化协议差异、解析模型、检查路由可用性，并在 Provider 失败时自动回退 — 一切都在 localhost。

目标不是只包一层单一 Provider，而是提供一个网关层，持续吸收真正重要的 Provider、模型能力和兼容性差异，把这些差异收敛成更稳定的本地调用入口。

## 为什么要做 Free-Way

免费模型生态增长很快，但开发体验依然高度碎片化：

- 不同 Provider 的接口行为和返回结构不一致
- 模型可用性变化很快
- 免费额度、访问限制和稳定性不断变化
- 脚本、Agent 和本地工具依然希望只有一个可靠的 base URL

Free-Way 把这种碎片化压缩进一个更易接入、更易运维、也更易扩展的本地网关。

## Free-Way 提供什么

- **协议归一化** — 同一服务同时暴露 OpenAI 与 Anthropic 兼容接口
- **回退路由** — Provider 限流或不可用时，自动尝试其他兼容 Provider
- **模型发现** — 从支持的 Provider 拉取可用模型，维护统一的免费模型目录
- **运行时 Key 管理** — 通过 Web UI 或 REST API 配置密钥，无需重启
- **健康检查** — 从控制台监控 Provider 可用性和延迟
- **本地 Web 控制台** — 浏览 Provider 和模型、检查健康、配置密钥、测试请求
- **支持 Claude Code、Cursor、Continue.dev、OpenCode 等任何 OpenAI/Anthropic 兼容客户端**

## Coverage 理念

Free-Way 不把自己定位成某一个 API Vendor 的薄包装。

它是一个聚合层，目标是持续跟上免费 LLM 生态的变化：追踪有价值的 Provider，抹平兼容性差异，并把最终暴露给本地工具、脚本和 Agent 的接口做得更稳定。

目标是更广覆盖，实现策略保持务实：优先接入真正重要的免费 API，优先解决真实兼容问题，优先让网关在不断变化的生态里保持可用。

## 生态信息源

Free-Way 会持续参考公开的免费模型生态资源，包括：

- [awesome-free-llm-apis](https://github.com/mnfst/awesome-free-llm-apis)
- [free-llm-api-resources](https://github.com/cheahjs/free-llm-api-resources)

这些是生态参考信息源，不是项目依赖。它们帮助 Free-Way 持续判断应该跟踪哪些 Provider、模型和兼容性方向。

## 当前能力

### 兼容层

- OpenAI 兼容 chat completions
- OpenAI 兼容 models 列表
- Anthropic Messages API 桥接
- OpenAI / Anthropic 非流式响应的稳定 usage 归一化
- Anthropic streaming 保守策略：不再输出误导性的 0 usage 占位

### 网关运维能力

- Provider 健康检查与状态汇总
- 模型目录刷新与缓存回退
- 本地运行时密钥管理
- 可选网关鉴权：`FREEWAY_API_KEY`
- 可选统一出站代理：`HTTP_PROXY`

### 本地控制台

- 浏览 Providers 与模型
- 查看 Provider 健康状态与延迟
- 配置 Provider Keys
- 刷新模型目录
- 在浏览器里测试本地请求

## 配置说明

## 配置你的 Agent

Free-Way 同时暴露 **OpenAI 和 Anthropic 兼容接口**，绝大多数编程 Agent 和 LLM 客户端都可以直接连接。

> 各 Agent 的详细配置指南请参考 [`docs/agents/`](./docs/agents/) 目录。

### Claude Code

设置 base URL 指向 Free-Way：

```bash
export ANTHROPIC_BASE_URL=http://localhost:8787
export ANTHROPIC_API_KEY=<你的 FREEWAY_API_KEY 或任意非空字符串>
```

然后正常运行 `claude` 即可。Free-Way 会把 Claude Code 的 Anthropic API 调用路由到当前最优的免费 Provider。

### Cursor

在 Cursor Settings → Models → OpenAI API Key 中：
- Base URL: `http://localhost:8787/v1`
- API Key: 你的 `FREEWAY_API_KEY`（如果网关鉴权未开启可留空）

### Continue.dev

在 `config.json` 中：

```json
{
  "models": [
    {
      "title": "Free-Way",
      "provider": "openai",
      "model": "llama-3.3-70b",
      "apiBase": "http://localhost:8787/v1",
      "apiKey": "你的 FREEWAY_API_KEY"
    }
  ]
}
```

### OpenCode

运行前设置环境变量：

```bash
export OPENAI_BASE_URL=http://localhost:8787/v1
export OPENAI_API_KEY=<你的 FREEWAY_API_KEY>
```

### 其他 OpenAI/Anthropic 客户端

将 base URL 指向 `http://localhost:8787`（Anthropic）或 `http://localhost:8787/v1`（OpenAI），如果配置了网关鉴权则提供对应的 key。

### 密钥优先级

实际生效顺序：

1. 运行时通过 UI/API 设置的密钥
2. 环境变量
3. 持久化文件 `.freeway/config.json`

### 常用环境变量

| 变量名 | 作用 |
|---|---|
| `FREEWAY_API_KEY` | 可选，调用 Free-Way 时的网关鉴权密钥 |
| `OPENROUTER_API_KEY` | OpenRouter 密钥 |
| `GROQ_API_KEY` | Groq 密钥 |
| `GITHUB_TOKEN` | GitHub Models Token |
| `CLOUDFLARE_API_KEY` | Cloudflare 密钥 |
| `CLOUDFLARE_ACCOUNT_ID` | Cloudflare 模型同步所需账号 ID |
| `SILICONFLOW_API_KEY` | SiliconFlow 密钥 |
| `CEREBRAS_API_KEY` | Cerebras 密钥 |
| `MISTRAL_API_KEY` | Mistral 密钥 |
| `COHERE_API_KEY` | Cohere 密钥 |
| `NVIDIA_API_KEY` | NVIDIA NIM 密钥 |
| `LLM7_API_KEY` | LLM7 密钥 |
| `KILO_API_KEY` | Kilo 密钥 |
| `ZHIPU_API_KEY` | 智谱 / BigModel 密钥 |
| `OPENCODE_API_KEY` | OpenCode 密钥 |
| `HTTP_PROXY` | 可选，统一出站 HTTP 代理 |

## API 调用示例

### OpenAI 兼容 chat completion

```bash
curl http://localhost:8787/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $FREEWAY_API_KEY" \
  -d '{
    "model": "llama-3.3-70b",
    "messages": [{"role": "user", "content": "请介绍一下 Free-Way"}],
    "stream": false
  }'
```

### 显式指定 Provider

```json
{
  "model": "groq/llama-3.3-70b"
}
```

### Anthropic 兼容 messages 请求

```bash
curl http://localhost:8787/v1/messages \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $FREEWAY_API_KEY" \
  -d '{
    "model": "llama-3.3-70b",
    "max_tokens": 256,
    "messages": [{"role": "user", "content": "你好"}]
  }'
```

### Claude 风格本地 base URL 用法

对于支持自定义 Anthropic base URL 的客户端，直接指向：

- `http://localhost:8787`

Free-Way 会在这个 origin 下提供兼容路由。

## 接口清单

| 方法 | 路径 | 说明 |
|---|---|---|
| `GET` | `/` | Web 控制台 |
| `GET` | `/health` | 服务健康检查 |
| `GET` | `/api/catalog` | Provider / Model / Health 汇总 |
| `POST` | `/api/health/check/:provider` | 单 Provider 健康检测 |
| `POST` | `/api/health/check-all` | 全量 Provider 健康检测 |
| `POST` | `/api/models/refresh` | 刷新模型列表 |
| `POST` | `/api/config/keys` | 保存运行时 / 持久化密钥 |
| `GET` | `/v1/models` | OpenAI 兼容模型列表 |
| `POST` | `/v1/chat/completions` | OpenAI 兼容对话接口 |
| `POST` | `/v1/messages` | Anthropic 兼容对话接口 |

## 目录结构

```text
src/
  index.ts                # 启动入口
  server.ts               # HTTP 服务、路由与静态资源
  router.ts               # Provider 路由与失败重试
  providers/              # Provider 定义与模型同步编排
  models/                 # 模型注册、同步与缓存
  web/                    # 控制台前端
  config*.ts              # 运行时与持久化配置
  health.ts               # 健康检查与聚合
  anthropic-bridge.ts     # Anthropic 与 OpenAI 协议转换
  usage.ts                # 网关层 usage 归一化辅助模块
```

## 开发命令

```bash
npm run dev
npm run build
npm start
npm run test:usage
```

## 贡献

- English: [CONTRIBUTING.md](./CONTRIBUTING.md)
- 中文： [contribution.md](./contribution.md)

## License

MIT
