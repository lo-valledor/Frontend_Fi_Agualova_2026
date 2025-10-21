# 🚀 Workflows de CI/CD - Enerlova Frontend

Este directorio contiene los workflows de GitHub Actions para automatizar la integración continua, despliegue, revisión de código y documentación del proyecto **Enerlova**.

---

## 📋 Workflows Disponibles

### 1. `ci-cd.yml` - Pipeline Principal de CI/CD ⭐

**🎯 Propósito**: Workflow principal que maneja la integración continua y el despliegue automático a producción y staging.

**🔄 Triggers**:
- Pull requests a cualquier rama
- Push a ramas: `main`, `master`, `develop`, `staging`
- Ejecución manual (`workflow_dispatch`)

**📋 Jobs**:

#### 🧪 CI (Integración Continua)

Ejecuta en: `ubuntu-latest`

**Steps**:
1. ✅ **Type checking** con TypeScript (`pnpm run typecheck`)
2. 🧹 **Linting** con ESLint (`pnpm run lint`)
3. 🧪 **Tests unitarios** con Vitest (`pnpm run test:run`)
4. 🏗️ **Build** del proyecto (`pnpm run build`)
5. 💾 **Cache** de dependencias pnpm basado en `pnpm-lock.yaml`
6. 📤 **Artifacts** de build (retención: 1 día)

**Configuración**:
- Node.js: v20
- pnpm: v9
- Cache inteligente basado en hash de lockfile

#### 🚀 Deploy Production

Ejecuta en: `self-hosted` (solo en push a `main`/`master`)

**Steps**:
1. 🔧 Creación de archivo `.env` con secrets
2. 🧹 Limpieza del entorno anterior (`docker-compose down`)
3. 🏗️ Build y deploy con Docker Compose (`--build --force-recreate`)
4. 🔍 Health check post-deploy (15 intentos, 15s entre cada uno)
5. 🗑️ Limpieza de imágenes Docker antiguas
6. 📊 Logs detallados en caso de fallo

**Variables requeridas**:
- `VITE_API_URL`: URL de la API de producción
- Puerto expuesto: `8080`

#### 🧪 Deploy Staging

Ejecuta en: `self-hosted` (solo en push a `develop`/`staging`)

**Steps**:
- Similar al deploy de producción pero con configuración de staging
- Usa `STAGING_API_URL` secret
- Puerto expuesto: `3000`
- Soporta docker-compose.staging.yml o configuración por defecto

---

### 2. `build.yml` - SonarQube Scan (Solo Producción)

**🎯 Propósito**: Análisis de calidad de código con SonarQube en cada push a producción.

**🔄 Triggers**:
- Push a rama `main` únicamente

**📋 Configuration**:
- Runner: `self-hosted, linux`
- JDK: 11 (Temurin)
- SonarQube URL: `http://192.168.1.139:9000`
- Project Key: `lo-valledor_Frontend_Fi_Enerlova_2025`

**🔐 Secrets requeridos**:
- `SONAR_TOKEN`: Token de autenticación de SonarQube

---

### 3. `documentation.yml` - Auto-Generación de Documentación 📚

**🎯 Propósito**: Genera automáticamente documentación de código cuando se modifican archivos relevantes.

**🔄 Triggers**:
- Push a `main` o `develop`
- Pull requests a `main` o `develop`
- Paths monitoreados:
  - `app/services/**`
  - `app/components/**`
  - `app/hooks/**`
  - `app/types/**`
  - `app/lib/**`

**📋 Features**:
1. 🤖 Generación automática con scripts PowerShell
2. 📖 TypeDoc para documentación de tipos
3. 📝 Commit automático de cambios (push a `main`/`develop`)
4. 💬 Comentarios en PRs con archivos generados
5. 📤 Artifacts de documentación (retención: 30 días)
6. 🚀 Deploy opcional a GitHub Pages

**📊 Documentación generada**:
- `docs/generated/components.md` - Componentes React
- `docs/generated/services.md` - Servicios API
- `docs/generated/api.md` - Documentación de API
- `docs/typedoc/` - Documentación TypeDoc completa

**⚙️ Comandos locales**:
```bash
pnpm run docs:generate       # Docs personalizadas
pnpm run docs:typedoc        # TypeDoc
pnpm run docs:all            # Toda la documentación
pnpm run docs:components     # Solo componentes
pnpm run docs:services       # Solo servicios
```

---

### 4. `claude-code-review.yml` - Revisión Automatizada con IA 🤖

**🎯 Propósito**: Revisión automática de código usando Claude AI en pull requests.

**🔄 Triggers**:
- Pull requests (`opened`, `synchronize`)

**📋 Features**:
- 🔍 Análisis de bugs y vulnerabilidades de seguridad
- 💡 Sugerencias de mejoras de código
- 📝 Comentarios directos en el PR
- 🔄 Sticky comments (reutiliza el mismo comentario en pushes subsecuentes)

**🔐 Secrets requeridos**:
- `CLAUDE_CODE_OAUTH_TOKEN`: Token OAuth de Claude

**⚙️ Personalización**:
```yaml
# Prompt actual
direct_prompt: |
  Please review this pull request and look for bugs and security issues.
  Only report on bugs and potential vulnerabilities you find. Be concise.

# Herramientas permitidas (opcional)
# allowed_tools: "Bash(pnpm run test),Bash(pnpm run lint),Bash(pnpm run typecheck)"
```

---

### 5. `development.yml` - Build de Desarrollo

**🎯 Propósito**: Build y deploy automático del entorno de desarrollo.

**🔄 Triggers**:
- Push a rama `develop`
- Pull requests a `develop`

**📋 Steps**:
1. 🟢 Setup Node.js v22
2. 📦 Instalación con pnpm
3. 🧪 Ejecución de tests
4. 🏗️ Build con variables de desarrollo
5. 🐳 Construcción de imagen Docker dev
6. 🚀 Deploy con docker-compose.dev.yml

**🌐 Configuración**:
- API URL: `http://192.168.1.139:8081/Enerlova`
- NODE_ENV: `development`
- Runner: `self-hosted, linux`

---

### 6. `deploy.yml` - Deploy Legacy (Deprecado) ⚠️

**⚠️ Estado**: **DEPRECADO** - Mantenido solo para emergencias

**🔄 Trigger**:
- Solo ejecución manual (`workflow_dispatch`)

**📝 Nota**: Este workflow ha sido reemplazado por `ci-cd.yml`. Use solo en casos de emergencia y considere su eliminación una vez confirmado que el nuevo workflow funciona correctamente.

---

## 🔧 Configuración Requerida

### 📦 Variables de Entorno (GitHub Secrets)

Configure estos secrets en: `Settings > Secrets and variables > Actions`

#### Producción (Requeridos)
```
VITE_API_URL              # http://192.168.1.139:8081/Enerlova
```

#### Staging (Opcional)
```
STAGING_API_URL           # URL de la API de staging
```

#### Herramientas Externas
```
SONAR_TOKEN               # Token de SonarQube
CLAUDE_CODE_OAUTH_TOKEN   # Token OAuth de Claude
```

---

### 🖥️ Self-hosted Runner

Los jobs de deploy requieren un runner self-hosted con:

#### Requisitos del Sistema
- ✅ Sistema operativo: Linux
- ✅ Docker Engine instalado y configurado
- ✅ Docker Compose (v2+)
- ✅ Acceso de red al servidor de deploy
- ✅ Permisos para ejecutar comandos Docker sin sudo
- ✅ Puertos disponibles: `8080` (prod), `3000` (staging)

#### Configuración del Runner
```bash
# 1. Descargar y configurar el runner desde GitHub
# Settings > Actions > Runners > New self-hosted runner

# 2. Instalar Docker (si no está instalado)
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER

# 3. Instalar Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# 4. Verificar instalación
docker --version
docker-compose --version

# 5. Iniciar el runner
./run.sh
```

---

## 📊 Flujo de Trabajo Recomendado

### 🔄 Para Desarrollo (Feature/Fix)

```bash
# 1. Crear rama desde develop
git checkout develop
git pull origin develop
git checkout -b feature/nueva-funcionalidad

# 2. Hacer cambios y commits
git add .
git commit -m "feat: agregar nueva funcionalidad"

# 3. Push y crear PR
git push origin feature/nueva-funcionalidad
# Crear PR a 'develop' → ✅ Ejecuta CI + Claude Review
```

**Workflows ejecutados**:
- ✅ CI/CD Pipeline (CI job)
- 🤖 Claude Code Review
- 📚 Documentation (si se modificaron archivos relevantes)

---

### 🧪 Para Staging

```bash
# 1. Merge de feature a develop (después de PR aprobado)
git checkout develop
git merge --no-ff feature/nueva-funcionalidad
git push origin develop
# → ✅ Ejecuta CI + Deploy to Staging + Development Build
```

**Workflows ejecutados**:
- ✅ CI/CD Pipeline (CI + Deploy Staging)
- 🏗️ Development Build
- 📚 Documentation
- 🤖 SonarQube (si está en main)

---

### 🚀 Para Producción

```bash
# 1. Crear PR de develop a main
git checkout main
git pull origin main
# Crear PR desde develop → ✅ Ejecuta CI + Reviews

# 2. Después de PR aprobado y merged
# → ✅ Ejecuta CI + Deploy to Production + SonarQube
```

**Workflows ejecutados**:
- ✅ CI/CD Pipeline (CI + Deploy Production)
- 🔍 SonarQube Scan
- 📚 Documentation
- 🤖 Claude Code Review (durante el PR)

---

## 🛠️ Scripts Utilizados por los Workflows

### package.json Scripts

```json
{
  "scripts": {
    "dev": "react-router dev",
    "build": "react-router build",
    "start": "react-router-serve ./build/server/index.js",
    "typecheck": "react-router typegen && tsc",
    "lint": "eslint . --ext .ts,.tsx,.js,.jsx",
    "lint:fix": "eslint . --ext .ts,.tsx,.js,.jsx --fix",
    "format": "prettier --write .",
    "format:check": "prettier --check .",
    "test": "vitest",
    "test:run": "vitest run",
    "test:coverage": "vitest run --coverage",
    "test:ui": "vitest --ui",
    "ci": "pnpm run typecheck && pnpm run lint && pnpm run test:run && pnpm run build",
    "docs:generate": "pwsh -ExecutionPolicy Bypass -File ./scripts/generate-docs.ps1",
    "docs:components": "pwsh -ExecutionPolicy Bypass -File ./scripts/generate-docs.ps1 -Target components",
    "docs:services": "pwsh -ExecutionPolicy Bypass -File ./scripts/generate-docs.ps1 -Target services",
    "docs:typedoc": "pnpm exec typedoc --out docs/typedoc app",
    "docs:all": "pnpm run docs:generate && pnpm run docs:typedoc"
  }
}
```

---

## 🐛 Troubleshooting

### ❌ El CI falla en Type Checking

**Causa**: Errores de tipos TypeScript

**Solución**:
```bash
# Ejecutar localmente
pnpm run typecheck

# Revisar errores
# Corregir tipos en los archivos indicados
```

---

### ❌ El CI falla en Linting

**Causa**: Violaciones de reglas de ESLint

**Solución**:
```bash
# Ejecutar localmente
pnpm run lint

# Auto-corregir cuando sea posible
pnpm run lint:fix

# Revisar y corregir manualmente los errores restantes
```

---

### ❌ El CI falla en Tests

**Causa**: Tests unitarios fallidos

**Solución**:
```bash
# Ejecutar tests localmente
pnpm run test

# Ver cobertura
pnpm run test:coverage

# Modo interactivo
pnpm run test:ui
```

---

### ❌ El Deploy falla

**Causas comunes**:

1. **Secrets no configurados**
   ```bash
   # Verificar en: Settings > Secrets and variables > Actions
   # Asegurar que VITE_API_URL está configurado
   ```

2. **Runner self-hosted no disponible**
   ```bash
   # En el servidor, verificar estado del runner
   ./run.sh status

   # Reiniciar si es necesario
   ./run.sh
   ```

3. **Docker no responde**
   ```bash
   # Verificar Docker
   docker ps
   docker-compose ps

   # Ver logs
   docker-compose logs -f
   ```

4. **Puerto en uso**
   ```bash
   # Verificar puertos
   sudo netstat -tlnp | grep :8080
   sudo netstat -tlnp | grep :3000

   # Detener contenedor anterior si es necesario
   docker-compose down
   ```

---

### ❌ Health Check falla

**Causa**: Aplicación no responde en el puerto esperado

**Solución**:
```bash
# Verificar logs del contenedor
docker-compose logs -f

# Verificar estado
docker-compose ps

# Verificar configuración de puertos en docker-compose.yml
cat docker-compose.yml | grep -A 5 ports

# Probar acceso manual
curl http://localhost:8080
curl http://localhost:3000
```

---

### ❌ Cache de pnpm no funciona

**Causa**: Cambio en versión de Node.js o pnpm

**Solución**:
- El cache se regenera automáticamente basado en:
  - Hash de `pnpm-lock.yaml`
  - Versión de Node.js
  - Sistema operativo del runner
- No requiere acción manual

---

### ❌ SonarQube falla

**Causas comunes**:

1. **Token inválido**
   ```bash
   # Verificar secret SONAR_TOKEN
   # Regenerar token en SonarQube si es necesario
   ```

2. **Servidor SonarQube no accesible**
   ```bash
   # Verificar conectividad
   curl http://192.168.1.139:9000
   ```

---

### ❌ Claude Code Review no comenta

**Causas comunes**:

1. **Token OAuth inválido**
   - Verificar secret `CLAUDE_CODE_OAUTH_TOKEN`
   - Regenerar token si es necesario

2. **Permisos insuficientes**
   - El token debe tener permisos de lectura/escritura en PRs

---

## 📈 Monitoreo y Observabilidad

### 📊 GitHub Actions Dashboard

```
Repository → Actions tab
```

**Información disponible**:
- ✅ Estado de workflows activos
- 📊 Historial de ejecuciones
- ⏱️ Tiempos de ejecución
- 📝 Logs detallados de cada step
- 📈 Tendencias de éxito/fallo

### 🔔 Notificaciones

**Configuración automática**:
- ✉️ Email por defecto en fallos
- 📱 Notificaciones GitHub en PRs

**Configuración adicional** (opcional):
```yaml
# Agregar a cualquier workflow para Slack
- name: Notify Slack
  if: failure()
  uses: 8398a7/action-slack@v3
  with:
    status: ${{ job.status }}
    webhook_url: ${{ secrets.SLACK_WEBHOOK }}
```

### 📊 Métricas Clave

| Métrica | Meta | Actual |
|---------|------|--------|
| CI Duration | < 5 min | ~3-4 min |
| Deploy Duration | < 3 min | ~2 min |
| Success Rate | > 95% | Monitorear |
| Cache Hit Rate | > 80% | Depende de cambios |

---

## 🔄 Actualizaciones y Mejoras Futuras

### 📝 Backlog de Mejoras

#### 🧪 Testing
- [ ] Tests de integración automatizados
- [ ] Tests E2E con Playwright/Cypress
- [ ] Code coverage reports en PRs
- [ ] Visual regression testing

#### 🔒 Seguridad
- [ ] Dependabot para actualizaciones automáticas
- [ ] CodeQL analysis para vulnerabilidades
- [ ] Secret scanning
- [ ] Container vulnerability scanning

#### 📊 Calidad
- [ ] Performance budgets y monitoring
- [ ] Bundle size analysis en PRs
- [ ] Lighthouse CI para métricas web
- [ ] Accessibility testing automatizado

#### 🚀 Deploy
- [ ] Blue-green deployments
- [ ] Canary deployments
- [ ] Rollback automático en fallos
- [ ] Smoke tests post-deploy
- [ ] Notificaciones Slack/Teams

#### 📚 Documentación
- [ ] Storybook para componentes
- [ ] API documentation con Swagger
- [ ] Changelog automático
- [ ] Release notes automáticas

---

## 🔧 Mantenimiento

### 📅 Tareas Periódicas

#### Semanal
- [ ] Revisar workflows fallidos
- [ ] Verificar uso de runners self-hosted
- [ ] Limpiar artifacts antiguos

#### Mensual
- [ ] Actualizar versions de actions
- [ ] Revisar y optimizar caché
- [ ] Auditar secrets y tokens
- [ ] Revisar métricas de CI/CD

#### Trimestral
- [ ] Actualizar dependencias de CI
- [ ] Revisar configuración de SonarQube
- [ ] Optimizar tiempos de build
- [ ] Documentar cambios y mejoras

### 🔄 Actualización de Actions

```yaml
# Mantener actions actualizadas
actions/checkout@v4           # ✅ Última versión
actions/setup-node@v4         # ✅ Última versión
pnpm/action-setup@v4          # ✅ Última versión
actions/cache@v4              # ✅ Última versión
actions/upload-artifact@v4    # ✅ Última versión
```

---

## 📚 Recursos Adicionales

### 📖 Documentación Relacionada

- [CONTRIBUTING.md](../../CONTRIBUTING.md) - Guía de contribución
- [docs/DEVELOPER_GUIDE.md](../../docs/DEVELOPER_GUIDE.md) - Guía de desarrollador
- [docs/deployment/DEPLOY-README.md](../../docs/deployment/DEPLOY-README.md) - Guía de deployment
- [docs/deployment/README-DOCKER.md](../../docs/deployment/README-DOCKER.md) - Configuración Docker

### 🔗 Enlaces Útiles

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [pnpm Documentation](https://pnpm.io/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [SonarQube Documentation](https://docs.sonarqube.org/)
- [Claude Code Documentation](https://docs.anthropic.com/claude/docs)

---

## 📞 Soporte

### 🆘 Obtener Ayuda

1. **Revisar logs en GitHub Actions**
   - Ir a Actions tab
   - Seleccionar workflow fallido
   - Revisar logs detallados

2. **Documentación del proyecto**
   - README.md principal
   - Documentación en carpeta docs/

3. **Contacto**
   - Equipo de desarrollo
   - Tech lead del proyecto

---

<div align="center">

**⚡ Enerlova CI/CD - Automatización con GitHub Actions**

*Última actualización: 2025*

</div>
