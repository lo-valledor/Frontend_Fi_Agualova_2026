# Spec: anular-factura-impresa

> Domain: routes — `app/routes/dashboard/operaciones/anular-factura-impresa.tsx`, `app/components/operaciones/anular-factura-impresa/`.

## Purpose

The `anular-factura-impresa` feature has a request payload shape drift and no backing service method. The source-of-truth exports only the request type `AnularFacturaEjecutarRequest` (`app/types/operaciones.ts:2-5`); no `operacionesService.anularFactura(...)` method exists. Per the user's strategy, when a feature has no source-of-truth backing, the feature is **deleted**, not extended. This spec records the deletion.

## REMOVED Requirements

### Requirement: anular-factura-component-deletion

The file `app/components/operaciones/anular-factura-impresa/anular-factura-impresa-component.tsx` (284 LOC) SHALL be removed from the repository. The component called `api.post('/anular-factura-impresa', {numeroFolio, alcance})` — neither the endpoint nor the payload shape match the source-of-truth (`{numeroFactura, conTomaLectura}` per `AnularFacturaEjecutarRequest`).

#### Scenario: component-file-deleted

- GIVEN the file `app/components/operaciones/anular-factura-impresa/anular-factura-impresa-component.tsx`
- WHEN this change is merged
- THEN the file no longer exists
- AND `ls app/components/operaciones/anular-factura-impresa/` returns "No such file or directory" (all files in the subdirectory are deleted together)
- AND `grep -r "anular-factura-impresa-component" app/` returns 0 matches

### Requirement: anular-factura-route-replaced-with-placeholder

The route file `app/routes/dashboard/operaciones/anular-factura-impresa.tsx` SHALL be rewritten to render a static "Funcionalidad no disponible" placeholder (or 404 redirect). The placeholder MUST NOT call any service method, MUST NOT define a `clientLoader`, and SHALL use a static component that is the only consumer of the placeholder text. The route file SHALL remain so that the navigation link does not break.

#### Scenario: route-renders-placeholder

- GIVEN the source-of-truth `AnularFacturaEjecutarRequest` type at `app/types/operaciones.ts:2-5`
- AND the absence of any `anularFactura*` method in `app/services/operacionesService.ts`
- WHEN a user navigates to `/dashboard/operaciones/anular-factura-impresa`
- THEN the rendered page SHALL display a "Funcionalidad no disponible" message in Spanish
- AND the route file SHALL NOT import the deleted component
- AND `pnpm typecheck` passes

## Cross-References

- Source-of-truth request type: `app/types/operaciones.ts:2-5` (`AnularFacturaEjecutarRequest = {numeroFactura, conTomaLectura}`)
- Source-of-truth service: `app/services/operacionesService.ts:1-680` — no `anularFactura*` or `anular*` method exists; confirmed by `grep "anular" app/services/operacionesService.ts` returning 0 matches inside method declarations
- Phantom endpoint: `/anular-factura-impresa` was hit by the deleted component; not present in the source-of-truth service

See also: `components-realignment.md` (umbrella for component-level phantom-import rules), `dead-code-purge.md`.
