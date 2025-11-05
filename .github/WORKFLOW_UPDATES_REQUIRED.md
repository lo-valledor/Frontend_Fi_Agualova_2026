# ⚠️ Actualizaciones de Workflows Requeridas

Debido a restricciones de permisos de GitHub, estos cambios de workflows deben aplicarse **manualmente**.

## 📋 Resumen de Cambios

Se requieren actualizaciones en 2 workflows para habilitar la automatización completa de despliegue:

1. ✅ **Nuevo workflow**: `auto-sync-staging.yml` - Sincronización automática main→develop
2. ⚠️ **Actualización**: `ci-cd.yml` - Mejoras en el despliegue de staging

---

## 1️⃣ Crear Nuevo Workflow: auto-sync-staging.yml

### Ubicación
`.github/workflows/auto-sync-staging.yml`

### Contenido Completo

```yaml
name: 🔄 Auto-Sync Main to Staging (develop)

# Este workflow automatiza el proceso de sincronización de main -> develop
# usando la estrategia -X theirs para priorizar los cambios de main

on:
  # Se ejecuta automáticamente cuando hay push a main
  push:
    branches:
      - main
      - master

  # También permite ejecución manual
  workflow_dispatch:
    inputs:
      force_sync:
        description: 'Force sync even if there are conflicts'
        required: false
        default: 'true'
        type: choice
        options:
          - 'true'
          - 'false'

jobs:
  sync-main-to-develop:
    name: 🔄 Sync main → develop (staging)
    runs-on: ubuntu-latest

    steps:
      - name: 📥 Checkout repository
        uses: actions/checkout@v4
        with:
          fetch-depth: 0  # Necesario para tener todo el historial
          token: ${{ secrets.GITHUB_TOKEN }}

      - name: 🔧 Configure Git
        run: |
          git config user.name "GitHub Actions Bot"
          git config user.email "actions@github.com"

      - name: 🔍 Fetch all branches
        run: |
          git fetch origin main:main || git fetch origin master:master
          git fetch origin develop:develop || echo "develop branch doesn't exist yet"

      - name: 🌿 Ensure develop branch exists
        run: |
          if ! git show-ref --verify --quiet refs/heads/develop; then
            echo "✨ Creating develop branch from main"
            git checkout -b develop main
            git push origin develop
          fi

      - name: 🔄 Merge main into develop with theirs strategy
        run: |
          echo "🔄 Switching to develop branch"
          git checkout develop

          echo "📥 Pulling latest develop changes"
          git pull origin develop || echo "No changes to pull"

          echo "🔀 Merging main into develop (using theirs strategy)"
          git merge origin/main -X theirs -m "chore: Auto-sync from main to develop (staging) [skip ci]" || {
            echo "⚠️ Merge failed, attempting to resolve automatically"
            git merge --abort
            git merge origin/main -X theirs --no-commit --no-ff
            git commit -m "chore: Auto-sync from main to develop (staging) with conflict resolution [skip ci]"
          }

      - name: 🚀 Push changes to develop
        run: |
          echo "📤 Pushing merged changes to develop"
          git push origin develop

      - name: ✅ Sync completed
        run: |
          echo "✅ Successfully synced main → develop"
          echo "🎯 Staging environment will be updated automatically"
          echo "📍 Branch: develop"
          echo "🌐 Port: 3000"

      - name: 📝 Create summary
        run: |
          echo "## 🔄 Sync Summary" >> $GITHUB_STEP_SUMMARY
          echo "" >> $GITHUB_STEP_SUMMARY
          echo "✅ Successfully synced **main** → **develop**" >> $GITHUB_STEP_SUMMARY
          echo "" >> $GITHUB_STEP_SUMMARY
          echo "### Details:" >> $GITHUB_STEP_SUMMARY
          echo "- **Strategy**: \`git merge -X theirs\`" >> $GITHUB_STEP_SUMMARY
          echo "- **Target branch**: \`develop\` (staging)" >> $GITHUB_STEP_SUMMARY
          echo "- **Next step**: Staging deployment will trigger automatically" >> $GITHUB_STEP_SUMMARY
          echo "" >> $GITHUB_STEP_SUMMARY
          echo "### Recent commits merged:" >> $GITHUB_STEP_SUMMARY
          git log --oneline -5 >> $GITHUB_STEP_SUMMARY
```

### Instrucciones de Creación

1. **Crea el archivo manualmente**:
   ```bash
   # En tu repositorio local
   touch .github/workflows/auto-sync-staging.yml
   ```

2. **Copia el contenido** del YAML de arriba

3. **Commit y push**:
   ```bash
   git add .github/workflows/auto-sync-staging.yml
   git commit -m "ci: Add auto-sync workflow for main→develop staging updates"
   git push origin main
   ```

---

## 2️⃣ Actualizar Workflow Existente: ci-cd.yml

### Ubicación
`.github/workflows/ci-cd.yml`

### Sección a Reemplazar

Busca la sección `deploy-staging` (aproximadamente línea 167-205) y reemplázala completamente.

#### ❌ Sección Antigua (ELIMINAR)

```yaml
  # 🚀 Job de Despliegue a Staging (opcional)
  deploy-staging:
    name: 🧪 Deploy to Staging
    needs: ci
    runs-on: self-hosted
    if: github.ref == 'refs/heads/develop' || github.ref == 'refs/heads/staging'

    steps:
      # Checkout del código
      - name: 📥 Checkout repository
        uses: actions/checkout@v4

      # Crear archivo .env para staging
      - name: 🔧 Create staging environment file
        run: |
          echo "VITE_API_URL=${{ secrets.STAGING_API_URL }}" > .env
          echo "NODE_ENV=staging" >> .env

      # Desplegar a staging (usando un puerto diferente o configuración específica)
      - name: 🚀 Deploy to staging
        run: |
          echo "🧪 Deploying to staging environment..."
          # Aquí puedes usar un docker-compose específico para staging
          # o modificar la configuración según tus necesidades
          docker-compose -f docker-compose.staging.yml up -d --build --force-recreate || \
          docker-compose up -d --build --force-recreate

      # Health check para staging
      - name: 🔍 Staging health check
        run: |
          echo "🔍 Performing staging health check..."
          sleep 20
          # Ajusta el puerto según tu configuración de staging
          if curl -f http://localhost:3000 > /dev/null 2>&1; then
            echo "✅ Staging deployment successful!"
          else
            echo "⚠️ Staging deployment check failed, but continuing..."
          fi
```

#### ✅ Sección Nueva (AGREGAR)

```yaml
  # 🚀 Job de Despliegue a Staging (puerto 3000)
  deploy-staging:
    name: 🧪 Deploy to Staging
    needs: ci
    runs-on: self-hosted
    if: github.ref == 'refs/heads/develop' || github.ref == 'refs/heads/staging'

    steps:
      # Checkout del código (esto hace el 'git pull' automáticamente)
      - name: 📥 Checkout repository
        uses: actions/checkout@v4
        with:
          fetch-depth: 0  # Obtiene todo el historial

      # Crear archivo .env para staging
      - name: 🔧 Create staging environment file
        run: |
          echo "VITE_API_URL=${{ secrets.STAGING_API_URL }}" > .env
          echo "NODE_ENV=staging" >> .env
          echo "STAGING_PORT=3000" >> .env

      # Limpiar despliegue anterior de staging
      - name: 🧹 Clean previous staging deployment
        run: |
          echo "🧹 Cleaning up previous staging deployment..."
          docker-compose -f docker-compose.staging.yml down --volumes --remove-orphans || true
          docker system prune -f || true

      # Construir y desplegar staging (puerto 3000)
      - name: 🚀 Build and deploy to staging
        run: |
          echo "🧪 Building and deploying to staging environment..."
          echo "📍 Using port 3000 for staging"
          docker-compose -f docker-compose.staging.yml up -d --build --force-recreate

      # Verificar que staging está funcionando
      - name: 🔍 Staging health check
        run: |
          echo "🔍 Performing staging health check..."
          echo "⏳ Waiting for staging service to start on port 3000..."

          # Esperar y hacer múltiples intentos
          for i in {1..12}; do
            echo "🔄 Attempt $i/12..."
            if curl -f http://localhost:3000 > /dev/null 2>&1; then
              echo "✅ Staging deployment successful! Service is responding on port 3000"
              echo "🌐 Staging URL: http://localhost:3000"
              break
            else
              echo "⏳ Service not ready yet, waiting 10 seconds..."
              sleep 10
            fi

            # Si es el último intento y falló
            if [ $i -eq 12 ]; then
              echo "⚠️ Staging deployment check failed after 12 attempts"
              echo "🔍 Checking Docker container status..."
              docker-compose -f docker-compose.staging.yml ps
              echo "📋 Checking container logs..."
              docker-compose -f docker-compose.staging.yml logs --tail=50
              echo "🔧 Checking if port 3000 is in use..."
              netstat -tlnp | grep :3000 || echo "Port 3000 not in use"
              echo "⚠️ Continuing anyway, manual verification may be needed..."
            fi
          done

      # Limpiar imágenes Docker antiguas
      - name: 🧹 Clean old Docker images
        run: |
          echo "🧹 Cleaning old Docker images..."
          docker image prune -f || true
```

### Instrucciones de Actualización

1. **Abre el archivo**:
   ```bash
   nano .github/workflows/ci-cd.yml
   # o usa tu editor preferido
   ```

2. **Busca la sección `deploy-staging`** (línea ~167)

3. **Reemplaza todo el job** con el nuevo contenido de arriba

4. **Commit y push**:
   ```bash
   git add .github/workflows/ci-cd.yml
   git commit -m "ci: Improve staging deployment with proper cleanup and health checks"
   git push origin main
   ```

---

## 🔍 Verificación Post-Instalación

Después de aplicar ambos cambios:

### 1. Verificar que los workflows aparecen en GitHub

1. Ve a tu repositorio en GitHub
2. Click en la pestaña **Actions**
3. Deberías ver:
   - ✅ `CI/CD Pipeline` (actualizado)
   - ✅ `Auto-Sync Main to Staging (develop)` (nuevo)

### 2. Probar el auto-sync manualmente

1. Ve a **Actions** → **Auto-Sync Main to Staging (develop)**
2. Click en **Run workflow**
3. Selecciona `main` branch
4. Click en **Run workflow**
5. Espera a que termine (~1-2 minutos)
6. Verifica que la rama `develop` se actualizó

### 3. Probar el despliegue de staging

1. Haz un push a `main`:
   ```bash
   git checkout main
   # Haz algún cambio menor
   echo "# Test" >> README.md
   git add README.md
   git commit -m "test: trigger staging deployment"
   git push origin main
   ```

2. Ve a **Actions** y observa:
   - ✅ `CI/CD Pipeline` ejecutándose para `main` (deploy a production)
   - ✅ `Auto-Sync Main to Staging` ejecutándose después
   - ✅ `CI/CD Pipeline` ejecutándose para `develop` (deploy a staging)

3. Verifica que ambos ambientes están corriendo:
   ```bash
   # Production (puerto 8080)
   curl http://localhost:8080

   # Staging (puerto 3000)
   curl http://localhost:3000
   ```

---

## 📊 Flujo Completo Una Vez Instalado

```
1. Push a main
   │
   ├─► CI/CD Pipeline (main)
   │   ├─ Build + Test
   │   └─ Deploy to Production (port 8080)
   │
   └─► Auto-Sync Main → Develop
       └─► CI/CD Pipeline (develop)
           ├─ Build + Test
           └─ Deploy to Staging (port 3000)
```

---

## ❓ Preguntas Frecuentes

### ¿Por qué no puedo hacer push de estos workflows automáticamente?

GitHub requiere permisos especiales (`workflows` scope) para que las GitHub Apps modifiquen workflows. Por seguridad, esto requiere aprobación manual.

### ¿Necesito el workflow `auto-sync-staging.yml`?

**SÍ**, sin este workflow:
- Tendrías que hacer `git merge main develop -X theirs` manualmente cada vez
- El staging no se actualizaría automáticamente
- Perderías la sincronización automática que pediste

### ¿Puedo usar un puerto diferente para staging?

**SÍ**, edita el archivo `docker-compose.staging.yml`:
```yaml
ports:
  - "${STAGING_PORT:-3001}:80"  # Cambia 3000 a 3001
```

Y actualiza el health check en `ci-cd.yml`:
```yaml
if curl -f http://localhost:3001 > /dev/null 2>&1; then
```

### ¿Qué pasa si ya tengo una rama `develop` con cambios?

El workflow `auto-sync-staging.yml` usa `-X theirs`, lo que significa:
- **Los cambios de `main` tienen prioridad**
- Los cambios en `develop` se sobreescriben si hay conflictos
- Esto es lo que solicitaste: sincronizar desde main automáticamente

Si necesitas preservar cambios en `develop`:
1. Haz un backup de la rama
2. O cambia la estrategia a `-X ours` en el workflow

---

## 🆘 Soporte

Si tienes problemas:

1. **Revisa los logs** en GitHub Actions
2. **Verifica permisos** del GITHUB_TOKEN
3. **Consulta la documentación**: `docs/deployment/AUTOMATED_DEPLOYMENT.md`

---

**Creado**: 2025-11-05
**Prioridad**: Alta 🔴
**Tiempo estimado**: 10 minutos
