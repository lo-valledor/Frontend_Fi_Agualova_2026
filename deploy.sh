#!/bin/bash

# deploy.sh - Script para automatizar despliegues

echo "🚀 Script de despliegue automático - Enerlova Frontend"

# Función para mostrar ayuda
show_help() {
    echo "Uso: $0 [ENTORNO]"
    echo ""
    echo "ENTORNOS disponibles:"
    echo "  prod     - Despliega entorno de producción (puerto 8080)"
    echo "  dev      - Despliega entorno de desarrollo (puerto 3000)"
    echo "  both     - Despliega ambos entornos"
    echo "  stop     - Detiene todos los contenedores"
    echo "  clean    - Limpia contenedores e imágenes"
    echo ""
    echo "Ejemplos:"
    echo "  $0 prod    # Despliega solo producción"
    echo "  $0 dev     # Despliega solo desarrollo"
    echo "  $0 both    # Despliega ambos entornos"
}

# Función para desplegar producción
deploy_prod() {
    echo "📦 Desplegando entorno de PRODUCCIÓN..."
    echo "🌐 Puerto: 8080"
    echo "🔗 API: http://192.168.1.139:8081/Enerlova"

    docker-compose -f docker-compose.prod.yml down
    docker-compose -f docker-compose.prod.yml up --build -d

    echo "✅ Entorno de producción desplegado exitosamente"
    echo "🌍 Acceso: http://localhost:8080"
}

# Función para desplegar desarrollo
deploy_dev() {
    echo "🛠️  Desplegando entorno de DESARROLLO..."
    echo "🌐 Puerto: 3000"
    echo "🔗 API: http://192.168.1.139:8082/Enerlova"

    docker-compose -f docker-compose.develop.yml down
    docker-compose -f docker-compose.develop.yml up --build -d

    echo "✅ Entorno de desarrollo desplegado exitosamente"
    echo "🌍 Acceso: http://localhost:3000"
}

# Función para detener servicios
stop_services() {
    echo "🛑 Deteniendo todos los servicios..."
    docker-compose -f docker-compose.prod.yml down 2>/dev/null
    docker-compose -f docker-compose.develop.yml down 2>/dev/null
    echo "✅ Servicios detenidos"
}

# Función para limpiar
clean_all() {
    echo "🧹 Limpiando contenedores e imágenes..."
    stop_services
    docker system prune -f
    docker image prune -f
    echo "✅ Limpieza completada"
}

# Función para mostrar estado
show_status() {
    echo "📊 Estado de los servicios:"
    echo ""
    echo "🏭 Producción (puerto 8080):"
    docker-compose -f docker-compose.prod.yml ps
    echo ""
    echo "🛠️  Desarrollo (puerto 3000):"
    docker-compose -f docker-compose.develop.yml ps
}

# Validar que Docker esté disponible
if ! command -v docker &> /dev/null; then
    echo "❌ Error: Docker no está instalado o no está en el PATH"
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "❌ Error: Docker Compose no está instalado o no está en el PATH"
    exit 1
fi

# Procesar argumentos
case "${1:-help}" in
    "prod")
        deploy_prod
        ;;
    "dev")
        deploy_dev
        ;;
    "both")
        deploy_prod
        echo ""
        deploy_dev
        ;;
    "stop")
        stop_services
        ;;
    "clean")
        clean_all
        ;;
    "status")
        show_status
        ;;
    "help"|*)
        show_help
        ;;
esac
