#!/bin/bash

###############################################################################
# Script para gestionar entornos de desarrollo y producción
# Uso: ./switch-environment.sh [dev|prod|docker-dev|docker-prod|compare] [--clean]
###############################################################################

set -e

# Colores
COLOR_DEV="\033[0;33m"      # Amarillo para desarrollo
COLOR_PROD="\033[0;34m"     # Azul para producción
COLOR_INFO="\033[0;36m"     # Cyan para info
COLOR_SUCCESS="\033[0;32m"  # Verde para éxito
COLOR_ERROR="\033[0;31m"    # Rojo para error
COLOR_RESET="\033[0m"       # Reset

# Función para mostrar banner
show_banner() {
    local text=$1
    local color=$2
    
    echo ""
    echo -e "${color}╔═════════════════════════════════════════════════════╗${COLOR_RESET}"
    echo -e "${color}║  ${text}${COLOR_RESET}"
    echo -e "${color}╚═════════════════════════════════════════════════════╝${COLOR_RESET}"
    echo ""
}

# Función para limpiar cache
clean_build_cache() {
    echo -e "${COLOR_INFO}🧹 Limpiando cache de build...${COLOR_RESET}"
    
    if [ -d "build" ]; then
        rm -rf build
        echo -e "   ${COLOR_SUCCESS}✓ Eliminado: build/${COLOR_RESET}"
    fi
    
    if [ -d "node_modules/.vite" ]; then
        rm -rf node_modules/.vite
        echo -e "   ${COLOR_SUCCESS}✓ Eliminado: node_modules/.vite/${COLOR_RESET}"
    fi
    
    echo ""
}

# Función para mostrar info del entorno
show_environment_info() {
    local env=$1
    local port=$2
    local color=$3
    local theme=$4
    
    echo -e "${COLOR_INFO}📋 Información del Entorno:${COLOR_RESET}"
    echo -e "   • Entorno:     ${color}${env}${COLOR_RESET}"
    echo -e "   • Tema:        ${color}${theme}${COLOR_RESET}"
    echo -e "   • Puerto:      ${COLOR_INFO}${port}${COLOR_RESET}"
    echo -e "   • URL:         ${COLOR_INFO}http://localhost:${port}${COLOR_RESET}"
    echo ""
}

# Verificar argumentos
if [ $# -eq 0 ]; then
    echo -e "${COLOR_ERROR}Error: Se requiere un argumento${COLOR_RESET}"
    echo ""
    echo "Uso: $0 [dev|prod|docker-dev|docker-prod|compare] [--clean]"
    echo ""
    echo "Ejemplos:"
    echo "  $0 dev              # Desarrollo local"
    echo "  $0 prod             # Producción local"
    echo "  $0 docker-dev       # Desarrollo con Docker"
    echo "  $0 docker-prod      # Producción con Docker"
    echo "  $0 compare          # Comparar ambos entornos"
    echo "  $0 dev --clean      # Con limpieza de cache"
    exit 1
fi

ENVIRONMENT=$1
CLEAN_FLAG=$2

case $ENVIRONMENT in
    dev)
        show_banner "🔧 INICIANDO ENTORNO DE DESARROLLO" $COLOR_DEV
        
        if [ "$CLEAN_FLAG" == "--clean" ]; then
            clean_build_cache
        fi
        
        show_environment_info "DESARROLLO" "5173" $COLOR_DEV "Naranja (Cálido)"
        
        echo -e "${COLOR_DEV}🚀 Iniciando servidor de desarrollo...${COLOR_RESET}"
        echo -e "${COLOR_DEV}   Verás un banner NARANJA en la parte superior${COLOR_RESET}"
        echo ""
        
        export VITE_APP_ENV=development
        pnpm run dev
        ;;
        
    prod)
        show_banner "🏢 INICIANDO ENTORNO DE PRODUCCIÓN (LOCAL)" $COLOR_PROD
        
        if [ "$CLEAN_FLAG" == "--clean" ]; then
            clean_build_cache
        fi
        
        show_environment_info "PRODUCCIÓN" "4200" $COLOR_PROD "Azul (Profesional)"
        
        echo -e "${COLOR_PROD}🔨 Construyendo aplicación...${COLOR_RESET}"
        export VITE_APP_ENV=production
        pnpm run build
        
        echo ""
        echo -e "${COLOR_PROD}🚀 Iniciando servidor de producción...${COLOR_RESET}"
        echo -e "${COLOR_PROD}   NO verás banner, tema AZUL profesional${COLOR_RESET}"
        echo ""
        
        pnpm run start
        ;;
        
    docker-dev)
        show_banner "🐳 INICIANDO DOCKER - DESARROLLO" $COLOR_DEV
        
        if [ "$CLEAN_FLAG" == "--clean" ]; then
            echo -e "${COLOR_INFO}🧹 Limpiando contenedores anteriores...${COLOR_RESET}"
            docker-compose -f docker-compose.dev.yml down -v
        fi
        
        show_environment_info "DESARROLLO (Docker)" "4200" $COLOR_DEV "Naranja (Cálido)"
        
        echo -e "${COLOR_DEV}🐳 Construyendo y levantando contenedor...${COLOR_RESET}"
        echo -e "${COLOR_DEV}   Verás un banner NARANJA en la parte superior${COLOR_RESET}"
        echo ""
        
        if [ "$CLEAN_FLAG" == "--clean" ]; then
            docker-compose -f docker-compose.dev.yml up --build --force-recreate
        else
            docker-compose -f docker-compose.dev.yml up --build
        fi
        ;;
        
    docker-prod)
        show_banner "🐳 INICIANDO DOCKER - PRODUCCIÓN" $COLOR_PROD
        
        if [ "$CLEAN_FLAG" == "--clean" ]; then
            echo -e "${COLOR_INFO}🧹 Limpiando contenedores anteriores...${COLOR_RESET}"
            docker-compose -f docker-compose.prod.yml down -v
        fi
        
        show_environment_info "PRODUCCIÓN (Docker)" "8080" $COLOR_PROD "Azul (Profesional)"
        
        echo -e "${COLOR_PROD}🐳 Construyendo y levantando contenedor...${COLOR_RESET}"
        echo -e "${COLOR_PROD}   NO verás banner, tema AZUL profesional${COLOR_RESET}"
        echo ""
        
        if [ "$CLEAN_FLAG" == "--clean" ]; then
            docker-compose -f docker-compose.prod.yml up --build --force-recreate
        else
            docker-compose -f docker-compose.prod.yml up --build
        fi
        ;;
        
    compare)
        show_banner "🔍 COMPARAR ENTORNOS" $COLOR_INFO
        
        echo -e "${COLOR_INFO}Esta opción inicia ambos entornos simultáneamente para comparación${COLOR_RESET}"
        echo ""
        echo -e "${COLOR_INFO}Se abrirán dos contenedores Docker:${COLOR_RESET}"
        echo -e "   1. ${COLOR_DEV}DESARROLLO →  http://localhost:4200  (Naranja)${COLOR_RESET}"
        echo -e "   2. ${COLOR_PROD}PRODUCCIÓN →  http://localhost:8080  (Azul)${COLOR_RESET}"
        echo ""
        
        read -p "¿Continuar? (s/n): " confirm
        
        if [ "$confirm" == "s" ] || [ "$confirm" == "S" ]; then
            echo ""
            echo -e "${COLOR_INFO}🐳 Levantando ambos entornos...${COLOR_RESET}"
            
            # Levantar en background
            docker-compose -f docker-compose.dev.yml up --build &
            DEV_PID=$!
            
            docker-compose -f docker-compose.prod.yml up --build &
            PROD_PID=$!
            
            echo ""
            echo -e "${COLOR_SUCCESS}✅ Entornos iniciándose en segundo plano${COLOR_RESET}"
            echo ""
            echo -e "${COLOR_INFO}PIDs:${COLOR_RESET}"
            echo -e "   Dev:  $DEV_PID"
            echo -e "   Prod: $PROD_PID"
            echo ""
            echo -e "${COLOR_INFO}Detener:${COLOR_RESET}"
            echo -e "   docker-compose -f docker-compose.dev.yml down"
            echo -e "   docker-compose -f docker-compose.prod.yml down"
            echo ""
            
            # Esperar a que terminen
            wait
        else
            echo -e "${COLOR_ERROR}❌ Operación cancelada${COLOR_RESET}"
        fi
        ;;
        
    *)
        echo -e "${COLOR_ERROR}Error: Entorno no reconocido: $ENVIRONMENT${COLOR_RESET}"
        echo ""
        echo "Opciones válidas: dev, prod, docker-dev, docker-prod, compare"
        exit 1
        ;;
esac

# Footer
echo ""
echo -e "\033[0;37m═══════════════════════════════════════════════════════${COLOR_RESET}"
echo -e "\033[0;37m 🎨 Sistema de Tematización por Entorno v1.0.0${COLOR_RESET}"
echo -e "\033[0;37m═══════════════════════════════════════════════════════${COLOR_RESET}"
echo ""
