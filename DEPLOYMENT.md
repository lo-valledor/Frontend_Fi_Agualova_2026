# 🚀 Guía de Deployment - Enerlova Frontend

## Arquitectura

Esta configuración usa **GitHub Actions + Self-Hosted Runner** para CI/CD:

```
GitHub (Push a main) → GitHub Actions (CI: tests, build) → Self-Hosted Runner (CD: docker build/run)
                                                                        ↓
                                                              192.168.1.139 (tu servidor)
```

**Ventajas:**
- ✅ Sin SSH keys requeridas en GitHub
- ✅ Todo configurado en GitHub Secrets
- ✅ Runner local ejecuta `docker build` y `docker run`
- ✅ Simple y seguro

---

## Setup Inicial

### PASO 1: Agregar Secrets en GitHub

Ve a **Settings → Secrets and variables → Actions** y agrega:

| Secret | Valor | Ejemplo |
|--------|-------|---------|
| `VITE_API_URL` | URL del Backend | `http://192.168.1.139:8081/Enerlova` |
| `STAGING_API_URL` | URL Staging (opcional) | `http://192.168.1.139:8081/Enerlova-staging` |

⚠️ **IMPORTANTE:**
- NO guardes SSH keys en GitHub Secrets
- El runner ejecuta todo localmente (sin necesidad de SSH)

### PASO 2: Instalar GitHub Actions Runner en el Servidor

En tu servidor (192.168.1.139):

```bash
# 1. Crear directorio para el runner
mkdir -p /home/tecnologia/github-runner
cd /home/tecnologia/github-runner

# 2. Descargar el runner (verifica versión en GitHub)
wget https://github.com/actions/runner/releases/download/v2.318.0/actions-runner-linux-x64-2.318.0.tar.gz
tar xzf actions-runner-linux-x64-2.318.0.tar.gz

# 3. Generar token en GitHub
# Ve a Settings → Developer settings → Personal access tokens → Tokens (classic)
# Permisos necesarios: repo, workflow, admin:repo_hook, admin:org_hook

# 4. Configurar el runner
./config.sh --url https://github.com/tu-usuario/tu-repo --token TU_TOKEN_AQUI

# 5. Instalar y arrancar como servicio
sudo ./svc.sh install
sudo ./svc.sh start

# 6. Verificar estado
sudo ./svc.sh status
```

### PASO 3: Verificar en GitHub

Ve a **GitHub → Settings → Actions → Runners** y verifica que aparezca como "self-hosted" y en línea (círculo verde).

---

## Uso Diario

Solo necesitas hacer push a la rama `main`:

```bash
git add .
git commit -m "Tu cambio"
git push origin main
```

El workflow se ejecutará automáticamente:

1. **🧪 Continuous Integration** (en GitHub - ubuntu-latest)
   - ✓ Type checking con TypeScript
   - ✓ Linting con ESLint
   - ✓ Tests unitarios
   - ✓ Build del proyecto

2. **🚀 Deploy to Production** (en tu servidor - self-hosted)
   - ✓ Build Docker image
   - ✓ Stop y remove del contenedor anterior
   - ✓ Run del nuevo contenedor
   - ✓ Health check (15 intentos)
   - ✓ Cleanup de imágenes antiguas

**El despliegue está completo cuando:**
- La app responde en `http://192.168.1.139:8080`
- El workflow muestra ✅ en GitHub Actions
- `docker logs enerlova-frontend-prod` no muestra errores

**Mapeo de puertos:**
- Puerto **8080** del servidor → Puerto **80** del contenedor (nginx)
- La app está disponible en: `http://192.168.1.139:8080`

---

## Monitoreo y Debugging

### Ver logs del workflow en GitHub

1. Ve a **Actions** en tu repositorio
2. Selecciona el workflow que ejecutó
3. Haz clic en el job para ver detalles
4. Expande cada step para ver logs completos

### Ver logs del contenedor en el servidor

```bash
# Ver últimas 50 líneas
docker logs enerlova-frontend-prod

# Seguir logs en tiempo real
docker logs -f enerlova-frontend-prod

# Ver estadísticas de CPU/memoria
docker stats enerlova-frontend-prod

# Ver estado del contenedor
docker ps -a
```

### Troubleshooting

#### El runner no conecta a GitHub

```bash
# Ver logs del runner
cd /home/tecnologia/github-runner
tail -f _diag/Runner_*.log

# Reiniciar el runner
sudo ./svc.sh stop
sudo ./svc.sh start

# Verificar status
sudo ./svc.sh status
```

#### El contenedor no inicia

```bash
# Verificar que el puerto 80 está libre
sudo lsof -i :80

# Ver logs del contenedor
docker logs --tail=50 enerlova-frontend-prod

# Intentar correr manualmente para debug
docker run -p 80:80 enerlova-frontend:latest
```

#### Necesitas revertir a una versión anterior

```bash
# Ver imágenes disponibles
docker images | grep enerlova-frontend

# Detener el contenedor actual
docker stop enerlova-frontend-prod
docker rm enerlova-frontend-prod

# Ejecutar versión anterior (reemplaza 'TAG' con la versión)
docker run -d \
  --name enerlova-frontend-prod \
  --restart unless-stopped \
  -p 80:80 \
  enerlova-frontend:TAG
```

O simplemente re-ejecuta un workflow anterior en GitHub Actions:
- Ve a **Actions**
- Selecciona un workflow anterior
- Haz clic en **Re-run jobs**

---

## Comandos Útiles para Desarrollo Local

### Construir imagen localmente (sin push a registry)

```bash
# Necesita VITE_API_URL en .env o como variable de entorno
docker build -t enerlova-frontend:local \
  --build-arg VITE_API_URL="http://localhost:8081/Enerlova" \
  --build-arg VITE_ENV_MODE=production \
  .
```

### Ejecutar contenedor localmente

```bash
# Nota: Usa puerto 8080 para evitar conflictos con otros servicios
docker run -d \
  --name enerlova-frontend-test \
  --restart unless-stopped \
  -p 8080:80 \
  enerlova-frontend:local

# Verificar (en puerto 8080 porque lo mapeamos así arriba)
curl http://localhost:8080

# Ver logs
docker logs -f enerlova-frontend-test

# Detener
docker stop enerlova-frontend-test
docker rm enerlova-frontend-test
```

---

## Variables de Entorno

### VITE_API_URL

Esta es la URL del backend API que se usa en el build:

```bash
# Desarrollo
VITE_API_URL=http://localhost:8081/Enerlova

# Producción (en GitHub Secrets)
VITE_API_URL=http://192.168.1.139:8081/Enerlova
```

Se inyecta al Dockerfile como ARG y se usa durante el build de Vite.

### VITE_ENV_MODE

Siempre `production` para el deployment.

---

## Checklist de Configuración Inicial

- [ ] Agregaste `VITE_API_URL` en GitHub Secrets
- [ ] Agregaste `STAGING_API_URL` (opcional) en GitHub Secrets
- [ ] Instalaste el GitHub Actions Runner en el servidor
- [ ] El runner aparece como "online" en GitHub Settings → Actions → Runners
- [ ] Hiciste un push de prueba a `main`
- [ ] El workflow se ejecutó exitosamente en GitHub Actions
- [ ] El contenedor está corriendo en el servidor
- [ ] Verificaste que la app responde en `http://192.168.1.139:80/`

---

## Próximos Pasos

Una vez que el CI/CD esté funcionando:

1. **Opcional:** Agregar notificaciones (Slack, email) en el workflow
2. **Opcional:** Agregar deploy a staging en rama `develop`
3. **Opcional:** Implementar rollback automático si health check falla

Documentación adicional:
- `.github/workflows/ci-cd.yml` - Workflow configuration
- `GITHUB-ACTIONS-SETUP.md` - Setup detallado del runner
- `DEPLOYMENT-WORKFLOW.txt` - Diagrama visual del flujo
