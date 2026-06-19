# Explore: refactor-operaciones-modulos

> **Change slug:** `refactor-operaciones-modulos`
> **Phase:** explore
> **Generated:** 2026-06-19
> **Mode:** interactive

## 1. Scope and Approach

This explore phase investigates the `hooks/operaciones`, `utils/operaciones`, `components/operaciones`, and `routes/dashboard/operaciones` directories to identify drift from the FROZEN source of truth (`app/types/operaciones.ts` + `app/services/operacionesService.ts`).

**Reading strategy:**
- 250-line source-of-truth types file: read in full, indexed every exported type (29 types).
- 653-line source-of-truth service file: read in full, indexed every public method (24 methods, including 3 with `any` return types).
- Routes: read all 10 files in full.
- Hooks: read all 4 hook files + 4 utility files in full.
- Components: read all public-surface files (main component, dialogs, columns, route sub-components). Skipped deep-dive into 8 minor sub-components (medidor-field, collapsible-header, etc.) — sampled only when they referenced a service call or type.
- Operations utils: read all 6 files in full.
- Test files: read all 3 hook tests + 1 component test.
- Cross-referenced: 74 files import from `~/types/operaciones`; 11 `operacionesService.*` call sites in routes; 5 in `use-calculo-facturacion-flow.ts`.

## 2. Source-of-Truth Index

### 2.1 `app/types/operaciones.ts` exports (29 types)

Grouped by subdomain:

| Subdomain | Exported types |
|---|---|
| Anular factura | `AnularFacturaEjecutarRequest` |
| Cambio medidor | `CambioMedidorBuscarAntiguoRequest`, `CambioMedidorBuscarNuevoRequest`, `CambioMedidorEjecutarCambioRequest` |
| Cerrar lecturas | `CerrarLecturasFiltrosCiclosResponse`, `CerrarLecturasFiltrosPeriodosResponse`, `CerrarLecturasCerrarRequest` |
| Corte reposición | `CorteReposicionResumenResponse`, `CorteReposicionBuscarRequest`, `CorteReposicionLiberarRequest`, `CorteReposicionRegistrarCorteRequest` |
| Periodos | `PeriodosAniosDisponiblesResponse`, `PeriodosBuscarRequest`, `PeriodosCrearRequest` |
| Precios | `PreciosConsultarRequest`, `PreciosGuardarMasivoRequest` |
| Preparar lecturas | `PrepararLecturasFiltrosCiclosResponse`, `PrepararLecturasFiltrosPeriodosResponse`, `PrepararLecturasBuscarNichosRequest`, `PrepararLecturasGenerarRequest` |
| Revisar cálculos | `RevisarCalculosFiltrosCiclosResponse`, `RevisarCalculosFiltrosPeriodosResponse`, `RevisarCalculosEstadoProcesoRequest`, `RevisarCalculosLanzarCalculoRequest` |
| Revisión precios | `RevisionPreciosBuscarRequest`, `RevisionPreciosConfirmarRequest`, `RevisionPreciosCorregirRequest` |

**Observation:** The source of truth contains ONLY API request/response contract types. NO domain entity types (Anio, Periodos, Ciclo, EstadoCierreLecturas, RevisarPrecioUno, RevisarPrecioDos, CalculoPrefactura*, etc.) are defined here. Consumers depend on these but they are missing.

### 2.2 `app/services/operacionesService.ts` methods (24 total, on `OperacionesService` class)

| Method | Endpoint | Return type |
|---|---|---|
| `getPeriodoAbierto` | `GET /preparar-lecturas/filtros/periodos` | `OperacionesServiceResponse<PrepararLecturasFiltrosPeriodosResponse[]>` |
| `getCiclosFacturacion` | `GET /preparar-lecturas/filtros/ciclos` | `OperacionesServiceResponse<PrepararLecturasFiltrosCiclosResponse[]>` |
| `postCrearPeriodoFacturacion(req)` | `POST /periodos/crear` | untyped |
| `postCerrarPeriodoFacturacion(codigo)` | `POST /periodos/cerrar/{codigo}` | untyped |
| `getPrepararLecturasData` | parallel (periodos + ciclos) | `OperacionesServiceResponse<{periodoAbierto, ciclos}>` |
| `postGenerarLecturas(req)` | `POST /preparar-lecturas/generar` | `OperacionesServiceResponse<any>` ⚠ |
| `getBuscarNichos(cicloId, periodoId)` | `GET /preparar-lecturas/buscar-nichos` | `OperacionesServiceResponse<PrepararLecturasBuscarNichosRequest[]>` |
| `getPreciosCargoData(mes, anio)` | `GET /precios/consultar` | `OperacionesServiceResponse<PreciosConsultarRequest[]>` ⚠ returns flat array but consumers expect `{tablaEnel, tablaAgualova}` |
| `postGuardarPreciosCargoMasivo(req)` | `POST /precios/guardar-masivo` | `OperacionesServiceResponse<any>` ⚠ |
| `gerRevisarPreciosData(mes, anio)` | `GET /revision-precios/consultar` | untyped (note typo "ger") |
| `postConfirmarRevisionPrecios(req)` | `POST /revision-precios/confirmar` | `OperacionesServiceResponse<any>` ⚠ |
| `getDetalleCorreccionCodigoCargo(codigo)` | `GET /revision-precios/correccion` | `OperacionesServiceResponse<any>` ⚠ |
| `postCorregirPrecioCargo(req)` | `POST /revision-precios/corregir` | untyped |
| `getCorteReposicionData` | `GET corte-reposicion/resumen` | `OperacionesServiceResponse<CorteReposicionResumenResponse>` |
| `getBuscarCorteReposicion(acomedita?)` | `GET /corte-reposicion/buscar` | untyped |
| `postIniciarProcesoCorteReposicion` | `POST /corte-reposicion/iniciar` | untyped |
| `postFinalizarProcesoCorteReposicion` | `POST /corte-reposicion/finalizar` | untyped |
| `postActualizarProcesoCorteReposicion` | `POST /corte-reposicion/actualizar-estados` | untyped |
| `getConsultarDeuda(acometida)` | `GET /corte-reposicion/consultar-deuda` | untyped |
| `postLiberarAcometida(req)` | `POST /corte-reposicion/liberar` | untyped |
| `postRegistrarCorte(req)` | `POST /corte-reposicion/registrar-corte` | untyped |
| `postSolicitarReposicion(contratoId, acometida)` | `POST /corte-reposicion/solicitar-reposicion` | untyped |
| `getRevisarCalculosFiltrosCiclos` | `GET /revisar-calculos/filtros/ciclos` | untyped |
| `getRevisarCalculosFiltrosPeriodos` | `GET /revisar-calculos/filtros/periodos` | untyped |
| `getRevisarCalculosEstadoProceso(cicloId, periodoId)` | `GET /revisar-calculos/estado-proceso` | untyped |
| `postRevisarCalculosLanzarCalculo(req)` | `POST /revisar-calculos/lanzar-calculo` | untyped |
| `getRevisarCalculosBuscarPrefacturas(...)` | `GET /revisar-calculos/buscar-prefacturas` | untyped |
| `postRevisarCalculosAceptar(periodoId)` | `POST /revisar-calculos/aceptar-calculos` | untyped |
| `getBuscarMedidorAntiguo(acometida?, numeroSerie?)` | `GET /cambio-medidor/buscar-medidor-antiguo` | untyped |
| `getBuscarMedidorNuevo(serie)` | `GET /cambio-medidor/buscar-nuevo` | untyped |
| `postEjecutarCambioMedidor(req)` | `POST /cambio-medidor/ejecutar-cambio` | untyped |

**Total: 31 methods on the class.** Several have NO return type annotation, three have `any`. The legacy `OperacionesServiceResponse<T>` envelope is the only typed return; new code (in `services/operations/*`) uses a different envelope (`ServiceResponse<T>` from `~/services/core/api-response`).

**Critical observation:** the service's `getCorteReposicionData` (line 303) fetches `/corte-reposicion/resumen` and returns the *resumen* response (totals). The route `corte-reposicion.tsx:16` calls this same method but expects the data shape of `mantenedorCorteData` — different endpoints.

## 3. Mental Model Per Module

### 3.1 Hooks

| File | LOC | Public surface | Service calls | Types imported | Issues |
|---|---|---|---|---|---|
| `use-calculo-factura.ts` | 144 | `useCalculoFactura({periodoFormateado, cicloId})` → `{data, filteredData, isLoading, error, searchTerm, setSearchTerm, handleRevisarCalculo, setData}` | direct `api.get('/calculo-prefactura-encabezado')` + `api.get('/calculo-prefactura-cargos')` — NOT through service | `CalculoPrefacturaCargoResponse`, `CalculoPrefacturaCompleto`, `CalculoPrefacturaDetalle` (NONE in source of truth) | Bypasses `operacionesService`; types don't exist |
| `use-calculo-facturacion-flow.ts` | 426 | 5 step runners + `ejecutarFlujoCompleto` + `limpiarFlujo` | `operacionesService.lanzarCalculoFacturacion`, `obtenerIdentificadorProceso`, `verificarEstadoProceso`, `consultarEncabezadoPrefactura`, `consultarCargosPrefactura` — NONE EXIST in service | `CalculoPrefacturaCargoResponse`, `CalculoPrefacturaCompleto`, `CalculoPrefacturaDetalle` (NONE in source of truth) | Calls 5 non-existent service methods; types don't exist |
| `use-calculo-proceso.ts` | 115 | `useCalculoProceso({periodoFormateado, cicloId, onCalculoAceptado})` → `{isLaunching, isAccepting, selectedContratos, setSelectedContratos, handleLanzarCalculo, handleAceptarCalculo}` | direct `api.post('lanzar-calculo-facturacion')` + `api.post('generar-detalle-factura')` — NOT through service | NONE | Bypasses service |
| `use-validacion-precios.ts` | 113 | `useValidacionPrecios({periodoFormateado, cicloId})` → `{preciosConfirmados, preciosConfirmadosCount, preciosPendientesCount, totalPrecios, isLoading, error, verificarPrecios, ...}` | direct `api.get('/ConsultarPreciosUno?mes=...')` + `api.get('/ConsultarPreciosDos?mes=...&dia=...')` | `RevisarPrecioDos`, `RevisarPrecioUno` (NONE in source of truth) | Bypasses service; types don't exist; hits legacy endpoint names not in service |
| `utils/cycle-utilities.ts` | 29 | `convertirCicloParaAPI(ciclo)`, `validarCicloYPeriodo(periodo, ciclo)`, `extraerMesYAnio(periodo)`, `obtenerDiaDelCiclo(ciclo)` | — | — | OK; pure helpers |
| `utils/data-combiner.ts` | 42 | `combinarPrefactura(encabezados, cargos)`, `calcularTotalFacturado`, `validarDatosCombinados` | — | `CalculoPrefactura*` (don't exist) | Types don't exist |
| `utils/error-handler.ts` | 63 | `ErrorResponse`, `extraerErrorMessage`, `validarRespuestaAPI`, `es404`, `extraerCodigoEstatus` | — | — | Heavy `any` use; `validarRespuestaAPI: data is any[]` is too permissive |
| `utils/price-validator.ts` | 54 | `PriceValidationResult`, `filtrarPreciosValidos`, `contarConfirmados`, `validarPreciosConfirmados` | — | `RevisarPrecioUno`, `RevisarPrecioDos` (don't exist) | Types don't exist |

### 3.2 Utils (`app/utils/operaciones/**`)

| File | LOC | Exports | Concerns |
|---|---|---|---|
| `confirmation-helpers.ts` | 66 | `processConfirmations`, `filterPendingConfirmations` | Calls `api.post('/ConfirmarPrecio?indice=...&usuario=...')` — endpoint not in service. Loose `toast: any` typing. |
| `constants.ts` | 42 | `MONTHS`, `getYearsRange`, `getCurrentMonth`, `getCurrentYear`, `getMonthLabel` | Self-contained. Re-exported from `index.ts`. |
| `formatters.ts` | 68 | `formatPeriodLabel`, `formatPrice`, `formatNumber`, `formatCycle`, `formatDate` | `formatPeriodLabel` rebuilds the month map that already lives in `constants.ts` `MONTHS` — DUPLICATION. |
| `index.ts` | 27 | re-exports | **MISSING re-exports for `confirmation-helpers`, `revisar-precio-helpers`** — the only utils re-exported are `constants`, `formatters`, `validations`. |
| `revisar-precio-helpers.ts` | 76 | `isCredentialError`, `isAuthorizationError`, `getErrorMessage`, `handleValidationHTTPError`, `handleGeneralValidationError` | Subset/superset of `utils/error-handler.ts` — DUPLICATION of `extraerErrorMessage`. |
| `validations.ts` | 134 | `ValidationResult`, `validatePeriod`, `validatePrice`, `validateUserCredentials`, `validateCycle`, `validateSelection` | Pure. No dependency on types. |

### 3.3 Components (per subdomain)

#### anular-factura-impresa
- `anular-factura-impresa-component.tsx` (284 LOC) — only file. Self-contained UI; calls `api.post('/anular-factura-impresa', {numeroFolio, alcance})` directly. Endpoint not in service. **Hardcoded request shape** (`numeroFolio` and `alcance` fields) that doesn't match `AnularFacturaEjecutarRequest` which is `{numeroFactura, conTomaLectura}`. **Type drift + endpoint drift.**

#### cambio-medidor
- `cambio-medidor-component.tsx` (842 LOC) — orchestrator with 4 step state machine.
- 8 sub-components (`antiguo-medidor-form`, `detalle-medidor-antiguo`, `detalle-medidor-nuevo`, `medidor-field`, `medidor-fields-group`, `nuevo-contrato-form`, `nuevo-medidor-form`, `collapsible-header`).
- Direct `api.get('/consulta-medidor-antiguo')` etc. — bypasses service.
- Imports 5 types from `~/types/operaciones` that don't exist: `ConsultaMedidorAntiguoResponse`, `ConsultaMedidorNuevoResponse`, `DetalleMedidorAntiguo`, `DetalleMedidorNuevo`, `MedidorAntiguo`, `MedidorNuevo`.
- Local prop interfaces also imported: `AntiguoMedidorFormProps`, `NuevoMedidorFormProps`, `NuevoContratoFormProps`, `DetalleMedidorAntiguoProps`, `DetalleMedidorNuevoProps`.

#### cerrar-lecturas
- `cerrar-lecturas-component.tsx` (763 LOC) — main UI with local `obtenerCicloParaAPI` helper (line 102) that duplicates `utils/cycle-utilities.ts → convertirCicloParaAPI`.
- `alert-cerrar-lecturas.tsx` (239 LOC) — direct `api.post('/cerrar-lecturas-nicho')` — endpoint not in service.
- `columns.tsx` (266 LOC) — `ColumnDef<EstadoCierreLecturas>` — type doesn't exist.
- `data-table-virtualized.tsx` (179 LOC) — local copy of virtualized table.
- `dialog-informacion.tsx` (161 LOC) — static info dialog.
- All components import `Ciclo`, `EstadoCierreLecturas`, `PeriodoAbierto` from `~/types/operaciones` — none exist.

#### corte-reposicion
- `corte-reposicion-component.tsx` (662 LOC) — large component with many endpoints hit directly.
- `columns.tsx` (260 LOC) — exports a `columns()` FUNCTION that closes over dialog components; awkward pattern.
- 3 dialog sub-components (`consultar-acometida-dialog` 600+ LOC, `corte-registrado-dialog`, `reposicion-solicitada-dialog`).
- `ConsultarMantenedorRevisionCorte` type imported — doesn't exist.
- The route loader calls `operacionesService.getCorteReposicionData()` but the component then ALSO calls `api.get('consulta-mantenedor-revision-corte')` and `api.get('consulta-registros-revision')` — these are different endpoints, so the loader result is essentially unused.

#### crear-archivos-sap
- `crear-archivos-sap-component.tsx` (258 LOC) — only file. Two direct `api.get('/exportar-encabezado')` and `api.get('/exportar-detalle')` blob downloads. No service method exists.

#### periodo-facturacion
- `periodo-facturacion-component.tsx` (265 LOC) — main UI.
- `columns.tsx` (175 LOC) — `ColumnDef<Periodos>` — type doesn't exist.
- `dialog-abrir-periodo.tsx` (185 LOC) — `api.post('/ingresa-periodo')` direct.
- `dialog-nuevo-periodo.tsx` (192 LOC) — `MONTHS` array **duplicated** locally (lines 27-40) instead of importing from `utils/operaciones/constants.ts`.
- `cerrar-periodo.tsx` (138 LOC) — `api.post('/cerrar-periodo', JSON.stringify(periodoId))` — endpoint not in service; payload is a JSON string of a string id, which is untyped.
- Imports `Anio`, `Periodos` from `~/types/operaciones` — neither exist.

#### precios-cargo
- `precios-cargo-component.tsx` (567 LOC) — main UI.
- `columns-enel.tsx` (218 LOC) — `ColumnDef<PreciosCargoEnel>` — type doesn't exist.
- `columns-enerlova.tsx` (132 LOC) — `ColumnDef<PreciosCargoAgualova>` — type doesn't exist.
- `data-table-precios.tsx` (256 LOC) — local data table.
- `data-table-precios-virtualized.tsx` (294 LOC) — virtualized variant.
- `detalle-precios-enerlova.tsx` (550 LOC) — `DetallepreciosCargoAgualova` doesn't exist.
- `dialog-agregar-precios.tsx` — `DialogAgregarPreciosProps` doesn't exist.
- `dialog-nuevo-valor-enerlova.tsx` (700+ LOC) — large dialog.
- **Service contract mismatch:** `operacionesService.getPreciosCargoData(mes, anio)` returns `PreciosConsultarRequest[]` (flat array), but the route `precios-cargo.tsx:43-45` expects `result.data.tablaEnel` and `result.data.tablaAgualova` (object). **Type error at runtime.**

#### preparar-lecturas
- `preparar-lecturas-component.tsx` (458 LOC) — main UI with local `obtenerCicloParaAPI` (line 99) duplicating utils.
- `tabla-asignacion-sectores.tsx` (542 LOC) — imports `ConsultarAsignacionSectores`, `ConsultarSectores`, `TablaAsignacionSectoresProps` — none exist.
- `tabla-lecturas-pendientes.tsx` (175 LOC) — imports `ValidarSectoresPendientes` — doesn't exist.
- Direct `api.get('/ConsultarAsignacionSectores')` etc. The route calls `operacionesService.getAsignacionSectores(ciclo, periodo)` which doesn't exist.

#### revisar-calculo-factura
- `revisar-calculo-factura-component.tsx` (810 LOC) — main UI.
- `columnsPrecalculo.tsx` (220 LOC) — `ColumnDef<CalculoPrefacturaCompleto>` — type doesn't exist.
- `data-table.tsx`, `hierarchical-data-table.tsx` (239 LOC), `hierarchical-data-table-virtualized.tsx` (380 LOC) — three table variants for the same purpose.
- `revisar-calculo-factura-component.test.tsx` (275 LOC) — only component test in the entire target set.
- Hooks called: `useCalculoFactura`, `useCalculoProceso`, `useValidacionPrecios`.
- The route's `clientLoader` calls `operacionesService.verificarEstadoCierreLecturas` which doesn't exist in service.

#### revisar-precio
- `revisar-precio-component.tsx` (574 LOC) — main UI.
- `columns-enel.tsx` (208 LOC) — `ColumnDef<RevisarPrecioUno>` — type doesn't exist.
- `columns-agualova.tsx` (185 LOC) — `ColumnDef<RevisarPrecioDos>` — type doesn't exist.
- `data-table.tsx` (172 LOC), `data-table-virtualized.tsx` (222 LOC) — two table variants.
- `dialog-modificar-precio.tsx` (318 LOC) — `api.post('/modificar-precio-cargo-correccion', {indice, valor, motivo, usuario})` — endpoint not in service; payload doesn't match `RevisionPreciosCorregirRequest` which is `{codigoCargo, nuevoValor, motivo, passwordConfirmacion}`. **Major contract drift.**
- `tabla-valores-enel.tsx`, `tabla-valores-enerlova.tsx` — `TablaValoresEnelProps`, `TablaValoresAgualovaProps` don't exist.
- Route calls `operacionesService.getRevisarPrecioData` and `operacionesService.getPreciosPorCiclo` — both don't exist in service.

### 3.4 Routes

All 10 route files follow the same pattern: import `BreadcrumbSetter`, import the main component, optionally use a `clientLoader` calling `operacionesService.*` or `api.get` directly, set breadcrumbs, render component. All are very thin (28-124 LOC). Notable:

- `cerrar-lecturas.tsx`, `periodo-facturacion.tsx`, `preparar-lecturas.tsx`, `revisar-calculo-factura.tsx`, `revisar-precio.tsx` all call service methods that DON'T exist in the source of truth.
- `revisar-calculo-factura.tsx:34` calls `operacionesService.verificarEstadoCierreLecturas` — doesn't exist.
- `revisar-precio.tsx:22` calls `operacionesService.getRevisarPrecioData` — doesn't exist.
- `preparar-lecturas.tsx:57` calls `operacionesService.getAsignacionSectores` — doesn't exist.
- `corte-reposicion.tsx:16` calls `operacionesService.getCorteReposicionData` — exists but returns wrong shape (resumen vs mantenedor).

### 3.5 Tests

| File | Status | Notes |
|---|---|---|
| `use-calculo-factura.test.ts` | unrunnable (no test/setup.ts) | 141 LOC, only initial-state and error-message tests. Doesn't mock `operacionesService` (the hook bypasses it). |
| `use-calculo-proceso.test.ts` | unrunnable | 163 LOC, similar surface. |
| `use-validacion-precios.test.ts` | unrunnable | 168 LOC, mocks `api.get` directly. |
| `revisar-calculo-factura-component.test.tsx` | unrunnable | 275 LOC, mocks the three hooks with `vi.mock`. Heavy and brittle. |

Tests currently cannot run because `test/setup.ts` is missing (per orchestrator preflight). This is a known risk explicitly out of scope for this refactor.

## 4. Findings

### 4.1 Contract drift (must fix)

The source of truth is **incomplete** with respect to what the consumers depend on. Two classes of drift:

#### A. Types imported from `~/types/operaciones` that don't exist anywhere

The following types are imported in 30+ files but do not exist in the source of truth (and do not exist anywhere else in `app/`):

| Missing type | Used in (sample) |
|---|---|
| `Anio` | `periodo-facturacion-component.tsx:30`, `dialog-nuevo-periodo.tsx:23` |
| `Periodos` | `periodo-facturacion-component.tsx:30`, `columns.tsx:7` |
| `Ciclo` | `cerrar-lecturas-component.tsx:41`, `revisar-calculo-factura-component.tsx:44`, `revisar-precio-component.tsx:35` |
| `PeriodoAbierto` | `cerrar-lecturas-component.tsx:41`, `preparar-lecturas-component.tsx:40`, `revisar-calculo-factura-component.tsx:44`, `revisar-precio-component.tsx:35` |
| `EstadoCierreLecturas` | `cerrar-lecturas/columns.tsx:16`, `cerrar-lecturas-component.tsx:41`, `alert-cerrar-lecturas.tsx:19` |
| `RevisarPrecioUno` | `columns-enel.tsx:7`, `use-validacion-precios.ts:4`, `price-validator.ts:1` |
| `RevisarPrecioDos` | `columns-agualova.tsx:7`, `use-validacion-precios.ts:4`, `price-validator.ts:1` |
| `ConsultarMantenedorRevisionCorte` | `corte-reposicion-component.tsx:41`, `columns.tsx:6` |
| `ConsultarAsignacionSectores` | `preparar-lecturas-component.tsx:40`, `tabla-asignacion-sectores.tsx:37` |
| `ConsultarSectores` | `preparar-lecturas-component.tsx:40`, `tabla-asignacion-sectores.tsx:37` |
| `OpcionesPrepararLecturas` | `preparar-lecturas-component.tsx:40` |
| `ValidarSectoresPendientes` | `preparar-lecturas-component.tsx:40`, `tabla-lecturas-pendientes.tsx:14` |
| `CalculoPrefacturaCompleto` | `use-calculo-factura.ts:10`, `use-calculo-facturacion-flow.ts:10`, `hierarchical-data-table.tsx:24`, `columnsPrecalculo.tsx:6` |
| `CalculoPrefacturaDetalle` | `use-calculo-factura.ts:10`, `use-calculo-facturacion-flow.ts:10` |
| `CalculoPrefacturaCargoResponse` | `use-calculo-factura.ts:10`, `use-calculo-facturacion-flow.ts:10` |
| `CalculoPrefacturaCargo` | `hierarchical-data-table.tsx:24` |
| `IdentificadorProceso` | (referenced by `services/operations/billing-calculation.service.ts:7`) |
| `EstadoProceso` | (referenced by `services/operations/billing-calculation.service.ts:7`) |
| `ConsultaMedidorAntiguoResponse`, `ConsultaMedidorNuevoResponse`, `DetalleMedidorAntiguo`, `DetalleMedidorNuevo`, `MedidorAntiguo`, `MedidorNuevo` | `cambio-medidor-component.tsx:35` |
| `PreciosCargoEnel`, `PreciosCargoAgualova`, `DetallepreciosCargoAgualova` | `precios-cargo-component.tsx:36`, `columns-enel.tsx:5`, `columns-enerlova.tsx:4`, `detalle-precios-enerlova.tsx:32` |
| `TablaValoresEnelProps`, `TablaValoresAgualovaProps` | `tabla-valores-enel.tsx:7`, `tabla-valores-enerlova.tsx:7` |
| `AntiguoMedidorFormProps`, `NuevoMedidorFormProps`, `NuevoContratoFormProps`, `DetalleMedidorAntiguoProps`, `DetalleMedidorNuevoProps` | cambio-medidor sub-components |
| `DialogAgregarPreciosProps` | `precios-cargo/dialog-agregar-precios.tsx:18` |
| `TablaAsignacionSectoresProps` | `tabla-asignacion-sectores.tsx:37` |
| `TotalesCorteReposicion` | (referenced by `services/operations/preparation.service.ts:11`) |

**Note:** the source of truth is FROZEN, so we cannot add these types. They must be added as **local** types in the consumer modules, with the structure inferred from the consumer code. The cleanest approach is a new `app/types/operaciones/` directory with one file per subdomain (e.g., `periodo.ts`, `ciclo.ts`, `precio.ts`, `prefactura.ts`).

#### B. Service methods called that don't exist in `operacionesService`

| Missing method | Called from |
|---|---|
| `operacionesService.getCerrarLecturasData()` | `routes/dashboard/operaciones/cerrar-lecturas.tsx:18` |
| `operacionesService.getPeriodoFacturacionData()` | `routes/dashboard/operaciones/periodo-facturacion.tsx:18` |
| `operacionesService.getAsignacionSectores(ciclo, periodo)` | `routes/dashboard/operaciones/preparar-lecturas.tsx:57` |
| `operacionesService.verificarEstadoCierreLecturas(cicloId, periodo)` | `routes/dashboard/operaciones/revisar-calculo-factura.tsx:34` |
| `operacionesService.getRevisarPrecioData(dia)` | `routes/dashboard/operaciones/revisar-precio.tsx:22` |
| `operacionesService.getPreciosPorCiclo(mes, anio, dia)` | `routes/dashboard/operaciones/revisar-precio.tsx:81` |
| `operacionesService.lanzarCalculoFacturacion(cicloId, periodo)` | `hooks/operaciones/use-calculo-facturacion-flow.ts:128` |
| `operacionesService.obtenerIdentificadorProceso(ciclo, periodo, modo)` | `hooks/operaciones/use-calculo-facturacion-flow.ts:156` |
| `operacionesService.verificarEstadoProceso(procesoId)` | `hooks/operaciones/use-calculo-facturacion-flow.ts:205` |
| `operacionesService.consultarEncabezadoPrefactura(ciclo, periodo)` | `hooks/operaciones/use-calculo-facturacion-flow.ts:242` |
| `operacionesService.consultarCargosPrefactura(ciclo, periodo)` | `hooks/operaciones/use-calculo-facturacion-flow.ts:276` |

**11 missing service methods total** (6 from routes, 5 from hooks). The route files are calling methods that compile-fail at runtime.

#### C. Service method shape mismatch (exists but wrong)

`operacionesService.getCorteReposicionData()` at `operacionesService.ts:303`:
- Endpoint: `GET corte-reposicion/resumen` (returns `CorteReposicionResumenResponse` with totals).
- But the route at `corte-reposicion.tsx:31` expects `mantenedorCorteData` and passes it to `CorteReposicionComponent` which uses it as a list of `ConsultarMantenedorRevisionCorte`.
- **Shape mismatch: resumen vs mantenedor list.**

`operacionesService.getPreciosCargoData(mes, anio)` at `operacionesService.ts:183`:
- Returns `PreciosConsultarRequest[]` (flat array).
- But `routes/dashboard/operaciones/precios-cargo.tsx:43-45` destructures `result.data.tablaEnel` and `result.data.tablaAgualova` (object).
- **Shape mismatch: flat array vs object.**

#### D. Direct API calls bypassing the service

Many components call `api.get/post` directly instead of `operacionesService.*`. This means the service contract is not enforced:

- `anular-factura-impresa-component.tsx:58` — `api.post('/anular-factura-impresa', {numeroFolio, alcance})` — different shape from `AnularFacturaEjecutarRequest` which uses `{numeroFactura, conTomaLectura}`.
- `cambio-medidor-component.tsx:178` — `api.get('/consulta-medidor-antiguo')` — endpoint name doesn't match `getBuscarMedidorAntiguo` (which uses `/cambio-medidor/buscar-medidor-antiguo`).
- `cerrar-lecturas-component.tsx:158` — `api.get('/estado-cierre-lecturas')` — same as service's `getBuscarCorteReposicion`? No, this hits a different URL.
- `cerrar-lecturas/alert-cerrar-lecturas.tsx:75` — `api.post('/cerrar-lecturas-nicho', {...})` — not in service.
- `corte-reposicion-component.tsx` — many direct calls: `consulta-registros-revision`, `consulta-mantenedor-revision-corte`, `modificar-revision`, `ingresar-revision`, `eliminar-revision`, `exportar-*`.
- `crear-archivos-sap-component.tsx:58,106` — `api.get('/exportar-encabezado'|'/exportar-detalle')` — not in service.
- `periodo-facturacion-component.tsx:56` — `api.get('/consulta-periodo')` — not in service.
- `dialog-abrir-periodo.tsx:70` — `api.post('/ingresa-periodo')` — not in service.
- `cerrar-periodo.tsx:45` — `api.post('/cerrar-periodo', JSON.stringify(periodoId))` — not in service.
- `preparar-lecturas-component.tsx` (inherited route issue).
- `revisar-precio/dialog-modificar-precio.tsx:107` — `api.post('/modificar-precio-cargo-correccion', {indice, valor, motivo, usuario})` — payload doesn't match `RevisionPreciosCorregirRequest` which expects `{codigoCargo, nuevoValor, motivo, passwordConfirmacion}`.
- `use-calculo-factura.ts:69,86` — `api.get('/calculo-prefactura-encabezado'|'/calculo-prefactura-cargos')` — not in service.
- `use-calculo-proceso.ts:46,81` — `api.post('lanzar-calculo-facturacion'|'generar-detalle-factura')` — not in service.
- `use-validacion-precios.ts:64,67` — `api.get('/ConsultarPreciosUno?...'|'/ConsultarPreciosDos?...')` — not in service (the service has `gerRevisarPreciosData` with a typo and different endpoint `/revision-precios/consultar`).

**This is a major architectural problem**: the service was meant to be the single point of HTTP access, but the consumers bypass it almost everywhere.

#### E. Endpoint path inconsistencies

Even where consumers do use the service, the URL parameters differ:
- Service: `/preparar-lecturas/filtros/periodos` (operacionesService.ts:35)
- Hook `use-validacion-precios.ts:65`: `/ConsultarPreciosUno?mes=${mes}&año=${anio}` (different endpoint, capital C, no service method).
- Service: `params.append('año', anio)` (operacionesService.ts:190) — uses non-ASCII `año` in URL.

#### F. Type `any` spread from the source of truth

The source of truth service has THREE methods returning `OperacionesServiceResponse<any>`:
- `postGenerarLecturas` (line 136)
- `postGuardarPreciosCargoMasivo` (line 209)
- `postConfirmarRevisionPrecios` (line 250)
- `getDetalleCorreccionCodigoCargo` (line 267)

Plus `OperacionesServiceResponse<any>` is returned by `billing-calculation.service.ts:22, 169` and used as `any` in `processResponseArray(response)` (no generic).

The consumer-side risk: anywhere these methods are used, the consumer must narrow `any` to a real type. Today, no consumer narrows them, so the data flows into the UI as `any`.

### 4.2 Duplication (should fix)

1. **`obtenerCicloParaAPI` / `convertirCicloParaAPI` repeated 3 times:**
   - `hooks/operaciones/utils/cycle-utilities.ts:1` — `convertirCicloParaAPI` (canonical)
   - `components/operaciones/cerrar-lecturas/cerrar-lecturas-component.tsx:102` — `obtenerCicloParaAPI` (different signature: takes `diaFacturacion`)
   - `components/operaciones/preparar-lecturas/preparar-lecturas-component.tsx:99` — `obtenerCicloParaAPI` (yet another signature: takes `idCiclo`)

   The three functions have different logic and different inputs but solve the same problem (frontend cycle id ↔ API cycle id). They should be unified.

2. **`MONTHS` array literal repeated 3 times:**
   - `utils/operaciones/constants.ts:2` — canonical
   - `components/operaciones/periodo-facturacion/dialog-nuevo-periodo.tsx:27-40` — duplicate
   - `components/operaciones/periodo-facturacion/dialog-abrir-periodo.tsx:21-34` — duplicate
   - `utils/operaciones/formatters.ts:2-15` — duplicate inside `formatPeriodLabel` (uses a `Record` instead of the `MONTHS` array).

3. **Two data-table virtualization patterns:**
   - `components/operaciones/cerrar-lecturas/data-table-virtualized.tsx` — uses `useVirtualizer` from `@tanstack/react-virtual`.
   - `components/operaciones/revisar-precio/data-table-virtualized.tsx` — similar but with `enableSelection`/`selectedRowIds` props.
   - `components/operaciones/revisar-calculo-factura/hierarchical-data-table-virtualized.tsx` — yet another variant with hierarchical expansion.
   - Plus three NON-virtualized tables: `cerrar-lecturas` (uses shared `DataTable`), `revisar-precio/data-table.tsx`, `revisar-calculo-factura/data-table.tsx`, `precios-cargo/data-table-precios*.tsx`.

4. **Error handling utilities duplicated:**
   - `hooks/operaciones/utils/error-handler.ts` — `extraerErrorMessage`, `es404`, `extraerCodigoEstatus`, `validarRespuestaAPI`.
   - `utils/operaciones/revisar-precio-helpers.ts` — `isCredentialError`, `isAuthorizationError`, `getErrorMessage`, `handleValidationHTTPError`, `handleGeneralValidationError`.
   - `utils/operaciones/confirmation-helpers.ts` — re-implements HTTP status check (`error.response?.status === 401`).
   - Many components have inline `try/catch` that call `api.post(...)` and handle `error.response.data?.mensaje` inline (10+ occurrences).

5. **`periodoFormateado` string built inline in 5+ places:**
   - `cerrar-lecturas-component.tsx:67-74`
   - `preparar-lecturas-component.tsx:91-97`
   - `revisar-calculo-factura-component.tsx:64-70`
   - `revisar-calculo-factura.tsx:30-31` (route)
   - `revisar-calculo-factura.tsx:30` (inline)

   The pattern is always: `periodoAbierto[0].mes.toString().padStart(2, '0') + periodoAbierto[0].anio.toString()`. This should be a shared util `formatPeriodoId(periodoAbierto)`.

6. **Cycle-to-API mapping repeated:** see point 1.

7. **CSV/blob download logic duplicated 3 times in `crear-archivos-sap-component.tsx`:**
   - `handleDescargarEncabezado` (line 53) and `handleDescargarDetalle` (line 101) are near-identical (only the URL and file prefix differ).
   - `corte-reposicion-component.tsx` has THREE more blob download handlers (`handleExportarExcel`, `handleExportarExcelCorte`, `handleExportarFacturasImpagas` lines 98, 120, 142) with the same URL.createObjectURL → anchor.click → URL.revokeObjectURL pattern.

8. **`getCantidadPorCodigo` / filter-by-code pattern:** `corte-reposicion-component.tsx:91-96` is a generic O(n) lookup that could be a `Map`.

9. **Two `Periodo` types in different files:**
   - `app/types/monitor.ts:4` defines `interface Periodo`
   - `app/types/reportes.ts:111` defines `interface PeriodosFacturacion`
   - Consumers use `Periodos` (in operaciones) which would conflict with `monitor.ts` naming.

10. **The whole `app/routes/dashboard/reportes/components/operaciones/` directory is a 51-file copy of the target directories' components.** It is dead code (no imports reference it), but the existence of the duplicate causes confusion and drift. **Outside the refactor scope, but a major finding.**

### 4.3 Style / convention drift (optional)

- **Mix of `toast.success('X')` and `toast.error(error as any)`:**
  10 components pass `error as any` as the description argument to `toast.error` (e.g. `corte-reposicion-component.tsx:114`, `revisar-precio-component.tsx:170`). Sonner's signature doesn't accept a non-string description, so this is silently broken.

- **Console statements in 10 files** (see 4.5).

- **Inconsistent error state representation:**
  - `cerrar-lecturas-component.tsx` uses `string | null` for `error`.
  - `use-calculo-factura.ts` uses `string | null` but with a sentinel value `'NO_LECTURAS_CERRADAS'`.
  - The component then `if (error === 'NO_LECTURAS_CERRADAS')` — string equality on a magic value, instead of a discriminated union.

- **`useEffect` cleanup via `useRef`:** `preparar-lecturas-component.tsx:72-89` uses `prevLoadingRef` to detect transitions. This pattern is fine but ad-hoc; could be a `useLoadingTransition` hook.

- **`useState<ConsultarAsignacionSectores[]>([])` + setState callback in routes:** `routes/dashboard/operaciones/preparar-lecturas.tsx:38-75` and `revisar-precio.tsx:56-99` re-implement the "clientLoader + local state + refresh" pattern. Could be a `useReloader(serviceMethod)` hook.

- **`useEffect` to clear on cicloId change:** `use-calculo-facturacion-flow.ts:397-400` runs `limpiarFlujo` on every cicloId change, including the initial mount. Side-effect-on-mount bug.

- **Three different file-extension blob-download fallback names** in `crear-archivos-sap-component.tsx:42-51` and `corte-reposicion-component.tsx:108/130/156`: hardcoded `.csv`, `.xlsx`, `mantenedor_revision.xlsx`, `revision_corte.xlsx`, `facturas-impagas-completo.xlsx`. No central list.

- **`React` import:** Several files have `import React from 'react'` despite no JSX runtime needing it (`anular-factura-impresa.tsx:2`, `cambio-medidor.tsx:2`, `cerrar-lecturas.tsx:2`, etc.). `verbatimModuleSyntax: true` in tsconfig means these are flagged. Should be removed.

- **Spanish variable names mixed with English:** most variables Spanish, but `user.fullName`, `useState`, `useEffect`, etc. are English. Inconsistent.

- **Hardcoded URL strings:** 30+ hardcoded URL paths in `api.get('/...')` calls. Service is supposed to centralize these but doesn't.

- **ESLint disables `no-empty-pattern`:** All 10 route files start with `/* eslint-disable no-empty-pattern */` because the `meta({}: Route.MetaArgs)` pattern in React Router 7 requires the empty destructuring. This is a React Router 7 pattern; ok but noisy.

- **`Set<T>(new Array<T>())` for `selectedRows`:** `cerrar-lecturas-component.tsx:61` and similar — `useState<EstadoCierreLecturas[]>([])` is fine but the ID-based selection in `DataTableVirtualized.onRowSelectionChange` then runs `Object.keys + .find()` to recover the original rows. `O(n²)` per selection change.

### 4.4 Architectural improvements (judgment call)

1. **The new `app/services/operations/*` directory is a parallel, mostly-unused service layer:**
   - `periodos.service.ts` (90 LOC) — `getOpenPeriod`, `getActiveBillingCycles`, etc. (English names vs the legacy Spanish).
   - `pricing.service.ts` (128 LOC) — `getPricingData`, `getPreciosUno`, `getPreciosDos`, `getCyclePrices`.
   - `preparation.service.ts` (168 LOC) — `getPrepareReadingsData`, `getSectorAssignment`, `getReviewPriceData`, `getCutRepositionData`.
   - `billing-calculation.service.ts` (192 LOC) — `launchBillingCalculation`, `getProcessIdentifier`, `getCurrentProcessIdentifier`, `checkProcessStatus`, `getPrefacturaHeader`, `getPrefacturaCharges`, `generateBillingDetail`, `checkReadingClosureStatus`.
   - These services use `BaseApiService` from `~/services/core/base-service` and `ServiceResponse<T>` from `~/services/core/api-response`.
   - **They are NOT used by the routes** in the target directories. The routes still call the legacy `operacionesService`.
   - The `billing-calculation.service.ts` and `preparation.service.ts` methods map almost 1:1 to the **missing** service methods in §4.1.B — `launchBillingCalculation` ≈ `lanzarCalculoFacturacion`, `checkProcessStatus` ≈ `verificarEstadoProceso`, etc. This is clearly a planned refactor that was started but not finished.
   - **Recommendation for the proposal:** the refactor should EITHER (a) move the new service files into the legacy `operacionesService.ts` class (since source of truth is frozen, this means consumers need to be migrated to call existing methods), OR (b) add adapter methods to `operacionesService.ts` that delegate to the new services. But since the source of truth is FROZEN, option (a) is blocked. **Option (b) is also blocked** because adapter methods would modify `operacionesService.ts`. **The only option is to have consumers call the new services directly** (bypassing `operacionesService.ts`). This is a non-trivial architectural decision.

2. **Hooks should encapsulate more of the data-fetching flow:** Today, routes do `clientLoader` + `useState<data>` + `useState<isLoading>` + `useState<error>` + a callback to reload. This is a re-implementation of SWR. A `useAsyncResource<T>(fetcher)` hook (or adoption of SWR/React Query) would eliminate the duplication.

3. **Extract `<EmptyState />`, `<ErrorState />`, `<LoadingState />`, `<SearchBar />` components:** Every page has a hand-rolled loading spinner, error card, and empty state. They're 100% visual duplicates.

4. **Extract `<StatsCardGroup />` for the four-card stats pattern:** `cerrar-lecturas-component.tsx:517-559` and `corte-reposicion-component.tsx:540-575` both render 3-4 stat cards with a colored badge, an icon, a big number, and a label. Pattern identical, content different.

5. **`<BreadcrumbSetter />` could become a `<OperacionesPage title="..." breadcrumbs={[...]}>...` compound component** to eliminate the 9-line pattern repeated in every route.

6. **`<DriverTour steps={...} />` wrapper:** The driver.js `driver().setSteps().drive()` pattern is duplicated in `corte-reposicion-component.tsx:323-345`, `revisar-calculo-factura-component.tsx:223-245`, `revisar-precio-component.tsx:300-321`. Could be a single `useProductTour(steps)` hook.

7. **`<OperacionHeader title description icon>`:** `ModernHeader` is shared, but every page passes a custom description. Could compose better.

8. **Extract `parseFechaDDMMYYYY` and `formatDateForSorting`:** `components/operaciones/periodo-facturacion/columns.tsx:9-34` defines both, then exports `columns` that depends on them. These should be in a shared util (`utils/operaciones/formatters.ts` already has `formatDate` but it uses `Date.toLocaleDateString` which doesn't accept a DD-MM-YYYY string input).

### 4.5 Dead code (in target directories only)

- `use-calculo-facturacion-flow.ts:174` uses `procesoId` from state but it's typed as `string | null` and only set in `ejecutarPaso2`. If `ejecutarPaso2` is never called, `procesoId` stays null. The variable is set, but the flow is rarely run; a lot of this hook is effectively dead in the routes (which use `useCalculoFactura` + `useCalculoProceso` instead).
- `use-calculo-facturacion-flow.ts:91-95` — `debugMode`/`setDebugMode` is exposed in the return but never used by any component.
- `use-validacion-precios.ts:42-44` — three separate `useState<number>` (`totalValidos`, `totalConfirmados`, `totalPendientes`) instead of one `useState<PriceValidationResult>`. The triple-state is then synthesized into a returned object that duplicates the underlying `PriceValidationResult`. Result: `preciosConfirmados` is set from `resultado.todosConfirmados` (line 92) but the returned `todosConfirmados` is also `preciosConfirmados` (line 110). Two names for the same value.
- `use-calculo-factura.ts:43-44` — `error: string | null` is used as both a string and a magic sentinel `'NO_LECTURAS_CERRADAS'`. The 404 case is the ONLY meaningful use of this magic value (line 101).
- `app/routes/dashboard/operaciones/cerrar-lecturas.tsx:18` — `getCerrarLecturasData()` returns `{periodoAbierto, ciclosFacturacion}` but the route destructures `{periodoAbierto, ciclosFacturacion}` (line 31). The method doesn't exist, so the file is unrunnable; this is a phantom import.
- `utils/operaciones/index.ts` re-exports `constants`, `formatters`, `validations` but NOT `confirmation-helpers` and `revisar-precio-helpers`. The component `revisar-precio-component.tsx:44` imports `processConfirmations` and `filterPendingConfirmations` from `~/utils/operaciones/confirmation-helpers` directly, bypassing the index. Inconsistent.

### 4.6 Shared concerns across the 10 subdomains

Recurring patterns seen in 3+ subdomains:

| Pattern | Where | Recommendation |
|---|---|---|
| `periodoFormateado` derived from `periodoAbierto[0]` | cerrar-lecturas, preparar-lecturas, revisar-calculo-factura (×2), preparar-lecturas route | `formatPeriodoId(periodoAbierto)` util |
| `obtenerCicloParaAPI` / `convertirCicloParaAPI` | cerrar-lecturas, preparar-lecturas, all 4 hooks | `utils/operaciones/cycle-utilities.ts` already has it; replace local copies |
| `MONTHS` array | constants, formatters, dialog-nuevo-periodo, dialog-abrir-periodo | import from `~/utils/operaciones` |
| Inline `api.get/post` with try/catch + toast | 10+ files | route through `operacionesService` (add missing methods) |
| Big loading spinner with "Buscando..." text | cerrar-lecturas, preparar-lecturas, revisar-calculo-factura, precios-cargo | `<LoadingState label="..." />` |
| Error card with "Cerrar" button | cerrar-lecturas, preparar-lecturas, revisar-calculo-factura | `<ErrorState message onClose />` |
| Empty state with magnifying glass icon | cerrar-lecturas, preparar-lecturas, revisar-calculo-factura | `<EmptyState title subtitle />` |
| Stat cards (icon + big number + label, colored) | cerrar-lecturas, corte-reposicion | `<StatsCard icon value label tone />` |
| driver.js tour | corte-reposicion, revisar-calculo-factura, revisar-precio | `useProductTour(steps)` hook |
| `useState<X[]>(initial) + onRowSelectionChange` | revisar-precio (×2 tables) | `<SelectableDataTable ... />` |
| Blob download with `URL.createObjectURL + anchor.click + revoke` | crear-archivos-sap (×2), corte-reposicion (×3) | `downloadBlob(blob, filename)` util |
| Filter form (Card + Collapsible + period selector + cycle selector + Limpiar/Buscar buttons) | cerrar-lecturas, preparar-lecturas, revisar-calculo-factura, precios-cargo | `<FilterForm fields onSearch onClear />` |

## 5. Risks

1. **Phantom service calls:** 6 routes + 1 hook call service methods that don't exist. These files don't compile OR they run and throw at runtime. Without the deferred test setup, this is hard to detect automatically.
2. **Phantom type imports:** 30+ type imports from `~/types/operaciones` that don't exist. `tsc` would flag these, but the orchestrator note says the project compiles. Either (a) `tsc` is not run in CI without `--noEmit` (so type errors don't block), or (b) some build path is being skipped. The risk is that any consumer-side type fix needs to also add the missing types as local types, not modify the source of truth.
3. **Service contract shape mismatches:** `getCorteReposicionData` returns resumen, but routes want mantenedor. `getPreciosCargoData` returns flat array, but routes want object. Fixing these will require either (a) accepting the wrong shape and adapting, or (b) adding wrapper methods — but option (b) is blocked by the frozen source of truth.
4. **`strict_tdd: true`:** sdd-apply will require test-first discipline. But the test infrastructure is broken (no `test/setup.ts`). The orchestrator has explicitly deferred this, so we must write tests that will only run after the deferred fix lands. This is a known accepted risk.
5. **The 51-file `reportes/components/operaciones/` dead-code copy** could confuse a future reader or be accidentally touched. The refactor must not import from it.
6. **The new `services/operations/*` parallel architecture** is half-built. Migrating consumers to use it directly is a big move that bypasses the source of truth; leaving consumers on `operacionesService` requires the source of truth to grow (blocked). **This is the largest architectural risk.**
7. **Hook `useCalculoFacturacionFlow`** is 426 LOC and dead in production. The routes use the slimmer `useCalculoFactura` + `useCalculoProceso` + `useValidacionPrecios` trio. The flow hook should be deleted or kept as a future feature flag.
8. **Bundle size of precios-cargo:** `routes/dashboard/operaciones/precios-cargo.tsx` already uses `lazy()` for the component (line 11). The other routes do not. `cambio-medidor-component.tsx` is 842 LOC and the dialog sub-components are 600+ LOC. None are code-split. The refactor is a chance to add `lazy()`.
9. **React 19 patterns:** the codebase uses `useEffect` heavily. The `useEffect` to derive `filteredData` from `data + searchTerm` in `use-calculo-factura.ts:124-132` could be `useMemo` instead — but the current code also calls `setFilteredData` inside, which is the React antipattern. Risk: the refactor's strict TDD will require us to write tests for this anti-pattern, perpetuating it.

## 6. Open questions for sdd-propose

1. **Where do missing types go?** The source of truth is frozen. Should we add a new `app/types/operaciones/` directory with one file per subdomain (e.g. `periodo.ts`, `ciclo.ts`, `precio.ts`, `prefactura.ts`, `medidor.ts`)? Or inline them as `type` declarations in each consumer file? (Recommended: per-subdomain files in a new subdirectory.)
2. **How to handle the 11 missing service methods?** They could be (a) added to `operacionesService.ts` (blocked — frozen), (b) added to a new sibling service in the same `services/` directory that consumers call instead, (c) bypassed with direct `api` calls. The pre-existing `services/operations/*` directory already implements most of them. **Recommended: consumers call the new `services/operations/*` services directly**, but we need confirmation that adding a sibling service is not considered "modifying the source of truth."
3. **Should the `app/routes/dashboard/reportes/components/operaciones/` dead-code copy be deleted?** It's outside the target directories, but cleaning it up would prevent future drift. **Recommended: out of scope for this refactor; address in a separate change.**
4. **Should we extract shared UI components (`<StatsCard>`, `<FilterForm>`, `<EmptyState>`, etc.) into `app/components/shared/` or `app/components/operaciones/_shared/`?** Note: there's already `app/components/shared/modern-header.tsx` — so the convention is `app/components/shared/`.
5. **For the `getCorteReposicionData` shape mismatch:** should the route be fixed to call a different method (e.g. `getBuscarCorteReposicion`) that the service already has? Or should the component be refactored to use the resumen shape? The data shown in the corte-reposicion UI is clearly a list of mantenedor items, not resumen totals.
6. **For the `getPreciosCargoData` shape mismatch:** similar question. The service returns `PreciosConsultarRequest[]` (one array) but the route destructures `{tablaEnel, tablaAgualova}` (two arrays). The service signature is wrong; consumers should call a different method or the service should be extended.
7. **Is the 842 LOC `cambio-medidor-component.tsx` a candidate for splitting into a wizard / stepper with separate step components?** The state machine (4 steps) is implicit in `currentStep` + step-specific form components.
8. **Should we adopt `useProductTour` as a hook + remove inline driver.js init from 3 components?** This adds 1 hook file but removes 60+ lines of duplicated tour setup.

## 7. Recommended next step

Proceed to **sdd-propose** with the following scope:
- Add missing types as local types in a new `app/types/operaciones/` subdirectory (NOT modifying the source of truth).
- Migrate consumers to use the existing `services/operations/*` services where the legacy `operacionesService` has missing methods.
- Fix shape mismatches by either re-routing to the right method or local adapter helpers in the consumer.
- Extract the duplicated patterns listed in §4.4 (helpers in `utils/operaciones/`, shared UI in `components/shared/`).
- Delete dead code in `use-calculo-facturacion-flow.ts` (debugMode state, unused step 4/5 paths if confirmed dead).
- Fix console statements and `error as any` in toast calls.
- Add 2 new test files (per `strict_tdd`) that don't depend on `test/setup.ts` running (pure function tests in `utils/operaciones/`, `hooks/operaciones/utils/`).

The refactor is large. Given the 400-line review budget and the chained-PR strategy, the proposal should split into at least these slices:
1. **Slice 1:** Add missing types (`app/types/operaciones/*`).
2. **Slice 2:** Fix contract drift in routes (the 6 broken `operacionesService.*` calls).
3. **Slice 3:** Fix contract drift in hooks (the 5 missing methods in `use-calculo-facturacion-flow.ts`).
4. **Slice 4:** Extract shared helpers (`utils/operaciones/*` cleanup, kill duplication).
5. **Slice 5:** Extract shared UI components (or at least the easy ones).
6. **Slice 6:** Dead code removal.

## 8. Out of scope (documented)

- `test/setup.ts` is deferred to a separate change.
- `app/routes/dashboard/reportes/components/operaciones/` (51 dead-code files) is a separate change.
- `app/services/operations/*` is a planned new architecture; this refactor only consumes it where needed, doesn't refactor it.
- `app/types/monitor.ts` and `app/types/reportes.ts` are not in the target directories.
- The 10 backend endpoints that don't exist in the service are documented but not modified (the service is frozen).
