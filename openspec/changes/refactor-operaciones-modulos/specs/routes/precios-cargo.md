# Spec: precios-cargo

> Domain: routes — `app/routes/dashboard/operaciones/precios-cargo.tsx`, `app/components/operaciones/precios-cargo/`.

## Purpose

The `precios-cargo` feature has a service shape mismatch: the route destructures `{tablaEnel, tablaAgualova}` from the result of `operacionesService.getPreciosCargoData(mes, anio)`, but the source-of-truth method returns a flat `PreciosConsultarRequest[]` array (declared at `app/services/operacionesService.ts:210-232`). The component imports 3 phantom types (`PreciosCargoEnel`, `PreciosCargoAgualova`, `DetallepreciosCargoAgualova`) and uses a frontend-invented "Enel / Agualova" split taxonomy that does not exist in the service response. The component is realigned to consume the flat array; the split is removed; the 3 phantom types are dropped.

## MODIFIED Requirements

### Requirement: precios-cargo-route-aligns-destructure

The route file `app/routes/dashboard/operaciones/precios-cargo.tsx` SHALL call `operacionesService.getPreciosCargoData(mes, anio)` (declared at `app/services/operacionesService.ts:210-232`) and SHALL pass `result.data` (the flat array of `PreciosConsultarRequest`) directly to the component. The previous destructure of `{tablaEnel, tablaAgualova}` SHALL be removed (the shape does not exist in the service response).

#### Scenario: route-passes-flat-array

- GIVEN the source-of-truth method `getPreciosCargoData` returning `OperacionesServiceResponse<PreciosConsultarRequest[]>` (`app/services/operacionesService.ts:210-232`)
- AND the source-of-truth type `PreciosConsultarRequest` (`app/types/operaciones.ts:138-146`)
- WHEN this change is merged
- THEN `grep -rE "\\b(tablaEnel|tablaAgualova)\\b" app/routes/dashboard/operaciones/precios-cargo.tsx` returns 0 matches
- AND the component receives `data: PreciosConsultarRequest[]` as a prop (or via context)
- AND `pnpm typecheck` passes

### Requirement: precios-cargo-component-realigns-types

The component and its 8 sub-components SHALL NOT import the phantom types `PreciosCargoEnel`, `PreciosCargoAgualova`, `DetallepreciosCargoAgualova` from `~/types/operaciones`. The replacements SHALL be:

- `PreciosCargoEnel` and `PreciosCargoAgualova` are deleted; the data is a flat `PreciosConsultarRequest[]` array
- `DetallepreciosCargoAgualova` is replaced by an inline `type DetallePrecios = Pick<PreciosConsultarRequest, 'codigoInterno' | 'codigoEnerlova' | 'descripcion' | 'valorActual' | 'valorMesAnterior' | 'confirmacion' | 'indice'>` declared in the consumer file
- `DialogAgregarPreciosProps` (phantom) is replaced by an inline `type DialogAgregarPreciosProps = { ... }` in the consumer file

#### Scenario: phantom-types-replaced

- GIVEN the source-of-truth type `PreciosConsultarRequest` (`app/types/operaciones.ts:138-146`)
- WHEN this change is merged
- THEN `grep -rE "\\b(PreciosCargoEnel|PreciosCargoAgualova|DetallepreciosCargoAgualova|DialogAgregarPreciosProps)\\b" app/components/operaciones/precios-cargo/` returns: (a) 0 matches for `PreciosCargoEnel`/`PreciosCargoAgualova`/`DetallepreciosCargoAgualova`, (b) 0 `import.*DialogAgregarPreciosProps` matches (only inline `type` declarations)
- AND `pnpm typecheck` passes

### Requirement: enel-agualova-split-removed

The frontend-invented "Enel / Agualova" taxonomy SHALL be removed from the UI. The data is rendered as a single table grouped by `codigoInterno` (or another criterion confirmed at design time). The columns-enel.tsx and columns-enerlova.tsx sub-components SHALL be merged into a single `columns.tsx` that consumes `PreciosConsultarRequest`.

#### Scenario: single-table-renders-flat-array

- WHEN this change is merged
- THEN `ls app/components/operaciones/precios-cargo/` shows a single `columns.tsx` (the enel and enerlova variants are merged or deleted)
- AND the table renders the flat array; no `if (row.tipo === 'enel')` or `if (row.tipo === 'agualova')` branching exists
- AND `pnpm typecheck` passes

### Requirement: data-table-precios-virtualized-deletion-or-extraction

The file `app/components/operaciones/precios-cargo/data-table-precios-virtualized.tsx` (294 LOC) SHALL be deleted UNLESS a 2+ site use case emerges after the realignment (per `utils-consolidation.md` rule: shared extraction only when 2+ real sites). Initial estimate after the realignment: 1 site. Therefore the file is deleted.

#### Scenario: virtualized-table-deleted

- WHEN this change is merged
- THEN `app/components/operaciones/precios-cargo/data-table-precios-virtualized.tsx` no longer exists
- AND `grep -r "data-table-precios-virtualized" app/` returns 0 matches

### Requirement: route-thin-wrapper-or-data-passer

The route file SHALL be a thin wrapper that either (a) fetches the data in the route (via a `clientLoader` calling `getPreciosCargoData(mes, anio)`) and passes the array to the component, or (b) is purely a render wrapper and the component fetches on mount. Either pattern is acceptable; the destructure of `{tablaEnel, tablaAgualova}` SHALL be removed in both cases.

#### Scenario: route-passes-correct-shape

- WHEN this change is merged
- THEN the route file is fewer than 40 LOC
- AND no `tablaEnel`/`tablaAgualova` symbol exists in the file
- AND `pnpm typecheck` passes

## Cross-References

- Source-of-truth method: `getPreciosCargoData` (`app/services/operacionesService.ts:210-232`)
- Source-of-truth type: `PreciosConsultarRequest` (`app/types/operaciones.ts:138-146`), `PreciosGuardarMasivoRequest` (`app/types/operaciones.ts:149-154`)
- Phantom types dropped: `PreciosCargoEnel`, `PreciosCargoAgualova`, `DetallepreciosCargoAgualova`, `DialogAgregarPreciosProps`
- Frontend-invented taxonomy: the "Enel / Agualova" split does not exist in the source-of-truth service response

See also: `components-realignment.md` (umbrella rules), `style-and-convention-sweep.md`.
