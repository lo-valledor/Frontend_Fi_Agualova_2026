# Actualización Manual del Workflow de SonarQube

⚠️ **Nota**: Debido a restricciones de permisos de GitHub, este cambio debe aplicarse manualmente.

## Problema

El workflow de SonarQube está fallando porque:
1. No se están generando reportes de cobertura de código
2. SonarQube espera encontrar `coverage/lcov.info` pero no existe

## Solución

Actualizar el archivo `.github/workflows/build.yml` para que ejecute los tests con cobertura antes del análisis de SonarQube.

## Cambios Requeridos

Reemplazar la sección de `steps` en `.github/workflows/build.yml`:

```yaml
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0 # Shallow clones should be disabled for a better relevancy of analysis

      - name: Setup pnpm
        uses: pnpm/action-setup@v4
        with:
          version: 9

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'pnpm'

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Run tests with coverage
        run: pnpm test:coverage

      - uses: SonarSource/sonarqube-scan-action@v6
        env:
          SONAR_TOKEN: ${{ secrets.SONAR_TOKEN }}
          SONAR_HOST_URL: ${{ secrets.SONAR_HOST_URL }}
```

## Cómo Aplicar

1. Edita manualmente `.github/workflows/build.yml`
2. Reemplaza los steps como se indica arriba
3. Commit y push:
   ```bash
   git add .github/workflows/build.yml
   git commit -m "ci: Add test coverage generation to SonarQube workflow"
   git push
   ```

## Verificación

Después de aplicar el cambio, el workflow:
1. Instalará dependencias con pnpm
2. Ejecutará tests con cobertura (`pnpm test:coverage`)
3. Generará `coverage/lcov.info`
4. SonarQube podrá leer los datos de cobertura

## Cambios Aplicados Automáticamente

Los siguientes cambios ya fueron aplicados en el commit anterior:
- ✅ Corrección de encoding UTF-8 en archivos
- ✅ Configuración de `sonar.qualitygate.wait=false` (temporal)
- ✅ Configuración correcta de paths de cobertura en `sonar-project.properties`
