# Spec: revisar-calculo-factura

> Domain: routes — `app/routes/dashboard/operaciones/revisar-calculo-factura.tsx`, `app/components/operaciones/revisar-calculo-factura/`.

## Purpose

The `revisar-calculo-factura` feature has 1 phantom service call in the route (`operacionesService.verificarEstadoCierreLecturas(cicloId, periodo)`), 1 hook (`useCalculoProceso`) and 1 hook (`useValidacionPrecios`) that are deleted by `hooks-realignment.md`, 3 phantom type imports (`Ciclo`, `PeriodoAbierto`, `CalculoPrefacturaCompleto`/`Detalle`/`Cargo`), 3 competing data-table implementations (one of which — `hierarchical-data-table-virtualized.tsx` — is dead). The component is realigned to call the source-of-truth service methods directly (the hooks are gone), the virtualized table is deleted or extracted if a 2+ site pattern emerges, and the `revisar-calculo-factura-component.test.tsx` is deleted (it mocks the deleted hooks).

## MODIFIED Requirements

### Requirement: revisar-calculo-factura-route-thin

The route file SHALL NOT define a `clientLoader`. The phantom call `operacionesService.verificarEstadoCierreLecturas(cicloId, periodo)` (the method does not exist in the source of truth) SHALL be removed. The route SHALL be a thin wrapper. The data is fetched by the component on mount via the rewritten `useCalculoFactura` hook.

#### Scenario: route-has-no-phantom-call

- GIVEN the source-of-truth service class with 31 methods (`app/services/operacionesService.ts:26-678`) — no `verificarEstadoCierreLecturas*` method exists (note: `getRevisarCalculosEstadoProceso` exists at line 521 but has a different name and signature)
- WHEN this change is merged
- THEN `grep -rE "verificarEstadoCierreLecturas" app/` returns 0 matches
- AND `grep "clientLoader\|useLoaderData" app/routes/dashboard/operaciones/revisar-calculo-factura.tsx` returns 0 matches
- AND `pnpm typecheck` passes

### Requirement: revisar-calculo-factura-component-calls-service-directly

The component SHALL NOT import or call the deleted hooks `useCalculoProceso` and `useValidacionPrecios` (per `hooks-realignment.md`). The component SHALL call the source-of-truth service methods directly inside its own event handlers:

- `operacionesService.postRevisarCalculosLanzarCalculo(req)` for the "Lanzar cálculo" action
- `operacionesService.postRevisarCalculosAceptar(periodoId)` for the "Aceptar cálculos" action
- `operacionesService.gerRevisarPreciosData(mes, anio)` (typo preserved) for the price review data
- `operacionesService.getRevisarCalculosBuscarPrefacturas(...)` via the rewritten `useCalculoFactura` hook for the prefacturas data

#### Scenario: component-calls-source-methods

- GIVEN the source-of-truth methods listed above
- AND the request type `RevisarCalculosLanzarCalculoRequest` (`app/types/operaciones.ts:209-218`)
- WHEN this change is merged
- THEN `grep "useCalculoProceso\|useValidacionPrecios" app/components/operaciones/revisar-calculo-factura/` returns 0 matches
- AND the file imports `postRevisarCalculosLanzarCalculo`, `postRevisarCalculosAceptar`, `gerRevisarPreciosData` from `~/services/operacionesService`
- AND a colocated test verifies that the "Lanzar cálculo" handler calls `postRevisarCalculosLanzarCalculo` with a `RevisarCalculosLanzarCalculoRequest` payload

### Requirement: phantom-type-imports-replaced

The component SHALL NOT import any of the 4 phantom types (`Ciclo`, `PeriodoAbierto`, `CalculoPrefacturaCompleto`, `CalculoPrefacturaDetalle`, `CalculoPrefacturaCargo`, `CalculoPrefacturaCargoResponse`) from `~/types/operaciones`. The replacements SHALL be:

- `Ciclo` → `type Ciclo = RevisarCalculosFiltrosCiclosResponse[number]` declared inline (the source-of-truth type is an array of `{id, descripcion}`)
- `PeriodoAbierto` → `type PeriodoAbierto = RevisarCalculosFiltrosPeriodosResponse[number]` declared inline
- `CalculoPrefacturaCompleto` / `Detalle` / `Cargo*` → inline `type CalculoPrefacturaRow = { ... }` derived from the rewritten `useCalculoFactura` hook's return type (the service method is untyped; the row type is local)

#### Scenario: phantom-types-replaced

- GIVEN the source-of-truth types `RevisarCalculosFiltrosCiclosResponse` (`app/types/operaciones.ts:191-194`) and `RevisarCalculosFiltrosPeriodosResponse` (`app/types/operaciones.ts:197-200`)
- WHEN this change is merged
- THEN `grep -rE "\\b(CalculoPrefacturaCompleto|CalculoPrefacturaDetalle|CalculoPrefacturaCargo|CalculoPrefacturaCargoResponse)\\b" app/components/operaciones/revisar-calculo-factura/` returns 0 matches
- AND `grep -rE "^import.*\\b(Ciclo|PeriodoAbierto)\\b.*from" app/components/operaciones/revisar-calculo-factura/` returns 0 matches (aliases are inline)
- AND `pnpm typecheck` passes

### Requirement: hierarchical-data-table-virtualized-deletion-or-extraction

The file `app/components/operaciones/revisar-calculo-factura/hierarchical-data-table-virtualized.tsx` (380 LOC) SHALL be deleted UNLESS a 2+ site use case for hierarchical virtualized tables emerges after the realignment. Initial estimate: 1 site (this subdomain). Therefore the file is deleted. If a future change creates a 2nd use case, the table can be extracted to `app/components/shared/`.

#### Scenario: virtualized-table-deleted

- WHEN this change is merged
- THEN `app/components/operaciones/revisar-calculo-factura/hierarchical-data-table-virtualized.tsx` no longer exists
- AND `grep -r "hierarchical-data-table-virtualized" app/` returns 0 matches

### Requirement: revisar-calculo-factura-component-test-deletion

The unrunnable test file `app/components/operaciones/revisar-calculo-factura/revisar-calculo-factura-component.test.tsx` (275 LOC) SHALL be deleted (per `dead-code-purge.md`). The test mocks the 3 deleted hooks; after the hook removals, the test no longer represents the component's contract. The component is not re-tested in this refactor (per the deferred test-setup risk; the next applicable change should restore `test/setup.ts` and re-add a real test).

#### Scenario: unrunnable-test-deleted

- WHEN this change is merged
- THEN the test file no longer exists
- AND `grep -r "revisar-calculo-factura-component.test" app/` returns 0 matches

### Requirement: local-helper-migration

The inline `useEffect` cleanup via `prevLoadingRef` pattern at the old `preparar-lecturas-component.tsx:72-89` is not present in this file. Any remaining `useEffect` in `revisar-calculo-factura-component.tsx` that runs `limpiarFlujo` or similar state-clearing on mount SHALL be removed (the `use-calculo-facturacion-flow.ts:397-400` anti-pattern is gone with the file deletion). The component uses the rewritten `useCalculoFactura` hook (per `hooks-realignment.md`) which exposes `data`, `isLoading`, `error`, `estadoCierre` — no flow state to clean.

#### Scenario: no-effect-on-mount-clears-state

- WHEN this change is merged
- THEN `grep -rE "useEffect\\(\\(\\) => \\{" app/components/operaciones/revisar-calculo-factura/` shows only effects with explicit dependency arrays that match React 19 best practices (per `react-best-practices` skill rule 5.1 — derived state during render)
- AND `pnpm typecheck` passes

## Cross-References

- Source-of-truth methods: `getRevisarCalculosBuscarPrefacturas` (`app/services/operacionesService.ts:561-594`), `postRevisarCalculosLanzarCalculo` (`app/services/operacionesService.ts:541-559`), `postRevisarCalculosAceptar` (`app/services/operacionesService.ts:596-611`), `gerRevisarPreciosData` (`app/services/operacionesService.ts:253-273`), `getRevisarCalculosFiltrosCiclos` (`app/services/operacionesService.ts:491-504`), `getRevisarCalculosFiltrosPeriodos` (`app/services/operacionesService.ts:506-519`)
- Source-of-truth types: `RevisarCalculosFiltrosCiclosResponse` (`app/types/operaciones.ts:191-194`), `RevisarCalculosFiltrosPeriodosResponse` (`app/types/operaciones.ts:197-200`), `RevisarCalculosLanzarCalculoRequest` (`app/types/operaciones.ts:209-218`)
- Phantom method: `verificarEstadoCierreLecturas` (not in source of truth; `getRevisarCalculosEstadoProceso` is the closest match at line 521 but with different name/signature)
- Phantom types: `Ciclo`, `PeriodoAbierto`, `CalculoPrefacturaCompleto`, `CalculoPrefacturaDetalle`, `CalculoPrefacturaCargo`, `CalculoPrefacturaCargoResponse`

See also: `hooks-realignment.md` (deletes `useCalculoProceso`, `useValidacionPrecios`, rewrites `useCalculoFactura`), `dead-code-purge.md` (deletes `use-calculo-facturacion-flow.ts`), `components-realignment.md`.
