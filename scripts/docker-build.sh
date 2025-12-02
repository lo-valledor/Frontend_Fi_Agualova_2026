#!/bin/bash
# ==========================================
# Script para construir imagen Docker
# Uso: ./scripts/docker-build.sh [environment]
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
    echo "  Copia .env.example a .env.$ENVIRONMENT"
    exit 1
fi

# Cargar variables de entorno
source "$ENV_FILE"

# Validar variables requeridas
if [ -z "$VITE_API_URL" ]; then
    echo -e "${RED}✗ Error: Variable VITE_API_URL no está definida${NC}"
    exit 1
fi

# Construir nombre de imagen (usa defaults si no existen variables)
DOCKER_REGISTRY=${DOCKER_REGISTRY:-enerlova-frontend}
DOCKER_IMAGE_TAG=${DOCKER_IMAGE_TAG:-latest}
IMAGE_NAME="${DOCKER_REGISTRY}:${DOCKER_IMAGE_TAG}"

echo -e "${YELLOW}→ Construyendo imagen Docker...${NC}"
echo "  Nombre: $IMAGE_NAME"
echo "  Entorno: $ENVIRONMENT"
echo ""

docker build \
    --build-arg VITE_API_URL="$VITE_API_URL" \
    --build-arg VITE_ENV_MODE="$VITE_ENV_MODE" \
    --tag "$IMAGE_NAME" \
    --file "$PROJECT_DIR/Dockerfile" \
    "$PROJECT_DIR"

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Imagen construida exitosamente${NC}"
    echo "  Imagen: $IMAGE_NAME"
    echo ""
    echo "Próximos pasos:"
    echo "  1. Deploy local: ./scripts/docker-deploy.sh $ENVIRONMENT"
    echo "  2. O hacer push a GitHub para CI/CD automático"
else
    echo -e "${RED}✗ Error al construir la imagen${NC}"
    exit 1
fi
