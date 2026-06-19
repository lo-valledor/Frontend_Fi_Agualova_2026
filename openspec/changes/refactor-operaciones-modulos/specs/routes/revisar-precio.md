# Spec: revisar-precio

> Domain: routes — `app/routes/dashboard/operaciones/revisar-precio.tsx`, `app/components/operaciones/revisar-precio/`.

## Purpose

The `revisar-precio` feature has 2 phantom service calls in the route (`getRevisarPrecioData` and `getPreciosPorCiclo` — neither exists in the source of truth), 5 phantom type imports (`Ciclo`, `PeriodoAbierto`, `RevisarPrecioUno`, `RevisarPrecioDos`, `TablaValoresEnelProps`, `TablaValoresAgualovaProps`), a payload drift in `dialog-modificar-precio.tsx:100-110` (sends `{indice, valor, motivo, usuario}` instead of the source-of-truth `RevisionPreciosCorregirRequest = {codigoCargo, nuevoValor, motivo, passwordConfirmacion}`), 2 dead sub-components (`tabla-valores-enel.tsx`, `tabla-valores-enerlova.tsx`), 1 dead virtualized table, and a `useProductTour` driver.js init that is a candidate for extraction to a shared hook (pending 3-site confirmation at design time).

## MODIFIED Requirements

### Requirement: revisar-precio-route-thin

The route file `app/routes/dashboard/operaciones/revisar-precio.tsx` SHALL NOT define a `clientLoader`. The 2 phantom calls `operacionesService.getRevisarPrecioData(dia)` and `operacionesService.getPreciosPorCiclo(mes, anio, dia)` (neither method exists in the source of truth) SHALL be removed. The route SHALL be a thin wrapper. The data is fetched by the component on mount via `operacionesService.gerRevisarPreciosData(mes, anio)` (typo "ger" preserved).

#### Scenario: route-has-no-phantom-calls

- GIVEN the source-of-truth service class with 31 methods (`app/services/operacionesService.ts:26-678`) — no `getRevisarPrecioData*` and no `getPreciosPorCiclo*` methods exist
- WHEN this change is merged
- THEN `grep -rE "getRevisarPrecioData|getPreciosPorCiclo" app/` returns 0 matches
- AND `grep "clientLoader\|useLoaderData" app/routes/dashboard/operaciones/revisar-precio.tsx` returns 0 matches
- AND `pnpm typecheck` passes

### Requirement: revisar-precio-component-uses-gerrevisar

The component SHALL call `operacionesService.gerRevisarPreciosData(mes, anio)` (declared at `app/services/operacionesService.ts:253-273`, returning `GET /revision-precios/consultar`) for the data source. The previous dual-fetch pattern (two data sources combined) SHALL be reduced to a single fetch. The totals (`confirmados`, `pendientes`, `total`) are derived via `useMemo` from the response.

#### Scenario: component-calls-gerrevisar-once

- WHEN this change is merged
- THEN `grep "gerRevisarPreciosData" app/components/operaciones/revisar-precio/revisar-precio-component.tsx` returns exactly 1 match (a single call site)
- AND a colocated test verifies that the totals are derived from the response, not fetched separately
- AND `pnpm typecheck` passes

### Requirement: phantom-type-imports-removed

The component and its sub-components SHALL NOT import any of `Ciclo`, `PeriodoAbierto`, `RevisarPrecioUno`, `RevisarPrecioDos`, `TablaValoresEnelProps`, `TablaValoresAgualovaProps` from `~/types/operaciones`. The replacements SHALL be:

- `Ciclo` → `type Ciclo = RevisarCalculosFiltrosCiclosResponse[number]` declared inline
- `PeriodoAbierto` → `type PeriodoAbierto = RevisarCalculosFiltrosPeriodosResponse[number]` declared inline
- `RevisarPrecioUno`, `RevisarPrecioDos` → no replacement; the corresponding components are deleted
- `TablaValoresEnelProps`, `TablaValoresAgualovaProps` → no replacement; the corresponding components are deleted

#### Scenario: phantom-types-removed

- GIVEN the source-of-truth types `RevisarCalculosFiltrosCiclosResponse` (`app/types/operaciones.ts:191-194`) and `RevisarCalculosFiltrosPeriodosResponse` (`app/types/operaciones.ts:197-200`)
- WHEN this change is merged
- THEN `grep -rE "\\b(RevisarPrecioUno|RevisarPrecioDos|TablaValoresEnelProps|TablaValoresAgualovaProps)\\b" app/components/operaciones/revisar-precio/` returns 0 matches
- AND `grep -rE "^import.*\\b(Ciclo|PeriodoAbierto)\\b.*from" app/components/operaciones/revisar-precio/` returns 0 matches (aliases are inline)
- AND `pnpm typecheck` passes

### Requirement: dialog-modificar-precio-payload-aligned

The file `app/components/operaciones/revisar-precio/dialog-modificar-precio.tsx:100-110` SHALL call `operacionesService.postCorregirPrecioCargo(req)` (declared at `app/services/operacionesService.ts:313-326`) with a payload conforming to `RevisionPreciosCorregirRequest = {codigoCargo, nuevoValor, motivo, passwordConfirmacion}` (declared at `app/types/operaciones.ts:245-250`). The previous payload `{indice, valor, motivo, usuario}` SHALL be removed. The `indice` field is not in the source-of-truth request shape; the `usuario` field is replaced by `passwordConfirmacion`.

#### Scenario: dialog-sends-correct-payload

- GIVEN the source-of-truth request type `RevisionPreciosCorregirRequest` (`app/types/operaciones.ts:245-250`)
- AND the source-of-truth method `postCorregirPrecioCargo` (`app/services/operacionesService.ts:313-326`)
- WHEN this change is merged
- THEN `grep "indice.*valor.*motivo.*usuario\|/modificar-precio-cargo-correccion" app/components/operaciones/revisar-precio/dialog-modificar-precio.tsx` returns 0 matches
- AND the dialog calls `postCorregirPrecioCargo({codigoCargo, nuevoValor, motivo, passwordConfirmacion})`
- AND a new colocated test `dialog-modificar-precio.test.tsx` verifies the payload shape via an msw handler that asserts on the request body

### Requirement: dead-subcomponents-deletion

The files `tabla-valores-enel.tsx` and `tabla-valores-enerlova.tsx` SHALL be deleted (no source-of-truth backing; data is rendered inline in the main component after realignment). The file `data-table-virtualized.tsx` (222 LOC) SHALL also be deleted (single use after `tabla-valores-enel.tsx` and `tabla-valores-enerlova.tsx` removal; the non-virtualized `data-table.tsx` is the canonical implementation).

#### Scenario: dead-subcomponents-deleted

- WHEN this change is merged
- THEN `tabla-valores-enel.tsx`, `tabla-valores-enerlova.tsx`, and `data-table-virtualized.tsx` no longer exist
- AND `grep -rE "tabla-valores-enel|tabla-valores-enerlova|revisar-precio/data-table-virtualized" app/` returns 0 matches
- AND `pnpm typecheck` passes

### Requirement: use-product-tour-extraction-conditional

A `useProductTour(steps: DriverStep[])` hook SHALL exist at `app/hooks/operaciones/use-product-tour.ts` IF AND ONLY IF the driver.js init in 2+ of the 3 candidate sites (corte-reposicion-component.tsx:323-345, revisar-calculo-factura-component.tsx:223-245, revisar-precio-component.tsx:300-321) is visually identical after the realignment. The hook SHALL encapsulate the `driver().setSteps().drive()` pattern and accept options for per-page differences (e.g. `allowClose`, `stagePadding`). The decision is deferred to the design phase per `proposal.md` §5; the spec does not commit to extraction.

#### Scenario: extraction-only-if-2-sites-match

- GIVEN the 3 candidate sites with driver.js init
- WHEN the design phase confirms visual identity across 2+ sites
- THEN `app/hooks/operaciones/use-product-tour.ts` is created
- AND the 2+ matching sites are refactored to call `useProductTour(steps)`
- AND the non-matching site (if any) keeps its inline driver.js init
- OTHERWISE no new file is created and the inline init is preserved in all 3 sites (this is a legitimate outcome)

## Cross-References

- Source-of-truth methods: `gerRevisarPreciosData` (`app/services/operacionesService.ts:253-273` — typo preserved), `postCorregirPrecioCargo` (`app/services/operacionesService.ts:313-326`), `postConfirmarRevisionPrecios` (`app/services/operacionesService.ts:275-290`), `getDetalleCorreccionCodigoCargo` (`app/services/operacionesService.ts:292-311`)
- Source-of-truth types: `RevisionPreciosCorregirRequest` (`app/types/operaciones.ts:245-250`), `RevisionPreciosConfirmarRequest` (`app/types/operaciones.ts:237-240`), `RevisionPreciosBuscarRequest` (`app/types/operaciones.ts:226-234`)
- Phantom methods: `getRevisarPrecioData`, `getPreciosPorCiclo` (not in source of truth)
- Phantom types: `Ciclo`, `PeriodoAbierto`, `RevisarPrecioUno`, `RevisarPrecioDos`, `TablaValoresEnelProps`, `TablaValoresAgualovaProps`

See also: `utils-consolidation.md` (for `extraerMensajeError` usage in dialog-modificar-precio), `components-realignment.md`, `style-and-convention-sweep.md`.
