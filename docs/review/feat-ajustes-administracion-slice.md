# feat/ajustes administracion slice

This note documents the second review slice from `feat/ajustes`, focused on
administración consumer alignment plus the small mantención column cleanup that
belongs to the same pass.

## Quick path

1. Review issue [#48](https://github.com/lo-valledor/Frontend_Fi_Agualova_2026/issues/48).
2. Focus first on `administracionService.ts` and `app/types/administracion.ts`.
3. Then verify the affected UI consumers and the minor mantención column
   cleanup.

## Scope

| Area | Purpose |
|------|---------|
| `app/services/administracionService.ts` | Align service contract and response helpers used by administración consumers |
| `app/types/administracion.ts` | Keep frontend consumers aligned with the shared shapes |
| `app/components/administracion/**` | Remove local drift in forms, columns, and table consumers |
| `app/routes/dashboard/administracion/condiciones-contrato.tsx` | Keep route wiring aligned with the updated condiciones flow |
| `app/hooks/use-administracion.ts` | Keep shared administración hook usage in sync |
| `app/components/mantencion/**` | Apply the same small column cleanup on touched maintenance tables |

## Review focus

### 1. Contract alignment

- Verify that administración consumers now follow the current service/type
  shapes instead of keeping local mismatches.
- Pay special attention to table columns and modal/form props.

### 2. Condiciones de contrato flow

- Table, route, modal, and details view should tell the SAME story.
- Reviewers should confirm there is no separate interpretation of the same
  backend shape in each component.

### 3. Mantención cleanup

- The mantención changes are intentionally small.
- They belong here because they are the same table-column cleanup pattern, not a
  separate product behavior change.

## Validation path

| Check | Purpose |
|-------|---------|
| `pnpm exec biome check --write --no-errors-on-unmatched <touched files>` | Formatting and static cleanup |
| `pnpm exec react-router typegen` | Route type regeneration |
| `pnpm exec tsc` | Contract/type verification across consumers |
| pre-commit hook suite | Final integration gate before push |

## Out of scope

- Monitor export and active-period work (already isolated in PR #47)
- Dashboard shell, navigation, and shared table shell cleanup
- CI workflow and skill-registry maintenance changes
