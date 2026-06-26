# Proposal: refactor-operaciones-modulos

> **Slug:** `refactor-operaciones-modulos`
> **Phase:** propose
> **Mode:** interactive
> **Review budget:** 400 LOC per PR
> **Chained PR strategy:** ask-always (forecast below)

## 1. Summary

This change is a **deletion-and-realignment** refactor of `app/hooks/operaciones/`, `app/utils/operaciones/`, `app/components/operaciones/`, and `app/routes/dashboard/operaciones/`. It is **not** a feature-adding exercise. The frozen source-of-truth files (`app/types/operaciones.ts` + `app/services/operacionesService.ts`) define the canonical contract for what the system supports; everything in the target directories that does not conform to that contract gets deleted or rewritten to conform. The two collateral deletes — the parallel `app/services/operations/*` directory (6 files, ~770 LOC, **zero** consumers) and the dead 51-file mirror at `app/routes/dashboard/reportes/components/operaciones/` (~5,200 LOC, **zero** consumers, confirmed by `grep` against the whole repo) — land in this same change because leaving them in place re-creates the drift this refactor removes.

## 2. Strategy

Execution order, from lowest risk to highest risk:

1. **Delete collateral dead directories first.** The two directory deletions are pure negative LOC, easy to verify (zero `import` references — already confirmed), and remove the most visible source of confusion before any realignment starts.
2. **Delete the dead `use-calculo-facturacion-flow.ts` hook.** It is unused in production (the routes use the slim trio `useCalculoFactura` + `useCalculoProceso` + `useValidacionPrecios`); deleting it early shrinks the surface the rest of the slices must reason about.
3. **Consolidate `app/utils/operaciones/`.** The 6 utility files duplicate each other and have missing re-exports in `index.ts`. Unify `convertirCicloParaAPI` + the two local `obtenerCicloParaAPI` variants, add `formatPeriodoId` and `downloadBlob` as new shared helpers, fix the index re-exports, and replace the three local `MONTHS` arrays with imports from `constants.ts`.
4. **Realign routes (thin files).** Strip the 6 phantom `operacionesService.*` calls from `clientLoader`s. The 10 route files become "import component, set breadcrumbs, render" with no upstream data fetching.
5. **Realign hooks.** Rewrite `use-calculo-factura` to call `operacionesService.getRevisarCalculosBuscarPrefacturas` (the only service method that returns the data shape) and remove the duplicated search/filter state. Delete `use-calculo-proceso` and `use-validacion-precios` (their endpoint contracts do not exist in the source of truth); inline their behavior into the calling components using only service-exposed methods (`postRevisarCalculosLanzarCalculo`, `postRevisarCalculosAceptar`, `gerRevisarPreciosData`).
6. **Realign components subdomain-by-subdomain.** 9 subdomains × ~30+ files. For each: remove phantom type imports (derive from source-of-truth types via `Pick`/`Omit`/inline `type` aliases; **no new type files**), remove phantom service calls (delete the feature if no source-of-truth method covers it), align to the actual service shape, fix hardcoded URLs.
7. **Style/convention sweep.** Remove `console.*` statements, fix `toast.error(error as any)` to `toast.error(msg)`, remove unnecessary `import React from "react"`, normalize the `/* eslint-disable no-empty-pattern */` headers (keep — RR7 pattern).
8. **Intra-directory dead-code sweep.** After all realignments, audit each `app/components/operaciones/*` subdirectory for now-unused exports/imports; delete. Audit `app/hooks/operaciones/utils/` for now-unused helpers; delete.

Extractions of shared UI (`<EmptyState>`, `<ErrorState>`, `<LoadingState>`, `<StatsCard>`, `<FilterForm>`) and `useProductTour` are **rejected by default**; they only land if a real 2+ site use case survives the realignment. See §5.

## 3. Deletions (explicit inventory)

### 3.1 Directories to delete in full

| Directory | Files | LOC (bytes) | Why safe |
|---|---|---|---|
| `app/services/operations/` | 6 | ~770 | `grep -r "services/operations" app/` returns **zero** matches. Half-built parallel architecture (per explore §4.4.1). |
| `app/routes/dashboard/reportes/components/operaciones/` | 51 | ~5,200 | `grep -r "dashboard/reportes/components/operaciones" app/` returns **zero** matches outside the explore report. Mirror of `app/components/operaciones/`; no route references it. |

Sub-tree under `app/services/operations/`: `index.ts`, `types.ts`, `periodos.service.ts`, `pricing.service.ts`, `preparation.service.ts`, `billing-calculation.service.ts`. All 6 files deleted.

Sub-trees under `app/routes/dashboard/reportes/components/operaciones/`: `anular-factura-impresa/`, `cambio-medidor/`, `cerrar-lecturas/`, `corte-reposicion/`, `crear-archivos-sap/`, `periodo-facturacion/`, `precios-cargo/`, `preparar-lecturas/`, `revisar-calculo-factura/`, `revisar-precio/`. All 51 files deleted (parent directory removed after).

### 3.2 Files to delete (single-file deletions in target directories)

| File | LOC | Justification |
|---|---|---|
| `app/hooks/operaciones/use-calculo-facturacion-flow.ts` | 426 | Dead in production (explore §3.1, §4.5). `debugMode` state is exposed but never read. Step runners 4–5 are never invoked. Routes use the slim trio. |
| `app/components/operaciones/cerrar-lecturas/data-table-virtualized.tsx` | 179 | Local virtualized table; replaced by the shared `DataTableVirtualized` from `app/components/shared/` if a 2+ site pattern emerges after §6; otherwise deleted (explore §3.3, §4.2.3). |
| `app/components/operaciones/revisar-precio/data-table-virtualized.tsx` | 222 | Same as above. |
| `app/components/operaciones/revisar-calculo-factura/hierarchical-data-table-virtualized.tsx` | 380 | Local virtualized table; not the source of truth pattern (explore §3.3). Delete or replace if shared extraction lands. |
| `app/components/operaciones/precios-cargo/data-table-precios-virtualized.tsx` | 294 | Same as above. |
| `app/components/operaciones/revisar-precio/tabla-valores-enel.tsx` | n/a | After realignment, the data is fetched from `gerRevisarPreciosData` and rendered inline in `revisar-precio-component.tsx`. Sub-component becomes single-use. **Delete.** |
| `app/components/operaciones/revisar-precio/tabla-valores-enerlova.tsx` | n/a | Same. **Delete.** |
| `app/components/operaciones/preparar-lecturas/tabla-asignacion-sectores.tsx` | 542 | After realignment, `operacionesService.getAsignacionSectores` does not exist (explore §4.1.B) and `ConsultarAsignacionSectores` does not exist (explore §4.1.A). Feature has no source-of-truth backing. **Delete.** |
| `app/components/operaciones/preparar-lecturas/tabla-lecturas-pendientes.tsx` | 175 | `ValidarSectoresPendientes` does not exist. **Delete.** |
| `app/components/operaciones/periodo-facturacion/cerrar-periodo.tsx` | 138 | Direct `api.post('/cerrar-periodo', JSON.stringify(periodoId))` — not in service; payload is wrong shape. Source of truth has `postCerrarPeriodoFacturacion(codigo)`. **Delete** and replace inline in the main component. |
| `app/components/operaciones/periodo-facturacion/dialog-abrir-periodo.tsx` | 185 | `api.post('/ingresa-periodo')` — not in service. Local `MONTHS` duplicate. **Delete**; replace with inline dialog that uses `operacionesService.postCrearPeriodoFacturacion`. |
| `app/components/operaciones/periodo-facturacion/dialog-nuevo-periodo.tsx` | 192 | Local `MONTHS` duplicate; otherwise OK but becomes single-use after `dialog-abrir-periodo` merge. **Delete**; merge into single dialog using `postCrearPeriodoFacturacion`. |
| `app/hooks/operaciones/use-calculo-proceso.ts` | 115 | Calls `api.post('lanzar-calculo-facturacion')` and `api.post('generar-detalle-factura')` — not in service. Routes can call `operacionesService.postRevisarCalculosLanzarCalculo` and `postRevisarCalculosAceptar` directly. **Delete**; refactor the calling component to call service methods. |
| `app/hooks/operaciones/use-validacion-precios.ts` | 113 | Calls `/ConsultarPreciosUno` and `/ConsultarPreciosDos` — not in service. `RevisarPrecioUno`/`RevisarPrecioDos` types not in source of truth. The only service method that approximates is `gerRevisarPreciosData(mes, anio)` (note typo, returns `/revision-precios/consultar`). **Delete**; the calling component calls `gerRevisarPreciosData` directly. |
| `app/hooks/operaciones/use-calculo-factura.test.ts` | 141 | Unrunnable (no `test/setup.ts`). After `use-calculo-factura` rewrite, the test mocks `api.get` directly and the test no longer represents the hook's contract. **Delete.** |
| `app/hooks/operaciones/use-calculo-proceso.test.ts` | 163 | Tests the deleted hook. **Delete.** |
| `app/hooks/operaciones/use-validacion-precios.test.ts` | 168 | Tests the deleted hook. **Delete.** |
| `app/components/operaciones/revisar-calculo-factura/revisar-calculo-factura-component.test.tsx` | 275 | Unrunnable. Mocks the three hooks with `vi.mock`. After the hooks are deleted/rewritten, the test no longer matches. **Delete.** |
| `app/utils/operaciones/formatters.ts` | 68 | `formatPeriodLabel` rebuilds a `MONTHS` map that already lives in `constants.ts`. After the `formatPeriodoId` extraction, `formatPeriodLabel` is the only meaningful export and can live in `constants.ts` or a single `formatters.ts` reduced to < 30 LOC. **Reduce, do not delete**; merge its 3 non-duplicate formatters (`formatPrice`, `formatNumber`, `formatCycle`) into the shared `formatters.ts` and delete this file. |
| `app/utils/operaciones/revisar-precio-helpers.ts` | 76 | Subset/superset duplication of `app/hooks/operaciones/utils/error-handler.ts`. **Delete**; route all consumers through the canonical `extraerErrorMessage`. |
| `app/utils/operaciones/confirmation-helpers.ts` | 66 | Calls `api.post('/ConfirmarPrecio?indice=...&usuario=...')` — not in service. `processConfirmations` and `filterPendingConfirmations` become single-use. **Delete**; inline the simple filter into the one consumer (`revisar-precio-component.tsx`). |
| `app/hooks/operaciones/utils/price-validator.ts` | 54 | `RevisarPrecioUno`/`RevisarPrecioDos` types don't exist. After `use-validacion-precios` deletion, only one consumer remains (the deleted hook). **Delete.** |
| `app/hooks/operaciones/utils/data-combiner.ts` | 42 | `CalculoPrefactura*` types don't exist. **Delete** with the `use-calculo-factura` rewrite. |
| `app/hooks/operaciones/utils/error-handler.ts` | 63 | Heavy `any` use. After deletion of `revisar-precio-helpers.ts` and `confirmation-helpers.ts`, the only consumers are within the hooks being deleted. **Delete**; inline a single `extraerErrorMessage` into the consumer files that survive. |

### 3.3 Specific exports/imports to remove from each remaining file

For each surviving file, strip every import that is no longer used after §3.2 + §4. This is the "intra-directory dead-code sweep" (item 4 of the user strategy). The full per-file list is generated by `tsc --noEmit` (cannot run today) plus a manual audit; the spec phase must produce a concrete list. Known in advance:

- `app/utils/operaciones/index.ts:1-27` — currently re-exports `constants`, `formatters`, `validations` but **misses** `confirmation-helpers` and `revisar-precio-helpers` (explore §3.2). After §3.2 deletes those two, add the new shared helpers (`downloadBlob`, `formatPeriodoId`, unified `convertirCicloParaAPI`) and re-export.
- `app/components/operaciones/preparar-lecturas/preparar-lecturas-component.tsx:99` — local `obtenerCicloParaAPI` is removed and replaced by import from `~/utils/operaciones`.
- `app/components/operaciones/cerrar-lecturas/cerrar-lecturas-component.tsx:102` — same.
- `app/components/operaciones/periodo-facturacion/dialog-nuevo-periodo.tsx:27-40` and `dialog-abrir-periodo.tsx:21-34` — local `MONTHS` arrays removed (the dialogs themselves are deleted per §3.2).
- `app/utils/operaciones/formatters.ts:2-15` — local `MONTHS` map inside `formatPeriodLabel` removed.
- `app/hooks/operaciones/utils/cycle-utilities.ts:1` — `convertirCicloParaAPI` is the canonical version. **Keep the file** but move it from `app/hooks/operaciones/utils/` to `app/utils/operaciones/cycle.ts` (so it's co-located with other utils) and re-export from the index.

### 3.4 Phantom service calls to remove

| File | Line(s) | Method | Disposition |
|---|---|---|---|
| `app/routes/dashboard/operaciones/cerrar-lecturas.tsx` | 18 | `operacionesService.getCerrarLecturasData()` | **Delete call.** Method does not exist. |
| `app/routes/dashboard/operaciones/periodo-facturacion.tsx` | 18 | `operacionesService.getPeriodoFacturacionData()` | **Delete call.** Method does not exist. |
| `app/routes/dashboard/operaciones/preparar-lecturas.tsx` | 57 | `operacionesService.getAsignacionSectores(ciclo, periodo)` | **Delete call.** Method does not exist. |
| `app/routes/dashboard/operaciones/revisar-calculo-factura.tsx` | 34 | `operacionesService.verificarEstadoCierreLecturas(cicloId, periodo)` | **Delete call.** Method does not exist. |
| `app/routes/dashboard/operaciones/revisar-precio.tsx` | 22, 81 | `operacionesService.getRevisarPrecioData(dia)` + `getPreciosPorCiclo(mes, anio, dia)` | **Delete both calls.** Methods do not exist. |
| `app/routes/dashboard/operaciones/corte-reposicion.tsx` | 16 | `operacionesService.getCorteReposicionData()` | **Delete call.** Method exists but returns `CorteReposicionResumenResponse` (totals), not the `ConsultarMantenedorRevisionCorte` list the component expects (explore §4.1.C). |
| `app/hooks/operaciones/use-calculo-factura.ts` | 69, 86 | `api.get('/calculo-prefactura-encabezado')` + `api.get('/calculo-prefactura-cargos')` | **Replace** with `operacionesService.getRevisarCalculosBuscarPrefacturas(cicloId, periodoId, ...)` and adapt the data shape. |
| `app/hooks/operaciones/use-calculo-proceso.ts` | 46, 81 | `api.post('lanzar-calculo-facturacion')` + `api.post('generar-detalle-factura')` | **Delete the hook** (§3.2). Component calls `operacionesService.postRevisarCalculosLanzarCalculo` + `postRevisarCalculosAceptar` directly. |
| `app/hooks/operaciones/use-calculo-facturacion-flow.ts` | 128, 156, 205, 242, 276 | `lanzarCalculoFacturacion`, `obtenerIdentificadorProceso`, `verificarEstadoProceso`, `consultarEncabezadoPrefactura`, `consultarCargosPrefactura` | **Delete the entire file** (§3.2). |
| `app/hooks/operaciones/use-validacion-precios.ts` | 64, 67 | `api.get('/ConsultarPreciosUno?...')` + `api.get('/ConsultarPreciosDos?...')` | **Delete the hook** (§3.2). Component calls `operacionesService.gerRevisarPreciosData(mes, anio)` directly (and acknowledges the source-of-truth typo). |
| `app/components/operaciones/anular-factura-impresa/anular-factura-impresa-component.tsx` | 58 | `api.post('/anular-factura-impresa', {numeroFolio, alcance})` | **Replace** with `operacionesService.postAnularFactura(...)` — but this method does not exist. The source of truth has only `AnularFacturaEjecutarRequest` (type) and no service method. **Delete the feature** (anular-factura page becomes a static error or redirect). |
| `app/components/operaciones/cambio-medidor/cambio-medidor-component.tsx` | 178, … | `api.get('/consulta-medidor-antiguo')` etc. | **Replace** with `operacionesService.getBuscarMedidorAntiguo(acometida, numeroSerie)` + `getBuscarMedidorNuevo(serie)`. The local 5-type import list (`ConsultaMedidorAntiguoResponse`, etc.) is replaced with the source-of-truth types `CambioMedidorBuscarAntiguoRequest` and `CambioMedidorBuscarNuevoRequest`. |
| `app/components/operaciones/cerrar-lecturas/cerrar-lecturas-component.tsx` | 158 | `api.get('/estado-cierre-lecturas')` | **Delete.** No service method exists. The component calls `operacionesService.getCerrarLecturasFiltrosCiclos` + `getCerrarLecturasFiltrosPeriodos` for filters and uses inline `CerrarLecturasCerrarRequest` for the close action. |
| `app/components/operaciones/cerrar-lecturas/alert-cerrar-lecturas.tsx` | 75 | `api.post('/cerrar-lecturas-nicho', {...})` | **Replace** with `operacionesService.postCerrarLecturasCerrar(req)` (if such method exists — it does not per the source-of-truth). **Delete the alert feature**; the close-lecturas action lives in the main component using `CerrarLecturasCerrarRequest` if a method can be added later, otherwise the action is removed. |
| `app/components/operaciones/corte-reposicion/corte-reposicion-component.tsx` | multiple | `api.get('consulta-mantenedor-revision-corte')`, `consulta-registros-revision`, `api.post('modificar-revision')`, `ingresar-revision`, `eliminar-revision`, `exportar-*` | **Delete all of them.** None exists in the service. Component is reduced to: resumen card + buscar list + iniciar/finalizar/actualizar proceso buttons (using `getCorteReposicionData`, `getBuscarCorteReposicion`, `postIniciarProcesoCorteReposicion`, `postFinalizarProcesoCorteReposicion`, `postActualizarProcesoCorteReposicion`). The `ConsultarMantenedorRevisionCorte` type import is removed. |
| `app/components/operaciones/crear-archivos-sap/crear-archivos-sap-component.tsx` | 58, 106 | `api.get('/exportar-encabezado')` + `api.get('/exportar-detalle')` | **Delete both.** No service method. Feature is removed; page becomes empty stub or 404 redirect. |
| `app/components/operaciones/periodo-facturacion/periodo-facturacion-component.tsx` | 56 | `api.get('/consulta-periodo')` | **Replace** with `operacionesService.getPeriodoAbierto()` (already in service). |
| `app/components/operaciones/periodo-facturacion/dialog-abrir-periodo.tsx` | 70 | `api.post('/ingresa-periodo')` | **Delete** (the dialog is deleted per §3.2). |
| `app/components/operaciones/periodo-facturacion/cerrar-periodo.tsx` | 45 | `api.post('/cerrar-periodo', JSON.stringify(periodoId))` | **Delete** (the file is deleted per §3.2). |
| `app/components/operaciones/precios-cargo/precios-cargo-component.tsx` | … | (uses `operacionesService.getPreciosCargoData` with wrong shape) | **Align** to actual return shape (`PreciosConsultarRequest[]`, flat array). The route's destructuring of `{tablaEnel, tablaAgualova}` is wrong (explore §4.1.C); fix the route to receive an array. |
| `app/components/operaciones/revisar-precio/dialog-modificar-precio.tsx` | 107 | `api.post('/modificar-precio-cargo-correccion', {indice, valor, motivo, usuario})` | **Replace** with `operacionesService.postCorregirPrecioCargo({codigoCargo, nuevoValor, motivo, passwordConfirmacion})` (the `RevisionPreciosCorregirRequest` shape). The `indice`/`usuario` fields are removed; `codigoCargo` and `passwordConfirmacion` are added. |
| `app/components/operaciones/revisar-precio/revisar-precio-component.tsx` | … | calls phantom methods, hits `/ConsultarPreciosUno` | **Align** to `operacionesService.gerRevisarPreciosData(mes, anio)` and remove the second data source entirely. |
| `app/components/operaciones/revisar-calculo-factura/revisar-calculo-factura-component.tsx` | … | uses `useCalculoProceso` and `useValidacionPrecios` | **Refactor** to call `operacionesService.postRevisarCalculosLanzarCalculo`, `postRevisarCalculosAceptar`, and `gerRevisarPreciosData` directly (hooks deleted per §3.2). |

### 3.5 Phantom type imports to remove

The source-of-truth types file exports 29 types. The following consumer types are imported but do not exist in the source of truth (explore §4.1.A). Each import must be deleted; if a type is "genuinely needed," it is **derived via TypeScript composition** from a source-of-truth type, or declared as a local `type` alias **inline in the consumer file** (no new type files).

| Phantom type | Sites | Derivation rule |
|---|---|---|
| `Anio` | `periodo-facturacion-component.tsx:30`, `dialog-nuevo-periodo.tsx:23` (deleted) | Use `PeriodosAniosDisponiblesResponse` (`{idAnio: number; anio: number}`) or `Pick<PeriodosAniosDisponiblesResponse, 'anio'>` inline. |
| `Periodos` | `periodo-facturacion-component.tsx:30`, `columns.tsx:7` | Use `PeriodosBuscarRequest` directly. |
| `Ciclo` | `cerrar-lecturas-component.tsx:41`, `revisar-calculo-factura-component.tsx:44`, `revisar-precio-component.tsx:35`, route files | Use `PrepararLecturasFiltrosCiclosResponse` (or `CerrarLecturasFiltrosCiclosResponse` for cerrar-lecturas). |
| `PeriodoAbierto` | `cerrar-lecturas-component.tsx:41`, `preparar-lecturas-component.tsx:40` (deleted), `revisar-calculo-factura-component.tsx:44`, `revisar-precio-component.tsx:35` | Use `PrepararLecturasFiltrosPeriodosResponse`. |
| `EstadoCierreLecturas` | `cerrar-lecturas/columns.tsx:16`, `cerrar-lecturas-component.tsx:41`, `alert-cerrar-lecturas.tsx:19` (deleted) | Declare inline `type EstadoCierreLecturas = { ... }` in `cerrar-lecturas-component.tsx` (the only place that needs it). |
| `RevisarPrecioUno` | `columns-enel.tsx:7` (deleted component), `use-validacion-precios.ts:4` (deleted hook), `price-validator.ts:1` (deleted) | n/a (all consumers deleted). |
| `RevisarPrecioDos` | `columns-agualova.tsx:7` (deleted), `use-validacion-precios.ts:4` (deleted), `price-validator.ts:1` (deleted) | n/a (all consumers deleted). |
| `ConsultarMantenedorRevisionCorte` | `corte-reposicion-component.tsx:41`, `columns.tsx:6` | n/a (feature deleted). |
| `ConsultarAsignacionSectores` | `preparar-lecturas-component.tsx:40`, `tabla-asignacion-sectores.tsx:37` (deleted) | n/a (feature deleted). |
| `ConsultarSectores` | `preparar-lecturas-component.tsx:40`, `tabla-asignacion-sectores.tsx:37` (deleted) | n/a (feature deleted). |
| `OpcionesPrepararLecturas` | `preparar-lecturas-component.tsx:40` | Declare inline `type OpcionesPrepararLecturas = ...` if still needed. |
| `ValidarSectoresPendientes` | `preparar-lecturas-component.tsx:40`, `tabla-lecturas-pendientes.tsx:14` (deleted) | n/a (feature deleted). |
| `CalculoPrefacturaCompleto` | `use-calculo-factura.ts:10` (rewritten), `use-calculo-facturacion-flow.ts:10` (deleted), `hierarchical-data-table.tsx:24` (realigned), `columnsPrecalculo.tsx:6` (realigned) | Use `ReturnType<typeof operacionesService.getRevisarCalculosBuscarPrefacturas>` or a `Pick<>` from the source-of-truth response shape (the response type is `any` at the service layer, so a local inline type is needed: `type CalculoPrefacturaCompleto = { ... }` declared in the consumer file). |
| `CalculoPrefacturaDetalle` | `use-calculo-factura.ts:10` (rewritten), `use-calculo-facturacion-flow.ts:10` (deleted) | Same. |
| `CalculoPrefacturaCargoResponse` | `use-calculo-factura.ts:10` (rewritten), `use-calculo-facturacion-flow.ts:10` (deleted) | Same. |
| `CalculoPrefacturaCargo` | `hierarchical-data-table.tsx:24` (realigned) | Same. |
| `IdentificadorProceso`, `EstadoProceso`, `TotalesCorteReposicion` | referenced by deleted `services/operations/*` files | n/a (services deleted). |
| `ConsultaMedidorAntiguoResponse`, `ConsultaMedidorNuevoResponse`, `DetalleMedidorAntiguo`, `DetalleMedidorNuevo`, `MedidorAntiguo`, `MedidorNuevo` | `cambio-medidor-component.tsx:35` and sub-components | Use `CambioMedidorBuscarAntiguoRequest` + `CambioMedidorBuscarNuevoRequest` from source of truth. Sub-components' `AntiguoMedidorFormProps` etc. are derived inline as `type X = { ... }`. |
| `PreciosCargoEnel`, `PreciosCargoAgualova`, `DetallepreciosCargoAgualova` | `precios-cargo-component.tsx:36`, `columns-enel.tsx:5`, `columns-enerlova.tsx:4`, `detalle-precios-enerlova.tsx:32` | Use `PreciosConsultarRequest` directly. The "Enel" and "Agualova" split is a frontend-invented taxonomy that does not exist in the service response; delete the split. |
| `TablaValoresEnelProps`, `TablaValoresAgualovaProps` | `tabla-valores-enel.tsx:7` (deleted), `tabla-valores-enerlova.tsx:7` (deleted) | n/a (components deleted). |
| `AntiguoMedidorFormProps`, `NuevoMedidorFormProps`, `NuevoContratoFormProps`, `DetalleMedidorAntiguoProps`, `DetalleMedidorNuevoProps` | cambio-medidor sub-components | All declared inline in their respective consumer files. |
| `DialogAgregarPreciosProps` | `precios-cargo/dialog-agregar-precios.tsx:18` | Declare inline. |
| `TablaAsignacionSectoresProps` | `tabla-asignacion-sectores.tsx:37` (deleted) | n/a (component deleted). |

**Hard rule:** no new files under `app/types/operaciones/`. All derivations are either `Pick`/`Omit`/mapped types or inline `type` declarations inside consumer files.

## 4. Realignments (consumer rewrites to source-of-truth shape)

For each consumer that is **not** deleted in §3 but must be rewritten to conform to the source of truth.

### 4.1 Routes

| File | Current behavior | Source-of-truth shape | Rewrite plan |
|---|---|---|---|
| `routes/operaciones/cerrar-lecturas.tsx` | `clientLoader` calls `getCerrarLecturasData()` (does not exist) | No upstream data; component handles its own fetching | Delete the `clientLoader`; render `<CerrarLecturasComponent />` only. |
| `routes/operaciones/periodo-facturacion.tsx` | `clientLoader` calls `getPeriodoFacturacionData()` (does not exist) | Same | Delete the `clientLoader`; render only. |
| `routes/operaciones/preparar-lecturas.tsx` | `clientLoader` calls `getAsignacionSectores(ciclo, periodo)` (does not exist) + `useState<ConsultarAsignacionSectores[]>([])` (type does not exist) | Same | Delete the `clientLoader`; delete the local state and reload callback. |
| `routes/operaciones/revisar-calculo-factura.tsx` | `clientLoader` calls `verificarEstadoCierreLecturas` (does not exist) | Same | Delete the `clientLoader`. The component initializes via `useCalculoFactura` (rewritten) calling `operacionesService.getRevisarCalculosBuscarPrefacturas`. |
| `routes/operaciones/revisar-precio.tsx` | `clientLoader` calls `getRevisarPrecioData(dia)` and `getPreciosPorCiclo(mes, anio, dia)` (do not exist) | Same | Delete the `clientLoader`; component calls `operacionesService.gerRevisarPreciosData(mes, anio)` (typo acknowledged). |
| `routes/operaciones/corte-reposicion.tsx` | `clientLoader` calls `getCorteReposicionData()` (exists but returns resumen, route expects mantenedor list) | `OperacionesServiceResponse<CorteReposicionResumenResponse>` | Delete the `clientLoader`. Component fetches resumen, buscar, lifecycle calls via service methods as needed (resumen on mount; buscar on search). |
| `routes/operaciones/precios-cargo.tsx` | `clientLoader` calls `getPreciosCargoData(mes, anio)` then destructures `{tablaEnel, tablaAgualova}` (wrong shape) | `OperacionesServiceResponse<PreciosConsultarRequest[]>` (flat array) | Rewrite the destructure: `result.data` is the array. Pass `result.data` directly. |
| `routes/operaciones/anular-factura-impresa.tsx` | Thin route → component (component is deleted per §3.2) | n/a | Render a static "Funcionalidad no disponible" placeholder. |
| `routes/operaciones/cambio-medidor.tsx` | Thin route → component (component rewritten) | n/a | Render the rewritten component. |
| `routes/operaciones/crear-archivos-sap.tsx` | Thin route → component (component is deleted per §3.2) | n/a | Render a static placeholder. |

### 4.2 Hooks (the slim trio is now a duo)

| File | Current behavior | Source-of-truth shape | Rewrite plan |
|---|---|---|---|
| `use-calculo-factura.ts` | Two `api.get` calls to `/calculo-prefactura-encabezado` and `/calculo-prefactura-cargos` (not in service). Returns `{data, filteredData, isLoading, error, searchTerm, setSearchTerm, handleRevisarCalculo, setData}` with `error: string \| null` magic-sentinel `'NO_LECTURAS_CERRADAS'`. | `operacionesService.getRevisarCalculosBuscarPrefacturas(cicloId, periodoId, rut?, nombre?, sector?, local?, modo?, procesoId?)` returns `any` (untyped). | Rewrite to call the service method once. Adapt the result to `{data, isLoading, error: string \| null}` (no magic sentinel). Replace the `useEffect`+`setFilteredData` anti-pattern with `useMemo`. Drop the `CalculoPrefacturaCompleto`/`Detalle`/`Cargo` phantom types in favor of inline `type CalculoPrefacturaRow = { ... }` derived from the source-of-truth method signature. |
| `use-calculo-proceso.ts` | `api.post('lanzar-calculo-facturacion')` + `api.post('generar-detalle-factura')`. | `operacionesService.postRevisarCalculosLanzarCalculo(RevisarCalculosLanzarCalculoRequest)` + `postRevisarCalculosAceptar(periodoId)`. | **Delete the hook.** Refactor the calling component (`revisar-calculo-factura-component.tsx`) to call the service methods directly inside its own `handleLanzarCalculo` + `handleAceptarCalculo` handlers. |
| `use-validacion-precios.ts` | `api.get('/ConsultarPreciosUno?...')` + `api.get('/ConsultarPreciosDos?...')`. Three separate `useState<number>` for totals. Returns synthesized object. | `operacionesService.gerRevisarPreciosData(mes, anio)` (typo "ger" preserved, returns `/revision-precios/consultar`). | **Delete the hook.** Refactor the calling component (`revisar-calculo-factura-component.tsx`) to call `gerRevisarPreciosData` and derive the totals inline. Drop the `RevisarPrecioUno`/`Dos` phantom types. |
| `use-calculo-facturacion-flow.ts` | 426 LOC; 5 step runners calling non-existent service methods. | n/a | **Delete the entire file** (§3.2). |
| `utils/cycle-utilities.ts` | Canonical `convertirCicloParaAPI(ciclo)`. | n/a (pure helper) | **Move** to `app/utils/operaciones/cycle.ts` and re-export from `app/utils/operaciones/index.ts`. Replace the two local `obtenerCicloParaAPI` variants in `cerrar-lecturas-component.tsx:102` and `preparar-lecturas-component.tsx:99` (the latter is in a deleted component, so the call site is gone) with a single signature: `convertirCicloParaAPI(ciclo: string \| number): string`. |
| `utils/error-handler.ts` | `extraerErrorMessage`, `es404`, `extraerCodigoEstatus`, `validarRespuestaAPI`. | n/a (pure helpers) | **Delete.** The only remaining consumer is the rewritten `use-calculo-factura.ts`, which inlines a single `extraerMensajeError(error: unknown): string` helper. |
| `utils/data-combiner.ts` | `combinarPrefactura`, `calcularTotalFacturado`, `validarDatosCombinados`. | n/a | **Delete** with `use-calculo-factura.ts` rewrite (logic moves to `useMemo` in the hook). |
| `utils/price-validator.ts` | `PriceValidationResult`, `filtrarPreciosValidos`, `contarConfirmados`, `validarPreciosConfirmados`. | n/a | **Delete** with `use-validacion-precios.ts` (logic moves inline). |

### 4.3 Components (9 subdomains)

| Subdomain | Files affected | Plan |
|---|---|---|
| **anular-factura-impresa** | `anular-factura-impresa-component.tsx` | **Delete** the component. The `AnularFacturaEjecutarRequest` type exists in the source of truth but no service method exists. Per user strategy: delete the feature. |
| **cambio-medidor** | `cambio-medidor-component.tsx` (842 LOC) + 8 sub-components | Replace 5 phantom type imports with `CambioMedidorBuscarAntiguoRequest` / `CambioMedidorBuscarNuevoRequest`. Replace local `api.get('/consulta-medidor-antiguo')` with `operacionesService.getBuscarMedidorAntiguo`. Replace `api.get('/consulta-medidor-nuevo')` with `operacionesService.getBuscarMedidorNuevo`. The `postEjecutarCambioMedidor` service method exists; use it. Sub-component prop types become inline `type X = { ... }`. |
| **cerrar-lecturas** | `cerrar-lecturas-component.tsx` (763), `columns.tsx`, `data-table-virtualized.tsx` (delete), `dialog-informacion.tsx` | Remove `EstadoCierreLecturas` import; declare `type EstadoCierreLecturas = { ... }` inline. Remove `Ciclo`/`PeriodoAbierto` phantom imports; use `CerrarLecturasFiltrosCiclosResponse` / `CerrarLecturasFiltrosPeriodosResponse`. Remove the local `obtenerCicloParaAPI`; import from `~/utils/operaciones`. Remove the `api.get('/estado-cierre-lecturas')` call (no service method). Remove the `api.post('/cerrar-lecturas-nicho')` call (no service method; `CerrarLecturasCerrar` request type exists but no method). |
| **corte-reposicion** | `corte-reposicion-component.tsx` (662), `columns.tsx`, 3 dialogs | Remove the `ConsultarMantenedorRevisionCorte` import. Remove all `api.get/post` direct calls to `consulta-registros-revision`, `consulta-mantenedor-revision-corte`, `modificar-revision`, `ingresar-revision`, `eliminar-revision`, `exportar-*`. The component becomes: resumen card (from `getCorteReposicionData`), buscar list (from `getBuscarCorteReposicion`), lifecycle buttons (from `postIniciar/Finalizar/ActualizarProcesoCorteReposicion`), 3 dialogs for liberar/registrar-corte/solicitar-reposicion (from `postLiberarAcometida`, `postRegistrarCorte`, `postSolicitarReposicion`). The 3 blob download handlers in `corte-reposicion-component.tsx:98,120,142` use the new shared `downloadBlob` util. |
| **crear-archivos-sap** | `crear-archivos-sap-component.tsx` | **Delete the file** (no service methods for blob exports). Page becomes a placeholder. |
| **periodo-facturacion** | `periodo-facturacion-component.tsx` (265), `columns.tsx`, `cerrar-periodo.tsx` (delete), `dialog-abrir-periodo.tsx` (delete), `dialog-nuevo-periodo.tsx` (delete) | Replace `api.get('/consulta-periodo')` with `operacionesService.getPeriodoAbierto()`. Replace `Anio`/`Periodos` phantom types with `PeriodosAniosDisponiblesResponse` / `PeriodosBuscarRequest`. Merge the 3 dialogs into one inline dialog using `operacionesService.postCrearPeriodoFacturacion` + `postCerrarPeriodoFacturacion`. |
| **precios-cargo** | `precios-cargo-component.tsx` (567), 8 sub-components | Replace `PreciosCargoEnel`/`PreciosCargoAgualova`/`DetallepreciosCargoAgualova` phantom types with `PreciosConsultarRequest` (and inline `type DetallePreciosEnerlova = Pick<PreciosConsultarRequest, ...>`). Fix the shape mismatch in the route: `result.data` is a flat array, not `{tablaEnel, tablaAgualova}`. The component receives an array and groups by some criterion (likely `codigoInterno` range — to be confirmed in spec phase). The `data-table-precios-virtualized.tsx` is a candidate for shared extraction (§5). |
| **preparar-lecturas** | `preparar-lecturas-component.tsx` (458), `tabla-asignacion-sectores.tsx` (delete), `tabla-lecturas-pendientes.tsx` (delete) | After deleting the two sub-components (no service backing), the main component is the only file. Remove the local `obtenerCicloParaAPI`. The component uses `operacionesService.getPrepararLecturasData` for filters, `getBuscarNichos` for search, `postGenerarLecturas` for action. |
| **revisar-calculo-factura** | `revisar-calculo-factura-component.tsx` (810), `columnsPrecalculo.tsx`, `data-table.tsx`, `hierarchical-data-table.tsx`, `hierarchical-data-table-virtualized.tsx` (delete) | Drop the imports of `useCalculoProceso` and `useValidacionPrecios`; inline their behavior with direct service calls (`postRevisarCalculosLanzarCalculo`, `postRevisarCalculosAceptar`, `gerRevisarPreciosData`). Keep `useCalculoFactura` (rewritten per §4.2). Replace `CalculoPrefacturaCompleto`/`Detalle`/`Cargo` phantom types with inline `type CalculoPrefacturaRow = { ... }` in the consumer file. |
| **revisar-precio** | `revisar-precio-component.tsx` (574), `columns-enel.tsx`, `columns-agualova.tsx`, `data-table.tsx`, `data-table-virtualized.tsx` (delete), `dialog-modificar-precio.tsx`, `tabla-valores-enel.tsx` (delete), `tabla-valores-enerlova.tsx` (delete) | Drop `RevisarPrecioUno`/`RevisarPrecioDos`/`TablaValoresEnelProps`/`TablaValoresAgualovaProps` imports. Replace the `api.post('/modificar-precio-cargo-correccion', {indice, valor, motivo, usuario})` with `operacionesService.postCorregirPrecioCargo({codigoCargo, nuevoValor, motivo, passwordConfirmacion})`. Use `operacionesService.gerRevisarPreciosData(mes, anio)` for the data source. The `processConfirmations` / `filterPendingConfirmations` imports from `~/utils/operaciones/confirmation-helpers` are deleted with that file; the small filter is inlined. |

## 5. Extractions (shared helpers/components — ONLY if 2+ real sites)

| Candidate | Sites in the explore | Real sites after §3 + §4 | Action |
|---|---|---|---|
| `downloadBlob(blob, filename)` | 5 sites (explore §4.6) | After §3.2 deletes the `data-table-precios-virtualized.tsx` and the two `corte-reposicion` blob handlers merge with `corte-reposicion-component.tsx`'s 3 handlers + the deleted `crear-archivos-sap`: **3 sites** (`corte-reposicion-component.tsx:98,120,142`). | **Extract** to `app/utils/operaciones/download.ts`. |
| `formatPeriodoId(periodoAbierto)` | 5 sites (explore §4.6) | After §3.2 deletes the two `preparar-lecturas`/`cerrar-lecturas` redundant copies: 3 sites remain (cerrar-lecturas-component, revisar-calculo-factura-component, revisar-precio-component, plus the route). | **Extract** to `app/utils/operaciones/period.ts`. |
| `convertirCicloParaAPI(ciclo)` | 3 sites (canonical `cycle-utilities.ts` + 2 local copies) | After §3.3 removes the 2 local copies: 1 canonical site + 1 surviving call (in `cerrar-lecturas-component.tsx`). | **Move** the canonical version to `app/utils/operaciones/cycle.ts`, re-export from index, replace the 2 local copies (1 already deleted with the component). |
| `MONTHS` array | 4 sites (constants, formatters, dialog-nuevo-periodo, dialog-abrir-periodo) | After §3.2 deletes the 2 dialogs and §3.3 removes the formatters duplicate: 1 canonical site in `constants.ts`. | **Consolidate** the 2 remaining references to import from `~/utils/operaciones` instead of redefining. |
| `extraerMensajeError(error: unknown): string` | 3 utility files (`error-handler`, `revisar-precio-helpers`, inline in 10+ components) | After §3.2 deletes the 2 helper files: 1 canonical version lives in `app/utils/operaciones/error.ts`. Components import from there. | **Extract** to `app/utils/operaciones/error.ts`. |
| `<EmptyState>`, `<ErrorState>`, `<LoadingState>` | 3+ subdomains each (explore §4.6) | After realignment: ~3 sites each. | **Defer.** Borderline. The user strategy requires 2+ real sites; we have 3, but the visual treatment diverges per page. Extract only if the visual treatment is identical after realignment (spec phase must confirm). If not, leave inline. |
| `<StatsCard icon value label tone>` | 2 sites (cerrar-lecturas, corte-reposicion) | 2 sites remain. | **Defer.** Same — extract only if the visual treatment is 1:1. |
| `<FilterForm fields onSearch onClear>` | 4 sites (cerrar-lecturas, preparar-lecturas (deleted), revisar-calculo-factura, precios-cargo) | 3 sites remain. | **Reject.** Visual treatment diverges; extracting would create a new abstraction that doesn't simplify. Leave inline. |
| `useProductTour(steps)` | 3 sites (corte-reposicion, revisar-calculo-factura, revisar-precio) | After realignment, 2-3 sites. | **Extract** to `app/hooks/operaciones/use-product-tour.ts` if the call sites are visually identical. The driver.js init differs slightly per page (one uses `allowClose: true`, another `stagePadding: 4`); the hook can take options. **Defer the decision to spec phase.** |
| `<SelectableDataTable ... />` | 2 sites (revisar-precio × 2 tables) | 1 site after deleting `data-table-virtualized.tsx`. | **Reject.** Single site after deletion. |
| `parseFechaDDMMYYYY` / `formatDateForSorting` | 1 site (`periodo-facturacion/columns.tsx:9-34`) | 1 site. | **Reject.** Single use. |

**Net new files in `app/utils/operaciones/`:** `cycle.ts` (move), `download.ts` (new), `error.ts` (new), `period.ts` (new). Net new files in `app/hooks/operaciones/`: `use-product-tour.ts` (conditional). **No new files in `app/components/shared/` or `app/components/operaciones/_shared/`.** No new files in `app/types/operaciones/`.

## 6. Style and convention fixes

| Category | Files | Fix |
|---|---|---|
| `console.*` statements | 10 files (per explore §4.3) | Remove all `console.log/info/debug/warn`; keep `console.error` only when paired with a `toast.error` for user feedback. |
| `toast.error(error as any)` | 10 files (e.g. `corte-reposicion-component.tsx:114`, `revisar-precio-component.tsx:170`) | Replace with `toast.error(extraerMensajeError(error))` (the new shared util from §5). Sonner does not accept a non-string description. |
| `import React from "react"` | `anular-factura-impresa.tsx:2`, `cambio-medidor.tsx:2`, `cerrar-lecturas.tsx:2`, etc. (explore §4.3) | Remove the import. React 19 + Vite 6 + automatic JSX runtime does not need it. `verbatimModuleSyntax: true` flags these. |
| Hardcoded URL paths | 30+ `api.get('/...')` calls in 10+ files | Per §3.4, most of these are deleted with their features. The remaining 6-8 calls in the surviving `cambio-medidor` + `corte-reposicion` + `periodo-facturacion` + `precios-cargo` + `revisar-precio` components are aligned to the service method names (no further hardcoded URLs after §3.4). |
| `/* eslint-disable no-empty-pattern */` at the top of every route file | 10 route files | **Keep** — React Router 7 `meta({}: Route.MetaArgs)` pattern requires it. The proposal does not change this. |
| `error: string \| null` magic sentinel `'NO_LECTURAS_CERRADAS'` | `use-calculo-factura.ts:43-44` | Replace with a discriminated union or a simple `error: string \| null` + a separate `estadoCierre: 'cerrado' \| 'no-cerrado' \| 'cargando'` boolean. |
| `useState<X[]>(initial) + onRowSelectionChange` O(n²) pattern | `cerrar-lecturas-component.tsx:61` and `revisar-precio-component.tsx` | Replace with `Map<id, row>` for O(1) lookup. |
| `useEffect` cleanup via `useRef` (`prevLoadingRef`) | `preparar-lecturas-component.tsx:72-89` | Component is largely deleted; the remaining logic uses `useEffect` with explicit dependency array. |
| `useEffect` on mount that runs `limpiarFlujo` | `use-calculo-facturacion-flow.ts:397-400` | File deleted. |
| `MONTHS` redefined locally | `dialog-nuevo-periodo.tsx`, `dialog-abrir-periodo.tsx`, `formatters.ts:2-15` | Per §3.2 + §3.3, the dialogs are deleted; `formatters.ts` map is removed. |
| `toast: any` typing | `confirmation-helpers.ts:40` | File deleted. |
| `validarRespuestaAPI: data is any[]` | `error-handler.ts:38` | File deleted. |
| Spanish variable names mixed with English | widespread | **Keep** — pre-existing project convention; not in scope. |
| Empty destructuring in `meta({}: Route.MetaArgs)` | 10 route files | **Keep** — RR7 pattern. |
| Lazy import (`lazy()`) for `precios-cargo.tsx:11` but not for other heavy routes | `cambio-medidor-component.tsx` (842 LOC), `revisar-calculo-factura-component.tsx` (810 LOC), etc. | **Defer.** Bundle optimization is out of scope for a deletion-first refactor. Note in next steps. |
| `useMemo` derivation of `filteredData` in `use-calculo-factura.ts:124-132` that calls `setFilteredData` inside | 1 site | Rewrite to pure `useMemo`; no `setFilteredData` (the antipattern). |

## 7. PR slicing forecast

**Forecast: chained PRs are required.** The total scope is ~13,000 LOC of net delta across ~80 files, well beyond the 400-line review budget. The orchestrator's `ask-always` strategy is appropriate. The slices below are ordered to minimize cross-slice risk: deletions first, then realignments in dependency order, then style sweep.

Each slice is a single PR with ≤400 LOC of meaningful review per the chained-pr skill. Deletion-only slices are reviewable in <15 minutes (grep verification of zero imports).

### Slice 1 — Dead directory purge

- **Scope:** 57 files deleted. `app/services/operations/*` (6 files) + `app/routes/dashboard/reportes/components/operaciones/**` (51 files). Net delta: **-5,970 LOC**, 0 added.
- **Why independent:** Both directories have zero `import` references in `app/` (verified by `grep`). Removal cannot break any consumer.
- **Verification:** `grep -r "dashboard/reportes/components/operaciones" app/` returns 0; `grep -r "services/operations/" app/` returns 0. `pnpm typecheck` passes.
- **Dependencies:** None. This slice can land first.

### Slice 2 — Dead hook removal + unused utils

- **Scope:** 4 files deleted. `app/hooks/operaciones/use-calculo-facturacion-flow.ts` (426 LOC), `app/utils/operaciones/revisar-precio-helpers.ts` (76 LOC), `app/utils/operaciones/confirmation-helpers.ts` (66 LOC), `app/hooks/operaciones/utils/price-validator.ts` (54 LOC). Net delta: **-622 LOC**.
- **Why independent:** Verified zero `import` from outside the file (the flow hook is referenced only by tests in `use-calculo-factura.test.ts` mocks — to be re-checked). The two util files have single consumers that will be updated in Slice 5.
- **Verification:** `grep -r "use-calculo-facturacion-flow" app/` returns 0; `grep -r "revisar-precio-helpers" app/` returns 0 (after the only consumer `revisar-precio-component.tsx:44` is updated in Slice 6 to drop the import).
- **Dependencies:** Slice 1 must be merged first (the reportes copy also imports these utils — wait, verify; the explore says the reportes copy is dead, so this is moot).

### Slice 3 — Utils consolidation

- **Scope:** 1 file moved (`app/hooks/operaciones/utils/cycle-utilities.ts` → `app/utils/operaciones/cycle.ts`), 3 files created (`download.ts`, `error.ts`, `period.ts`), 2 files updated (`app/utils/operaciones/index.ts` re-exports, `app/utils/operaciones/constants.ts` exports). Net delta: **+350 LOC**.
- **Why independent:** New utility files have no consumers yet. The move is a pure relocation. `index.ts` re-exports the new files.
- **Verification:** `pnpm typecheck` passes; `pnpm lint` passes.
- **Dependencies:** None.

### Slice 4 — Routes realignment

- **Scope:** 10 route files updated. Each: remove the `clientLoader` or fix the destructure. Most reduce by 5-20 LOC; `precios-cargo.tsx` fixes the shape destructure (small but important). Net delta: **-200 LOC**.
- **Why independent:** Routes are thin wrappers; the deletions remove phantom calls only. Components continue to work (some will have new errors revealed at runtime, but the slice itself compiles and the build still produces output).
- **Verification:** `pnpm typecheck` passes (the route files are not phantom-importing non-existent methods anymore). `pnpm build` passes.
- **Dependencies:** Slice 1 (in case any route file imported from the reportes copy — verify). Slice 2 (the flow hook was not imported by routes, but verify).

### Slice 5 — Hooks realignment

- **Scope:** `use-calculo-factura.ts` rewritten (144 → ~80 LOC, -64), `use-calculo-proceso.ts` deleted (-115), `use-validacion-precios.ts` deleted (-113), `use-calculo-factura.test.ts` deleted (-141), `use-calculo-proceso.test.ts` deleted (-163), `use-validacion-precios.test.ts` deleted (-168), `utils/data-combiner.ts` deleted (-42), `utils/error-handler.ts` deleted (-63). Net delta: **-868 LOC**.
- **Why independent:** The two deleted hooks are only consumed by `revisar-calculo-factura-component.tsx`, which is updated in Slice 6. The rewritten `use-calculo-factura` is also only consumed by that component. If the component update lands in the same PR, the chain is consistent. **Sub-slice 5b may be combined with Slice 6i.**
- **Verification:** `pnpm typecheck` passes (with the component file stubbed or updated in the same PR).
- **Dependencies:** Slice 3 (the rewritten hook uses `extraerMensajeError` from the new `error.ts`).

### Slice 6 — Components realignment (split into 5 sub-slices by subdomain, each ≤400 LOC)

- **Slice 6a — anular-factura + cambio-medidor + crear-archivos-sap:** delete anular-factura and crear-archivos-sap components and routes' placeholders (~50 + 50 LOC); rewrite cambio-medidor to use service methods (~842 → ~700 LOC). Net delta: **-150 LOC**.
- **Slice 6b — cerrar-lecturas:** rewrite cerrar-lecturas-component.tsx + columns.tsx + dialog-informacion.tsx; delete data-table-virtualized.tsx and alert-cerrar-lecturas.tsx. Net delta: **-200 LOC**.
- **Slice 6c — corte-reposicion:** rewrite corte-reposicion-component.tsx (662 → ~400 LOC) + 3 dialogs; delete columns.tsx (260 LOC). Net delta: **-500 LOC**.
- **Slice 6d — periodo-facturacion + preparar-lecturas:** merge 3 dialogs into one (delete 2, rewrite 1); rewrite periodo-facturacion-component.tsx (265 → ~200); delete tabla-asignacion-sectores.tsx (542) and tabla-lecturas-pendientes.tsx (175); rewrite preparar-lecturas-component.tsx (458 → ~250). Net delta: **-900 LOC**.
- **Slice 6e — precios-cargo + revisar-calculo-factura + revisar-precio:** realign precios-cargo route + 8 sub-components; rewrite revisar-calculo-factura-component.tsx (drop 2 hook imports, call service directly); rewrite revisar-precio-component.tsx + dialog-modificar-precio.tsx; delete 4 sub-components; align revisar-calculo-factura-component.test.tsx (delete it). Net delta: **-600 LOC**.

Each sub-slice is < 400 LOC of net change **and** keeps the affected route compiling. Each sub-slice updates the route file (often just a placeholder redirect for deleted features) to keep CI green.

**Dependencies:** Slice 5 (hooks realigned/deleted first, then the components that called them). Slice 4 (routes updated to drop phantom calls first).

### Slice 7 — Style/convention sweep

- **Scope:** 10-15 files touched with small line-level changes (console removal, `error as any` fixes, `import React` removal, `useMemo` migration in `use-calculo-factura.ts`). Net delta: **-100 LOC**.
- **Why independent:** Pure style; no behavior change. Defer to the end so the previous slices don't have to be re-edited for style.
- **Verification:** `pnpm lint` passes; `pnpm format:check` passes.
- **Dependencies:** Slices 1-6 merged.

### Slice 8 — Intra-directory dead-code sweep

- **Scope:** Audit each surviving component subdirectory for unused exports/imports; delete. Audit `app/hooks/operaciones/` for any leftover files; delete. Audit `app/utils/operaciones/index.ts` re-exports for completeness. Net delta: **-200 LOC** (estimate).
- **Why independent:** Mechanical cleanup. Run with `tsc --noEmit` once `test/setup.ts` is restored (deferred to a separate change) or with `knip`/`ts-prune` if available.
- **Verification:** `pnpm typecheck` passes (no broken imports).
- **Dependencies:** Slice 7.

**Total slices: 12 (1 + 1 + 1 + 1 + 1 + 5 + 1 + 1).** Total net delta: **~8,500 LOC removed**, ~350 LOC added (new shared utils), **~8,150 LOC net deletion**. Per-slice LOC well within the 400-line review budget for realignments; deletion slices are reviewable in <15 minutes.

## 8. Risks and rollback

| # | Risk | Likelihood | Impact | Mitigation | Rollback |
|---|---|---|---|---|---|
| R1 | **Cascading deletes.** A "dead" file in §3.2 is in fact referenced by something outside the four target directories (e.g. a shared layout, a story, a test outside `app/hooks/operaciones/`). | Medium | The deletion breaks an import; `pnpm typecheck` fails. | Slice 1 verifies with `grep` before merging. Slice 2 verifies with `grep`. The sdd-apply phase runs `pnpm typecheck` after each slice. | Revert the slice commit. The directory contents are intact in git history. |
| R2 | **Phantom service call deleted → runtime crash.** A route was "working" because the service method was always undefined and the error path was hit silently; deleting the call removes the silent error and the page now loads with empty data. | Medium | Visible behavior change: a page that previously showed an error toast now shows an empty state. | Each slice's PR description documents the page-level behavior change. Sdd-verify runs `pnpm build` and manually tests each affected route. | Revert the slice commit. The `clientLoader` is restored. |
| R3 | **51-file reportes copy: confirm zero imports from outside the directory.** The deletion of 51 files is the largest single-PR change. | Low | If a file in `app/` imports from the reportes copy, the deletion breaks it. | Verified: `grep -r "dashboard/reportes/components/operaciones" app/` returns 0 matches outside the explore report. The PR description includes the grep command for reviewers to re-run. | Revert the slice commit. |
| R4 | **Parallel `app/services/operations/*` delete: confirm zero imports.** | Low | Same as R3. | Verified: `grep -r "services/operations" app/` returns 0 matches outside the explore report. | Revert the slice commit. |
| R5 | **`strict_tdd: true` vs deferred test infra.** Sdd-verify requires running tests; `test/setup.ts` is missing. | High (known) | Tests cannot be executed; the verify phase reports a blocker. | Per the orchestrator preflight, this is an accepted risk. The proposal includes a note that the first applicable change should restore `test/setup.ts`. The 4 deleted test files are explicitly unrunnable today, so deleting them does not regress. | n/a — known accepted risk. |
| R6 | **Magic-sentinel `'NO_LECTURAS_CERRADAS'` removal changes a page's branching logic.** | Medium | The `cerrar-lecturas` page may render an empty state instead of an error state. | The rewrite of `use-calculo-factura.ts` uses an explicit `estadoCierre` boolean instead of a magic string. The behavior is documented in the PR. | Revert the slice commit. |
| R7 | **Source-of-truth `operacionesService.gerRevisarPreciosData` typo "ger" preserved.** | Low | Cosmetic. The `ger` typo in the service method name is not in the consumers' scope. | The proposal explicitly notes the typo and uses the method as-is. A separate change could fix the typo in the source-of-truth file once the user grants permission. | n/a — out of scope. |
| R8 | **The `test/setup.ts` missing file blocks sdd-verify.** | High (known) | The verify phase cannot run `pnpm test:run` end-to-end. | The proposal explicitly documents this as an accepted risk per the orchestrator preflight. The 4 unrunnable test files are deleted; new tests are not added in this refactor (deferred). | n/a — known accepted risk. |
| R9 | **The `corte-reposicion` page loses 4 features (modificar revision, ingresar revision, eliminar revision, exportar) and 1 dialog-driven feature (consultar-mantenedor-revision-corte).** | High (user-visible) | The page becomes significantly less functional. | The proposal explicitly documents this as a feature deletion. The user strategy is "delete features not covered by source of truth." A follow-up change can re-introduce these features by extending the source of-truth service. | Revert the slice commit. The dialog and direct calls are restored. |
| R10 | **The `anular-factura-impresa` and `crear-archivos-sap` pages become placeholders.** | High (user-visible) | Two routes are no-ops. | Same as R9. Documented in the proposal. A follow-up change can re-introduce these features by extending the source-of-truth service. | Revert the slice commit. |

## 9. Out of scope (explicit non-goals)

- **No new types in `app/types/operaciones.ts`.** The source-of-truth types file is frozen.
- **No new methods in `app/services/operacionesService.ts`.** The source-of-truth service is frozen.
- **No new feature work.** If a feature has no source-of-truth backing, it is deleted, not added.
- **No test/setup.ts restoration.** Deferred to a separate change (per orchestrator preflight).
- **No new shared UI components** (`<EmptyState>`, `<StatsCard>`, `<FilterForm>`) unless 2+ real sites emerge after realignment. Currently **deferred** for borderline cases; **rejected** for single-site cases.
- **No migration to a new architecture** (the parallel `app/services/operations/*` is deleted, not adopted).
- **No changes to the source-of-truth files** (`app/types/operaciones.ts`, `app/services/operacionesService.ts`).
- **No changes outside the four target directories and the two explicit directory deletions**, except: (a) `app/utils/operaciones/cycle.ts` is moved from `app/hooks/operaciones/utils/cycle-utilities.ts`; (b) the route files in `app/routes/dashboard/operaciones/*` are modified (these are in scope).
- **No bundle size optimization** (lazy-loading the heavy components). Deferred to a follow-up.
- **No translation/i18n changes.**
- **No permission/auth changes** (already removed in a prior session per Engram observation).
- **No `app/types/monitor.ts` or `app/types/reportes.ts` changes.**
- **No fix of the `gerRevisarPreciosData` typo in the source-of-truth service file.** The typo is preserved.

## 10. Open questions for the user

None — the user has supplied the full strategy in the task prompt. All three open questions from the explore report (Q1: where do missing types go; Q2: how to handle 11 missing service methods; Q3: delete the reportes copy) are explicitly answered by the user strategy. **Ready for specs.**
