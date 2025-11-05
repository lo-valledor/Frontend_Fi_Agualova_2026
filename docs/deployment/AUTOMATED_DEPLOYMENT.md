# 🚀 Guía de Despliegue Automatizado

Esta guía documenta el proceso de despliegue automatizado para staging y production del proyecto Enerlova Frontend.

## 📋 Tabla de Contenidos

1. [Arquitectura de Despliegue](#arquitectura-de-despliegue)
2. [Flujo de Trabajo Automatizado](#flujo-de-trabajo-automatizado)
3. [Configuración de Entornos](#configuración-de-entornos)
4. [Respuestas a Preguntas Frecuentes](#respuestas-a-preguntas-frecuentes)
5. [Solución de Problemas](#solución-de-problemas)

---

## 🏗️ Arquitectura de Despliegue

### Entornos

| Entorno    | Rama      | Puerto | Docker Compose                 | Trigger                        |
|------------|-----------|--------|--------------------------------|--------------------------------|
| Production | `main`    | 8080   | `docker-compose.yml`           | Push a `main`                  |
| Staging    | `develop` | 3000   | `docker-compose.staging.yml`   | Push a `develop` (auto-merge)  |

### Diagrama de Flujo

```
┌─────────────────┐
│   Desarrollo    │
│    (local)      │
└────────┬────────┘
         │ git push
         ▼
┌─────────────────┐
│   GitHub Repo   │
│    (main)       │
└────────┬────────┘
         │
         ├──────────────────┬─────────────────────┐
         │                  │                     │
         ▼                  ▼                     ▼
┌─────────────────┐  ┌─────────────┐    ┌──────────────┐
│   CI Pipeline   │  │  Auto-Sync  │    │   SonarQube  │
│  (build+test)   │  │ main→develop│    │   Analysis   │
└────────┬────────┘  └──────┬──────┘    └──────────────┘
         │                  │
         ▼                  ▼
┌─────────────────┐  ┌─────────────────┐
│   Production    │  │    Staging      │
│   Port 8080     │  │    Port 3000    │
│  (self-hosted)  │  │  (self-hosted)  │
└─────────────────┘  └─────────────────┘
```

---

## 🔄 Flujo de Trabajo Automatizado

### 1. Desarrollo Local → Push a Main

```bash
# Trabajas en tu PC
git add .
git commit -m "feat: nueva funcionalidad"
git push origin main
```

### 2. GitHub Actions se Activa Automáticamente

#### 2.1 CI Pipeline (`ci-cd.yml`)
- ✅ Instala dependencias (pnpm)
- ✅ Ejecuta type checking
- ✅ Ejecuta linting
- ✅ Ejecuta tests
- ✅ Hace build del proyecto

#### 2.2 Deploy to Production (si CI pasa)
```yaml
# En el servidor self-hosted:
1. Checkout del código (git pull automático vía GitHub Actions)
2. Crea archivo .env con VITE_API_URL
3. Limpia despliegue anterior (docker-compose down)
4. Construye y despliega (docker-compose up -d --build)
5. Verifica health check (puerto 8080)
6. Limpia imágenes antiguas
```

#### 2.3 Auto-Sync Main → Develop (`auto-sync-staging.yml`)
```yaml
# Workflow automático que se ejecuta después de push a main:
1. Checkout con fetch-depth: 0 (todo el historial)
2. Configura Git
3. Asegura que existe la rama develop
4. Hace merge de main → develop con estrategia -X theirs
5. Push a develop
```

#### 2.4 Deploy to Staging (después del auto-sync)
```yaml
# En el servidor self-hosted cuando se actualiza develop:
1. Checkout del código (git pull automático)
2. Crea archivo .env con STAGING_API_URL
3. Limpia despliegue anterior de staging
4. Construye y despliega en puerto 3000
5. Verifica health check (puerto 3000)
6. Limpia imágenes antiguas
```

---

## ⚙️ Configuración de Entornos

### Secrets Necesarios en GitHub

Ve a: `Settings > Secrets and variables > Actions`

#### Para Production:
```
VITE_API_URL=http://192.168.1.139:8081/Enerlova
SONAR_TOKEN=<tu-token-sonarqube>
SONAR_HOST_URL=<tu-url-sonarqube>
```

#### Para Staging:
```
STAGING_API_URL=http://192.168.1.139:8082/Enerlova
```

### Variables de Entorno en Docker Compose

#### Production (`docker-compose.yml`)
```yaml
build:
  args:
    VITE_API_URL: http://192.168.1.139:8081/Enerlova
ports:
  - '8080:80'
```

#### Staging (`docker-compose.staging.yml`)
```yaml
build:
  args:
    VITE_API_URL: http://192.168.1.139:8082/Enerlova
    NODE_ENV: staging
ports:
  - '3000:80'
```

---

## ❓ Respuestas a Preguntas Frecuentes

### ¿Necesito hacer `git pull` manualmente antes de desplegar?

**NO**. El workflow de GitHub Actions hace esto automáticamente mediante `actions/checkout@v4`.

**Cómo funciona:**
```yaml
- name: 📥 Checkout repository
  uses: actions/checkout@v4
  with:
    fetch-depth: 0  # Obtiene todo el historial
```

Esto es equivalente a:
```bash
git fetch origin
git checkout main
git pull origin main
```

### ¿El merge de main → develop se hace automáticamente?

**SÍ**. El workflow `auto-sync-staging.yml` se ejecuta automáticamente cada vez que hay un push a `main`.

**Características:**
- ✅ Usa estrategia `-X theirs` (prioriza cambios de main)
- ✅ Maneja conflictos automáticamente
- ✅ Crea la rama develop si no existe
- ✅ Puede ejecutarse manualmente desde GitHub Actions

### ¿Qué pasa si algo falla en el despliegue?

El workflow tiene múltiples verificaciones:

1. **CI falla**: No se despliega
2. **Build falla**: El workflow se detiene y notifica
3. **Health check falla**: Se muestran logs detallados
4. **Docker falla**: Se muestran contenedores y logs

### ¿Cómo verifico que el despliegue funcionó?

#### Production:
```bash
curl http://localhost:8080
# O visita en el navegador
```

#### Staging:
```bash
curl http://localhost:3000
# O visita en el navegador
```

### ¿Puedo desplegar manualmente?

**SÍ**, tienes varias opciones:

#### Opción 1: Ejecutar workflow manualmente
1. Ve a GitHub → Actions
2. Selecciona el workflow (`CI/CD Pipeline`)
3. Click en "Run workflow"

#### Opción 2: SSH al servidor
```bash
ssh usuario@servidor

# Para production:
cd /ruta/al/proyecto
git pull origin main
docker-compose down
docker-compose up -d --build

# Para staging:
cd /ruta/al/proyecto
git pull origin develop
docker-compose -f docker-compose.staging.yml down
docker-compose -f docker-compose.staging.yml up -d --build
```

---

## 🐛 Solución de Problemas

### Problema: El staging no se actualiza

**Diagnóstico:**
```bash
# En el servidor, verifica que la rama develop existe
git branch -a | grep develop

# Verifica el último commit
git log origin/develop --oneline -5

# Verifica el workflow
gh workflow view "Auto-Sync Main to Staging"
```

**Solución:**
```bash
# Forzar la sincronización manual
git checkout develop
git merge main -X theirs
git push origin develop
```

### Problema: Puerto en uso

**Síntoma:**
```
Error: bind: address already in use
```

**Solución:**
```bash
# Ver qué está usando el puerto
netstat -tlnp | grep :3000  # o :8080 para production

# Detener el contenedor existente
docker-compose -f docker-compose.staging.yml down

# O matar el proceso
sudo kill -9 <PID>
```

### Problema: Contenedor no inicia

**Diagnóstico:**
```bash
# Ver estado de contenedores
docker-compose -f docker-compose.staging.yml ps

# Ver logs
docker-compose -f docker-compose.staging.yml logs -f

# Inspeccionar el contenedor
docker inspect enerlova-frontend-staging
```

**Solución:**
```bash
# Reconstruir desde cero
docker-compose -f docker-compose.staging.yml down -v
docker-compose -f docker-compose.staging.yml up -d --build --force-recreate
```

### Problema: Variables de entorno no se aplican

**Verificar:**
```bash
# En el contenedor
docker exec enerlova-frontend-staging env | grep VITE

# O inspeccionar el build
docker inspect enerlova-frontend-staging | grep -A 10 Config
```

**Solución:**
```bash
# Reconstruir sin cache
docker-compose -f docker-compose.staging.yml build --no-cache
docker-compose -f docker-compose.staging.yml up -d --force-recreate
```

---

## 📊 Monitoreo

### Ver logs en tiempo real

**Production:**
```bash
docker-compose logs -f --tail=100
```

**Staging:**
```bash
docker-compose -f docker-compose.staging.yml logs -f --tail=100
```

### Ver estado de los servicios

```bash
# Ver contenedores corriendo
docker ps

# Ver uso de recursos
docker stats

# Ver health check
docker inspect enerlova-frontend-staging | grep -A 5 Health
```

---

## 🎯 Checklist de Despliegue

Antes de hacer push a main:

- [ ] Tests pasan localmente (`pnpm test`)
- [ ] Build funciona (`pnpm build`)
- [ ] Type checking pasa (`pnpm typecheck`)
- [ ] Linting pasa (`pnpm lint`)
- [ ] Commit message es descriptivo

Después del despliegue:

- [ ] CI/CD pipeline pasó (GitHub Actions)
- [ ] Production responde en puerto 8080
- [ ] Staging responde en puerto 3000
- [ ] No hay errores en los logs
- [ ] Funcionalidad probada en ambos entornos

---

## 📚 Recursos Adicionales

- [Documentación de Docker Compose](https://docs.docker.com/compose/)
- [GitHub Actions Docs](https://docs.github.com/en/actions)
- [Self-hosted Runners](https://docs.github.com/en/actions/hosting-your-own-runners)
- [React Router Deployment](https://reactrouter.com/en/main/guides/deployment)

---

## 🆘 Contacto y Soporte

Si encuentras problemas no documentados aquí:

1. Revisa los logs del workflow en GitHub Actions
2. Consulta los logs de Docker en el servidor
3. Verifica que todos los secrets estén configurados
4. Asegúrate de que el runner self-hosted esté activo

---

**Última actualización**: 2025-11-05
**Versión**: 1.0.0
