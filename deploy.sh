#!/bin/bash

set -euo pipefail

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
    echo "             🟠 Desarrollo: :4200 (colores naranjas, badge DEV)"
    echo "  prod     - Despliega solo entorno de producción (puerto 8080)"
    echo "  dev      - Despliega solo entorno de desarrollo (puerto 4200)"
    echo "  stop     - Detiene todos los contenedores"
    echo "  clean    - Limpia contenedores e imágenes"
    echo "  status   - Muestra estado de los contenedores"
    echo ""
    echo "Ejemplos:"
    echo "  $0 both    # Despliega ambos entornos para comparar"
    echo "  $0 prod    # Despliega solo producción"
    echo "  $0 dev     # Despliega solo desarrollo"
}

COMPOSE_BIN=""

# Detectar comando compose (docker compose vs docker-compose)
detect_compose() {
    if command -v docker &>/dev/null && docker compose version &>/dev/null; then
        COMPOSE_BIN="docker compose"
    elif command -v docker-compose &>/dev/null; then
        COMPOSE_BIN="docker-compose"
    else
        echo "❌ No se encontró Docker Compose (ni plugin ni binario)." >&2
        exit 1
    fi
}

# Función para desplegar producción (proyecto aislado: enerlova_prod)
run_compose_build() {
    local project="$1";
    local file="$2";
    echo "🔧 Construyendo y levantando (${file}) para proyecto: ${project}";
    if ! $COMPOSE_BIN -p "$project" -f "$file" up --build -d; then
        echo "❌ Falló la construcción o arranque para '$project' usando '$file'." >&2
        echo "💡 Posibles causas: falta de espacio en disco, permisos, red." >&2
        echo "🛠️  Acciones sugeridas:" >&2
        echo "   - docker system df" >&2
        echo "   - docker system prune -af --volumes" >&2
        echo "   - Eliminar imágenes antiguas: docker images | grep enerlova" >&2
        echo "   - Reintentar con: $COMPOSE_BIN -p $project -f $file build --no-cache" >&2
        exit 1
    fi
}

deploy_prod() {
    echo "📦 Desplegando entorno de PRODUCCIÓN..."
    echo "🌐 Puerto: 8080"
    echo "🔗 API: http://192.168.1.197:8081/Enerlova"
    PROJECT=enerlova_prod
    run_compose_build "$PROJECT" docker-compose.prod.yml
    echo "✅ Entorno de producción desplegado / actualizado"
    echo "🌍 Acceso: http://localhost:8080"
}

# Función para desplegar desarrollo (proyecto aislado: enerlova_dev)
deploy_dev() {
    echo "🛠️  Desplegando entorno de DESARROLLO / UAT..."
    echo "🌐 Puerto: 4200"
    echo "🔗 API: http://192.168.1.197:8082/Enerlova"
    echo "🎨 Tema: Colores naranjas con badge DEV"
    PROJECT=enerlova_dev
    run_compose_build "$PROJECT" docker-compose.dev.yml
    echo "✅ Entorno de desarrollo desplegado / actualizado"
    echo "🌍 Acceso: http://localhost:4200"
}

# Función para desplegar ambos entornos
deploy_both() {
    echo "🚀 Desplegando AMBOS entornos de forma independiente..."
    echo "(Usando proyectos separados: enerlova_prod y enerlova_dev)"
    echo ""
    deploy_prod
    deploy_dev
    echo ""
    echo "✅ Ambos entornos activos"
    echo "🔵 PRODUCCIÓN: http://localhost:8080"
    echo "🟠 DESARROLLO: http://localhost:4200"
    echo ""
    echo "Si deseas ver logs:"
    echo "  $COMPOSE_BIN -p enerlova_prod logs -f"
    echo "  $COMPOSE_BIN -p enerlova_dev logs -f"
}

# Función para detener servicios
stop_services() {
    echo "🛑 Deteniendo servicios (prod + dev)..."
    $COMPOSE_BIN -p enerlova_prod down 2>/dev/null || true
    $COMPOSE_BIN -p enerlova_dev down 2>/dev/null || true
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
    echo "📊 Estado de los servicios (filtrado):"
    docker ps --format 'table {{.Names}}\t{{.Status}}\t{{.Ports}}' | grep -E 'enerlova-frontend-(dev|prod)' || echo "No hay contenedores en ejecución"
    echo ""
    echo "🔵 Producción (project: enerlova_prod):"
    $COMPOSE_BIN -p enerlova_prod ps 2>/dev/null || echo "(no activo)"
    echo ""
    echo "🟠 Desarrollo (project: enerlova_dev):"
    $COMPOSE_BIN -p enerlova_dev ps 2>/dev/null || echo "(no activo)"
}

# Validar que Docker esté disponible y detectar compose
if ! command -v docker &> /dev/null; then
    echo "❌ Error: Docker no está instalado o no está en el PATH"
    exit 1
fi

detect_compose
echo "ℹ️ Usando: $COMPOSE_BIN"

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
