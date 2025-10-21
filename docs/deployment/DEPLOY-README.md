# 🚀 Enerlova Frontend - Guía de Despliegue

Esta guía cubre el despliegue del frontend de Enerlova en diferentes entornos usando Docker, scripts automatizados y CI/CD con GitHub Actions.

## 📋 Entornos Disponibles

| Entorno        | Rama      | Puerto | API URL                            | Método de Deploy        |
| -------------- | --------- | ------ | ---------------------------------- | ----------------------- |
| **Producción** | `main`    | 8080   | http://192.168.1.139:8081/Enerlova | CI/CD + Manual          |
| **Staging**    | `develop` | 3000   | http://192.168.1.139:8082/Enerlova | CI/CD + Manual          |
| **Local Dev**  | cualquier | 5173   | http://192.168.1.139:8081/Enerlova | Manual (pnpm dev)       |
| **Docker Dev** | cualquier | 3000   | http://192.168.1.139:8082/Enerlova | Manual (docker-compose) |

## 🛠️ Uso Rápido

### Método 1: Scripts Automatizados

#### Linux/Mac:

```bash
# Dar permisos de ejecución
chmod +x deploy.sh

# Desplegar producción
./deploy.sh prod

# Desplegar desarrollo
./deploy.sh dev

# Desplegar ambos
./deploy.sh both

# Ver estado
./deploy.sh status

# Detener servicios
./deploy.sh stop
```

#### Windows PowerShell:

```powershell
# Desplegar producción
.\deploy.ps1 prod

# Desplegar desarrollo
.\deploy.ps1 dev

# Desplegar ambos
.\deploy.ps1 both

# Ver estado
.\deploy.ps1 status

# Detener servicios
.\deploy.ps1 stop
```

### Método 2: Docker Compose Manual

#### Producción (Puerto 8080):

```bash
docker-compose -f docker-compose.prod.yml up --build -d
```

#### Desarrollo (Puerto 3000):

```bash
docker-compose -f docker-compose.develop.yml up --build -d
```

#### Ambos entornos:

```bash
docker-compose -f docker-compose.multi.yml up --build -d
```

## 🔧 Configuración

### Variables de Entorno

Cada entorno tiene su configuración específica:

- **Producción**: `VITE_API_URL=http://192.168.1.139:8081/Enerlova`
- **Desarrollo**: `VITE_API_URL=http://192.168.1.139:8082/Enerlova`

### Archivos de Configuración

```
├── docker-compose.yml          # Configuración original
├── docker-compose.prod.yml     # Solo producción
├── docker-compose.develop.yml  # Solo desarrollo
├── docker-compose.multi.yml    # Ambos entornos
├── Dockerfile                  # Dockerfile original
├── Dockerfile.multi           # Dockerfile multi-stage
├── deploy.sh                  # Script Linux/Mac
├── deploy.ps1                 # Script Windows
└── .github/workflows/         # CI/CD automático
    ├── deploy-production.yml
    └── deploy-development.yml
```

## 🚀 CI/CD Automático con GitHub Actions

### 📊 Workflows Disponibles

El proyecto incluye varios workflows automáticos de GitHub Actions:

#### 1. **CI/CD Pipeline Principal** (`ci-cd.yml`)

**Triggers**:

- ✅ Pull requests a cualquier rama
- ✅ Push a `main`, `master`, `develop`, `staging`
- ✅ Ejecución manual

**Jobs**:

- **CI**: Type checking, linting, tests, build (en `ubuntu-latest`)
- **Deploy Production**: Despliega a producción en self-hosted runner (solo `main`)
- **Deploy Staging**: Despliega a staging en self-hosted runner (solo `develop`)

#### 2. **SonarQube Scan** (`build.yml`)

- Se ejecuta solo en push a `main`
- Análisis de calidad de código
- Requiere `SONAR_TOKEN` secret

#### 3. **Documentación Automática** (`documentation.yml`)

- Se ejecuta en push/PR a `main` o `develop`
- Genera documentación de componentes y servicios
- Hace commit automático de la documentación generada

#### 4. **Claude Code Review** (`claude-code-review.yml`)

- Revisión automática de código con IA
- Se ejecuta en pull requests
- Requiere `CLAUDE_CODE_OAUTH_TOKEN` secret

#### 5. **Development Build** (`development.yml`)

- Build específico para desarrollo
- Push a rama `develop`
- Build y deploy automático del entorno de desarrollo

### 🔐 Secrets Requeridos en GitHub

Configura estos secrets en: `Settings > Secrets and variables > Actions`

```bash
# API URLs
VITE_API_URL              # URL de API de producción
STAGING_API_URL           # URL de API de staging (opcional)

# Herramientas externas
SONAR_TOKEN               # Token de SonarQube
CLAUDE_CODE_OAUTH_TOKEN   # Token OAuth de Claude (opcional)
```

### 🖥️ Self-hosted Runner

Los deploys requieren un runner self-hosted con:

- ✅ Linux (Ubuntu recomendado)
- ✅ Docker Engine
- ✅ Docker Compose v2+
- ✅ Puertos 8080 (prod) y 3000 (staging) disponibles

**Setup del runner**:

```bash
# 1. Configurar desde GitHub: Settings > Actions > Runners > New self-hosted runner

# 2. Instalar Docker
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER

# 3. Instalar Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# 4. Iniciar runner
./run.sh
```

### 📚 Documentación Completa

Para documentación detallada de workflows, consulta:

- **[Workflows CI/CD](../../.github/workflows/README.md)** - Documentación completa de todos los workflows

## 🌐 Acceso a los Entornos

Una vez desplegados:

- **Producción**: http://localhost:8080
- **Desarrollo**: http://localhost:3000

## 🐛 Solución de Problemas

### Ver logs de contenedores:

```bash
# Producción
docker-compose -f docker-compose.prod.yml logs -f

# Desarrollo
docker-compose -f docker-compose.develop.yml logs -f
```

### Limpiar y reiniciar:

```bash
# Detener todo
./deploy.sh stop

# Limpiar imágenes y contenedores
./deploy.sh clean

# Reiniciar
./deploy.sh both
```

### Verificar estado:

```bash
./deploy.sh status
```

## 📦 Comandos Útiles

```bash
# Ver contenedores activos
docker ps

# Ver imágenes
docker images

# Limpiar sistema Docker
docker system prune -f

# Reconstruir sin caché
docker-compose -f docker-compose.prod.yml up --build --force-recreate -d
```

## 🔄 Flujo de Trabajo Recomendado

### Para Desarrollo (Feature/Fix)

```bash
# 1. Crear rama desde develop
git checkout develop
git pull origin develop
git checkout -b feature/nueva-funcionalidad

# 2. Desarrollar localmente
pnpm dev  # → http://localhost:5173

# 3. Testing y commits
pnpm run typecheck
pnpm run lint
pnpm run test:run
git add .
git commit -m "feat: nueva funcionalidad"

# 4. Push y crear PR a develop
git push origin feature/nueva-funcionalidad
# → ✅ GitHub Actions ejecuta CI + Claude Review
```

### Para Staging

```bash
# 1. Merge de PR aprobado a develop
# → ✅ GitHub Actions despliega automáticamente a staging (puerto 3000)

# 2. Verificar en staging
curl http://staging-server:3000
```

### Para Producción

```bash
# 1. Crear PR de develop a main
# → ✅ GitHub Actions ejecuta CI completo

# 2. Merge aprobado a main
# → ✅ GitHub Actions despliega automáticamente a producción (puerto 8080)
# → ✅ SonarQube ejecuta análisis de calidad

# 3. Verificar en producción
curl http://production-server:8080
```

## 📊 Monitoreo Post-Deploy

### Verificar Deploy Exitoso

```bash
# Ver logs de contenedor
docker-compose logs -f

# Ver estado de contenedores
docker ps

# Health check manual
curl http://localhost:8080/
```

### Ver Logs de GitHub Actions

1. Ve a `Repository → Actions`
2. Selecciona el workflow ejecutado
3. Revisa logs de cada step

## 🆘 Troubleshooting

Ver la [sección de Troubleshooting](../../.github/workflows/README.md#-troubleshooting) en la documentación de workflows para solución de problemas comunes.

## 📚 Referencias Adicionales

- **[Workflows CI/CD](../../.github/workflows/README.md)** - Documentación completa
- **[Docker Environments](./DOCKER-ENVIRONMENTS.md)** - Configuración de entornos
- **[README Docker](./README-DOCKER.md)** - Guía completa de Docker
- **[CLAUDE.md](../../CLAUDE.md)** - Instrucciones para Claude Code

---

¡Listo! Ahora tienes un sistema completo de CI/CD con múltiples entornos. 🎉
