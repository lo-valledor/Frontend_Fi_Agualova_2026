# Design: refactor-operaciones-modulos

> **Slug:** `refactor-operaciones-modulos`
> **Phase:** design
> **Mode:** interactive
> **Artifact store:** openspec
> **Review budget:** 400 LOC per slice
> **Chained PR strategy:** chained-pr (confirmed)
> **Test infra status:** `test/setup.ts` is missing (deferred to separate change). `strict_tdd: true` is set; tests will be authored (RED-GREEN-REFACTOR) but `pnpm test:run` will not execute them until the deferred change restores the setup file. `pnpm typecheck`, `pnpm lint`, and `pnpm build` remain runnable.

---

## 1. Architecture overview

The refactor **preserves the existing module structure** — no top-level rename, no new top-level directory, no new package — but eliminates two parallel architectures and forces every consumer in the four target directories to conform to the FROZEN source of truth (`app/types/operaciones.ts:1-250` and `app/services/operacionesService.ts:1-680`). After the refactor, HTTP access flows through one of two narrow paths:

```
                    ┌──────────────────────────────────────────────────────────────┐
                    │  app/routes/dashboard/operaciones/{subdomain}.tsx             │
                    │   (thin: <BreadcrumbSetter> + <Component />, no clientLoader) │
                    └──────────────────────────┬───────────────────────────────────┘
                                               │ props (or import)
                                               ▼
                    ┌──────────────────────────────────────────────────────────────┐
                    │  app/components/operaciones/{subdomain}/{subdomain}-component│
                    │   .tsx                                                       │
                    │   • composes local sub-components                            │
                    │   • calls useCalculoFactura (the one surviving hook)        │
                    │   • calls inline useState/useMemo/useEffect for the rest     │
                    │   • no api.get / api.post for service-backed endpoints      │
                    └──────────────────────────┬───────────────────────────────────┘
                                               │ call
                                               ▼
                    ┌──────────────────────────────────────────────────────────────┐
                    │  app/hooks/operaciones/use-calculo-factura.ts                │
                    │   • the ONLY remaining operations hook                       │
                    │   • wraps operacionesService.getRevisarCalculosBuscarPrefact │
                    └──────────────────────────┬───────────────────────────────────┘
                                               │ call
                                               ▼
                    ┌──────────────────────────────────────────────────────────────┐
                    │  app/services/operacionesService.ts                           │
                    │   class OperacionesService { ... }                           │
                    │   (FROZEN — no modifications)                                 │
                    └──────────────────────────┬───────────────────────────────────┘
                                               │ fetch
                                               ▼
                    ┌──────────────────────────────────────────────────────────────┐
                    │  app/lib/api.ts (axios instance)                              │
                    └──────────────────────────────────────────────────────────────┘
```

**Removed (the two parallel architectures that this refactor eliminates):**

```
   ┌─────────────────── REMOVED ───────────────────┐
   │ app/services/operations/*  (6 files, ~770 LOC)│  ← half-built parallel service layer
   │   billing-calculation.service.ts               │     (per proposal §3.1)
   │   preparation.service.ts                        │
   │   pricing.service.ts                            │
   │   periodos.service.ts                           │
   │   types.ts, index.ts                            │
   └────────────────────────────────────────────────┘
   ┌─────────────────── REMOVED ───────────────────┐
   │ app/routes/dashboard/reportes/components/      │  ← 51-file dead mirror of
   │   operaciones/** (51 files, ~5,200 LOC)        │     app/components/operaciones/
   └────────────────────────────────────────────────┘
   ┌─────────────────── REMOVED ───────────────────┐
   │ app/hooks/operaciones/use-calculo-facturacion- │  ← 426-LOC dead flow hook
   │   flow.ts                                       │     (per proposal §3.2)
   └────────────────────────────────────────────────┘
   ┌─────────────────── REMOVED ───────────────────┐
   │ app/hooks/operaciones/use-calculo-proceso.ts   │  ← replaced by direct service
   │ app/hooks/operaciones/use-validacion-precios.ts│     calls in the consumer
   │ app/hooks/operaciones/utils/{error-handler,    │     component (per proposal
   │   data-combiner, price-validator}.ts           │     §4.2)
   └────────────────────────────────────────────────┘
```

**Realigned (consumer shape changes; no architectural change):**

- 6 routes lose their `clientLoader`; they become pure render wrappers (`<BreadcrumbSetter>` + component).
- 1 hook survives (`useCalculoFactura`) and is rewritten to use the source-of-truth service.
- ~30 components and sub-components have their phantom type imports and phantom service calls replaced by source-of-truth types and source-of-truth service methods.
- 4 utils are extracted to `app/utils/operaciones/` (new files: `download.ts`, `period.ts`, `error.ts`; moved file: `cycle.ts` from `app/hooks/operaciones/utils/`).
- 1 shared hook is extracted: `useProductTour` to `app/hooks/operaciones/use-product-tour.ts`.

The only file in `app/components/shared/` and `app/types/operaciones/` that this refactor adds is **none** — both stay untouched except the barrel re-export in `app/utils/operaciones/index.ts`.

---

## 2. TypeScript composition rules

The source-of-truth exports **29 types** (per `app/types/operaciones.ts:1-250`). The refactor consumes them WITHOUT adding new types. The composition rules below are normative for every consumer file.

### 2.1 Shape derivations

For any type that needs a subset, an extension, or a transformation of a source-of-truth type, use one of:

| Pattern | When to use | Example |
|---|---|---|
| `Pick<T, K>` | Select 1+ fields from a source-of-truth type | `type Anio = Pick<PeriodosAniosDisponiblesResponse, 'anio'>` (used in `periodo-facturacion-component.tsx`) |
| `Omit<T, K>` | Remove 1+ fields | `Omit<RevisionPreciosBuscarRequest, 'confirmacion'>` (use sparingly) |
| `Required<T>` | Make optional fields required | `Required<PreciosGuardarMasivoRequest>` (use sparingly) |
| `Readonly<T>` | Mark all fields readonly | `Readonly<PreciosConsultarRequest>` (use sparingly) |
| `T[K]` indexed access | Single-field alias | `type Ciclo = PrepararLecturasFiltrosCiclosResponse[number]` |
| Interface extension (`extends`) | Add 1+ fields to a source-of-truth type | `interface CalculoPrefacturaRow extends RevisionPreciosBuscarRequest { total: number; }` (use ONLY when the source-of-truth method is untyped and we need to enrich the row locally) |
| Plain object alias `type X = { ... }` | The source-of-truth method is untyped; the local row type is hand-rolled | `type CalculoPrefacturaRow = { id: number; ... }` (used in `revisar-calculo-factura-component.tsx`) |

### 2.2 Worked examples

**Example 1 — `Pick<>` for a "domain entity" alias (periodo-facturacion).** The component needs `Anio` (a single number). The source-of-truth response is `PeriodosAniosDisponiblesResponse = {idAnio: number; anio: number}`. Derive inline:

```ts
// in periodo-facturacion-component.tsx (after realignment)
import type { PeriodosAniosDisponiblesResponse, PeriodosBuscarRequest } from '~/types/operaciones';
type Anio = Pick<PeriodosAniosDisponiblesResponse, 'anio'>;
type Periodos = PeriodosBuscarRequest;
```

**Example 2 — Indexed access for a "domain entity" alias (cerrar-lecturas, revisar-calculo-factura).** The source-of-truth response is an array of `{id, descripcion}`. Derive the single-record alias:

```ts
// in cerrar-lecturas-component.tsx
import type { CerrarLecturasFiltrosCiclosResponse, CerrarLecturasFiltrosPeriodosResponse } from '~/types/operaciones';
type Ciclo = CerrarLecturasFiltrosCiclosResponse[number];
type PeriodoAbierto = CerrarLecturasFiltrosPeriodosResponse[number];
```

**Example 3 — Hand-rolled `type` for an untyped service response (revisar-calculo-factura).** `operacionesService.getRevisarCalculosBuscarPrefacturas` returns `any` (untyped at the service layer, see `app/services/operacionesService.ts:561-594`). The local row type is a plain object alias:

```ts
// in revisar-calculo-factura-component.tsx (after realignment)
type CalculoPrefacturaRow = {
  id: number;
  contratoId: number;
  rutCliente: string;
  nombreCliente: string;
  sector: string;
  local: string;
  totalCargos: number;
  totalCalculado: number;
  cargos: Array<{ codigoCargo: number; descripcion: string; valor: number; }>;
};
```

This file is the **only** place `CalculoPrefacturaRow` is declared. The corresponding hook `use-calculo-factura.ts` declares the same shape internally and re-exports the type via its return type (`{ data: CalculoPrefacturaRow[]; ... }`).

### 2.3 Union / discriminated union derivations

For union types or discriminated unions, derive from existing source types via:

- `Extract<T, U>` — pick the variants of a union that match.
- `Exclude<T, U>` — remove the variants of a union that match.
- Intersection (`&`) — combine source types.

**Worked example** — narrowing `OperacionesServiceResponse<any>` (used 4× in the source-of-truth service: `postGenerarLecturas`, `postGuardarPreciosCargoMasivo`, `postConfirmarRevisionPrecios`, `getDetalleCorreccionCodigoCargo`):

```ts
// in a consumer file (e.g. preparar-lecturas-component.tsx)
import type { PrepararLecturasBuscarNichosRequest, PrepararLecturasGenerarRequest } from '~/types/operaciones';

type GenerarResult = OperacionesServiceResponse<{ idsGenerados: number[]; errores: string[] }>;

// explicit type guard before use
function isGenerarResult(value: unknown): value is GenerarResult {
  return (
    typeof value === 'object' &&
    value !== null &&
    'data' in value &&
    'error' in value
  );
}
```

The consumer SHALL narrow `any` with an explicit type guard or schema validation before using the data. **The pattern is: define a local typed shape, then `if (isGuard(result)) ...`**. The source-of-truth `OperacionesServiceResponse<T>` envelope (declared at `app/services/operacionesService.ts:21-24`) is the only narrowed shape used.

### 2.4 Function signatures

For function signatures, derive from existing source types; do not introduce new branded types. Example: a click handler in `revisar-calculo-factura-component.tsx`:

```ts
import type { RevisarCalculosLanzarCalculoRequest } from '~/types/operaciones';

const handleLanzarCalculo = async (req: RevisarCalculosLanzarCalculoRequest) => {
  const result = await operacionesService.postRevisarCalculosLanzarCalculo(req);
  // ...
};
```

No branded types, no opaque types, no enums (the codebase uses union of string literals per the source of truth).

### 2.5 Location rules for derived types

| Derivation kind | Location | Example |
|---|---|---|
| Single-file `type X = ...` (component prop, row, helper) | Colocated in the consumer file (non-exported) | `type Anio = Pick<...>` in `periodo-facturacion-component.tsx` |
| Multi-file shared row type for one feature | Colocated in the **one consumer file** that defines the row, re-exported through the hook return type | `type CalculoPrefacturaRow` in `use-calculo-factura.ts`, consumed by `revisar-calculo-factura-component.tsx` |
| Cross-feature shared type | **NO NEW FILES IN `app/types/operaciones/`**. The derivation is inlined in each consumer. | n/a — no such case survives the realignment |

**Hard rule:** No new files under `app/types/operaciones/`. The source-of-truth file is unchanged. No new subdirectory under `app/components/operaciones/_shared/` or `app/components/shared/` purely for this refactor.

### 2.6 Location of new shared utilities

| File | Purpose | Exported symbols |
|---|---|---|
| `app/utils/operaciones/cycle.ts` (moved from `app/hooks/operaciones/utils/cycle-utilities.ts:1`) | Canonical cycle helpers | `convertirCicloParaAPI`, `validarCicloYPeriodo`, `extraerMesYAnio`, `obtenerDiaDelCiclo` |
| `app/utils/operaciones/download.ts` (new) | Blob download pattern | `downloadBlob(blob: Blob, filename: string): void` |
| `app/utils/operaciones/period.ts` (new) | Periodo formatter | `formatPeriodoId(periodoAbierto: PrepararLecturasFiltrosPeriodosResponse[]): string` |
| `app/utils/operaciones/error.ts` (new) | Error message extractor | `extraerMensajeError(error: unknown): string` |
| `app/utils/operaciones/index.ts` (updated) | Barrel re-export | `export * from './constants'; export * from './validations'; export * from './download'; export * from './period'; export * from './cycle'; export * from './error';` |

All four new utility files (and the moved `cycle.ts`) are pure modules — no React imports, no JSX, no test setup dependencies. They are importable from both client components and Node scripts (relevant for the deferred test setup).

### 2.7 Location of new shared hooks

| File | Purpose | Exported symbols |
|---|---|---|
| `app/hooks/operaciones/use-product-tour.ts` (new, conditional) | Driver.js tour init | `useProductTour(steps: TourStep[], options?: { onStart?: () => void }): { startTour: () => void }` |

The hook is co-located in the existing `app/hooks/operaciones/` directory; it lives next to `use-calculo-factura.ts` rather than in `app/hooks/` (root) because the spec scopes it to the operaciones module. (Future changes can promote it if other modules adopt it.)

---

## 3. Service call rules

Four normative rules govern every consumer in the four target directories.

### 3.1 Rule 1 — use the source-of-truth method when one exists

If `operacionesService.ts` exposes a method that covers the consumer's intent, the consumer SHALL use that method. Do not call `api.get`/`api.post` directly.

**Worked example** — `cambio-medidor-component.tsx` (after realignment):

```ts
// BEFORE (phantom direct calls)
const res1 = await api.get(`/consulta-medidor-antiguo?acometida=${acometida}`);
const res2 = await api.get(`/consulta-medidor-nuevo?numeroSerie=${serie}`);

// AFTER (source-of-truth methods)
const res1 = await operacionesService.getBuscarMedidorAntiguo(acometida);
const res2 = await operacionesService.getBuscarMedidorNuevo(serie);
```

### 3.2 Rule 2 — delete the feature when no method exists

If no source-of-truth method covers the consumer's intent, the feature SHALL be removed from the consumer. The route MAY remain as a static "Funcionalidad no disponible" placeholder (per `anular-factura-impresa.md` and `crear-archivos-sap.md`).

**Worked example** — `anular-factura-impresa-component.tsx`: source-of-truth exports only `AnularFacturaEjecutarRequest` (`app/types/operaciones.ts:2-5`); no `operacionesService.anularFactura*` method exists. The component is **deleted**; the route renders a placeholder.

### 3.3 Rule 3 — align to the actual return shape

For return-shape mismatches (e.g. `getCorteReposicionData` returns resumen; route wants mantenedor; `getPreciosCargoData` returns flat array; route wants object), align the consumer to the actual return shape. Do not wrap or transform.

**Worked example** — `precios-cargo.tsx` route (after realignment):

```ts
// BEFORE (shape mismatch — destructures non-existent fields)
const result = await operacionesService.getPreciosCargoData(mes, anio);
const { tablaEnel, tablaAgualova } = result.data; // BUG: data is a flat array

// AFTER (aligned to source-of-truth shape)
const result = await operacionesService.getPreciosCargoData(mes, anio);
const precios: PreciosConsultarRequest[] = result.data ?? [];
```

The component receives the flat array and renders a single table. The "Enel / Agualova" split is removed (no such split exists in the service response).

### 3.4 Rule 4 — narrow `any` returns explicitly

For `OperacionesServiceResponse<any>` returns (`postGenerarLecturas`, `postGuardarPreciosCargoMasivo`, `postConfirmarRevisionPrecios`, `getDetalleCorreccionCodigoCargo`), the consumer SHALL narrow locally with explicit type guards before using the data.

**Worked example 1** — `revisar-precio-component.tsx` (after realignment):

```ts
// The service method is typed as OperacionesServiceResponse<any>
const result = await operacionesService.postConfirmarRevisionPrecios({
  codigosCargos: [1, 2, 3],
  passwordConfirmacion: 'pw',
});

// Local narrowing
const isConfirmarResult = (
  v: unknown
): v is { data: { confirmados: number; errores: string[] } | null; error: string | null } => {
  return (
    typeof v === 'object' &&
    v !== null &&
    'data' in v &&
    'error' in v
  );
};

if (isConfirmarResult(result)) {
  // result is now safely typed
  toast.success(`Confirmados: ${result.data?.confirmados ?? 0}`);
}
```

**Worked example 2** — in a `try/catch`:

```ts
try {
  const result = await operacionesService.postConfirmarRevisionPrecios(req);
  // result is OperacionesServiceResponse<any> — narrow before use
  if (result.error) {
    toast.error(extraerMensajeError(result.error));
    return;
  }
  if (!result.data) {
    toast.error('Respuesta vacía del servidor');
    return;
  }
  // result.data is now confirmed to be the success payload
  toast.success('Confirmación exitosa');
} catch (err) {
  toast.error(extraerMensajeError(err));
}
```

The narrowing pattern uses a local type guard (named `isX` per the TypeScript convention, per the `typescript-advanced-types` skill rule on Type Guards). The `extraerMensajeError` helper is the single error-to-string utility for `toast.error(...)` and for `error` fields in returned objects.

---

## 4. Per-slice implementation approach

Twelve slices. Execution order from lowest risk (deletions) to highest risk (intradirectory dead-code sweep). The numbering is `N.M` where `N` is the major slice (proposal §7) and `M` is the sub-slice index (only slice 6 has sub-slices; others are flat). Each slice is a single chained PR (per the `chained-pr` skill).

### Slice 1 — Dead directory purge

- **Spec references:** `dead-code-purge.md` (`collateral-dead-directory-removal`)
- **Files affected:**
  - **DELETE** `app/services/operations/` (6 files, ~770 LOC): `billing-calculation.service.ts`, `index.ts`, `periodos.service.ts`, `preparation.service.ts`, `pricing.service.ts`, `types.ts`
  - **DELETE** `app/routes/dashboard/reportes/components/operaciones/` (51 files, ~5,200 LOC): 10 subdirectories × ~5 files each
- **Estimated LOC delta:** −5,970 / +0
- **Implementation steps:**
  1. `grep -r "services/operations" app/ | grep -v "explore.md"` returns 0 matches (verify before commit).
  2. `grep -r "dashboard/reportes/components/operaciones" app/ | grep -v "explore.md"` returns 0 matches (verify before commit).
  3. `git rm -r app/services/operations/` + `git rm -r app/routes/dashboard/reportes/components/operaciones/`.
  4. Commit as `chore(operaciones): delete dead directory services/operations and reportes/components/operaciones mirror` (one atomic commit; both deletions are pure negative LOC, but separate concerns).
- **Acceptance check:**
  - `ls app/services/operations/` returns "No such file or directory"
  - `ls app/routes/dashboard/reportes/components/operaciones/` returns "No such file or directory"
  - `pnpm typecheck` passes
- **Cross-slice dependencies:** **None — this slice can land first.**

### Slice 2 — Dead hook + 4 unused utils + 4 unrunnable tests

- **Spec references:** `dead-code-purge.md` (`use-calculo-facturacion-flow-removal`, `dead-hook-test-files-removal`); `hooks-realignment.md` (`utils-error-handler-deletion`, `utils-data-combiner-deletion`, `utils-price-validator-deletion`); `utils-consolidation.md` (`revisar-precio-helpers-deletion`, `confirmation-helpers-deletion`)
- **Files affected:**
  - **DELETE** `app/hooks/operaciones/use-calculo-facturacion-flow.ts` (426 LOC)
  - **DELETE** `app/hooks/operaciones/utils/error-handler.ts` (63 LOC)
  - **DELETE** `app/hooks/operaciones/utils/data-combiner.ts` (42 LOC)
  - **DELETE** `app/hooks/operaciones/utils/price-validator.ts` (54 LOC)
  - **DELETE** `app/utils/operaciones/revisar-precio-helpers.ts` (76 LOC)
  - **DELETE** `app/utils/operaciones/confirmation-helpers.ts` (66 LOC)
  - **DELETE** `app/hooks/operaciones/use-calculo-factura.test.ts` (141 LOC)
  - **DELETE** `app/hooks/operaciones/use-calculo-proceso.test.ts` (163 LOC)
  - **DELETE** `app/hooks/operaciones/use-validacion-precios.test.ts` (168 LOC)
  - **DELETE** `app/components/operaciones/revisar-calculo-factura/revisar-calculo-factura-component.test.tsx` (275 LOC)
- **Estimated LOC delta:** −1,474 / +0
- **Implementation steps:**
  1. Confirm zero consumers for each file:
     - `grep -r "use-calculo-facturacion-flow\|ejecutarFlujoCompleto" app/` returns 0
     - `grep -r "from .*utils/error-handler\|from .*utils/operaciones/error-handler" app/` returns 0 (after Slice 3's `extraerMensajeError` extraction; for Slice 2 we delete `utils/operaciones/revisar-precio-helpers.ts` and `utils/operaciones/confirmation-helpers.ts` whose consumers are updated in Slice 6)
     - `grep -r "isCredentialError\|handleValidationHTTPError\|handleGeneralValidationError\|extraerErrorMessage" app/` returns 0
     - `grep -r "combinarPrefactura\|calcularTotalFacturado\|validarDatosCombinados" app/` returns 0
     - `grep -r "PriceValidationResult\|filtrarPreciosValidos\|contarConfirmados" app/` returns 0
     - `grep -r "processConfirmations\|filterPendingConfirmations" app/` returns 0 (the only consumer is `revisar-precio-component.tsx`, updated in Slice 6e to inline a 1-3 line filter)
  2. **However**, `revisar-precio-component.tsx` (in slice 6e) imports `processConfirmations`/`filterPendingConfirmations` from `~/utils/operaciones/confirmation-helpers`. Therefore the deletion of `confirmation-helpers.ts` MUST land together with the consumer update in Slice 6e. **Sub-slice 2 is split: 2a (the 5 truly dead files) + 2b (combined with 6e).**
  3. For Slice 2a: delete the 5 truly dead files (use-calculo-facturacion-flow, error-handler, data-combiner, price-validator, 4 test files).
  4. For Slice 2b (= part of 6e): delete `confirmation-helpers.ts` and `revisar-precio-helpers.ts` together with the `revisar-precio-component.tsx` update.
- **Acceptance check:**
  - `grep -r "use-calculo-facturacion-flow\|ejecutarFlujoCompleto" app/` returns 0
  - `grep -r "isCredentialError\|handleValidationHTTPError" app/` returns 0
  - `pnpm typecheck` passes
- **Cross-slice dependencies:** Slice 2a is independent (the truly dead files). Slice 2b (= part of 6e) depends on Slice 5 (hooks realigned) so that the rewritten `useCalculoFactura` no longer references the deleted utils.

### Slice 3 — Utils consolidation

- **Spec references:** `utils-consolidation.md` (`download-blob-helper-extraction`, `format-periodo-id-helper-extraction`, `cycle-helper-canonical-move`, `error-message-helper-extraction`, `months-constant-single-source`, `utils-operaciones-index-re_exports`, `formatters-dot-ts-merge-into-index`)
- **Files affected:**
  - **CREATE** `app/utils/operaciones/download.ts` (~30 LOC, exports `downloadBlob`)
  - **CREATE** `app/utils/operaciones/period.ts` (~25 LOC, exports `formatPeriodoId`)
  - **CREATE** `app/utils/operaciones/error.ts` (~25 LOC, exports `extraerMensajeError`)
  - **CREATE** `app/utils/operaciones/cycle.ts` (move from `app/hooks/operaciones/utils/cycle-utilities.ts`, 29 LOC)
  - **CREATE** `app/utils/operaciones/download.test.ts` (~40 LOC, colocated test for `downloadBlob`)
  - **CREATE** `app/utils/operaciones/period.test.ts` (~50 LOC, colocated test for `formatPeriodoId`)
  - **CREATE** `app/utils/operaciones/error.test.ts` (~50 LOC, colocated test for `extraerMensajeError`)
  - **CREATE** `app/utils/operaciones/cycle.test.ts` (~30 LOC, colocated test for `convertirCicloParaAPI`)
  - **MODIFY** `app/utils/operaciones/index.ts` (27 → 50 LOC, add the 4 new re-exports; the cycle helper is now re-exported)
  - **MODIFY** `app/utils/operaciones/formatters.ts` (68 → ~30 LOC, remove `formatPeriodLabel` and the local `MONTHS` map; inline `formatPrice`/`formatNumber`/`formatCycle` consumers will get these from where they are used)
  - **DELETE** `app/hooks/operaciones/utils/cycle-utilities.ts` (29 LOC, moved)
  - **DELETE** `app/utils/operaciones/formatters.ts` (after consumers are updated in Slice 5 + 6)
- **Estimated LOC delta:** +300 / −100 (net +200)
- **Implementation steps:**
  1. Create the 4 new utility files with the exact signatures from `utils-consolidation.md` §2.1-2.4.
  2. Write 4 colocated `.test.ts` files. Each uses `vi.mock` for nothing (pure functions) and `expect(...).toBe(...)`. **Tests will be authored (RED-GREEN-REFACTOR) but `pnpm test:run` will fail to load them until `test/setup.ts` is restored** (per orchestrator preflight). The smoke check for this slice is `pnpm typecheck` and `pnpm lint` — both pass.
  3. Update `app/utils/operaciones/index.ts` to add the 4 new re-exports.
  4. Move `convertirCicloParaAPI` from `app/hooks/operaciones/utils/cycle-utilities.ts` to `app/utils/operaciones/cycle.ts` (the other 3 exports of `cycle-utilities.ts` are also moved; the file becomes empty and is deleted).
  5. Update `formatters.ts` to remove `formatPeriodLabel` (it has the local `MONTHS` map); delete the file once consumers in Slices 5/6 are updated.
  6. The `MONTHS` map inside `formatters.ts:2-15` is removed. `formatPeriodLabel` itself, if still needed, is implemented inline in the single consumer that uses it (the spec says delete + inline; `formatPrice`/`formatNumber`/`formatCycle` are inlined at each consumer, each ~1-3 lines).
- **Acceptance check:**
  - `pnpm typecheck` passes
  - `pnpm lint` passes
  - `pnpm build` passes
  - `grep -r "URL.createObjectURL" app/utils/operaciones/` returns 1 match (the `downloadBlob` implementation)
  - `grep -r "from .*utils/operaciones/(download|period|cycle|error|constants|validations)" app/` returns 0 matches (everything is imported from the barrel `~/utils/operaciones`)
- **Cross-slice dependencies:** Slice 3 has no upstream dependencies (it just creates the new files). Downstream slices (4, 5, 6) import the new helpers from the barrel.

### Slice 4 — Routes realignment

- **Spec references:** all 10 `routes/*.md` spec files (the `*-route-thin` / `*-route-thin-wrapper` requirements); `components-realignment.md`; `style-and-convention-sweep.md` (`react-default-import-removed`, `no-empty-pattern-eslint-disable-preserved`)
- **Files affected (10 routes, all in `app/routes/dashboard/operaciones/`):**
  - `anular-factura-impresa.tsx` — **KEEP-MODIFY**: replace component import with static "Funcionalidad no disponible" placeholder; remove `clientLoader` (does not exist today, but remove the `import React from "react"` and the `import AnularFacturaImpresaComponent`)
  - `cambio-medidor.tsx` — **KEEP-MODIFY**: remove `clientLoader`; remove `import React`; keep the component import
  - `cerrar-lecturas.tsx` — **KEEP-MODIFY**: remove `clientLoader` + the phantom `getCerrarLecturasData()` call; remove `import React`
  - `corte-reposicion.tsx` — **KEEP-MODIFY**: remove `clientLoader` + the `getCorteReposicionData()` route call; remove `import React`
  - `crear-archivos-sap.tsx` — **KEEP-MODIFY**: replace component import with placeholder; remove `import React`
  - `periodo-facturacion.tsx` — **KEEP-MODIFY**: remove `clientLoader` + the `getPeriodoFacturacionData()` route call; remove `import React`; component fetches on mount
  - `precios-cargo.tsx` — **KEEP-MODIFY**: keep `clientLoader` (now correctly destructures `result.data` as `PreciosConsultarRequest[]`); fix the `{tablaEnel, tablaAgualova}` destructure; remove `import React`
  - `preparar-lecturas.tsx` — **KEEP-MODIFY**: remove `clientLoader` + the `getAsignacionSectores()` phantom call; remove `import React`
  - `revisar-calculo-factura.tsx` — **KEEP-MODIFY**: remove `clientLoader` + the `verificarEstadoCierreLecturas()` phantom call; remove `import React`
  - `revisar-precio.tsx` — **KEEP-MODIFY**: remove `clientLoader` + the 2 phantom calls (`getRevisarPrecioData`, `getPreciosPorCiclo`); remove `import React`
- **Estimated LOC delta:** −200 / +0
- **Implementation steps:**
  1. For each of the 10 route files: remove `import React from "react"`, remove the `clientLoader` (if present), remove the `useLoaderData`/`loaderData` usage, fix the destructure (only `precios-cargo.tsx` needs a non-trivial destructure change).
  2. For `anular-factura-impresa.tsx` and `crear-archivos-sap.tsx`: replace the component import with a local placeholder that renders "Funcionalidad no disponible" (the placeholder is defined inline in each route file; no shared component — single-use).
  3. Run `pnpm typecheck` after each file to catch any consumer-side issue.
- **Acceptance check:**
  - `grep -r "clientLoader\|useLoaderData" app/routes/dashboard/operaciones/` returns 0 matches
  - `grep -r "import React from .react." app/routes/dashboard/operaciones/` returns 0 matches
  - `pnpm typecheck` passes (the build still produces output; the components continue to work)
  - `pnpm build` passes
- **Cross-slice dependencies:** Slice 1 must be merged first (the reportes copy must not exist before we trust the route's imports). Slice 4 itself is independent of Slice 5/6, but the consumer components may not yet be realigned (e.g. `periodo-facturacion.tsx` route is realigned, but the component still has the phantom `api.get('/consulta-periodo')` — that gets fixed in Slice 6d).

### Slice 5 — Hooks realignment

- **Spec references:** `hooks-realignment.md` (`use-calculo-factura-rewrite`, `use-calculo-proceso-removal`, `use-validacion-precios-removal`); `utils-consolidation.md` (for `extraerMensajeError` usage)
- **Files affected:**
  - **KEEP-MODIFY** `app/hooks/operaciones/use-calculo-factura.ts` (144 → ~80 LOC, rewrite to call `operacionesService.getRevisarCalculosBuscarPrefacturas`)
  - **KEEP-MODIFY** `app/hooks/operaciones/use-calculo-factura.test.ts` (re-create, ~80 LOC, colocated test; the old file was deleted in Slice 2a)
  - **DELETE** `app/hooks/operaciones/use-calculo-proceso.ts` (115 LOC) — but in the SAME PR, update `revisar-calculo-factura-component.tsx` to call `operacionesService.postRevisarCalculosLanzarCalculo` + `postRevisarCalculosAceptar` directly. The 2 hooks are deleted only when the consumer is realigned.
  - **DELETE** `app/hooks/operaciones/use-validacion-precios.ts` (113 LOC) — same pattern; the consumer (`revisar-calculo-factura-component.tsx`) is updated in the same PR to call `operacionesService.gerRevisarPreciosData` and derive totals inline.
- **Estimated LOC delta:** −290 / +60 (net −230)
- **Implementation steps:**
  1. **Rewrite `use-calculo-factura.ts`:**
     - Replace the 2 `api.get` calls with a single `operacionesService.getRevisarCalculosBuscarPrefacturas(cicloId, periodoId)` call.
     - Drop the `CalculoPrefacturaCompleto`/`Detalle`/`CargoResponse` phantom type imports; declare `type CalculoPrefacturaRow = { ... }` inline in the file.
     - Replace the magic sentinel `'NO_LECTURAS_CERRADAS'` with a separate `estadoCierre: 'cerrado' | 'no-cerrado' | 'cargando'` field.
     - Replace the `useEffect`+`setFilteredData` anti-pattern with a `useMemo` derivation of `filteredData` from `data + searchTerm`.
     - Use `extraerMensajeError` (from the new `~/utils/operaciones`) for the `error` field.
     - Return `{ data, filteredData, isLoading, error, estadoCierre, searchTerm, setSearchTerm, refetch }`.
  2. **Re-create the colocated test** with 3 scenarios: success, 404 → `estadoCierre === 'no-cerrado'`, other error → non-empty error string.
  3. **Delete `use-calculo-proceso.ts` + `use-validacion-precios.ts`** in the SAME PR that updates `revisar-calculo-factura-component.tsx`. The component is realigned to call service methods directly.
  4. The 2 deleted hook files leave no orphan imports (their only consumer is `revisar-calculo-factura-component.tsx`, updated in this slice).
- **Acceptance check:**
  - `grep -r "useCalculoProceso\|useValidacionPrecios\|CalculoPrefacturaCompleto\|CalculoPrefacturaDetalle\|CalculoPrefacturaCargoResponse" app/` returns 0 matches
  - `grep -r "NO_LECTURAS_CERRADAS" app/` returns 0 matches
  - `pnpm typecheck` passes
  - The rewritten `use-calculo-factura.ts` exports `CalculoPrefacturaRow` (or returns it via the hook's return type)
- **Cross-slice dependencies:** Slice 5 depends on Slice 3 (the rewritten hook uses `extraerMensajeError` from the new `~/utils/operaciones`).

### Slice 6 — Components realignment (5 sub-slices)

The 5 sub-slices each cover one or two subdomains. Each sub-slice is ≤400 LOC of net change and updates the route file (when needed) to keep CI green.

#### Slice 6a — anular-factura + cambio-medidor + crear-archivos-sap

- **Spec references:** `routes/anular-factura-impresa.md`, `routes/cambio-medidor.md`, `routes/crear-archivos-sap.md`
- **Files affected:**
  - **DELETE** `app/components/operaciones/anular-factura-impresa/` (entire directory, 1 file, 284 LOC)
  - **KEEP-MODIFY** `app/routes/dashboard/operaciones/anular-factura-impresa.tsx` (placeholder, ~30 LOC, per Slice 4)
  - **DELETE** `app/components/operaciones/crear-archivos-sap/` (entire directory, 1 file, 258 LOC)
  - **KEEP-MODIFY** `app/routes/dashboard/operaciones/crear-archivos-sap.tsx` (placeholder, per Slice 4)
  - **KEEP-MODIFY** `app/components/operaciones/cambio-medidor/cambio-medidor-component.tsx` (842 → ~700 LOC; replace 5 phantom type imports with `CambioMedidorBuscarAntiguoRequest` + `CambioMedidorBuscarNuevoRequest`; replace 2 phantom `api.get` calls with service methods; use `operacionesService.postEjecutarCambioMedidor(req)` for the final submission; inline the sub-component prop types)
  - **KEEP-MODIFY** (8 sub-components of cambio-medidor): `antiguo-medidor-form.tsx`, `detalle-medidor-antiguo.tsx`, `detalle-medidor-nuevo.tsx`, `medidor-field.tsx`, `medidor-fields-group.tsx`, `nuevo-contrato-form.tsx`, `nuevo-medidor-form.tsx`, `collapsible-header.tsx` — each declares its prop type inline as `type XProps = { ... }` and removes phantom imports
  - **CREATE** `app/components/operaciones/cambio-medidor/cambio-medidor-component.test.tsx` (new colocated test, ~80 LOC, verifies the form submission calls `postEjecutarCambioMedidor` with a `CambioMedidorEjecutarCambioRequest` payload)
- **Estimated LOC delta:** −200 / +100 (net −100)
- **Implementation steps:**
  1. Delete the 2 subdirectories (anular-factura-impresa, crear-archivos-sap) and verify zero consumers (`grep` for the import paths).
  2. Rewrite the 2 placeholders (per Slice 4 above).
  3. Update `cambio-medidor-component.tsx` (842 → ~700 LOC): drop phantom types, replace direct `api.get` with `operacionesService.getBuscarMedidorAntiguo` / `getBuscarMedidorNuevo`, use `operacionesService.postEjecutarCambioMedidor`.
  4. Update each of the 8 sub-components: inline the prop type as `type XProps = { ... }`.
  5. Create the colocated test (will be unrunnable until `test/setup.ts` is restored).
- **Acceptance check:**
  - `grep -rE "ConsultaMedidorAntiguoResponse|MedidorAntiguo|MedidorNuevo" app/` returns 0 matches
  - `grep -rE "api\\.(get|post)\\(['\"]/" app/components/operaciones/cambio-medidor/` returns 0 matches
  - `pnpm typecheck` passes
- **Cross-slice dependencies:** Slice 6a is independent of Slices 6b/6c/6d/6e (no shared files), but it must land AFTER Slice 4 (the route file is updated first).

#### Slice 6b — cerrar-lecturas

- **Spec references:** `routes/cerrar-lecturas.md`
- **Files affected:**
  - **KEEP-MODIFY** `app/components/operaciones/cerrar-lecturas/cerrar-lecturas-component.tsx` (763 → ~500 LOC)
  - **KEEP-MODIFY** `app/components/operaciones/cerrar-lecturas/columns.tsx` (266 → ~200 LOC; replace `EstadoCierreLecturas` with inline type)
  - **KEEP-MODIFY** `app/components/operaciones/cerrar-lecturas/dialog-informacion.tsx` (161 → ~161 LOC, minor cleanup)
  - **DELETE** `app/components/operaciones/cerrar-lecturas/alert-cerrar-lecturas.tsx` (239 LOC)
  - **DELETE** `app/components/operaciones/cerrar-lecturas/data-table-virtualized.tsx` (179 LOC)
- **Estimated LOC delta:** −700 / +50 (net −650) — but spread across multiple files; per-file delta is small
- **Implementation steps:**
  1. Update `cerrar-lecturas-component.tsx` to: drop phantom types `Ciclo`/`PeriodoAbierto`/`EstadoCierreLecturas`; declare inline aliases; remove the local `obtenerCicloParaAPI`; use `convertirCicloParaAPI` from `~/utils/operaciones`; remove the 2 phantom `api.get`/`api.post` calls; use `operacionesService.getCerrarLecturasFiltrosCiclos` + `getCerrarLecturasFiltrosPeriodos` for filters; render the close action as a disabled button with a "Funcionalidad no disponible" tooltip.
  2. Update `columns.tsx` to use the inline `EstadoCierreLecturas = { ... }` declared in the consumer file (or imported from the component file if exported).
  3. Delete `alert-cerrar-lecturas.tsx` and `data-table-virtualized.tsx`.
  4. Update `dialog-informacion.tsx` to drop the `CerrarLecturasCerrar` request type import (no method exists); the dialog is informational only.
- **Acceptance check:**
  - `grep -rE "(Ciclo|PeriodoAbierto|EstadoCierreLecturas|obtenerCicloParaAPI)" app/components/operaciones/cerrar-lecturas/` shows only the inline alias declarations
  - `grep -rE "api\\.(get|post)\\(['\"]/(estado-cierre-lecturas|cerrar-lecturas-nicho)" app/components/operaciones/cerrar-lecturas/` returns 0 matches
  - `pnpm typecheck` passes
- **Cross-slice dependencies:** Slice 6b depends on Slice 3 (the new `extraerMensajeError` and `convertirCicloParaAPI` helpers).

#### Slice 6c — corte-reposicion

- **Spec references:** `routes/corte-reposicion.md`; `utils-consolidation.md` (for `downloadBlob`)
- **Files affected:**
  - **KEEP-MODIFY** `app/components/operaciones/corte-reposicion/corte-reposicion-component.tsx` (662 → ~400 LOC)
  - **KEEP-MODIFY** `app/components/operaciones/corte-reposicion/consultar-acometida-dialog.tsx` (600 → ~500 LOC; use `downloadBlob` helper)
  - **KEEP-MODIFY** `app/components/operaciones/corte-reposicion/corte-registrado-dialog.tsx` (minor)
  - **KEEP-MODIFY** `app/components/operaciones/corte-reposicion/reposicion-solicitada-dialog.tsx` (minor)
  - **DELETE** `app/components/operaciones/corte-reposicion/columns.tsx` (260 LOC; data shape is the source-of-truth `CorteReposicionBuscarRequest[]`)
  - **CREATE** `app/components/operaciones/corte-reposicion/corte-reposicion-component.test.tsx` (new colocated test, ~80 LOC, verifies lifecycle buttons call the source-of-truth service methods)
- **Estimated LOC delta:** −500 / +100 (net −400)
- **Implementation steps:**
  1. Update `corte-reposicion-component.tsx` to: drop `ConsultarMantenedorRevisionCorte` phantom type; use `CorteReposicionResumenResponse` for the stats card; use `CorteReposicionBuscarRequest[]` for the list (sourced from `operacionesService.getBuscarCorteReposicion`); remove the 8 phantom direct calls; keep the 6 service-backed dialog actions (`postLiberarAcometida`, `postRegistrarCorte`, `postSolicitarReposicion`, `postIniciarProcesoCorteReposicion`, `postFinalizarProcesoCorteReposicion`, `postActualizarProcesoCorteReposicion`); use `downloadBlob` for the 3 blob handlers.
  2. Update `consultar-acometida-dialog.tsx` to use `downloadBlob` for its 1 blob handler.
  3. Delete `columns.tsx` (the columns are re-defined inline in the rewritten component if needed).
  4. Create the colocated test.
  5. Document the 4 lost features (modificar/ingresar/eliminar revision + exportar) in the PR description and in a comment in the component.
- **Acceptance check:**
  - `grep -rE "ConsultarMantenedorRevisionCorte" app/` returns 0 matches
  - `grep -rE "api\\.(get|post)\\(['\"]" app/components/operaciones/corte-reposicion/` returns 0 matches
  - `grep -rE "URL.createObjectURL" app/components/operaciones/corte-reposicion/` returns 0 matches
  - `pnpm typecheck` passes
- **Cross-slice dependencies:** Slice 6c depends on Slice 3 (for `downloadBlob`).

#### Slice 6d — periodo-facturacion + preparar-lecturas

- **Spec references:** `routes/periodo-facturacion.md`, `routes/preparar-lecturas.md`; `utils-consolidation.md` (for `convertirCicloParaAPI` and `MONTHS`)
- **Files affected:**
  - **KEEP-MODIFY** `app/components/operaciones/periodo-facturacion/periodo-facturacion-component.tsx` (265 → ~200 LOC)
  - **KEEP-MODIFY** `app/components/operaciones/periodo-facturacion/columns.tsx` (175 → ~150 LOC)
  - **DELETE** `app/components/operaciones/periodo-facturacion/dialog-nuevo-periodo.tsx` (192 LOC)
  - **DELETE** `app/components/operaciones/periodo-facturacion/dialog-abrir-periodo.tsx` (185 LOC)
  - **DELETE** `app/components/operaciones/periodo-facturacion/cerrar-periodo.tsx` (138 LOC)
  - **CREATE** `app/components/operaciones/periodo-facturacion/dialog-periodo.tsx` (~150 LOC; single dialog using `operacionesService.postCrearPeriodoFacturacion` + `postCerrarPeriodoFacturacion`; `MONTHS` imported from `~/utils/operaciones`)
  - **KEEP-MODIFY** `app/components/operaciones/preparar-lecturas/preparar-lecturas-component.tsx` (458 → ~250 LOC)
  - **DELETE** `app/components/operaciones/preparar-lecturas/tabla-asignacion-sectores.tsx` (542 LOC)
  - **DELETE** `app/components/operaciones/preparar-lecturas/tabla-lecturas-pendientes.tsx` (175 LOC)
- **Estimated LOC delta:** −1,000 / +150 (net −850)
- **Implementation steps:**
  1. Update `periodo-facturacion-component.tsx` to: drop phantom `Anio`/`Periodos` types; replace `api.get('/consulta-periodo')` with `operacionesService.getPeriodoAbierto()`; use the new `dialog-periodo.tsx` (single dialog).
  2. Update `columns.tsx` to use the inline `Anio`/`Periodos` aliases.
  3. Delete the 3 old dialogs (`dialog-nuevo-periodo`, `dialog-abrir-periodo`, `cerrar-periodo`).
  4. Create the merged `dialog-periodo.tsx` with `postCrearPeriodoFacturacion` + `postCerrarPeriodoFacturacion`.
  5. Update `preparar-lecturas-component.tsx` to: drop phantom types; use `operacionesService.getPrepararLecturasData` + `getBuscarNichos` + `postGenerarLecturas`; use `convertirCicloParaAPI` from `~/utils/operaciones`.
  6. Delete the 2 dead sub-components (`tabla-asignacion-sectores`, `tabla-lecturas-pendientes`).
- **Acceptance check:**
  - `grep -rE "(Anio|Periodos)" app/components/operaciones/periodo-facturacion/` shows only inline alias declarations
  - `grep -rE "api\\.(get|post)\\(['\"]" app/components/operaciones/periodo-facturacion/` returns 0 matches
  - `grep -rE "ConsultarAsignacionSectores|ConsultarSectores|ValidarSectoresPendientes" app/` returns 0 matches
  - `grep -rE "const MONTHS = " app/components/operaciones/periodo-facturacion/` returns 0 matches
  - `pnpm typecheck` passes
- **Cross-slice dependencies:** Slice 6d depends on Slice 3 (for `convertirCicloParaAPI` and `MONTHS`).

#### Slice 6e — precios-cargo + revisar-calculo-factura + revisar-precio

- **Spec references:** `routes/precios-cargo.md`, `routes/revisar-calculo-factura.md`, `routes/revisar-precio.md`; `hooks-realignment.md`; `utils-consolidation.md`; `style-and-convention-sweep.md` (`hook-error-sentinel-replaced`)
- **Files affected (the largest sub-slice):**
  - **KEEP-MODIFY** `app/components/operaciones/precios-cargo/precios-cargo-component.tsx` (567 → ~400 LOC)
  - **KEEP-MODIFY** `app/components/operaciones/precios-cargo/dialog-agregar-precios.tsx` (declarar `DialogAgregarPreciosProps` inline)
  - **KEEP-MODIFY** `app/components/operaciones/precios-cargo/dialog-nuevo-valor-enerlova.tsx` (minor)
  - **KEEP-MODIFY** `app/components/operaciones/precios-cargo/detalle-precios-enerlova.tsx` (declarar `DetallePrecios` inline via `Pick<PreciosConsultarRequest, ...>`)
  - **KEEP-MODIFY** `app/components/operaciones/precios-cargo/data-table-precios.tsx` (remove Enel/Agualova split)
  - **DELETE** `app/components/operaciones/precios-cargo/data-table-precios-virtualized.tsx` (294 LOC)
  - **DELETE** `app/components/operaciones/precios-cargo/columns-enel.tsx` (218 LOC; merged into `columns-enerlova.tsx`)
  - **KEEP-MODIFY** `app/components/operaciones/precios-cargo/columns-enerlova.tsx` (rename to `columns.tsx`; consumes flat `PreciosConsultarRequest[]`)
  - **KEEP-MODIFY** `app/components/operaciones/revisar-calculo-factura/revisar-calculo-factura-component.tsx` (810 → ~500 LOC; drop 2 hook imports, call service methods directly, declare `CalculoPrefacturaRow` inline)
  - **KEEP-MODIFY** `app/components/operaciones/revisar-calculo-factura/columnsPrecalculo.tsx` (use inline `CalculoPrefacturaRow`)
  - **KEEP-MODIFY** `app/components/operaciones/revisar-calculo-factura/data-table.tsx` (use inline `CalculoPrefacturaRow`)
  - **KEEP-MODIFY** `app/components/operaciones/revisar-calculo-factura/hierarchical-data-table.tsx` (use inline `CalculoPrefacturaRow` and `CalculoPrefacturaCargo`)
  - **DELETE** `app/components/operaciones/revisar-calculo-factura/hierarchical-data-table-virtualized.tsx` (380 LOC; the spec's verdict is `keep-inline` because 1 site only)
  - **KEEP-MODIFY** `app/components/operaciones/revisar-precio/revisar-precio-component.tsx` (574 → ~400 LOC; drop phantom types; use `gerRevisarPreciosData`; derive totals via `useMemo`)
  - **KEEP-MODIFY** `app/components/operaciones/revisar-precio/dialog-modificar-precio.tsx` (318 → ~250 LOC; replace `{indice, valor, motivo, usuario}` payload with `RevisionPreciosCorregirRequest`; call `operacionesService.postCorregirPrecioCargo`)
  - **KEEP-MODIFY** `app/components/operaciones/revisar-precio/data-table.tsx` (minor; remove Enel/Agualova split)
  - **KEEP-MODIFY** `app/components/operaciones/revisar-precio/columns-enel.tsx` + `columns-agualova.tsx` (merged into a single `columns.tsx`; uses inline `RevisionPreciosBuscarRequest[]` or `CalculoPrefacturaRow[]`)
  - **DELETE** `app/components/operaciones/revisar-precio/data-table-virtualized.tsx` (222 LOC)
  - **DELETE** `app/components/operaciones/revisar-precio/tabla-valores-enel.tsx` (deleted per `routes/revisar-precio.md`)
  - **DELETE** `app/components/operaciones/revisar-precio/tabla-valores-enerlova.tsx` (deleted per `routes/revisar-precio.md`)
  - **DELETE** `app/utils/operaciones/revisar-precio-helpers.ts` (76 LOC) — combined with the consumer update
  - **DELETE** `app/utils/operaciones/confirmation-helpers.ts` (66 LOC) — combined with the consumer update
  - **CREATE** `app/components/operaciones/revisar-calculo-factura/revisar-calculo-factura-component.test.tsx` (~80 LOC; new colocated test)
  - **CREATE** `app/components/operaciones/revisar-precio/dialog-modificar-precio.test.tsx` (~80 LOC; new colocated test, asserts the new payload shape)
- **Estimated LOC delta:** −1,200 / +250 (net −950) — but the file delta is large; each file is small
- **Implementation steps:**
  1. Update `revisar-calculo-factura-component.tsx` to: remove `useCalculoProceso` + `useValidacionPrecios` imports; call `operacionesService.postRevisarCalculosLanzarCalculo` + `postRevisarCalculosAceptar` + `gerRevisarPreciosData` directly in event handlers; derive totals via `useMemo`; declare `CalculoPrefacturaRow` inline.
  2. Update `columnsPrecalculo.tsx`, `data-table.tsx`, `hierarchical-data-table.tsx` to use the inline `CalculoPrefacturaRow`.
  3. Delete `hierarchical-data-table-virtualized.tsx` (no 2+ site use case per spec verdict).
  4. Create the new colocated test for the component.
  5. Update `revisar-precio-component.tsx` to: drop phantom types (`Ciclo`, `PeriodoAbierto`, `RevisarPrecioUno`, `RevisarPrecioDos`); use `gerRevisarPreciosData(mes, anio)`; derive totals via `useMemo`; inline the small confirmation filter (was in `confirmation-helpers.ts`).
  6. Update `dialog-modificar-precio.tsx` to call `operacionesService.postCorregirPrecioCargo({codigoCargo, nuevoValor, motivo, passwordConfirmacion})`.
  7. Merge `columns-enel.tsx` + `columns-agualova.tsx` into a single `columns.tsx`; delete the originals.
  8. Delete `data-table-virtualized.tsx`, `tabla-valores-enel.tsx`, `tabla-valores-enerlova.tsx`.
  9. Create the new colocated test for `dialog-modificar-precio`.
  10. Delete `revisar-precio-helpers.ts` and `confirmation-helpers.ts` (the only consumers are updated in steps 5-6).
  11. Update `precios-cargo-component.tsx` to: remove the Enel/Agualova split; use flat `PreciosConsultarRequest[]`; use `Pick<>`-derived `DetallePrecios` inline.
  12. Delete `data-table-precios-virtualized.tsx` and `columns-enel.tsx`; merge into the renamed `columns.tsx` (was `columns-enerlova.tsx`).
- **Acceptance check:**
  - `grep -rE "PreciosCargoEnel|PreciosCargoAgualova|DetallepreciosCargoAgualova" app/` returns 0 matches
  - `grep -rE "(RevisarPrecioUno|RevisarPrecioDos|TablaValoresEnelProps|TablaValoresAgualovaProps)" app/` returns 0 matches
  - `grep -rE "(CalculoPrefacturaCompleto|CalculoPrefacturaDetalle|CalculoPrefacturaCargo|CalculoPrefacturaCargoResponse)" app/` returns 0 matches
  - `grep -rE "indice.*valor.*motivo.*usuario" app/components/operaciones/revisar-precio/` returns 0 matches
  - `grep -rE "isCredentialError|handleValidationHTTPError|processConfirmations|filterPendingConfirmations" app/` returns 0 matches
  - `pnpm typecheck` passes
- **Cross-slice dependencies:** Slice 6e depends on Slices 3 (for `extraerMensajeError`) and 5 (for the rewritten `useCalculoFactura`).

### Slice 7 — Style/convention sweep

- **Spec references:** `style-and-convention-sweep.md`
- **Files affected (10-15 files, small line-level changes):**
  - Remove `console.log/info/debug/warn` from all 10 files that have them.
  - Replace `toast.error(error as any)` with `toast.error(extraerMensajeError(error))` in all 10 sites.
  - Remove `import React from "react"` from all 10+ files.
  - Remove hardcoded `api.get/post` URL paths in the 6-8 allowed surviving sites (none should remain after Slice 6, but verify).
  - Verify the `/* eslint-disable no-empty-pattern */` header is preserved on all 10 route files.
- **Estimated LOC delta:** −100 / +0
- **Implementation steps:**
  1. `grep -rE "console\\.(log|info|debug|warn)\\b" app/{hooks,utils,components,routes/dashboard}/operaciones/` returns 0 matches.
  2. `grep -rE "toast\\.error\\([^)]*\\bas\\s+any\\b" app/{hooks,utils,components,routes/dashboard}/operaciones/` returns 0 matches.
  3. `grep -rE "^import React from ['\"]react['\"]" app/{hooks,utils,components,routes/dashboard}/operaciones/` returns 0 matches.
  4. `head -1 app/routes/dashboard/operaciones/*.tsx` shows the eslint-disable comment in every route file.
- **Acceptance check:**
  - `pnpm lint` passes
  - `pnpm format:check` passes
  - `pnpm typecheck` passes
- **Cross-slice dependencies:** Slice 7 depends on Slices 1-6 (all realignments are done; this is the cosmetic pass).

### Slice 8 — Intra-directory dead-code sweep

- **Spec references:** all 15 spec files (the `*-deletion` and `*-removed` requirements)
- **Files affected (mechanical cleanup):**
  - Audit each surviving component subdirectory for unused exports/imports; delete.
  - Audit `app/hooks/operaciones/` for any leftover files (e.g. the `REFACTORING_SUMMARY.md` file); delete.
  - Audit `app/utils/operaciones/index.ts` re-exports for completeness.
  - Audit `app/hooks/operaciones/utils/cycle-utilities.ts` — if empty after the move in Slice 3, delete.
- **Estimated LOC delta:** −200 / +0
- **Implementation steps:**
  1. Run `tsc --noEmit` (or `pnpm typecheck`) to find unused imports.
  2. Remove unused imports across the surviving files.
  3. Delete any file that has no remaining consumers.
  4. Verify with `pnpm typecheck` and `pnpm build`.
- **Acceptance check:**
  - `pnpm typecheck` passes (no broken imports)
  - `pnpm build` passes
  - `pnpm lint` passes
- **Cross-slice dependencies:** Slice 8 depends on Slice 7 (style sweep first, then dead-code sweep).

---

## 5. File-by-file change inventory

Authoritative list. Every file in the four target directories plus the two deletion targets is listed with one of `DELETE` | `KEEP-MODIFY` | `KEEP-AS-IS`. For `KEEP-MODIFY`, a one-line summary of the change is given.

### 5.1 `app/hooks/operaciones/` (8 files)

| File | Action | Change |
|---|---|---|
| `use-calculo-factura.ts` | KEEP-MODIFY | Rewrite per `hooks-realignment.md`: call `operacionesService.getRevisarCalculosBuscarPrefacturas`; drop phantom types; use `useMemo` for `filteredData`; `estadoCierre` field instead of magic sentinel; `extraerMensajeError` for errors |
| `use-calculo-factura.test.ts` | KEEP-MODIFY | Re-create the test (the original was deleted in Slice 2a); 3 scenarios |
| `use-calculo-facturacion-flow.ts` | DELETE | 426-LOC dead flow hook |
| `use-calculo-proceso.ts` | DELETE | Replaced by direct service calls in the consumer |
| `use-calculo-proceso.test.ts` | DELETE | Tests the deleted hook |
| `use-validacion-precios.ts` | DELETE | Replaced by direct service call + `useMemo` in the consumer |
| `use-validacion-precios.test.ts` | DELETE | Tests the deleted hook |
| `REFACTORING_SUMMARY.md` | DELETE | Stale documentation from a prior refactor attempt |
| `utils/cycle-utilities.ts` | DELETE | Moved to `app/utils/operaciones/cycle.ts` in Slice 3 |
| `utils/data-combiner.ts` | DELETE | Consumed phantom `CalculoPrefactura*` types |
| `utils/error-handler.ts` | DELETE | Replaced by `extraerMensajeError` in `app/utils/operaciones/error.ts` |
| `utils/price-validator.ts` | DELETE | Consumed phantom `RevisarPrecio*` types |

### 5.2 `app/utils/operaciones/` (6 files + 4 new + 1 move)

| File | Action | Change |
|---|---|---|
| `index.ts` | KEEP-MODIFY | Add 4 new re-exports: `download`, `period`, `cycle`, `error` |
| `constants.ts` | KEEP-AS-IS | Unchanged (canonical `MONTHS` source) |
| `validations.ts` | KEEP-AS-IS | Unchanged (pure validation functions) |
| `formatters.ts` | KEEP-MODIFY → DELETE | Remove `formatPeriodLabel` (local `MONTHS` map); delete file once consumers are updated |
| `confirmation-helpers.ts` | DELETE | `processConfirmations`/`filterPendingConfirmations` are inlined into the one consumer in Slice 6e |
| `revisar-precio-helpers.ts` | DELETE | 5 functions subsumed by `extraerMensajeError` |
| `cycle.ts` | CREATE (move) | `convertirCicloParaAPI` + 3 other helpers, moved from `app/hooks/operaciones/utils/cycle-utilities.ts` |
| `download.ts` | CREATE | `downloadBlob(blob, filename): void` |
| `period.ts` | CREATE | `formatPeriodoId(periodoAbierto): string` |
| `error.ts` | CREATE | `extraerMensajeError(error: unknown): string` |
| `download.test.ts` | CREATE | Colocated test for `downloadBlob` (unrunnable until `test/setup.ts` is restored) |
| `period.test.ts` | CREATE | Colocated test for `formatPeriodoId` (unrunnable) |
| `error.test.ts` | CREATE | Colocated test for `extraerMensajeError` (unrunnable) |
| `cycle.test.ts` | CREATE | Colocated test for `convertirCicloParaAPI` (unrunnable) |

### 5.3 `app/components/operaciones/` (49 files)

#### `anular-factura-impresa/` (1 file)

| File | Action | Change |
|---|---|---|
| `anular-factura-impresa-component.tsx` | DELETE | Feature has no source-of-truth backing |

#### `cambio-medidor/` (9 files)

| File | Action | Change |
|---|---|---|
| `cambio-medidor-component.tsx` | KEEP-MODIFY | Replace 5 phantom types with `CambioMedidorBuscarAntiguoRequest` + `CambioMedidorBuscarNuevoRequest`; replace 2 phantom `api.get` calls with `operacionesService.getBuscarMedidorAntiguo`/`getBuscarMedidorNuevo`; use `operacionesService.postEjecutarCambioMedidor` |
| `cambio-medidor-component.test.tsx` | CREATE | New colocated test verifying the form submission |
| `antiguo-medidor-form.tsx` | KEEP-MODIFY | Declare `AntiguoMedidorFormProps` inline |
| `detalle-medidor-antiguo.tsx` | KEEP-MODIFY | Declare `DetalleMedidorAntiguoProps` inline; drop phantom `DetalleMedidorAntiguo` type |
| `detalle-medidor-nuevo.tsx` | KEEP-MODIFY | Declare `DetalleMedidorNuevoProps` inline; drop phantom `DetalleMedidorNuevo` type |
| `medidor-field.tsx` | KEEP-MODIFY | Minor; drop unused imports |
| `medidor-fields-group.tsx` | KEEP-MODIFY | Minor; drop unused imports |
| `nuevo-contrato-form.tsx` | KEEP-MODIFY | Declare `NuevoContratoFormProps` inline |
| `nuevo-medidor-form.tsx` | KEEP-MODIFY | Declare `NuevoMedidorFormProps` inline |
| `collapsible-header.tsx` | KEEP-MODIFY | Minor; drop unused imports |

#### `cerrar-lecturas/` (5 files)

| File | Action | Change |
|---|---|---|
| `cerrar-lecturas-component.tsx` | KEEP-MODIFY | Drop phantom types; declare inline aliases; use `convertirCicloParaAPI`; remove 2 phantom `api.get/post` calls; use `operacionesService.getCerrarLecturasFiltrosCiclos`/`getCerrarLecturasFiltrosPeriodos` |
| `columns.tsx` | KEEP-MODIFY | Use inline `EstadoCierreLecturas` from the consumer file |
| `alert-cerrar-lecturas.tsx` | DELETE | Calls non-existent endpoint `/cerrar-lecturas-nicho` |
| `data-table-virtualized.tsx` | DELETE | Single-use after realignment |
| `dialog-informacion.tsx` | KEEP-MODIFY | Drop `CerrarLecturasCerrar` request type import |

#### `corte-reposicion/` (5 files)

| File | Action | Change |
|---|---|---|
| `corte-reposicion-component.tsx` | KEEP-MODIFY | Use `CorteReposicionResumenResponse` for stats; use `CorteReposicionBuscarRequest[]` for list; remove 8 phantom direct calls; use `downloadBlob`; keep 6 service-backed dialog actions; drop 4 lost features |
| `corte-reposicion-component.test.tsx` | CREATE | New colocated test |
| `columns.tsx` | DELETE | Data shape is the source-of-truth `CorteReposicionBuscarRequest[]`; columns re-defined inline |
| `consultar-acometida-dialog.tsx` | KEEP-MODIFY | Use `downloadBlob` for the 1 blob handler |
| `corte-registrado-dialog.tsx` | KEEP-MODIFY | Minor cleanup |
| `reposicion-solicitada-dialog.tsx` | KEEP-MODIFY | Minor cleanup |

#### `crear-archivos-sap/` (1 file)

| File | Action | Change |
|---|---|---|
| `crear-archivos-sap-component.tsx` | DELETE | Feature has no source-of-truth backing |

#### `periodo-facturacion/` (5 files)

| File | Action | Change |
|---|---|---|
| `periodo-facturacion-component.tsx` | KEEP-MODIFY | Drop phantom `Anio`/`Periodos` types; replace `api.get('/consulta-periodo')` with `operacionesService.getPeriodoAbierto()` |
| `columns.tsx` | KEEP-MODIFY | Use inline `Anio`/`Periodos` aliases |
| `dialog-nuevo-periodo.tsx` | DELETE | Merged into `dialog-periodo.tsx` |
| `dialog-abrir-periodo.tsx` | DELETE | Merged into `dialog-periodo.tsx` |
| `cerrar-periodo.tsx` | DELETE | Merged into `dialog-periodo.tsx` |
| `dialog-periodo.tsx` | CREATE | Single dialog using `operacionesService.postCrearPeriodoFacturacion` + `postCerrarPeriodoFacturacion`; `MONTHS` from `~/utils/operaciones` |

#### `precios-cargo/` (8 files)

| File | Action | Change |
|---|---|---|
| `precios-cargo-component.tsx` | KEEP-MODIFY | Use flat `PreciosConsultarRequest[]`; remove Enel/Agualova split |
| `data-table-precios.tsx` | KEEP-MODIFY | Remove Enel/Agualova split |
| `data-table-precios-virtualized.tsx` | DELETE | Single-use after realignment |
| `columns-enel.tsx` | DELETE | Merged into `columns-enerlova.tsx` |
| `columns-enerlova.tsx` | KEEP-MODIFY → RENAME to `columns.tsx` | Renamed; consumes flat `PreciosConsultarRequest[]` |
| `dialog-agregar-precios.tsx` | KEEP-MODIFY | Declare `DialogAgregarPreciosProps` inline |
| `dialog-nuevo-valor-enerlova.tsx` | KEEP-MODIFY | Minor cleanup |
| `detalle-precios-enerlova.tsx` | KEEP-MODIFY | Declare `DetallePrecios` inline via `Pick<PreciosConsultarRequest, ...>` |

#### `preparar-lecturas/` (3 files)

| File | Action | Change |
|---|---|---|
| `preparar-lecturas-component.tsx` | KEEP-MODIFY | Drop phantom types; use `operacionesService.getPrepararLecturasData` + `getBuscarNichos` + `postGenerarLecturas`; use `convertirCicloParaAPI` |
| `tabla-asignacion-sectores.tsx` | DELETE | No source-of-truth backing |
| `tabla-lecturas-pendientes.tsx` | DELETE | No source-of-truth backing |

#### `revisar-calculo-factura/` (6 files)

| File | Action | Change |
|---|---|---|
| `revisar-calculo-factura-component.tsx` | KEEP-MODIFY | Drop 2 hook imports; call `operacionesService.postRevisarCalculosLanzarCalculo` + `postRevisarCalculosAceptar` + `gerRevisarPreciosData` directly; declare `CalculoPrefacturaRow` inline; derive totals via `useMemo` |
| `revisar-calculo-factura-component.test.tsx` | CREATE | New colocated test (replacing the deleted one) |
| `columnsPrecalculo.tsx` | KEEP-MODIFY | Use inline `CalculoPrefacturaRow` |
| `data-table.tsx` | KEEP-MODIFY | Use inline `CalculoPrefacturaRow` |
| `hierarchical-data-table.tsx` | KEEP-MODIFY | Use inline `CalculoPrefacturaRow` + `CalculoPrefacturaCargo` |
| `hierarchical-data-table-virtualized.tsx` | DELETE | Single-use after realignment; spec verdict: `keep-inline` for 0 sites |

#### `revisar-precio/` (8 files)

| File | Action | Change |
|---|---|---|
| `revisar-precio-component.tsx` | KEEP-MODIFY | Drop phantom types; use `operacionesService.gerRevisarPreciosData(mes, anio)`; derive totals via `useMemo`; inline the small confirmation filter |
| `columns-enel.tsx` | DELETE | Merged into `columns-agualova.tsx` |
| `columns-agualova.tsx` | KEEP-MODIFY → RENAME to `columns.tsx` | Renamed; consumes `RevisionPreciosBuscarRequest[]` |
| `data-table.tsx` | KEEP-MODIFY | Use merged columns; minor cleanup |
| `data-table-virtualized.tsx` | DELETE | Single-use after realignment |
| `dialog-modificar-precio.tsx` | KEEP-MODIFY | Replace `{indice, valor, motivo, usuario}` payload with `RevisionPreciosCorregirRequest`; call `operacionesService.postCorregirPrecioCargo` |
| `dialog-modificar-precio.test.tsx` | CREATE | New colocated test (asserts new payload shape) |
| `tabla-valores-enel.tsx` | DELETE | Data rendered inline in main component |
| `tabla-valores-enerlova.tsx` | DELETE | Data rendered inline in main component |

### 5.4 `app/routes/dashboard/operaciones/` (10 files)

| File | Action | Change |
|---|---|---|
| `anular-factura-impresa.tsx` | KEEP-MODIFY | Replace component import with placeholder; remove `import React` |
| `cambio-medidor.tsx` | KEEP-MODIFY | Remove `clientLoader`; remove `import React`; keep component import |
| `cerrar-lecturas.tsx` | KEEP-MODIFY | Remove `clientLoader` + phantom `getCerrarLecturasData()` call; remove `import React` |
| `corte-reposicion.tsx` | KEEP-MODIFY | Remove `clientLoader` + phantom `getCorteReposicionData()` route call; remove `import React` |
| `crear-archivos-sap.tsx` | KEEP-MODIFY | Replace component import with placeholder; remove `import React` |
| `periodo-facturacion.tsx` | KEEP-MODIFY | Remove `clientLoader` + phantom `getPeriodoFacturacionData()` call; remove `import React`; component fetches on mount |
| `precios-cargo.tsx` | KEEP-MODIFY | Fix the `{tablaEnel, tablaAgualova}` destructure; remove `import React`; `clientLoader` may remain (passes array to component) |
| `preparar-lecturas.tsx` | KEEP-MODIFY | Remove `clientLoader` + phantom `getAsignacionSectores()` call; remove `import React` |
| `revisar-calculo-factura.tsx` | KEEP-MODIFY | Remove `clientLoader` + phantom `verificarEstadoCierreLecturas()` call; remove `import React` |
| `revisar-precio.tsx` | KEEP-MODIFY | Remove `clientLoader` + 2 phantom calls; remove `import React` |

### 5.5 `app/services/operations/` (6 files, full directory)

| File | Action | Change |
|---|---|---|
| `billing-calculation.service.ts` | DELETE | Half-built parallel architecture; zero consumers |
| `index.ts` | DELETE | Same |
| `periodos.service.ts` | DELETE | Same |
| `preparation.service.ts` | DELETE | Same |
| `pricing.service.ts` | DELETE | Same |
| `types.ts` | DELETE | Same |

### 5.6 `app/routes/dashboard/reportes/components/operaciones/` (51 files, full directory)

| Subdirectory | Files | Action |
|---|---|---|
| `anular-factura-impresa/` | 1 | DELETE |
| `cambio-medidor/` | 9 | DELETE |
| `cerrar-lecturas/` | 5 | DELETE |
| `corte-reposicion/` | 5 | DELETE |
| `crear-archivos-sap/` | 1 | DELETE |
| `periodo-facturacion/` | 5 | DELETE |
| `precios-cargo/` | 8 | DELETE |
| `preparar-lecturas/` | 3 | DELETE |
| `revisar-calculo-factura/` | 6 | DELETE |
| `revisar-precio/` | 8 | DELETE |

### 5.7 New files in `app/hooks/operaciones/`

| File | Action | Change |
|---|---|---|
| `use-product-tour.ts` | CREATE (conditional on §8.3 verdict) | `useProductTour(steps, options?): { startTour }` hook |

**Inventory totals:**
- **Files in the four target directories:** 49 components + 6 utils + 4 hooks + 4 hook utils + 1 REFACTORING_SUMMARY.md = 64 files
- **Files in routes:** 10 route files
- **Files in `app/services/operations/`:** 6 files
- **Files in `app/routes/dashboard/reportes/components/operaciones/`:** 51 files
- **Total files inventoried:** **131 files**
- **Of which DELETE:** ~95 (51 reportes + 6 services/operations + 12 component sub-files + 4 hook sub-files + 4 utils + 2 dialogs in periodo-facturacion + 2 sub-components in preparar-lecturas + 1 sub-component in anular-factura-impresa + 1 in crear-archivos-sap + 3 in revisar-precio + 1 in revisar-calculo-factura + 1 in precios-cargo + 1 REFACTORING_SUMMARY.md + 1 columns.tsx in corte-reposicion + 1 columns-enel.tsx in precios-cargo + 1 columns-enel.tsx + columns-agualova.tsx in revisar-precio + 1 formatters.ts after consumers update)
- **Of which KEEP-MODIFY:** ~30 (10 routes + 10 surviving main components + 8 cambio-medidor sub-components + 2 surviving columns files + 1 formatters.ts → DELETE eventually)
- **Of which KEEP-AS-IS:** 2 (`constants.ts`, `validations.ts`)
- **Of which CREATE:** ~10 (4 new util files + 4 colocated util tests + 2 new component tests + 1 new dialog + 1 new hook conditional)

---

## 6. Test strategy under strict_tdd (with deferred test infra)

`test/setup.ts` is **MISSING**. The orchestrator preflight explicitly defers its restoration to a separate change. This means:

- `pnpm test:run` will fail to load the test suite with `Cannot find module .../test/setup.ts`.
- `pnpm typecheck` (which runs `react-router typegen && tsc`) is runnable.
- `pnpm lint` (Biome) is runnable.
- `pnpm build` is runnable.

### 6.1 Strategy

For each slice, **write the tests as if they would run** (RED-GREEN-REFACTOR). Use `vi.mock` for `operacionesService` and `api`. The test files will compile but `pnpm test:run` will fail to load them until `test/setup.ts` is restored.

`sdd-verify` is **PARTIAL**: typecheck and lint are runnable; full test run is BLOCKED. This is documented in the verify-report.md template.

### 6.2 Per-slice test additions/modifications

| Slice | Test files | Coverage |
|---|---|---|
| 1 | (none — pure deletions) | n/a |
| 2a | (none — pure deletions) | n/a |
| 2b (= part of 6e) | `revisar-precio-component.test.tsx` (new) | Verifies the inlined filter + `gerRevisarPreciosData` call |
| 3 | `app/utils/operaciones/download.test.ts` (new, ~40 LOC) | `downloadBlob(blob, 'x.csv')` creates anchor with `download='x.csv'` and `href` starts with `'blob:'` |
| 3 | `app/utils/operaciones/period.test.ts` (new, ~50 LOC) | `formatPeriodoId([{id:'1', descripcion:'2026-01'}])` returns `'012026'`; empty array throws `EmptyPeriodoAbiertoError` |
| 3 | `app/utils/operaciones/error.test.ts` (new, ~50 LOC) | 3 cases: `Error` instance, axios-shaped error with `response.data.mensaje`, non-Error thrown value |
| 3 | `app/utils/operaciones/cycle.test.ts` (new, ~30 LOC) | `convertirCicloParaAPI` handles both string and number inputs |
| 4 | (none — route-level changes only) | n/a |
| 5 | `app/hooks/operaciones/use-calculo-factura.test.ts` (re-create, ~80 LOC) | 3 scenarios: success, 404 → `estadoCierre === 'no-cerrado'`, other error → non-empty string |
| 6a | `app/components/operaciones/cambio-medidor/cambio-medidor-component.test.tsx` (new, ~80 LOC) | Verifies form submission calls `postEjecutarCambioMedidor` with `CambioMedidorEjecutarCambioRequest` payload |
| 6b | (none — utility files, covered by Slice 3 tests) | n/a |
| 6c | `app/components/operaciones/corte-reposicion/corte-reposicion-component.test.tsx` (new, ~80 LOC) | Verifies lifecycle buttons call source-of-truth service methods |
| 6d | (none — the merged dialog has a clear "feature removed" contract) | n/a |
| 6e | `app/components/operaciones/revisar-calculo-factura/revisar-calculo-factura-component.test.tsx` (new, ~80 LOC) | Verifies "Lanzar cálculo" handler calls `postRevisarCalculosLanzarCalculo` with `RevisarCalculosLanzarCalculoRequest` payload |
| 6e | `app/components/operaciones/revisar-precio/dialog-modificar-precio.test.tsx` (new, ~80 LOC) | Asserts the new payload shape `RevisionPreciosCorregirRequest = {codigoCargo, nuevoValor, motivo, passwordConfirmacion}` |
| 7 | (none — style-only changes) | n/a |
| 8 | (none — dead-code sweep) | n/a |

**Total new test files:** 10 (4 util tests + 1 hook test + 4 component tests + 1 dialog test). **Total deleted test files:** 4 (3 hook tests + 1 component test, all in Slice 2a or 6e).

### 6.3 Smoke checks per slice (runnable today)

| Slice | Smoke check |
|---|---|
| 1 | `pnpm typecheck` passes |
| 2a | `pnpm typecheck` passes |
| 2b (= part of 6e) | `pnpm typecheck` passes |
| 3 | `pnpm typecheck` passes; `pnpm lint` passes |
| 4 | `pnpm typecheck` passes; `pnpm build` passes |
| 5 | `pnpm typecheck` passes; `pnpm build` passes |
| 6a | `pnpm typecheck` passes; `pnpm build` passes |
| 6b | `pnpm typecheck` passes; `pnpm build` passes |
| 6c | `pnpm typecheck` passes; `pnpm build` passes |
| 6d | `pnpm typecheck` passes; `pnpm build` passes |
| 6e | `pnpm typecheck` passes; `pnpm build` passes |
| 7 | `pnpm lint` passes; `pnpm format:check` passes |
| 8 | `pnpm typecheck` passes; `pnpm build` passes; `pnpm lint` passes |

### 6.4 Full test execution

**Blocked** until `test/setup.ts` is restored in a separate change. The sdd-verify phase will document this as a known blocker per the orchestrator preflight. The 10 new test files are authored and committed; they will become runnable when the deferred change lands.

---

## 7. PR strategy confirmation

**`pr_strategy: chained-pr` is required.** Justification:

- Total scope: **~131 files** affected, **~13,000 LOC of net delta** (per `proposal.md` §7).
- The 400-LOC review budget per PR (per the `chained-pr` skill) cannot accommodate a 13,000-LOC single PR.
- The slices are independent work units with clear start, finish, and rollback boundaries (per the `work-unit-commits` skill).
- The user strategy explicitly chose `ask-always` for chained PR strategy, and the proposal recommended `chained-pr`.

### 7.1 Slices in execution order, with review budget

| Slice | Description | Review budget (LOC delta) | Branch name | Commit message |
|---|---|---|---|---|
| 1 | Dead directory purge | −5,970 / +0 | `refactor-operaciones-modulos/slice-1-dead-directory-purge` | `chore(operaciones): delete dead services/operations and reportes/components/operaciones mirror` |
| 2a | Dead hook + 3 utils + 4 tests | −1,228 / +0 | `refactor-operaciones-modulos/slice-2a-dead-hook-and-utils` | `chore(operaciones): delete use-calculo-facturacion-flow and 3 unused hook utils` |
| 2b (= part of 6e) | 2 helper utils + revisar-precio update | −642 / +250 (net −392) | `refactor-operaciones-modulos/slice-6e-revisar-precio` | `refactor(operaciones): realign revisar-precio and delete confirmation/revisar-precio helpers` |
| 3 | Utils consolidation | +300 / −100 (net +200) | `refactor-operaciones-modulos/slice-3-utils-consolidation` | `refactor(operaciones): extract download/period/cycle/error helpers to utils/operaciones` |
| 4 | Routes realignment | −200 / +0 | `refactor-operaciones-modulos/slice-4-routes-realignment` | `refactor(operaciones): strip clientLoaders and phantom service calls from 10 routes` |
| 5 | Hooks realignment | −290 / +60 (net −230) | `refactor-operaciones-modulos/slice-5-hooks-realignment` | `refactor(operaciones): rewrite useCalculoFactura and delete useCalculoProceso/useValidacionPrecios` |
| 6a | anular + cambio-medidor + crear-archivos-sap | −200 / +100 (net −100) | `refactor-operaciones-modulos/slice-6a-anular-cambio-crear` | `refactor(operaciones): realign cambio-medidor; delete anular-factura and crear-archivos-sap` |
| 6b | cerrar-lecturas | −700 / +50 (net −650) — but the file count is large; per-file delta is small | `refactor-operaciones-modulos/slice-6b-cerrar-lecturas` | `refactor(operaciones): realign cerrar-lecturas to source-of-truth service` |
| 6c | corte-reposicion | −500 / +100 (net −400) | `refactor-operaciones-modulos/slice-6c-corte-reposicion` | `refactor(operaciones): realign corte-reposicion; remove 4 lost features` |
| 6d | periodo-facturacion + preparar-lecturas | −1,000 / +150 (net −850) | `refactor-operaciones-modulos/slice-6d-periodo-preparar` | `refactor(operaciones): merge 3 periodo dialogs; delete 2 dead preparar-lecturas subcomponents` |
| 6e | precios-cargo + revisar-calculo-factura + revisar-precio | −1,200 / +250 (net −950) — but the file count is largest | `refactor-operaciones-modulos/slice-6e-precios-revisar` | `refactor(operaciones): realign precios-cargo and the 2 revisar-* subdomains; drop Enel/Agualova split` |
| 7 | Style sweep | −100 / +0 | `refactor-operaciones-modulos/slice-7-style-sweep` | `chore(operaciones): remove console.* and toast.error(error as any)` |
| 8 | Intra-directory dead-code sweep | −200 / +0 | `refactor-operaciones-modulos/slice-8-dead-code-sweep` | `chore(operaciones): final intra-directory dead-code sweep` |

**Total slices: 12** (1, 2a, 2b [merged with 6e], 3, 4, 5, 6a, 6b, 6c, 6d, 6e, 7, 8). Each slice is independently mergeable.

### 7.2 PR chain strategy

**Stacked PRs to `main`** (per the `chained-pr` skill decision gate: "PR >400, each slice can land independently"). The 12 slices are stacked on top of each other; each subsequent PR targets the branch of the previous PR. The `delivery_strategy` from the orchestrator is `ask-always`, so the user is asked before each PR is created.

### 7.3 Chain context for each PR

Each PR body includes a dependency diagram marking the current PR with `📍` and listing prior PRs and follow-up work. Out-of-scope items (e.g. `test/setup.ts` restoration, bundle optimization, the `ger` typo fix) are explicitly listed in the chain context.

---

## 8. Cross-cutting technical decisions

### 8.1 Error handling — `extraerMensajeError` helper

**Decision: option (a) — `extraerMensajeError(error: unknown): string` helper.** A single utility that all consumers use to get a human-readable message from any thrown/returned error. Errors are then passed to toast or thrown upward.

**Signature** (`app/utils/operaciones/error.ts`):

```ts
export function extraerMensajeError(error: unknown): string {
  // 1. Error instance
  if (error instanceof Error) return error.message;
  // 2. Axios-shaped error with response.data.mensaje
  if (typeof error === 'object' && error !== null) {
    const e = error as { response?: { data?: { mensaje?: string } } };
    if (typeof e.response?.data?.mensaje === 'string') {
      return e.response.data.mensaje;
    }
  }
  // 3. OperacionesserviceResponse envelope
  if (typeof error === 'object' && error !== null) {
    const e = error as { error?: unknown };
    if (typeof e.error === 'string') return e.error;
  }
  // 4. String itself
  if (typeof error === 'string') return error;
  // 5. Last resort
  return String(error);
}
```

**Usage example** in a component:

```ts
import { extraerMensajeError } from '~/utils/operaciones';
import { toast } from 'sonner';

try {
  await operacionesService.postCorregirPrecioCargo(req);
  toast.success('Precio corregido');
} catch (err) {
  toast.error(extraerMensajeError(err));
}
```

This pattern replaces 10+ inline `toast.error(error as any)` calls (per `style-and-convention-sweep.md`).

### 8.2 Loading state — `useAsyncResource<T>` hook (deferred)

**Decision: defer the `useAsyncResource` extraction.** The proposal recommends it, but the refactor scope is DELETE + REALIGN, not new abstractions. After the realignment, 5 routes re-implement the `useState<data> + useState<isLoading> + useState<error> + refetch` pattern. The shared `useAsyncResource<T>(fetcher, deps): { data, isLoading, error, refetch }` hook is a sound abstraction, but adding it would add 50+ LOC of new code to a refactor whose dominant direction is deletion. **Decision: keep the inline pattern in the routes; record as future work.**

This is a deliberate reversal of the proposal's recommendation §5. The justification: a new shared hook is best introduced in a focused change that proves the pattern with 1 consumer, then promotes to 2+ consumers. Adding it to this 12-slice refactor mixes concerns and dilutes the chained-PR focus.

If a future change adds 1 more consumer, the extraction is trivially justifiable then.

### 8.3 Driver.js tour consolidation — `useProductTour` extracted

**Verdict: EXTRACT** to `app/hooks/operaciones/use-product-tour.ts`. The 4 candidate sites are visually identical:

| Site | Driver config | Notes |
|---|---|---|
| `corte-reposicion-component.tsx:324-345` | showProgress, progressText, smoothScroll, **stagePadding: 4**, stageRadius, animate, allowClose, button text, onHighlightStarted | None |
| `revisar-calculo-factura-component.tsx:223-245` | (same) | Wrapped in `useCallback`; calls `setIsMenuOpen(true)` before `driver(...)` |
| `revisar-precio-component.tsx:300-321` | (same) | None |
| `precios-cargo-component.tsx:232-252` | (same) | None |

**All 4 sites have a 12-line identical driver config block.** The only per-site difference is the `setIsMenuOpen(true)` pre-call in `revisar-calculo-factura-component.tsx:224`. The hook SHALL accept an optional `onStart` callback to handle this:

```ts
// app/hooks/operaciones/use-product-tour.ts
import { driver, type DriveStep, type Config } from 'driver.js';

export type TourStep = DriveStep;

export interface UseProductTourOptions {
  onStart?: () => void;
}

const DEFAULT_DRIVER_CONFIG: Config = {
  showProgress: true,
  progressText: 'Paso {{current}} de {{total}}',
  smoothScroll: true,
  stagePadding: 4,
  stageRadius: 6,
  animate: true,
  allowClose: true,
  nextBtnText: 'Siguiente',
  prevBtnText: 'Anterior',
  doneBtnText: 'Finalizar',
  onHighlightStarted: element => {
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  },
};

export function useProductTour(
  steps: TourStep[],
  options?: UseProductTourOptions
): { startTour: () => void } {
  const startTour = useCallback(() => {
    options?.onStart?.();
    const d = driver({ ...DEFAULT_DRIVER_CONFIG });
    d.setSteps(steps);
    d.drive();
  }, [steps, options]);

  return { startTour };
}
```

**Decision: extract.** The 4 sites are visually identical; the per-site customization is encapsulated by the `onStart` callback. The hook is created in Slice 6e (alongside the rest of the component realignment) and consumed by all 4 sites.

### 8.4 Data table virtualization — `keep-inline` (0 sites after realignment)

**Verdict: keep-inline; do NOT extract.** The 4 virtualized table implementations differ significantly:

| File | Subdomain | Distinctive features |
|---|---|---|
| `cerrar-lecturas/data-table-virtualized.tsx` (179 LOC) | cerrar-lecturas | Basic selection + virtualization |
| `revisar-precio/data-table-virtualized.tsx` (222 LOC) | revisar-precio | External `selectedRowIds` + `enableSelection` + `isLoading` + sync effect |
| `revisar-calculo-factura/hierarchical-data-table-virtualized.tsx` (380 LOC) | revisar-calculo-factura | **Hierarchical** (4 VirtualRow types: main, cargo-header, cargo, ...); `getExpandedRowModel`; fundamentally different |
| `precios-cargo/data-table-precios-virtualized.tsx` (294 LOC) | precios-cargo | `ColumnGroup` + `ColumnFiltersState` + `VisibilityState` + `getFacetedRowModel` + `getFacetedUniqueValues` + search input |

**The 4 implementations share only the high-level shape** (`useReactTable` + `useVirtualizer` + the basic table UI primitives). The prop APIs, selection models, sorting/filtering/visibility state, and (in one case) row hierarchy are all different. A shared `VirtualizedDataTable<T>` would either (a) accept 20+ props to cover all cases (defeating the purpose), or (b) accept a "render prop" for the row expansion logic (defeating the simplicity).

**Decision: do not extract.** All 4 virtualized files are **deleted** per the per-subdomain specs. Each surviving component uses the simpler non-virtualized `DataTable` from `app/components/shared/` (which is a stable shared component, not added by this refactor).

### 8.5 Cambio-medidor 842-LOC component split

**Stretch requirement, NOT in the MVP scope of this refactor.** Recorded as future work in the proposal §5.1. The proposed 4-step wizard structure for a future change:

```
Step 1: AntiguoMedidorForm      (form for old meter)
Step 2: DetalleMedidorAntiguo   (read-only summary)
Step 3: NuevoMedidorForm        (form for new meter)
Step 4: NuevoContratoForm       (contract binding)
+ CollapsibleHeader (shared) + MedidorField (shared) + MedidorFieldsGroup (shared)
+ Submit handler calling operacionesService.postEjecutarCambioMedidor
```

The current refactor keeps the 842-LOC component intact (with phantom type/service call fixes), as the spec `cambio-medidor.md` requires only the type and service realignment, not the split. The split is recorded as a follow-up change.

### 8.6 Hook deletion: `useCalculoFacturacionFlow`

**Confirmed dead.** The slim 3-hook trio (`useCalculoFactura`, `useCalculoProceso`, `useValidacionPrecios`) is what the routes actually use. The flow hook and its 5 step exports (`lanzarCalculoFacturacion`, `obtenerIdentificadorProceso`, `verificarEstadoProceso`, `consultarEncabezadoPrefactura`, `consultarCargosPrefactura`) are unused.

**Call-site verification** (via `grep`):

```bash
grep -r "ejecutarFlujoCompleto\|ejecutarPaso[1-5]" app/
```

Expected result: 0 matches outside the file itself. The `REFACTORING_SUMMARY.md` may mention the flow hook; that file is deleted in Slice 2a. The 5 step methods are referenced in the flow hook's own body but never called from outside the file. **Delete confirmed in Slice 2a.**

### 8.7 `useValidacionPrecios` triple-state collapse

**Decision: collapse the 3 `useState<number>` calls into a single `useMemo`-derived result, computed inline in the calling component.** The hook is deleted per `hooks-realignment.md`.

**New signature** (inline in the consumer component `revisar-calculo-factura-component.tsx`):

```ts
// Was: 3 useState<number> in useValidacionPrecios.ts
// Now: single useMemo derived from the gerRevisarPreciosData result

const { data: preciosData, isLoading: isLoadingPrecios } = useQuery({
  queryKey: ['revisar-precios', mes, anio],
  queryFn: () => operacionesService.gerRevisarPreciosData(mes, anio),
});

const { confirmados, pendientes, total } = useMemo(() => {
  const items = preciosData?.data ?? [];
  return {
    confirmados: items.filter((p: { estaConfirmado: boolean }) => p.estaConfirmado).length,
    pendientes: items.filter((p: { estaConfirmado: boolean }) => !p.estaConfirmado).length,
    total: items.length,
  };
}, [preciosData]);
```

Note: this is NOT introducing `useQuery` (react-query) — the example uses a placeholder pattern. The actual implementation uses raw `useState` + `useEffect` for the fetch, then `useMemo` for the derivation, per the existing `useCalculoFactura` pattern. The `useQuery` syntax above is a shorthand for the pattern. **The pattern is: fetch once, derive totals with `useMemo`, no triple-state.**

**No new hook file** (`useValidacionPrecios` is deleted). The derivation lives in the consumer component as a `useMemo` block.

---

## 9. Risk register and mitigations

Restating the 3 spec-phase risks (R1, R2, R3) and adding 6 design-level risks (R4-R9):

| # | Risk | Likelihood | Impact | Mitigation | Rollback |
|---|---|---|---|---|---|
| R1 | **Phantom import resolution.** When a phantom type import is removed, downstream code that referenced it may break. | Medium | The deletion breaks an import in another file; `pnpm typecheck` fails. | Per-slice typecheck; `grep` for the type name before deletion; identify all consumers in the slice and update them. | Revert the slice commit. |
| R2 | **Phantom service call removal cascading.** Removing a phantom call may break UI features that depend on the call's result. | Medium | A page that previously showed an error toast now shows an empty state (or a crash). | Per-slice typecheck; manual smoke test of the affected route in dev mode (when sdd-verify can run; until then, manual review of the route file + the spec scenario in the corresponding `routes/*.md` spec). | Revert the slice commit. |
| R3 | **Corte-reposicion feature loss.** 4 user-visible features will be removed. | High (user-visible) | The page becomes significantly less functional. | Explicit non-goal in spec (`routes/corte-reposicion.md`); explicit note in the PR description; screenshot the route before deletion for the changelog. | Revert the slice commit. The dialog and direct calls are restored. |
| R4 | **`getPeriodoFacturacionData` orphan.** The service method exists but the route doesn't use it (the route was misusing it). Decision: keep in source (frozen). The spec notes this. | Low | None. | Acknowledged in `routes/periodo-facturacion.md`. | n/a — accepted. |
| R5 | **Test infra missing.** Tests are unrunnable. | High (known) | `pnpm test:run` fails; sdd-verify reports a blocker. | Write tests; defer full suite execution to the separate `test/setup.ts` change. sdd-verify runs typecheck + lint + build only. | n/a — known accepted risk per orchestrator preflight. |
| R6 | **Re-introduction of dead code via imports.** After deletion, a future change might re-import the dead files. | Medium | The `services/operations/` and `reportes/components/operaciones/` directories might be partially restored. | Add a CI grep check or eslint rule that fails if a deleted import path is re-introduced. (The check is recorded as future work; this refactor does not add it.) | The grep check is added in a follow-up change. |
| R7 | **Two services confusion.** The frozen `operacionesService.ts` and the deleted `services/operations/*` are easy to confuse. | Low | A future reader might be confused about which service is canonical. | Deletion in Slice 1 eliminates the confusion; commit message explicitly notes "delete parallel architecture"; the `services/operations/` directory is removed in Slice 1 (before any realignment starts). | n/a. |
| R8 | **Style drift perpetuation.** Style fixes are in Slice 7, late in the chain. Earlier slices may introduce new violations. | Low | The style sweep has more files to fix. | Code review checklist per slice: review for `console.*`, `toast.error(error as any)`, `import React from "react"` in each PR. Final sweep in Slice 7. | The style sweep is comprehensive. |
| R9 | **Bundle size not measured.** Component splits and code-splitting are out of scope. | Low | The 842-LOC `cambio-medidor-component.tsx` and 810-LOC `revisar-calculo-factura-component.tsx` remain non-lazy. | Recorded as future work; no bundle-size regression expected from the deletion-heavy refactor (we're net-deleting ~8,150 LOC). | n/a — future work. |

---

## 10. Out of scope (explicit non-goals)

- No new types in `app/types/operaciones.ts`. The source-of-truth types file is frozen.
- No new methods in `app/services/operacionesService.ts`. The source-of-truth service is frozen.
- No new feature work. If a feature has no source-of-truth backing, it is deleted, not added.
- No `test/setup.ts` restoration. Deferred to a separate change (per orchestrator preflight).
- No new shared UI components (`<EmptyState>`, `<StatsCard>`, `<FilterForm>`) unless 2+ real sites emerge after realignment. Currently **deferred** for borderline cases; **rejected** for single-site cases (e.g. virtualized tables).
- No migration to a new architecture (the parallel `app/services/operations/*` is deleted, not adopted).
- No changes to the source-of-truth files (`app/types/operaciones.ts`, `app/services/operacionesService.ts`).
- No changes outside the four target directories and the two explicit directory deletions, except:
  - `app/utils/operaciones/cycle.ts` is moved from `app/hooks/operaciones/utils/cycle-utilities.ts`.
  - The route files in `app/routes/dashboard/operaciones/*` are modified (these are in scope).
- No bundle size optimization (lazy-loading the heavy components). Deferred to a follow-up.
- No translation/i18n changes.
- No `gerRevisarPreciosData` typo fix in the source-of-truth service file. The typo is preserved.
- No new `useAsyncResource` hook (deferred; the inline `useState` + `useEffect` pattern is kept).
- No cambio-medidor wizard split (deferred; the 842-LOC component is kept intact with only type/service realignment).
- No changes outside the four target directories, the two deletions, and the routes. No `app/components/shared/` additions; no `app/types/operaciones/` subdirectory.

---

## 11. Open questions for the user

**None.** The design resolves all 3 open questions from the explore report (Q1, Q2, Q3) and the 2 conditional verdicts in §8.3 and §8.4 are made here:

- **Q1 (where do missing types go)**: Resolved. Inline `type` declarations in consumer files. No new type files (per §2.5).
- **Q2 (how to handle 11 missing service methods)**: Resolved. The missing service methods that have source-of-truth alternatives use those alternatives; the missing methods that do not are deleted with their features (per §3.2).
- **Q3 (delete the reportes copy)**: Resolved. Yes, in Slice 1.
- **Q5 (corte-reposicion shape mismatch)**: Resolved. The route uses `getCorteReposicionData` for resumen + `getBuscarCorteReposicion` for the list. The previous `ConsultarMantenedorRevisionCorte` shape is removed.
- **Q6 (precios-cargo shape mismatch)**: Resolved. The route receives `result.data` (flat array) directly. The Enel/Agualova split is removed.
- **Q7 (cambio-medidor wizard split)**: Deferred. The 842-LOC component is kept intact in this refactor.
- **Q8 (useProductTour extraction)**: Resolved. Extract (per §8.3).
- **Q4 (shared UI components)**: Resolved. None added in this refactor. `<EmptyState>`, `<ErrorState>`, `<LoadingState>`, `<StatsCard>`, `<FilterForm>` are kept inline. Recorded as future work.
- **Driver.js tour verdict**: Resolved. EXTRACT (4 sites, visually identical, `useProductTour` to `app/hooks/operaciones/use-product-tour.ts`).
- **Data table virtualization verdict**: Resolved. KEEP-INLINE (4 implementations diverge; all 4 are deleted per per-subdomain specs; 0 sites remain after realignment).

**Ready for `sdd-tasks`.**

---

## Appendix: files modified in the FROZEN source-of-truth

The following two files SHALL NOT be modified by this change (verified by `git diff --stat` of those two files being empty in every PR in the chained series):

- `app/types/operaciones.ts` — 250 lines, 29 exported types
- `app/services/operacionesService.ts` — 680 lines, 31 methods, 1 `OperacionesServiceResponse<T>` interface

The orchestrator's preflight explicitly prohibits modifications to these files. The design's compliance with this rule is verifiable in any PR by running:

```bash
git diff --stat app/types/operaciones.ts app/services/operacionesService.ts
```

Expected output in every PR: empty.
