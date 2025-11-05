#!/bin/bash

# deploy.sh - Script para automatizar despliegues
# Usa docker-compose.multi.yml para levantar ambos entornos simultáneamente

echo "🚀 Script de despliegue automático - Enerlova Frontend"

# Función para mostrar ayuda
show_help() {
    echo "Uso: $0 [ENTORNO]"
    echo ""
    echo "ENTORNOS disponibles:"
    echo "  both     - Despliega ambos entornos simultáneamente (RECOMENDADO)"
    echo "             🔵 Producción: :8080 (colores azules, sin badge)"
    echo "             🟠 Desarrollo: :3000 (colores naranjas, badge DEV)"
    echo "  prod     - Despliega solo entorno de producción (puerto 8080)"
    echo "  dev      - Despliega solo entorno de desarrollo (puerto 3000)"
    echo "  stop     - Detiene todos los contenedores"
    echo "  clean    - Limpia contenedores e imágenes"
    echo "  status   - Muestra estado de los contenedores"
    echo ""
    echo "Ejemplos:"
    echo "  $0 both    # Despliega ambos entornos para comparar"
    echo "  $0 prod    # Despliega solo producción"
    echo "  $0 dev     # Despliega solo desarrollo"
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
    echo "🎨 Tema: Colores naranjas con badge DEV"

    docker-compose -f docker-compose.dev.yml down
    docker-compose -f docker-compose.dev.yml up --build -d

    echo "✅ Entorno de desarrollo desplegado exitosamente"
    echo "🌍 Acceso: http://localhost:3000"
}

# Función para desplegar ambos entornos
deploy_both() {
    echo "🚀 Desplegando AMBOS entornos simultáneamente..."
    echo ""
    echo "🔵 PRODUCCIÓN:"
    echo "   Puerto: 8080"
    echo "   API: http://192.168.1.139:8081/Enerlova"
    echo "   Tema: Colores azules, sin badge"
    echo ""
    echo "🟠 DESARROLLO:"
    echo "   Puerto: 3000"
    echo "   API: http://192.168.1.139:8082/Enerlova"
    echo "   Tema: Colores naranjas con badge DEV"
    echo ""

    docker-compose -f docker-compose.multi.yml down
    docker-compose -f docker-compose.multi.yml up --build -d

    echo ""
    echo "✅ Ambos entornos desplegados exitosamente"
    echo ""
    echo "🔵 PRODUCCIÓN: http://localhost:8080"
    echo "🟠 DESARROLLO: http://localhost:3000"
    echo ""
    echo "Ambos entornos están en la misma red: enerlova-network"
}

# Función para detener servicios
stop_services() {
    echo "🛑 Deteniendo todos los servicios..."
    docker-compose -f docker-compose.multi.yml down 2>/dev/null
    docker-compose -f docker-compose.prod.yml down 2>/dev/null
    docker-compose -f docker-compose.dev.yml down 2>/dev/null
    docker-compose down 2>/dev/null
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
    echo "Contenedores activos:"
    docker ps --filter "name=enerlova-frontend" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
    echo ""
    echo "Detalle completo:"
    docker-compose -f docker-compose.multi.yml ps 2>/dev/null || echo "No hay servicios en docker-compose.multi.yml"
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
    "both")
        deploy_both
        ;;
    "prod")
        deploy_prod
        ;;
    "dev")
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
