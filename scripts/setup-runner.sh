#!/bin/bash

# 🚀 Script para configurar y solucionar GitHub Actions Runner
# Uso: ./scripts/setup-runner.sh [install|restart|status|logs]

set -e

RUNNER_DIR="./actions-runner"
REPO_URL="https://github.com/lo-valledor/Frontend_Fi_Enerlova_2025"

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Función para imprimir con colores
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Función para verificar si Docker está instalado
check_docker() {
    if ! command -v docker &> /dev/null; then
        print_error "Docker no está instalado. Por favor instala Docker primero."
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        print_error "Docker Compose no está instalado. Por favor instala Docker Compose primero."
        exit 1
    fi
    
    print_success "Docker y Docker Compose están instalados"
}

# Función para verificar el estado del runner
check_runner_status() {
    if [ -d "$RUNNER_DIR" ]; then
        print_status "Verificando estado del runner..."
        
        if [ -f "$RUNNER_DIR/.service" ]; then
            print_status "Runner instalado como servicio"
            sudo systemctl status actions.runner.* 2>/dev/null || print_warning "No se pudo verificar el estado del servicio"
        else
            print_status "Runner instalado manualmente"
        fi
        
        if [ -f "$RUNNER_DIR/.runner" ]; then
            print_success "Runner configurado"
        else
            print_warning "Runner no configurado"
        fi
    else
        print_warning "Directorio del runner no encontrado"
    fi
}

# Función para instalar el runner
install_runner() {
    print_status "Instalando GitHub Actions Runner..."
    
    # Crear directorio si no existe
    mkdir -p "$RUNNER_DIR"
    cd "$RUNNER_DIR"
    
    # Descargar runner
    print_status "Descargando runner..."
    curl -o actions-runner-linux-x64-2.311.0.tar.gz -L https://github.com/actions/runner/releases/download/v2.311.0/actions-runner-linux-x64-2.311.0.tar.gz
    
    # Extraer
    print_status "Extrayendo runner..."
    tar xzf ./actions-runner-linux-x64-2.311.0.tar.gz
    
    # Limpiar archivo descargado
    rm actions-runner-linux-x64-2.311.0.tar.gz
    
    print_success "Runner descargado y extraído"
    print_warning "Ahora necesitas configurar el runner con un token desde GitHub"
    print_status "Ve a: Settings > Actions > Runners > New self-hosted runner"
    print_status "Copia el token y ejecuta: ./config.sh --url $REPO_URL --token [TOKEN]"
}

# Función para reiniciar el runner
restart_runner() {
    print_status "Reiniciando GitHub Actions Runner..."
    
    if [ -d "$RUNNER_DIR" ]; then
        cd "$RUNNER_DIR"
        
        if [ -f ".service" ]; then
            print_status "Reiniciando servicio..."
            sudo ./svc.sh stop
            sleep 2
            sudo ./svc.sh start
            print_success "Servicio reiniciado"
        else
            print_status "Deteniendo proceso manual..."
            pkill -f "run.sh" || true
            sleep 2
            print_status "Iniciando runner manualmente..."
            nohup ./run.sh > runner.log 2>&1 &
            print_success "Runner iniciado manualmente"
        fi
    else
        print_error "Directorio del runner no encontrado"
        exit 1
    fi
}

# Función para mostrar logs
show_logs() {
    print_status "Mostrando logs del runner..."
    
    if [ -d "$RUNNER_DIR" ]; then
        cd "$RUNNER_DIR"
        
        if [ -f "runner.log" ]; then
            echo "=== Últimas 50 líneas del log ==="
            tail -50 runner.log
        else
            print_warning "Archivo de log no encontrado"
        fi
        
        if [ -f ".service" ]; then
            echo "=== Logs del servicio ==="
            sudo journalctl -u actions.runner.* -n 20 --no-pager
        fi
    else
        print_error "Directorio del runner no encontrado"
    fi
}

# Función para verificar el despliegue
check_deployment() {
    print_status "Verificando despliegue..."
    
    # Verificar si Docker está corriendo
    if ! docker info > /dev/null 2>&1; then
        print_error "Docker no está corriendo"
        return 1
    fi
    
    # Verificar contenedores
    print_status "Contenedores activos:"
    docker ps
    
    # Verificar puerto 8080
    print_status "Verificando puerto 8080..."
    if netstat -tlnp | grep :8080 > /dev/null 2>&1; then
        print_success "Puerto 8080 está en uso"
        
        # Test de conectividad
        if curl -f http://localhost:8080 > /dev/null 2>&1; then
            print_success "✅ Aplicación respondiendo en http://localhost:8080"
        else
            print_warning "⚠️ Puerto 8080 abierto pero aplicación no responde"
        fi
    else
        print_warning "Puerto 8080 no está en uso"
    fi
}

# Función principal
main() {
    case "${1:-help}" in
        "install")
            check_docker
            install_runner
            ;;
        "restart")
            restart_runner
            ;;
        "status")
            check_runner_status
            ;;
        "logs")
            show_logs
            ;;
        "deploy")
            check_deployment
            ;;
        "help"|*)
            echo "🚀 GitHub Actions Runner Setup Script"
            echo ""
            echo "Uso: $0 [comando]"
            echo ""
            echo "Comandos disponibles:"
            echo "  install   - Instalar el runner"
            echo "  restart   - Reiniciar el runner"
            echo "  status    - Verificar estado del runner"
            echo "  logs      - Mostrar logs del runner"
            echo "  deploy    - Verificar despliegue"
            echo "  help      - Mostrar esta ayuda"
            echo ""
            echo "Ejemplos:"
            echo "  $0 install    # Instalar runner"
            echo "  $0 restart    # Reiniciar runner"
            echo "  $0 status     # Verificar estado"
            ;;
    esac
}

# Ejecutar función principal
main "$@" 