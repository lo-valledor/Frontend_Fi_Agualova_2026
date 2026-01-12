# Guía de Implementación DevOps

**Servidor:** Ubuntu 24 LTS | 2 vCPU | 8GB RAM | 160GB  
**IP:** 64.176.19.51  
**Fecha:** Diciembre 2024

---

## Índice

1. [Arquitectura General](#1-arquitectura-general)
2. [Comparativa: Traefik vs Nginx](#2-comparativa-traefik-vs-nginx)
3. [Fase 1: Base del Sistema](#3-fase-1-base-del-sistema)
4. [Fase 2: Traefik (Reverse Proxy)](#4-fase-2-traefik-reverse-proxy)
5. [Fase 3: Stack de Monitoreo](#5-fase-3-stack-de-monitoreo)
6. [Fase 4: Servidor Git (CI/CD)](#6-fase-4-servidor-git-cicd)
7. [Fase 5: Scripts de Automatización](#7-fase-5-scripts-de-automatización)
8. [Fase 6: Uptime Kuma](#8-fase-6-uptime-kuma)
9. [Fase 7: Loki (Logs)](#9-fase-7-loki-logs)
10. [Fase 8: Cron (Backups)](#10-fase-8-cron-backups)
11. [Fase 9: Fail2ban](#11-fase-9-fail2ban)
12. [Estructura de Directorios](#12-estructura-de-directorios)
13. [URLs de Acceso](#13-urls-de-acceso)
14. [Troubleshooting](#14-troubleshooting)
15. [Próximos Pasos](#15-próximos-pasos)

---

## 1. Arquitectura General

### ¿Por qué no Kubernetes?

Con 2 vCPU y 8GB de RAM, Kubernetes consumiría aproximadamente 1.5GB solo para el control plane y los componentes base. Esto representaría casi el 20% de los recursos disponibles antes de ejecutar cualquier aplicación. Para un servidor single-node, Docker Compose ofrece la misma funcionalidad de orquestación con una fracción del overhead.

### Stack Seleccionado

| Componente                  | Función                                          |
| --------------------------- | ------------------------------------------------ |
| **Docker + Docker Compose** | Contenedorización y orquestación ligera          |
| **Traefik**                 | Reverse proxy con auto-discovery de contenedores |
| **Prometheus + Grafana**    | Monitoreo y visualización de métricas            |
| **Loki + Promtail**         | Agregación y visualización de logs               |
| **Uptime Kuma**             | Monitoreo de disponibilidad con alertas          |
| **Gitea / GitHub / GitLab** | Servidor Git con CI/CD integrado                 |
| **Fail2ban**                | Protección contra ataques de fuerza bruta        |

---

## 2. Comparativa: Traefik vs Nginx

| Aspecto            | Traefik                                      | Nginx                                 |
| ------------------ | -------------------------------------------- | ------------------------------------- |
| **Configuración**  | Labels en contenedores. Cambios en caliente. | Archivos de config. Requiere reload.  |
| **Auto-discovery** | Detecta contenedores via Docker API.         | Manual. Editar config por servicio.   |
| **SSL/TLS**        | Let's Encrypt integrado y automático.        | Requiere Certbot externo.             |
| **Dashboard**      | Incluido. Visualiza rutas y servicios.       | Requiere herramientas de terceros.    |
| **Rendimiento**    | Excelente. Ligeramente más overhead.         | Superior en alto tráfico y estáticos. |
| **Métricas**       | Prometheus nativo integrado.                 | Requiere exporter adicional.          |
| **RAM**            | ~50-100MB típico                             | ~10-50MB típico                       |

### ¿Cuándo elegir cada uno?

**Elige Traefik si:**

- Trabajas principalmente con contenedores Docker
- Despliegas frecuentemente nuevos servicios
- Quieres SSL automático sin configuración adicional
- Prefieres configuración declarativa junto al servicio

**Elige Nginx si:**

- Sirves mucho contenido estático
- Necesitas máximo rendimiento con millones de requests
- Ya tienes experiencia con su configuración
- Tus servicios no cambian frecuentemente

### Conclusión

Para esta infraestructura DevOps basada en Docker, Traefik es la mejor opción por su integración nativa con contenedores y su capacidad de auto-configuración.

---

## 3. Fase 1: Base del Sistema

### 3.1 Usuario DevOps

Se crea un usuario dedicado para separar las operaciones de infraestructura del usuario root, siguiendo el principio de mínimo privilegio.

```bash
# Crear usuario (ejecutar como root o con sudo)
sudo adduser devops
sudo usermod -aG sudo devops
```

### 3.2 Instalación de Docker

```bash
# Descargar e instalar Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Agregar usuario devops al grupo docker
sudo usermod -aG docker devops
```

### 3.3 Cambiar al usuario devops

> ⚠️ **IMPORTANTE:** A partir de este punto, todos los comandos deben ejecutarse como el usuario `devops`. El usuario que usaste para instalar Docker NO tiene permisos de Docker automáticamente.

```bash
# Cambiar al usuario devops
su - devops

# Verificar que Docker funciona
docker --version
docker ps
```

Si ves "permission denied", asegúrate de haber hecho `su - devops` (con el guión).

### 3.4 Red Docker 'proxy'

Red externa que permite la comunicación entre Traefik y todas las aplicaciones:

```bash
docker network create proxy
```

### 3.5 Estructura de Directorios

```bash
mkdir -p ~/devops/{apps,configs,monitoring,ci-cd,backups,ssl,scripts,docs}
```

| Directorio    | Propósito                                   |
| ------------- | ------------------------------------------- |
| `apps/`       | Aplicaciones desplegadas                    |
| `configs/`    | Configuraciones de servicios base (Traefik) |
| `monitoring/` | Stack de monitoreo                          |
| `ci-cd/`      | Pipeline CI/CD (Gitea)                      |
| `backups/`    | Respaldos automáticos                       |
| `scripts/`    | Scripts de automatización                   |
| `docs/`       | Documentación                               |

---

## 4. Fase 2: Traefik (Reverse Proxy)

### ¿Qué es un Reverse Proxy?

Un reverse proxy actúa como intermediario entre los usuarios y las aplicaciones. Recibe todas las peticiones en los puertos 80 (HTTP) y 443 (HTTPS) y las redirige al contenedor correspondiente.

### 4.1 Crear directorio

```bash
mkdir -p ~/devops/configs/traefik
cd ~/devops/configs/traefik
```

### 4.2 Crear traefik.yml

```bash
nano traefik.yml
```

Pegar el siguiente contenido:

```yaml
api:
  dashboard: true
  insecure: true

entryPoints:
  web:
    address: ':80'
  websecure:
    address: ':443'

providers:
  docker:
    endpoint: 'unix:///var/run/docker.sock'
    exposedByDefault: false
    network: proxy
  file:
    filename: /config.yml
    watch: true

log:
  level: INFO

metrics:
  prometheus:
    addEntryPointsLabels: true
    addServicesLabels: true
    addRoutersLabels: true
```

Guardar: `Ctrl+O`, Enter, `Ctrl+X`

### 4.3 Crear config.yml

```bash
nano config.yml
```

Pegar el siguiente contenido:

```yaml
http:
  middlewares:
    default-headers:
      headers:
        frameDeny: true
        browserXssFilter: true
        contentTypeNosniff: true
```

Guardar: `Ctrl+O`, Enter, `Ctrl+X`

### 4.4 Crear archivo para certificados SSL

```bash
touch acme.json
chmod 600 acme.json
```

### 4.5 Crear docker-compose.yml

```bash
nano docker-compose.yml
```

Pegar el siguiente contenido:

```yaml
services:
  traefik:
    image: traefik:v3
    container_name: traefik
    restart: unless-stopped
    security_opt:
      - no-new-privileges:true
    environment:
      - DOCKER_API_VERSION=1.44
    networks:
      - proxy
    ports:
      - '80:80'
      - '443:443'
      - '8080:8080'
    volumes:
      - /etc/localtime:/etc/localtime:ro
      - /var/run/docker.sock:/var/run/docker.sock:ro
      - ./traefik.yml:/traefik.yml:ro
      - ./config.yml:/config.yml:ro
      - ./acme.json:/acme.json

networks:
  proxy:
    external: true
```

Guardar: `Ctrl+O`, Enter, `Ctrl+X`

### 4.6 Iniciar Traefik

```bash
docker compose up -d
```

### 4.7 Verificar

```bash
# Ver logs
docker logs traefik

# Verificar que está corriendo
docker ps
```

Acceder al dashboard: `http://TU_IP:8080`

### ¿Por qué montar docker.sock?

El socket de Docker permite a Traefik comunicarse con el daemon de Docker para detectar automáticamente cuándo se crean o eliminan contenedores. Se monta como solo lectura (`:ro`) por seguridad.

---

## 5. Fase 3: Stack de Monitoreo

### Componentes

| Servicio          | Función                                                  |
| ----------------- | -------------------------------------------------------- |
| **Prometheus**    | Base de datos de series temporales. Recolecta métricas.  |
| **Grafana**       | Visualización. Dashboards a partir de Prometheus y Loki. |
| **Node Exporter** | Métricas del SO: CPU, RAM, disco, red.                   |
| **cAdvisor**      | Métricas de contenedores Docker.                         |

### 5.1 Crear directorio

```bash
mkdir -p ~/devops/monitoring/prometheus
cd ~/devops/monitoring
```

### 5.2 Crear configuración de Prometheus

```bash
nano prometheus/prometheus.yml
```

Pegar el siguiente contenido:

```yaml
global:
  scrape_interval: 15s
  evaluation_interval: 15s

scrape_configs:
  - job_name: 'prometheus'
    static_configs:
      - targets: ['localhost:9090']

  - job_name: 'node-exporter'
    static_configs:
      - targets: ['node-exporter:9100']

  - job_name: 'cadvisor'
    static_configs:
      - targets: ['cadvisor:8080']

  - job_name: 'traefik'
    static_configs:
      - targets: ['traefik:8080']
```

Guardar: `Ctrl+O`, Enter, `Ctrl+X`

### 5.3 Crear docker-compose.yml

```bash
nano docker-compose.yml
```

Pegar el siguiente contenido:

```yaml
services:
  prometheus:
    image: prom/prometheus:latest
    container_name: prometheus
    restart: unless-stopped
    volumes:
      - ./prometheus:/etc/prometheus
      - prometheus_data:/prometheus
    command:
      - '--config.file=/etc/prometheus/prometheus.yml'
      - '--storage.tsdb.retention.time=30d'
    ports:
      - '9090:9090'
    networks:
      - monitoring
      - proxy

  grafana:
    image: grafana/grafana:latest
    container_name: grafana
    restart: unless-stopped
    volumes:
      - grafana_data:/var/lib/grafana
    environment:
      - GF_SECURITY_ADMIN_USER=admin
      - GF_SECURITY_ADMIN_PASSWORD=devops2024
      - GF_USERS_ALLOW_SIGN_UP=false
    ports:
      - '3000:3000'
    networks:
      - monitoring
      - proxy

  node-exporter:
    image: prom/node-exporter:latest
    container_name: node-exporter
    restart: unless-stopped
    command:
      - '--path.procfs=/host/proc'
      - '--path.rootfs=/rootfs'
      - '--path.sysfs=/host/sys'
      - '--collector.filesystem.mount-points-exclude=^/(sys|proc|dev|host|etc)($$|/)'
    volumes:
      - /proc:/host/proc:ro
      - /sys:/host/sys:ro
      - /:/rootfs:ro
    networks:
      - monitoring

  cadvisor:
    image: gcr.io/cadvisor/cadvisor:latest
    container_name: cadvisor
    restart: unless-stopped
    privileged: true
    volumes:
      - /:/rootfs:ro
      - /var/run:/var/run:ro
      - /sys:/sys:ro
      - /var/lib/docker:/var/lib/docker:ro
      - /dev/disk/:/dev/disk:ro
    networks:
      - monitoring

volumes:
  prometheus_data:
  grafana_data:

networks:
  monitoring:
  proxy:
    external: true
```

Guardar: `Ctrl+O`, Enter, `Ctrl+X`

### 5.4 Iniciar Stack de Monitoreo

```bash
docker compose up -d
```

### 5.5 Configurar Grafana

1. Acceder a `http://TU_IP:3000`
2. Login: `admin` / `devops2024`
3. Ir a **Connections** → **Data sources** → **Add data source**
4. Seleccionar **Prometheus**
5. URL: `http://prometheus:9090`
6. Click **Save & test**

### 5.6 Importar Dashboard

1. Ir a **Dashboards** → **Import**
2. Ingresar ID: `1860`
3. Click **Load**
4. Seleccionar datasource **Prometheus**
5. Click **Import**

---

## 6. Fase 4: Servidor Git (CI/CD)

### ¿Por qué un servidor Git?

Un servidor Git centraliza el código fuente y permite:

- **Versionado:** Historial completo de cambios
- **Colaboración:** Múltiples desarrolladores trabajando en paralelo
- **CI/CD:** Automatización de pruebas y despliegues
- **Code Review:** Revisión de código antes de integrar cambios

### Opciones disponibles

| Opción     | Tipo              | Ventajas                                       | Desventajas              |
| ---------- | ----------------- | ---------------------------------------------- | ------------------------ |
| **Gitea**  | Self-hosted       | Control total, sin límites, ligero             | Requiere mantenimiento   |
| **GitHub** | Cloud             | Popular, muchas integraciones, Actions potente | Límites en plan gratuito |
| **GitLab** | Cloud/Self-hosted | CI/CD integrado muy completo                   | Pesado si es self-hosted |

---

### Opción A: Gitea (Self-hosted) - Recomendado

#### ¿Por qué Gitea?

- **Ligero:** ~150MB RAM vs ~4GB de GitLab
- **Sin límites:** Repositorios privados ilimitados
- **Control total:** Tu código en tu infraestructura
- **Gitea Actions:** Compatible con GitHub Actions

#### A.1 Crear directorio

```bash
mkdir -p ~/devops/ci-cd/gitea
cd ~/devops/ci-cd/gitea
```

#### A.2 Crear docker-compose.yml (solo Gitea primero)

> ⚠️ **IMPORTANTE:** El runner requiere un token que solo puedes obtener DESPUÉS de que Gitea esté funcionando. Por eso levantamos primero solo Gitea, obtenemos el token, y luego agregamos el runner.

```bash
nano docker-compose.yml
```

Pegar el siguiente contenido:

```yaml
services:
  gitea:
    image: gitea/gitea:latest
    container_name: gitea
    restart: unless-stopped
    environment:
      - USER_UID=1000
      - USER_GID=1000
      - GITEA__database__DB_TYPE=sqlite3
      - GITEA__server__ROOT_URL=http://TU_IP:3001
      - GITEA__server__HTTP_PORT=3000
      - GITEA__actions__ENABLED=true
    volumes:
      - gitea_data:/data
      - /etc/timezone:/etc/timezone:ro
      - /etc/localtime:/etc/localtime:ro
    ports:
      - '3001:3000'
      - '2222:22'
    networks:
      - gitea
      - proxy

volumes:
  gitea_data:

networks:
  gitea:
  proxy:
    external: true
```

> ⚠️ Reemplaza `TU_IP` con la IP de tu servidor.

Guardar: `Ctrl+O`, Enter, `Ctrl+X`

#### A.3 Iniciar Gitea

```bash
docker compose up -d
```

#### A.4 Configurar Gitea

1. Acceder a `http://TU_IP:3001`
2. Completar la configuración inicial (dejar SQLite3)
3. Crear usuario administrador
4. Hacer login con el usuario creado

#### A.5 Obtener token para el runner

> ℹ️ **Este paso es necesario antes de agregar el runner.** Gitea genera un token único que permite al runner autenticarse.

1. En Gitea, ir a **Site Administration** (icono de herramientas arriba a la derecha)
2. Click en **Actions** → **Runners**
3. Click en **Create new runner**
4. Copiar el **Registration Token** (ejemplo: `gtr_xxxxxxxxxxxxxxxxxxxx`)

#### A.6 Agregar el runner al docker-compose.yml

```bash
nano docker-compose.yml
```

Agregar el servicio del runner (después del servicio gitea, antes de `volumes:`):

```yaml
gitea-runner:
  image: gitea/act_runner:latest
  container_name: gitea-runner
  restart: unless-stopped
  depends_on:
    - gitea
  environment:
    - GITEA_INSTANCE_URL=http://gitea:3000
    - GITEA_RUNNER_REGISTRATION_TOKEN=TU_TOKEN_AQUI
    - GITEA_RUNNER_NAME=runner-principal
  volumes:
    - /var/run/docker.sock:/var/run/docker.sock
    - gitea_runner:/data
  networks:
    - gitea
```

Y agregar el volumen del runner en la sección `volumes:`:

```yaml
volumes:
  gitea_data:
  gitea_runner:
```

> ⚠️ Reemplaza `TU_TOKEN_AQUI` con el token que copiaste en el paso anterior.

Guardar: `Ctrl+O`, Enter, `Ctrl+X`

#### A.7 Levantar el runner

```bash
docker compose up -d gitea-runner
```

#### A.8 Verificar que el runner está registrado

1. Volver a Gitea → **Site Administration** → **Actions** → **Runners**
2. Deberías ver el runner `runner-principal` con estado **Idle** (verde)

---

### Opción B: GitHub

Si prefieres usar GitHub en lugar de self-hosted:

#### B.1 Configurar GitHub Actions

Crear archivo `.github/workflows/deploy.yml` en tu repositorio:

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Deploy to server
        uses: appleboy/ssh-action@v1.0.0
        with:
          host: ${{ secrets.SERVER_HOST }}
          username: ${{ secrets.SERVER_USER }}
          key: ${{ secrets.SERVER_SSH_KEY }}
          script: |
            cd ~/devops/apps/mi-app
            git pull origin main
            docker compose down
            docker compose up -d
```

#### B.2 Configurar Secrets en GitHub

1. Ir a tu repositorio → **Settings** → **Secrets and variables** → **Actions**
2. Agregar:
   - `SERVER_HOST`: IP de tu servidor
   - `SERVER_USER`: `devops`
   - `SERVER_SSH_KEY`: Tu clave SSH privada

#### B.3 Generar clave SSH (si no tienes)

En tu servidor:

```bash
ssh-keygen -t ed25519 -C "github-actions"
cat ~/.ssh/id_ed25519.pub >> ~/.ssh/authorized_keys
cat ~/.ssh/id_ed25519  # Esta es la clave privada para SERVER_SSH_KEY
```

---

### Opción C: GitLab

#### C.1 Usar GitLab.com (Cloud)

Similar a GitHub, crea archivo `.gitlab-ci.yml`:

```yaml
stages:
  - deploy

deploy:
  stage: deploy
  only:
    - main
  script:
    - apt-get update && apt-get install -y openssh-client
    - eval $(ssh-agent -s)
    - echo "$SSH_PRIVATE_KEY" | ssh-add -
    - ssh -o StrictHostKeyChecking=no $SERVER_USER@$SERVER_HOST "cd ~/devops/apps/mi-app && git pull && docker compose up -d"
  variables:
    SERVER_HOST: 'tu-ip'
    SERVER_USER: 'devops'
```

#### C.2 Configurar Variables en GitLab

1. Ir a tu proyecto → **Settings** → **CI/CD** → **Variables**
2. Agregar `SSH_PRIVATE_KEY` con tu clave privada

#### C.3 GitLab Self-hosted (No recomendado para este servidor)

GitLab self-hosted requiere mínimo 4GB RAM solo para funcionar. Con 8GB totales, no es viable para esta infraestructura.

---

## 7. Fase 5: Scripts de Automatización

### ¿Por qué automatizar?

La automatización es fundamental en DevOps por varias razones:

| Beneficio              | Descripción                                                                  |
| ---------------------- | ---------------------------------------------------------------------------- |
| **Consistencia**       | Los scripts ejecutan las mismas acciones siempre, eliminando errores humanos |
| **Velocidad**          | Tareas que tomarían minutos se ejecutan en segundos                          |
| **Documentación viva** | El script mismo documenta el proceso                                         |
| **Reproducibilidad**   | Cualquier persona puede ejecutar el mismo proceso                            |
| **Escalabilidad**      | Fácil de aplicar a múltiples servidores o aplicaciones                       |

### ¿Para qué automatizamos?

En esta infraestructura, automatizamos tres tareas críticas:

1. **Despliegues (`deploy.sh`):** Actualizar aplicaciones sin downtime
2. **Respaldos (`backup.sh`):** Proteger datos contra pérdidas
3. **Monitoreo (`status.sh`):** Verificar rápidamente el estado del sistema

### 7.1 Crear directorio

```bash
mkdir -p ~/devops/scripts
cd ~/devops/scripts
```

### 7.2 Crear deploy.sh

Este script automatiza el despliegue de aplicaciones: obtiene los últimos cambios del repositorio, reconstruye las imágenes Docker y reinicia los contenedores.

```bash
nano deploy.sh
```

Pegar el siguiente contenido:

```bash
#!/bin/bash

# =============================================================================
# deploy.sh - Script de despliegue automatizado
#
# Uso: ./deploy.sh nombre-app
#
# Este script:
# 1. Verifica que la aplicación existe
# 2. Obtiene los últimos cambios de git (si aplica)
# 3. Detiene los contenedores actuales
# 4. Reconstruye las imágenes
# 5. Inicia los nuevos contenedores
# 6. Verifica que todo esté funcionando
# =============================================================================

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

APP_NAME=$1

# Validar que se proporcionó nombre de app
if [ -z "$APP_NAME" ]; then
    echo -e "${RED}Error: Debes especificar el nombre de la app${NC}"
    echo "Uso: ./deploy.sh nombre-app"
    echo ""
    echo "Aplicaciones disponibles:"
    ls -1 ~/devops/apps/
    exit 1
fi

APP_DIR=~/devops/apps/$APP_NAME

# Validar que el directorio existe
if [ ! -d "$APP_DIR" ]; then
    echo -e "${RED}Error: No existe el directorio $APP_DIR${NC}"
    echo ""
    echo "Aplicaciones disponibles:"
    ls -1 ~/devops/apps/
    exit 1
fi

echo -e "${YELLOW}========================================${NC}"
echo -e "${YELLOW}  Desplegando: $APP_NAME${NC}"
echo -e "${YELLOW}========================================${NC}"
echo ""

cd $APP_DIR

# Si es un repositorio git, obtener últimos cambios
if [ -d ".git" ]; then
    echo -e "${YELLOW}📥 Obteniendo últimos cambios de git...${NC}"
    git pull origin main
    echo ""
fi

# Detener contenedores actuales
echo -e "${YELLOW}🛑 Deteniendo contenedores actuales...${NC}"
docker compose down
echo ""

# Reconstruir imágenes
echo -e "${YELLOW}🔨 Construyendo nuevas imágenes...${NC}"
docker compose build --no-cache
echo ""

# Iniciar contenedores
echo -e "${YELLOW}🚀 Iniciando contenedores...${NC}"
docker compose up -d
echo ""

# Esperar a que los contenedores estén listos
sleep 5

# Verificar estado
if docker compose ps | grep -q "Up"; then
    echo -e "${GREEN}========================================${NC}"
    echo -e "${GREEN}  ✅ $APP_NAME desplegado correctamente${NC}"
    echo -e "${GREEN}========================================${NC}"
    echo ""
    docker compose ps
else
    echo -e "${RED}========================================${NC}"
    echo -e "${RED}  ❌ Error en el despliegue${NC}"
    echo -e "${RED}========================================${NC}"
    echo ""
    echo "Últimos logs:"
    docker compose logs --tail=20
    exit 1
fi
```

Guardar: `Ctrl+O`, Enter, `Ctrl+X`

### 7.3 Crear backup.sh

Este script crea respaldos de los volúmenes Docker (datos persistentes) y las configuraciones. Los respaldos antiguos se eliminan automáticamente.

```bash
nano backup.sh
```

Pegar el siguiente contenido:

```bash
#!/bin/bash

# =============================================================================
# backup.sh - Script de respaldo automatizado
#
# Uso: ./backup.sh
#
# Este script:
# 1. Crea un directorio con fecha/hora actual
# 2. Respalda todos los volúmenes Docker importantes
# 3. Respalda las configuraciones
# 4. Elimina respaldos de más de 7 días
# =============================================================================

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

BACKUP_DIR=~/devops/backups
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_PATH=$BACKUP_DIR/$DATE
RETENTION_DAYS=7

echo -e "${CYAN}========================================${NC}"
echo -e "${CYAN}  Iniciando Backup - $DATE${NC}"
echo -e "${CYAN}========================================${NC}"
echo ""

# Crear directorio de backup
mkdir -p $BACKUP_PATH

# Respaldar volúmenes Docker
echo -e "${YELLOW}📦 Respaldando volúmenes Docker...${NC}"
for volume in $(docker volume ls -q | grep -E "gitea|grafana|prometheus|loki|uptime"); do
    echo "  - $volume"
    docker run --rm \
        -v $volume:/data:ro \
        -v $BACKUP_PATH:/backup \
        alpine tar czf /backup/${volume}.tar.gz -C /data .
done
echo ""

# Respaldar configuraciones
echo -e "${YELLOW}📁 Respaldando configuraciones...${NC}"
tar czf $BACKUP_PATH/configs.tar.gz -C ~/devops configs
tar czf $BACKUP_PATH/scripts.tar.gz -C ~/devops scripts
echo "  - configs.tar.gz"
echo "  - scripts.tar.gz"
echo ""

# Limpiar backups antiguos
echo -e "${YELLOW}🧹 Limpiando backups antiguos (>${RETENTION_DAYS} días)...${NC}"
DELETED=$(find $BACKUP_DIR -maxdepth 1 -type d -mtime +$RETENTION_DAYS -exec rm -rf {} \; -print | wc -l)
echo "  - $DELETED backups eliminados"
echo ""

# Mostrar resumen
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  ✅ Backup completado${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo "Ubicación: $BACKUP_PATH"
echo ""
echo "Archivos creados:"
ls -lh $BACKUP_PATH
echo ""
echo "Espacio total usado en backups:"
du -sh $BACKUP_DIR
```

Guardar: `Ctrl+O`, Enter, `Ctrl+X`

### 7.4 Crear status.sh

Este script muestra un resumen rápido del estado del servidor: recursos del sistema, contenedores activos, URLs de servicios y alertas.

```bash
nano status.sh
```

Pegar el siguiente contenido:

```bash
#!/bin/bash

# =============================================================================
# status.sh - Script de estado del servidor
#
# Uso: ./status.sh
#
# Este script muestra:
# 1. Recursos del sistema (CPU, RAM, Disco)
# 2. Contenedores Docker activos
# 3. URLs de los servicios
# 4. Estado de las redes Docker
# =============================================================================

GREEN='\033[0;32m'
RED='\033[0;31m'
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
NC='\033[0m'

clear

echo -e "${CYAN}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║           ESTADO DEL SERVIDOR DEVOPS                       ║${NC}"
echo -e "${CYAN}║           $(date '+%Y-%m-%d %H:%M:%S')                            ║${NC}"
echo -e "${CYAN}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Recursos del Sistema
echo -e "${YELLOW}📊 RECURSOS DEL SISTEMA${NC}"
echo "────────────────────────────────────────"
echo "CPU:    $(top -bn1 | grep "Cpu(s)" | awk '{print $2}' | cut -d'%' -f1)% usado"
echo "RAM:    $(free -h | awk '/^Mem:/ {print $3 "/" $2 " (" int($3/$2*100) "% usado)"}')"
echo "Disco:  $(df -h / | awk 'NR==2 {print $3 "/" $2 " (" $5 " usado)"}')"
echo "Uptime: $(uptime -p)"
echo ""

# Contenedores Docker
echo -e "${YELLOW}🐳 CONTENEDORES DOCKER${NC}"
echo "────────────────────────────────────────"
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" | head -15
echo ""

# Contar contenedores
RUNNING=$(docker ps -q | wc -l)
TOTAL=$(docker ps -aq | wc -l)
if [ $RUNNING -eq $TOTAL ]; then
    echo -e "${GREEN}✅ Todos los contenedores están corriendo ($RUNNING/$TOTAL)${NC}"
else
    echo -e "${RED}⚠️  Algunos contenedores están detenidos ($RUNNING/$TOTAL)${NC}"
fi
echo ""

# URLs de Servicios
echo -e "${YELLOW}🌐 URLs DE SERVICIOS${NC}"
echo "────────────────────────────────────────"
IP=$(hostname -I | awk '{print $1}')
echo "  Traefik:     http://$IP:8080"
echo "  Grafana:     http://$IP:3000"
echo "  Prometheus:  http://$IP:9090"
echo "  Gitea:       http://$IP:3001"
echo "  Uptime Kuma: http://$IP:3002"
echo ""

# Redes Docker
echo -e "${YELLOW}🔗 REDES DOCKER${NC}"
echo "────────────────────────────────────────"
docker network ls --format "{{.Name}}" | grep -v "bridge\|host\|none" | while read net; do
    CONTAINERS=$(docker network inspect $net --format '{{len .Containers}}')
    echo "  $net: $CONTAINERS contenedores"
done
echo ""

# Último backup
echo -e "${YELLOW}💾 ÚLTIMO BACKUP${NC}"
echo "────────────────────────────────────────"
LAST_BACKUP=$(ls -1t ~/devops/backups 2>/dev/null | head -1)
if [ -n "$LAST_BACKUP" ]; then
    SIZE=$(du -sh ~/devops/backups/$LAST_BACKUP 2>/dev/null | cut -f1)
    echo "  Fecha: $LAST_BACKUP"
    echo "  Tamaño: $SIZE"
else
    echo "  No hay backups disponibles"
fi
echo ""
```

Guardar: `Ctrl+O`, Enter, `Ctrl+X`

### 7.5 Dar permisos de ejecución

```bash
chmod +x deploy.sh backup.sh status.sh
```

### 7.6 Probar los scripts

```bash
# Ver estado del servidor
./status.sh

# Crear un backup manual
./backup.sh
```

---

## 8. Fase 6: Uptime Kuma

### ¿Qué es Uptime Kuma?

Herramienta de monitoreo de disponibilidad autohospedada. Verifica que los servicios respondan y envía alertas cuando detecta caídas.

### 8.1 Crear directorio

```bash
mkdir -p ~/devops/monitoring/uptime-kuma
cd ~/devops/monitoring/uptime-kuma
```

### 8.2 Crear docker-compose.yml

```bash
nano docker-compose.yml
```

Pegar el siguiente contenido:

```yaml
services:
  uptime-kuma:
    image: louislam/uptime-kuma:latest
    container_name: uptime-kuma
    restart: unless-stopped
    volumes:
      - uptime_data:/app/data
    ports:
      - '3002:3001'
    networks:
      - proxy

volumes:
  uptime_data:

networks:
  proxy:
    external: true
```

Guardar: `Ctrl+O`, Enter, `Ctrl+X`

### 8.3 Iniciar Uptime Kuma

```bash
docker compose up -d
```

### 8.4 Configurar Uptime Kuma

1. Acceder a `http://TU_IP:3002`
2. Crear usuario administrador
3. Agregar monitores

### 8.5 Monitores Recomendados

> ⚠️ **IMPORTANTE:** Usa las URLs internas de Docker para los monitores. Uptime Kuma está en la misma red que los otros contenedores.

| Servicio   | URL Interna            | Intervalo |
| ---------- | ---------------------- | --------- |
| Traefik    | http://traefik:8080    | 60s       |
| Grafana    | http://grafana:3000    | 60s       |
| Prometheus | http://prometheus:9090 | 60s       |
| Gitea      | http://gitea:3000      | 60s       |
| Loki       | http://loki:3100/ready | 60s       |

### 8.6 Configurar Notificaciones Telegram

#### Crear bot de Telegram:

1. Abrir Telegram y buscar `@BotFather`
2. Enviar `/newbot`
3. Seguir instrucciones y guardar el **Token**

#### Obtener Chat ID:

1. Enviar cualquier mensaje a tu nuevo bot
2. Abrir en navegador: `https://api.telegram.org/botTU_TOKEN/getUpdates`
3. Buscar el campo `"id"` en la respuesta JSON

#### Configurar en Uptime Kuma:

1. Ir a **Settings** → **Notifications**
2. Click **Setup Notification**
3. Seleccionar **Telegram**
4. Ingresar Token y Chat ID
5. Marcar: ✅ "Default enabled" y ✅ "Apply on all existing monitors"

---

## 9. Fase 7: Loki (Logs)

### ¿Qué es Loki?

Sistema de agregación de logs de Grafana Labs. Indexa solo labels (no contenido completo), haciéndolo muy ligero comparado con Elasticsearch.

### Componentes

| Servicio     | Función                                     |
| ------------ | ------------------------------------------- |
| **Loki**     | Almacena e indexa logs. API para consultas. |
| **Promtail** | Agente que recolecta logs de contenedores.  |

### 9.1 Crear directorio

```bash
mkdir -p ~/devops/monitoring/loki
cd ~/devops/monitoring/loki
```

### 9.2 Crear loki-config.yml

```bash
nano loki-config.yml
```

Pegar el siguiente contenido:

```yaml
auth_enabled: false

server:
  http_listen_port: 3100

common:
  path_prefix: /loki
  storage:
    filesystem:
      chunks_directory: /loki/chunks
      rules_directory: /loki/rules
  replication_factor: 1
  ring:
    kvstore:
      store: inmemory

schema_config:
  configs:
    - from: 2024-01-01
      store: tsdb
      object_store: filesystem
      schema: v13
      index:
        prefix: index_
        period: 24h

limits_config:
  retention_period: 720h
  allow_structured_metadata: true
```

Guardar: `Ctrl+O`, Enter, `Ctrl+X`

### 9.3 Crear promtail-config.yml

```bash
nano promtail-config.yml
```

Pegar el siguiente contenido:

```yaml
server:
  http_listen_port: 9080
  grpc_listen_port: 0

positions:
  filename: /tmp/positions.yaml

clients:
  - url: http://loki:3100/loki/api/v1/push

scrape_configs:
  - job_name: docker
    docker_sd_configs:
      - host: unix:///var/run/docker.sock
        refresh_interval: 5s
    relabel_configs:
      - source_labels: ['__meta_docker_container_name']
        regex: '/(.*)'
        target_label: 'container'
      - source_labels: ['__meta_docker_container_log_stream']
        target_label: 'stream'
      - source_labels: ['__meta_docker_compose_service']
        target_label: 'service'
```

Guardar: `Ctrl+O`, Enter, `Ctrl+X`

### 9.4 Crear docker-compose.yml

```bash
nano docker-compose.yml
```

Pegar el siguiente contenido:

```yaml
services:
  loki:
    image: grafana/loki:latest
    container_name: loki
    restart: unless-stopped
    volumes:
      - ./loki-config.yml:/etc/loki/loki-config.yml:ro
      - loki_data:/loki
    command: -config.file=/etc/loki/loki-config.yml
    ports:
      - '3100:3100'
    networks:
      - monitoring_monitoring
      - proxy

  promtail:
    image: grafana/promtail:latest
    container_name: promtail
    restart: unless-stopped
    volumes:
      - ./promtail-config.yml:/etc/promtail/promtail-config.yml:ro
      - /var/run/docker.sock:/var/run/docker.sock:ro
    command: -config.file=/etc/promtail/promtail-config.yml
    depends_on:
      - loki
    networks:
      - monitoring_monitoring

volumes:
  loki_data:

networks:
  monitoring_monitoring:
    external: true
  proxy:
    external: true
```

Guardar: `Ctrl+O`, Enter, `Ctrl+X`

### 9.5 Iniciar Loki

```bash
docker compose up -d
```

### 9.6 Configurar Loki en Grafana

1. Acceder a Grafana (`http://TU_IP:3000`)
2. Ir a **Connections** → **Data sources** → **Add data source**
3. Seleccionar **Loki**
4. URL: `http://loki:3100`
5. Click **Save & test**

### 9.7 Ver logs

1. Ir a **Explore** en Grafana
2. Seleccionar **Loki** como datasource
3. Usar queries como:
   - `{container="traefik"}`
   - `{container="gitea"}`
   - `{service="prometheus"}`

---

## 10. Fase 8: Cron (Backups Automáticos)

### ¿Qué es Cron?

Cron es el programador de tareas de Linux. Permite ejecutar scripts automáticamente en horarios definidos.

### 10.1 Configurar backup automático

```bash
crontab -e
```

Si pregunta qué editor usar, seleccionar `nano` (opción 1).

Agregar al final del archivo:

```bash
# Backup diario a las 3:00 AM
0 3 * * * /home/devops/devops/scripts/backup.sh >> /home/devops/devops/backups/backup.log 2>&1
```

Guardar: `Ctrl+O`, Enter, `Ctrl+X`

### 10.2 Sintaxis de Cron

```
┌───────────── minuto (0-59)
│ ┌───────────── hora (0-23)
│ │ ┌───────────── día del mes (1-31)
│ │ │ ┌───────────── mes (1-12)
│ │ │ │ ┌───────────── día de la semana (0-6, 0=domingo)
│ │ │ │ │
* * * * * comando
```

### 10.3 Ejemplos comunes

| Expresión     | Descripción                          |
| ------------- | ------------------------------------ |
| `0 3 * * *`   | Todos los días a las 3:00 AM         |
| `0 */6 * * *` | Cada 6 horas                         |
| `0 3 * * 0`   | Domingos a las 3:00 AM               |
| `0 3 1 * *`   | Primer día de cada mes a las 3:00 AM |

### 10.4 Verificar configuración

```bash
crontab -l
```

### 10.5 Ver logs del backup

```bash
tail -f ~/devops/backups/backup.log
```

---

## 11. Fase 9: Fail2ban

### ¿Qué es Fail2ban?

Fail2ban monitorea logs del sistema y bloquea IPs que muestran comportamiento malicioso (múltiples intentos fallidos de login). Protege principalmente SSH contra ataques de fuerza bruta.

### 11.1 Instalación

```bash
sudo apt update
sudo apt install fail2ban -y
```

### 11.2 Crear configuración

```bash
sudo nano /etc/fail2ban/jail.local
```

Pegar el siguiente contenido:

```ini
[DEFAULT]
bantime  = 1h
findtime = 10m
maxretry = 5
ignoreip = 127.0.0.1/8 ::1

[sshd]
enabled = true
port    = ssh
logpath = %(sshd_log)s
backend = systemd
maxretry = 3
```

Guardar: `Ctrl+O`, Enter, `Ctrl+X`

### 11.3 Activar servicio

```bash
sudo systemctl enable fail2ban
sudo systemctl start fail2ban
```

### 11.4 Verificar estado

```bash
# Estado general
sudo fail2ban-client status

# Detalles de SSH
sudo fail2ban-client status sshd
```

### 11.5 Comandos útiles

```bash
# Ver IPs baneadas
sudo fail2ban-client status sshd

# Desbanear una IP
sudo fail2ban-client set sshd unbanip 192.168.1.100

# Ver logs de fail2ban
sudo tail -f /var/log/fail2ban.log
```

---

## 12. Estructura de Directorios

```
~/devops/
├── apps/                        # Aplicaciones desplegadas
├── backups/                     # Respaldos automáticos
│   └── YYYYMMDD_HHMMSS/         # Carpetas por fecha
├── ci-cd/
│   └── gitea/
│       └── docker-compose.yml
├── configs/
│   └── traefik/
│       ├── acme.json
│       ├── config.yml
│       ├── docker-compose.yml
│       └── traefik.yml
├── docs/                        # Documentación
│   └── DevOps-Guide.md
├── monitoring/
│   ├── docker-compose.yml       # Prometheus, Grafana, etc.
│   ├── prometheus/
│   │   └── prometheus.yml
│   ├── uptime-kuma/
│   │   └── docker-compose.yml
│   └── loki/
│       ├── docker-compose.yml
│       ├── loki-config.yml
│       └── promtail-config.yml
├── scripts/
│   ├── backup.sh
│   ├── deploy.sh
│   └── status.sh
└── ssl/                         # Certificados SSL (futuro)
```

---

## 13. URLs de Acceso

| Servicio          | URL               | Credenciales       |
| ----------------- | ----------------- | ------------------ |
| Traefik Dashboard | http://TU_IP:8080 | -                  |
| Grafana           | http://TU_IP:3000 | admin / devops2024 |
| Prometheus        | http://TU_IP:9090 | -                  |
| Gitea             | http://TU_IP:3001 | Configurado        |
| Uptime Kuma       | http://TU_IP:3002 | Configurado        |
| Loki              | http://TU_IP:3100 | Solo interno       |

---

## 14. Troubleshooting

### Error: Permission denied (Docker)

**Problema:** Al ejecutar comandos Docker aparece "permission denied".

**Solución:** Asegúrate de estar usando el usuario `devops`:

```bash
su - devops
```

Si ya estás como devops y sigue fallando:

```bash
# Verificar que estás en el grupo docker
groups

# Si no aparece 'docker', agrégalo
sudo usermod -aG docker devops

# Cerrar sesión y volver a entrar
exit
su - devops
```

### Error: Docker API version too old (Traefik)

**Problema:** Traefik muestra "client version 1.24 is too old".

**Solución 1:** Agregar variable de entorno en docker-compose.yml:

```yaml
environment:
  - DOCKER_API_VERSION=1.44
```

**Solución 2:** Actualizar Docker:

```bash
sudo apt-get update
sudo apt-get install docker-ce docker-ce-cli containerd.io
```

### Error: Loki schema version

**Problema:** Loki no inicia con errores de schema.

**Solución:** Usar schema v13 con store tsdb:

```yaml
schema_config:
  configs:
    - from: 2024-01-01
      store: tsdb
      object_store: filesystem
      schema: v13
```

### Error: Red Docker no encontrada

**Problema:** "network X declared as external, but could not be found"

**Solución:**

```bash
# Ver redes existentes
docker network ls

# Crear la red si no existe
docker network create proxy

# Las redes de compose tienen prefijo del directorio
# Ejemplo: monitoring_monitoring en vez de monitoring
```

### Error: File provider - no such file (Traefik)

**Problema:** Traefik muestra "error adding file watcher: no such file or directory"

**Solución:**

```bash
cd ~/devops/configs/traefik
touch config.yml
docker restart traefik
```

### Contenedores huérfanos

**Problema:** Hay contenedores viejos que no se usan.

**Solución:**

```bash
# Eliminar contenedores detenidos
docker container prune -f

# Eliminar imágenes no usadas
docker image prune -f

# Limpieza completa (cuidado en producción)
docker system prune -f
```

---

## 15. Próximos Pasos

### Cuando tengas un dominio

1. **Configurar DNS** apuntando a tu IP
2. **Modificar traefik.yml** para SSL automático:

```yaml
certificatesResolvers:
  letsencrypt:
    acme:
      email: tu@email.com
      storage: acme.json
      httpChallenge:
        entryPoint: web
```

3. **Agregar redirección** HTTP → HTTPS
4. **Configurar subdominios** para cada servicio

### Para desplegar una aplicación

1. **Crear directorio:**

```bash
mkdir -p ~/devops/apps/mi-app
cd ~/devops/apps/mi-app
```

2. **Crear docker-compose.yml** con labels de Traefik:

```yaml
services:
  app:
    image: mi-app:latest
    labels:
      - 'traefik.enable=true'
      - 'traefik.http.routers.mi-app.rule=Host(`mi-app.tudominio.com`)'
      - 'traefik.http.routers.mi-app.entrypoints=websecure'
      - 'traefik.http.routers.mi-app.tls.certresolver=letsencrypt'
    networks:
      - proxy

networks:
  proxy:
    external: true
```

3. **Desplegar:**

```bash
~/devops/scripts/deploy.sh mi-app
```

### Comandos útiles del día a día

```bash
# Ver estado general
./scripts/status.sh

# Ver logs de un contenedor
docker logs -f nombre-contenedor

# Ver logs en Grafana
# Explore → Loki → {container="nombre"}

# Reiniciar un stack
cd ~/devops/monitoring && docker compose restart

# Backup manual
./scripts/backup.sh

# Ver IPs bloqueadas por Fail2ban
sudo fail2ban-client status sshd

# Verificar espacio en disco
df -h

# Ver uso de recursos por contenedor
docker stats
```

---

## 16. Implementación en Servidor Saturno (TEST/UAT)

### Contexto

**Saturno** es el servidor de **TEST/UAT** de Enerlova. A diferencia del servidor genérico documentado en las fases anteriores, Saturno tiene requisitos específicos para el ambiente de pruebas.

| Aspecto | Configuración |
|---------|---------------|
| **Servidor** | Saturno (TEST/UAT) |
| **Dominio** | https://enerlovauat.mmlovalledor.cl |
| **Frontend** | Puerto 32010 |
| **Backend** | Puerto 32011 (ruta `/Enerlova`) |
| **Reverse Proxy** | Nginx (dentro del contenedor frontend) |
| **SSL** | Gestionado externamente |

> [!NOTE]
> **Configuración de Proxy:** En Saturno, el frontend incluye **Nginx internamente** que hace proxy a los endpoints `/Enerlova` hacia el backend externo. No se usa un reverse proxy separado como Traefik.

### Arquitectura de Saturno (TEST)

```
Internet (HTTPS)
       ↓
enerlovauat.mmlovalledor.cl
       ↓
[Contenedor Frontend - enerlova-frontend-test]
       ├── Nginx (puerto 80)
       │   ├── / → SPA (React/Vite)
       │   └── /Enerlova → proxy_pass http://enerlova-api:8080
       │
       └── Redes: enerlova-test + proxy
              ↓
[Contenedor Backend - enerlova-api]
       └── .NET API (puerto 8080)
           └── Red: proxy
```

### Configuración de Nginx en Frontend

El contenedor del frontend incluye Nginx con la siguiente configuración:

```nginx
# nginx.conf - Dentro del contenedor frontend

server {
    listen 80;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;

    # Compresión
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml;

    # Headers de seguridad
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-Frame-Options "DENY" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    # Proxy al backend (API)
    location /Enerlova {
        proxy_pass http://enerlova-api:8080;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_cache_bypass $http_upgrade;
    }

    # Frontend SPA
    location / {
        try_files $uri $uri/ /index.html;
        add_header Cache-Control "no-cache";
    }

    # Caché para assets
    location /assets/ {
        expires 1y;
        add_header Cache-Control "public, no-transform";
    }

    error_page 404 /index.html;
}
```

### Docker Compose - TEST

```yaml
# docker-compose.test.yml

services:
  frontend:
    image: enerlova-frontend:test
    container_name: enerlova-frontend-test
    restart: unless-stopped
    build:
      context: .
      dockerfile: Dockerfile
      args:
        VITE_API_URL: https://enerlovauat.mmlovalledor.cl/Enerlova
        VITE_APP_ENV: test
    environment:
      - NODE_ENV=production
      - VITE_APP_ENV=test
    ports:
      - "32010:80"  # Expuesto directamente
    networks:
      - enerlova-test
      - proxy  # Para comunicarse con backend
    deploy:
      resources:
        limits:
          cpus: '0.5'
          memory: 512M

networks:
  enerlova-test:
    driver: bridge
  proxy:
    external: true  # Red compartida con backend
```

### Despliegue en Saturno

> [!NOTE]
> **Despliegue Automatizado:** El despliegue en Saturno se realiza **automáticamente vía GitHub Actions**, no mediante comandos manuales.

#### Proceso de Despliegue

1. **Desarrollador hace push a rama `test`:**
   ```bash
   git push origin test
   ```

2. **GitHub Actions se ejecuta automáticamente:**
   - Construye la imagen Docker del frontend (con Nginx incluido)
   - Se conecta a Saturno vía SSH
   - Ejecuta `docker compose -f docker-compose.test.yml up -d --build`

3. **Nginx dentro del frontend** hace proxy a `/Enerlova` hacia el backend

4. **Aplicación disponible** en https://enerlovauat.mmlovalledor.cl

#### Monitorear Despliegue

```bash
# Conectar a Saturno
ssh usuario@saturno

# Ver contenedores corriendo
docker ps | grep enerlova

# Ver logs de frontend
docker logs -f enerlova-frontend-test

# Ver logs de backend
docker logs -f enerlova-api

# Verificar comunicación frontend → backend
docker exec enerlova-frontend-test curl -I http://enerlova-api:8080/swagger
```

### Verificación Rápida

```bash
# Frontend
curl -I http://enerlovauat.mmlovalledor.cl:32010

# Backend via proxy desde frontend
curl -I http://enerlovauat.mmlovalledor.cl:32010/Enerlova/swagger

# Con SSL (si está configurado externamente)
curl -k -I https://enerlovauat.mmlovalledor.cl
curl -k -I https://enerlovauat.mmlovalledor.cl/Enerlova/swagger
```

### Requisitos de Red

Para que Nginx en el frontend pueda hacer proxy al backend:

1. **Red compartida:** Ambos contenedores deben estar en la red `proxy`
   ```bash
   # Verificar
   docker network inspect proxy
   ```

2. **Resolución de nombres:** El backend debe ser accesible como `enerlova-api`
   ```bash
   # Probar desde el frontend
   docker exec enerlova-frontend-test ping enerlova-api
   docker exec enerlova-frontend-test curl http://enerlova-api:8080/swagger
   ```

3. **Puerto interno del backend:** Nginx usa el puerto **interno** del backend (8080), no el expuesto (32011)

### Diferencias con Configuración Genérica

| Aspecto | Servidor Genérico | Saturno (TEST) |
|---------|-------------------|----------------|
| **Propósito** | Desarrollo/Demo con Traefik | TEST/UAT Empresa |
| **Reverse Proxy** | Traefik separado | Nginx dentro del frontend |
| **Puerto Frontend** | Labels Traefik | Expuesto directamente (32010) |
| **Proxy Backend** | Traefik router | Nginx `proxy_pass` |
| **SSL** | Traefik TLS | Gestionado externamente |
| **Dashboard** | Traefik Dashboard | No aplica |

### Comandos Útiles Saturno

```bash
# Ver estado de contenedores
docker ps --filter "name=enerlova"

# Reiniciar frontend (Nginx)
docker restart enerlova-frontend-test

# Ver configuración de Nginx dentro del contenedor
docker exec enerlova-frontend-test cat /etc/nginx/nginx.conf

# Verificar logs de Nginx
docker exec enerlova-frontend-test tail -f /var/log/nginx/access.log
docker exec enerlova-frontend-test tail -f /var/log/nginx/error.log

# Probar conectividad frontend → backend
docker exec enerlova-frontend-test curl -X POST \
  http://enerlova-api:8080/Enerlova/login \
  -H "Content-Type: application/json" \
  -d '{"username":"test","password":"test"}'
```

### Troubleshooting

#### Error 405 en /Enerlova

**Causa:** Nginx no está haciendo proxy correctamente.

**Solución:**
```bash
# Verificar configuración de Nginx
docker exec enerlova-frontend-test cat /etc/nginx/nginx.conf | grep -A 10 "location /Enerlova"

# Verificar que backend es alcanzable
docker exec enerlova-frontend-test wget -O- http://enerlova-api:8080/swagger/index.html
```

#### Backend no responde

**Causa:** Contenedores no están en la misma red.

**Solución:**
```bash
# Verificar redes
docker inspect enerlova-frontend-test | grep -A 10 Networks
docker inspect enerlova-api | grep -A 10 Networks

# Agregar a red proxy si falta
docker network connect proxy enerlova-frontend-test
docker network connect proxy enerlova-api
```

---


```yaml
# Agregar a prometheus.yml
scrape_configs:
  - job_name: 'traefik-test'
    static_configs:
      - targets: ['traefik-test:8080']
```

---

## Notas Finales


Esta infraestructura proporciona una base sólida para desarrollo y despliegue continuo. Los componentes están diseñados para ser modulares y escalables según las necesidades del proyecto.

### Recursos consumidos aproximados

| Servicio        | RAM        |
| --------------- | ---------- |
| Traefik         | ~50MB      |
| Prometheus      | ~200MB     |
| Grafana         | ~150MB     |
| Gitea           | ~150MB     |
| Loki + Promtail | ~200MB     |
| Uptime Kuma     | ~100MB     |
| **Total**       | **~850MB** |

Esto deja aproximadamente **7GB de RAM disponible** para tus aplicaciones.

### Mantenimiento recomendado

| Tarea                         | Frecuencia |
| ----------------------------- | ---------- |
| Revisar Uptime Kuma           | Diario     |
| Revisar dashboards de Grafana | Semanal    |
| Verificar backups             | Semanal    |
| Actualizar imágenes Docker    | Mensual    |
| Revisar logs de Fail2ban      | Mensual    |

---

**Documento generado:** Diciembre 2024  
**Versión:** 2.0
