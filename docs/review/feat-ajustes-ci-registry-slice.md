# feat/ajustes CI and registry slice

This note documents the final review slice from `feat/ajustes`, focused only on
pull request validation workflow maintenance and Gentle AI skill registry
metadata.

## Quick path

1. Review issue [#52](https://github.com/lo-valledor/Frontend_Fi_Agualova_2026/issues/52).
2. Verify `.github/workflows/pr-validation.yml` first because it affects PR
   checks.
3. Then verify `.atl/skill-registry.md` and `.atl/.skill-registry.cache.json`
   as a synchronized registry refresh.

## Scope

| Area | Decision |
|------|----------|
| `.github/workflows/pr-validation.yml` | Pin GitHub Actions to immutable commit SHAs instead of mutable version tags |
| `.atl/skill-registry.md` | Refresh registry metadata after local skill-source changes |
| `.atl/.skill-registry.cache.json` | Keep the registry cache fingerprint aligned with the markdown registry |

## Review focus

### 1. Workflow safety

- The PR validation workflow should keep the same behavior.
- The change is about action version immutability, not CI job semantics.

### 2. Registry consistency

- The registry markdown and cache fingerprint should move together.
- No product UI, route, service, or type code belongs in this PR.

## Validation path

| Check | Purpose |
|-------|---------|
| `pnpm exec biome check --write --no-errors-on-unmatched <touched files>` | Formatting and static cleanup |
| `pnpm exec react-router typegen` | Confirm route generation remains unaffected |
| `pnpm exec tsc` | Confirm no project type regressions |
| pre-commit hook suite | Final integration gate before push |

## Out of scope

- Monitor export / active-period work (PR #47)
- Administración + mantención contract alignment (PR #49)
- Dashboard shell and monitor detail-card alignment (PR #51)
