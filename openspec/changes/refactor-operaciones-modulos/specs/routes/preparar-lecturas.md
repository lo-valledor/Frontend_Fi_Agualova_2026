# Spec: preparar-lecturas

> Domain: routes — `app/routes/dashboard/operaciones/preparar-lecturas.tsx`, `app/components/operaciones/preparar-lecturas/`.

## Purpose

The `preparar-lecturas` feature has 1 phantom service call in the route (`operacionesService.getAsignacionSectores(ciclo, periodo)`), 4 phantom type imports (`PeriodoAbierto`, `ConsultarAsignacionSectores`, `ConsultarSectores`, `ValidarSectoresPendientes`, `OpcionesPrepararLecturas`), 2 dead sub-components (`tabla-asignacion-sectores.tsx`, `tabla-lecturas-pendientes.tsx`), and 1 local copy of the ciclo helper. The feature is realigned to use only source-of-truth service methods (`getPrepararLecturasData`, `getBuscarNichos`, `postGenerarLecturas`); the 2 dead sub-components are deleted; the local ciclo helper is removed.

## MODOVIED Requirements

### Requirement: preparar-lecturas-route-thin

The route file `app/routes/dashboard/operaciones/preparar-lecturas.tsx` SHALL NOT define a `clientLoader`. The phantom call `operacionesService.getAsignacionSectores(ciclo, periodo)` (the method does not exist in the source of truth) SHALL be removed. The route SHALL be a thin wrapper that imports the realigned component, sets breadcrumbs, and renders.

#### Scenario: route-has-no-phantom-call

- GIVEN the source-of-truth service class with 31 methods (`app/services/operacionesService.ts:26-678`) — none named `getAsignacionSectores*`
- WHEN this change is merged
- THEN `grep -rE "getAsignacionSectores" app/` returns 0 matches
- AND `grep "clientLoader\|useLoaderData" app/routes/dashboard/operaciones/preparar-lecturas.tsx` returns 0 matches
- AND `pnpm typecheck` passes

### Requirement: preparar-lecturas-component-uses-source-of-truth-service

The component SHALL call only source-of-truth service methods: `getPrepararLecturasData` (`app/services/operacionesService.ts:133-159`), `getBuscarNichos(cicloId, periodoId)` (`app/services/operacionesService.ts:178-201`), and `postGenerarLecturas(req)` (`app/services/operacionesService.ts:161-176`). The `OpcionesPrepararLecturas` type is declared inline if still needed (per the umbrella `components-realignment.md` rule).

#### Scenario: component-calls-source-methods

- GIVEN the source-of-truth methods listed above
- AND the request type `PrepararLecturasGenerarRequest` (`app/types/operaciones.ts:181-185`)
- WHEN this change is merged
- THEN `grep "api\\.\\(get\\|post\\)" app/components/operaciones/preparar-lecturas/` returns 0 matches
- AND the file imports `getPrepararLecturasData`, `getBuscarNichos`, `postGenerarLecturas` from `~/services/operacionesService`
- AND a colocated test verifies the `onGenerar` handler calls `postGenerarLecturas` with a `PrepararLecturasGenerarRequest` payload

### Requirement: phantom-type-imports-removed

The component SHALL NOT import `PeriodoAbierto`, `ConsultarAsignacionSectores`, `ConsultarSectores`, or `ValidarSectoresPendientes` from `~/types/operaciones` (none exist in the source of truth). The replacements SHALL be:

- `PeriodoAbierto` → `type PeriodoAbierto = PrepararLecturasFiltrosPeriodosResponse` declared inline
- `ConsultarAsignacionSectores`, `ConsultarSectores`, `ValidarSectoresPendientes` → no replacement needed; the corresponding code paths are removed with the deleted sub-components

#### Scenario: phantom-types-removed

- GIVEN the source-of-truth type `PrepararLecturasFiltrosPeriodosResponse` (`app/types/operaciones.ts:166-169`)
- WHEN this change is merged
- THEN `grep -rE "\\b(ConsultarAsignacionSectores|ConsultarSectores|ValidarSectoresPendientes)\\b" app/components/operaciones/preparar-lecturas/` returns 0 matches
- AND `grep -rE "^import.*\\bPeriodoAbierto\\b.*from" app/components/operaciones/preparar-lecturas/` returns 0 matches (the alias is declared inline)
- AND `pnpm typecheck` passes

### Requirement: dead-subcomponents-deletion

The files `tabla-asignacion-sectores.tsx` (542 LOC) and `tabla-lecturas-pendientes.tsx` (175 LOC) SHALL be deleted. Both consume phantom types and have no source-of-truth backing. The features they implement are removed; the main component renders without them.

#### Scenario: dead-subcomponents-deleted

- WHEN this change is merged
- THEN neither file exists
- AND `ls app/components/operaciones/preparar-lecturas/` contains only the main `preparar-lecturas-component.tsx` and any surviving sub-components (e.g. `columns.tsx` if it remains after realignment)
- AND `grep -rE "tabla-asignacion-sectores|tabla-lecturas-pendientes" app/` returns 0 matches
- AND `pnpm typecheck` passes

### Requirement: local-cycle-helper-replaced

The local `obtenerCicloParaAPI` at `app/components/operaciones/preparar-lecturas/preparar-lecturas-component.tsx:99` SHALL be removed; the call site SHALL use `convertirCicloParaAPI` imported from `~/utils/operaciones` (per `utils-consolidation.md`).

#### Scenario: local-cycle-helper-replaced

- WHEN this change is merged
- THEN `grep -rE "obtenerCicloParaAPI" app/` returns 0 matches
- AND the file imports `convertirCicloParaAPI` from `~/utils/operaciones`

## Cross-References

- Source-of-truth methods: `getPrepararLecturasData` (`app/services/operacionesService.ts:133-159`), `getBuscarNichos` (`app/services/operacionesService.ts:178-201`), `postGenerarLecturas` (`app/services/operacionesService.ts:161-176`)
- Source-of-truth types: `PrepararLecturasFiltrosCiclosResponse` (`app/types/operaciones.ts:160-163`), `PrepararLecturasFiltrosPeriodosResponse` (`app/types/operaciones.ts:166-169`), `PrepararLecturasBuscarNichosRequest` (`app/types/operaciones.ts:172-178`), `PrepararLecturasGenerarRequest` (`app/types/operaciones.ts:181-185`)
- Phantom method: `getAsignacionSectores` (not in source of truth)
- Phantom types: `ConsultarAsignacionSectores`, `ConsultarSectores`, `ValidarSectoresPendientes`, `OpcionesPrepararLecturas`, `TablaAsignacionSectoresProps`

See also: `utils-consolidation.md` (cycle helper), `components-realignment.md`, `style-and-convention-sweep.md`.
