#!/bin/bash

# Script de configuración y gestión para Ubuntu Server - Enerlova Frontend
# Uso: ./scripts/ubuntu-server-setup.sh [install|dev|prod|stop|status|logs|cleanup|update]

set -e

ACTION=${1:-help}
ENVIRONMENT=${2:-}

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Configuración del servidor
SERVER_IP=$(hostname -I | awk '{print $1}')
DOCKER_COMPOSE_VERSION="v2.24.5"
NODE_VERSION="22"

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

# Función para verificar si se ejecuta como root
check_root() {
    if [[ $EUID -eq 0 ]]; then
        error "Este script no debe ejecutarse como root. Use un usuario con privilegios sudo."
    fi
}

# Función para verificar si el usuario está en el grupo docker
check_docker_group() {
    if ! groups $USER | grep -q docker; then
        warn "El usuario $USER no está en el grupo docker."
        info "Ejecutando: sudo usermod -aG docker $USER"
        sudo usermod -aG docker $USER
        log "Usuario agregado al grupo docker. Por favor, cierre sesión y vuelva a iniciar sesión."
        exit 0
    fi
}

# Función para instalar dependencias del sistema
install_system_dependencies() {
    log "Instalando dependencias del sistema..."

    # Actualizar repositorios
    sudo apt update

    # Instalar paquetes necesarios
    sudo apt install -y \
        curl \
        wget \
        git \
        unzip \
        software-properties-common \
        apt-transport-https \
        ca-certificates \
        gnupg \
        lsb-release \
        htop \
        tree \
        jq \
        build-essential

    log "Dependencias del sistema instaladas correctamente."
}

# Función para instalar Docker
install_docker() {
    log "Instalando Docker..."

    # Verificar si Docker ya está instalado
    if command -v docker &> /dev/null; then
        warn "Docker ya está instalado."
        return
    fi

    # Agregar repositorio oficial de Docker
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg

    echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

    # Actualizar e instalar Docker
    sudo apt update
    sudo apt install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

    # Iniciar y habilitar Docker
    sudo systemctl start docker
    sudo systemctl enable docker

    # Agregar usuario al grupo docker
    sudo usermod -aG docker $USER

    log "Docker instalado correctamente."
    warn "Por favor, cierre sesión y vuelva a iniciar sesión para que los cambios del grupo docker surtan efecto."
}

# Función para instalar Docker Compose
install_docker_compose() {
    log "Instalando Docker Compose..."

    # Verificar si Docker Compose ya está instalado
    if command -v docker-compose &> /dev/null; then
        warn "Docker Compose ya está instalado."
        return
    fi

    # Descargar e instalar Docker Compose
    sudo curl -L "https://github.com/docker/compose/releases/download/${DOCKER_COMPOSE_VERSION}/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose

    # Crear enlace simbólico
    sudo ln -sf /usr/local/bin/docker-compose /usr/bin/docker-compose

    log "Docker Compose instalado correctamente."
}

# Función para instalar Node.js (opcional, para desarrollo local)
install_nodejs() {
    log "Instalando Node.js..."

    # Verificar si Node.js ya está instalado
    if command -v node &> /dev/null; then
        warn "Node.js ya está instalado."
        return
    fi

    # Instalar Node.js usando NodeSource
    curl -fsSL https://deb.nodesource.com/setup_${NODE_VERSION}.x | sudo -E bash -
    sudo apt install -y nodejs

    # Instalar pnpm globalmente
    sudo npm install -g pnpm

    log "Node.js y pnpm instalados correctamente."
}

# Función para configurar firewall
configure_firewall() {
    log "Configurando firewall..."

    # Verificar si ufw está instalado
    if ! command -v ufw &> /dev/null; then
        sudo apt install -y ufw
    fi

    # Configurar reglas básicas
    sudo ufw --force enable
    sudo ufw default deny incoming
    sudo ufw default allow outgoing
    sudo ufw allow ssh
    sudo ufw allow 22/tcp
    sudo ufw allow 80/tcp
    sudo ufw allow 443/tcp
    sudo ufw allow 4200/tcp  # Puerto de desarrollo
    sudo ufw allow 3001/tcp  # Puerto alternativo de desarrollo
    sudo ufw allow 8080/tcp  # Puerto de producción

    log "Firewall configurado correctamente."
}

# Función para crear directorio del proyecto
setup_project_directory() {
    log "Configurando directorio del proyecto..."

    # Crear directorio si no existe
    if [ ! -d "/opt/enerlova" ]; then
        sudo mkdir -p /opt/enerlova
        sudo chown $USER:$USER /opt/enerlova
    fi

    # Crear directorio de logs
    mkdir -p /opt/enerlova/logs

    # Crear directorio de backups
    mkdir -p /opt/enerlova/backups

    log "Directorio del proyecto configurado en /opt/enerlova"
}

# Función para crear script de servicio systemd
create_systemd_service() {
    log "Creando servicio systemd..."

    sudo tee /etc/systemd/system/enerlova-frontend.service > /dev/null <<EOF
[Unit]
Description=Enerlova Frontend Service
After=docker.service
Requires=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=/opt/enerlova
ExecStart=/usr/bin/docker-compose -f /opt/enerlova/docker-compose.yml up -d
ExecStop=/usr/bin/docker-compose -f /opt/enerlova/docker-compose.yml down
TimeoutStartSec=0

[Install]
WantedBy=multi-user.target
EOF

    sudo systemctl daemon-reload
    sudo systemctl enable enerlova-frontend.service

    log "Servicio systemd creado y habilitado."
}

# Función para verificar si Docker está ejecutándose
check_docker() {
    if ! docker info > /dev/null 2>&1; then
        error "Docker no está ejecutándose. Por favor, inicie Docker primero."
    fi
}

# Función para detener todos los contenedores
stop_all() {
    log "Deteniendo todos los contenedores..."

    if [ -f "/opt/enerlova/docker-compose.yml" ]; then
        docker-compose -f /opt/enerlova/docker-compose.yml down 2>/dev/null || true
    fi

    if [ -f "/opt/enerlova/docker-compose.dev.yml" ]; then
        docker-compose -f /opt/enerlova/docker-compose.dev.yml down 2>/dev/null || true
    fi

    log "Todos los contenedores han sido detenidos."
}

# Función para iniciar entorno de desarrollo
start_dev() {
    log "Iniciando entorno de desarrollo..."

    cd /opt/enerlova

    if [ "$ENVIRONMENT" = "nginx" ]; then
        log "Usando perfil nginx para desarrollo..."
        docker-compose -f docker-compose.dev.yml --profile nginx-dev up -d
        log "Entorno de desarrollo con nginx iniciado en http://$SERVER_IP:3001"
    else
        log "Usando servidor de desarrollo con hot reload..."
        docker-compose -f docker-compose.dev.yml up -d
        log "Entorno de desarrollo iniciado en http://$SERVER_IP:4200"
        log "Hot reload habilitado - los cambios se reflejarán automáticamente"
    fi
}

# Función para iniciar entorno de producción
start_prod() {
    log "Iniciando entorno de producción..."

    cd /opt/enerlova
    docker-compose up -d
    log "Entorno de producción iniciado en http://$SERVER_IP:8080"
}

# Función para mostrar logs
show_logs() {
    cd /opt/enerlova

    if [ "$ENVIRONMENT" = "dev" ]; then
        docker-compose -f docker-compose.dev.yml logs -f
    else
        docker-compose logs -f
    fi
}

# Función para mostrar estado
show_status() {
    log "Estado del sistema:"
    echo ""

    # Información del sistema
    echo -e "${CYAN}=== INFORMACIÓN DEL SISTEMA ===${NC}"
    echo "Servidor: $(hostname)"
    echo "IP: $SERVER_IP"
    echo "Usuario: $USER"
    echo "Fecha: $(date)"
    echo ""

    # Estado de Docker
    echo -e "${CYAN}=== ESTADO DE DOCKER ===${NC}"
    if docker info > /dev/null 2>&1; then
        echo "Docker: ✅ Ejecutándose"
        echo "Contenedores activos: $(docker ps -q | wc -l)"
    else
        echo "Docker: ❌ No ejecutándose"
    fi
    echo ""

    # Estado de los contenedores
    echo -e "${CYAN}=== ESTADO DE CONTENEDORES ===${NC}"
    cd /opt/enerlova

    if [ -f "docker-compose.yml" ]; then
        echo "Producción:"
        docker-compose ps 2>/dev/null || echo "  No hay contenedores de producción ejecutándose"
    fi

    if [ -f "docker-compose.dev.yml" ]; then
        echo "Desarrollo:"
        docker-compose -f docker-compose.dev.yml ps 2>/dev/null || echo "  No hay contenedores de desarrollo ejecutándose"
    fi
    echo ""

    # Puertos en uso
    echo -e "${CYAN}=== PUERTOS EN USO ===${NC}"
    echo "Puerto 4200 (Desarrollo): $(netstat -tlnp 2>/dev/null | grep :4200 || echo 'No en uso')"
    echo "Puerto 3001 (Desarrollo Nginx): $(netstat -tlnp 2>/dev/null | grep :3001 || echo 'No en uso')"
    echo "Puerto 8080 (Producción): $(netstat -tlnp 2>/dev/null | grep :8080 || echo 'No en uso')"
    echo ""

    # Uso de recursos
    echo -e "${CYAN}=== USO DE RECURSOS ===${NC}"
    echo "CPU: $(top -bn1 | grep "Cpu(s)" | awk '{print $2}' | cut -d'%' -f1)%"
    echo "Memoria: $(free -m | awk 'NR==2{printf "%.1f%%", $3*100/$2}')"
    echo "Disco: $(df -h / | awk 'NR==2{print $5}')"
}

# Función para limpiar
cleanup() {
    log "Limpiando contenedores e imágenes no utilizadas..."
    docker system prune -f
    docker volume prune -f
    log "Limpieza completada."
}

# Función para actualizar el proyecto
update_project() {
    log "Actualizando el proyecto..."

    cd /opt/enerlova

    # Hacer backup antes de actualizar
    if [ -d ".git" ]; then
        log "Creando backup del proyecto..."
        tar -czf "../backups/enerlova-backup-$(date +%Y%m%d-%H%M%S).tar.gz" .
    fi

    # Actualizar desde git
    if [ -d ".git" ]; then
        git pull origin main
        log "Proyecto actualizado desde git."
    else
        warn "No se encontró repositorio git. Actualización manual requerida."
    fi

    # Reconstruir contenedores
    log "Reconstruyendo contenedores..."
    docker-compose down
    docker-compose build --no-cache
    docker-compose up -d

    log "Actualización completada."
}

# Función para mostrar ayuda
show_help() {
    echo -e "${BLUE}Script de gestión para Ubuntu Server - Enerlova Frontend${NC}"
    echo ""
    echo "Uso: $0 [comando] [opción]"
    echo ""
    echo "Comandos de instalación:"
    echo "  install         - Instalar todas las dependencias del sistema"
    echo "  setup           - Configurar directorio y servicios del proyecto"
    echo ""
    echo "Comandos de gestión:"
    echo "  dev [nginx]     - Inicia entorno de desarrollo"
    echo "                   Opción 'nginx': usa nginx en lugar del servidor de desarrollo"
    echo "  prod            - Inicia entorno de producción"
    echo "  stop            - Detiene todos los contenedores"
    echo "  logs [dev|prod] - Muestra logs del entorno especificado"
    echo "  status          - Muestra estado completo del sistema"
    echo "  cleanup         - Limpia contenedores e imágenes no utilizadas"
    echo "  update          - Actualiza el proyecto desde git"
    echo "  help            - Muestra esta ayuda"
    echo ""
    echo "Ejemplos:"
    echo "  $0 install      - Instalar dependencias del sistema"
    echo "  $0 setup        - Configurar proyecto"
    echo "  $0 dev          - Inicia desarrollo con hot reload"
    echo "  $0 dev nginx    - Inicia desarrollo con nginx"
    echo "  $0 prod         - Inicia producción"
    echo "  $0 stop         - Detiene todos los entornos"
    echo "  $0 status       - Ver estado completo del sistema"
    echo ""
    echo "Nota: Después de la instalación, cierre sesión y vuelva a iniciar sesión."
}

# Función principal de instalación
install_all() {
    log "Iniciando instalación completa para Ubuntu Server..."

    check_root
    install_system_dependencies
    install_docker
    install_docker_compose
    install_nodejs
    configure_firewall
    setup_project_directory

    log "Instalación completada."
    echo ""
    echo -e "${GREEN}✅ Instalación exitosa!${NC}"
    echo ""
    echo -e "${YELLOW}⚠️  IMPORTANTE:${NC}"
    echo "1. Cierre sesión y vuelva a iniciar sesión para que los cambios del grupo docker surtan efecto"
    echo "2. Ejecute: $0 setup"
    echo "3. Clone el proyecto en /opt/enerlova"
    echo "4. Configure las variables de entorno"
    echo ""
    echo -e "${CYAN}Próximos pasos:${NC}"
    echo "  $0 setup        - Configurar proyecto"
    echo "  $0 dev          - Iniciar desarrollo"
    echo "  $0 prod         - Iniciar producción"
}

# Función de configuración del proyecto
setup_project() {
    log "Configurando proyecto..."

    create_systemd_service

    log "Configuración completada."
    echo ""
    echo -e "${GREEN}✅ Configuración exitosa!${NC}"
    echo ""
    echo -e "${CYAN}Próximos pasos:${NC}"
    echo "1. Clone el proyecto en /opt/enerlova"
    echo "2. Configure las variables de entorno"
    echo "3. Ejecute: $0 dev o $0 prod"
}

# Verificar Docker para comandos que lo requieren
if [[ "$ACTION" =~ ^(dev|prod|stop|logs|status|cleanup|update)$ ]]; then
    check_docker
    check_docker_group
fi

# Procesar comandos
case $ACTION in
    "install")
        install_all
        ;;
    "setup")
        setup_project
        ;;
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
    "update")
        update_project
        ;;
    "help"|"-h"|"--help"|"")
        show_help
        ;;
    *)
        error "Comando no válido: $ACTION"
        echo ""
        show_help
        ;;
esac
