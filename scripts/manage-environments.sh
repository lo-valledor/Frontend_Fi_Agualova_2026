#!/bin/bash

# Script para manejar entornos de desarrollo y producción
# Uso: ./scripts/manage-environments.sh [dev|prod|stop] [nginx]

set -e

ENVIRONMENT=${1:-dev}
PROFILE=${2:-}

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Función para mostrar mensajes
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

warn() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] WARNING: $1${NC}"
}

error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ERROR: $1${NC}"
    exit 1
}

# Función para verificar si Docker está ejecutándose
check_docker() {
    if ! docker info > /dev/null 2>&1; then
        error "Docker no está ejecutándose. Por favor, inicia Docker primero."
    fi
}

# Función para detener todos los contenedores
stop_all() {
    log "Deteniendo todos los contenedores..."
    docker-compose down 2>/dev/null || true
    docker-compose -f docker-compose.dev.yml down 2>/dev/null || true
    log "Todos los contenedores han sido detenidos."
}

# Función para iniciar entorno de desarrollo
start_dev() {
    log "Iniciando entorno de desarrollo..."

    if [ "$PROFILE" = "nginx" ]; then
        log "Usando perfil nginx para desarrollo..."
        docker-compose -f docker-compose.dev.yml --profile nginx-dev up -d
        log "Entorno de desarrollo con nginx iniciado en http://localhost:3001"
    else
        log "Usando servidor de desarrollo con hot reload..."
        docker-compose -f docker-compose.dev.yml up -d
        log "Entorno de desarrollo iniciado en http://localhost:4200"
        log "Hot reload habilitado - los cambios se reflejarán automáticamente"
    fi
}

# Función para iniciar entorno de producción
start_prod() {
    log "Iniciando entorno de producción..."
    docker-compose up -d
    log "Entorno de producción iniciado en http://localhost:8080"
}

# Función para mostrar logs
show_logs() {
    if [ "$ENVIRONMENT" = "dev" ]; then
        docker-compose -f docker-compose.dev.yml logs -f
    else
        docker-compose logs -f
    fi
}

# Función para mostrar estado
show_status() {
    log "Estado de los contenedores:"
    if [ "$ENVIRONMENT" = "dev" ]; then
        docker-compose -f docker-compose.dev.yml ps
    else
        docker-compose ps
    fi
}

# Función para limpiar
cleanup() {
    log "Limpiando contenedores e imágenes no utilizadas..."
    docker system prune -f
    log "Limpieza completada."
}

# Función para mostrar ayuda
show_help() {
    echo -e "${BLUE}Script de gestión de entornos - Enerlova Frontend${NC}"
    echo ""
    echo "Uso: $0 [comando] [opción]"
    echo ""
    echo "Comandos:"
    echo "  dev [nginx]    - Inicia entorno de desarrollo"
    echo "                   Opción 'nginx': usa nginx en lugar del servidor de desarrollo"
    echo "  prod           - Inicia entorno de producción"
    echo "  stop           - Detiene todos los contenedores"
    echo "  logs           - Muestra logs del entorno actual"
    echo "  status         - Muestra estado de los contenedores"
    echo "  cleanup        - Limpia contenedores e imágenes no utilizadas"
    echo "  help           - Muestra esta ayuda"
    echo ""
    echo "Ejemplos:"
    echo "  $0 dev         - Inicia desarrollo con hot reload"
    echo "  $0 dev nginx   - Inicia desarrollo con nginx"
    echo "  $0 prod        - Inicia producción"
    echo "  $0 stop        - Detiene todos los entornos"
}

# Verificar Docker
check_docker

# Procesar comandos
case $ENVIRONMENT in
    "dev")
        stop_all
        start_dev
        ;;
    "prod")
        stop_all
        start_prod
        ;;
    "stop")
        stop_all
        ;;
    "logs")
        show_logs
        ;;
    "status")
        show_status
        ;;
    "cleanup")
        cleanup
        ;;
    "help"|"-h"|"--help")
        show_help
        ;;
    *)
        error "Comando no válido: $ENVIRONMENT"
        echo ""
        show_help
        ;;
esac
