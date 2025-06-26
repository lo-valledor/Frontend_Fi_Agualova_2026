# 🚀 Workflows de CI/CD

Este directorio contiene los workflows de GitHub Actions para automatizar la integración y despliegue continuo del proyecto.

## 📋 Workflows Disponibles

### 1. `ci-cd.yml` - Pipeline Principal de CI/CD

**🎯 Propósito**: Workflow principal que maneja tanto la integración continua como el despliegue continuo.

**🔄 Triggers**:

- Pull requests a cualquier rama
- Push a ramas: `main`, `master`, `develop`, `staging`
- Ejecución manual (`workflow_dispatch`)

**📋 Jobs**:

#### CI (Integración Continua)

- ✅ **Type checking** con TypeScript
- 🧹 **Linting** con ESLint
- 🏗️ **Build** del proyecto
- 💾 **Cache** de dependencias pnpm
- 📤 **Artifacts** de build

#### Deploy Production

- 🚀 Se ejecuta solo en push a `main`/`master`
- 🧹 Limpieza del entorno anterior
- 🏗️ Build y deploy con Docker Compose
- 🔍 Health check post-deploy
- 🗑️ Limpieza de imágenes Docker antiguas

#### Deploy Staging

- 🧪 Se ejecuta en push a `develop`/`staging`
- Similar al deploy de producción pero para staging

### 2. `deploy.yml` - Workflow Legacy (Deprecado)

**⚠️ Estado**: Deprecado, mantenido solo para emergencias.

- Solo se ejecuta manualmente
- Lógica básica de deploy sin CI

## 🔧 Configuración Requerida

### Variables de Entorno (GitHub Secrets)

Configura estos secrets en tu repositorio (`Settings > Secrets and variables > Actions`):

#### Producción

- `VITE_API_URL`: URL de la API de producción
- `PRODUCTION_URL`: URL del sitio de producción (opcional)

#### Staging (Opcional)

- `STAGING_API_URL`: URL de la API de staging
- `STAGING_URL`: URL del sitio de staging (opcional)

### Self-hosted Runner

Los jobs de deploy requieren un runner self-hosted con:

- ✅ Docker y Docker Compose instalados
- ✅ Acceso al servidor de deploy
- ✅ Permisos para ejecutar comandos Docker

## 📊 Flujo de Trabajo Recomendado

### Para Desarrollo

```bash
# 1. Crear rama feature
git checkout -b feature/nueva-funcionalidad

# 2. Hacer cambios y commit
git add .
git commit -m "feat: nueva funcionalidad"

# 3. Push y crear PR
git push origin feature/nueva-funcionalidad
# Crear PR a 'develop' → Ejecuta CI
```

### Para Staging

```bash
# 1. Merge PR a develop
git checkout develop
git merge feature/nueva-funcionalidad
git push origin develop
# → Ejecuta CI + Deploy to Staging
```

### Para Producción

```bash
# 1. Merge develop a main
git checkout main
git merge develop
git push origin main
# → Ejecuta CI + Deploy to Production
```

## 🛠️ Scripts Disponibles

El workflow utiliza estos scripts definidos en `package.json`:

```json
{
  "scripts": {
    "typecheck": "react-router typegen && tsc",
    "lint": "eslint . --ext .ts,.tsx,.js,.jsx",
    "lint:fix": "eslint . --ext .ts,.tsx,.js,.jsx --fix",
    "build": "react-router build",
    "ci": "pnpm run typecheck && pnpm run lint && pnpm run build"
  }
}
```

## 🐛 Troubleshooting

### El CI falla en Type Checking

- Ejecuta `pnpm run typecheck` localmente
- Revisa errores de TypeScript en el código

### El CI falla en Linting

- Ejecuta `pnpm run lint` localmente
- Corrige errores con `pnpm run lint:fix`

### El Deploy falla

- Verifica que los secrets estén configurados
- Revisa los logs del runner self-hosted
- Confirma que Docker Compose está funcionando

### Cache de pnpm no funciona

- El cache se basa en `pnpm-lock.yaml`
- Si cambias la versión de Node.js/pnpm, el cache se regenera

## 📈 Monitoreo

### GitHub Actions

- Ve el estado de los workflows en la pestaña "Actions"
- Revisa los logs detallados de cada step

### Notificaciones

- GitHub enviará notificaciones por email/Slack si configuras webhooks
- Los PRs mostrarán el estado del CI automáticamente

## 🔄 Actualizaciones Futuras

### Posibles Mejoras

- [ ] Tests unitarios/integración
- [ ] Code coverage reports
- [ ] Security scanning (Dependabot, CodeQL)
- [ ] Performance monitoring
- [ ] Slack/Teams notifications
- [ ] Blue-green deployments
- [ ] Rollback automático

### Mantenimiento

- Actualizar versions de actions regularmente
- Revisar y limpiar workflows antiguos
- Monitorear uso de runners self-hosted
