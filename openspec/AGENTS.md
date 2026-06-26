# OpenSpec Workflow — frontend_fi_agualova_2026

This repo uses [OpenSpec](https://github.com/Fission-AI/OpenSpec) (via the Gentle AI SDD workflow) for spec-driven
change management. All SDD artifacts live under `openspec/` in this repository. Engram is the **index** for cross-session
recovery; the files in `openspec/` are the **source of truth** for change artifacts.

## Quick reference

- Project key (Engram): `frontend_fi_agualova_2026`
- Execution mode: `interactive`
- Artifact store: `openspec` (this directory)
- Chained PR strategy: `ask-always`
- Review budget: 400 changed lines
- Strict TDD: enabled (see `config.yaml`)

## Directory layout

```
openspec/
├── config.yaml              # Project context, testing capabilities, phase rules
├── AGENTS.md                # This file — how to use OpenSpec in this repo
├── specs/                   # Source of truth: main specs, one folder per domain
│   └── {domain}/spec.md
└── changes/                 # Active changes
    ├── archive/             # Completed changes (YYYY-MM-DD-{change-name}/)
    └── {change-name}/       # One folder per active change
        ├── state.yaml       # DAG state (survives compaction)
        ├── exploration.md   # (optional) from sdd-explore
        ├── proposal.md      # from sdd-propose
        ├── specs/           # from sdd-spec
        │   └── {domain}/spec.md   # Delta spec (ADDED / MODIFIED / REMOVED / RENAMED)
        ├── design.md        # from sdd-design
        ├── tasks.md         # from sdd-tasks (updated by sdd-apply)
        └── verify-report.md # from sdd-verify
```

## SDD phase flow

1. **explore** — clarify requirements before committing. Writes `exploration.md`.
2. **propose** — author `proposal.md` with intent, scope, approach, rollback.
3. **spec** — write delta specs under `specs/{domain}/spec.md` using ADDED / MODIFIED / REMOVED / RENAMED sections.
4. **design** — author `design.md` with technical approach and rationale.
5. **tasks** — break the work into `tasks.md`, grouped by phase, completable in one session.
6. **apply** — implement tasks; mark `[x]` in `tasks.md` as you finish each one.
7. **verify** — run `pnpm test:run` + `pnpm typecheck` + `pnpm lint` + `pnpm build`; author `verify-report.md`.
8. **archive** — merge delta specs into `specs/{domain}/spec.md` and move the change folder under
   `changes/archive/YYYY-MM-DD-{change-name}/`.

## Domain map (route prefixes from `app/routes.ts`)

| Domain prefix            | Example route                                                  |
| ------------------------ | -------------------------------------------------------------- |
| `auth`                   | `routes/auth/login.tsx`                                        |
| `dashboard/monitor`      | `routes/dashboard/monitor/monitor-lecturas.tsx`                |
| `dashboard/operaciones`  | `routes/dashboard/operaciones/periodo-facturacion.tsx`         |
| `dashboard/administracion` | `routes/dashboard/administracion/usuarios.tsx`               |
| `dashboard/mantencion`   | `routes/dashboard/mantencion/zonas.tsx`                        |
| `dashboard/reportes`     | `routes/dashboard/reportes/consultar-contrato.tsx`             |
| `dashboard/configuracion`| `routes/dashboard/configuracion/roles-permisos.tsx`            |

Use these as the `{domain}` folder names under `openspec/specs/` and `openspec/changes/{change-name}/specs/`.

## Conventions specific to this repo

- **Linting/formatting is Biome**, not ESLint/Prettier. `pnpm lint` runs `biome lint --write`; `pnpm format` runs
  `biome format --write`. The top-level `AGENTS.md` is outdated on this point — trust `package.json` and `biome.json`.
- **TypeScript strict mode** is on. New code must satisfy `pnpm typecheck` (which runs `react-router typegen && tsc`).
- **`~/*` alias** resolves to `app/*` (configured in both `tsconfig.json` and `vitest.config.ts`).
- **Colocated tests**: `*.test.ts` / `*.test.tsx` next to the source file. The repo has a duplicated components tree
  under `app/routes/dashboard/reportes/components/...` that mirrors `app/components/...` — changes that touch either
  branch must reconcile both copies.
- **Path alias in scripts**: tests run with `pnpm test:run` (single-run) or `pnpm test` (watch).
- **Default theme is `dark`** in `ThemeProvider`. Keep `prefers-color-scheme` and dark/light tokens in mind for UI work.

## Test infrastructure status

Vitest is configured and 27 tests exist colocated with their sources. However, `vitest.config.ts` references
`./test/setup.ts` and that file is **currently missing** — the test suite fails to load with
`Cannot find module .../test/setup.ts`. SDD tasks that depend on running the test suite should:

1. Run the targeted test first (`pnpm test:run <pattern>`) to confirm the test exists.
2. Treat the full-suite failure as a known blocker; do not block new work on it.
3. The first applicable change should restore `test/setup.ts` (likely `import '@testing-library/jest-dom/vitest'`) so
   `pnpm test:run` runs end-to-end again.

## Recovery protocol

If you lose the OpenSpec state:

1. `git status` — any in-progress change is still in `openspec/changes/{change-name}/`.
2. `mem_search query: "sdd-init/frontend_fi_agualova_2026" project: frontend_fi_agualova_2026` → cached init context.
3. `mem_search query: "sdd/{change-name}/state" project: frontend_fi_agualova_2026` → DAG state for an active change.

See `config.yaml` for the full rules per phase.
