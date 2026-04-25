<p align="center">
  <img src="Assets/Head.png" alt="Freeway 头图" width="960" />
</p>

<h1 align="center">Freeway</h1>

<p align="center">
  <strong>Connect to every free LLM API that matters.</strong>
</p>

<p align="center">
  Freeway 是一个开源网关，目标是在快速变化的免费 LLM 生态之上，提供更统一、更兼容的本地 API 聚合层。
</p>

<p align="center">
  <a href="./README.md">English</a> ·
  <a href="./CONTRIBUTING.md">Contributing (EN)</a> ·
  <a href="./contribution.md">贡献指南 (中文)</a>
</p>

## 项目使命

Freeway 的目标，是持续追踪、归一化并聚合不断扩张的免费 LLM API 生态。

它不是只包一层单一 Provider，也不是只代理少数几个接口；它更像一个网关层，持续吸收真正重要的 Provider、模型能力和兼容性差异，并把这些差异收敛成更稳定的本地调用入口。

## 为什么要做 Freeway

免费模型生态增长很快，但开发体验依然高度碎片化：

- 不同 Provider 的接口行为和返回结构并不一致
- 模型可用性变化很快
- 免费额度、访问限制和稳定性会不断变化
- 脚本、Agent 和本地工具依然希望只有一个可靠的 base URL

Freeway 的价值，就是把这些碎片化差异压缩进一个更容易接入、更容易运维、也更容易扩展的本地网关里。

## Freeway 提供什么

- OpenAI 兼容接口：`/v1/chat/completions`、`/v1/models`
- Anthropic 兼容接口：`/v1/messages`、`/v1/messages/count_tokens`
- Provider 聚合与路由，自动失败回退
- 运行时 API Key 管理
- 健康检查与本地 Web 控制台
- 网关层的非流式 usage 归一化
- **支持 Claude Code、Cursor、Continue.dev、OpenCode 等任何 OpenAI/Anthropic 兼容客户端**

## Coverage 理念

Freeway 不把自己定位成某一个 API Vendor 的薄包装。

它是一个聚合层，目标是持续跟上免费 LLM 生态的变化：追踪有价值的 Provider，抹平兼容性差异，并把最终暴露给本地工具、脚本和 Agent 的接口做得更稳定。

它的目标是更广覆盖，但实现策略保持务实：优先接入真正重要的免费 API，优先解决真实兼容问题，优先让网关在不断变化的生态里保持可用。

## 生态信息源

Freeway 会持续参考公开的免费模型生态资源，包括：

- [awesome-free-llm-apis](https://github.com/mnfst/awesome-free-llm-apis)
- [free-llm-api-resources](https://github.com/cheahjs/free-llm-api-resources)

这些是生态参考信息源，不是项目依赖。它们帮助 Freeway 持续判断应该跟踪哪些 Provider、模型和兼容性方向。

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

## 已支持 Provider

当前在 `src/providers/index.ts` 中接入：

`openrouter`、`groq`、`github`、`cloudflare`、`siliconflow`、`cerebras`、`mistral`、`cohere`、`nvidia`、`llm7`、`kilo`、`zhipu`、`opencode`

## 快速开始

### 1. 环境要求

- Node.js 18+
- npm

### 2. 安装并启动

```bash
npm install
npm run build
npm start
```

默认服务地址：

- `http://localhost:8787`

### 3. 打开控制台

访问：

- `http://localhost:8787/`

然后在 **API Keys** 页面配置 Provider Key，或直接通过环境变量提供。

## 配置说明

### 密钥优先级

实际生效顺序：

1. 运行时通过 UI/API 设置的密钥
2. 环境变量
3. 持久化文件 `.freeway/config.json`

### 常用环境变量

| 变量名 | 作用 |
|---|---|
| `FREEWAY_API_KEY` | 可选，调用 Freeway 时的网关鉴权密钥 |
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
    "messages": [{"role": "user", "content": "请介绍一下 Freeway"}],
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

Freeway 会在这个 origin 下提供兼容路由。

## 配置你的 Agent

Freeway 同时暴露 **OpenAI 和 Anthropic 兼容接口**，绝大多数编程 Agent 和 LLM 客户端都可以直接连接。

### Claude Code

设置 base URL 指向 Freeway：

```bash
export ANTHROPIC_BASE_URL=http://localhost:8787
export ANTHROPIC_API_KEY=<你的 FREEWAY_API_KEY 或任意非空字符串>
```

然后正常运行 `claude` 即可。Freeway 会把 Claude Code 的 Anthropic API 调用路由到当前最优的免费 Provider。

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
      "title": "Freeway",
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
