# Utilities Consolidation & Organization Plan

**Date:** 2025-12-02
**Status:** Planning Phase
**Total Utilities:** 47 files across 9 locations (~9,350 lines)
**Complexity:** Medium-High (Strategic reorganization)

---

## Executive Summary

Your application's utilities are currently spread across 9 locations with significant overlap:
- **47 files** total utility code
- **~9,350 lines** of utility code
- **~30% duplication** in export/formatting, date handling, and error handling logic
- **Inconsistent naming** conventions for validators and formatters

This plan addresses consolidation in 5 phases, with **zero breaking changes** when done correctly.

---

## Current State Analysis

### Utilities Distribution

| Location | Files | Size | Purpose |
|----------|-------|------|---------|
| `app/utils/` (root) | 15 | 2.4 KB | Core cross-app utilities |
| `app/utils/administracion/` | 6 | 14 KB | Admin module helpers |
| `app/utils/monitor/` | 5 | 25 KB | Monitor utilities |
| `app/utils/operaciones/` | 8 | 18 KB | Operations utilities |
| `app/hooks/shared/utils/` | 4 | 26 KB | Shared hook utilities |
| `app/hooks/utils/` | 4 | 14 KB | General hook utilities |
| `app/hooks/administracion/utils/` | 3 | 12 KB | Admin hook utilities |
| `app/hooks/operaciones/utils/` | 4 | 9 KB | Operations hook utilities |
| `app/lib/utils.ts` | 1 | 6 lines | CSS utilities |
| **TOTAL** | **47** | **~9.3 KB** | |

---

## Identified Overlaps

### 1. Export/Formatting (CRITICAL - 4 locations)
**Files:**
- `app/hooks/shared/utils/export-formatters.ts` (200+ lines) - Generic formatters
- `app/hooks/administracion/utils/export-utilities.ts` (174 lines) - ExportColumnBuilder pattern
- `app/hooks/shared/utils/csv-excel-utils.ts` (183 lines) - CSV/Excel export
- `app/utils/operaciones/formatters.ts` (2.3 KB) - Operation-specific formatters

**Issue:** Export logic scattered between hooks and root utils. No clear separation.

**Impact:** Duplicated formatting logic, inconsistent export implementation

---

### 2. Date/Time Formatting (HIGH - 3 locations)
**Files:**
- `app/utils/date-formatter.ts` (51 lines) - Basic date formatting
- `app/hooks/shared/utils/export-formatters.ts` - Date export formatting
- `app/utils/monitor/monitor-formatters.ts` (5.4 KB) - Monitor-specific formatting

**Issue:** Date formatting logic duplicated with different APIs

**Impact:** Inconsistent date handling across modules

---

### 3. Error Handling (MEDIUM - 3 locations)
**Files:**
- `app/utils/administracion/clientes-helpers.ts` - Error extraction logic
- `app/utils/operaciones/error-handler.ts` (2.7 KB) - Operation error handling
- `app/hooks/operaciones/utils/error-handler.ts` (2.7 KB) - Hook error handling

**Issue:** Error handling patterns duplicated

**Impact:** Inconsistent error messages and handling

---

### 4. Permission Utilities (MEDIUM - 2 locations)
**Files:**
- `app/utils/permission-utils.ts` (107 lines) - Core permission logic
- `app/hooks/utils/permissions-helpers.ts` (125 lines) - Hook-specific helpers

**Issue:** Unclear separation between core and hook-specific logic

**Impact:** Maintenance burden, potential logic inconsistencies

---

### 5. Filter/Validation Logic (MEDIUM - 2 locations)
**Files:**
- `app/hooks/administracion/utils/filter-utilities.ts` (6.4 KB)
- `app/utils/operaciones/validations.ts` (3.3 KB)
- `app/hooks/operaciones/utils/price-validator.ts` (900+ bytes)

**Issue:** Similar patterns in different modules without abstraction

**Impact:** Hard to maintain consistent validation patterns

---

## Consolidation Roadmap

### Phase 1: Export/Formatting Consolidation (CRITICAL)

**Goal:** Single source of truth for all export functionality

**Action Items:**

1. **Create `app/utils/export/` folder** with:
   - `index.ts` - Barrel exports
   - `column-builder.ts` - Moved from `app/hooks/administracion/utils/export-utilities.ts`
   - `formatters.ts` - Consolidated from `app/hooks/shared/utils/export-formatters.ts`
   - `csv-excel.ts` - Moved from `app/hooks/shared/utils/csv-excel-utils.ts`
   - `pdf-rendering.ts` - Moved from `app/hooks/shared/utils/pdf-rendering.ts`
   - `types.ts` - Shared export types/interfaces

2. **Update imports in:**
   - `app/hooks/shared/use-export-data.ts` → import from `~/utils/export/csv-excel`
   - `app/hooks/shared/use-export-pdf.ts` → import from `~/utils/export/pdf-rendering`
   - `app/hooks/administracion/use-export-*.ts` → import from `~/utils/export/column-builder`
   - All export-related hooks

3. **Create deprecation strategy:**
   - Keep old files as deprecation stubs for 1 release
   - Add deprecation warnings in console
   - Remove after one release cycle

4. **Benefits:**
   - ✅ Single source of truth
   - ✅ Easier to maintain export logic
   - ✅ Better code reuse across modules
   - ✅ Reduced duplication (~200 lines saved)

**Impact:** Medium - Requires import updates across hooks

---

### Phase 2: Date/Time Utilities Consolidation (HIGH)

**Goal:** Unified date formatting API

**Action Items:**

1. **Expand `app/utils/date-formatter.ts`** with:
   - Existing functions from `date-formatter.ts`
   - Export date formatters from `app/hooks/shared/utils/export-formatters.ts`
   - Monitor formatters from `app/utils/monitor/monitor-formatters.ts`
   - Create consistent API for all use cases

2. **Create comprehensive interface:**
   ```typescript
   // Core formatters (keep existing)
   export function formatToDate(date: Date): string
   export function formatToTime(time: Date): string
   export function formatToYYYYMMDD(date: Date): string

   // Add export variants
   export function formatDateForExport(date: Date): string
   export function formatDateForCsv(date: Date): string

   // Add monitor variants
   export function formatDateForMonitor(date: Date): string
   ```

3. **Update imports in:**
   - `app/hooks/shared/utils/export-formatters.ts` (delegate to date-formatter)
   - `app/utils/monitor/monitor-formatters.ts` (delegate to date-formatter)
   - All components using date formatting

4. **Benefits:**
   - ✅ Consistent date handling across app
   - ✅ Single configuration point for locale/format
   - ✅ Easier to update date formats globally
   - ✅ Reduced code duplication (~80 lines)

**Impact:** Low-Medium - Mostly import updates, backward compatible with aliases

---

### Phase 3: Permission Utilities Separation (MEDIUM)

**Goal:** Clear boundary between core and hook-specific logic

**Action Items:**

**Option A (Recommended): Wrapper Pattern**

1. Keep `app/utils/permission-utils.ts` as core library
2. Refactor `app/hooks/utils/permissions-helpers.ts` as thin wrapper:
   ```typescript
   // app/hooks/utils/permissions-helpers.ts
   import { isPermissionGranted, hasAllPermissions } from '~/utils/permission-utils';

   export function buildPermissionQuery(canView, canCreate, canEdit, canDelete) {
     // Wrapper-specific logic only
   }
   ```
3. Document clear separation in both files

**Option B (Alternative): Full Merge**

1. Move all permission logic to `app/utils/permission-utils.ts`
2. Remove `app/hooks/utils/permissions-helpers.ts`
3. Hooks import directly from root utils

2. **Benefits:**
   - ✅ Clear separation of concerns
   - ✅ Easy to locate permission logic
   - ✅ Reduced maintenance burden
   - ✅ Consistent permission checking patterns

**Impact:** Low - Mostly clarification, minimal refactoring

---

### Phase 4: Module-Specific Utilities Organization (HIGH)

**Goal:** Clear organization principle for module utilities

**Action Items:**

1. **Establish clear rules:**
   - **Shared/Generic logic** → `app/utils/{module}/`
   - **Hook-specific logic** → `app/hooks/{module}/utils/`
   - **Test utilities** → `app/{module}/__tests__/utils/` (if needed)

2. **Current misorganization identified:**
   - Export utilities are in HOOKS, should be in ROOT (`app/utils/export/`)
   - Some hook utilities could be in root if they're module-agnostic
   - Filter utilities are in hooks, could be in `app/utils/administracion/`

3. **Recommended moves:**
   ```
   Move TO app/utils/:
   - app/hooks/administracion/utils/filter-utilities.ts → app/utils/administracion/filter-utilities.ts
   - app/hooks/administracion/utils/stats-calculator.ts → app/utils/administracion/stats-calculator.ts
   - app/hooks/administracion/utils/export-utilities.ts → app/utils/export/column-builder.ts

   Keep IN app/hooks/utils/ (hook-specific):
   - keyboard-helpers.ts ✓ (only used in hooks)
   - debug-detectors.ts ✓ (only used in useDebugInfo)
   - data-loader.ts ✓ (only used in hooks)
   - permissions-helpers.ts (wrapper for hook needs)

   Evaluate operaciones:
   - cycle-utilities.ts (duplicate in both, consolidate)
   - data-combiner.ts (duplicate in both, consolidate)
   - error-handler.ts (duplicate in both, consolidate)
   ```

4. **Benefits:**
   - ✅ Clear organization principle
   - ✅ Easier to find utilities
   - ✅ Reduced duplication
   - ✅ Better separation: reusable vs. hook-specific

**Impact:** Medium - Requires strategic moving, minimal logic changes

---

### Phase 5: Error Handling Consolidation (MEDIUM)

**Goal:** Single error handling pattern

**Action Items:**

1. **Create `app/utils/error-handler.ts`** with:
   - Generic error extraction
   - Error message formatting
   - Error type detection
   - Logging utilities

2. **Consolidate duplicate files:**
   - Extract from `app/utils/administracion/clientes-helpers.ts` → dedicated utility
   - Merge `app/utils/operaciones/error-handler.ts` with root
   - Remove `app/hooks/operaciones/utils/error-handler.ts` (use root version)

3. **Create consistent API:**
   ```typescript
   export function extractErrorMessage(error: unknown): string
   export function logError(context: string, error: unknown): void
   export function isNetworkError(error: unknown): boolean
   export function isValidationError(error: unknown): boolean
   ```

4. **Benefits:**
   - ✅ Consistent error handling
   - ✅ Centralized error logging
   - ✅ Type-safe error extraction
   - ✅ Reduced duplication (~50 lines)

**Impact:** Low-Medium - Mostly cleanup, backward compatible

---

## Implementation Strategy

### Phase Execution Order

1. **Phase 1** (Export/Formatting) - FIRST
   - Most critical duplication
   - Enables Phase 2 (date consolidation)
   - Clear structure

2. **Phase 2** (Date/Time) - SECOND
   - Depends on export consolidation
   - Quick win, low impact
   - High value

3. **Phase 4** (Module Organization) - THIRD
   - Structural reorganization
   - Prepares for utilities audit
   - Medium impact

4. **Phase 3** (Permissions) - FOURTH
   - Clarification mostly
   - No urgency
   - Low impact

5. **Phase 5** (Error Handling) - FIFTH
   - Final cleanup
   - Non-critical
   - Low impact

---

## Naming Convention Standardization

### Current Inconsistencies Found

| Pattern | Files | Recommendation |
|---------|-------|-----------------|
| `*-utils.ts` | 12 files | Keep (most common) |
| `*-helpers.ts` | 8 files | Keep (for helper functions) |
| `*-formatters.ts` | 3 files | Standardize (current) |
| `validations.ts` (inconsistent) | 2 files | Standardize to `*-validations.ts` |
| `-formatter.ts` (singular) | 2 files | Use `-formatters.ts` (plural) |

### Recommended Standards

**Going Forward:**
- `*-utils.ts` - General utility functions
- `*-helpers.ts` - Helper functions specific to a domain
- `*-formatters.ts` - Formatting functions (always plural)
- `*-validations.ts` - Validation functions (always plural)
- `*-handlers.ts` - Handler/processor functions
- `*-calculator.ts` - Calculation functions

---

## Migration Strategy

### Breaking Changes

**⚠️ NONE if done correctly** - All changes can be backward compatible using re-exports

### Deprecation Pattern

```typescript
// Old location (app/hooks/shared/utils/export-formatters.ts)
// Add deprecation notice:
/**
 * @deprecated Use ~/utils/export/formatters instead
 */
import { formatDateForExport } from '~/utils/export/formatters';

export { formatDateForExport };
```

### Timeline

- **Phase 1-2:** 1-2 days (critical consolidations)
- **Phase 3-4:** 1-2 days (structural changes)
- **Phase 5:** 0.5 days (cleanup)
- **Testing:** 1 day (verify all imports work)
- **Deprecation removal:** Next release cycle

---

## Testing Checklist

### Before Starting

- [ ] All tests passing
- [ ] Git branch created: `refactor/utilities-consolidation`
- [ ] Changes documented in commit messages

### Per Phase

- [ ] All files moved/consolidated
- [ ] All imports updated
- [ ] Old locations have deprecation stubs
- [ ] Tests still passing
- [ ] No TypeScript errors
- [ ] ESLint passing

### Final Verification

- [ ] All 47 utilities accounted for
- [ ] No broken imports
- [ ] No dead code
- [ ] Deprecation warnings working (console check)
- [ ] Documentation updated

---

## Success Criteria

✅ **Consolidation Goals:**
- Reduce utility file count: 47 → ~38 files (-19%)
- Reduce duplication: ~30% → ~5%
- Improve organization clarity
- Zero breaking changes for consumers
- Consistent naming conventions
- Clear separation: app/utils vs app/hooks/*/utils

✅ **Code Quality:**
- All tests passing
- TypeScript strict mode compliant
- ESLint clean
- Consistent documentation

✅ **Maintainability:**
- Single source of truth for export logic
- Unified date formatting
- Clear error handling pattern
- Easy to locate utilities

---

## Recommended Next Steps

1. **Review this plan** with team
2. **Approve consolidation approach** (Option A or B for permissions)
3. **Create feature branch**: `refactor/utilities-consolidation`
4. **Execute Phase 1** (Export/Formatting) - most critical
5. **Execute Phase 2** (Date/Time) - quick win
6. **Execute Phases 3-5** - structural improvements
7. **Testing & verification**
8. **Create pull request** for team review

---

## Risks & Mitigation

| Risk | Probability | Mitigation |
|------|-------------|-----------|
| Import path changes break components | Medium | Update imports systematically, use deprecation stubs |
| Merge conflicts in shared files | Low | Coordinate phase timing |
| Performance impact | Very Low | No functional changes, just reorganization |
| Missing consolidation opportunity | Low | Use this plan as checklist |

---

## Questions for User

Before implementation, please clarify:

1. **Permissions Consolidation:** Option A (wrapper pattern) or Option B (full merge)?
2. **Phase Scope:** Start with Phase 1-2 only, or all 5 phases?
3. **Timeline:** Incremental phases per PR, or single large PR?
4. **Deprecation:** Keep old files with deprecation warnings, or remove immediately?
5. **Documentation:** Update README with utilities organization guide?

