# Spec: cerrar-lecturas

> Domain: routes — `app/routes/dashboard/operaciones/cerrar-lecturas.tsx`, `app/components/operaciones/cerrar-lecturas/`.

## Purpose

The `cerrar-lecturas` feature has 3 phantom type imports (`Ciclo`, `PeriodoAbierto`, `EstadoCierreLecturas`), 1 phantom service call (`operacionesService.getCerrarLecturasData()` in the route), 2 phantom `api.get/post` calls inside the component (`/estado-cierre-lecturas`, `/cerrar-lecturas-nicho`), 1 local copy of the ciclo helper, 1 local copy of the periodo formatter, and 1 dead sub-component (`alert-cerrar-lecturas.tsx`). The route is realigned to be a thin wrapper; the component is realigned to use only source-of-truth service methods; the dead sub-component is deleted; `EstadoCierreLecturas` is declared inline.

## MODIFIED Requirements

### Requirement: cerrar-lecturas-route-thin

The route file `app/routes/dashboard/operaciones/cerrar-lecturas.tsx` SHALL NOT define a `clientLoader` (no upstream data is fetched). It SHALL import the realigned component, set breadcrumbs, and render. The phantom call `operacionesService.getCerrarLecturasData()` SHALL be removed (the method does not exist in the source of truth).

#### Scenario: route-has-no-clientloader-and-no-phantom-call

- GIVEN the source-of-truth service class with 31 methods (`app/services/operacionesService.ts:26-678`) — none named `getCerrarLecturasData*`
- WHEN this change is merged
- THEN `grep "clientLoader\|getCerrarLecturasData\|useLoaderData" app/routes/dashboard/operaciones/cerrar-lecturas.tsx` returns 0 matches
- AND `pnpm typecheck` passes

### Requirement: cerrar-lecturas-component-realigns-types

The component file SHALL NOT import `Ciclo`, `PeriodoAbierto`, or `EstadoCierreLecturas` from `~/types/operaciones` (none exist in the source of truth). The replacements SHALL be:

- `Ciclo` → `CerrarLecturasFiltrosCiclosResponse` (a type alias `type Ciclo = CerrarLecturasFiltrosCiclosResponse[number]` is declared inline in the file)
- `PeriodoAbierto` → `CerrarLecturasFiltrosPeriodosResponse` (same inline alias pattern)
- `EstadoCierreLecturas` → inline `type EstadoCierreLecturas = { ... }` declared in the file

#### Scenario: phantom-types-replaced

- GIVEN the source-of-truth types `CerrarLecturasFiltrosCiclosResponse` (`app/types/operaciones.ts:45-48`) and `CerrarLecturasFiltrosPeriodosResponse` (`app/types/operaciones.ts:51-54`)
- WHEN this change is merged
- THEN `grep -rE "\\b(Ciclo|PeriodoAbierto|EstadoCierreLecturas)\\b" app/components/operaciones/cerrar-lecturas/` shows: (a) `Ciclo`/`PeriodoAbierto` only as the right-hand side of an inline alias declaration, (b) `EstadoCierreLecturas` only as an inline `type` declaration
- AND the file imports the two source-of-truth types from `~/types/operaciones`
- AND `pnpm typecheck` passes

### Requirement: cerrar-lecturas-component-removes-phantom-api-calls

The component SHALL NOT call `api.get('/estado-cierre-lecturas')` (the endpoint does not exist in the source of truth) and SHALL NOT call `api.post('/cerrar-lecturas-nicho', ...)` (the `CerrarLecturasCerrar` request type exists at `app/types/operaciones.ts:59-63` but no service method exists). The corresponding features are removed; the componente uses only `operacionesService.getCerrarLecturasFiltrosCiclos` + `getCerrarLecturasFiltrosPeriodos` for filter population and a typed `CerrarLecturasCerrarRequest` shape inlined for the close action (the close action is rendered as a disabled button with a "Funcionalidad no disponible" tooltip until a service method is added).

#### Scenario: phantom-api-calls-removed

- WHEN this change is merged
- THEN `grep -rE "api\\.(get|post)\\(['\"]/(estado-cierre-lecturas|cerrar-lecturas-nicho)" app/components/operaciones/cerrar-lecturas/` returns 0 matches
- AND the close-lecturas action button is disabled with a Spanish tooltip "Funcionalidad no disponible"
- AND `pnpm typecheck` passes

### Requirement: alert-cerrar-lecturas-subcomponent-deletion

The file `app/components/operaciones/cerrar-lecturas/alert-cerrar-lecturas.tsx` (239 LOC) SHALL be deleted. The file calls the non-existent endpoint `/cerrar-lecturas-nicho`. The "alert" UI concept is either folded into the main component as an inline banner (if 2+ alerts survive) or removed.

#### Scenario: alert-file-deleted

- WHEN this change is merged
- THEN `app/components/operaciones/cerrar-lecturas/alert-cerrar-lecturas.tsx` no longer exists
- AND `grep -r "alert-cerrar-lecturas" app/` returns 0 matches
- AND `pnpm typecheck` passes

### Requirement: data-table-virtualized-deletion

The file `app/components/operaciones/cerrar-lecturas/data-table-virtualized.tsx` (179 LOC) SHALL be deleted. After the intra-subdomain realignment, the main component uses the shared `DataTable` from `app/components/shared/` (or an inline `DataTable`); no 2+ real sites for a virtualized variant remain in this subdomain (per `utils-consolidation.md` rule).

#### Scenario: virtualized-table-deleted

- WHEN this change is merged
- THEN `app/components/operaciones/cerrar-lecturas/data-table-virtualized.tsx` no longer exists
- AND `grep -r "cerrar-lecturas/data-table-virtualized" app/` returns 0 matches

### Requirement: local-cycle-helper-replaced

The local `obtenerCicloParaAPI` function at `app/components/operaciones/cerrar-lecturas/cerrar-lecturas-component.tsx:102` SHALL be deleted. The call site SHALL use `convertirCicloParaAPI` imported from `~/utils/operaciones` (per `utils-consolidation.md`).

#### Scenario: local-cycle-helper-replaced

- WHEN this change is merged
- THEN `grep -rE "obtenerCicloParaAPI" app/` returns 0 matches
- AND `cerrar-lecturas-component.tsx` imports `convertirCicloParaAPI` from `~/utils/operaciones`

## Cross-References

- Source-of-truth types: `app/types/operaciones.ts:45-48` (`CerrarLecturasFiltrosCiclosResponse`), `app/types/operaciones.ts:51-54` (`CerrarLecturasFiltrosPeriodosResponse`), `app/types/operaciones.ts:59-63` (`CerrarLecturasCerrarRequest`)
- Source-of-truth service: `app/services/operacionesService.ts:1-680` — no `getCerrarLecturasData*`, no `/estado-cierre-lecturas`, no `/cerrar-lecturas-nicho` method exists
- Phantom endpoints: `/estado-cierre-lecturas`, `/cerrar-lecturas-nicho` — not present in the source-of-truth service

See also: `utils-consolidation.md` (cycle helper), `components-realignment.md` (umbrella rules).
