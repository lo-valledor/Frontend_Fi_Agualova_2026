# Testing Capabilities

**Strict TDD Mode**: enabled
**Detected**: 2026-06-19
**Project**: frontend_fi_agualova_2026

## Test Runner

- Command (single-run): `pnpm test:run` (alias `vitest run`)
- Command (watch): `pnpm test` (alias `vitest`)
- Command (coverage): `pnpm test:coverage` (alias `vitest run --coverage`)
- Command (UI): `pnpm test:ui` (alias `vitest --ui`)
- Framework: Vitest 3.2.6
- Environment: `jsdom` (config in `vitest.config.ts`)
- Globals: `true` (describe/it/expect available without imports)
- Setup file: `./test/setup.ts` — **MISSING** (config references it, file does not exist; full suite currently fails to load)

## Test Layers

| Layer        | Available | Tool                                                                       |
| ------------ | --------- | -------------------------------------------------------------------------- |
| Unit         | ✅        | Vitest                                                                     |
| Component    | ✅        | @testing-library/react 16 + @testing-library/user-event 14 + @testing-library/jest-dom 6 |
| Integration  | ✅        | msw (Mock Service Worker) 2                                               |
| E2E          | ❌        | — (no Playwright/Cypress/Selenium in `package.json`)                       |

## Coverage

- Available: ✅
- Command: `pnpm test:coverage` (= `vitest run --coverage`)
- Provider: `@vitest/coverage-v8`
- Reporters: text, json, html, lcov
- Default excludes: `node_modules/`, `build/`, `.react-router/`, `**/*.d.ts`, `**/*.config.*`, `**/mockData`, `test/`, `**/*.{test,spec}.{ts,tsx}`

## Quality Tools

| Tool         | Available | Command         | Notes                                                                  |
| ------------ | --------- | --------------- | ---------------------------------------------------------------------- |
| Linter       | ✅        | `pnpm lint`     | `@biomejs/biome 2.5.0` (`biome lint --write`). Config: `biome.json`.   |
| Type checker | ✅        | `pnpm typecheck`| `react-router typegen && tsc`                                          |
| Formatter    | ✅        | `pnpm format`   | `@biomejs/biome 2.5.0` (`biome format --write`). 2-space, single quotes, semicolons, 80 cols, LF. |
| CI pipeline  | ✅        | `pnpm ci`       | `typecheck && lint && test:run && build`                               |

## Discovered Tests

27 colocated test files: 14 in `app/components/...`, 7 in `app/hooks/...`, 6 in `app/utils/...`. All currently fail
to load because the Vitest setup file is missing.

## Known Blocker

`vitest.config.ts` line 10 references `setupFiles: ['./test/setup.ts']` but the `test/` directory does not exist
anywhere in the repo. The first time a change needs the full suite green, the setup file should be restored. A
minimal version that matches the installed packages would be:

```ts
// test/setup.ts
import '@testing-library/jest-dom/vitest';
```

This is a one-line restoration; once added, `pnpm test:run` should reach the test bodies.

## Local CI vs. SDD verify

- Local full pipeline: `pnpm ci` — typecheck + lint + test:run + build.
- SDD `verify` phase should run: `pnpm typecheck` + `pnpm lint` + `pnpm test:run` + `pnpm build`, and (optionally)
  `pnpm test:coverage` for the coverage delta.
