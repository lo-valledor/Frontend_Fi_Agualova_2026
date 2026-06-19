# Tasks: refactor-operaciones-modulos

> **Slug:** `refactor-operaciones-modulos`
> **Phase:** tasks
> **Mode:** interactive
> **Artifact store:** openspec
> **Review budget:** 400 LOC per slice (HARD LIMIT, except pure-deletion slices which are reviewable in <15 min via zero-import grep)
> **Chained PR strategy:** `chained-pr` (stacked PRs to a tracker branch, ask-always per orchestrator)
> **Test infra status:** `test/setup.ts` is **MISSING** (deferred to a separate change). Tasks are authored in **RED-GREEN-REFACTOR** discipline, but `pnpm test:run` will not execute them. `sdd-verify` will run `pnpm typecheck && pnpm lint && pnpm build` only.

---

## Header

This task list breaks the `refactor-operaciones-modulos` change — a deletion-and-realignment refactor of `app/hooks/operaciones/`, `app/utils/operaciones/`, `app/components/operaciones/`, and `app/routes/dashboard/operaciones/` — into **82 concrete tasks** across **12 slices**, in execution order from lowest risk (deletions) to highest risk (intradirectory dead-code sweep). The FROZEN source of truth (`app/types/operaciones.ts` and `app/services/operacionesService.ts`) is never modified; the refactor deletes parallel architectures (`app/services/operations/*` and the 51-file `app/routes/dashboard/reportes/components/operaciones/` mirror), rewrites consumers to use only source-of-truth service methods, and extracts 4 new shared utilities (`downloadBlob`, `formatPeriodoId`, `convertirCicloParaAPI`, `extraerMensajeError`) plus 1 conditional shared hook (`useProductTour`).

**References:**
- Design (primary): `openspec/changes/refactor-operaciones-modulos/design.md` — 12 slices, 131-file inventory, per-slice implementation approach
- Specs (15 files / 72 requirements / 74 scenarios): `openspec/changes/refactor-operaciones-modulos/specs/cross-cutting/*.md` and `openspec/changes/refactor-operaciones-modulos/specs/routes/*.md`
- Proposal: `openspec/changes/refactor-operaciones-modulos/proposal.md`
- Explore: `openspec/changes/refactor-operaciones-modulos/explore.md`

**Note about the deferred test infrastructure:** `test/setup.ts` is missing. `strict_tdd: true` is set in `openspec/config.yaml` but tests are unrunnable. Per orchestrator preflight, this is accepted and deferred to a separate change. Every task that adds or modifies code follows the **RED-GREEN-REFACTOR** discipline: write the failing test first, then the minimum implementation, then refactor. The sdd-verify phase will only run `pnpm typecheck`, `pnpm lint`, and `pnpm build`; the 10 newly authored test files will compile but will not execute until the deferred change restores `test/setup.ts`.

**Review budget reminder (400 LOC per slice):** The 400-LOC budget refers to **reviewable added/modified code**. Pure-deletion slices (1, 2a, plus deletion sub-tasks in 6a, 6b, 6c, 6d, 6e) are reviewable in <15 minutes via `grep` verification of zero consumers. The slice-level net LOC delta may exceed 400 for deletion-heavy slices; the per-slice summary below breaks this out explicitly. **No slice should have >400 LOC of added/modified code (positive LOC) without a split.**

**Project conventions (per `openspec/AGENTS.md`):** Linting/formatting is **Biome** (not ESLint/Prettier); `pnpm lint` runs `biome lint --write`. `pnpm typecheck` runs `react-router typegen && tsc`. The `~/*` alias resolves to `app/*` in both `tsconfig.json` and `vitest.config.ts`. Tests are colocated `*.test.ts` / `*.test.tsx` next to source files.

**Source-of-truth freeze:** `git diff --stat app/types/operaciones.ts app/services/operacionesService.ts` MUST be empty in every PR. No task in this list modifies those two files.

---

## 12-Slice Execution Order

The slices are numbered 1, 2a, 3, 4, 5, 6a, 6b, 6c, 6d, 6e, 7, 8. Slice 2b (`revisar-precio-helpers` + `confirmation-helpers` deletion combined with the `revisar-precio` consumer update) is **merged into Slice 6e** per `design.md` §4 Slice 2 step 2. The dependency graph is a single linear chain: 1 → 2a → 3 → 4 → 5 → 6a → 6b → 6c → 6d → 6e → 7 → 8. Sub-slices 6a, 6b, 6c, 6d, 6e are mostly independent of each other in code (no shared files) but are listed sequentially for incremental review cadence.

---

### Slice 1 — Dead directory purge

> **Spec references:** `specs/cross-cutting/dead-code-purge.md#requirement-collateral-dead-directory-removal` (scenarios `services-operations-directory-deleted`, `reportes-components-operaciones-directory-deleted`)
> **Files affected:** 57 files deleted (6 + 51), 0 added
> **Estimated LOC delta:** −5,970 / +0
> **Branch:** `refactor-operaciones-modulos/slice-1-dead-directory-purge`
> **Commit message:** `chore(operaciones): delete dead services/operations and reportes/components/operaciones mirror`

#### Task 1.1: Verify zero consumers and delete `app/services/operations/`

**Slice:** 1 (Dead directory purge)
**Spec reference:** `specs/cross-cutting/dead-code-purge.md#requirement-collateral-dead-directory-removal` (scenario `services-operations-directory-deleted`)
**File(s) affected:** `app/services/operations/{index,types,periodos.service,pricing.service,preparation.service,billing-calculation.service}.ts` (6 files, ~770 LOC)
**Estimated LOC delta:** −770 / +0
**Pre-conditions:** none
**Steps:**
1. Run `grep -r "from .*services/operations" app/ test/ 2>/dev/null` and confirm 0 matches.
2. Run `grep -r "from '~/services/operations" app/ test/ 2>/dev/null` and confirm 0 matches.
3. Delete the 6 files via `git rm app/services/operations/{index,types,periodos.service,pricing.service,preparation.service,billing-calculation.service}.ts`.
4. Remove the now-empty `app/services/operations/` directory.
**Acceptance criteria:**
- [ ] `ls app/services/operations/` returns "No such file or directory"
- [ ] `grep -r "services/operations" app/ test/` returns 0 matches
- [ ] `pnpm typecheck` passes
**Dependencies:** none
**Commit message:** `chore(operaciones): delete dead app/services/operations parallel architecture`
**Branch:** `refactor-operaciones-modulos/slice-1-dead-directory-purge`

#### Task 1.2: Verify zero consumers and delete `app/routes/dashboard/reportes/components/operaciones/`

**Slice:** 1 (Dead directory purge)
**Spec reference:** `specs/cross-cutting/dead-code-purge.md#requirement-collateral-dead-directory-removal` (scenario `reportes-components-operaciones-directory-deleted`)
**File(s) affected:** `app/routes/dashboard/reportes/components/operaciones/**` (51 files across 10 subdirectories, ~5,200 LOC)
**Estimated LOC delta:** −5,200 / +0
**Pre-conditions:** Task 1.1 (the two directory deletes are atomic together per `design.md` §4 Slice 1 step 3)
**Steps:**
1. Run `grep -r "dashboard/reportes/components/operaciones" app/ test/ 2>/dev/null` and confirm 0 matches outside `openspec/changes/refactor-operaciones-modulos/explore.md`.
2. Delete the 10 subdirectories via `git rm -r app/routes/dashboard/reportes/components/operaciones/{anular-factura-impresa,cambio-medidor,cerrar-lecturas,corte-reposicion,crear-archivos-sap,periodo-facturacion,precios-cargo,preparar-lecturas,revisar-calculo-factura,revisar-precio}/`.
3. Remove the now-empty parent directories.
**Acceptance criteria:**
- [ ] `ls app/routes/dashboard/reportes/components/operaciones/` returns "No such file or directory"
- [ ] `grep -r "dashboard/reportes/components/operaciones" app/ test/` returns 0 matches
- [ ] `pnpm typecheck` passes
**Dependencies:** Task 1.1
**Commit message:** `chore(operaciones): delete dead 51-file reportes/components/operaciones mirror`
**Branch:** `refactor-operaciones-modulos/slice-1-dead-directory-purge`

#### Task 1.3: Verify slice-level smoke check

**Slice:** 1 (Dead directory purge)
**Spec reference:** `specs/cross-cutting/dead-code-purge.md#requirement-collateral-dead-directory-removal`
**File(s) affected:** none (verification only)
**Estimated LOC delta:** 0 / +0
**Pre-conditions:** Tasks 1.1 + 1.2
**Steps:**
1. Run `pnpm typecheck && pnpm lint && pnpm build` and confirm exit 0.
2. Re-run the two `grep` zero-import verifications.
3. Confirm `git diff --stat app/types/operaciones.ts app/services/operacionesService.ts` is empty.
**Acceptance criteria:**
- [ ] `pnpm typecheck && pnpm lint && pnpm build` all pass
- [ ] All `grep` zero-import assertions hold
- [ ] Source-of-truth files unchanged
**Dependencies:** Tasks 1.1, 1.2
**Commit message:** (no new commit; PR-level smoke check)
**Branch:** `refactor-operaciones-modulos/slice-1-dead-directory-purge`

#### Slice 1 summary

- **Total tasks:** 3
- **Total estimated LOC delta:** −5,970 / +0
- **Spec coverage:** `specs/cross-cutting/dead-code-purge.md` — requirement `collateral-dead-directory-removal` (both scenarios)
- **Review budget fit:** **PASS** — pure deletions, reviewable in <15 min via two `grep` zero-import verifications. Net LOC exceeds 400 (it's all deletions), but the 400 budget applies to reviewable added/modified code, not pure deletions.
- **Smoke check:** `pnpm typecheck && pnpm lint && pnpm build`

---

### Slice 2a — Dead hook + unused utils + unrunnable tests + REFACTORING_SUMMARY

> **Spec references:** `specs/cross-cutting/dead-code-purge.md#requirement-use-calculo-facturacion-flow-removal`, `#requirement-dead-hook-test-files-removal`; `specs/cross-cutting/hooks-realignment.md#requirement-utils-error-handler-deletion`, `#requirement-utils-data-combiner-deletion`, `#requirement-utils-price-validator-deletion`
> **Files affected:** 9 files deleted (1 hook + 3 hook utils + 4 tests + 1 doc), 0 added
> **Estimated LOC delta:** −1,474 / +0
> **Branch:** `refactor-operaciones-modulos/slice-2a-dead-hook-and-utils`
> **Commit message:** `chore(operaciones): delete use-calculo-facturacion-flow, 3 hook utils, 4 unrunnable tests, and REFACTORING_SUMMARY`

#### Task 2.1: Verify zero consumers and delete `app/hooks/operaciones/use-calculo-facturacion-flow.ts`

**Slice:** 2a
**Spec reference:** `specs/cross-cutting/dead-code-purge.md#requirement-use-calculo-facturacion-flow-removal` (scenario `flow-hook-file-deleted-and-no-remaining-references`)
**File(s) affected:** `app/hooks/operaciones/use-calculo-facturacion-flow.ts` (426 LOC)
**Estimated LOC delta:** −426 / +0
**Pre-conditions:** Slice 1
**Steps:**
1. Run `grep -r "use-calculo-facturacion-flow" app/ test/` and confirm 0 matches.
2. Run `grep -rE "ejecutarFlujoCompleto|ejecutarPaso[1-5]|lanzarCalculoFacturacion|obtenerIdentificadorProceso|verificarEstadoProceso|consultarEncabezadoPrefactura|consultarCargosPrefactura" app/ test/` and confirm 0 matches outside the file itself.
3. Delete the file: `git rm app/hooks/operaciones/use-calculo-facturacion-flow.ts`.
**Acceptance criteria:**
- [ ] File no longer exists
- [ ] `grep -r "use-calculo-facturacion-flow\|ejecutarFlujoCompleto" app/ test/` returns 0 matches
- [ ] `pnpm typecheck` passes
**Dependencies:** Slice 1
**Commit message:** `chore(operaciones): delete dead use-calculo-facturacion-flow hook`
**Branch:** `refactor-operaciones-modulos/slice-2a-dead-hook-and-utils`

#### Task 2.2: Delete 3 unused hook utils

**Slice:** 2a
**Spec reference:** `specs/cross-cutting/hooks-realignment.md#requirement-utils-error-handler-deletion`, `#requirement-utils-data-combiner-deletion`, `#requirement-utils-price-validator-deletion`
**File(s) affected:** `app/hooks/operaciones/utils/{error-handler,data-combiner,price-validator}.ts` (3 files, 159 LOC total)
**Estimated LOC delta:** −159 / +0
**Pre-conditions:** Task 2.1
**Steps:**
1. Run `grep -rE "isCredentialError|handleValidationHTTPError|handleGeneralValidationError|extraerErrorMessage|combinarPrefactura|calcularTotalFacturado|validarDatosCombinados|PriceValidationResult|filtrarPreciosValidos|contarConfirmados" app/ test/` and confirm 0 matches outside the 3 files being deleted.
2. Delete the 3 files: `git rm app/hooks/operaciones/utils/{error-handler,data-combiner,price-validator}.ts`.
**Acceptance criteria:**
- [ ] All 3 files no longer exist
- [ ] `grep -rE "(isCredentialError|handleValidationHTTPError|combinarPrefactura|PriceValidationResult|filtrarPreciosValidos|extraerErrorMessage)" app/ test/` returns 0 matches
- [ ] `pnpm typecheck` passes
**Dependencies:** Task 2.1
**Commit message:** `chore(operaciones): delete 3 unused hook utils (error-handler, data-combiner, price-validator)`
**Branch:** `refactor-operaciones-modulos/slice-2a-dead-hook-and-utils`

#### Task 2.3: Delete 4 unrunnable test files

**Slice:** 2a
**Spec reference:** `specs/cross-cutting/dead-code-purge.md#requirement-dead-hook-test-files-removal` (scenario `dead-test-files-removed`)
**File(s) affected:** `app/hooks/operaciones/{use-calculo-factura,use-calculo-proceso,use-validacion-precios}.test.ts` (3 files, 472 LOC) and `app/components/operaciones/revisar-calculo-factura/revisar-calculo-factura-component.test.tsx` (1 file, 275 LOC)
**Estimated LOC delta:** −747 / +0
**Pre-conditions:** Tasks 2.1, 2.2
**Steps:**
1. The 2 hook test files for the soon-to-be-deleted hooks (`use-calculo-proceso.test.ts`, `use-validacion-precios.test.ts`) are deleted here to preserve a green build (they would fail compilation in Slice 5 if the hooks are deleted but the test files remain). The `use-calculo-factura.test.ts` is also deleted here; it is re-created in Slice 5 per `design.md` §4 Slice 5 step 2.
2. Delete the 4 files: `git rm app/hooks/operaciones/{use-calculo-factura,use-calculo-proceso,use-validacion-precios}.test.ts app/components/operaciones/revisar-calculo-factura/revisar-calculo-factura-component.test.tsx`.
**Acceptance criteria:**
- [ ] All 4 test files no longer exist
- [ ] `grep -rE "use-calculo-factura.test|use-calculo-proceso.test|use-validacion-precios.test|revisar-calculo-factura-component.test" app/ test/` returns 0 matches
- [ ] `pnpm typecheck` passes
**Dependencies:** Tasks 2.1, 2.2
**Commit message:** `chore(operaciones): delete 4 unrunnable test files`
**Branch:** `refactor-operaciones-modulos/slice-2a-dead-hook-and-utils`

#### Task 2.4: Delete `app/hooks/operaciones/REFACTORING_SUMMARY.md`

**Slice:** 2a
**Spec reference:** `design.md` §5.1 (DELETE)
**File(s) affected:** `app/hooks/operaciones/REFACTORING_SUMMARY.md`
**Estimated LOC delta:** small / +0
**Pre-conditions:** Tasks 2.1, 2.2, 2.3
**Steps:**
1. Run `grep -r "REFACTORING_SUMMARY" app/ test/` and confirm 0 matches outside the file itself.
2. Delete the file: `git rm app/hooks/operaciones/REFACTORING_SUMMARY.md`.
**Acceptance criteria:**
- [ ] File no longer exists
- [ ] `grep -r "REFACTORING_SUMMARY" app/ test/` returns 0 matches
- [ ] `pnpm typecheck` passes
**Dependencies:** Tasks 2.1, 2.2, 2.3
**Commit message:** `chore(operaciones): delete stale REFACTORING_SUMMARY.md`
**Branch:** `refactor-operaciones-modulos/slice-2a-dead-hook-and-utils`

#### Task 2.5: Verify slice-level smoke check

**Slice:** 2a
**Spec reference:** `specs/cross-cutting/dead-code-purge.md`, `specs/cross-cutting/hooks-realignment.md` (REMOVED requirements)
**File(s) affected:** none (verification only)
**Estimated LOC delta:** 0 / +0
**Pre-conditions:** Tasks 2.1–2.4
**Steps:**
1. Run `pnpm typecheck && pnpm lint && pnpm build`.
2. Re-run all the `grep` zero-import assertions from Tasks 2.1–2.4.
3. Confirm `git diff --stat app/types/operaciones.ts app/services/operacionesService.ts` is empty.
**Acceptance criteria:**
- [ ] `pnpm typecheck && pnpm lint && pnpm build` pass
- [ ] All 4 grep zero-import assertions hold
- [ ] Source-of-truth files unchanged
**Dependencies:** Tasks 2.1, 2.2, 2.3, 2.4
**Commit message:** (PR-level smoke check, no new commit)
**Branch:** `refactor-operaciones-modulos/slice-2a-dead-hook-and-utils`

#### Slice 2a summary

- **Total tasks:** 5
- **Total estimated LOC delta:** −1,474 / +0
- **Spec coverage:** `specs/cross-cutting/dead-code-purge.md` (`use-calculo-facturacion-flow-removal`, `dead-hook-test-files-removal`); `specs/cross-cutting/hooks-realignment.md` (REMOVED requirements `utils-error-handler-deletion`, `utils-data-combiner-deletion`, `utils-price-validator-deletion`)
- **Review budget fit:** **PASS** — pure deletions, no added/modified code. Reviewable in <15 min.
- **Smoke check:** `pnpm typecheck && pnpm lint && pnpm build`

---

### Slice 3 — Utils consolidation

> **Spec references:** `specs/cross-cutting/utils-consolidation.md` — `download-blob-helper-extraction`, `format-periodo-id-helper-extraction`, `cycle-helper-canonical-move`, `error-message-helper-extraction`, `months-constant-single-source`, `utils-operaciones-index-re_exports`, `formatters-dot-ts-merge-into-index` (partial)
> **Files affected:** 4 new util files, 4 new colocated tests, 1 file moved (cycle), 1 file reduced (`formatters.ts`), 1 index updated, 1 old cycle file deleted
> **Estimated LOC delta:** +318 / −67 (net +251)
> **Branch:** `refactor-operaciones-modulos/slice-3-utils-consolidation`
> **Commit message:** `refactor(operaciones): extract download/period/cycle/error helpers to utils/operaciones`

#### Task 3.1: Create `app/utils/operaciones/download.ts` with `downloadBlob` (RED test first)

**Slice:** 3
**Spec reference:** `specs/cross-cutting/utils-consolidation.md#requirement-download-blob-helper-extraction` (scenario `download-blob-single-real-site-set`)
**File(s) affected:** `app/utils/operaciones/download.ts` (NEW, ~30 LOC), `app/utils/operaciones/download.test.ts` (NEW, ~40 LOC)
**Estimated LOC delta:** +70 / +0
**Pre-conditions:** Slice 2a
**Steps:**
1. **RED**: Create `app/utils/operaciones/download.test.ts` asserting `downloadBlob(blob, 'x.csv')` creates an anchor with `download='x.csv'` and `href` starts with `'blob:'`. Use `vi.stubGlobal('URL', { createObjectURL: () => 'blob:fake', revokeObjectURL: () => undefined })` and `vi.spyOn(document, 'createElement')`. Confirm `pnpm typecheck` passes (test will not run until `test/setup.ts` is restored).
2. **GREEN**: Create `app/utils/operaciones/download.ts` exporting `downloadBlob(blob: Blob, filename: string): void` that uses `URL.createObjectURL(blob)` + an anchor with `href` + `download` + `.click()` + `URL.revokeObjectURL(href)`.
3. Add a header comment in the test file: "This test will run when test/setup.ts is restored (deferred change)."
4. Confirm `pnpm typecheck` passes.
**Acceptance criteria:**
- [ ] `app/utils/operaciones/download.ts` exports `downloadBlob`
- [ ] `app/utils/operaciones/download.test.ts` exists, is typecheck-clean
- [ ] `pnpm typecheck` passes
**Dependencies:** Slice 2a
**Commit message:** `refactor(operaciones): add downloadBlob helper and colocated test`
**Branch:** `refactor-operaciones-modulos/slice-3-utils-consolidation`

#### Task 3.2: Create `app/utils/operaciones/period.ts` with `formatPeriodoId` (RED test first)

**Slice:** 3
**Spec reference:** `specs/cross-cutting/utils-consolidation.md#requirement-format-periodo-id-helper-extraction` (scenario `format-periodo-id-replaces-all-real-sites`)
**File(s) affected:** `app/utils/operaciones/period.ts` (NEW, ~25 LOC), `app/utils/operaciones/period.test.ts` (NEW, ~50 LOC)
**Estimated LOC delta:** +75 / +0
**Pre-conditions:** Task 3.1
**Steps:**
1. **RED**: Create `app/utils/operaciones/period.test.ts` asserting `formatPeriodoId([{id:"1", descripcion:"2026-01"}])` returns `"012026"`; asserting empty array throws `EmptyPeriodoAbiertoError`.
2. **GREEN**: Create `app/utils/operaciones/period.ts` exporting the `EmptyPeriodoAbiertoError` class and `formatPeriodoId(periodoAbierto: PrepararLecturasFiltrosPeriodosResponse[]): string`. Import the response type from `~/types/operaciones`.
3. Confirm `pnpm typecheck` passes.
**Acceptance criteria:**
- [ ] `app/utils/operaciones/period.ts` exports `formatPeriodoId` and `EmptyPeriodoAbiertoError`
- [ ] `app/utils/operaciones/period.test.ts` is typecheck-clean
- [ ] `pnpm typecheck` passes
**Dependencies:** Task 3.1
**Commit message:** `refactor(operaciones): add formatPeriodoId helper and colocated test`
**Branch:** `refactor-operaciones-modulos/slice-3-utils-consolidation`

#### Task 3.3: Create `app/utils/operaciones/error.ts` with `extraerMensajeError` (RED test first)

**Slice:** 3
**Spec reference:** `specs/cross-cutting/utils-consolidation.md#requirement-error-message-helper-extraction` (scenario `error-helper-centralised`)
**File(s) affected:** `app/utils/operaciones/error.ts` (NEW, ~40 LOC), `app/utils/operaciones/error.test.ts` (NEW, ~50 LOC)
**Estimated LOC delta:** +90 / +0
**Pre-conditions:** Tasks 3.1, 3.2
**Steps:**
1. **RED**: Create `app/utils/operaciones/error.test.ts` with 3 cases per `design.md` §8.1: (a) `Error` instance returns `error.message`; (b) axios-shaped `{response: {data: {mensaje: "..."}}}` returns that mensaje; (c) non-Error value returns `String(value)`.
2. **GREEN**: Create `app/utils/operaciones/error.ts` exporting `extraerMensajeError(error: unknown): string` per the 5-branch algorithm in `design.md` §8.1.
3. Confirm `pnpm typecheck` passes.
**Acceptance criteria:**
- [ ] `app/utils/operaciones/error.ts` exports `extraerMensajeError`
- [ ] `app/utils/operaciones/error.test.ts` is typecheck-clean
- [ ] `pnpm typecheck` passes
**Dependencies:** Tasks 3.1, 3.2
**Commit message:** `refactor(operaciones): add extraerMensajeError helper and colocated test`
**Branch:** `refactor-operaciones-modulos/slice-3-utils-consolidation`

#### Task 3.4: Create `app/utils/operaciones/cycle.ts` (move from hooks) and delete the old location

**Slice:** 3
**Spec reference:** `specs/cross-cutting/utils-consolidation.md#requirement-cycle-helper-canonical-move` (scenario `cycle-helper-canonicalised`)
**File(s) affected:** `app/utils/operaciones/cycle.ts` (NEW/MOVED, ~30 LOC), `app/utils/operaciones/cycle.test.ts` (NEW, ~30 LOC); delete `app/hooks/operaciones/utils/cycle-utilities.ts`
**Estimated LOC delta:** +60 / −29 (net +31)
**Pre-conditions:** Tasks 3.1, 3.2, 3.3
**Steps:**
1. **RED**: Create `app/utils/operaciones/cycle.test.ts` asserting `convertirCicloParaAPI` handles both `string` and `number` inputs and returns the canonical string form.
2. **GREEN**: Create `app/utils/operaciones/cycle.ts` with the 4 cycle helpers (moved from `app/hooks/operaciones/utils/cycle-utilities.ts`): `convertirCicloParaAPI(ciclo: string | number): string`, `validarCicloYPeriodo(periodo: string, ciclo: string): boolean`, `extraerMesYAnio(periodo: string): { mes: number; anio: number }`, `obtenerDiaDelCiclo(ciclo: string | number): number`.
3. Delete the old `app/hooks/operaciones/utils/cycle-utilities.ts` via `git rm` (move, not copy).
4. Confirm `pnpm typecheck` passes (no consumers of the old location yet).
**Acceptance criteria:**
- [ ] `app/utils/operaciones/cycle.ts` exports the 4 cycle helpers
- [ ] `app/utils/operaciones/cycle.test.ts` is typecheck-clean
- [ ] `app/hooks/operaciones/utils/cycle-utilities.ts` no longer exists
- [ ] `pnpm typecheck` passes
**Dependencies:** Tasks 3.1, 3.2, 3.3
**Commit message:** `refactor(operaciones): move cycle helpers from hooks/utils to utils/operaciones`
**Branch:** `refactor-operaciones-modulos/slice-3-utils-consolidation`

#### Task 3.5: Update `app/utils/operaciones/index.ts` to re-export the 4 new helpers

**Slice:** 3
**Spec reference:** `specs/cross-cutting/utils-consolidation.md#requirement-utils-operaciones-index-re_exports` (scenario `utils-index-re-exports-everything-public`)
**File(s) affected:** `app/utils/operaciones/index.ts` (27 → ~50 LOC)
**Estimated LOC delta:** +23 / +0
**Pre-conditions:** Tasks 3.1, 3.2, 3.3, 3.4
**Steps:**
1. Add 4 re-export blocks: `export * from './download';`, `export * from './period';`, `export * from './cycle';`, `export * from './error';`.
2. Keep the existing re-exports of `constants`, `formatters`, `validations`. The `formatters` re-export will be removed in Slice 8 once `formatters.ts` is deleted.
3. Confirm `pnpm typecheck` passes.
**Acceptance criteria:**
- [ ] `app/utils/operaciones/index.ts` contains the 4 new re-export lines plus the existing 3
- [ ] `pnpm typecheck` passes
**Dependencies:** Tasks 3.1, 3.2, 3.3, 3.4
**Commit message:** `refactor(operaciones): update utils/operaciones index re-exports`
**Branch:** `refactor-operaciones-modulos/slice-3-utils-consolidation`

#### Task 3.6: Remove `formatPeriodLabel` and local `MONTHS` from `app/utils/operaciones/formatters.ts`

**Slice:** 3
**Spec reference:** `specs/cross-cutting/utils-consolidation.md#requirement-months-constant-single-source` (scenario `months-single-source`); `specs/cross-cutting/utils-consolidation.md#requirement-formatters-dot-ts-merge-into-index` (partial — file is reduced, not yet deleted)
**File(s) affected:** `app/utils/operaciones/formatters.ts` (68 → ~30 LOC)
**Estimated LOC delta:** +0 / −38
**Pre-conditions:** Tasks 3.1, 3.2, 3.3, 3.4, 3.5
**Steps:**
1. Open `app/utils/operaciones/formatters.ts`. Identify the local `MONTHS` map inside `formatPeriodLabel` and the function itself.
2. Remove the `formatPeriodLabel` function and its inline `MONTHS` map. (The canonical `MONTHS` lives in `app/utils/operaciones/constants.ts:2` and is re-exported from the index.)
3. Leave `formatPrice`, `formatNumber`, `formatCycle`, `formatDate` in place. The file is reduced from 68 → ~30 LOC.
4. The file is **not** deleted in this slice. It is deleted in Slice 8 (dead-code sweep) after Slices 5 and 6 update consumers.
5. Confirm `pnpm typecheck && pnpm lint` pass.
**Acceptance criteria:**
- [ ] `formatPeriodLabel` and the local `MONTHS` map are removed from `formatters.ts`
- [ ] File LOC reduced from 68 → ~30
- [ ] `grep "const MONTHS" app/utils/operaciones/formatters.ts` returns 0 matches
- [ ] `pnpm typecheck && pnpm lint` pass
**Dependencies:** Tasks 3.1, 3.2, 3.3, 3.4, 3.5
**Commit message:** `refactor(operaciones): remove formatPeriodLabel and local MONTHS from formatters.ts`
**Branch:** `refactor-operaciones-modulos/slice-3-utils-consolidation`

#### Task 3.7: Verify slice-level smoke check

**Slice:** 3
**Spec reference:** `specs/cross-cutting/utils-consolidation.md` (all ADDED requirements for this slice)
**File(s) affected:** none (verification only)
**Estimated LOC delta:** 0 / +0
**Pre-conditions:** Tasks 3.1–3.6
**Steps:**
1. Run `pnpm typecheck && pnpm lint && pnpm build`.
2. Run `grep -rE "URL.createObjectURL" app/utils/operaciones/` and confirm exactly 1 match (the new `download.ts`).
3. Run `grep -rE "const MONTHS = " app/utils/operaciones/ app/components/operaciones/` and confirm exactly 1 match (the canonical in `constants.ts`).
4. Confirm `git diff --stat app/types/operaciones.ts app/services/operacionesService.ts` is empty.
**Acceptance criteria:**
- [ ] `pnpm typecheck && pnpm lint && pnpm build` pass
- [ ] `URL.createObjectURL` lives in exactly 1 place
- [ ] `MONTHS` defined in exactly 1 place
- [ ] Source-of-truth files unchanged
**Dependencies:** Tasks 3.1, 3.2, 3.3, 3.4, 3.5, 3.6
**Commit message:** (PR-level smoke check, no new commit)
**Branch:** `refactor-operaciones-modulos/slice-3-utils-consolidation`

#### Slice 3 summary

- **Total tasks:** 7
- **Total estimated LOC delta:** +318 / −67 (net +251)
- **Spec coverage:** `specs/cross-cutting/utils-consolidation.md` — `download-blob-helper-extraction`, `format-periodo-id-helper-extraction`, `cycle-helper-canonical-move`, `error-message-helper-extraction`, `months-constant-single-source`, `utils-operaciones-index-re_exports`, partial `formatters-dot-ts-merge-into-index`
- **Review budget fit:** **PASS** — total added/modified LOC ≈ 318, under 400. Per-file diffs < 100 LOC.
- **Smoke check:** `pnpm typecheck && pnpm lint && pnpm build`

---

### Slice 4 — Routes realignment

> **Spec references:** all 10 `specs/routes/*.md` (the `*-route-thin` / `*-route-thin-wrapper` / `*-route-replaced-with-placeholder` / `*-route-placeholder` / `*-route-passes-correct-shape` / `*-route-aligns-destructure` requirements); `specs/cross-cutting/style-and-convention-sweep.md#requirement-react-default-import-removed`, `#requirement-no-empty-pattern-eslint-disable-preserved`
> **Files affected:** 10 route files in `app/routes/dashboard/operaciones/`
> **Estimated LOC delta:** −130 / +0
> **Branch:** `refactor-operaciones-modulos/slice-4-routes-realignment`
> **Commit message:** `refactor(operaciones): strip clientLoaders and phantom service calls from 10 routes`

#### Task 4.1: Realign `anular-factura-impresa.tsx` route (placeholder, remove React import)

**Slice:** 4
**Spec reference:** `specs/routes/anular-factura-impresa.md#requirement-anular-factura-route-replaced-with-placeholder`; `specs/cross-cutting/style-and-convention-sweep.md#requirement-react-default-import-removed`
**File(s) affected:** `app/routes/dashboard/operaciones/anular-factura-impresa.tsx`
**Estimated LOC delta:** −10 / +0
**Pre-conditions:** Slice 3
**Steps:**
1. Remove `import React from "react"` if present.
2. Remove the `import AnularFacturaImpresaComponent` (the component is deleted in Slice 6a; for this slice, replace with a local placeholder component that renders `<ModernHeader title="..." />` + "Funcionalidad no disponible" message).
3. Remove any `clientLoader`, `useLoaderData`, or `loaderData` usage.
4. Preserve the `/* eslint-disable no-empty-pattern */` header.
**Acceptance criteria:**
- [ ] `wc -l app/routes/dashboard/operaciones/anular-factura-impresa.tsx` shows < 40 LOC
- [ ] `grep "clientLoader\|useLoaderData\|anular-factura-impresa-component" app/routes/dashboard/operaciones/anular-factura-impresa.tsx` returns 0 matches
- [ ] The file renders a "Funcionalidad no disponible" placeholder
- [ ] `pnpm typecheck && pnpm lint` pass
**Dependencies:** Slice 3
**Commit message:** `refactor(operaciones): realign anular-factura-impresa route to placeholder`
**Branch:** `refactor-operaciones-modulos/slice-4-routes-realignment`

#### Task 4.2: Realign `cambio-medidor.tsx` route (remove clientLoader, remove React import)

**Slice:** 4
**Spec reference:** `specs/routes/cambio-medidor.md#requirement-route-file-renders-component`; `specs/cross-cutting/style-and-convention-sweep.md#requirement-react-default-import-removed`
**File(s) affected:** `app/routes/dashboard/operaciones/cambio-medidor.tsx`
**Estimated LOC delta:** −5 / +0
**Pre-conditions:** Slice 3
**Steps:**
1. Remove `import React from "react"` if present.
2. Remove any `clientLoader`, `useLoaderData`, or `loaderData` usage.
3. Keep the `import CambioMedidorComponent` (the component is rewritten in Slice 6a but still exists).
4. Preserve the eslint-disable header.
**Acceptance criteria:**
- [ ] `wc -l app/routes/dashboard/operaciones/cambio-medidor.tsx` shows < 30 LOC
- [ ] `grep "clientLoader\|useLoaderData" app/routes/dashboard/operaciones/cambio-medidor.tsx` returns 0 matches
- [ ] `pnpm typecheck && pnpm lint` pass
**Dependencies:** Slice 3
**Commit message:** `refactor(operaciones): realign cambio-medidor route to thin wrapper`
**Branch:** `refactor-operaciones-modulos/slice-4-routes-realignment`

#### Task 4.3: Realign `cerrar-lecturas.tsx` route (remove clientLoader + phantom `getCerrarLecturasData` call)

**Slice:** 4
**Spec reference:** `specs/routes/cerrar-lecturas.md#requirement-cerrar-lecturas-route-thin`; `specs/cross-cutting/style-and-convention-sweep.md#requirement-react-default-import-removed`
**File(s) affected:** `app/routes/dashboard/operaciones/cerrar-lecturas.tsx`
**Estimated LOC delta:** −10 / +0
**Pre-conditions:** Slice 3
**Steps:**
1. Remove `import React from "react"`.
2. Remove the `clientLoader` and its phantom call `operacionesService.getCerrarLecturasData()` (the method does not exist in the source of truth).
3. Remove any `useLoaderData` / `loaderData` usage.
4. Preserve the eslint-disable header.
**Acceptance criteria:**
- [ ] `grep "clientLoader\|useLoaderData\|getCerrarLecturasData" app/routes/dashboard/operaciones/cerrar-lecturas.tsx` returns 0 matches
- [ ] `pnpm typecheck && pnpm lint` pass
**Dependencies:** Slice 3
**Commit message:** `refactor(operaciones): realign cerrar-lecturas route (remove phantom clientLoader)`
**Branch:** `refactor-operaciones-modulos/slice-4-routes-realignment`

#### Task 4.4: Realign `corte-reposicion.tsx` route (remove clientLoader + phantom `getCorteReposicionData` route call)

**Slice:** 4
**Spec reference:** `specs/routes/corte-reposicion.md#requirement-route-thin-wrapper`; `specs/cross-cutting/style-and-convention-sweep.md#requirement-react-default-import-removed`
**File(s) affected:** `app/routes/dashboard/operaciones/corte-reposicion.tsx`
**Estimated LOC delta:** −15 / +0
**Pre-conditions:** Slice 3
**Steps:**
1. Remove `import React from "react"`.
2. Remove the `clientLoader` and its call `operacionesService.getCorteReposicionData()` (the method exists but returns resumen, not the list shape the route expected).
3. Remove any `useLoaderData` / `loaderData` usage.
4. Preserve the eslint-disable header.
**Acceptance criteria:**
- [ ] `grep "clientLoader\|useLoaderData\|getCorteReposicionData" app/routes/dashboard/operaciones/corte-reposicion.tsx` returns 0 matches
- [ ] `pnpm typecheck && pnpm lint` pass
**Dependencies:** Slice 3
**Commit message:** `refactor(operaciones): realign corte-reposicion route (remove phantom clientLoader)`
**Branch:** `refactor-operaciones-modulos/slice-4-routes-realignment`

#### Task 4.5: Realign `crear-archivos-sap.tsx` route (placeholder, remove React import)

**Slice:** 4
**Spec reference:** `specs/routes/crear-archivos-sap.md#requirement-crear-archivos-sap-route-placeholder`; `specs/cross-cutting/style-and-convention-sweep.md#requirement-react-default-import-removed`
**File(s) affected:** `app/routes/dashboard/operaciones/crear-archivos-sap.tsx`
**Estimated LOC delta:** −10 / +0
**Pre-conditions:** Slice 3
**Steps:**
1. Remove `import React from "react"`.
2. Replace the `import CrearArchivosSapComponent` with a local placeholder component.
3. Remove any `clientLoader`, `useLoaderData`, or `loaderData` usage.
4. Preserve the eslint-disable header.
**Acceptance criteria:**
- [ ] `wc -l app/routes/dashboard/operaciones/crear-archivos-sap.tsx` shows < 40 LOC
- [ ] `grep "clientLoader\|useLoaderData\|crear-archivos-sap-component" app/routes/dashboard/operaciones/crear-archivos-sap.tsx` returns 0 matches
- [ ] `pnpm typecheck && pnpm lint` pass
**Dependencies:** Slice 3
**Commit message:** `refactor(operaciones): realign crear-archivos-sap route to placeholder`
**Branch:** `refactor-operaciones-modulos/slice-4-routes-realignment`

#### Task 4.6: Realign `periodo-facturacion.tsx` route (remove clientLoader + phantom `getPeriodoFacturacionData` call)

**Slice:** 4
**Spec reference:** `specs/routes/periodo-facturacion.md#requirement-route-thin-wrapper`; `specs/cross-cutting/style-and-convention-sweep.md#requirement-react-default-import-removed`
**File(s) affected:** `app/routes/dashboard/operaciones/periodo-facturacion.tsx`
**Estimated LOC delta:** −10 / +0
**Pre-conditions:** Slice 3
**Steps:**
1. Remove `import React from "react"`.
2. Remove the `clientLoader` and its call `operacionesService.getPeriodoFacturacionData()` (the method exists at `app/services/operacionesService.ts:48-73` but returns a different shape; the route is misusing it).
3. Remove any `useLoaderData` / `loaderData` usage.
4. Preserve the eslint-disable header.
**Acceptance criteria:**
- [ ] `grep "clientLoader\|useLoaderData\|getPeriodoFacturacionData" app/routes/dashboard/operaciones/periodo-facturacion.tsx` returns 0 matches
- [ ] `pnpm typecheck && pnpm lint` pass
**Dependencies:** Slice 3
**Commit message:** `refactor(operaciones): realign periodo-facturacion route (remove phantom clientLoader)`
**Branch:** `refactor-operaciones-modulos/slice-4-routes-realignment`

#### Task 4.7: Realign `precios-cargo.tsx` route (fix `{tablaEnel, tablaAgualova}` destructure)

**Slice:** 4
**Spec reference:** `specs/routes/precios-cargo.md#requirement-precios-cargo-route-aligns-destructure`; `#requirement-route-thin-wrapper-or-data-passer`; `specs/cross-cutting/style-and-convention-sweep.md#requirement-react-default-import-removed`
**File(s) affected:** `app/routes/dashboard/operaciones/precios-cargo.tsx`
**Estimated LOC delta:** −5 / +0
**Pre-conditions:** Slice 3
**Steps:**
1. Remove `import React from "react"`.
2. Fix the destructure: replace `const {tablaEnel, tablaAgualova} = result.data` with `const precios: PreciosConsultarRequest[] = result.data ?? []` (the source-of-truth method `getPreciosCargoData` returns a flat array, not an object).
3. Either keep the `clientLoader` (now correctly destructuring the flat array) or remove it and let the component fetch on mount. Recommended: keep the loader.
4. Preserve the eslint-disable header.
**Acceptance criteria:**
- [ ] `grep -rE "\b(tablaEnel|tablaAgualova)\b" app/routes/dashboard/operaciones/precios-cargo.tsx` returns 0 matches
- [ ] The route passes a `PreciosConsultarRequest[]` (flat array) to the component
- [ ] `pnpm typecheck && pnpm lint` pass
**Dependencies:** Slice 3
**Commit message:** `refactor(operaciones): fix precios-cargo route destructure (flat array shape)`
**Branch:** `refactor-operaciones-modulos/slice-4-routes-realignment`

#### Task 4.8: Realign `preparar-lecturas.tsx` route (remove clientLoader + phantom `getAsignacionSectores` call)

**Slice:** 4
**Spec reference:** `specs/routes/preparar-lecturas.md#requirement-preparar-lecturas-route-thin`; `specs/cross-cutting/style-and-convention-sweep.md#requirement-react-default-import-removed`
**File(s) affected:** `app/routes/dashboard/operaciones/preparar-lecturas.tsx`
**Estimated LOC delta:** −25 / +0
**Pre-conditions:** Slice 3
**Steps:**
1. Remove `import React from "react"`.
2. Remove the `clientLoader` and its call `operacionesService.getAsignacionSectores(ciclo, periodo)` (the method does not exist in the source of truth).
3. Remove any `useLoaderData` / `loaderData` usage, including the `useState<ConsultarAsignacionSectores[]>([])` state and the reload callback.
4. Preserve the eslint-disable header.
**Acceptance criteria:**
- [ ] `grep "clientLoader\|useLoaderData\|getAsignacionSectores\|ConsultarAsignacionSectores" app/routes/dashboard/operaciones/preparar-lecturas.tsx` returns 0 matches
- [ ] `pnpm typecheck && pnpm lint` pass
**Dependencies:** Slice 3
**Commit message:** `refactor(operaciones): realign preparar-lecturas route (remove phantom clientLoader)`
**Branch:** `refactor-operaciones-modulos/slice-4-routes-realignment`

#### Task 4.9: Realign `revisar-calculo-factura.tsx` route (remove clientLoader + phantom `verificarEstadoCierreLecturas` call)

**Slice:** 4
**Spec reference:** `specs/routes/revisar-calculo-factura.md#requirement-revisar-calculo-factura-route-thin`; `specs/cross-cutting/style-and-convention-sweep.md#requirement-react-default-import-removed`
**File(s) affected:** `app/routes/dashboard/operaciones/revisar-calculo-factura.tsx`
**Estimated LOC delta:** −10 / +0
**Pre-conditions:** Slice 3
**Steps:**
1. Remove `import React from "react"`.
2. Remove the `clientLoader` and its call `operacionesService.verificarEstadoCierreLecturas(cicloId, periodo)` (the method does not exist in the source of truth).
3. Remove any `useLoaderData` / `loaderData` usage.
4. Preserve the eslint-disable header.
**Acceptance criteria:**
- [ ] `grep -rE "verificarEstadoCierreLecturas" app/` returns 0 matches
- [ ] `grep "clientLoader\|useLoaderData" app/routes/dashboard/operaciones/revisar-calculo-factura.tsx` returns 0 matches
- [ ] `pnpm typecheck && pnpm lint` pass
**Dependencies:** Slice 3
**Commit message:** `refactor(operaciones): realign revisar-calculo-factura route (remove phantom clientLoader)`
**Branch:** `refactor-operaciones-modulos/slice-4-routes-realignment`

#### Task 4.10: Realign `revisar-precio.tsx` route (remove clientLoader + 2 phantom calls)

**Slice:** 4
**Spec reference:** `specs/routes/revisar-precio.md#requirement-revisar-precio-route-thin`; `specs/cross-cutting/style-and-convention-sweep.md#requirement-react-default-import-removed`
**File(s) affected:** `app/routes/dashboard/operaciones/revisar-precio.tsx`
**Estimated LOC delta:** −30 / +0
**Pre-conditions:** Slice 3
**Steps:**
1. Remove `import React from "react"`.
2. Remove the `clientLoader` and its 2 calls: `operacionesService.getRevisarPrecioData(dia)` and `operacionesService.getPreciosPorCiclo(mes, anio, dia)` (neither exists in the source of truth).
3. Remove any `useLoaderData` / `loaderData` usage, including the `useState<>` and reload callback.
4. Preserve the eslint-disable header.
**Acceptance criteria:**
- [ ] `grep -rE "getRevisarPrecioData|getPreciosPorCiclo" app/` returns 0 matches
- [ ] `grep "clientLoader\|useLoaderData" app/routes/dashboard/operaciones/revisar-precio.tsx` returns 0 matches
- [ ] `pnpm typecheck && pnpm lint` pass
**Dependencies:** Slice 3
**Commit message:** `refactor(operaciones): realign revisar-precio route (remove 2 phantom clientLoaders)`
**Branch:** `refactor-operaciones-modulos/slice-4-routes-realignment`

#### Task 4.11: Verify slice-level smoke check

**Slice:** 4
**Spec reference:** all 10 `specs/routes/*.md` (`*-route-thin` requirements)
**File(s) affected:** none (verification only)
**Estimated LOC delta:** 0 / +0
**Pre-conditions:** Tasks 4.1–4.10
**Steps:**
1. Run `pnpm typecheck && pnpm lint && pnpm build`.
2. Run `grep -rE "clientLoader|useLoaderData" app/routes/dashboard/operaciones/` and confirm 0 matches.
3. Run `grep -rE "^import React from ['\"]react['\"]" app/routes/dashboard/operaciones/` and confirm 0 matches.
4. Run `head -1 app/routes/dashboard/operaciones/*.tsx` and confirm the eslint-disable comment is preserved.
5. Confirm `git diff --stat app/types/operaciones.ts app/services/operacionesService.ts` is empty.
**Acceptance criteria:**
- [ ] `pnpm typecheck && pnpm lint && pnpm build` pass
- [ ] No `clientLoader` / `useLoaderData` / `import React` in any route file
- [ ] All 10 route files have the eslint-disable header
- [ ] Source-of-truth files unchanged
**Dependencies:** Tasks 4.1–4.10
**Commit message:** (PR-level smoke check, no new commit)
**Branch:** `refactor-operaciones-modulos/slice-4-routes-realignment`

#### Slice 4 summary

- **Total tasks:** 11
- **Total estimated LOC delta:** −130 / +0
- **Spec coverage:** all 10 `specs/routes/*.md` (`*-route-thin` requirements); partial `specs/cross-cutting/style-and-convention-sweep.md#requirement-react-default-import-removed`; `#requirement-no-empty-pattern-eslint-disable-preserved`
- **Review budget fit:** **PASS** — net −130 LOC across 10 files; per-file delta < 30 LOC
- **Smoke check:** `pnpm typecheck && pnpm lint && pnpm build`

---

### Slice 5 — Hooks realignment

> **Spec references:** `specs/cross-cutting/hooks-realignment.md#requirement-use-calculo-factura-rewrite`, `#requirement-use-calculo-proceso-removal`, `#requirement-use-validacion-precios-removal`; `specs/cross-cutting/style-and-convention-sweep.md#requirement-hook-error-sentinel-replaced`; `specs/routes/revisar-calculo-factura.md#requirement-revisar-calculo-factura-component-calls-service-directly` (call-site changes only)
> **Files affected:** 1 hook rewritten, 2 hooks deleted, 1 consumer file partially updated (call-site changes only — full type realignment in Slice 6e), 1 colocated test re-created
> **Estimated LOC delta:** +110 / −322 (net −212)
> **Branch:** `refactor-operaciones-modulos/slice-5-hooks-realignment`
> **Commit message:** `refactor(operaciones): rewrite useCalculoFactura and delete useCalculoProceso/useValidacionPrecios`

#### Task 5.1: RED test for rewritten `use-calculo-factura.ts`

**Slice:** 5
**Spec reference:** `specs/cross-cutting/hooks-realignment.md#requirement-use-calculo-factura-rewrite` (scenario `rewritten-hook-calls-service-and-uses-useMemo` — 3 sub-scenarios)
**File(s) affected:** `app/hooks/operaciones/use-calculo-factura.test.ts` (NEW, ~80 LOC)
**Estimated LOC delta:** +80 / +0
**Pre-conditions:** Slice 3 (the new `extraerMensajeError` is available), Slice 4 (the route is thin)
**Steps:**
1. Create `app/hooks/operaciones/use-calculo-factura.test.ts` with 3 scenarios per `design.md` §6.2:
   - (a) **Success**: `vi.mock` `operacionesService.getRevisarCalculosBuscarPrefacturas` to return a success envelope; invoke `useCalculoFactura({periodoFormateado: "012026", cicloId: 1})`; assert `result.current.data` is the array, `result.current.error === null`, `result.current.estadoCierre === 'cerrado'`.
   - (b) **404 → estadoCierre = 'no-cerrado'**: mock the service to throw an axios-shaped error with `response.status === 404`; assert `result.current.estadoCierre === 'no-cerrado'`, `result.current.error` is a non-empty Spanish string.
   - (c) **Other error → non-empty error string**: mock to throw a generic error; assert `result.current.error` is the `extraerMensajeError` extraction.
2. Use `@testing-library/react` `renderHook` + `vi.mock('~/services/operacionesService', ...)`. Add a header comment: "This test will run when test/setup.ts is restored (deferred change)."
3. Confirm `pnpm typecheck` passes.
**Acceptance criteria:**
- [ ] `app/hooks/operaciones/use-calculo-factura.test.ts` exists, is typecheck-clean
- [ ] Test file header documents the deferral
- [ ] `pnpm typecheck` passes
**Dependencies:** Slice 3, Slice 4
**Commit message:** `test(operaciones): add colocated test for useCalculoFactura (3 scenarios)`
**Branch:** `refactor-operaciones-modulos/slice-5-hooks-realignment`

#### Task 5.2: GREEN rewrite of `app/hooks/operaciones/use-calculo-factura.ts`

**Slice:** 5
**Spec reference:** `specs/cross-cutting/hooks-realignment.md#requirement-use-calculo-factura-rewrite`; `specs/cross-cutting/style-and-convention-sweep.md#requirement-hook-error-sentinel-replaced`
**File(s) affected:** `app/hooks/operaciones/use-calculo-factura.ts` (144 → ~80 LOC)
**Estimated LOC delta:** +0 / −64 (net)
**Pre-conditions:** Task 5.1
**Steps:**
1. Replace the 2 `api.get('/calculo-prefactura-encabezado')` + `api.get('/calculo-prefactura-cargos')` calls with a single call to `operacionesService.getRevisarCalculosBuscarPrefacturas(cicloId, periodoId, ...)` (declared at `app/services/operacionesService.ts:561-594`).
2. Drop the phantom type imports `CalculoPrefacturaCompleto`, `CalculoPrefacturaDetalle`, `CalculoPrefacturaCargoResponse` (none in source of truth).
3. Declare an inline `type CalculoPrefacturaRow = { id: number; contratoId: number; rutCliente: string; nombreCliente: string; sector: string; local: string; totalCargos: number; totalCalculado: number; cargos: Array<{ codigoCargo: number; descripcion: string; valor: number; }>; }` in the file (per `design.md` §2.2 example 3).
4. Replace the magic sentinel `error: 'NO_LECTURAS_CERRADAS'` with a discriminated `estadoCierre: 'cerrado' | 'no-cerrado' | 'cargando'` field (per `style-and-convention-sweep.md#requirement-hook-error-sentinel-replaced`).
5. Replace the `useEffect`+`setFilteredData` anti-pattern with a `useMemo` derivation of `filteredData` from `data + searchTerm` (per `react-best-practices` skill rule `rerender-derived-state-no-effect`).
6. Use `extraerMensajeError(error: unknown): string` from `~/utils/operaciones` (per Task 3.3) for the `error` field.
7. Return `{ data, filteredData, isLoading, error, estadoCierre, searchTerm, setSearchTerm, refetch }`.
8. Confirm `pnpm typecheck` passes.
**Acceptance criteria:**
- [ ] `grep "CalculoPrefactura" app/hooks/operaciones/use-calculo-factura.ts` shows only the `CalculoPrefacturaRow` inline alias declaration
- [ ] `grep "NO_LECTURAS_CERRADAS" app/` returns 0 matches
- [ ] The hook calls `operacionesService.getRevisarCalculosBuscarPrefacturas` exactly once
- [ ] `setFilteredData` does not exist anywhere in the file
- [ ] `pnpm typecheck` passes
**Dependencies:** Task 5.1
**Commit message:** `refactor(operaciones): rewrite useCalculoFactura to use source-of-truth service`
**Branch:** `refactor-operaciones-modulos/slice-5-hooks-realignment`

#### Task 5.3: Update `revisar-calculo-factura-component.tsx` to call service methods directly (call-site changes only)

**Slice:** 5
**Spec reference:** `specs/routes/revisar-calculo-factura.md#requirement-revisar-calculo-factura-component-calls-service-directly`; `specs/cross-cutting/hooks-realignment.md#requirement-use-calculo-proceso-removal`, `#requirement-use-validacion-precios-removal`
**File(s) affected:** `app/components/operaciones/revisar-calculo-factura/revisar-calculo-factura-component.tsx` (call-site changes only; full type realignment is in Slice 6e Task 6e.9)
**Estimated LOC delta:** +30 / −30
**Pre-conditions:** Task 5.2
**Steps:**
1. Remove `import { useCalculoProceso } from '~/hooks/operaciones/use-calculo-proceso';` and `import { useValidacionPrecios } from '~/hooks/operaciones/use-validacion-precios';` (both will be deleted in Tasks 5.4 + 5.5).
2. Replace the `useCalculoProceso` hook call with direct `operacionesService.postRevisarCalculosLanzarCalculo(req)` and `operacionesService.postRevisarCalculosAceptar(periodoId)` calls inside the `handleLanzarCalculo` + `handleAceptarCalculo` event handlers. Type the request as `RevisarCalculosLanzarCalculoRequest`.
3. Replace the `useValidacionPrecios` hook call with a `useState` + `useEffect` that calls `operacionesService.gerRevisarPreciosData(mes, anio)` (typo preserved) once, then a `useMemo` that derives `{confirmados, pendientes, total}` from the result (3 separate `useState<number>` are removed).
4. Note: the phantom type imports (`Ciclo`, `PeriodoAbierto`, `CalculoPrefactura*`) remain in this slice — they are removed in Slice 6e. The `CalculoPrefacturaRow` inline type is added in Slice 6e. This slice only changes the hook call sites.
5. Confirm `pnpm typecheck` passes (the deleted hooks in Tasks 5.4 + 5.5 are removed AFTER this task, so this commit must land first or together with 5.4/5.5).
**Acceptance criteria:**
- [ ] `grep "useCalculoProceso\|useValidacionPrecios" app/components/operaciones/revisar-calculo-factura/revisar-calculo-factura-component.tsx` returns 0 matches
- [ ] The component calls `operacionesService.postRevisarCalculosLanzarCalculo`, `postRevisarCalculosAceptar`, and `gerRevisarPreciosData` directly
- [ ] Totals are derived via `useMemo`, not 3 separate `useState<number>`
- [ ] `pnpm typecheck` passes
**Dependencies:** Task 5.2
**Commit message:** `refactor(operaciones): update revisar-calculo-factura to call service directly`
**Branch:** `refactor-operaciones-modulos/slice-5-hooks-realignment`

#### Task 5.4: Delete `app/hooks/operaciones/use-calculo-proceso.ts`

**Slice:** 5
**Spec reference:** `specs/cross-cutting/hooks-realignment.md#requirement-use-calculo-proceso-removal` (scenario `hook-deleted-component-calls-service`)
**File(s) affected:** `app/hooks/operaciones/use-calculo-proceso.ts` (115 LOC)
**Estimated LOC delta:** −115 / +0
**Pre-conditions:** Task 5.3
**Steps:**
1. Run `grep -r "useCalculoProceso" app/ test/` and confirm 0 matches outside the file itself.
2. Delete the file: `git rm app/hooks/operaciones/use-calculo-proceso.ts`.
3. Confirm `pnpm typecheck` passes.
**Acceptance criteria:**
- [ ] File no longer exists
- [ ] `grep -r "useCalculoProceso" app/ test/` returns 0 matches
- [ ] `pnpm typecheck` passes
**Dependencies:** Task 5.3
**Commit message:** `chore(operaciones): delete useCalculoProceso hook (replaced by direct service calls)`
**Branch:** `refactor-operaciones-modulos/slice-5-hooks-realignment`

#### Task 5.5: Delete `app/hooks/operaciones/use-validacion-precios.ts`

**Slice:** 5
**Spec reference:** `specs/cross-cutting/hooks-realignment.md#requirement-use-validacion-precios-removal` (scenario `hook-deleted-component-calls-gerrevisar`)
**File(s) affected:** `app/hooks/operaciones/use-validacion-precios.ts` (113 LOC)
**Estimated LOC delta:** −113 / +0
**Pre-conditions:** Task 5.3
**Steps:**
1. Run `grep -rE "useValidacionPrecios" app/ test/` and confirm 0 matches outside the file itself (the `RevisarPrecioUno`/`Dos` grep is partial — full removal happens in Slice 6e).
2. Delete the file: `git rm app/hooks/operaciones/use-validacion-precios.ts`.
3. Confirm `pnpm typecheck` passes.
**Acceptance criteria:**
- [ ] File no longer exists
- [ ] `grep -r "useValidacionPrecios" app/ test/` returns 0 matches
- [ ] `pnpm typecheck` passes
**Dependencies:** Task 5.3
**Commit message:** `chore(operaciones): delete useValidacionPrecios hook (replaced by gerRevisarPreciosData + useMemo)`
**Branch:** `refactor-operaciones-modulos/slice-5-hooks-realignment`

#### Task 5.6: Verify slice-level smoke check

**Slice:** 5
**Spec reference:** `specs/cross-cutting/hooks-realignment.md`; `specs/cross-cutting/style-and-convention-sweep.md#requirement-hook-error-sentinel-replaced`
**File(s) affected:** none (verification only)
**Estimated LOC delta:** 0 / +0
**Pre-conditions:** Tasks 5.1–5.5
**Steps:**
1. Run `pnpm typecheck && pnpm lint && pnpm build`.
2. Run `grep -rE "useCalculoProceso|useValidacionPrecios|NO_LECTURAS_CERRADAS" app/ test/` and confirm 0 matches.
3. Confirm `git diff --stat app/types/operaciones.ts app/services/operacionesService.ts` is empty.
**Acceptance criteria:**
- [ ] `pnpm typecheck && pnpm lint && pnpm build` pass
- [ ] No `useCalculoProceso`, `useValidacionPrecios`, or `NO_LECTURAS_CERRADAS` in the codebase
- [ ] Source-of-truth files unchanged
**Dependencies:** Tasks 5.1, 5.2, 5.3, 5.4, 5.5
**Commit message:** (PR-level smoke check, no new commit)
**Branch:** `refactor-operaciones-modulos/slice-5-hooks-realignment`

#### Slice 5 summary

- **Total tasks:** 6
- **Total estimated LOC delta:** +110 / −322 (net −212)
- **Spec coverage:** `specs/cross-cutting/hooks-realignment.md` (MODIFIED requirements); `specs/cross-cutting/style-and-convention-sweep.md#requirement-hook-error-sentinel-replaced`; partial `specs/routes/revisar-calculo-factura.md#requirement-revisar-calculo-factura-component-calls-service-directly` (call-site changes only)
- **Review budget fit:** **PASS** — net −212 LOC; positive added LOC (the test file + consumer call-site changes) ≈ 110, well under 400
- **Smoke check:** `pnpm typecheck && pnpm lint && pnpm build`

---
---

### Slice 6a — anular-factura + cambio-medidor + crear-archivos-sap

> **Spec references:** `specs/routes/anular-factura-impresa.md` (REMOVED), `specs/routes/crear-archivos-sap.md` (REMOVED), `specs/routes/cambio-medidor.md` (MODIFIED); `specs/cross-cutting/components-realignment.md`
> **Files affected:** 2 component subdirectories deleted, 1 main component rewritten + 8 sub-components updated, 1 colocated test created
> **Estimated LOC delta:** +80 / −682 (net −602)
> **Branch:** `refactor-operaciones-modulos/slice-6a-anular-cambio-crear`
> **Commit message:** `refactor(operaciones): realign cambio-medidor; delete anular-factura and crear-archivos-sap`

#### Task 6a.1: Delete `app/components/operaciones/anular-factura-impresa/` directory

**Slice:** 6a
**Spec reference:** `specs/routes/anular-factura-impresa.md#requirement-anular-factura-component-deletion` (scenario `component-file-deleted`)
**File(s) affected:** `app/components/operaciones/anular-factura-impresa/anular-factura-impresa-component.tsx` (284 LOC)
**Estimated LOC delta:** −284 / +0
**Pre-conditions:** Slice 4 (the route is already a placeholder per Task 4.1)
**Steps:**
1. Run `grep -r "anular-factura-impresa-component" app/ test/` and confirm 0 matches outside the file itself and `openspec/changes/refactor-operaciones-modulos/explore.md`.
2. Delete the directory: `git rm -r app/components/operaciones/anular-factura-impresa/`.
3. Confirm `pnpm typecheck` passes (the route is a placeholder per Task 4.1).
**Acceptance criteria:**
- [ ] Directory no longer exists
- [ ] `grep -r "anular-factura-impresa-component" app/ test/` returns 0 matches
- [ ] `pnpm typecheck` passes
**Dependencies:** Slice 4
**Commit message:** `chore(operaciones): delete anular-factura-impresa component directory`
**Branch:** `refactor-operaciones-modulos/slice-6a-anular-cambio-crear`

#### Task 6a.2: Delete `app/components/operaciones/crear-archivos-sap/` directory

**Slice:** 6a
**Spec reference:** `specs/routes/crear-archivos-sap.md#requirement-crear-archivos-sap-component-deletion` (scenario `component-file-deleted`)
**File(s) affected:** `app/components/operaciones/crear-archivos-sap/crear-archivos-sap-component.tsx` (258 LOC)
**Estimated LOC delta:** −258 / +0
**Pre-conditions:** Slice 4 (the route is already a placeholder per Task 4.5)
**Steps:**
1. Run `grep -r "crear-archivos-sap-component" app/ test/` and confirm 0 matches outside the file itself.
2. Delete the directory: `git rm -r app/components/operaciones/crear-archivos-sap/`.
3. Confirm `pnpm typecheck` passes.
**Acceptance criteria:**
- [ ] Directory no longer exists
- [ ] `grep -r "crear-archivos-sap-component" app/ test/` returns 0 matches
- [ ] `pnpm typecheck` passes
**Dependencies:** Slice 4
**Commit message:** `chore(operaciones): delete crear-archivos-sap component directory`
**Branch:** `refactor-operaciones-modulos/slice-6a-anular-cambio-crear`

#### Task 6a.3: Rewrite `cambio-medidor-component.tsx` to use source-of-truth service methods

**Slice:** 6a
**Spec reference:** `specs/routes/cambio-medidor.md#requirement-cambio-medidor-component-realigns-service-calls`; `#requirement-phantom-type-imports-replaced`; `specs/cross-cutting/components-realignment.md#requirement-phantom-type-imports-forbidden`, `#requirement-phantom-service-calls-forbidden`
**File(s) affected:** `app/components/operaciones/cambio-medidor/cambio-medidor-component.tsx` (842 → ~700 LOC)
**Estimated LOC delta:** +0 / −142
**Pre-conditions:** Tasks 6a.1, 6a.2
**Steps:**
1. Drop the 5 phantom type imports: `ConsultaMedidorAntiguoResponse`, `ConsultaMedidorNuevoResponse`, `DetalleMedidorAntiguo`, `DetalleMedidorNuevo`, `MedidorAntiguo`, `MedidorNuevo` (none in source of truth).
2. Add source-of-truth type imports: `CambioMedidorBuscarAntiguoRequest`, `CambioMedidorBuscarNuevoRequest`, `CambioMedidorEjecutarCambioRequest` from `~/types/operaciones`.
3. Replace the 2 `api.get('/consulta-medidor-antiguo')` and `api.get('/consulta-medidor-nuevo')` direct calls with `operacionesService.getBuscarMedidorAntiguo(acometida, numeroSerie)` and `operacionesService.getBuscarMedidorNuevo(serie)` (declared at `app/services/operacionesService.ts:616-659`).
4. Use `operacionesService.postEjecutarCambioMedidor(req)` for the final submission; type the request as `CambioMedidorEjecutarCambioRequest`.
5. Inline any remaining sub-component prop types as `type X = { ... }` inside this file.
6. Confirm `pnpm typecheck` passes.
**Acceptance criteria:**
- [ ] `grep -rE "ConsultaMedidorAntiguoResponse|ConsultaMedidorNuevoResponse|DetalleMedidorAntiguo|DetalleMedidorNuevo|MedidorAntiguo|MedidorNuevo" app/components/operaciones/cambio-medidor/` returns 0 matches
- [ ] `grep -rE "api\\.(get|post)\\(['\"]/" app/components/operaciones/cambio-medidor/` returns 0 matches
- [ ] The file imports `getBuscarMedidorAntiguo`, `getBuscarMedidorNuevo`, `postEjecutarCambioMedidor` from `~/services/operacionesService`
- [ ] `pnpm typecheck` passes
**Dependencies:** Tasks 6a.1, 6a.2
**Commit message:** `refactor(operaciones): realign cambio-medidor-component to source-of-truth service`
**Branch:** `refactor-operaciones-modulos/slice-6a-anular-cambio-crear`

#### Task 6a.4: Update 8 sub-components of `cambio-medidor/` to inline prop types

**Slice:** 6a
**Spec reference:** `specs/routes/cambio-medidor.md#requirement-subcomponent-prop-types-inlined`; `#requirement-phantom-type-imports-replaced`
**File(s) affected:** `antiguo-medidor-form.tsx`, `detalle-medidor-antiguo.tsx`, `detalle-medidor-nuevo.tsx`, `medidor-field.tsx`, `medidor-fields-group.tsx`, `nuevo-contrato-form.tsx`, `nuevo-medidor-form.tsx`, `collapsible-header.tsx` (8 files)
**Estimated LOC delta:** +0 / −40
**Pre-conditions:** Task 6a.3
**Steps:**
1. For each of the 8 sub-component files, drop any `import { AntiguoMedidorFormProps, ... }` from phantom locations.
2. Declare the prop type inline as `type XProps = { ... }` at the top of the file.
3. Drop any phantom type imports used in the prop type definition.
4. Confirm `pnpm typecheck` passes.
**Acceptance criteria:**
- [ ] `grep -rE "AntiguoMedidorFormProps|NuevoMedidorFormProps|NuevoContratoFormProps|DetalleMedidorAntiguoProps|DetalleMedidorNuevoProps" app/components/operaciones/cambio-medidor/` returns 0 matches
- [ ] Each sub-component file contains exactly one inline `type XProps` declaration matching its exports
- [ ] `pnpm typecheck` passes
**Dependencies:** Task 6a.3
**Commit message:** `refactor(operaciones): inline prop types in 8 cambio-medidor sub-components`
**Branch:** `refactor-operaciones-modulos/slice-6a-anular-cambio-crear`

#### Task 6a.5: Create `cambio-medidor-component.test.tsx` colocated test

**Slice:** 6a
**Spec reference:** `specs/routes/cambio-medidor.md#requirement-cambio-medidor-component-realigns-service-calls`; `specs/cross-cutting/components-realignment.md`
**File(s) affected:** `app/components/operaciones/cambio-medidor/cambio-medidor-component.test.tsx` (NEW, ~80 LOC)
**Estimated LOC delta:** +80 / +0
**Pre-conditions:** Tasks 6a.3, 6a.4
**Steps:**
1. Create the colocated test per `design.md` §6.2 Slice 6a. Use `@testing-library/react` `render` + `vi.mock('~/services/operacionesService', ...)`.
2. Assert that submitting the form calls `postEjecutarCambioMedidor` with an object matching `CambioMedidorEjecutarCambioRequest = {idMedidorAntiguo, acometida, ultimaLecturaAntiguo, lecturaFinalAntiguo, fechaCambio, idMedidorNuevo, primeraLecturaNuevo, nuevoContratoId}`.
3. Add a header comment documenting the `test/setup.ts` deferral.
4. Confirm `pnpm typecheck` passes.
**Acceptance criteria:**
- [ ] `app/components/operaciones/cambio-medidor/cambio-medidor-component.test.tsx` exists, is typecheck-clean
- [ ] Test file header documents the deferral
- [ ] `pnpm typecheck` passes
**Dependencies:** Tasks 6a.3, 6a.4
**Commit message:** `test(operaciones): add colocated test for cambio-medidor-component`
**Branch:** `refactor-operaciones-modulos/slice-6a-anular-cambio-crear`

#### Task 6a.6: Verify slice-level smoke check

**Slice:** 6a
**Spec reference:** `specs/routes/anular-factura-impresa.md` (REMOVED), `specs/routes/crear-archivos-sap.md` (REMOVED), `specs/routes/cambio-medidor.md` (MODIFIED)
**File(s) affected:** none (verification only)
**Estimated LOC delta:** 0 / +0
**Pre-conditions:** Tasks 6a.1–6a.5
**Steps:**
1. Run `pnpm typecheck && pnpm lint && pnpm build`.
2. Run `grep -rE "ConsultaMedidorAntiguoResponse|ConsultaMedidorNuevoResponse|DetalleMedidorAntiguo|DetalleMedidorNuevo|MedidorAntiguo|MedidorNuevo" app/` and confirm 0 matches.
3. Run `grep -rE "api\\.(get|post)\\(['\"]/" app/components/operaciones/cambio-medidor/` and confirm 0 matches.
4. Confirm `git diff --stat app/types/operaciones.ts app/services/operacionesService.ts` is empty.
**Acceptance criteria:**
- [ ] `pnpm typecheck && pnpm lint && pnpm build` pass
- [ ] No phantom types or hardcoded URL calls in cambio-medidor
- [ ] Source-of-truth files unchanged
**Dependencies:** Tasks 6a.1, 6a.2, 6a.3, 6a.4, 6a.5
**Commit message:** (PR-level smoke check, no new commit)
**Branch:** `refactor-operaciones-modulos/slice-6a-anular-cambio-crear`

#### Slice 6a summary

- **Total tasks:** 6
- **Total estimated LOC delta:** +80 / −682 (net −602)
- **Spec coverage:** `specs/routes/anular-factura-impresa.md` (REMOVED), `specs/routes/crear-archivos-sap.md` (REMOVED), `specs/routes/cambio-medidor.md` (MODIFIED); `specs/cross-cutting/components-realignment.md`
- **Review budget fit:** **PASS** — positive added LOC: 80 (the new test file). The −602 net is mostly deletions.
- **Smoke check:** `pnpm typecheck && pnpm lint && pnpm build`

---

### Slice 6b — cerrar-lecturas

> **Spec references:** `specs/routes/cerrar-lecturas.md` (MODIFIED); `specs/cross-cutting/utils-consolidation.md#requirement-cycle-helper-canonical-move`
> **Files affected:** 2 files deleted, 1 main component rewritten, 1 columns file updated, 1 dialog minor update
> **Estimated LOC delta:** +30 / −982 (net −952)
> **Branch:** `refactor-operaciones-modulos/slice-6b-cerrar-lecturas`
> **Commit message:** `refactor(operaciones): realign cerrar-lecturas to source-of-truth service`

#### Task 6b.1: Delete `alert-cerrar-lecturas.tsx`

**Slice:** 6b
**Spec reference:** `specs/routes/cerrar-lecturas.md#requirement-alert-cerrar-lecturas-subcomponent-deletion` (scenario `alert-file-deleted`)
**File(s) affected:** `app/components/operaciones/cerrar-lecturas/alert-cerrar-lecturas.tsx` (239 LOC)
**Estimated LOC delta:** −239 / +0
**Pre-conditions:** Slice 3
**Steps:**
1. Run `grep -r "alert-cerrar-lecturas" app/ test/` and confirm 0 matches outside the file itself and `openspec/changes/refactor-operaciones-modulos/explore.md`.
2. Delete the file: `git rm app/components/operaciones/cerrar-lecturas/alert-cerrar-lecturas.tsx`.
3. Confirm `pnpm typecheck` passes (verified after Task 6b.3 updates the main component to drop the import).
**Acceptance criteria:**
- [ ] File no longer exists
- [ ] `grep -r "alert-cerrar-lecturas" app/ test/` returns 0 matches
- [ ] `pnpm typecheck` passes
**Dependencies:** Slice 3
**Commit message:** `chore(operaciones): delete alert-cerrar-lecturas (phantom endpoint)`
**Branch:** `refactor-operaciones-modulos/slice-6b-cerrar-lecturas`

#### Task 6b.2: Delete `data-table-virtualized.tsx`

**Slice:** 6b
**Spec reference:** `specs/routes/cerrar-lecturas.md#requirement-data-table-virtualized-deletion` (scenario `virtualized-table-deleted`)
**File(s) affected:** `app/components/operaciones/cerrar-lecturas/data-table-virtualized.tsx` (179 LOC)
**Estimated LOC delta:** −179 / +0
**Pre-conditions:** Slice 3
**Steps:**
1. Run `grep -r "cerrar-lecturas/data-table-virtualized" app/ test/` and confirm 0 matches outside the file itself.
2. Delete the file: `git rm app/components/operaciones/cerrar-lecturas/data-table-virtualized.tsx`.
**Acceptance criteria:**
- [ ] File no longer exists
- [ ] `grep -r "cerrar-lecturas/data-table-virtualized" app/ test/` returns 0 matches
- [ ] `pnpm typecheck` passes
**Dependencies:** Slice 3
**Commit message:** `chore(operaciones): delete cerrar-lecturas data-table-virtualized`
**Branch:** `refactor-operaciones-modulos/slice-6b-cerrar-lecturas`

#### Task 6b.3: Rewrite `cerrar-lecturas-component.tsx` to use source-of-truth service

**Slice:** 6b
**Spec reference:** `specs/routes/cerrar-lecturas.md#requirement-cerrar-lecturas-component-realigns-types`; `#requirement-cerrar-lecturas-component-removes-phantom-api-calls`; `#requirement-local-cycle-helper-replaced`; `specs/cross-cutting/components-realignment.md#requirement-phantom-type-imports-forbidden`
**File(s) affected:** `app/components/operaciones/cerrar-lecturas/cerrar-lecturas-component.tsx` (763 → ~500 LOC)
**Estimated LOC delta:** +30 / −293
**Pre-conditions:** Tasks 6b.1, 6b.2, Slice 3
**Steps:**
1. Drop the 3 phantom type imports: `Ciclo`, `PeriodoAbierto`, `EstadoCierreLecturas`.
2. Add source-of-truth type imports: `CerrarLecturasFiltrosCiclosResponse`, `CerrarLecturasFiltrosPeriodosResponse` from `~/types/operaciones`.
3. Declare inline type aliases:
   - `type Ciclo = CerrarLecturasFiltrosCiclosResponse[number];`
   - `type PeriodoAbierto = CerrarLecturasFiltrosPeriodosResponse[number];`
   - `type EstadoCierreLecturas = { id: string; rut: string; nombre: string; estado: 'pendiente' | 'cerrado'; ultimaLectura: number; }` (or whatever fields the column definition requires)
4. Remove the local `obtenerCicloParaAPI` function (line 102) and import `convertirCicloParaAPI` from `~/utils/operaciones`.
5. Remove the 2 phantom `api.get('/estado-cierre-lecturas')` and `api.post('/cerrar-lecturas-nicho', ...)` calls.
6. Use `operacionesService.getCerrarLecturasFiltrosCiclos()` + `getCerrarLecturasFiltrosPeriodos()` for filter population.
7. Render the close action as a disabled button with a "Funcionalidad no disponible" tooltip.
8. Drop the import of `alert-cerrar-lecturas` (deleted in Task 6b.1).
9. Confirm `pnpm typecheck` passes.
**Acceptance criteria:**
- [ ] `grep -rE "\b(Ciclo|PeriodoAbierto|EstadoCierreLecturas)\b" app/components/operaciones/cerrar-lecturas/` shows: (a) `Ciclo`/`PeriodoAbierto` only as the right-hand side of an inline alias declaration, (b) `EstadoCierreLecturas` only as an inline `type` declaration
- [ ] `grep -rE "api\\.(get|post)\\(['\"]/(estado-cierre-lecturas|cerrar-lecturas-nicho)" app/components/operaciones/cerrar-lecturas/` returns 0 matches
- [ ] `grep -rE "obtenerCicloParaAPI" app/` returns 0 matches
- [ ] The component imports `convertirCicloParaAPI` from `~/utils/operaciones`
- [ ] `pnpm typecheck` passes
**Dependencies:** Tasks 6b.1, 6b.2
**Commit message:** `refactor(operaciones): realign cerrar-lecturas-component to source-of-truth service`
**Branch:** `refactor-operaciones-modulos/slice-6b-cerrar-lecturas`

#### Task 6b.4: Update `cerrar-lecturas/columns.tsx` to use the inline `EstadoCierreLecturas`

**Slice:** 6b
**Spec reference:** `specs/routes/cerrar-lecturas.md#requirement-cerrar-lecturas-component-realigns-types`
**File(s) affected:** `app/components/operaciones/cerrar-lecturas/columns.tsx` (266 → ~200 LOC)
**Estimated LOC delta:** +0 / −66
**Pre-conditions:** Task 6b.3
**Steps:**
1. Drop the `import { EstadoCierreLecturas }` phantom import.
2. Declare a local copy of the inline `EstadoCierreLecturas` type in `columns.tsx` (the spec says "inline" — duplication is acceptable for the local-type rule).
3. Confirm `pnpm typecheck` passes.
**Acceptance criteria:**
- [ ] `grep "EstadoCierreLecturas" app/components/operaciones/cerrar-lecturas/columns.tsx` shows only a local `type` declaration (no import from `~/types/operaciones`)
- [ ] `pnpm typecheck` passes
**Dependencies:** Task 6b.3
**Commit message:** `refactor(operaciones): update cerrar-lecturas columns to use inline EstadoCierreLecturas`
**Branch:** `refactor-operaciones-modulos/slice-6b-cerrar-lecturas`

#### Task 6b.5: Update `dialog-informacion.tsx` (minor: drop `CerrarLecturasCerrar` request type import)

**Slice:** 6b
**Spec reference:** `specs/cross-cutting/components-realignment.md#requirement-phantom-type-imports-forbidden`
**File(s) affected:** `app/components/operaciones/cerrar-lecturas/dialog-informacion.tsx` (~161 LOC, minor)
**Estimated LOC delta:** +0 / −5
**Pre-conditions:** Task 6b.3
**Steps:**
1. Drop the `CerrarLecturasCerrar` request type import (no method exists in the source of truth that uses this type).
2. If the dialog uses the type in any prop signature, replace with an inline `type X = { ... }`.
3. Confirm `pnpm typecheck` passes.
**Acceptance criteria:**
- [ ] `grep "CerrarLecturasCerrar" app/components/operaciones/cerrar-lecturas/dialog-informacion.tsx` returns 0 matches
- [ ] `pnpm typecheck` passes
**Dependencies:** Task 6b.3
**Commit message:** `refactor(operaciones): minor update to cerrar-lecturas dialog-informacion`
**Branch:** `refactor-operaciones-modulos/slice-6b-cerrar-lecturas`

#### Task 6b.6: Verify slice-level smoke check

**Slice:** 6b
**Spec reference:** `specs/routes/cerrar-lecturas.md` (MODIFIED); `specs/cross-cutting/utils-consolidation.md#requirement-cycle-helper-canonical-move`
**File(s) affected:** none (verification only)
**Estimated LOC delta:** 0 / +0
**Pre-conditions:** Tasks 6b.1–6b.5
**Steps:**
1. Run `pnpm typecheck && pnpm lint && pnpm build`.
2. Run `grep -rE "\b(obtenerCicloParaAPI|api\\.(get|post)\\(['\"]/(estado-cierre-lecturas|cerrar-lecturas-nicho))" app/components/operaciones/cerrar-lecturas/` and confirm 0 matches.
3. Confirm `git diff --stat app/types/operaciones.ts app/services/operacionesService.ts` is empty.
**Acceptance criteria:**
- [ ] `pnpm typecheck && pnpm lint && pnpm build` pass
- [ ] No phantom helpers or endpoint calls in cerrar-lecturas
- [ ] Source-of-truth files unchanged
**Dependencies:** Tasks 6b.1, 6b.2, 6b.3, 6b.4, 6b.5
**Commit message:** (PR-level smoke check, no new commit)
**Branch:** `refactor-operaciones-modulos/slice-6b-cerrar-lecturas`

#### Slice 6b summary

- **Total tasks:** 6
- **Total estimated LOC delta:** +30 / −982 (net −952)
- **Spec coverage:** `specs/routes/cerrar-lecturas.md` (MODIFIED); `specs/cross-cutting/utils-consolidation.md#requirement-cycle-helper-canonical-move`
- **Review budget fit:** **PASS** — positive added LOC: 30 (the inline type aliases). The −952 net is mostly deletions. Per-file diffs: 1 at −293, 1 at −239, 1 at −179, 1 at −66, 1 at −5.
- **Smoke check:** `pnpm typecheck && pnpm lint && pnpm build`

---

### Slice 6c — corte-reposicion

> **Spec references:** `specs/routes/corte-reposicion.md` (MODIFIED); `specs/cross-cutting/utils-consolidation.md#requirement-download-blob-helper-extraction`
> **Files affected:** 1 columns file deleted, 1 main component rewritten, 3 dialogs updated (1 with `downloadBlob`), 1 colocated test created
> **Estimated LOC delta:** +130 / −692 (net −562)
> **Branch:** `refactor-operaciones-modulos/slice-6c-corte-reposicion`
> **Commit message:** `refactor(operaciones): realign corte-reposicion; remove 4 lost features`

#### Task 6c.1: Delete `corte-reposicion/columns.tsx`

**Slice:** 6c
**Spec reference:** `specs/routes/corte-reposicion.md` (data shape realignment)
**File(s) affected:** `app/components/operaciones/corte-reposicion/columns.tsx` (260 LOC)
**Estimated LOC delta:** −260 / +0
**Pre-conditions:** Slice 3
**Steps:**
1. Run `grep -r "corte-reposicion/columns" app/ test/` and confirm 0 matches outside the file itself and explore.md.
2. Delete the file: `git rm app/components/operaciones/corte-reposicion/columns.tsx`.
3. Confirm `pnpm typecheck` passes (the main component's import of this file is dropped in Task 6c.2).
**Acceptance criteria:**
- [ ] File no longer exists
- [ ] `grep -r "corte-reposicion/columns" app/ test/` returns 0 matches
- [ ] `pnpm typecheck` passes
**Dependencies:** Slice 3
**Commit message:** `chore(operaciones): delete corte-reposicion columns.tsx (re-defined inline)`
**Branch:** `refactor-operaciones-modulos/slice-6c-corte-reposicion`

#### Task 6c.2: Rewrite `corte-reposicion-component.tsx` to use source-of-truth service

**Slice:** 6c
**Spec reference:** `specs/routes/corte-reposicion.md#requirement-corte-reposicion-component-uses-correct-shape`; `#requirement-corte-reposicion-component-removes-phantom-endpoints`; `#requirement-lost-features-documented-as-non-goals`; `specs/cross-cutting/components-realignment.md#requirement-phantom-service-calls-forbidden`
**File(s) affected:** `app/components/operaciones/corte-reposicion/corte-reposicion-component.tsx` (662 → ~400 LOC)
**Estimated LOC delta:** +50 / −312
**Pre-conditions:** Task 6c.1, Slice 3
**Steps:**
1. Drop the `ConsultarMantenedorRevisionCorte` phantom type import.
2. Add source-of-truth type imports: `CorteReposicionResumenResponse`, `CorteReposicionBuscarRequest`, `CorteReposicionLiberarRequest`, `CorteReposicionRegistrarCorteRequest` from `~/types/operaciones`.
3. Use `operacionesService.getCorteReposicionData()` for the stats card (resumen) and `operacionesService.getBuscarCorteReposicion(acometida?)` for the list (declared at `app/services/operacionesService.ts:348-368`).
4. Remove all 8 phantom direct `api.get/post` calls: `consulta-mantenedor-revision-corte`, `consulta-registros-revision`, `modificar-revision`, `ingresar-revision`, `eliminar-revision`, `exportar-*`.
5. Keep the 3 lifecycle methods: `postIniciarProcesoCorteReposicion`, `postFinalizarProcesoCorteReposicion`, `postActualizarProcesoCorteReposicion`.
6. Keep the 3 dialog methods: `postLiberarAcometida`, `postRegistrarCorte`, `postSolicitarReposicion`.
7. Remove the "Modificar", "Ingresar", "Eliminar" revision buttons from the UI (4 lost features).
8. Remove the 3 "Exportar" buttons OR keep them as no-op with a "Funcionalidad no disponible" tooltip.
9. Use `downloadBlob` from `~/utils/operaciones` (per Task 3.1) for the 3 blob handlers at `corte-reposicion-component.tsx:98,120,142`.
10. Add a comment in the file documenting the 4 lost features for future reference.
11. Confirm `pnpm typecheck` passes.
**Acceptance criteria:**
- [ ] `grep "ConsultarMantenedorRevisionCorte" app/components/operaciones/corte-reposicion/` returns 0 matches
- [ ] `grep -rE "api\\.(get|post)\\(['\"]" app/components/operaciones/corte-reposicion/` returns 0 matches
- [ ] `grep -rE "URL.createObjectURL" app/components/operaciones/corte-reposicion/` returns 0 matches
- [ ] The stats card renders from `CorteReposicionResumenResponse`
- [ ] `pnpm typecheck` passes
**Dependencies:** Task 6c.1
**Commit message:** `refactor(operaciones): realign corte-reposicion-component to source-of-truth service`
**Branch:** `refactor-operaciones-modulos/slice-6c-corte-reposicion`

#### Task 6c.3: Update `consultar-acometida-dialog.tsx` to use `downloadBlob`

**Slice:** 6c
**Spec reference:** `specs/cross-cutting/utils-consolidation.md#requirement-download-blob-helper-extraction`
**File(s) affected:** `app/components/operaciones/corte-reposicion/consultar-acometida-dialog.tsx` (600 → ~500 LOC)
**Estimated LOC delta:** +0 / −100
**Pre-conditions:** Task 6c.2, Slice 3
**Steps:**
1. Identify the 1 inline blob-download handler in this file.
2. Replace it with a call to `downloadBlob` imported from `~/utils/operaciones`.
3. Confirm `pnpm typecheck` passes.
**Acceptance criteria:**
- [ ] `grep "URL.createObjectURL" app/components/operaciones/corte-reposicion/consultar-acometida-dialog.tsx` returns 0 matches
- [ ] The file imports `downloadBlob` from `~/utils/operaciones`
- [ ] `pnpm typecheck` passes
**Dependencies:** Task 6c.2
**Commit message:** `refactor(operaciones): use downloadBlob in consultar-acometida-dialog`
**Branch:** `refactor-operaciones-modulos/slice-6c-corte-reposicion`

#### Task 6c.4: Update 2 minor dialogs (`corte-registrado-dialog.tsx`, `reposicion-solicitada-dialog.tsx`)

**Slice:** 6c
**Spec reference:** `specs/cross-cutting/style-and-convention-sweep.md`
**File(s) affected:** `corte-registrado-dialog.tsx`, `reposicion-solicitada-dialog.tsx`
**Estimated LOC delta:** +0 / −20
**Pre-conditions:** Task 6c.2
**Steps:**
1. For each dialog, drop unused imports, replace `toast.error(error as any)` with `toast.error(extraerMensajeError(error))`, remove `console.*` calls.
2. Confirm `pnpm typecheck && pnpm lint` pass.
**Acceptance criteria:**
- [ ] `grep "console\\.\(log\|info\|debug\|warn\)\|toast\.error([^)]*\bas\s+any\b" app/components/operaciones/corte-reposicion/{corte-registrado-dialog,reposicion-solicitada-dialog}.tsx` returns 0 matches
- [ ] `pnpm typecheck && pnpm lint` pass
**Dependencies:** Task 6c.2
**Commit message:** `refactor(operaciones): minor cleanup on 2 corte-reposicion dialogs`
**Branch:** `refactor-operaciones-modulos/slice-6c-corte-reposicion`

#### Task 6c.5: Create `corte-reposicion-component.test.tsx` colocated test

**Slice:** 6c
**Spec reference:** `specs/routes/corte-reposicion.md#requirement-corte-reposicion-component-removes-phantom-endpoints`; `specs/cross-cutting/components-realignment.md`
**File(s) affected:** `app/components/operaciones/corte-reposicion/corte-reposicion-component.test.tsx` (NEW, ~80 LOC)
**Estimated LOC delta:** +80 / +0
**Pre-conditions:** Tasks 6c.2, 6c.3, 6c.4
**Steps:**
1. Create the colocated test per `design.md` §6.2 Slice 6c. Use `@testing-library/react` `render` + `vi.mock('~/services/operacionesService', ...)`.
2. Assert that clicking the lifecycle buttons (Iniciar/Finalizar/Actualizar Proceso) calls the source-of-truth methods with the correct payloads.
3. Add a header comment documenting the `test/setup.ts` deferral.
4. Confirm `pnpm typecheck` passes.
**Acceptance criteria:**
- [ ] `app/components/operaciones/corte-reposicion/corte-reposicion-component.test.tsx` exists, is typecheck-clean
- [ ] Test file header documents the deferral
- [ ] `pnpm typecheck` passes
**Dependencies:** Tasks 6c.2, 6c.3, 6c.4
**Commit message:** `test(operaciones): add colocated test for corte-reposicion-component`
**Branch:** `refactor-operaciones-modulos/slice-6c-corte-reposicion`

#### Task 6c.6: Verify slice-level smoke check

**Slice:** 6c
**Spec reference:** `specs/routes/corte-reposicion.md` (MODIFIED)
**File(s) affected:** none (verification only)
**Estimated LOC delta:** 0 / +0
**Pre-conditions:** Tasks 6c.1–6c.5
**Steps:**
1. Run `pnpm typecheck && pnpm lint && pnpm build`.
2. Run `grep -rE "ConsultarMantenedorRevisionCorte|api\\.(get|post)\\(['\"]|URL.createObjectURL" app/components/operaciones/corte-reposicion/` and confirm 0 matches.
3. Confirm `git diff --stat app/types/operaciones.ts app/services/operacionesService.ts` is empty.
**Acceptance criteria:**
- [ ] `pnpm typecheck && pnpm lint && pnpm build` pass
- [ ] No phantom types, hardcoded URLs, or inline blob downloads in corte-reposicion
- [ ] Source-of-truth files unchanged
**Dependencies:** Tasks 6c.1, 6c.2, 6c.3, 6c.4, 6c.5
**Commit message:** (PR-level smoke check, no new commit)
**Branch:** `refactor-operaciones-modulos/slice-6c-corte-reposicion`

#### Slice 6c summary

- **Total tasks:** 6
- **Total estimated LOC delta:** +130 / −692 (net −562)
- **Spec coverage:** `specs/routes/corte-reposicion.md` (MODIFIED); `specs/cross-cutting/utils-consolidation.md#requirement-download-blob-helper-extraction`
- **Review budget fit:** **PASS** — positive added LOC: 130 (the test file + 50 in the main component rewrite). Per-file diffs are bounded.
- **Smoke check:** `pnpm typecheck && pnpm lint && pnpm build`

---

### Slice 6d — periodo-facturacion + preparar-lecturas

> **Spec references:** `specs/routes/periodo-facturacion.md` (MODIFIED), `specs/routes/preparar-lecturas.md` (MODIFIED); `specs/cross-cutting/utils-consolidation.md#requirement-cycle-helper-canonical-move`, `#requirement-months-constant-single-source`
> **Files affected:** 5 files deleted (3 periodo dialogs + 2 preparar-lecturas sub-components), 1 new merged dialog, 2 main components rewritten, 1 columns file updated
> **Estimated LOC delta:** +150 / −1,680 (net −1,530)
> **Branch:** `refactor-operaciones-modulos/slice-6d-periodo-preparar`
> **Commit message:** `refactor(operaciones): merge 3 periodo dialogs; delete 2 dead preparar-lecturas subcomponents`

#### Task 6d.1: Delete 3 periodo-facturacion dialogs

**Slice:** 6d
**Spec reference:** `specs/routes/periodo-facturacion.md#requirement-dialogs-merged-into-one` (scenario `three-dialogs-collapsed`)
**File(s) affected:** `app/components/operaciones/periodo-facturacion/dialog-nuevo-periodo.tsx` (192 LOC), `dialog-abrir-periodo.tsx` (185 LOC), `cerrar-periodo.tsx` (138 LOC)
**Estimated LOC delta:** −515 / +0
**Pre-conditions:** Slice 3
**Steps:**
1. Run `grep -rE "dialog-nuevo-periodo|dialog-abrir-periodo|cerrar-periodo" app/ test/` and confirm 0 matches outside the 3 files themselves and explore.md.
2. Delete the 3 files: `git rm app/components/operaciones/periodo-facturacion/{dialog-nuevo-periodo,dialog-abrir-periodo}.tsx app/components/operaciones/periodo-facturacion/cerrar-periodo.tsx`.
3. Confirm `pnpm typecheck` passes (verified after Task 6d.4 updates the main component).
**Acceptance criteria:**
- [ ] All 3 files no longer exist
- [ ] `grep -rE "dialog-nuevo-periodo|dialog-abrir-periodo" app/ test/` returns 0 matches
- [ ] `pnpm typecheck` passes
**Dependencies:** Slice 3
**Commit message:** `chore(operaciones): delete 3 periodo-facturacion dialogs (merged into dialog-periodo)`
**Branch:** `refactor-operaciones-modulos/slice-6d-periodo-preparar`

#### Task 6d.2: Create merged `dialog-periodo.tsx`

**Slice:** 6d
**Spec reference:** `specs/routes/periodo-facturacion.md#requirement-dialogs-merged-into-one`
**File(s) affected:** `app/components/operaciones/periodo-facturacion/dialog-periodo.tsx` (NEW, ~150 LOC)
**Estimated LOC delta:** +150 / +0
**Pre-conditions:** Task 6d.1
**Steps:**
1. Create `app/components/operaciones/periodo-facturacion/dialog-periodo.tsx` with:
   - A single dialog component that supports both "Crear periodo" and "Cerrar periodo" actions (a `mode` prop or a state toggle inside the dialog).
   - Use `operacionesService.postCrearPeriodoFacturacion(req)` for create (declared at `app/services/operacionesService.ts:92-105`).
   - Use `operacionesService.postCerrarPeriodoFacturacion(codigo)` for close (declared at `app/services/operacionesService.ts:107-126`).
   - Import `MONTHS` from `~/utils/operaciones` (the canonical `constants.ts` source).
2. Type the create request as `PeriodosCrearRequest` from `~/types/operaciones`.
3. Confirm `pnpm typecheck` passes.
**Acceptance criteria:**
- [ ] `app/components/operaciones/periodo-facturacion/dialog-periodo.tsx` exists
- [ ] The file imports `MONTHS` from `~/utils/operaciones` (NOT defined locally)
- [ ] The file imports `postCrearPeriodoFacturacion` + `postCerrarPeriodoFacturacion` from `~/services/operacionesService`
- [ ] `pnpm typecheck` passes
**Dependencies:** Task 6d.1
**Commit message:** `refactor(operaciones): add merged dialog-periodo for create and close actions`
**Branch:** `refactor-operaciones-modulos/slice-6d-periodo-preparar`

#### Task 6d.3: Update `periodo-facturacion/columns.tsx` to use inline `Anio`/`Periodos` aliases

**Slice:** 6d
**Spec reference:** `specs/routes/periodo-facturacion.md#requirement-periodo-facturacion-component-realigns-types`
**File(s) affected:** `app/components/operaciones/periodo-facturacion/columns.tsx` (175 → ~150 LOC)
**Estimated LOC delta:** +0 / −25
**Pre-conditions:** Task 6d.1, Slice 3
**Steps:**
1. Drop the `Anio` and `Periodos` phantom type imports.
2. Declare local copies of the inline `Anio` and `Periodos` type aliases in `columns.tsx`.
3. Confirm `pnpm typecheck` passes.
**Acceptance criteria:**
- [ ] `grep "Anio\|Periodos" app/components/operaciones/periodo-facturacion/columns.tsx` shows only a local `type` declaration (no import from `~/types/operaciones`)
- [ ] `pnpm typecheck` passes
**Dependencies:** Task 6d.1
**Commit message:** `refactor(operaciones): update periodo-facturacion columns to use inline aliases`
**Branch:** `refactor-operaciones-modulos/slice-6d-periodo-preparar`

#### Task 6d.4: Rewrite `periodo-facturacion-component.tsx` to use source-of-truth service and merged dialog

**Slice:** 6d
**Spec reference:** `specs/routes/periodo-facturacion.md#requirement-periodo-facturacion-component-realigns-types`; `#requirement-periodo-facturacion-component-replaces-direct-api-call`; `#requirement-dialogs-merged-into-one`; `specs/cross-cutting/components-realignment.md`
**File(s) affected:** `app/components/operaciones/periodo-facturacion/periodo-facturacion-component.tsx` (265 → ~200 LOC)
**Estimated LOC delta:** +0 / −65
**Pre-conditions:** Tasks 6d.1, 6d.2, 6d.3, Slice 3
**Steps:**
1. Drop the 2 phantom type imports: `Anio`, `Periodos`.
2. Add source-of-truth type imports: `PeriodosAniosDisponiblesResponse`, `PeriodosBuscarRequest`, `PeriodosCrearRequest` from `~/types/operaciones`.
3. Declare inline type aliases:
   - `type Anio = Pick<PeriodosAniosDisponiblesResponse, 'anio'>;`
   - `type Periodos = PeriodosBuscarRequest;`
4. Replace `api.get('/consulta-periodo')` with `operacionesService.getPeriodoAbierto()` (declared at `app/services/operacionesService.ts:31-46`).
5. Import the new `DialogPeriodo` from `./dialog-periodo` and replace the 3 old dialogs.
6. Confirm `pnpm typecheck` passes.
**Acceptance criteria:**
- [ ] `grep -rE "api\.(get|post)" app/components/operaciones/periodo-facturacion/` returns 0 matches
- [ ] `grep -rE "\b(Anio|Periodos)\b" app/components/operaciones/periodo-facturacion/` shows: (a) only as the right-hand side of an inline alias declaration
- [ ] The component imports `getPeriodoAbierto` from `~/services/operacionesService`
- [ ] `pnpm typecheck` passes
**Dependencies:** Tasks 6d.1, 6d.2, 6d.3
**Commit message:** `refactor(operaciones): realign periodo-facturacion-component to source-of-truth service`
**Branch:** `refactor-operaciones-modulos/slice-6d-periodo-preparar`

#### Task 6d.5: Delete 2 dead preparar-lecturas sub-components

**Slice:** 6d
**Spec reference:** `specs/routes/preparar-lecturas.md#requirement-dead-subcomponents-deletion` (scenario `dead-subcomponents-deleted`)
**File(s) affected:** `app/components/operaciones/preparar-lecturas/tabla-asignacion-sectores.tsx` (542 LOC), `tabla-lecturas-pendientes.tsx` (175 LOC)
**Estimated LOC delta:** −717 / +0
**Pre-conditions:** Slice 3
**Steps:**
1. Run `grep -rE "tabla-asignacion-sectores|tabla-lecturas-pendientes" app/ test/` and confirm 0 matches outside the 2 files themselves and explore.md.
2. Delete the 2 files: `git rm app/components/operaciones/preparar-lecturas/{tabla-asignacion-sectores,tabla-lecturas-pendientes}.tsx`.
3. Confirm `pnpm typecheck` passes (verified after Task 6d.6).
**Acceptance criteria:**
- [ ] Both files no longer exist
- [ ] `grep -rE "tabla-asignacion-sectores|tabla-lecturas-pendientes" app/ test/` returns 0 matches
- [ ] `pnpm typecheck` passes
**Dependencies:** Slice 3
**Commit message:** `chore(operaciones): delete 2 dead preparar-lecturas sub-components`
**Branch:** `refactor-operaciones-modulos/slice-6d-periodo-preparar`

#### Task 6d.6: Rewrite `preparar-lecturas-component.tsx` to use source-of-truth service

**Slice:** 6d
**Spec reference:** `specs/routes/preparar-lecturas.md#requirement-preparar-lecturas-component-uses-source-of-truth-service`; `#requirement-phantom-type-imports-removed`; `#requirement-local-cycle-helper-replaced`; `specs/cross-cutting/components-realignment.md#requirement-phantom-type-imports-forbidden`
**File(s) affected:** `app/components/operaciones/preparar-lecturas/preparar-lecturas-component.tsx` (458 → ~250 LOC)
**Estimated LOC delta:** +0 / −208
**Pre-conditions:** Task 6d.5, Slice 3
**Steps:**
1. Drop the 4 phantom type imports: `PeriodoAbierto`, `ConsultarAsignacionSectores`, `ConsultarSectores`, `ValidarSectoresPendientes`.
2. Add source-of-truth type imports: `PrepararLecturasFiltrosCiclosResponse`, `PrepararLecturasFiltrosPeriodosResponse`, `PrepararLecturasBuscarNichosRequest`, `PrepararLecturasGenerarRequest` from `~/types/operaciones`.
3. Declare `type PeriodoAbierto = PrepararLecturasFiltrosPeriodosResponse[number];` inline.
4. Remove the local `obtenerCicloParaAPI` (line 99) and import `convertirCicloParaAPI` from `~/utils/operaciones`.
5. Drop the imports of the 2 deleted sub-components.
6. Use `operacionesService.getPrepararLecturasData` (line 133) for filter population.
7. Use `operacionesService.getBuscarNichos(cicloId, periodoId)` (line 178) for the search.
8. Use `operacionesService.postGenerarLecturas(req)` (line 161) for the action; type the request as `PrepararLecturasGenerarRequest`.
9. Confirm `pnpm typecheck` passes.
**Acceptance criteria:**
- [ ] `grep -rE "ConsultarAsignacionSectores|ConsultarSectores|ValidarSectoresPendientes" app/components/operaciones/preparar-lecturas/` returns 0 matches
- [ ] `grep -rE "^import.*\bPeriodoAbierto\b.*from" app/components/operaciones/preparar-lecturas/` returns 0 matches
- [ ] `grep -rE "obtenerCicloParaAPI" app/` returns 0 matches
- [ ] The component imports `getPrepararLecturasData`, `getBuscarNichos`, `postGenerarLecturas` from `~/services/operacionesService`
- [ ] `pnpm typecheck` passes
**Dependencies:** Task 6d.5
**Commit message:** `refactor(operaciones): realign preparar-lecturas-component to source-of-truth service`
**Branch:** `refactor-operaciones-modulos/slice-6d-periodo-preparar`

#### Task 6d.7: Verify slice-level smoke check

**Slice:** 6d
**Spec reference:** `specs/routes/periodo-facturacion.md` (MODIFIED), `specs/routes/preparar-lecturas.md` (MODIFIED)
**File(s) affected:** none (verification only)
**Estimated LOC delta:** 0 / +0
**Pre-conditions:** Tasks 6d.1–6d.6
**Steps:**
1. Run `pnpm typecheck && pnpm lint && pnpm build`.
2. Run `grep -rE "tabla-asignacion-sectores|tabla-lecturas-pendientes|obtenerCicloParaAPI|api\.(get|post)" app/components/operaciones/periodo-facturacion/ app/components/operaciones/preparar-lecturas/` and confirm 0 matches.
3. Confirm `git diff --stat app/types/operaciones.ts app/services/operacionesService.ts` is empty.
**Acceptance criteria:**
- [ ] `pnpm typecheck && pnpm lint && pnpm build` pass
- [ ] No dead sub-components, no phantom helpers or hardcoded URLs
- [ ] Source-of-truth files unchanged
**Dependencies:** Tasks 6d.1, 6d.2, 6d.3, 6d.4, 6d.5, 6d.6
**Commit message:** (PR-level smoke check, no new commit)
**Branch:** `refactor-operaciones-modulos/slice-6d-periodo-preparar`

#### Slice 6d summary

- **Total tasks:** 7
- **Total estimated LOC delta:** +150 / −1,680 (net −1,530)
- **Spec coverage:** `specs/routes/periodo-facturacion.md` (MODIFIED); `specs/routes/preparar-lecturas.md` (MODIFIED); `specs/cross-cutting/utils-consolidation.md#requirement-cycle-helper-canonical-move`, `#requirement-months-constant-single-source`
- **Review budget fit:** **PASS** — positive added LOC: 150 (the new merged dialog). The −1,530 net is mostly deletions. This is the largest slice by absolute deletion count.
- **Smoke check:** `pnpm typecheck && pnpm lint && pnpm build`

---

### Slice 6e — precios-cargo + revisar-calculo-factura + revisar-precio (+ shared `useProductTour`)

> **Spec references:** `specs/routes/precios-cargo.md` (MODIFIED); `specs/routes/revisar-calculo-factura.md` (MODIFIED); `specs/routes/revisar-precio.md` (MODIFIED); `specs/cross-cutting/utils-consolidation.md#requirement-revisar-precio-helpers-deletion`, `#requirement-confirmation-helpers-deletion`; `specs/cross-cutting/hooks-realignment.md` (continuation)
> **Files affected:** 9 files deleted, 5 files renamed/merged, 4 main components updated, 2 new tests
> **Estimated LOC delta:** +350 / −1,300 (net −950)
> **Branch:** `refactor-operaciones-modulos/slice-6e-precios-revisar`
> **Commit message:** `refactor(operaciones): realign precios-cargo and the 2 revisar-* subdomains; drop Enel/Agualova split`

#### Task 6e.1: Extract `useProductTour` hook to `app/hooks/operaciones/use-product-tour.ts`

**Slice:** 6e
**Spec reference:** `specs/routes/revisar-precio.md#requirement-use-product-tour-extraction-conditional`; `design.md` §8.3
**File(s) affected:** `app/hooks/operaciones/use-product-tour.ts` (NEW, ~50 LOC)
**Estimated LOC delta:** +50 / +0
**Pre-conditions:** Slice 3, Slice 5
**Steps:**
1. **Verify the 4 candidate sites are visually identical** per `design.md` §8.3: `corte-reposicion-component.tsx:323-345`, `revisar-calculo-factura-component.tsx:223-245`, `revisar-precio-component.tsx:300-321`, `precios-cargo-component.tsx:232-252`. The design verdict is to extract (all 4 are visually identical).
2. Create `app/hooks/operaciones/use-product-tour.ts` with the `useProductTour(steps, options?)` signature from `design.md` §8.3. Accepts `DriveStep[]` and an optional `UseProductTourOptions` with `onStart?: () => void`.
3. The hook uses the default driver.js config (`showProgress`, `progressText`, `smoothScroll`, `stagePadding: 4`, `stageRadius: 6`, `animate`, `allowClose`, button text, `onHighlightStarted` with `scrollIntoView`).
4. Confirm `pnpm typecheck` passes.
**Acceptance criteria:**
- [ ] `app/hooks/operaciones/use-product-tour.ts` exists, exports `useProductTour`, `TourStep`, `UseProductTourOptions`
- [ ] `pnpm typecheck` passes
**Dependencies:** Slice 3, Slice 5
**Commit message:** `refactor(operaciones): extract useProductTour hook for driver.js tour init`
**Branch:** `refactor-operaciones-modulos/slice-6e-precios-revisar`

#### Task 6e.2: Delete 5 dead revisar-precio sub-components

**Slice:** 6e
**Spec reference:** `specs/routes/revisar-precio.md#requirement-dead-subcomponents-deletion`
**File(s) affected:** `app/components/operaciones/revisar-precio/data-table-virtualized.tsx` (222 LOC), `tabla-valores-enel.tsx`, `tabla-valores-enerlova.tsx`, `columns-enel.tsx`, `columns-agualova.tsx`
**Estimated LOC delta:** −5 files / +0
**Pre-conditions:** Slice 3
**Steps:**
1. Run `grep -rE "revisar-precio/(data-table-virtualized|tabla-valores-enel|tabla-valores-enerlova|columns-enel|columns-agualova)" app/ test/` and confirm 0 matches outside the 5 files themselves and explore.md.
2. Delete the 5 files: `git rm app/components/operaciones/revisar-precio/{data-table-virtualized,tabla-valores-enel,tabla-valores-enerlova,columns-enel,columns-agualova}.tsx`.
3. Confirm `pnpm typecheck` passes (verified after Task 6e.3 and Task 6e.4).
**Acceptance criteria:**
- [ ] All 5 files no longer exist
- [ ] `grep -rE "revisar-precio/(data-table-virtualized|tabla-valores-enel|tabla-valores-enerlova|columns-enel|columns-agualova)" app/ test/` returns 0 matches
- [ ] `pnpm typecheck` passes
**Dependencies:** Slice 3
**Commit message:** `chore(operaciones): delete 5 dead revisar-precio sub-components`
**Branch:** `refactor-operaciones-modulos/slice-6e-precios-revisar`

#### Task 6e.3: Create merged `columns.tsx` for revisar-precio

**Slice:** 6e
**Spec reference:** `specs/routes/revisar-precio.md#requirement-phantom-type-imports-removed`
**File(s) affected:** `app/components/operaciones/revisar-precio/columns.tsx` (NEW, replaces `columns-enel.tsx` + `columns-agualova.tsx` deleted in Task 6e.2)
**Estimated LOC delta:** +200 / +0
**Pre-conditions:** Task 6e.2
**Steps:**
1. Create `app/components/operaciones/revisar-precio/columns.tsx` that consumes `RevisionPreciosBuscarRequest[]` (from `~/types/operaciones`).
2. Drop the `RevisarPrecioUno` and `RevisarPrecioDos` phantom type imports.
3. Drop the `TablaValoresEnelProps` and `TablaValoresAgualovaProps` phantom prop imports.
4. The columns definition is the union of the columns from the deleted enel + agualova files, now consuming a single flat shape.
5. Confirm `pnpm typecheck` passes.
**Acceptance criteria:**
- [ ] `app/components/operaciones/revisar-precio/columns.tsx` exists
- [ ] `grep -rE "RevisarPrecioUno|RevisarPrecioDos|TablaValoresEnelProps|TablaValoresAgualovaProps" app/components/operaciones/revisar-precio/` returns 0 matches
- [ ] The file imports `RevisionPreciosBuscarRequest` from `~/types/operaciones`
- [ ] `pnpm typecheck` passes
**Dependencies:** Task 6e.2
**Commit message:** `refactor(operaciones): merge revisar-precio columns-enel and columns-agualova into columns.tsx`
**Branch:** `refactor-operaciones-modulos/slice-6e-precios-revisar`

#### Task 6e.4: Update `revisar-precio-component.tsx` to use source-of-truth service

**Slice:** 6e
**Spec reference:** `specs/routes/revisar-precio.md#requirement-revisar-precio-component-uses-gerrevisar`; `#requirement-phantom-type-imports-removed`; `specs/cross-cutting/components-realignment.md#requirement-phantom-type-imports-forbidden`
**File(s) affected:** `app/components/operaciones/revisar-precio/revisar-precio-component.tsx` (574 → ~400 LOC)
**Estimated LOC delta:** +30 / −204
**Pre-conditions:** Tasks 6e.2, 6e.3, Slice 5
**Steps:**
1. Drop the 6 phantom type imports: `Ciclo`, `PeriodoAbierto`, `RevisarPrecioUno`, `RevisarPrecioDos`, `TablaValoresEnelProps`, `TablaValoresAgualovaProps`.
2. Add source-of-truth type imports: `RevisarCalculosFiltrosCiclosResponse`, `RevisarCalculosFiltrosPeriodosResponse`, `RevisionPreciosBuscarRequest`, `RevisionPreciosConfirmarRequest`, `RevisionPreciosCorregirRequest` from `~/types/operaciones`.
3. Declare inline aliases:
   - `type Ciclo = RevisarCalculosFiltrosCiclosResponse[number];`
   - `type PeriodoAbierto = RevisarCalculosFiltrosPeriodosResponse[number];`
4. Use `operacionesService.gerRevisarPreciosData(mes, anio)` (typo preserved) for the data source.
5. Derive totals (`confirmados`, `pendientes`, `total`) via `useMemo` from the response.
6. Inline the small confirmation filter (was in `confirmation-helpers.ts`, deleted in Task 6e.8). The filter is ~3 lines.
7. Use `extraerMensajeError` from `~/utils/operaciones` for `toast.error` calls.
8. Replace the driver.js inline init with `useProductTour` (per Task 6e.1).
9. Drop the imports of the 5 deleted sub-components.
10. Confirm `pnpm typecheck` passes.
**Acceptance criteria:**
- [ ] `grep -rE "RevisarPrecioUno|RevisarPrecioDos" app/components/operaciones/revisar-precio/` returns 0 matches
- [ ] `grep -rE "^import.*\b(Ciclo|PeriodoAbierto)\b.*from" app/components/operaciones/revisar-precio/` returns 0 matches (aliases are inline)
- [ ] `grep "gerRevisarPreciosData" app/components/operaciones/revisar-precio/revisar-precio-component.tsx` returns exactly 1 match
- [ ] `pnpm typecheck` passes
**Dependencies:** Tasks 6e.2, 6e.3
**Commit message:** `refactor(operaciones): realign revisar-precio-component to source-of-truth service`
**Branch:** `refactor-operaciones-modulos/slice-6e-precios-revisar`

#### Task 6e.5: Update `dialog-modificar-precio.tsx` to use new payload shape

**Slice:** 6e
**Spec reference:** `specs/routes/revisar-precio.md#requirement-dialog-modificar-precio-payload-aligned` (scenario `dialog-sends-correct-payload`)
**File(s) affected:** `app/components/operaciones/revisar-precio/dialog-modificar-precio.tsx` (318 → ~250 LOC)
**Estimated LOC delta:** +0 / −68
**Pre-conditions:** Task 6e.4
**Steps:**
1. Replace the payload `{indice, valor, motivo, usuario}` with `{codigoCargo, nuevoValor, motivo, passwordConfirmacion}` (per `RevisionPreciosCorregirRequest` from `~/types/operaciones`).
2. Replace `api.post('/modificar-precio-cargo-correccion', ...)` with `operacionesService.postCorregirPrecioCargo(req)` (declared at `app/services/operacionesService.ts:313-326`).
3. Update the form fields accordingly (rename `indice`/`valor`/`usuario` to `codigoCargo`/`nuevoValor`/`passwordConfirmacion`).
4. Confirm `pnpm typecheck` passes.
**Acceptance criteria:**
- [ ] `grep "indice.*valor.*motivo.*usuario\|/modificar-precio-cargo-correccion" app/components/operaciones/revisar-precio/dialog-modificar-precio.tsx` returns 0 matches
- [ ] The dialog calls `postCorregirPrecioCargo({codigoCargo, nuevoValor, motivo, passwordConfirmacion})`
- [ ] `pnpm typecheck` passes
**Dependencies:** Task 6e.4
**Commit message:** `refactor(operaciones): realign dialog-modificar-precio to new payload shape`
**Branch:** `refactor-operaciones-modulos/slice-6e-precios-revisar`

#### Task 6e.6: Create `dialog-modificar-precio.test.tsx` colocated test

**Slice:** 6e
**Spec reference:** `specs/routes/revisar-precio.md#requirement-dialog-modificar-precio-payload-aligned`; `specs/cross-cutting/components-realignment.md`
**File(s) affected:** `app/components/operaciones/revisar-precio/dialog-modificar-precio.test.tsx` (NEW, ~80 LOC)
**Estimated LOC delta:** +80 / +0
**Pre-conditions:** Task 6e.5
**Steps:**
1. Create the colocated test per `design.md` §6.2 Slice 6e. Use `@testing-library/react` `render` + `vi.mock('~/services/operacionesService', ...)`.
2. Assert that submitting the dialog calls `postCorregirPrecioCargo` with a `RevisionPreciosCorregirRequest` payload (`{codigoCargo, nuevoValor, motivo, passwordConfirmacion}`).
3. Add a header comment documenting the `test/setup.ts` deferral.
4. Confirm `pnpm typecheck` passes.
**Acceptance criteria:**
- [ ] `app/components/operaciones/revisar-precio/dialog-modificar-precio.test.tsx` exists, is typecheck-clean
- [ ] Test file header documents the deferral
- [ ] `pnpm typecheck` passes
**Dependencies:** Task 6e.5
**Commit message:** `test(operaciones): add colocated test for dialog-modificar-precio`
**Branch:** `refactor-operaciones-modulos/slice-6e-precios-revisar`

#### Task 6e.7: Update `revisar-precio/data-table.tsx` for merged columns

**Slice:** 6e
**Spec reference:** `specs/cross-cutting/components-realignment.md`
**File(s) affected:** `app/components/operaciones/revisar-precio/data-table.tsx` (~172 LOC, minor)
**Estimated LOC delta:** +0 / −10
**Pre-conditions:** Tasks 6e.3, 6e.4
**Steps:**
1. Update the data-table to consume the merged `columns` from `./columns` (the new `columns.tsx` from Task 6e.3).
2. Drop the Enel/Agualova split (the table now renders a single flat shape).
3. Confirm `pnpm typecheck` passes.
**Acceptance criteria:**
- [ ] `pnpm typecheck` passes
**Dependencies:** Tasks 6e.3, 6e.4
**Commit message:** `refactor(operaciones): update revisar-precio data-table for merged columns`
**Branch:** `refactor-operaciones-modulos/slice-6e-precios-revisar`

#### Task 6e.8: Delete 2 helper utils (`revisar-precio-helpers.ts`, `confirmation-helpers.ts`)

**Slice:** 6e
**Spec reference:** `specs/cross-cutting/utils-consolidation.md#requirement-revisar-precio-helpers-deletion`; `#requirement-confirmation-helpers-deletion`
**File(s) affected:** `app/utils/operaciones/revisar-precio-helpers.ts` (76 LOC), `app/utils/operaciones/confirmation-helpers.ts` (66 LOC)
**Estimated LOC delta:** −142 / +0
**Pre-conditions:** Task 6e.4 (the only consumer in `revisar-precio-component.tsx` is updated in Task 6e.4 to inline the small filter)
**Steps:**
1. Run `grep -rE "revisar-precio-helpers|confirmation-helpers|isCredentialError|isAuthorizationError|getErrorMessage|handleValidationHTTPError|handleGeneralValidationError|processConfirmations|filterPendingConfirmations" app/ test/` and confirm 0 matches outside the 2 files being deleted and explore.md.
2. Delete the 2 files: `git rm app/utils/operaciones/{revisar-precio-helpers,confirmation-helpers}.ts`.
3. Update `app/utils/operaciones/index.ts` to remove the re-exports of these 2 files (they were never re-exported; the index missed them per `utils-consolidation.md#requirement-utils-operaciones-index-re_exports`).
4. Confirm `pnpm typecheck` passes.
**Acceptance criteria:**
- [ ] Both files no longer exist
- [ ] `grep -rE "revisar-precio-helpers|confirmation-helpers|processConfirmations|filterPendingConfirmations" app/ test/` returns 0 matches
- [ ] `pnpm typecheck` passes
**Dependencies:** Task 6e.4
**Commit message:** `chore(operaciones): delete revisar-precio-helpers and confirmation-helpers`
**Branch:** `refactor-operaciones-modulos/slice-6e-precios-revisar`

#### Task 6e.9: Update `revisar-calculo-factura-component.tsx` to drop phantom types and add inline `CalculoPrefacturaRow`

**Slice:** 6e
**Spec reference:** `specs/routes/revisar-calculo-factura.md#requirement-phantom-type-imports-replaced`; `specs/cross-cutting/components-realignment.md#requirement-phantom-type-imports-forbidden`
**File(s) affected:** `app/components/operaciones/revisar-calculo-factura/revisar-calculo-factura-component.tsx` (full type realignment; the call-site changes are in Slice 5 Task 5.3)
**Estimated LOC delta:** +0 / −50
**Pre-conditions:** Slice 5 (Task 5.3)
**Steps:**
1. Drop the 4 phantom type imports: `Ciclo`, `PeriodoAbierto`, `CalculoPrefacturaCompleto`, `CalculoPrefacturaDetalle`, `CalculoPrefacturaCargo`, `CalculoPrefacturaCargoResponse`.
2. Add source-of-truth type imports: `RevisarCalculosFiltrosCiclosResponse`, `RevisarCalculosFiltrosPeriodosResponse`, `RevisarCalculosLanzarCalculoRequest` from `~/types/operaciones`.
3. Declare inline type aliases:
   - `type Ciclo = RevisarCalculosFiltrosCiclosResponse[number];`
   - `type PeriodoAbierto = RevisarCalculosFiltrosPeriodosResponse[number];`
4. Re-export the `CalculoPrefacturaRow` inline type from `use-calculo-factura` (the rewritten hook from Slice 5 declares this type).
5. Confirm `pnpm typecheck` passes.
**Acceptance criteria:**
- [ ] `grep -rE "\b(CalculoPrefacturaCompleto|CalculoPrefacturaDetalle|CalculoPrefacturaCargo|CalculoPrefacturaCargoResponse)\b" app/components/operaciones/revisar-calculo-factura/` returns 0 matches
- [ ] `grep -rE "^import.*\b(Ciclo|PeriodoAbierto)\b.*from" app/components/operaciones/revisar-calculo-factura/` returns 0 matches (aliases are inline)
- [ ] `pnpm typecheck` passes
**Dependencies:** Slice 5 (Task 5.3)
**Commit message:** `refactor(operaciones): realign revisar-calculo-factura-component phantom types`
**Branch:** `refactor-operaciones-modulos/slice-6e-precios-revisar`

#### Task 6e.10: Update 3 sub-components of revisar-calculo-factura (columnsPrecalculo, data-table, hierarchical-data-table)

**Slice:** 6e
**Spec reference:** `specs/routes/revisar-calculo-factura.md#requirement-phantom-type-imports-replaced`
**File(s) affected:** `app/components/operaciones/revisar-calculo-factura/columnsPrecalculo.tsx` (~220 LOC), `data-table.tsx` (~150 LOC), `hierarchical-data-table.tsx` (239 LOC)
**Estimated LOC delta:** +0 / −40
**Pre-conditions:** Task 6e.9
**Steps:**
1. For each of the 3 sub-components, drop the `CalculoPrefactura*` phantom type imports.
2. Use the inline `CalculoPrefacturaRow` from the consumer file (re-exported from the rewritten hook).
3. For `hierarchical-data-table.tsx`, also drop the `CalculoPrefacturaCargo` phantom type import; declare inline.
4. Confirm `pnpm typecheck` passes.
**Acceptance criteria:**
- [ ] `grep -rE "CalculoPrefactura" app/components/operaciones/revisar-calculo-factura/` shows only the inline alias declarations and the `CalculoPrefacturaRow` import from the consumer
- [ ] `pnpm typecheck` passes
**Dependencies:** Task 6e.9
**Commit message:** `refactor(operaciones): realign 3 revisar-calculo-factura sub-components`
**Branch:** `refactor-operaciones-modulos/slice-6e-precios-revisar`

#### Task 6e.11: Delete `hierarchical-data-table-virtualized.tsx`

**Slice:** 6e
**Spec reference:** `specs/routes/revisar-calculo-factura.md#requirement-hierarchical-data-table-virtualized-deletion-or-extraction` (scenario `virtualized-table-deleted`)
**File(s) affected:** `app/components/operaciones/revisar-calculo-factura/hierarchical-data-table-virtualized.tsx` (380 LOC)
**Estimated LOC delta:** −380 / +0
**Pre-conditions:** Task 6e.10
**Steps:**
1. Run `grep -r "hierarchical-data-table-virtualized" app/ test/` and confirm 0 matches outside the file itself and explore.md.
2. Delete the file: `git rm app/components/operaciones/revisar-calculo-factura/hierarchical-data-table-virtualized.tsx`.
3. Confirm `pnpm typecheck` passes.
**Acceptance criteria:**
- [ ] File no longer exists
- [ ] `grep -r "hierarchical-data-table-virtualized" app/ test/` returns 0 matches
- [ ] `pnpm typecheck` passes
**Dependencies:** Task 6e.10
**Commit message:** `chore(operaciones): delete revisar-calculo-factura hierarchical-data-table-virtualized`
**Branch:** `refactor-operaciones-modulos/slice-6e-precios-revisar`

#### Task 6e.12: Create `revisar-calculo-factura-component.test.tsx` colocated test

**Slice:** 6e
**Spec reference:** `specs/routes/revisar-calculo-factura.md#requirement-revisar-calculo-factura-component-calls-service-directly`; `specs/cross-cutting/components-realignment.md`
**File(s) affected:** `app/components/operaciones/revisar-calculo-factura/revisar-calculo-factura-component.test.tsx` (NEW, ~80 LOC)
**Estimated LOC delta:** +80 / +0
**Pre-conditions:** Task 6e.9
**Steps:**
1. Create the colocated test per `design.md` §6.2 Slice 6e. Use `@testing-library/react` `render` + `vi.mock('~/services/operacionesService', ...)`.
2. Assert that the "Lanzar cálculo" handler calls `postRevisarCalculosLanzarCalculo` with a `RevisarCalculosLanzarCalculoRequest` payload.
3. Add a header comment documenting the `test/setup.ts` deferral.
4. Confirm `pnpm typecheck` passes.
**Acceptance criteria:**
- [ ] `app/components/operaciones/revisar-calculo-factura/revisar-calculo-factura-component.test.tsx` exists, is typecheck-clean
- [ ] Test file header documents the deferral
- [ ] `pnpm typecheck` passes
**Dependencies:** Task 6e.9
**Commit message:** `test(operaciones): add colocated test for revisar-calculo-factura-component`
**Branch:** `refactor-operaciones-modulos/slice-6e-precios-revisar`

#### Task 6e.13: Delete 2 dead precios-cargo sub-components

**Slice:** 6e
**Spec reference:** `specs/routes/precios-cargo.md#requirement-data-table-precios-virtualized-deletion-or-extraction` (scenario `virtualized-table-deleted`); columns-enel merge
**File(s) affected:** `app/components/operaciones/precios-cargo/data-table-precios-virtualized.tsx` (294 LOC), `columns-enel.tsx` (218 LOC)
**Estimated LOC delta:** −512 / +0
**Pre-conditions:** Slice 3
**Steps:**
1. Run `grep -rE "data-table-precios-virtualized|precios-cargo/columns-enel" app/ test/` and confirm 0 matches outside the 2 files themselves and explore.md.
2. Delete the 2 files: `git rm app/components/operaciones/precios-cargo/{data-table-precios-virtualized,columns-enel}.tsx`.
3. Confirm `pnpm typecheck` passes (verified after Task 6e.14 renames `columns-enerlova.tsx` to `columns.tsx`).
**Acceptance criteria:**
- [ ] Both files no longer exist
- [ ] `grep -rE "data-table-precios-virtualized|precios-cargo/columns-enel" app/ test/` returns 0 matches
- [ ] `pnpm typecheck` passes
**Dependencies:** Slice 3
**Commit message:** `chore(operaciones): delete 2 dead precios-cargo sub-components`
**Branch:** `refactor-operaciones-modulos/slice-6e-precios-revisar`

#### Task 6e.14: Rename `columns-enerlova.tsx` → `columns.tsx` and update content to consume flat array

**Slice:** 6e
**Spec reference:** `specs/routes/precios-cargo.md#requirement-enel-agualova-split-removed` (scenario `single-table-renders-flat-array`)
**File(s) affected:** `app/components/operaciones/precios-cargo/columns-enerlova.tsx` → renamed to `columns.tsx` (~132 → ~150 LOC, content updated to consume `PreciosConsultarRequest` flat array)
**Estimated LOC delta:** +20 / −20
**Pre-conditions:** Task 6e.13
**Steps:**
1. `git mv app/components/operaciones/precios-cargo/columns-enerlova.tsx app/components/operaciones/precios-cargo/columns.tsx`.
2. Update the content to consume `PreciosConsultarRequest` (from `~/types/operaciones`) instead of the phantom `PreciosCargoAgualova`.
3. Drop the Enel/Agualova split (the columns now render a single flat shape).
4. Confirm `pnpm typecheck` passes.
**Acceptance criteria:**
- [ ] File is named `columns.tsx` (not `columns-enerlova.tsx`)
- [ ] The file imports `PreciosConsultarRequest` from `~/types/operaciones`
- [ ] `pnpm typecheck` passes
**Dependencies:** Task 6e.13
**Commit message:** `refactor(operaciones): rename precios-cargo columns-enerlova to columns and flatten`
**Branch:** `refactor-operaciones-modulos/slice-6e-precios-revisar`

#### Task 6e.15: Update `precios-cargo-component.tsx` to use flat array (no Enel/Agualova split)

**Slice:** 6e
**Spec reference:** `specs/routes/precios-cargo.md#requirement-precios-cargo-component-realigns-types`; `specs/cross-cutting/components-realignment.md`
**File(s) affected:** `app/components/operaciones/precios-cargo/precios-cargo-component.tsx` (567 → ~400 LOC)
**Estimated LOC delta:** +0 / −167
**Pre-conditions:** Task 6e.14
**Steps:**
1. Drop the 3 phantom type imports: `PreciosCargoEnel`, `PreciosCargoAgualova`, `DetallepreciosCargoAgualova`.
2. Add source-of-truth type import: `PreciosConsultarRequest` from `~/types/operaciones`.
3. Replace the Enel/Agualova split with a single table grouped by `codigoInterno` (or another criterion).
4. The component receives `data: PreciosConsultarRequest[]` as a prop (or via context) — passed by the route per Task 4.7.
5. Confirm `pnpm typecheck` passes.
**Acceptance criteria:**
- [ ] `grep -rE "PreciosCargoEnel|PreciosCargoAgualova|DetallepreciosCargoAgualova" app/` returns 0 matches
- [ ] The component imports `PreciosConsultarRequest` from `~/types/operaciones`
- [ ] `pnpm typecheck` passes
**Dependencies:** Task 6e.14
**Commit message:** `refactor(operaciones): realign precios-cargo-component to flat array shape`
**Branch:** `refactor-operaciones-modulos/slice-6e-precios-revisar`

#### Task 6e.16: Update 4 precios-cargo sub-components (data-table-precios, dialog-agregar-precios, dialog-nuevo-valor-enerlova, detalle-precios-enerlova)

**Slice:** 6e
**Spec reference:** `specs/routes/precios-cargo.md#requirement-precios-cargo-component-realigns-types` (inline prop types); `specs/cross-cutting/components-realignment.md`
**File(s) affected:** `data-table-precios.tsx` (256 LOC), `dialog-agregar-precios.tsx`, `dialog-nuevo-valor-enerlova.tsx` (700+ LOC), `detalle-precios-enerlova.tsx` (550 LOC)
**Estimated LOC delta:** +0 / −80
**Pre-conditions:** Task 6e.15
**Steps:**
1. `data-table-precios.tsx`: remove the Enel/Agualova split; consume the flat `PreciosConsultarRequest[]` array.
2. `dialog-agregar-precios.tsx`: declare `DialogAgregarPreciosProps` inline as `type X = { ... }`.
3. `dialog-nuevo-valor-enerlova.tsx`: minor cleanup (drop unused imports, replace `toast.error(error as any)` with `extraerMensajeError`).
4. `detalle-precios-enerlova.tsx`: replace `DetallepreciosCargoAgualova` with inline `type DetallePrecios = Pick<PreciosConsultarRequest, 'codigoInterno' | 'codigoEnerlova' | 'descripcion' | 'valorActual' | 'valorMesAnterior' | 'confirmacion' | 'indice'>`.
5. Confirm `pnpm typecheck` passes.
**Acceptance criteria:**
- [ ] `grep -rE "DialogAgregarPreciosProps|DetallepreciosCargoAgualova" app/components/operaciones/precios-cargo/` returns 0 imports (only inline `type` declarations)
- [ ] `pnpm typecheck` passes
**Dependencies:** Task 6e.15
**Commit message:** `refactor(operaciones): realign 4 precios-cargo sub-components`
**Branch:** `refactor-operaciones-modulos/slice-6e-precios-revisar`

#### Task 6e.17: Verify slice-level smoke check

**Slice:** 6e
**Spec reference:** `specs/routes/precios-cargo.md` (MODIFIED), `specs/routes/revisar-calculo-factura.md` (MODIFIED), `specs/routes/revisar-precio.md` (MODIFIED); `specs/cross-cutting/utils-consolidation.md`
**File(s) affected:** none (verification only)
**Estimated LOC delta:** 0 / +0
**Pre-conditions:** Tasks 6e.1–6e.16
**Steps:**
1. Run `pnpm typecheck && pnpm lint && pnpm build`.
2. Run `grep -rE "RevisarPrecioUno|RevisarPrecioDos|tabla-valores-enel|tabla-valores-enerlova|revisar-precio-helpers|confirmation-helpers|processConfirmations|filterPendingConfirmations|CalculoPrefacturaCompleto|CalculoPrefacturaDetalle|CalculoPrefacturaCargoResponse|hierarchical-data-table-virtualized|columns-enel\.tsx|columns-agualova\.tsx|data-table-precios-virtualized|revisar-precio/data-table-virtualized" app/` and confirm 0 matches.
3. Run `grep -rE "PreciosCargoEnel|PreciosCargoAgualova|DetallepreciosCargoAgualova" app/` and confirm 0 matches.
4. Confirm `git diff --stat app/types/operaciones.ts app/services/operacionesService.ts` is empty.
**Acceptance criteria:**
- [ ] `pnpm typecheck && pnpm lint && pnpm build` pass
- [ ] No phantom types, no dead sub-components, no deleted helpers
- [ ] Source-of-truth files unchanged
**Dependencies:** Tasks 6e.1, 6e.2, 6e.3, 6e.4, 6e.5, 6e.6, 6e.7, 6e.8, 6e.9, 6e.10, 6e.11, 6e.12, 6e.13, 6e.14, 6e.15, 6e.16
**Commit message:** (PR-level smoke check, no new commit)
**Branch:** `refactor-operaciones-modulos/slice-6e-precios-revisar`

#### Slice 6e summary

- **Total tasks:** 17
- **Total estimated LOC delta:** +350 / −1,300 (net −950)
- **Spec coverage:** `specs/routes/precios-cargo.md` (MODIFIED); `specs/routes/revisar-calculo-factura.md` (MODIFIED); `specs/routes/revisar-precio.md` (MODIFIED); `specs/cross-cutting/utils-consolidation.md#requirement-revisar-precio-helpers-deletion`, `#requirement-confirmation-helpers-deletion`; `specs/cross-cutting/hooks-realignment.md` (continuation)
- **Review budget fit:** **PASS** — positive added LOC: 350 (1 hook + 1 columns + 2 tests + 1 dialog). Per-file diffs: 1 at +200, 1 at +80, 1 at +80, 1 at +50, 1 at +30, 1 at +20, then deletions. The slice has the most tasks (17) and the most added files, but each added file is < 250 LOC and the deletions are concentrated in 9 files.
- **Smoke check:** `pnpm typecheck && pnpm lint && pnpm build`

---

### Slice 7 — Style/convention sweep

> **Spec references:** `specs/cross-cutting/style-and-convention-sweep.md` (MODIFIED requirements: `console-statements-removed`, `toast-error-string-argument`, `react-default-import-removed`); `specs/cross-cutting/style-and-convention-sweep.md#requirement-no-empty-pattern-eslint-disable-preserved`
> **Files affected:** ~10-15 files (small line-level changes)
> **Estimated LOC delta:** −100 / +0
> **Branch:** `refactor-operaciones-modulos/slice-7-style-sweep`
> **Commit message:** `chore(operaciones): remove console.* and toast.error(error as any)`

#### Task 7.1: Remove `console.*` statements from target directories

**Slice:** 7
**Spec reference:** `specs/cross-cutting/style-and-convention-sweep.md#requirement-console-statements-removed` (scenario `no-console-statements-in-target-dirs`)
**File(s) affected:** ~10 files in `app/hooks/operaciones/`, `app/utils/operaciones/`, `app/components/operaciones/`, `app/routes/dashboard/operaciones/`
**Estimated LOC delta:** +0 / −40
**Pre-conditions:** Slices 1-6 merged
**Steps:**
1. Run `grep -rE "console\.(log|info|debug|warn)\b" app/hooks/operaciones/ app/utils/operaciones/ app/components/operaciones/ app/routes/dashboard/operaciones/` and identify the 10 files with violations.
2. For each file, remove the `console.log/info/debug/warn` calls. Keep `console.error` only when paired with a `toast.error(...)` for the same condition.
3. Confirm `pnpm lint` (Biome) passes — the `noConsole` rule is enforced.
**Acceptance criteria:**
- [ ] `grep -rE "console\.(log|info|debug|warn)\b" app/hooks/operaciones/ app/utils/operaciones/ app/components/operaciones/ app/routes/dashboard/operaciones/` returns 0 matches
- [ ] `pnpm lint` passes
**Dependencies:** Slices 1, 2a, 3, 4, 5, 6a, 6b, 6c, 6d, 6e
**Commit message:** `chore(operaciones): remove console.log/info/debug/warn from 10 files`
**Branch:** `refactor-operaciones-modulos/slice-7-style-sweep`

#### Task 7.2: Replace `toast.error(error as any)` with `toast.error(extraerMensajeError(error))`

**Slice:** 7
**Spec reference:** `specs/cross-cutting/style-and-convention-sweep.md#requirement-toast-error-string-argument` (scenario `toast-error-uses-string-helper`)
**File(s) affected:** ~10 files
**Estimated LOC delta:** +0 / −30
**Pre-conditions:** Slice 3 (the `extraerMensajeError` helper is available)
**Steps:**
1. Run `grep -rE "toast\.error\([^)]*\bas\s+any\b" app/hooks/operaciones/ app/utils/operaciones/ app/components/operaciones/ app/routes/dashboard/operaciones/` and identify the 10 sites.
2. For each site, replace `toast.error(error as any)` with `toast.error(extraerMensajeError(error))` and add `import { extraerMensajeError } from '~/utils/operaciones';` if not already present.
3. Confirm `pnpm typecheck && pnpm lint` pass.
**Acceptance criteria:**
- [ ] `grep -rE "toast\.error\([^)]*\bas\s+any\b" app/hooks/operaciones/ app/utils/operaciones/ app/components/operaciones/ app/routes/dashboard/operaciones/` returns 0 matches
- [ ] `pnpm typecheck && pnpm lint` pass
**Dependencies:** Slice 3
**Commit message:** `chore(operaciones): replace toast.error(error as any) with extraerMensajeError`
**Branch:** `refactor-operaciones-modulos/slice-7-style-sweep`

#### Task 7.3: Remove `import React from "react"` from target directories

**Slice:** 7
**Spec reference:** `specs/cross-cutting/style-and-convention-sweep.md#requirement-react-default-import-removed` (scenario `no-react-default-import`)
**File(s) affected:** ~10 files
**Estimated LOC delta:** +0 / −10
**Pre-conditions:** Slices 1-6 merged
**Steps:**
1. Run `grep -rE "^import React from ['\"]react['\"]" app/hooks/operaciones/ app/utils/operaciones/ app/components/operaciones/ app/routes/dashboard/operaciones/` and identify the files.
2. For each file, remove the `import React from "react"` line.
3. Confirm `pnpm typecheck` passes (React 19 + Vite 6 + automatic JSX runtime doesn't need this import; `verbatimModuleSyntax: true` flags it).
4. Verify that the `/* eslint-disable no-empty-pattern */` header is preserved on all 10 route files (per `style-and-convention-sweep.md#requirement-no-empty-pattern-eslint-disable-preserved`).
**Acceptance criteria:**
- [ ] `grep -rE "^import React from ['\"]react['\"]" app/hooks/operaciones/ app/utils/operaciones/ app/components/operaciones/ app/routes/dashboard/operaciones/` returns 0 matches
- [ ] `head -1 app/routes/dashboard/operaciones/*.tsx` shows the eslint-disable comment in every route file
- [ ] `pnpm typecheck && pnpm lint` pass
**Dependencies:** Slices 1, 2a, 3, 4, 5, 6a, 6b, 6c, 6d, 6e
**Commit message:** `chore(operaciones): remove import React from "react" from 10 files`
**Branch:** `refactor-operaciones-modulos/slice-7-style-sweep`

#### Task 7.4: Verify slice-level smoke check

**Slice:** 7
**Spec reference:** `specs/cross-cutting/style-and-convention-sweep.md` (all MODIFIED requirements)
**File(s) affected:** none (verification only)
**Estimated LOC delta:** 0 / +0
**Pre-conditions:** Tasks 7.1, 7.2, 7.3
**Steps:**
1. Run `pnpm typecheck && pnpm lint && pnpm build`.
2. Run all 3 grep verifications from Tasks 7.1, 7.2, 7.3 and confirm 0 matches.
3. Run `head -1 app/routes/dashboard/operaciones/*.tsx` and confirm the eslint-disable comment is preserved.
4. Confirm `git diff --stat app/types/operaciones.ts app/services/operacionesService.ts` is empty.
**Acceptance criteria:**
- [ ] `pnpm typecheck && pnpm lint && pnpm build` pass
- [ ] All 3 grep verifications pass
- [ ] Source-of-truth files unchanged
**Dependencies:** Tasks 7.1, 7.2, 7.3
**Commit message:** (PR-level smoke check, no new commit)
**Branch:** `refactor-operaciones-modulos/slice-7-style-sweep`

#### Slice 7 summary

- **Total tasks:** 4
- **Total estimated LOC delta:** +0 / −80
- **Spec coverage:** `specs/cross-cutting/style-and-convention-sweep.md` (all MODIFIED requirements)
- **Review budget fit:** **PASS** — net −80 LOC; per-file diffs < 10 LOC each
- **Smoke check:** `pnpm typecheck && pnpm lint && pnpm build`

---

### Slice 8 — Intra-directory dead-code sweep

> **Spec references:** all 15 spec files (the `*-deletion` and `*-removed` requirements; this slice catches any residual intra-directory dead code that the prior slices missed)
> **Files affected:** mechanical cleanup; small per-file LOC changes
> **Estimated LOC delta:** −200 / +0
> **Branch:** `refactor-operaciones-modulos/slice-8-dead-code-sweep`
> **Commit message:** `chore(operaciones): final intra-directory dead-code sweep`

#### Task 8.1: Delete `app/utils/operaciones/formatters.ts` (now empty after Slice 6 consumers inlined the 3 remaining formatters)

**Slice:** 8
**Spec reference:** `specs/cross-cutting/utils-consolidation.md#requirement-formatters-dot-ts-merge-into-index` (scenario `formatters-merged-or-deleted`)
**File(s) affected:** `app/utils/operaciones/formatters.ts`
**Estimated LOC delta:** −30 / +0
**Pre-conditions:** Slices 5 + 6 merged (consumers in `use-calculo-factura.ts`, `revisar-calculo-factura-component.tsx`, `revisar-precio-component.tsx`, etc. have either inlined `formatPrice`/`formatNumber`/`formatCycle` or moved them to a per-feature location)
**Steps:**
1. Run `grep -rE "from .*utils/operaciones/formatters" app/` and confirm 0 matches (Slices 5+6 updated all consumers).
2. Delete the file: `git rm app/utils/operaciones/formatters.ts`.
3. Update `app/utils/operaciones/index.ts` to remove the `export * from './formatters';` line.
4. Confirm `pnpm typecheck && pnpm lint` pass.
**Acceptance criteria:**
- [ ] File no longer exists
- [ ] `grep -rE "from .*utils/operaciones/formatters" app/` returns 0 matches
- [ ] `pnpm typecheck && pnpm lint` pass
**Dependencies:** Slices 5, 6
**Commit message:** `chore(operaciones): delete formatters.ts (consumers inlined)`
**Branch:** `refactor-operaciones-modulos/slice-8-dead-code-sweep`

#### Task 8.2: Audit each component subdirectory for unused exports/imports

**Slice:** 8
**Spec reference:** general intra-directory dead-code sweep (per `proposal.md` §3.3 and `design.md` §4 Slice 8)
**File(s) affected:** ~20-30 files (unused imports removed)
**Estimated LOC delta:** +0 / −120
**Pre-conditions:** Slices 1-7 merged
**Steps:**
1. Run `pnpm typecheck` and read the output for `X is declared but its value is never read` warnings (TypeScript can report these via the `noUnusedLocals` flag if enabled; if not, use a manual audit).
2. For each file in `app/hooks/operaciones/`, `app/components/operaciones/`, `app/utils/operaciones/`, `app/routes/dashboard/operaciones/`, remove any unused imports.
3. For each file, audit for any now-orphaned local helper functions (e.g. `obtenerCicloParaAPI` that may have survived in a file that didn't get the realignment).
4. Confirm `pnpm typecheck && pnpm lint` pass.
**Acceptance criteria:**
- [ ] `pnpm typecheck && pnpm lint` pass with no unused-import warnings
- [ ] No orphan local helpers remain (per the spec's "intra-directory dead-code sweep")
**Dependencies:** Slices 1, 2a, 3, 4, 5, 6a, 6b, 6c, 6d, 6e, 7
**Commit message:** `chore(operaciones): remove unused imports and orphan helpers`
**Branch:** `refactor-operaciones-modulos/slice-8-dead-code-sweep`

#### Task 8.3: Audit `app/hooks/operaciones/utils/` for any leftover files (e.g. `REFACTORING_SUMMARY.md` if missed in Slice 2a)

**Slice:** 8
**Spec reference:** general audit
**File(s) affected:** `app/hooks/operaciones/utils/` directory
**Estimated LOC delta:** −20 / +0
**Pre-conditions:** Slice 2a (the `cycle-utilities.ts` was already moved; this task checks for any remaining files)
**Steps:**
1. List `ls app/hooks/operaciones/utils/`. Verify the directory is empty (or contains only files that have been verified to be in use).
2. If the directory is empty, remove it: `git rm -r app/hooks/operaciones/utils/`.
3. If any file remains, verify it has consumers and either keep it or delete it.
4. Confirm `pnpm typecheck && pnpm lint` pass.
**Acceptance criteria:**
- [ ] `ls app/hooks/operaciones/utils/` returns "No such file or directory" OR contains only files with verified consumers
- [ ] `pnpm typecheck && pnpm lint` pass
**Dependencies:** Slice 2a
**Commit message:** `chore(operaciones): audit app/hooks/operaciones/utils for leftover files`
**Branch:** `refactor-operaciones-modulos/slice-8-dead-code-sweep`

#### Task 8.4: Verify slice-level smoke check

**Slice:** 8
**Spec reference:** general (the slice is a final polish; all spec requirements are already met by prior slices)
**File(s) affected:** none (verification only)
**Estimated LOC delta:** 0 / +0
**Pre-conditions:** Tasks 8.1, 8.2, 8.3
**Steps:**
1. Run `pnpm typecheck && pnpm lint && pnpm build` and confirm exit 0.
2. Run all the cross-cutting grep verifications from the prior slices (consolidated check):
   - `grep -rE "clientLoader|useLoaderData" app/routes/dashboard/operaciones/` returns 0 matches
   - `grep -rE "^import React from ['\"]react['\"]" app/hooks/operaciones/ app/utils/operaciones/ app/components/operaciones/ app/routes/dashboard/operaciones/` returns 0 matches
   - `grep -rE "URL.createObjectURL" app/` shows matches only in `app/utils/operaciones/download.ts`
   - `grep -rE "const MONTHS = " app/utils/operaciones/ app/components/operaciones/` returns exactly 1 match (the canonical in `constants.ts`)
   - `grep -rE "useCalculoProceso|useValidacionPrecios|NO_LECTURAS_CERRADAS" app/` returns 0 matches
   - `grep -rE "RevisarPrecioUno|RevisarPrecioDos|tabla-valores-enel|tabla-valores-enerlova|CalculoPrefacturaCompleto|CalculoPrefacturaDetalle|CalculoPrefacturaCargoResponse" app/` returns 0 matches
3. Confirm `git diff --stat app/types/operaciones.ts app/services/operacionesService.ts` is empty.
4. Final sanity: `git diff --stat` shows the expected net ~−10,000 LOC delta across the 12 slices.
**Acceptance criteria:**
- [ ] `pnpm typecheck && pnpm lint && pnpm build` pass
- [ ] All cross-cutting grep verifications pass
- [ ] Source-of-truth files unchanged
- [ ] Net ~−10,000 LOC delta confirmed
**Dependencies:** Tasks 8.1, 8.2, 8.3
**Commit message:** (PR-level smoke check, no new commit)
**Branch:** `refactor-operaciones-modulos/slice-8-dead-code-sweep`

#### Slice 8 summary

- **Total tasks:** 4
- **Total estimated LOC delta:** +0 / −170
- **Spec coverage:** all 15 spec files (residual cleanup); `specs/cross-cutting/utils-consolidation.md#requirement-formatters-dot-ts-merge-into-index` (the file is now deleted)
- **Review budget fit:** **PASS** — net −170 LOC; per-file diffs < 10 LOC each
- **Smoke check:** `pnpm typecheck && pnpm lint && pnpm build`

---

## Review Workload Forecast

| Slice | Description | Net LOC delta | Added LOC | Reviewable code (added/mod) | Review budget fit | Estimated review time | Action |
|---|---|---|---|---|---|---|---|
| 1 | Dead directory purge | −5,970 | 0 | 0 | PASS (pure deletions) | <15 min | chained-pr |
| 2a | Dead hook + utils + tests | −1,474 | 0 | 0 | PASS (pure deletions) | <15 min | chained-pr |
| 3 | Utils consolidation | +251 | +318 | +318 | PASS | ~20 min | chained-pr |
| 4 | Routes realignment | −130 | 0 | ~10 (placeholder) | PASS | ~25 min | chained-pr |
| 5 | Hooks realignment | −212 | +110 | +110 | PASS | ~30 min | chained-pr |
| 6a | anular + cambio-medidor + crear-archivos-sap | −602 | +80 | +80 | PASS | ~30 min | chained-pr |
| 6b | cerrar-lecturas | −952 | +30 | +30 | PASS | ~25 min | chained-pr |
| 6c | corte-reposicion | −562 | +130 | +130 | PASS | ~30 min | chained-pr |
| 6d | periodo-facturacion + preparar-lecturas | −1,530 | +150 | +150 | PASS | ~30 min | chained-pr |
| 6e | precios-cargo + revisar-calculo-factura + revisar-precio | −950 | +350 | +350 | PASS | ~50 min | chained-pr |
| 7 | Style sweep | −80 | 0 | 0 (small line edits) | PASS | ~15 min | chained-pr |
| 8 | Intra-directory dead-code sweep | −170 | 0 | 0 (small line edits) | PASS | ~20 min | chained-pr |

**Overall recommendation: chained-pr with these 12 slices as designed.** No slice exceeds the 400-LOC budget for reviewable added/modified code. The deletion-heavy slices (1, 2a, 6b, 6d) have net LOC deltas that massively exceed 400, but the 400 budget applies to reviewable added/modified code (the deletion count is grep-verifiable in <15 minutes, not a review burden). **No slice needs to be split further; no rebalancing is needed.**

**Total estimated LOC delta across the 12 slices:** −10,380 net (≈ −10,500 reported in some `design.md` calculations; the difference is rounding). The refactor is overwhelmingly deletion-driven.

**Total estimated review time across the 12 slices:** ~5 hours cumulative (assuming sequential review by a single reviewer). With 2 reviewers in parallel (one for routes/components, one for hooks/utils), the wall-clock time is ~2.5 hours.

---

## Dependency Graph

```
Slice 1 (dead directory purge)
  └─→ Slice 2a (dead hook + utils + tests)
        └─→ Slice 3 (utils consolidation)
              ├─→ Slice 4 (routes realignment)
              │     └─→ Slice 6a (anular + cambio-medidor + crear-archivos-sap)
              │     └─→ Slice 6b (cerrar-lecturas)
              │     └─→ Slice 6c (corte-reposicion)
              │     └─→ Slice 6d (periodo-facturacion + preparar-lecturas)
              │     └─→ Slice 6e (precios-cargo + revisar-calculo-factura + revisar-precio)
              └─→ Slice 5 (hooks realignment)
                    └─→ Slice 6e (depends on the rewritten useCalculoFactura + consumer call-site changes)
                          └─→ Slice 7 (style sweep)
                                └─→ Slice 8 (intra-directory dead-code sweep)
```

**Acyclic. Each slice depends only on prior slices.** The deepest chain is `1 → 2a → 3 → 4 → 6e → 7 → 8` (7 slices deep). Slices 6a, 6b, 6c, 6d can land in any order after Slices 4 + 5 (they don't share files with each other). The recommended order (in the section above) places them sequentially for incremental review cadence; the strict dependency order is `6e` last among the 6x slices (because 6e depends on Slice 5's rewritten hook + consumer call-site changes).

**Why Slice 1 is foundational:** No other slice can land before Slice 1, because Slice 1 deletes the `reportes/components/operaciones/` mirror which is parallel to (and would be impacted by) some of the later component realignments.

**Why Slice 2a is foundational:** No other slice can land before Slice 2a, because Slice 2a deletes the `use-calculo-facturacion-flow.ts` hook + 3 hook utils + 4 unrunnable tests. The hook utils are referenced by the rewritten `use-calculo-factura.ts` (Slice 5) and the tests are mocked by Slice 6e's component tests.

**Why Slice 3 is foundational:** The 4 new utility files (`download.ts`, `period.ts`, `cycle.ts`, `error.ts`) and the updated `index.ts` are imported by Slices 4, 5, 6a, 6b, 6c, 6d, 6e. Without Slice 3, the later slices cannot use the new helpers.

**Why Slice 4 is foundational:** The 10 route files are realigned before any of the components that they import. Without Slice 4, the consumer components would still call phantom `clientLoader` methods that the routes might still use.

**Why Slice 5 is foundational for Slice 6e:** The rewritten `useCalculoFactura` and the consumer call-site changes in `revisar-calculo-factura-component.tsx` must land before Slice 6e finishes the type realignment of that component.

**Why Slice 7 is last among the realignment slices:** Style fixes are cosmetic; landing them after the realignment prevents the realignment diffs from being contaminated by cosmetic edits.

**Why Slice 8 is last:** The intra-directory dead-code sweep is a mechanical final polish. It depends on Slices 1-7 having been merged so that all consumers of the deleted files have been updated.

---

## Test Strategy per Task

The strict TDD discipline applies to every task that adds or modifies code:

- **RED**: Write the failing test first.
- **GREEN**: Implement the minimum to pass.
- **REFACTOR**: Clean up the implementation while keeping the test passing.

The 10 newly authored test files are unrunnable until `test/setup.ts` is restored in a separate deferred change. `sdd-verify` will only run `pnpm typecheck && pnpm lint && pnpm build`. The test files will compile but not execute.

| Task | Adds or modifies code? | Test added/modified? | Notes |
|---|---|---|---|
| 1.1 | No (deletion) | No | Pure deletion |
| 1.2 | No (deletion) | No | Pure deletion |
| 1.3 | No (verification) | No | PR-level smoke check |
| 2.1 | No (deletion) | No | Pure deletion |
| 2.2 | No (deletion) | No | Pure deletion |
| 2.3 | No (deletion) | No | Pure deletion |
| 2.4 | No (deletion) | No | Pure deletion |
| 2.5 | No (verification) | No | PR-level smoke check |
| 3.1 | Yes (new util) | Yes (download.test.ts) | RED-GREEN-REFACTOR; test unrunnable until `test/setup.ts` restored |
| 3.2 | Yes (new util) | Yes (period.test.ts) | RED-GREEN-REFACTOR |
| 3.3 | Yes (new util) | Yes (error.test.ts) | RED-GREEN-REFACTOR |
| 3.4 | Yes (new util + move) | Yes (cycle.test.ts) | RED-GREEN-REFACTOR; the move is a relocation, the new file has a test |
| 3.5 | Yes (index re-export) | No | Re-exports are not testable in isolation |
| 3.6 | Yes (formatters.ts reduced) | No | The reduction removes code; no new behavior |
| 3.7 | No (verification) | No | PR-level smoke check |
| 4.1-4.10 | Yes (route thinning) | No | Route-level changes only; no new behavior to test |
| 4.11 | No (verification) | No | PR-level smoke check |
| 5.1 | Yes (new test) | Yes (use-calculo-factura.test.ts) | RED test first |
| 5.2 | Yes (hook rewrite) | n/a (test already exists from 5.1) | GREEN-REFACTOR |
| 5.3 | Yes (consumer call-site changes) | No | The changes are extracted from the deleted hooks; tested via the new test from 5.1 |
| 5.4 | No (deletion) | No | Pure deletion |
| 5.5 | No (deletion) | No | Pure deletion |
| 5.6 | No (verification) | No | PR-level smoke check |
| 6a.1, 6a.2 | No (deletions) | No | Pure deletions |
| 6a.3, 6a.4 | Yes (rewrites) | No | Tests are in 6a.5 |
| 6a.5 | Yes (new test) | Yes (cambio-medidor-component.test.tsx) | RED-GREEN-REFACTOR |
| 6a.6 | No (verification) | No | PR-level smoke check |
| 6b.1, 6b.2 | No (deletions) | No | Pure deletions |
| 6b.3-6b.5 | Yes (rewrites) | No | Covered by the Slice 3 utility tests; no new behavior |
| 6b.6 | No (verification) | No | PR-level smoke check |
| 6c.1 | No (deletion) | No | Pure deletion |
| 6c.2-6c.4 | Yes (rewrites) | No | Tests are in 6c.5 |
| 6c.5 | Yes (new test) | Yes (corte-reposicion-component.test.tsx) | RED-GREEN-REFACTOR |
| 6c.6 | No (verification) | No | PR-level smoke check |
| 6d.1, 6d.5 | No (deletions) | No | Pure deletions |
| 6d.2 | Yes (new dialog) | No | The dialog has a clear "feature removed" contract; tests are deferred |
| 6d.3, 6d.4, 6d.6 | Yes (rewrites) | No | Covered by the Slice 3 utility tests; no new behavior |
| 6d.7 | No (verification) | No | PR-level smoke check |
| 6e.1 | Yes (new hook) | No | The hook is small and visually identical to the 4 sites it replaces; tests are deferred |
| 6e.2, 6e.8, 6e.11, 6e.13 | No (deletions) | No | Pure deletions |
| 6e.3, 6e.4, 6e.5, 6e.7, 6e.9, 6e.10, 6e.14, 6e.15, 6e.16 | Yes (rewrites) | No (except 6e.6 and 6e.12) | Tests are in 6e.6 and 6e.12 |
| 6e.6 | Yes (new test) | Yes (dialog-modificar-precio.test.tsx) | RED-GREEN-REFACTOR |
| 6e.12 | Yes (new test) | Yes (revisar-calculo-factura-component.test.tsx) | RED-GREEN-REFACTOR |
| 6e.17 | No (verification) | No | PR-level smoke check |
| 7.1-7.3 | Yes (style fixes) | No | Style changes are not testable in isolation |
| 7.4 | No (verification) | No | PR-level smoke check |
| 8.1 | No (deletion) | No | Pure deletion |
| 8.2-8.3 | Yes (cleanup) | No | Cleanup removes dead code; no new behavior |
| 8.4 | No (verification) | No | PR-level smoke check |

**Total new test files:** 10 (4 util tests in Slice 3, 1 hook test in Slice 5, 4 component tests in Slices 6a/6c/6e×2, 1 dialog test in Slice 6e).
**Total deleted test files:** 4 (3 hook tests + 1 component test, all in Slice 2a).

---

## Out-of-scope tasks (do NOT include in this change)

The following are explicitly out-of-scope per the orchestrator preflight and the design's `§10` (Out of scope):

- `test/setup.ts` restoration — deferred to a separate change. The 10 newly authored test files will compile but not execute until the deferred change lands. `sdd-verify` will only run `pnpm typecheck && pnpm lint && pnpm build`.
- `cambio-medidor` stepper/wizard split — deferred to a future change. The 842-LOC main component is kept intact in this refactor (with only type/service realignment).
- Bundle-size optimization (e.g. adding `lazy()` to heavy components) — deferred. The refactor is a net ~−10,000 LOC reduction; bundle size will improve automatically.
- New architecture adoption (e.g. SWR/React Query, `useAsyncResource` hook) — deferred. The refactor keeps the inline `useState` + `useEffect` pattern.
- Source-of-truth modifications — **forbidden**. `app/types/operaciones.ts` and `app/services/operacionesService.ts` are FROZEN. `git diff --stat` of those two files MUST be empty in every PR.
- `gerRevisarPreciosData` typo fix — preserved (the typo is in the source-of-truth service; cannot be fixed in this refactor).
- `app/components/shared/` additions — none. No new shared UI components in this refactor (per `design.md` §8.4 decision to KEEP-INLINE for virtualized tables; per `design.md` §8.2 decision to DEFER the `useAsyncResource` extraction).
- `app/types/operaciones/` subdirectory — no new files. All type derivations are inline in consumer files (per `design.md` §2.5 hard rule).
- Translation/i18n changes — none. Spanish variable names are a pre-existing project convention; not in scope.
- Permission/auth changes — already removed in a prior session per Engram observation.
- `app/types/monitor.ts` and `app/types/reportes.ts` — not in the target directories.
- The 10 backend endpoints that don't exist in the service — documented but not modified (the service is frozen).
