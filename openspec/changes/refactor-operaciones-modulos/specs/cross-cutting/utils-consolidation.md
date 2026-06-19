# Spec: utils-consolidation

> Domain: cross-cutting — `app/utils/operaciones/`, `app/hooks/operaciones/utils/cycle-utilities.ts`.

## Purpose

Eliminate duplication in the operaciones utility layer: three local copies of the ciclo-mapping helper, three local copies of the `MONTHS` array, three near-identical error-extraction helpers, three near-identical blob-download handlers, and four near-identical `periodoFormateado` string-builders. After the refactor, the canonical implementation of each helper lives in one file under `app/utils/operaciones/` and is re-exported from `app/utils/operaciones/index.ts`. No new types files. No new shared component directory.

## ADDED Requirements

### Requirement: download-blob-helper-extraction

A single helper `downloadBlob(blob: Blob, filename: string): void` SHALL exist at `app/utils/operaciones/download.ts` and SHALL be re-exported from `app/utils/operaciones/index.ts`. The helper SHALL encapsulate the `URL.createObjectURL` → anchor element `download` attribute → programmatic click → `URL.revokeObjectURL` pattern. The helper SHALL be the only place this pattern lives; the 3 surviving inline copies in `app/components/operaciones/corte-reposicion/corte-reposicion-component.tsx:98,120,142` SHALL be replaced by calls to this helper. (The 2 `crear-archivos-sap` blob handlers are deleted with the feature per `crear-archivos-sap.md`.)

#### Scenario: download-blob-single-real-site-set

- GIVEN the three inline blob-download handlers in `corte-reposicion-component.tsx:98,120,142`
- AND the absence of any other inline blob-download implementation in `app/components/operaciones/`
- WHEN this change is merged
- THEN `app/utils/operaciones/download.ts` exists and exports `downloadBlob`
- AND the three `corte-reposicion-component.tsx` handlers are removed
- AND `grep -r "URL.createObjectURL" app/components/operaciones/` returns 0 matches
- AND `pnpm typecheck` passes
- AND a new unit test `app/utils/operaciones/download.test.ts` verifies that `downloadBlob(blob, "x.csv")` creates an anchor element whose `download` attribute equals `"x.csv"` and whose `href` starts with `"blob:"`

### Requirement: format-periodo-id-helper-extraction

A single helper `formatPeriodoId(periodoAbierto: PrepararLecturasFiltrosPeriodosResponse[]): string` SHALL exist at `app/utils/operaciones/period.ts` and SHALL be re-exported from `app/utils/operaciones/index.ts`. The helper SHALL encapsulate the pattern `periodoAbierto[0].mes.toString().padStart(2, '0') + periodoAbierto[0].anio.toString()`. The 4+ inline copies of this pattern SHALL be replaced by calls to this helper. Sites confirmed: `cerrar-lecturas-component.tsx:67-74`, `revisar-calculo-factura-component.tsx:64-70`, `revisar-precio-component.tsx`, plus the inline copy in the `revisar-calculo-factura.tsx:30-31` route.

#### Scenario: format-periodo-id-replaces-all-real-sites

- GIVEN the 4+ inline `mes.padStart(2,'0') + anio` builders listed above
- WHEN this change is merged
- THEN `app/utils/operaciones/period.ts` exists and exports `formatPeriodoId`
- AND `grep -r "padStart(2, '0')" app/components/operaciones/ app/routes/dashboard/operaciones/` returns 0 matches inside those 4+ files (other unrelated `padStart` usages may remain)
- AND `pnpm typecheck` passes
- AND a new unit test `app/utils/operaciones/period.test.ts` verifies that `formatPeriodoId([{id:"1", descripcion:"2026-01"}])` returns `"012026"` and that calling it with an empty array throws a typed `Error` named `EmptyPeriodoAbiertoError`

### Requirement: cycle-helper-canonical-move

The canonical `convertirCicloParaAPI(ciclo: string | number): string` helper SHALL live in `app/utils/operaciones/cycle.ts` (moved from `app/hooks/operaciones/utils/cycle-utilities.ts:1`) and SHALL be re-exported from `app/utils/operaciones/index.ts`. The two local copies of `obtenerCicloParaAPI` in `cerrar-lecturas-component.tsx:102` and (in the now-deleted) `preparar-lecturas-component.tsx:99` SHALL be removed; the surviving site imports the canonical helper.

#### Scenario: cycle-helper-canonicalised

- GIVEN the canonical `convertirCicloParaAPI` at `app/hooks/operaciones/utils/cycle-utilities.ts:1`
- AND the local `obtenerCicloParaAPI` at `cerrar-lecturas-component.tsx:102`
- WHEN this change is merged
- THEN `app/hooks/operaciones/utils/cycle-utilities.ts` no longer exports `convertirCicloParaAPI` (the file itself MAY remain only if it retains other exports; otherwise it SHALL be deleted)
- AND `app/utils/operaciones/cycle.ts` exports `convertirCicloParaAPI`
- AND `grep -r "obtenerCicloParaAPI" app/` returns 0 matches
- AND `cerrar-lecturas-component.tsx` imports `convertirCicloParaAPI` from `~/utils/operaciones`
- AND a new unit test `app/utils/operaciones/cycle.test.ts` verifies the function handles both string and number inputs

### Requirement: error-message-helper-extraction

A single helper `extraerMensajeError(error: unknown): string` SHALL exist at `app/utils/operaciones/error.ts` and SHALL be re-exported from `app/utils/operaciones/index.ts`. The helper SHALL handle `Error` instances, axios-shaped errors with `response.data.mensaje`, and any other value by returning `String(error)` as a last resort. The 3+ utility files that implement this pattern (`utils/error-handler.ts`, `utils/operaciones/revisar-precio-helpers.ts`, `utils/operaciones/confirmation-helpers.ts`) SHALL be removed, and all inline `try/catch` blocks across 10+ components SHALL call this helper.

#### Scenario: error-helper-centralised

- GIVEN the duplicated error-handling utilities in `utils/operaciones/revisar-precio-helpers.ts:30-50` and `utils/operaciones/confirmation-helpers.ts:40-60` and `hooks/operaciones/utils/error-handler.ts:1-40`
- WHEN this change is merged
- THEN `app/utils/operaciones/error.ts` exists and exports `extraerMensajeError`
- AND the three utility files above are deleted
- AND `grep -r "isCredentialError\|handleValidationHTTPError\|handleGeneralValidationError\|extraerErrorMessage\|es404\|extraerCodigoEstatus\|validarRespuestaAPI" app/` returns 0 matches
- AND a new unit test `app/utils/operaciones/error.test.ts` covers at least three cases: `Error` instance, axios-shaped error with `response.data.mensaje`, and a non-Error thrown value

### Requirement: months-constant-single-source

The array `MONTHS` SHALL be defined exactly once in `app/utils/operaciones/constants.ts:2` and SHALL be re-exported from `app/utils/operaciones/index.ts`. The local copies inside `app/utils/operaciones/formatters.ts:2-15` (the `formatPeriodLabel` map), `app/components/operaciones/periodo-facturacion/dialog-nuevo-periodo.tsx:27-40`, and `app/components/operaciones/periodo-facturacion/dialog-abrir-periodo.tsx:21-34` SHALL be removed. (The two dialogs are deleted in their entirety per `periodo-facturacion.md`; their local `MONTHS` go with them.)

#### Scenario: months-single-source

- GIVEN the canonical `MONTHS` array in `app/utils/operaciones/constants.ts:2`
- AND the local `MONTHS` array inside `formatPeriodLabel` in `app/utils/operaciones/formatters.ts:2-15`
- WHEN this change is merged
- THEN `grep -r "const MONTHS = " app/utils/operaciones/ app/components/operaciones/` returns exactly 1 match (the canonical)
- AND `formatPeriodLabel` is rewritten to import `MONTHS` from `./constants`
- AND `pnpm typecheck` passes

## REMOVED Requirements

### Requirement: formatters-dot-ts-merge-into-index

The file `app/utils/operaciones/formatters.ts` SHALL be deleted, and its 3 non-duplicate formatters (`formatPrice`, `formatNumber`, `formatCycle`) SHALL be inlined as named exports into the consumer files that need them. The `formatPeriodLabel` function is removed (its `MONTHS` map is now sourced from `constants.ts`; if a `formatPeriodLabel` is still needed, it is implemented in the single consumer file that uses it).

#### Scenario: formatters-merged-or-deleted

- GIVEN `app/utils/operaciones/formatters.ts` exporting `formatPeriodLabel`, `formatPrice`, `formatNumber`, `formatCycle`, `formatDate`
- WHEN this change is merged
- THEN the file is deleted
- AND `grep -r "from .*utils/operaciones/formatters" app/` returns 0 matches
- AND any consumer of `formatPrice`/`formatNumber`/`formatCycle` either inlines a 1-3 line version or re-imports from a new location
- AND `pnpm typecheck` passes

### Requirement: revisar-precio-helpers-deletion

The file `app/utils/operaciones/revisar-precio-helpers.ts` SHALL be deleted. All 5 of its exports (`isCredentialError`, `isAuthorizationError`, `getErrorMessage`, `handleValidationHTTPError`, `handleGeneralValidationError`) are subsets or supersets of `extraerMensajeError` and SHALL be replaced by calls to the new `extraerMensajeError` helper.

#### Scenario: revisar-precio-helpers-removed

- GIVEN `app/utils/operaciones/revisar-precio-helpers.ts` exporting 5 helpers
- WHEN this change is merged
- THEN the file no longer exists
- AND `grep -r "revisar-precio-helpers" app/` returns 0 matches
- AND `pnpm typecheck` passes

### Requirement: confirmation-helpers-deletion

The file `app/utils/operaciones/confirmation-helpers.ts` SHALL be deleted. Its 2 exports (`processConfirmations`, `filterPendingConfirmations`) become single-use after the related feature in `revisar-precio-component.tsx` is realigned; the simple filter is inlined into the one consumer.

#### Scenario: confirmation-helpers-removed

- GIVEN `app/utils/operaciones/confirmation-helpers.ts` exporting 2 helpers that call `api.post('/ConfirmarPrecio?...')` (a phantom endpoint)
- WHEN this change is merged
- THEN the file no longer exists
- AND `grep -r "confirmation-helpers\|processConfirmations\|filterPendingConfirmations" app/` returns 0 matches
- AND `pnpm typecheck` passes

## MODIFIED Requirements

### Requirement: utils-operaciones-index-re-exports

The file `app/utils/operaciones/index.ts` SHALL re-export every public helper listed in the ADDED Requirements above (`downloadBlob`, `formatPeriodoId`, `convertirCicloParaAPI`, `extraerMensajeError`) plus the existing `constants`, `validations` modules. Today the index re-exports only `constants`, `formatters`, and `validations` — it misses `confirmation-helpers`, `revisar-precio-helpers`, and the future shared helpers. After this change the index is the single import surface for the operaciones utils layer.

#### Scenario: utils-index-re-exports-everything-public

- GIVEN the new helper files `download.ts`, `period.ts`, `cycle.ts`, `error.ts` in `app/utils/operaciones/`
- AND the surviving files `constants.ts`, `validations.ts`
- WHEN this change is merged
- THEN `app/utils/operaciones/index.ts` contains `export * from './constants'`, `export * from './validations'`, `export * from './download'`, `export * from './period'`, `export * from './cycle'`, `export * from './error'`
- AND `grep "from .*utils/operaciones/' app/` shows every consumer using the barrel index, not a deep import

## Cross-References

- Source-of-truth response type for `formatPeriodoId` input: `app/types/operaciones.ts:165-169` (`PrepararLecturasFiltrosPeriodosResponse`)
- Source-of-truth for the periodo API: `app/services/operacionesService.ts:31-46` (`getPeriodoAbierto`)
- Source-of-truth for the ciclo response type: `app/types/operaciones.ts:159-163` (`PrepararLecturasFiltrosCiclosResponse`)
- Source-of-truth for error envelope: `app/services/operacionesService.ts:21-24` (`OperacionesServiceResponse<T>`) — the canonical error path returns `error: string | null`
- Source-of-truth that does NOT define any domain entity types: `app/types/operaciones.ts:1-250` — confirms the 3-cycle, MONTHS, and error helpers are pure utility functions and live under `app/utils/operaciones/`, not under types

See also: `dead-code-purge.md` (deletes some adjacent util files), `hooks-realignment.md` (deletes `utils/error-handler.ts`, `utils/data-combiner.ts`, `utils/price-validator.ts` from `app/hooks/operaciones/utils/`).
