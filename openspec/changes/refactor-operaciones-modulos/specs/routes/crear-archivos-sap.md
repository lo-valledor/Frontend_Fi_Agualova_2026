# Spec: crear-archivos-sap

> Domain: routes — `app/routes/dashboard/operaciones/crear-archivos-sap.tsx`, `app/components/operaciones/crear-archivos-sap/`.

## Purpose

The `crear-archivos-sap` feature has 2 direct `api.get('/exportar-encabezado')` and `api.get('/exportar-detalle')` calls to phantom endpoints. No service method exists for either, and the source-of-truth types file does not declare any `CrearArchivosSap*` type. Per the user strategy: delete the feature (no source-of-truth backing) and replace the route with a static placeholder.

## REMOVED Requirements

### Requirement: crear-archivos-sap-component-deletion

The file `app/components/operaciones/crear-archivos-sap/crear-archivos-sap-component.tsx` (258 LOC) SHALL be removed. The component calls `api.get('/exportar-encabezado')` and `api.get('/exportar-detalle')` — neither endpoint is in the source-of-truth service. The 2 blob-download handlers in the component are deleted with the component.

#### Scenario: component-file-deleted

- GIVEN the file `app/components/operaciones/crear-archivos-sap/crear-archivos-sap-component.tsx`
- WHEN this change is merged
- THEN the file no longer exists
- AND `ls app/components/operaciones/crear-archivos-sap/` returns "No such file or directory" (the entire subdirectory is deleted)
- AND `grep -r "crear-archivos-sap-component" app/` returns 0 matches

### Requirement: crear-archivos-sap-route-placeholder

The route file `app/routes/dashboard/operaciones/crear-archivos-sap.tsx` SHALL be rewritten to render a static "Funcionalidad no disponible" placeholder. The placeholder MUST NOT call any service method, MUST NOT define a `clientLoader`, and SHALL be a self-contained component.

#### Scenario: route-renders-placeholder

- GIVEN the source-of-truth types and service (`app/types/operaciones.ts:1-250`, `app/services/operacionesService.ts:1-680`) — no `crearArchivosSap*` or `exportar*` method exists
- WHEN a user navigates to `/dashboard/operaciones/crear-archivos-sap`
- THEN the rendered page SHALL display "Funcionalidad no disponible"
- AND the route file SHALL NOT import the deleted component
- AND `pnpm typecheck` passes

## Cross-References

- Source-of-truth: `app/services/operacionesService.ts:1-680` — no `crearArchivosSap*` or `exportar*` method exists; confirmed by `grep -E "(crearArchivos|exportar|archivosSap)" app/services/operacionesService.ts` returning 0 matches
- Source-of-truth types: `app/types/operaciones.ts:1-250` — no `CrearArchivosSap*` type exported
- Phantom endpoints: `/exportar-encabezado`, `/exportar-detalle`

See also: `anular-factura-impresa.md` (same pattern: deleted feature + placeholder route).
