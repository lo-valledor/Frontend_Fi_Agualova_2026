# Spec: style-and-convention-sweep

> Domain: cross-cutting — `app/hooks/operaciones/`, `app/utils/operaciones/`, `app/components/operaciones/`, `app/routes/dashboard/operaciones/`.

## Purpose

Remove or normalize the small but pervasive style and convention violations in the operaciones module. The umbrella spec for this work — covering `console.*` statements, `toast.error(error as any)`, `import React from "react"`, hardcoded URL paths, and the `error: string | null` magic-sentinel pattern — is enforced in this spec and is verifiable by `pnpm lint` and `grep`. The style sweep runs after the realignment slices (Slice 7) so that the realignment diffs are not contaminated by cosmetic edits.

## MODIFIED Requirements

### Requirement: console-statements-removed

No file in the target directories SHALL contain a `console.log`, `console.info`, `console.debug`, or `console.warn` call. `console.error` is permitted ONLY when paired with a `toast.error(...)` for the same condition (i.e. dev-time logging alongside user feedback). This rule is enforced by `pnpm lint` (Biome rule `noConsole`) and verified by `grep`.

#### Scenario: no-console-statements-in-target-dirs

- GIVEN the four target directories `app/hooks/operaciones/`, `app/utils/operaciones/`, `app/components/operaciones/`, `app/routes/dashboard/operaciones/`
- WHEN this change is merged
- THEN `grep -rE "console\\.(log|info|debug|warn)\\b" app/hooks/operaciones/ app/utils/operaciones/ app/components/operaciones/ app/routes/dashboard/operaciones/` returns 0 matches
- AND `pnpm lint` passes

### Requirement: toast-error-string-argument

Every call to `toast.error(...)` in the target directories SHALL pass a `string` as its description argument. The pattern `toast.error(error as any)` (or any other untyped cast to `any`) SHALL be replaced with `toast.error(extraerMensajeError(error))` using the new shared helper from `app/utils/operaciones/error.ts` (per `utils-consolidation.md`). Sonner's signature does not accept a non-string description; the cast silently produces a broken toast.

#### Scenario: toast-error-uses-string-helper

- GIVEN the source-of-truth sonner API (description parameter is `string | ReactNode`)
- AND the helper `extraerMensajeError(error: unknown): string` exported by `app/utils/operaciones`
- WHEN this change is merged
- THEN `grep -rE "toast\\.error\\([^)]*\\bas\\s+any\\b" app/hooks/operaciones/ app/utils/operaciones/ app/components/operaciones/ app/routes/dashboard/operaciones/` returns 0 matches
- AND `pnpm lint` passes

### Requirement: react-default-import-removed

No file in the target directories SHALL contain `import React from "react"`. React 19 + Vite 6 + the automatic JSX runtime does not need this import. The `verbatimModuleSyntax: true` setting in `tsconfig.json` flags it. Verified by `grep`.

#### Scenario: no-react-default-import

- GIVEN the `verbatimModuleSyntax: true` setting in `tsconfig.json`
- WHEN this change is merged
- THEN `grep -rE "^import React from ['\"]react['\"]" app/hooks/operaciones/ app/utils/operaciones/ app/components/operaciones/ app/routes/dashboard/operaciones/` returns 0 matches
- AND `pnpm typecheck` passes

### Requirement: no-empty-pattern-eslint-disable-preserved

The `/* eslint-disable no-empty-pattern */` comment SHALL remain at the top of every route file under `app/routes/dashboard/operaciones/`. The empty-destructuring pattern `meta({}: Route.MetaArgs)` is the React Router 7 idiom and the project does not use Biome's `noEmptyPattern` rule (Biome does not have a 1:1 equivalent), so the comment is harmless. This requirement explicitly preserves the comment.

#### Scenario: empty-pattern-comment-preserved

- GIVEN the React Router 7 `meta({}: Route.MetaArgs)` idiom
- WHEN this change is merged
- THEN `head -1 app/routes/dashboard/operaciones/*.tsx` shows `/* eslint-disable no-empty-pattern */` (or Biome equivalent) in every route file
- AND `pnpm lint` passes

### Requirement: hook-error-sentinel-replaced

The `useCalculoFactura` hook SHALL NOT use the magic string `'NO_LECTURAS_CERRADAS'` as a sentinel in its `error` field. The error type SHALL be a discriminated union or a `string | null` paired with a separate `estadoCierre: 'cerrado' | 'no-cerrado' | 'cargando'` field. The current consumers in `revisar-calculo-factura-component.tsx` SHALL be updated to read the new field.

#### Scenario: hook-error-replaces-sentinel

- GIVEN the rewritten `useCalculoFactura` per `hooks-realignment.md`
- AND its consumer in `revisar-calculo-factura-component.tsx`
- WHEN this change is merged
- THEN `grep -r "NO_LECTURAS_CERRADAS" app/` returns 0 matches
- AND the consumer reads `estadoCierre === 'no-cerrado'` (or equivalent) instead of `error === 'NO_LECTURAS_CERRADAS'`
- AND `pnpm typecheck` passes

### Requirement: hardcoded-urls-eliminated

No file in the target directories SHALL contain a `api.get('/...')` or `api.post('/...')` call with a hardcoded URL string for an endpoint the source-of-truth service provides. The only remaining direct `api` calls in the target directories SHALL be the 6-8 calls inside `corte-reposicion` + `cambio-medidor` + `periodo-facturacion` + `precios-cargo` + `revisar-precio` components that are explicitly aligned to service method names (no further hardcoded URLs after the realignment). Phantom endpoint calls (e.g. `/ConsultarPreciosUno`, `/modificar-precio-cargo-correccion`) are eliminated by per-subdomain spec.

#### Scenario: no-hardcoded-urls-for-service-endpoints

- GIVEN the source-of-truth service method list
- WHEN this change is merged
- THEN `grep -rE "api\\.(get|post)\\(['\"]/" app/components/operaciones/ app/hooks/operaciones/ app/routes/dashboard/operaciones/` shows only the 6-8 allowed sites explicitly listed in `components-realignment.md`
- AND `pnpm typecheck` passes

## Cross-References

- Biome config: `biome.json` (project root)
- TypeScript config: `tsconfig.json` (project root) — `verbatimModuleSyntax: true` at the relevant section
- Sonner API: the `toast.error(message: string, options?)` signature requires a string description
- React 19 automatic JSX runtime: no need for `import React from "react"`
- The `NO_LECTURAS_CERRADAS` sentinel: `app/hooks/operaciones/use-calculo-factura.ts:43-44, 101` (file deleted by `hooks-realignment.md`)

See also: `components-realignment.md` (umbrella for component-level rules), `hooks-realignment.md` (drives the sentinel replacement and console cleanup in hooks).
