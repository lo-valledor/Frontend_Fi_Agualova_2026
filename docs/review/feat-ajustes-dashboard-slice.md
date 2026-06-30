# feat/ajustes dashboard slice

This note documents the third review slice from `feat/ajustes`, focused on the
dashboard shell, navigation wiring, shared table helpers, and the monitor
detail-card updates that belong to the same UI composition pass.

## Quick path

1. Review issue [#50](https://github.com/lo-valledor/Frontend_Fi_Agualova_2026/issues/50).
2. Start with `app/routes.ts`, `app/routes/dashboard/dashboard.tsx`, and
   `app/components/sidebar/app-sidebar.tsx`.
3. Then verify the dashboard components, shared table helper usage, and monitor
   detail cards.

## Scope

| Area | Decision |
|------|----------|
| `app/routes.ts` | Keep global route wiring aligned with the updated dashboard shell |
| `app/routes/dashboard/dashboard.tsx` | Keep the dashboard route entry consistent with the shell changes |
| `app/components/sidebar/app-sidebar.tsx` | Align sidebar navigation with the updated route composition |
| `app/components/dashboard/**` | Simplify and align dashboard consumers with the new shell flow |
| `app/components/data-table/table-helpers.tsx` | Keep shared table helpers compatible with touched dashboard consumers |
| `app/components/monitor/monitor-lecturas/**` | Keep monitor detail cards consistent with the updated shell/composition flow |

## Review focus

### 1. Route and navigation coherence

- Reviewers should confirm that route declarations, dashboard entry wiring, and
  sidebar links tell the SAME navigation story.

### 2. Dashboard shell consistency

- The dashboard components should reflect the route structure instead of
  carrying local composition drift.

### 3. Monitor detail-card fit

- The monitor detail-card changes belong here because they plug into the same
  dashboard/shell flow.
- Review them as composition work, not as a separate monitor data-contract
  change.

## Validation path

| Check | Purpose |
|-------|---------|
| `pnpm exec biome check --write --no-errors-on-unmatched <touched files>` | Formatting and static cleanup |
| `pnpm exec react-router typegen` | Route type regeneration |
| `pnpm exec tsc` | Cross-component contract validation |
| pre-commit hook suite | Final integration gate before push |

## Out of scope

- Monitor export / active-period work (PR #47)
- Administración + mantención contract alignment (PR #49)
- CI workflow and skill-registry maintenance changes
