# Spec: components-realignment

> Domain: cross-cutting — `app/components/operaciones/**` (all 10 subdomains). The source-of-truth service is the only allowed HTTP access layer; the components are realigned so that all data fetching goes through `operacionesService.*` (or is deleted), and all type imports are resolved against `app/types/operaciones.ts` or are local inline `type` aliases (no new type files).

## Purpose

The 9 surviving subdomains of `app/components/operaciones/` (10th is fully deleted — `crear-archivos-sap` per `crear-archivos-sap.md`) plus 2 fully-deleted subdomains (`anular-factura-impresa`, partially) each contain phantom type imports, phantom service calls, shape mismatches, and intra-directory dead code. This spec is the umbrella: each individual route spec (`routes/*.md`) covers the route + component realignment for a single subdomain; this spec covers the cross-subdomain rules that every realignment MUST follow.

## ADDED Requirements

### Requirement: phantom-type-imports-forbidden

Every file under `app/components/operaciones/` SHALL NOT import any type from `~/types/operaciones` that is not in the source-of-truth file. The full list of FORBIDDEN type names is enumerated below; the full list of ALLOWED type names is the 29 types exported by `app/types/operaciones.ts`.

**Forbidden type imports (per `proposal.md` §3.5):** `Anio`, `Periodos`, `Ciclo`, `PeriodoAbierto`, `EstadoCierreLecturas`, `RevisarPrecioUno`, `RevisarPrecioDos`, `ConsultarMantenedorRevisionCorte`, `ConsultarAsignacionSectores`, `ConsultarSectores`, `OpcionesPrepararLecturas`, `ValidarSectoresPendientes`, `CalculoPrefacturaCompleto`, `CalculoPrefacturaDetalle`, `CalculoPrefacturaCargoResponse`, `CalculoPrefacturaCargo`, `IdentificadorProceso`, `EstadoProceso`, `TotalesCorteReposicion`, `ConsultaMedidorAntiguoResponse`, `ConsultaMedidorNuevoResponse`, `DetalleMedidorAntiguo`, `DetalleMedidorNuevo`, `MedidorAntiguo`, `MedidorNuevo`, `PreciosCargoEnel`, `PreciosCargoAgualova`, `DetallepreciosCargoAgualova`, `TablaValoresEnelProps`, `TablaValoresAgualovaProps`, `AntiguoMedidorFormProps`, `NuevoMedidorFormProps`, `NuevoContratoFormProps`, `DetalleMedidorAntiguoProps`, `DetalleMedidorNuevoProps`, `DialogAgregarPreciosProps`, `TablaAsignacionSectoresProps`.

#### Scenario: no-phantom-type-imports-in-components

- GIVEN the source-of-truth types file at `app/types/operaciones.ts` (29 exports)
- AND the list of 36 forbidden type names above
- WHEN this change is merged
- THEN `grep -rE "from '~/types/operaciones'" app/components/operaciones/ | grep -E "\\b(Anio|Periodos|Ciclo|PeriodoAbierto|EstadoCierreLecturas|RevisarPrecioUno|RevisarPrecioDos|...full list...)\\b"` returns 0 matches
- AND `pnpm typecheck` passes

### Requirement: phantom-service-calls-forbidden

Every file under `app/components/operaciones/` SHALL NOT call `api.get(...)` or `api.post(...)` with a hardcoded URL path string for an endpoint that the source-of-truth `operacionesService` class does not provide. All HTTP access SHALL go through `operacionesService.*` method calls (with the `ger` typo preserved). Files that previously called non-existent service methods SHALL either (a) be rewritten to call the source-of-truth method, or (b) be deleted.

#### Scenario: no-direct-api-calls-with-hardcoded-urls

- GIVEN the source-of-truth service class with 31 methods (`app/services/operacionesService.ts:26-678`)
- WHEN this change is merged
- THEN `grep -rE "api\\.(get|post)\\(['\"](?!http)" app/components/operaciones/` returns 0 matches
- AND `pnpm typecheck` passes

### Requirement: local-type-aliases-inline-only

For any type that is genuinely needed by a consumer but is NOT in the source of truth, the type SHALL be declared as a local `type` alias or `interface` inside the consumer file (or, in narrow cases, a sibling sub-component file). No new files SHALL be created under `app/types/operaciones/`. No new subdirectory SHALL be created under `app/components/operaciones/_shared/` or `app/components/shared/` purely for this refactor.

#### Scenario: types-are-local-no-new-type-files

- WHEN this change is merged
- THEN `ls app/types/operaciones/` returns exactly 1 file (`operaciones.ts`); the source-of-truth file is unchanged
- AND `find app/components/operaciones/ -name "_shared" -type d` returns 0 matches (no new shared subdirectory)
- AND every locally-declared type is annotated as `type X = { ... }` (or `interface X extends ...`) within a single file

### Requirement: shared-helpers-via-barrel-only

Every consumer in `app/components/operaciones/` SHALL import the shared helpers (`downloadBlob`, `formatPeriodoId`, `convertirCicloParaAPI`, `extraerMensajeError`) from the `~/utils/operaciones` barrel index, not from a deep path. The barrel re-exports the new helper files (per `utils-consolidation.md`).

#### Scenario: helpers-imported-from-barrel

- WHEN this change is merged
- THEN `grep -rE "from '~/utils/operaciones/(download|period|cycle|error|constants|validations)'" app/components/operaciones/` returns 0 matches
- AND every helper import uses `from '~/utils/operaciones'` (or its subpath only when justified by a re-export chain)

## Cross-References

- Source-of-truth types list: `app/types/operaciones.ts:1-250` (29 exported types)
- Source-of-truth service method list: `app/services/operacionesService.ts:26-678` (31 methods, including the typo'd `gerRevisarPreciosData` at line 253)
- Frozen-source-of-truth rule: the two files `app/types/operaciones.ts` and `app/services/operacionesService.ts` SHALL NOT be modified by this change. This is verified by `git diff --stat` of those two files being empty in any PR in the chained series.

See also: each `routes/{subdomain}.md` spec covers the per-subdomain realignment that applies the rules in this umbrella spec.
