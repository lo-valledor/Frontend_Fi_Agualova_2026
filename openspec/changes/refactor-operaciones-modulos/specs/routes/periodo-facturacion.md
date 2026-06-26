# Spec: periodo-facturacion

> Domain: routes — `app/routes/dashboard/operaciones/periodo-facturacion.tsx`, `app/components/operaciones/periodo-facturacion/`.

## Purpose

The `periodo-facturacion` feature has 2 phantom type imports (`Anio`, `Periodos`), 1 phantom service call in the route (`operacionesService.getPeriodoFacturacionData()`), 3 direct `api.get/post` calls (`/consulta-periodo`, `/ingresa-periodo`, `/cerrar-periodo`), 3 dialogs (one with a `MONTHS` array duplicate), and 1 dead `cerrar-periodo.tsx` sub-component. The feature is realigned to use the source-of-truth service methods and the 3 dialogs are merged into a single inline dialog using `postCrearPeriodoFacturacion` and `postCerrarPeriodoFacturacion`. The `MONTHS` duplicate is resolved by importing from the canonical `app/utils/operaciones/constants.ts`.

## MODIFIED Requirements

### Requirement: periodo-facturacion-component-realigns-types

The component SHALL NOT import `Anio` or `Periodos` from `~/types/operaciones` (neither exists in the source of truth). The replacements SHALL be:

- `Anio` → `type Anio = Pick<PeriodosAniosDisponiblesResponse, 'anio'>` declared inline in the file
- `Periodos` → `type Periodos = PeriodosBuscarRequest` declared inline in the file (the source-of-truth type is the request shape, not a domain entity; the column definition can use it as-is)

#### Scenario: phantom-types-replaced

- GIVEN the source-of-truth types `PeriodosAniosDisponiblesResponse` (`app/types/operaciones.ts:112-115`) and `PeriodosBuscarRequest` (`app/types/operaciones.ts:118-125`)
- WHEN this change is merged
- THEN `grep -rE "\\b(Anio|Periodos)\\b" app/components/operaciones/periodo-facturacion/` shows: (a) only as the right-hand side of an inline `type` alias declaration, (b) no `import.*Anio|Periodos.*from .*~/types/operaciones` matches
- AND `pnpm typecheck` passes

### Requirement: periodo-facturacion-component-replaces-direct-api-call

The component SHALL NOT call `api.get('/consulta-periodo')` (the endpoint does not exist in the source of truth). The replacement SHALL use `operacionesService.getPeriodoAbierto()` (declared at `app/services/operacionesService.ts:31-46`) which returns the open period. The `Anio` and `Periodos` shape used in the table SHALL be derived from the source-of-truth response.

#### Scenario: phantom-api-call-replaced

- GIVEN the source-of-truth method `getPeriodoAbierto` (`app/services/operacionesService.ts:31-46`) returning `OperacionesServiceResponse<PrepararLecturasFiltrosPeriodosResponse[]>`
- WHEN this change is merged
- THEN `grep "api.get\|api.post" app/components/operaciones/periodo-facturacion/` returns 0 matches
- AND `getPeriodoAbierto` is imported from `~/services/operacionesService`
- AND a colocated test verifies the table data is mapped from the source-of-truth response shape

### Requirement: dialogs-merged-into-one

The 3 dialog sub-components (`dialog-nuevo-periodo.tsx`, `dialog-abrir-periodo.tsx`, `cerrar-periodo.tsx`) SHALL be deleted, and a single inline dialog component SHALL be created within `periodo-facturacion-component.tsx` (or in a new `dialog-periodo.tsx` co-located in the same directory). The merged dialog SHALL call `operacionesService.postCrearPeriodoFacturacion(req)` and `operacionesService.postCerrarPeriodoFacturacion(codigo)` (declared in source of truth) for the two actions. The `MONTHS` array SHALL be imported from `~/utils/operaciones` (per `utils-consolidation.md`), not redefined locally.

#### Scenario: three-dialogs-collapsed

- GIVEN the source-of-truth methods `postCrearPeriodoFacturacion` (`app/services/operacionesService.ts:92-105`) and `postCerrarPeriodoFacturacion` (`app/services/operacionesService.ts:107-126`)
- WHEN this change is merged
- THEN `dialog-nuevo-periodo.tsx`, `dialog-abrir-periodo.tsx`, and `cerrar-periodo.tsx` no longer exist
- AND a single dialog file (either inline or co-located) uses both `postCrearPeriodoFacturacion` and `postCerrarPeriodoFacturacion`
- AND `grep -rE "const MONTHS = " app/components/operaciones/periodo-facturacion/` returns 0 matches
- AND `pnpm typecheck` passes

### Requirement: route-thin-wrapper

The route file `app/routes/dashboard/operaciones/periodo-facturacion.tsx` SHALL be a thin wrapper. The phantom call `operacionesService.getPeriodoFacturacionData()` (the method actually exists at `app/services/operacionesService.ts:48-73` but returns a different shape — the route is not using it correctly) SHALL be removed. The route SHALL NOT define a `clientLoader`. The data is fetched by the component on mount.

#### Scenario: route-has-no-phantom-call

- WHEN this change is merged
- THEN `wc -l app/routes/dashboard/operaciones/periodo-facturacion.tsx` shows fewer than 30 LOC
- AND `grep "clientLoader\|getPeriodoFacturacionData" app/routes/dashboard/operaciones/periodo-facturacion.tsx` returns 0 matches
- AND `pnpm typecheck` passes

## Cross-References

- Source-of-truth methods: `getPeriodoAbierto` (`app/services/operacionesService.ts:31-46`), `postCrearPeriodoFacturacion` (`app/services/operacionesService.ts:92-105`), `postCerrarPeriodoFacturacion` (`app/services/operacionesService.ts:107-126`), `getPeriodoFacturacionData` (`app/services/operacionesService.ts:48-73` — exists but route is misusing the return shape)
- Source-of-truth types: `PeriodosAniosDisponiblesResponse` (`app/types/operaciones.ts:112-115`), `PeriodosBuscarRequest` (`app/types/operaciones.ts:118-125`), `PeriodosCrearRequest` (`app/types/operaciones.ts:128-132`)
- Phantom endpoints: `/consulta-periodo`, `/ingresa-periodo`, `/cerrar-periodo`
- Canonical MONTHS source: `app/utils/operaciones/constants.ts:2` (per `utils-consolidation.md`)

See also: `utils-consolidation.md` (MONTHS canonicalisation), `components-realignment.md`, `style-and-convention-sweep.md`.
