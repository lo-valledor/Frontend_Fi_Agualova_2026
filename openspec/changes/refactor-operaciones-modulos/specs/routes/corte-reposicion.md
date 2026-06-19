# Spec: corte-reposicion

> Domain: routes — `app/routes/dashboard/operaciones/corte-reposicion.tsx`, `app/components/operaciones/corte-reposicion/`.

## Purpose

The `corte-reposicion` feature has the largest service shape mismatch in the target set: the route calls `operacionesService.getCorteReposicionData()` (which returns `CorteReposicionResumenResponse` — totals like `pendientes`, `liberados`, `cortados`) but the component uses the result as a list of `ConsultarMantenedorRevisionCorte` (a phantom type). The component also calls 8+ direct `api.get/post` endpoints that are not in the source of truth. Per the user strategy: align to the actual service shape, delete features that have no source-of-truth backing, and accept the loss of the 4 features (modificar revision, ingresar revision, eliminar revision, exportar) that the user has accepted to drop.

## MODIFIED Requirements

### Requirement: corte-reposicion-component-uses-correct-shape

The component SHALL treat `operacionesService.getCorteReposicionData()` as a `CorteReposicionResumenResponse` (totals: `pendientes`, `liberados`, `cortados`, `reposicionSolicitada`, `total`, `procesoIniciado`) and render the resumen stats card. The previous behavior of treating it as a list of `ConsultarMantenedorRevisionCorte` SHALL be removed. The list is instead sourced from `operacionesService.getBuscarCorteReposicion(acometida?)` (declared at `app/services/operacionesService.ts:348-368`).

#### Scenario: resumen-stats-card-renders-totals

- GIVEN the source-of-truth type `CorteReposicionResumenResponse` (`app/types/operaciones.ts:69-76`)
- AND the source-of-truth method `getCorteReposicionData` (`app/services/operacionesService.ts:330-346`)
- WHEN this change is merged
- THEN the stats card renders `{pendientes}`, `{liberados}`, `{cortados}`, `{reposicionSolicitada}`, `{total}` from the resumen response
- AND `grep "ConsultarMantenedorRevisionCorte" app/components/operaciones/corte-reposicion/` returns 0 matches

### Requirement: corte-reposicion-component-removes-phantom-endpoints

The component SHALL NOT call any of the following phantom endpoints: `consulta-mantenedor-revision-corte`, `consulta-registros-revision`, `modificar-revision`, `ingresar-revision`, `eliminar-revision`, `exportar-*`. Each is replaced as follows:

- `consulta-mantenedor-revision-corte` → use `getCorteReposicionData` (resumen) for stats and `getBuscarCorteReposicion(acometida?)` for the list
- `consulta-registros-revision` → use `getBuscarCorteReposicion`
- `modificar-revision`, `ingresar-revision`, `eliminar-revision` → deleted; the "modificar/ingresar/eliminar" buttons are removed from the UI
- `exportar-*` → deleted; the 3 export buttons use the new `downloadBlob` helper (per `utils-consolidation.md`) only if the data is still in memory; otherwise the buttons are removed

The component SHALL still call the 3 lifecycle methods `postIniciarProcesoCorteReposicion`, `postFinalizarProcesoCorteReposicion`, `postActualizarProcesoCorteReposicion` (declared in source of truth) and the 3 dialog methods `postLiberarAcometida`, `postRegistrarCorte`, `postSolicitarReposicion` (declared in source of truth).

#### Scenario: phantom-endpoint-calls-removed

- GIVEN the source-of-truth service methods listed above
- WHEN this change is merged
- THEN `grep -rE "api\\.(get|post)\\(['\"]" app/components/operaciones/corte-reposicion/` returns 0 matches
- AND `grep -rE "\\b(modificar|ingresar|eliminar)-revision\\b" app/components/operaciones/corte-reposicion/` returns 0 matches
- AND a colocated test `corte-reposicion-component.test.tsx` (new) verifies the lifecycle buttons call the source-of-truth service methods

### Requirement: lost-features-documented-as-non-goals

The following 4 features SHALL be documented as explicit non-goals of this refactor (the user accepted the loss per `proposal.md` §3.4):

- Modificar revision: button removed; no edit flow
- Ingresar revision: button removed; no create flow
- Eliminar revision: button removed; no delete flow
- Exportar (3 buttons): removed from the UI; no export flow

These features MAY be re-introduced in a future change if the source-of-truth service is extended with the corresponding methods.

#### Scenario: lost-features-not-present-in-ui

- WHEN this change is merged
- THEN the UI contains no "Modificar", "Ingresar", "Eliminar" revision buttons
- AND the UI contains no "Exportar" buttons (or the buttons are present but `onClick` is a no-op with a tooltip "Funcionalidad no disponible")
- AND the route navigation still works (`/dashboard/operaciones/corte-reposicion` renders the page)

### Requirement: route-thin-wrapper

The route file `app/routes/dashboard/operaciones/corte-reposicion.tsx` SHALL be a thin wrapper that imports the realigned component, sets breadcrumbs, and renders. The route SHALL NOT define a `clientLoader` (no upstream data is fetched at route level; the component fetches resumen on mount and list on search). The phantom call `operacionesService.getCorteReposicionData()` from the route loader SHALL be removed.

#### Scenario: route-is-thin

- WHEN this change is merged
- THEN `wc -l app/routes/dashboard/operaciones/corte-reposicion.tsx` shows fewer than 30 LOC
- AND `grep "clientLoader\|useLoaderData" app/routes/dashboard/operaciones/corte-reposicion.tsx` returns 0 matches
- AND `pnpm typecheck` passes

## Cross-References

- Source-of-truth service methods used: `getCorteReposicionData` (`app/services/operacionesService.ts:330-346`), `getBuscarCorteReposicion` (`app/services/operacionesService.ts:348-368`), `postIniciarProcesoCorteReposicion` (`app/services/operacionesService.ts:370-383`), `postFinalizarProcesoCorteReposicion` (`app/services/operacionesService.ts:385-398`), `postActualizarProcesoCorteReposicion` (`app/services/operacionesService.ts:400-416`), `postLiberarAcometida` (`app/services/operacionesService.ts:437-450`), `postRegistrarCorte` (`app/services/operacionesService.ts:452-468`), `postSolicitarReposicion` (`app/services/operacionesService.ts:470-486`)
- Source-of-truth types used: `CorteReposicionResumenResponse` (`app/types/operaciones.ts:69-76`), `CorteReposicionLiberarRequest` (`app/types/operaciones.ts:96-99`), `CorteReposicionRegistrarCorteRequest` (`app/types/operaciones.ts:102-106`)
- Phantom type dropped: `ConsultarMantenedorRevisionCorte` (not in source-of-truth types)
- Phantom endpoints dropped: `/consulta-mantenedor-revision-corte`, `/consulta-registros-revision`, `/modificar-revision`, `/ingresar-revision`, `/eliminar-revision`, `/exportar-*`

See also: `utils-consolidation.md` (`downloadBlob` helper), `components-realignment.md`, `style-and-convention-sweep.md`.
