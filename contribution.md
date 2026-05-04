# 贡献指南（中文）

感谢你参与 Free-Way。

本项目目标是提供一个稳定、可维护、可扩展的免费 LLM 网关。请在提交前阅读以下约定，以减少 review 往返并保持质量一致。

> English version: [CONTRIBUTING.md](./CONTRIBUTING.md)

## 1. 如何贡献

你可以通过以下方式参与：

- 提交 Bug 报告（复现步骤 + 期望行为 + 实际行为）
- 提交修复 PR
- 新增/改进 Provider 适配
- 改进模型同步、缓存、健康检测能力
- 完善文档（README、中文文档、示例）

## 2. 本地开发

### 环境要求

- Node.js 18+
- npm

### 启动流程

```bash
npm install
npm run build
npm start
```

默认服务地址：`http://localhost:8787`

## 3. 分支与提交建议

- 从最新主分支拉取新分支进行开发
- 一个 PR 聚焦一个主题（例如：一个 bugfix、一个 provider、一次文档改进）
- 提交信息建议清晰表达意图，例如：
  - `feat(provider): add xxx provider adapter`
  - `fix(router): handle xxx response parsing`
  - `docs: update setup instructions`

## 4. PR 提交检查清单

提交 PR 前请确认：

- [ ] `npm run build` 通过
- [ ] 本地启动正常，核心接口可访问
- [ ] 未提交任何真实 API Key、Token、敏感配置
- [ ] 代码改动与文档说明保持一致
- [ ] 变更范围最小化，不包含无关重构

## 5. Provider 相关改动规范

如果你在新增或改造 Provider，请至少完成以下内容：

1. 在 `src/providers/index.ts` 增加或调整 Provider 定义
2. 确认 `apiKeyEnvVar`、`baseURL`、模型映射 (`id`/`providerModelId`) 正确
3. 如该 Provider 有特殊鉴权/接口协议，放在对应 provider adapter 中处理
4. 需要动态同步时，在 `src/models/*-sync.ts` 实现拉取/缓存策略
5. 确认模型在控制台和 `/v1/models` 中可见、可调用

## 6. 接口兼容性要求

请不要破坏以下兼容面：

- OpenAI 风格：`/v1/chat/completions`、`/v1/models`
- Anthropic 风格：`/v1/messages`
- 控制台 API：`/api/catalog`、`/api/health/*`、`/api/models/refresh`、`/api/config/keys`

如存在不兼容变更，请在 PR 描述中明确说明迁移方式。

## 7. 文档要求

当改动影响使用方式时，请同步更新：

- `README.md`（英文）
- `README.zh-CN.md`（中文）
- `CONTRIBUTING.md`（英文贡献指南）
- `contribution.md`（中文贡献指南）

## 8. 安全与密钥

- 严禁提交真实密钥到仓库
- 不在 issue/PR 评论中粘贴完整凭证
- 遇到潜在安全问题时，先提供最小复现与影响面说明，避免公开泄漏敏感信息

## 9. Review 标准

Review 时会重点关注：

- 正确性（接口语义、错误处理、边界行为）
- 可维护性（结构清晰、命名明确、避免过度抽象）
- 向后兼容性（现有调用方不被破坏）
- 文档一致性（行为与文档匹配）

---

再次感谢你的贡献。高质量、小步可验证的 PR 会更快通过。