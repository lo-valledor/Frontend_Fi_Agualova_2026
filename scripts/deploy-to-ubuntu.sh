#!/bin/bash

# Script para desplegar Enerlova Frontend en servidor Ubuntu
# Uso: ./scripts/deploy-to-ubuntu.sh [servidor] [rama] [entorno]

set -e

SERVER_HOST=${1:-}
BRANCH=${2:-main}
ENVIRONMENT=${3:-prod}

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
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

info() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')] INFO: $1${NC}"
}

# Función para mostrar ayuda
show_help() {
    echo -e "${BLUE}Script de despliegue para Ubuntu Server - Enerlova Frontend${NC}"
    echo ""
    echo "Uso: $0 [servidor] [rama] [entorno]"
    echo ""
    echo "Parámetros:"
    echo "  servidor    - IP o hostname del servidor Ubuntu"
    echo "  rama        - Rama a desplegar (default: main)"
    echo "  entorno     - Entorno a desplegar: dev|prod (default: prod)"
    echo ""
    echo "Ejemplos:"
    echo "  $0 192.168.1.100              # Desplegar main en producción"
    echo "  $0 192.168.1.100 develop dev  # Desplegar develop en desarrollo"
    echo "  $0 myserver.com main prod     # Desplegar main en producción"
    echo ""
    echo "Requisitos:"
    echo "  - Acceso SSH al servidor"
    echo "  - Clave SSH configurada"
    echo "  - Usuario con privilegios sudo en el servidor"
    echo "  - Script ubuntu-server-setup.sh ejecutado previamente"
}

# Función para verificar conectividad SSH
check_ssh_connection() {
    log "Verificando conectividad SSH con $SERVER_HOST..."

    if ! ssh -o ConnectTimeout=10 -o BatchMode=yes $SERVER_HOST "echo 'SSH connection successful'" 2>/dev/null; then
        error "No se puede conectar al servidor $SERVER_HOST via SSH"
    fi

    log "Conexión SSH establecida correctamente."
}

# Función para verificar que el script de Ubuntu esté disponible
check_ubuntu_script() {
    log "Verificando script de configuración en el servidor..."

    if ! ssh $SERVER_HOST "test -f /opt/enerlova/scripts/ubuntu-server-setup.sh"; then
        warn "Script ubuntu-server-setup.sh no encontrado en el servidor."
        info "Ejecutando instalación inicial..."
        install_initial_setup
    else
        log "Script de configuración encontrado."
    fi
}

# Función para instalar configuración inicial
install_initial_setup() {
    log "Instalando configuración inicial en el servidor..."

    # Crear directorio temporal
    ssh $SERVER_HOST "sudo mkdir -p /opt/enerlova"
    ssh $SERVER_HOST "sudo chown $USER:$USER /opt/enerlova"

    # Copiar archivos del proyecto
    log "Copiando archivos del proyecto..."
    rsync -avz --exclude 'node_modules' --exclude '.git' --exclude 'dist' --exclude 'build' \
        ./ $SERVER_HOST:/opt/enerlova/

    # Ejecutar script de instalación
    ssh $SERVER_HOST "cd /opt/enerlova && chmod +x scripts/ubuntu-server-setup.sh && ./scripts/ubuntu-server-setup.sh install"

    log "Instalación inicial completada."
}

# Función para desplegar el proyecto
deploy_project() {
    log "Iniciando despliegue en $SERVER_HOST..."

    # Verificar que el directorio del proyecto existe
    if ! ssh $SERVER_HOST "test -d /opt/enerlova"; then
        error "Directorio /opt/enerlova no existe en el servidor. Ejecute la instalación inicial primero."
    fi

    # Hacer backup del proyecto actual
    log "Creando backup del proyecto actual..."
    ssh $SERVER_HOST "cd /opt/enerlova && tar -czf ../backups/enerlova-backup-$(date +%Y%m%d-%H%M%S).tar.gz . 2>/dev/null || true"

    # Detener contenedores actuales
    log "Deteniendo contenedores actuales..."
    ssh $SERVER_HOST "cd /opt/enerlova && ./scripts/ubuntu-server-setup.sh stop 2>/dev/null || true"

    # Copiar archivos del proyecto (excluyendo node_modules y otros archivos innecesarios)
    log "Copiando archivos del proyecto..."
    rsync -avz --delete \
        --exclude 'node_modules' \
        --exclude '.git' \
        --exclude 'dist' \
        --exclude 'build' \
        --exclude 'logs' \
        --exclude 'backups' \
        ./ $SERVER_HOST:/opt/enerlova/

    # Configurar variables de entorno según el entorno
    configure_environment

    # Iniciar el entorno correspondiente
    log "Iniciando entorno $ENVIRONMENT..."
    ssh $SERVER_HOST "cd /opt/enerlova && ./scripts/ubuntu-server-setup.sh $ENVIRONMENT"

    # Verificar estado
    log "Verificando estado del despliegue..."
    ssh $SERVER_HOST "cd /opt/enerlova && ./scripts/ubuntu-server-setup.sh status"

    log "Despliegue completado exitosamente."
}

# Función para configurar variables de entorno
configure_environment() {
    log "Configurando variables de entorno para $ENVIRONMENT..."

    if [ "$ENVIRONMENT" = "dev" ]; then
        # Configuración para desarrollo
        ssh $SERVER_HOST "cd /opt/enerlova && echo 'NODE_ENV=development' > .env"
        ssh $SERVER_HOST "cd /opt/enerlova && echo 'VITE_API_URL=https://enerlovauat.mmlovalledor.cl/Enerlova' >> .env"
    else
        # Configuración para producción
        ssh $SERVER_HOST "cd /opt/enerlova && echo 'NODE_ENV=production' > .env"
        ssh $SERVER_HOST "cd /opt/enerlova && echo 'VITE_API_URL=https://enerlovauat.mmlovalledor.cl/Enerlova' >> .env"
    fi

    log "Variables de entorno configuradas."
}

# Función para mostrar información del despliegue
show_deployment_info() {
    echo ""
    echo -e "${CYAN}=== INFORMACIÓN DEL DESPLIEGUE ===${NC}"
    echo "Servidor: $SERVER_HOST"
    echo "Rama: $BRANCH"
    echo "Entorno: $ENVIRONMENT"
    echo "Fecha: $(date)"
    echo ""

    if [ "$ENVIRONMENT" = "dev" ]; then
        echo -e "${GREEN}URLs de acceso:${NC}"
        echo "  Desarrollo (Hot Reload): http://$SERVER_HOST:4200"
        echo "  Desarrollo (Nginx): http://$SERVER_HOST:3001"
    else
        echo -e "${GREEN}URL de acceso:${NC}"
        echo "  Producción: http://$SERVER_HOST:8080"
    fi

    echo ""
    echo -e "${YELLOW}Comandos útiles:${NC}"
    echo "  Ver logs: ssh $SERVER_HOST 'cd /opt/enerlova && ./scripts/ubuntu-server-setup.sh logs'"
    echo "  Ver estado: ssh $SERVER_HOST 'cd /opt/enerlova && ./scripts/ubuntu-server-setup.sh status'"
    echo "  Detener: ssh $SERVER_HOST 'cd /opt/enerlova && ./scripts/ubuntu-server-setup.sh stop'"
    echo ""
}

# Función principal
main() {
    # Verificar parámetros
    if [ -z "$SERVER_HOST" ]; then
        error "Debe especificar un servidor"
        show_help
    fi

    if [ "$ENVIRONMENT" != "dev" ] && [ "$ENVIRONMENT" != "prod" ]; then
        error "Entorno debe ser 'dev' o 'prod'"
        show_help
    fi

    # Mostrar información del despliegue
    log "Iniciando despliegue de Enerlova Frontend"
    echo ""
    echo -e "${CYAN}Configuración:${NC}"
    echo "  Servidor: $SERVER_HOST"
    echo "  Rama: $BRANCH"
    echo "  Entorno: $ENVIRONMENT"
    echo ""

    # Verificar conectividad
    check_ssh_connection

    # Verificar script de Ubuntu
    check_ubuntu_script

    # Realizar despliegue
    deploy_project

    # Mostrar información final
    show_deployment_info

    log "Despliegue completado exitosamente en $SERVER_HOST"
}

# Procesar argumentos
case "$1" in
    "help"|"-h"|"--help"|"")
        show_help
        ;;
    *)
        main
        ;;
esac
