# Roadmap

Free-Way is a local BYOK gateway for routing free-tier LLM providers behind OpenAI- and Anthropic-compatible endpoints.

This roadmap describes the direction and priorities of the project. It is not a strict timeline. Provider APIs, free-tier limits, model availability, and compatibility quirks change quickly, so priorities may shift as the ecosystem changes.

## Current Focus

- Improve OpenAI and Anthropic compatibility
- Keep free-tier provider routes, model availability, and compatibility notes up to date
- Make setup easier for local-capable clients such as Claude Code, Continue.dev, OpenCode, and Cline
- Improve fallback routing, health checks, and observability
- Keep Free-Way local-first and BYOK: no hosted proxy and no shared key pool

## Near Term

### Provider Coverage

- Add more useful free-tier providers
- Track provider model changes, free-tier changes, and compatibility quirks
- Improve provider-specific health checks
- Document provider limits, known issues, and caveats
- Mark free, trial, deprecated, and unavailable models more clearly

### Agent And Client Integration

- Add setup guides for more tools:
  - Cline
  - Aider
  - Codex CLI
  - OpenClaw
  - Roo Code
- Improve examples for Claude Code, Continue.dev, and OpenCode
- Add copy-paste config snippets for common clients
- Document limitations for clients that cannot directly access local `localhost` endpoints, such as tools that proxy API requests through remote servers

### Gateway Compatibility

- Improve OpenAI-compatible streaming behavior
- Improve Anthropic Messages API compatibility
- Expand `count_tokens` compatibility where practical
- Normalize provider error responses more consistently
- Add more compatibility regression checks

### Local Console

- Improve model search and filtering
- Show provider-specific free-tier, rate-limit, and caveat notes
- Improve usage, route selection, and fallback visibility
- Make fallback route traces easier to inspect and debug

## Mid Term

### Routing Strategies

- Support configurable routing strategies:
  - priority
  - random
  - round-robin
  - health-aware
  - latency-aware
- Support per-model provider preferences
- Put providers into cooldown after rate limits or repeated failures
- Provide clearer route diagnostics

### Deployment And Startup

- Docker image
- One-command local launcher
- Config backup and migration
- Provider key import and export
- Clearer first-run experience

### Model Catalog

- Add more dynamic model sync adapters
- Improve canonical model mapping
- Mark model status more clearly:
  - known-free
  - trial
  - deprecated
  - unavailable
- Add official provider and model documentation links where possible

## Long Term

- Plugin-style provider adapters
- Optional local policy rules for routing
- More complete OpenAI and Anthropic compatibility test suite
- Better support for agent workflows and tool-calling clients
- Community-maintained provider metadata
- More complete docs, examples, and troubleshooting guides

## Non-Goals

Free-Way does not aim to:

- Provide free API access
- Host a shared proxy
- Pool or share user keys
- Bypass provider rate limits, permissions, or terms of service
- Guarantee that any provider or model will remain free
- Replace official provider SDKs or full cloud gateway services

## Contributing

The following contributions are especially welcome:

- Provider updates
- New provider adapters
- Agent and client setup guides
- OpenAI and Anthropic compatibility fixes
- Health check, model sync, and fallback routing improvements
- Docs, examples, and troubleshooting notes

If you want to contribute but are not sure where to start, look for issues labeled:

- `good first issue`
- `provider`
- `docs`
- `compatibility`
- `agent-integration`
