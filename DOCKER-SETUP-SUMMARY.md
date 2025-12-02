# 📦 Docker & CI/CD Setup Summary

## ✅ Lo que se ha configurado

### 1. Simplificación de Variables
- ❌ Removido: `VITE_API_ENERLINK_URL` (no se utiliza)
- ❌ Removido: `VITE_AI_API_URL` (no se utiliza)  
- ✅ Guardado: `VITE_API_URL` (única API necesaria)

### 2. Archivos de Configuración Creados

```
📁 ./
├── .env.example                          (Plantilla de variables)
├── DEPLOYMENT.md                         (Guía de deployment)
├── GITHUB-ACTIONS-SETUP.md              (Setup de CI/CD)
├── Dockerfile                            (Actualizado - sin APIs extras)
├── 📁 scripts/
│   ├── docker-build.sh                  (Construir imagen)
│   ├── docker-push.sh                   (Push a registry)
│   └── docker-deploy.sh                 (Deploy con docker run)
└── 📁 .github/workflows/
    └── ci-cd.yml                         (Actualizado - usa docker run)
```

### 3. Dockerfile Optimizado

```dockerfile
# Variables de build
ARG VITE_API_URL
ARG VITE_ENV_MODE=production

# Multi-stage build
FROM node:22-alpine AS build-env
FROM nginx:alpine
```

- ✅ Construye imagen optimizada
- ✅ Usuario no-root (nginx)
- ✅ Logs rotados automáticamente
- ✅ Sin Docker Compose requerido

### 4. GitHub Actions Workflow Actualizado

**Antes:** Usaba `docker-compose up`  
**Ahora:** Usa `docker run` directamente

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

---

## 🚀 Cómo Usar

### Despliegue Local

```bash
# 1. Crear archivo de configuración
cp .env.example .env.production

# 2. Editar valores
nano .env.production

# 3. Construir imagen
./scripts/docker-build.sh production

# 4. Desplegar localmente
./scripts/docker-deploy.sh production

# 5. Verificar
curl http://localhost:8080
```

### Despliegue en Producción (vía GitHub Actions)

1. Setupear GitHub Actions Runner en servidor:
   ```bash
   cd /home/tecnologia/github-runner
   ./config.sh --url https://github.com/... --token ...
   ./svc.sh install
   ./svc.sh start
   ```

2. Agregar Secrets en GitHub:
   - `VITE_API_URL`
   - `STAGING_API_URL` (opcional)

3. Hacer push a `main` branch → Despliegue automático

### Despliegue Manual en Servidor Remoto

```bash
# Vía SSH
./scripts/docker-deploy.sh production remote

# O manualmente
ssh tecnologia@192.168.1.139
docker pull ghcr.io/tu-usuario/enerlova-frontend:latest
docker stop enerlova-frontend-prod || true
docker rm enerlova-frontend-prod || true
docker run -d --name enerlova-frontend-prod \
  --restart unless-stopped -p 8080:80 \
  ghcr.io/tu-usuario/enerlova-frontend:latest
```

---

## 📋 Checklist de Configuración

- [ ] Copiar `.env.example` a `.env.production`
- [ ] Editar variables (especialmente `VITE_API_URL`)
- [ ] Instalar GitHub Actions Runner en servidor
- [ ] Agregar Secrets en GitHub (VITE_API_URL, etc)
- [ ] Hacer un push de prueba a `main`
- [ ] Verificar workflow en GitHub Actions
- [ ] Comprobar que el contenedor está corriendo: `docker ps`
- [ ] Hacer health check: `curl http://192.168.1.139:8080`

---

## 🔧 Comandos Útiles

```bash
# Ver logs del contenedor
docker logs enerlova-frontend-prod
docker logs -f enerlova-frontend-prod  # seguir en tiempo real

# Ver contenedores
docker ps -a

# Estadísticas
docker stats enerlova-frontend-prod

# Detener/Iniciar
docker stop enerlova-frontend-prod
docker start enerlova-frontend-prod

# Eliminar todo
docker stop enerlova-frontend-prod && docker rm enerlova-frontend-prod

# Limpiar imágenes antiguas
docker image prune -f
```

---

## 📊 Comparativa

| Aspecto | Antes | Ahora |
|---------|-------|-------|
| Dependency | Docker Compose | Solo Docker |
| Build | Via Compose | Via `docker run` |
| APIs | 3 (API, Enerlink, AI) | 1 (API) |
| Config | Hardcoded | `.env.example` |
| CI/CD | ❌ No | ✅ Sí (GitHub Actions) |
| Scripts | ❌ No | ✅ Sí (build/push/deploy) |
| Logs | Sin rotación | ✅ Rotación automática |

---

## 🎯 Próximos Pasos

1. **Inmediato:**
   - [ ] Revisar `.env.example`
   - [ ] Configurar GitHub Actions Runner
   - [ ] Agregar Secrets en GitHub

2. **Pruebas:**
   - [ ] Construir imagen local
   - [ ] Desplegar en servidor de prueba
   - [ ] Hacer push a `develop` (si existe)

3. **Producción:**
   - [ ] Hacer push a `main`
   - [ ] Monitorear GitHub Actions
   - [ ] Verificar health check

---

## 📞 Soporte

### Ver logs del workflow
GitHub → Actions → Seleccionar workflow → Ver logs de cada paso

### Ver logs del servidor
```bash
ssh tecnologia@192.168.1.139
docker logs -f enerlova-frontend-prod
```

### Revertir cambios
```bash
docker stop enerlova-frontend-prod
docker rm enerlova-frontend-prod
docker run -d ... (imagen anterior)
```

