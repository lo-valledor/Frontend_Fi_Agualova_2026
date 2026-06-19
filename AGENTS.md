# Repository Guidelines

## Project Structure & Module Organization

This repository is a React Router 7 + Vite frontend. Application code lives in `app/`, organized by responsibility: `components/`, `routes/`, `hooks/`, `services/`, `utils/`, `context/`, and `types/`. Static assets such as icons and images live in `public/`, while app-specific assets and fonts live under `app/assets/`. Container and deployment files are kept at the repository root (`Dockerfile*`, `docker-compose*.yml`, `nginx*.conf`, `deploy.ps1`, `deploy.sh`).

## Build, Test, and Development Commands

- `pnpm dev` — start the local development server.
- `pnpm build` — create the production build.
- `pnpm start` — serve the built app from `build/server/index.js`.
- `pnpm lint` / `pnpm lint:fix` — check or auto-fix ESLint issues.
- `pnpm format` / `pnpm format:check` — write or verify Prettier formatting.
- `pnpm typecheck` — generate React Router types and run TypeScript checks.
- `pnpm test` / `pnpm test:run` — run Vitest in watch or single-run mode.
- `pnpm test:coverage` — generate coverage output.
- `pnpm ci` — run the local CI pipeline: typecheck, lint, test, and build.

## Coding Style & Naming Conventions

Use TypeScript with strict mode enabled. Prettier is the formatting source of truth: 2-space indentation, single quotes, semicolons, max line width of 80, and LF line endings. ESLint enforces React, import hygiene, and unused import cleanup. Use the `~/*` alias for imports from `app/`. Prefer kebab-case for feature folders (`consultar-contrato`), PascalCase for React components, and colocated test files named `*.test.ts` or `*.test.tsx`.

## Testing Guidelines

Vitest runs in `jsdom` and discovers `**/*.{test,spec}.{ts,tsx}`. Keep tests close to the code they validate, as seen in `app/components/.../*.test.tsx` and `app/hooks/.../*.test.ts`. Focus new tests on hooks, utilities, and critical UI behavior. Run `pnpm test:coverage` before opening larger changes.

## Commit & Pull Request Guidelines

Follow conventional commits already used in the history, for example: `fix: update Docker Hub push step` or `chore: enhance CI/CD workflow`. Keep commits focused and descriptive. Pull requests should explain the user-facing impact, list affected areas, link the issue when available, and include screenshots or short recordings for UI changes.

## Security & Configuration Tips

Do not commit secrets. Use `.env` for local configuration and keep `.env.example` updated when variables change. When modifying Docker, nginx, or deployment scripts, verify both local startup and production build behavior before merging.
