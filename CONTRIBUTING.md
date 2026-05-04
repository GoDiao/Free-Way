# Contributing to Free-Way

Thanks for contributing to Free-Way.

Free-Way aims to be a stable, maintainable, and extensible free-LLM gateway. This guide helps keep contributions consistent and review-friendly.

## 1. Ways to Contribute

You can contribute by:

- Reporting bugs (with clear reproduction steps)
- Submitting bugfix PRs
- Adding or improving provider adapters
- Improving model sync/cache/health-check behavior
- Improving docs (README, Chinese docs, examples)

## 2. Local Development

### Requirements

- Node.js 18+
- npm

### Setup and run

```bash
npm install
npm run build
npm start
```

Default server address: `http://localhost:8787`

## 3. Branching & Commits

- Create a branch from the latest main branch.
- Keep one PR focused on one concern (single fix/feature/doc topic).
- Use clear commit messages, e.g.:
  - `feat(provider): add xxx provider adapter`
  - `fix(router): handle xxx response parsing`
  - `docs: update setup instructions`

## 4. PR Checklist

Before opening a PR, make sure:

- [ ] `npm run build` passes
- [ ] Core endpoints work locally
- [ ] No real API keys, tokens, or secrets are committed
- [ ] Documentation is updated with behavior changes
- [ ] The change is minimal and scoped (no unrelated refactor)

## 5. Provider Change Requirements

If your PR adds/updates a provider:

1. Update provider definitions in `src/providers/index.ts`
2. Verify `apiKeyEnvVar`, `baseURL`, and model mapping (`id`/`providerModelId`)
3. Handle provider-specific auth/protocol details in the provider adapter
4. If dynamic sync is needed, add/update implementation under `src/models/*-sync.ts`
5. Confirm models are visible in both console and `/v1/models`

## 6. API Compatibility Contract

Please do not break these compatibility surfaces:

- OpenAI-compatible: `/v1/chat/completions`, `/v1/models`
- Anthropic-compatible: `/v1/messages`
- Console APIs: `/api/catalog`, `/api/health/*`, `/api/models/refresh`, `/api/config/keys`

If you introduce a breaking change, include migration notes in the PR description.

## 7. Documentation Expectations

When behavior or usage changes, update:

- `README.md` (English)
- `README.zh-CN.md` (Chinese)
- `CONTRIBUTING.md` / `contribution.md` if contribution flow changes

## 8. Security & Secrets

- Never commit real keys or credentials
- Never paste full secrets in issues/PR comments
- For security-related bugs, provide minimal reproduction and impact scope without disclosing sensitive info

## 9. Review Criteria

Reviews focus on:

- Correctness (API semantics, edge cases)
- Maintainability (clarity, naming, avoiding over-abstraction)
- Backward compatibility (existing callers continue to work)
- Documentation consistency (docs match behavior)

---

Thanks again for contributing. Small, focused, verifiable PRs get merged faster.
