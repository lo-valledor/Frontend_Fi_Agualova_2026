#!/bin/bash
# ==========================================
# Script para desplegar contenedor Docker
# Usa docker run (sin Docker Compose)
# Uso: ./scripts/docker-deploy.sh [environment] [remote]
# ==========================================

set -e

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Variables
ENVIRONMENT=${1:-production}
REMOTE=${2:-false}
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
ENV_FILE="$PROJECT_DIR/.env.$ENVIRONMENT"

# Validar archivo de entorno
if [ ! -f "$ENV_FILE" ]; then
    echo -e "${RED}✗ Error: Archivo .env.$ENVIRONMENT no encontrado${NC}"
    exit 1
fi

# Cargar variables de entorno
source "$ENV_FILE"

# Construir nombre de imagen
IMAGE_NAME="${DOCKER_REGISTRY}/${DOCKER_USERNAME}/${DOCKER_IMAGE_NAME}:${DOCKER_IMAGE_TAG}"

# ==========================================
# Funciones auxiliares
# ==========================================

deploy_locally() {
    echo -e "${YELLOW}→ Desplegando localmente...${NC}"

    # Detener contenedor existente
    if docker ps -a --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
        echo -e "${BLUE}  Deteniendo contenedor existente...${NC}"
        docker stop "$CONTAINER_NAME" || true
        docker rm "$CONTAINER_NAME" || true
    fi

    # Crear directorio de logs
    mkdir -p "/var/log/enerlova"

    # Ejecutar contenedor
    echo -e "${BLUE}  Iniciando nuevo contenedor...${NC}"
    docker run \
        --name "$CONTAINER_NAME" \
        --restart unless-stopped \
        --publish "${HOST_PORT}:80" \
        --env NGINX_WORKER_PROCESSES="$NGINX_WORKER_PROCESSES" \
        --env NGINX_WORKER_CONNECTIONS="$NGINX_WORKER_CONNECTIONS" \
        --log-driver json-file \
        --log-opt max-size=10m \
        --log-opt max-file=3 \
        --detach \
        "$IMAGE_NAME"

    CONTAINER_ID=$(docker ps --filter "name=^${CONTAINER_NAME}$" --format "{{.ID}}")

    if [ -n "$CONTAINER_ID" ]; then
        echo -e "${GREEN}✓ Contenedor desplegado exitosamente${NC}"
        echo "  ID: $CONTAINER_ID"
        echo "  Nombre: $CONTAINER_NAME"
        echo "  URL: http://localhost:${HOST_PORT}"
        return 0
    else
        echo -e "${RED}✗ Error al desplegar contenedor${NC}"
        return 1
    fi
}

deploy_remotely() {
    echo -e "${YELLOW}→ Desplegando en servidor remoto...${NC}"
    echo "  Host: $DEPLOY_HOST"
    echo "  Usuario: $DEPLOY_USER"
    echo ""

    # Validar SSH
    if ! ssh -q -o BatchMode=yes -o ConnectTimeout=5 "${DEPLOY_USER}@${DEPLOY_HOST}" -p "$DEPLOY_PORT" "exit" 2>/dev/null; then
        echo -e "${RED}✗ Error: No se puede conectar al servidor${NC}"
        echo "  Verifica:"
        echo "    - Host: $DEPLOY_HOST"
        echo "    - Usuario: $DEPLOY_USER"
        echo "    - Puerto: $DEPLOY_PORT"
        echo "    - SSH keys configuradas"
        return 1
    fi

    # Crear script de deployment remoto
    DEPLOY_SCRIPT=$(cat <<'REMOTE_SCRIPT'
#!/bin/bash
set -e
IMAGE_NAME=$1
CONTAINER_NAME=$2
HOST_PORT=$3
DEPLOY_PATH=$4

echo "→ Desplegando en servidor remoto..."

# Detener contenedor
if docker ps -a --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
    echo "  Deteniendo contenedor existente..."
    docker stop "$CONTAINER_NAME" || true
    docker rm "$CONTAINER_NAME" || true
fi

# Pullear imagen
echo "  Descargando imagen..."
docker pull "$IMAGE_NAME"

# Crear directorio de datos
mkdir -p "$DEPLOY_PATH"

# Ejecutar contenedor
echo "  Iniciando contenedor..."
docker run \
    --name "$CONTAINER_NAME" \
    --restart unless-stopped \
    --publish "${HOST_PORT}:80" \
    --log-driver json-file \
    --log-opt max-size=10m \
    --log-opt max-file=3 \
    --detach \
    "$IMAGE_NAME"

echo "✓ Contenedor desplegado exitosamente"
REMOTE_SCRIPT
    )

    # Ejecutar script remoto
    ssh -p "$DEPLOY_PORT" "${DEPLOY_USER}@${DEPLOY_HOST}" bash -s "$IMAGE_NAME" "$CONTAINER_NAME" "$HOST_PORT" "$DEPLOY_PATH" <<< "$DEPLOY_SCRIPT"

    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ Despliegue remoto completado${NC}"
        echo "  URL: http://${DEPLOY_HOST}:${HOST_PORT}"
        return 0
    else
        echo -e "${RED}✗ Error en despliegue remoto${NC}"
        return 1
    fi
}

# ==========================================
# Health Check
# ==========================================

health_check() {
    local url=$1
    local max_attempts=30
    local attempt=0

    echo -e "${BLUE}  Verificando salud del contenedor...${NC}"

    while [ $attempt -lt $max_attempts ]; do
        if curl -sf "$url/health" >/dev/null 2>&1 || curl -sf "$url" >/dev/null 2>&1; then
            echo -e "${GREEN}  ✓ Contenedor está saludable${NC}"
            return 0
        fi

        attempt=$((attempt + 1))
        if [ $((attempt % 5)) -eq 0 ]; then
            echo -n "."
        fi
        sleep 1
    done

    echo -e "${YELLOW}  ⚠ No se pudo verificar salud (timeout)${NC}"
    return 0
}

# ==========================================
# Main
# ==========================================

echo -e "${BLUE}╔════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   Enerlova Frontend - Docker Deploy    ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════╝${NC}"
echo ""
echo "Configuración:"
echo "  Entorno: $ENVIRONMENT"
echo "  Imagen: $IMAGE_NAME"
echo "  Contenedor: $CONTAINER_NAME"
echo ""

if [ "$REMOTE" = "true" ] || [ "$REMOTE" = "remote" ]; then
    deploy_remotely
    SUCCESS=$?
else
    deploy_locally
    SUCCESS=$?
fi

if [ $SUCCESS -eq 0 ]; then
    echo ""
    echo -e "${GREEN}╔════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║   Despliegue completado exitosamente   ║${NC}"
    echo -e "${GREEN}╚════════════════════════════════════════╝${NC}"
    exit 0
else
    echo ""
    echo -e "${RED}✗ Error durante el despliegue${NC}"
    exit 1
fi
