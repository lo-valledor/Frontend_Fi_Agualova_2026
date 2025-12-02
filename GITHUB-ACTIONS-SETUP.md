# 🔧 GitHub Actions Setup - Enerlova Frontend

## Configuración Requerida en GitHub

### 1. Repository Secrets

Ve a **Settings → Secrets and variables → Actions** y agrega estos Secrets:

| Secret | Valor | Ejemplo |
|--------|-------|---------|
| `VITE_API_URL` | URL del Backend | `http://192.168.1.139:8081/Enerlova` |
| `STAGING_API_URL` | URL Staging (opcional) | `http://192.168.1.139:8081/Enerlova-staging` |

### 2. Runner Configuration (Self-Hosted)

El workflow usa `runs-on: self-hosted`, lo que significa que necesitas registrar un GitHub Actions Runner en tu servidor.

#### En el servidor (192.168.1.139):

```bash
# 1. Descargar el runner
mkdir -p /home/tecnologia/github-runner
cd /home/tecnologia/github-runner

# Descargar la última versión
wget https://github.com/actions/runner/releases/download/v2.318.0/actions-runner-linux-x64-2.318.0.tar.gz
tar xzf actions-runner-linux-x64-2.318.0.tar.gz

# 2. Generar token en GitHub
# Settings → Developer settings → Personal access tokens → Tokens (classic)
# Permisos: repo, workflow, admin:repo_hook, admin:org_hook

# 3. Configurar el runner
./config.sh --url https://github.com/tu-usuario/tu-repo --token TU_TOKEN_AQUI

# 4. Instalar y arrancar como servicio
./svc.sh install
./svc.sh start

# 5. Verificar estado
./svc.sh status
```

---

## Workflow Automation

### Triggers

El workflow se dispara automáticamente en:

- **Merge a main/master** → Despliegue a Producción
- **Merge a develop/staging** → Despliegue a Staging
- **Manual dispatch** → Ejecución manual desde GitHub

### Pasos del Pipeline CI/CD

```
1. 🧪 Continuous Integration (runs-on: ubuntu-latest)
   ├─ Type checking (TypeScript)
   ├─ Linting (ESLint)
   ├─ Tests (Unit tests)
   └─ Build (Vite)

2. 🚀 Deploy to Production (runs-on: self-hosted, if: main)
   ├─ Build Docker image
   ├─ Stop previous container
   ├─ Run new container
   ├─ Health check
   └─ Cleanup

3. 🧪 Deploy to Staging (runs-on: self-hosted, if: develop)
   └─ Similar al deploy de producción
```

---

## Docker Deployment (Sin Docker Compose)

El workflow ahora usa `docker run` en lugar de `docker-compose`:

```bash
docker run -d \
  --name enerlova-frontend-prod \
  --restart unless-stopped \
  -p 8080:80 \
  --log-driver json-file \
  --log-opt max-size=10m \
  --log-opt max-file=3 \
  enerlova-frontend:latest
```

### Ventajas

- ✅ No requiere Docker Compose
- ✅ Funciona en cualquier máquina con Docker
- ✅ Más control sobre los parámetros
- ✅ Logs centralizados y rotados automáticamente

---

## Monitoring del Workflow

### En GitHub

1. Ir a **Actions** en tu repositorio
2. Seleccionar el workflow
3. Ver el estado de ejecución en tiempo real
4. Revisar logs de cada paso

### En el Servidor

```bash
# Ver logs del contenedor
docker logs enerlova-frontend-prod

# Seguir logs en tiempo real
docker logs -f enerlova-frontend-prod

# Ver contenedores
docker ps -a

# Estadísticas
docker stats enerlova-frontend-prod
```

---

## Troubleshooting

### El runner no conecta

```bash
# Verificar estado del servicio
systemctl status actions.runner.*

# Ver logs del runner
cd /home/tecnologia/github-runner
tail -f _diag/Runner_*.log
```

### Build falla

```bash
# Revisar logs en GitHub Actions
# Actions → último workflow → Expand logs

# O en el servidor después de fallido:
docker logs enerlova-frontend-prod
```

### Container no inicia

```bash
# Verificar si el puerto 8080 está libre
sudo lsof -i :8080

# Verificar imagen Docker
docker images | grep enerlova

# Intentar correr manualmente
docker run -p 8080:80 enerlova-frontend:latest
```

---

## Rollback Manual

Si el despliegue falla y necesitas revertir:

```bash
# Detener contenedor actual
docker stop enerlova-frontend-prod
docker rm enerlova-frontend-prod

# Ejecutar versión anterior
docker images  # Ver histórico de imágenes

# O hacer rollback a commit anterior en GitHub
# Ir a Actions → Seleccionar workflow de versión anterior → Re-run
```

---

## Variables de Entorno

El Dockerfile espera estas variables de build:

- `VITE_API_URL` - URL del backend (obligatoria)
  - Se obtiene de: `${{ secrets.VITE_API_URL }}` en GitHub Secrets
- `VITE_ENV_MODE` - Modo de entorno (por defecto: production)

Se pasan automáticamente desde los Secrets de GitHub al workflow.

---

## Arquitectura de Seguridad

```
┌─────────────────────────────────────┐
│      GitHub Actions (Cloud)         │
│  ┌─────────────────────────────────┐│
│  │ Secrets (GitHub Encrypted)      ││
│  │ ├─ VITE_API_URL                 ││
│  │ └─ STAGING_API_URL (opcional)   ││
│  └─────────────────────────────────┘│
│              ↓                       │
│  ┌─────────────────────────────────┐│
│  │ Workflow (ubuntu-latest)        ││
│  │ ├─ Type checking                ││
│  │ ├─ Linting                      ││
│  │ ├─ Tests                        ││
│  │ └─ Build                        ││
│  └─────────────────────────────────┘│
│              ↓                       │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│   Tu Servidor (192.168.1.139)       │
│  ┌─────────────────────────────────┐│
│  │ GitHub Actions Runner           ││
│  │ (self-hosted)                   ││
│  │                                 ││
│  │ Ejecuta:                        ││
│  │ ├─ docker build ...             ││
│  │ ├─ docker run ...               ││
│  │ └─ health check                 ││
│  └─────────────────────────────────┘│
│              ↓                       │
│  ┌─────────────────────────────────┐│
│  │ Docker Container                ││
│  │ enerlova-frontend-prod          ││
│  │ (8080→80, nginx)                ││
│  └─────────────────────────────────┘│
└─────────────────────────────────────┘
```

**Ventaja clave:**
- ✅ No hay SSH keys en GitHub Secrets
- ✅ Todo se ejecuta localmente en el servidor
- ✅ El runner solo necesita autenticarse con GitHub (token)
- ✅ Los secretos se inyectan solo en los pasos que los necesitan

