# Spec: dead-code-purge

> Domain: cross-cutting — applies to all of `app/hooks/operaciones/`, `app/services/operations/`, and the dead-code copy under `app/routes/dashboard/reportes/components/operaciones/`.

## Purpose

Remove every file in this change that has **zero** consumers in the rest of the codebase, including the parallel (half-built) `app/services/operations/*` architecture and the 51-file mirror under `app/routes/dashboard/reportes/components/operaciones/`. These deletions are pure negative LOC, easy to verify with `grep` before merging, and eliminate the largest sources of future drift. This spec is independent of every other spec: each requirement is verifiable in isolation and lands as Slice 1 of the chained-PR plan.

## ADDED Requirements

### Requirement: collateral-dead-directory-removal

The directories `app/services/operations/` and `app/routes/dashboard/reportes/components/operaciones/` SHALL NOT exist in the repository after this change is merged. Each directory deletion is justified by an empty grep result against the rest of the codebase.

#### Scenario: services-operations-directory-deleted

- GIVEN the directory `app/services/operations/` containing 6 files (`index.ts`, `types.ts`, `periodos.service.ts`, `pricing.service.ts`, `preparation.service.ts`, `billing-calculation.service.ts`)
- WHEN this change is merged
- THEN `ls app/services/operations/` returns "No such file or directory"
- AND `grep -r "services/operations" app/` returns 0 matches
- AND `pnpm typecheck` still passes (no consumer references the directory)

#### Scenario: reportes-components-operaciones-directory-deleted

- GIVEN the directory `app/routes/dashboard/reportes/components/operaciones/` containing 51 files in 10 subdirectories
- WHEN this change is merged
- THEN `ls app/routes/dashboard/reportes/components/operaciones/` returns "No such file or directory"
- AND `grep -r "dashboard/reportes/components/operaciones" app/` returns 0 matches
- AND `pnpm typecheck` still passes

## REMOVED Requirements

### Requirement: use-calculo-facturacion-flow-removal

The file `app/hooks/operaciones/use-calculo-facturacion-flow.ts` (426 LOC) SHALL be removed from the repository. The five step runners inside it (`lanzarCalculoFacturacion`, `obtenerIdentificadorProceso`, `verificarEstadoProceso`, `consultarEncabezadoPrefactura`, `consultarCargosPrefactura`) are NEVER called from any production route; routes use the slimmer trio of `useCalculoFactura` + `useCalculoProceso` + `useValidacionPrecios`. The `debugMode` state is exposed but never read. The remaining `useCalculoProceso` and `useValidacionPrecios` hooks are themselves deleted by the `hooks-realignment` spec.

#### Scenario: flow-hook-file-deleted-and-no-remaining-references

- GIVEN the file `app/hooks/operaciones/use-calculo-facturacion-flow.ts` exists
- WHEN this change is merged
- THEN the file no longer exists
- AND `grep -r "use-calculo-facturacion-flow" app/` returns 0 matches
- AND `grep -r "ejecutarFlujoCompleto" app/` returns 0 matches (the hook's only public entry point)
- AND `pnpm typecheck` still passes

### Requirement: dead-hook-test-files-removal

The following unrunnable test files SHALL be removed because the hooks they exercise are themselves removed by this change:

- `app/hooks/operaciones/use-calculo-factura.test.ts` (141 LOC)
- `app/hooks/operaciones/use-calculo-proceso.test.ts` (163 LOC)
- `app/hooks/operaciones/use-validacion-precios.test.ts` (168 LOC)
- `app/components/operaciones/revisar-calculo-factura/revisar-calculo-factura-component.test.tsx` (275 LOC)

The first three tests mock the corresponding hooks with `vi.mock` and will be orphaned by the hook deletions. The fourth test mocks the same hooks and is no longer representative of the rewritten component contract.

#### Scenario: dead-test-files-removed

- GIVEN the four unrunnable test files listed above
- WHEN this change is merged
- THEN each file no longer exists
- AND `grep -r "use-calculo-factura.test\|use-calculo-proceso.test\|use-validacion-precios.test" app/` returns 0 matches
- AND `pnpm typecheck` still passes

## Cross-References

- Source-of-truth service class declaration: `app/services/operacionesService.ts:26` (`class OperacionesService`)
- Source-of-truth method index: `app/services/operacionesService.ts:680` (`export const operacionesService = new OperacionesService()`)
- The `use-calculo-facturacion-flow` hook calls 5 service methods (`lanzarCalculoFacturacion`, `obtenerIdentificadorProceso`, `verificarEstadoProceso`, `consultarEncabezadoPrefactura`, `consultarCargosPrefactura`) that do not exist in the source-of-truth class — verifiable by `grep "async \(lanzarCalculoFacturacion\|obtenerIdentificadorProceso\|verificarEstadoProceso\|consultarEncabezadoPrefactura\|consultarCargosPrefactura\)" app/services/operacionesService.ts` returning 0 matches
- Parallel `services/operations/` directory confirmed dead: `grep -r "from .*services/operations" app/` returns 0 matches
- `app/routes/dashboard/reportes/components/operaciones/` confirmed dead: `grep -r "dashboard/reportes/components/operaciones" app/` returns 0 matches outside the explore report

See also: `utils-consolidation.md` (deletes `revisar-precio-helpers.ts`, `confirmation-helpers.ts`, `formatters.ts`); `hooks-realignment.md` (deletes `use-calculo-proceso.ts`, `use-validacion-precios.ts`, `utils/data-combiner.ts`, `utils/error-handler.ts`, `utils/price-validator.ts`).
