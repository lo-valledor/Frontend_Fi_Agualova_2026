# Spec: cambio-medidor

> Domain: routes — `app/routes/dashboard/operaciones/cambio-medidor.tsx`, `app/components/operaciones/cambio-medidor/`.

## Purpose

The `cambio-medidor` feature is the largest component in the target set (842 LOC main + 8 sub-components). It calls direct `api.get('/consulta-medidor-antiguo')` and `api.get('/consulta-medidor-nuevo')` endpoints (phantom URLs), imports 5 phantom types from the source-of-truth types file, and uses local prop interfaces that should be derived from the realigned source-of-truth types. The 8 sub-components' prop interfaces are declared inline (no new type files). The main component is a candidate for being split into a step wizard but is kept as a single file in this refactor — the wizard split is a stretch goal noted in §5.1 of the proposal.

## MODIFIED Requirements

### Requirement: cambio-medidor-component-realigns-service-calls

The main component `app/components/operaciones/cambio-medidor/cambio-medidor-component.tsx` SHALL call only source-of-truth service methods. Every `api.get('/...')` call to `consulta-medidor-antiguo` or `consulta-medidor-nuevo` SHALL be replaced by `operacionesService.getBuscarMedidorAntiguo(acometida, numeroSerie)` and `operacionesService.getBuscarMedidorNuevo(serie)` respectively. The mutation `operacionesService.postEjecutarCambioMedidor(req)` SHALL be used for the final submission, with the payload shape conforming to `CambioMedidorEjecutarCambioRequest`.

#### Scenario: phantom-endpoint-calls-replaced

- GIVEN the source-of-truth methods `getBuscarMedidorAntiguo` (`app/services/operacionesService.ts:616-640`), `getBuscarMedidorNuevo` (`app/services/operacionesService.ts:642-659`), and `postEjecutarCambioMedidor` (`app/services/operacionesService.ts:661-677`)
- AND the source-of-truth request type `CambioMedidorEjecutarCambioRequest` (`app/types/operaciones.ts:30-39`)
- WHEN this change is merged
- THEN `grep -rE "api\\.(get|post)\\(['\"]/" app/components/operaciones/cambio-medidor/` returns 0 matches
- AND the file imports `getBuscarMedidorAntiguo`, `getBuscarMedidorNuevo`, `postEjecutarCambioMedidor` from `~/services/operacionesService`
- AND a new colocated `cambio-medidor-component.test.tsx` verifies that submitting the form calls `postEjecutarCambioMedidor` with an object matching `CambioMedidorEjecutarCambioRequest`

### Requirement: phantom-type-imports-replaced

The main component and its 8 sub-components SHALL NOT import any of the 5 phantom types (`ConsultaMedidorAntiguoResponse`, `ConsultaMedidorNuevoResponse`, `DetalleMedidorAntiguo`, `DetalleMedidorNuevo`, `MedidorAntiguo`, `MedidorNuevo`) from `~/types/operaciones`. The replacement SHALL use the source-of-truth types `CambioMedidorBuscarAntiguoRequest` and `CambioMedidorBuscarNuevoRequest` for the data shape, and SHALL declare any remaining component-prop types as inline `type`/`interface` declarations inside the consumer file.

#### Scenario: phantom-type-imports-removed

- GIVEN the source-of-truth types `CambioMedidorBuscarAntiguoRequest` (`app/types/operaciones.ts:8-17`) and `CambioMedidorBuscarNuevoRequest` (`app/types/operaciones.ts:20-27`)
- WHEN this change is merged
- THEN `grep -rE "\\b(ConsultaMedidorAntiguoResponse|ConsultaMedidorNuevoResponse|DetalleMedidorAntiguo|DetalleMedidorNuevo|MedidorAntiguo|MedidorNuevo)\\b" app/components/operaciones/cambio-medidor/` returns 0 matches
- AND the file imports `CambioMedidorBuscarAntiguoRequest` and `CambioMedidorBuscarNuevoRequest` from `~/types/operaciones`
- AND any remaining `type X = { ... }` prop declarations are local to the file
- AND `pnpm typecheck` passes

### Requirement: subcomponent-prop-types-inlined

The 8 sub-components (`antiguo-medidor-form`, `detalle-medidor-antiguo`, `detalle-medidor-nuevo`, `medidor-field`, `medidor-fields-group`, `nuevo-contrato-form`, `nuevo-medidor-form`, `collapsible-header`) SHALL each declare their prop types as `type XProps = { ... }` inline inside their own file. The phantom prop interfaces `AntiguoMedidorFormProps`, `NuevoMedidorFormProps`, `NuevoContratoFormProps`, `DetalleMedidorAntiguoProps`, `DetalleMedidorNuevoProps` SHALL NOT be imported (they were never exported by the source of truth; their use was phantom).

#### Scenario: subcomponent-types-are-local

- WHEN this change is merged
- THEN `grep -rE "\\b(AntiguoMedidorFormProps|NuevoMedidorFormProps|NuevoContratoFormProps|DetalleMedidorAntiguoProps|DetalleMedidorNuevoProps)\\b" app/components/operaciones/cambio-medidor/` returns 0 matches
- AND each sub-component file contains exactly one `type XProps` or `interface XProps` declaration matching its exports
- AND `pnpm typecheck` passes

### Requirement: route-file-renders-component

The route file `app/routes/dashboard/operaciones/cambio-medidor.tsx` SHALL be a thin wrapper that imports the rewritten component, sets breadcrumbs via `BreadcrumbSetter`, and renders. The route SHALL NOT define a `clientLoader` (no upstream data is needed; the component fetches its own data on form submission). The `/* eslint-disable no-empty-pattern */` header is preserved (per `style-and-convention-sweep.md`).

#### Scenario: route-is-thin

- WHEN this change is merged
- THEN `wc -l app/routes/dashboard/operaciones/cambio-medidor.tsx` shows fewer than 30 LOC
- AND `grep "clientLoader\|useLoaderData" app/routes/dashboard/operaciones/cambio-medidor.tsx` returns 0 matches
- AND `pnpm typecheck` passes

## Cross-References

- Source-of-truth methods: `app/services/operacionesService.ts:616-640` (`getBuscarMedidorAntiguo`), `app/services/operacionesService.ts:642-659` (`getBuscarMedidorNuevo`), `app/services/operacionesService.ts:661-677` (`postEjecutarCambioMedidor`)
- Source-of-truth types: `app/types/operaciones.ts:8-17` (`CambioMedidorBuscarAntiguoRequest`), `app/types/operaciones.ts:20-27` (`CambioMedidorBuscarNuevoRequest`), `app/types/operaciones.ts:30-39` (`CambioMedidorEjecutarCambioRequest`)
- Phantom endpoints: `/consulta-medidor-antiguo`, `/consulta-medidor-nuevo` — not present in `app/services/operacionesService.ts`

See also: `components-realignment.md`, `style-and-convention-sweep.md`.
