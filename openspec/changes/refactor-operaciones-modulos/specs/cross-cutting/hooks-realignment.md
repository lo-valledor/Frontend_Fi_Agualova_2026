# Spec: hooks-realignment

> Domain: cross-cutting — `app/hooks/operaciones/`. The source-of-truth service is the only allowed HTTP access layer; the hooks are realigned (or deleted) so that they call `operacionesService.*` only.

## Purpose

The hooks layer currently has 4 hook files plus 4 utility files, all of which either call direct `api.get/post` (bypassing the service), call service methods that do not exist, or import types that are not in the source of truth. The slim trio `useCalculoFactura` + `useCalculoProceso` + `useValidacionPrecios` is reduced to a single rewritten hook `useCalculoFactura`. The flow hook `useCalculoFacturacionFlow` is deleted (per `dead-code-purge.md`). The cycle helper is moved to `app/utils/operaciones/cycle.ts` (per `utils-consolidation.md`).

## MODIFIED Requirements

### Requirement: use-calculo-factura-rewrite

The file `app/hooks/operaciones/use-calculo-factura.ts` SHALL be rewritten to:

1. Call `operacionesService.getRevisarCalculosBuscarPrefacturas(cicloId, periodoId, ...)` exactly once, replacing the two direct `api.get('/calculo-prefactura-encabezado')` + `api.get('/calculo-prefactura-cargos')` calls.
2. Return `{ data, isLoading, error }` with `error: string | null` and SHALL NOT use the magic sentinel `'NO_LECTURAS_CERRADAS'`. A separate `estadoCierre: 'cerrado' | 'no-cerrado' | 'cargando'` field SHALL replace the sentinel.
3. Use `useMemo` (not `useState` + `useEffect`) to compute `filteredData` from `data + searchTerm`. The `setFilteredData` write inside the effect SHALL be removed.
4. Declare an inline `type CalculoPrefacturaRow = { ... }` derived from the return shape of `getRevisarCalculosBuscarPrefacturas` (the service method is untyped; the row type is therefore local and declared in this file). The phantom types `CalculoPrefacturaCompleto`, `CalculoPrefacturaDetalle`, `CalculoPrefacturaCargoResponse` SHALL NOT be imported.

#### Scenario: rewritten-hook-calls-service-and-uses-useMemo

- GIVEN the source-of-truth method `operacionesService.getRevisarCalculosBuscarPrefacturas` (declared at `app/services/operacionesService.ts:561`)
- AND a caller of `useCalculoFactura({periodoFormateado: "012026", cicloId: 1})`
- WHEN the hook is invoked with valid inputs
- THEN it SHALL call `operacionesService.getRevisarCalculosBuscarPrefacturas(1, "012026")` exactly once
- AND it SHALL expose `{ data, isLoading, error, estadoCierre }` with `error: string | null` and no magic-sentinel string
- AND `filteredData` SHALL be derived via `useMemo` from `data + searchTerm`; `setFilteredData` SHALL NOT exist anywhere in the file
- AND a new `use-calculo-factura.test.ts` (replacing the deleted one) covers: (a) successful load returns `data` and `error === null`, (b) a 404 response sets `estadoCierre === 'no-cerrado'` and `error` is a Spanish message, (c) any other error sets `error` to a non-empty string returned by `extraerMensajeError`

#### Scenario: phantom-type-imports-removed

- GIVEN the phantom types `CalculoPrefacturaCompleto`, `CalculoPrefacturaDetalle`, `CalculoPrefacturaCargoResponse` that are not in `app/types/operaciones.ts`
- WHEN this change is merged
- THEN `grep "CalculoPrefactura" app/hooks/operaciones/use-calculo-factura.ts` returns 0 matches
- AND `pnpm typecheck` passes

### Requirement: use-calculo-proceso-removal

The file `app/hooks/operaciones/use-calculo-proceso.ts` SHALL be removed. Its two responsibilities — `handleLanzarCalculo` (calls `api.post('lanzar-calculo-facturacion')`) and `handleAceptarCalculo` (calls `api.post('generar-detalle-factura')`) — SHALL move into the calling component `revisar-calculo-factura-component.tsx` as direct calls to `operacionesService.postRevisarCalculosLanzarCalculo` and `operacionesService.postRevisarCalculosAceptar` respectively. The `selectedContratos` state and selection logic remain in the component.

#### Scenario: hook-deleted-component-calls-service

- GIVEN the source-of-truth methods `operacionesService.postRevisarCalculosLanzarCalculo` (`app/services/operacionesService.ts:541`) and `operacionesService.postRevisarCalculosAceptar` (`app/services/operacionesService.ts:596`)
- WHEN this change is merged
- THEN `app/hooks/operaciones/use-calculo-proceso.ts` no longer exists
- AND `revisar-calculo-factura-component.tsx` calls `operacionesService.postRevisarCalculosLanzarCalculo({...RevisarCalculosLanzarCalculoRequest})` and `operacionesService.postRevisarCalculosAceptar(periodoId)` directly
- AND `grep -r "useCalculoProceso" app/` returns 0 matches
- AND `pnpm typecheck` passes

### Requirement: use-validacion-precios-removal

The file `app/hooks/operaciones/use-validacion-precios.ts` SHALL be removed. Its three state slices (`totalValidos`, `totalConfirmados`, `totalPendientes`) are collapsed into a single `useMemo`-derived result, computed inline in the calling component. The hook's two `api.get` calls (to non-existent `/ConsultarPreciosUno` and `/ConsultarPreciosDos`) SHALL be replaced by a single call to `operacionesService.gerRevisarPreciosData(mes, anio)` (note the typo "ger" is preserved as the source-of-truth method name). The phantom types `RevisarPrecioUno` and `RevisarPrecioDos` SHALL NOT be imported.

#### Scenario: hook-deleted-component-calls-gerrevisar

- GIVEN the source-of-truth method `operacionesService.gerRevisarPreciosData` (declared at `app/services/operacionesService.ts:253`, returning `GET /revision-precios/consultar`)
- WHEN this change is merged
- THEN `app/hooks/operaciones/use-validacion-precios.ts` no longer exists
- AND `revisar-calculo-factura-component.tsx` calls `operacionesService.gerRevisarPreciosData(mes, anio)` exactly once
- AND the totals (`confirmados`, `pendientes`, `total`) are derived via `useMemo` from the result; three separate `useState<number>` SHALL NOT be used
- AND `grep -r "useValidacionPrecios\|RevisarPrecioUno\|RevisarPrecioDos" app/` returns 0 matches
- AND `pnpm typecheck` passes

## REMOVED Requirements

### Requirement: utils-error-handler-deletion

The file `app/hooks/operaciones/utils/error-handler.ts` SHALL be deleted. Its 5 exports (`ErrorResponse`, `extraerErrorMessage`, `validarRespuestaAPI`, `es404`, `extraerCodigoEstatus`) are subsumed by the new shared `extraerMensajeError(error: unknown): string` in `app/utils/operaciones/error.ts` (see `utils-consolidation.md`). After the deletions of `use-calculo-proceso.ts`, `use-validacion-precios.ts`, `use-calculo-facturacion-flow.ts`, and the `utils/price-validator.ts` and `utils/data-combiner.ts` files (this spec), the only remaining consumer was the rewritten `use-calculo-factura.ts` which now inlines a single `extraerMensajeError` call (no separate file).

#### Scenario: error-handler-deleted-no-broken-imports

- WHEN this change is merged
- THEN `app/hooks/operaciones/utils/error-handler.ts` no longer exists
- AND `grep -r "from .*utils/error-handler\|from .*utils/operaciones/error-handler" app/` returns 0 matches
- AND `pnpm typecheck` passes

### Requirement: utils-data-combiner-deletion

The file `app/hooks/operaciones/utils/data-combiner.ts` SHALL be deleted. Its 3 exports (`combinarPrefactura`, `calcularTotalFacturado`, `validarDatosCombinados`) consume the phantom `CalculoPrefactura*` types. The combination logic is inlined as `useMemo` in the rewritten `use-calculo-factura.ts`.

#### Scenario: data-combiner-deleted

- WHEN this change is merged
- THEN `app/hooks/operaciones/utils/data-combiner.ts` no longer exists
- AND `grep -r "combinarPrefactura\|calcularTotalFacturado\|validarDatosCombinados\|data-combiner" app/` returns 0 matches
- AND `pnpm typecheck` passes

### Requirement: utils-price-validator-deletion

The file `app/hooks/operaciones/utils/price-validator.ts` SHALL be deleted. Its 4 exports consume the phantom `RevisarPrecioUno` / `RevisarPrecioDos` types. After the deletion of `use-validacion-precios.ts` (this spec), no consumer remains.

#### Scenario: price-validator-deleted

- WHEN this change is merged
- THEN `app/hooks/operaciones/utils/price-validator.ts` no longer exists
- AND `grep -r "price-validator\|PriceValidationResult\|filtrarPreciosValidos" app/` returns 0 matches
- AND `pnpm typecheck` passes

## Cross-References

- Source-of-truth method for `useCalculoFactura` rewrite: `app/services/operacionesService.ts:561-594` (`getRevisarCalculosBuscarPrefacturas`)
- Source-of-truth method for `useCalculoProceso` deletion targets: `app/services/operacionesService.ts:541-559` (`postRevisarCalculosLanzarCalculo`) and `app/services/operacionesService.ts:596-611` (`postRevisarCalculosAceptar`)
- Source-of-truth method for `useValidacionPrecios` deletion target: `app/services/operacionesService.ts:253-273` (`gerRevisarPreciosData` with the preserved typo "ger")
- Source-of-truth request type for lanzar-calculo: `app/types/operaciones.ts:208-218` (`RevisarCalculosLanzarCalculoRequest`)
- Phantom endpoints the deleted hooks called: `/ConsultarPreciosUno`, `/ConsultarPreciosDos`, `/calculo-prefactura-encabezado`, `/calculo-prefactura-cargos`, `/lanzar-calculo-facturacion`, `/generar-detalle-factura` — none of which appear in `app/services/operacionesService.ts`
- Phantom types referenced: `CalculoPrefacturaCompleto`, `CalculoPrefacturaDetalle`, `CalculoPrefacturaCargoResponse`, `CalculoPrefacturaCargo`, `RevisarPrecioUno`, `RevisarPrecioDos` — none of which appear in `app/types/operaciones.ts`

See also: `dead-code-purge.md` (deletes `use-calculo-facturacion-flow.ts` and the 3 unrunnable test files), `utils-consolidation.md` (extracts `extraerMensajeError` to `app/utils/operaciones/error.ts`).
