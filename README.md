# Agualova Frontend

## Releases

Este repositorio usa `release-please` para formalizar el versionado y documentar cambios.

### Flujo

1. Los cambios se integran usando commits convencionales.
2. Cada push a `main` ejecuta el workflow `Release Please`.
3. Si detecta cambios relevantes, GitHub abre o actualiza un PR de release.
4. Ese PR actualiza:
- `package.json`
- `.release-please-manifest.json`
- `CHANGELOG.md`
5. Al mergear el PR de release, `release-please` crea el tag y la release de GitHub.

### Convenciones del release

- El PR de release se titula como `chore(main): release 1.2.3`
- La GitHub Release usa el tag con prefijo `v`, por ejemplo `v1.2.3`
- El changelog publica solo cambios relevantes para release:
  - `feat`
  - `fix`
  - `perf`
  - `revert`
- Los commits `chore`, `docs`, `test`, `refactor`, `style`, `build` y `ci` no aparecen en el changelog publico

### Tipos de commit recomendados

- `feat:` incrementa minor
- `fix:` incrementa patch
- `feat!:` o `fix!:` incrementa major
- `chore:`, `docs:`, `refactor:`, `test:`, `build:` y `ci:` no se publican en el changelog de release

### Guardas locales

Antes de commit:

- `lint-staged`
- `typecheck`
- `test:run`
- validacion de mensaje con `commitlint`

Antes de push:

- `pnpm run ci`

### Proteccion recomendada para `main`

Configurar en GitHub Branch Protection Rules para `main`:

1. Require a pull request before merging
2. Require approvals
3. Require status checks to pass before merging

Checks recomendados:

- `CI`
- `PR Validation / CI`
- `PR Validation / Docker Build`

Si usan el PR de release generado por `release-please`, ese PR tambien debe pasar los mismos checks antes de mergearse.
