#!/bin/bash
# ==========================================
# Script para pushear imagen Docker a registry
# Uso: ./scripts/docker-push.sh [environment]
# ==========================================

set -e

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Variables
ENVIRONMENT=${1:-production}
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

echo -e "${YELLOW}→ Verificando login en Docker Registry...${NC}"
echo "  Registry: $DOCKER_REGISTRY"
echo ""

# Validar si está logueado (simple check)
if [ "$DOCKER_REGISTRY" = "ghcr.io" ]; then
    if ! grep -q "ghcr.io" ~/.docker/config.json 2>/dev/null; then
        echo -e "${YELLOW}⚠ No está logueado en GitHub Container Registry${NC}"
        echo "  Ejecute: docker login ghcr.io"
        echo "  Use tu GitHub username y Personal Access Token (PAT)"
        exit 1
    fi
fi

echo -e "${YELLOW}→ Pushando imagen a registry...${NC}"
echo "  Imagen: $IMAGE_NAME"
echo ""

docker push "$IMAGE_NAME"

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Imagen pushed exitosamente${NC}"
    echo "  Imagen: $IMAGE_NAME"
    echo ""
    echo "Próximos pasos:"
    echo "  Deploy: ./scripts/docker-deploy.sh $ENVIRONMENT"
else
    echo -e "${RED}✗ Error al pushear la imagen${NC}"
    exit 1
fi
