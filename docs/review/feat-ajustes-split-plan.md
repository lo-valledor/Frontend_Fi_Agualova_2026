# feat/ajustes staged review plan

This note documents the CURRENT staged scope on `feat/ajustes`, the umbrella
tracking issue, and the proposed split for smaller PRs to `develop`.

## Quick path

1. Review issue [#45](https://github.com/lo-valledor/Frontend_Fi_Agualova_2026/issues/45)
   as the umbrella tracker for the staged work.
2. Split the staged diff into reviewable PR slices instead of opening one large
   PR with all 49 files.
3. Validate each slice with its affected checks before opening the PR.

## Current staged scope

| Area | Files | Diff size | Notes |
|------|------:|----------:|-------|
| monitor | 5 | +561 / -412 | Exportar lecturas, monitor detail cards, monitor period integration |
| operaciones | 2 | +62 / -7 | Close active billing period only |
| reportes | 3 | +218 / -108 | Period source alignment for reporting/export support |
| administracion | 19 | +574 / -769 | Contract/UI alignment and cleanup |
| mantencion | 11 | +0 / -11 | Small cleanups in columns |
| dashboard-shell | 6 | +553 / -964 | Dashboard, sidebar, routes, shared table helpers |
| ci | 1 | +5 / -5 | PR validation workflow adjustment |
| skills-registry | 2 | +3 / -3 | Skill registry maintenance files |

> Snapshot source: `git diff --cached --stat` and `git diff --cached --numstat`
> on June 30, 2026.

## Proposed PR split

### PR 1 — monitor + operaciones + reportes

**Why this slice first**

- The changes are functionally related.
- They share the same business flow: billing periods, monitor export, and
  report-driven period selection.
- This is the smallest slice with direct user-facing value.

**Primary files**

- `app/routes/dashboard/monitor/exportar-lecturas.tsx`
- `app/components/monitor/exportar-lecturas-component.tsx`
- `app/components/operaciones/periodo-facturacion/columns.tsx`
- `app/components/operaciones/periodo-facturacion/periodo-facturacion-component.tsx`
- `app/components/reportes/nota-de-cobro/nota-de-cobro-component.tsx`
- `app/components/reportes/ver-facturas/ver-facturas-component.tsx`

**Review focus**

- Active period detection by `periodoActivo[0]?.value === periodo.id`
- Sector ↔ nicho sync with `nicho.sector === String(sector.id)`
- Close-period action visible only for the active period

### PR 2 — administracion + mantencion contract cleanup

**Why separate it**

- Large surface area with many table/form files
- Different review lens from monitor/operaciones
- Easier to test and revert independently

### PR 3 — dashboard shell and navigation cleanup

**Why separate it**

- Routes, sidebar, dashboard, and shared table helpers affect global
  navigation/reachability
- Deserves focused review because regression blast radius is higher

### PR 4 — CI and registry maintenance

**Why separate it**

- Infra/documentation style changes are easier to approve independently
- Avoids mixing workflow changes with product behavior changes

## Validation path

| Slice | Minimum validation |
|-------|--------------------|
| PR 1 | `pnpm exec biome check --write --no-errors-on-unmatched <touched files>` plus targeted functional verification of monitor export and close-period behavior |
| PR 2 | `pnpm exec biome check --write --no-errors-on-unmatched <touched files>` plus targeted table/form smoke checks |
| PR 3 | `pnpm exec biome check --write --no-errors-on-unmatched <touched files>` plus navigation/dashboard smoke checks |
| PR 4 | Workflow syntax verification and diff review |

## Notes for the eventual PR descriptions

- Link umbrella issue #45 from every PR.
- State what is intentionally OUT OF SCOPE for that slice.
- Keep screenshots or short verification notes for user-facing monitor and
  operaciones changes.
- Target branch: `develop`.
