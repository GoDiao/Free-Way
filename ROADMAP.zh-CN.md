# Roadmap

Free-Way 是一个本地 BYOK 网关，用于把多个免费额度 / free-tier LLM Provider 收敛到统一的 OpenAI / Anthropic 兼容接口之后。

这份 Roadmap 描述项目方向和优先级，不是严格时间表。由于 Provider API、免费额度、模型可用性和兼容细节变化很快，实际优先级可能会随生态变化调整。

## 当前重点

- 提升 OpenAI / Anthropic 兼容性
- 持续跟踪免费额度 Provider、模型可用性和路由变化
- 降低 Claude Code、Continue.dev、OpenCode、Cline 等本地客户端的接入成本
- 改进回退路由、健康检查和可观测性
- 保持本地优先和 BYOK：不托管代理、不共享 Key 池

## 近期计划

### Provider 覆盖

- 接入更多有实际价值的免费额度 Provider
- 跟踪 Provider 模型变化、免费额度变化和兼容性差异
- 改进 Provider 专属健康检查
- 记录 Provider 限制、已知问题和使用注意事项
- 更清楚地区分免费、试用、已废弃、不可用模型

### Agent / 客户端接入

- 增加更多配置指南：
  - Cline
  - Aider
  - Codex CLI
  - OpenClaw
  - Roo Code
- 改进 Claude Code、Continue.dev、OpenCode 的示例
- 为常见客户端提供可复制的配置片段
- 标注无法直接访问本机 `localhost` 的客户端限制，例如部分经由远端服务器代理请求的工具

### 网关兼容性

- 改进 OpenAI-compatible streaming 行为
- 改进 Anthropic Messages API 兼容性
- 在可行范围内扩展 `count_tokens` 兼容能力
- 统一不同 Provider 的错误响应格式
- 增加更多兼容性回归测试

### 本地控制台

- 改进模型搜索和筛选
- 展示 Provider 的免费额度、限流和已知注意事项
- 增强 usage、路由选择和 fallback 可见性
- 让 fallback route trace 更容易检查和调试

## 中期方向

### 路由策略

- 支持可配置路由策略：
  - priority
  - random
  - round-robin
  - health-aware
  - latency-aware
- 支持按模型设置 Provider 优先级
- Provider 限流或连续失败后进入 cooldown
- 提供更清晰的路由诊断信息

### 部署和启动

- Docker 镜像
- 一行命令启动本地网关
- 配置备份和迁移
- Provider Key 配置导入 / 导出
- 更清晰的首次启动体验

### 模型目录

- 增加更多动态模型同步适配器
- 改进 canonical model 映射
- 标注模型状态：
  - known-free
  - trial
  - deprecated
  - unavailable
- 为模型和 Provider 补充官方文档链接

## 长期方向

- 插件式 Provider adapter
- 可选的本地路由策略规则
- 更完整的 OpenAI / Anthropic 兼容性测试套件
- 更好地支持 agent workflow 和 tool-calling 客户端
- 社区维护的 Provider 元数据
- 更完善的文档、示例和故障排查指南

## 非目标

Free-Way 不打算：

- 提供免费 API 访问
- 托管共享代理
- 汇集或共享用户 Key
- 绕过 Provider 的限流、权限或服务条款
- 保证任何 Provider 或模型会一直免费可用
- 替代官方 Provider SDK 或完整云端网关服务

## 欢迎贡献

以下类型的贡献尤其欢迎：

- Provider 更新
- 新 Provider 适配
- Agent / 客户端配置指南
- OpenAI / Anthropic 兼容性修复
- 健康检查、模型同步、fallback 路由改进
- 文档、示例和故障排查说明

如果你想贡献但不确定从哪里开始，可以关注这些标签：

- `good first issue`
- `provider`
- `docs`
- `compatibility`
- `agent-integration`
