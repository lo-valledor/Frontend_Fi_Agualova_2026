#!/bin/bash
# Script para actualización segura de dependencias
# Uso: ./scripts/update-deps.sh

set -e

echo "🔐 ENERLOVA - Actualización Segura de Dependencias"
echo "=================================================="
echo ""

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Función para mostrar estado
show_status() {
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ $1${NC}"
    else
        echo -e "${RED}❌ $1${NC}"
        exit 1
    fi
}

# 1. Verificar vulnerabilidades actuales
echo "🔍 Verificando vulnerabilidades actuales..."
pnpm audit || echo -e "${YELLOW}⚠️  Vulnerabilidades encontradas${NC}"
echo ""

# 2. Actualizar dependencias (minor y patch)
echo "📦 Actualizando dependencias..."
pnpm update
show_status "Dependencias actualizadas"
echo ""

# 3. Ejecutar tests
echo "🧪 Ejecutando tests..."
pnpm run test:run
show_status "Tests pasaron"
echo ""

# 4. Ejecutar linting
echo "🧹 Ejecutando linting..."
pnpm run lint
show_status "Linting pasó"
echo ""

# 5. Type checking
echo "📝 Verificando tipos..."
pnpm run typecheck
show_status "Type checking pasó"
echo ""

# 6. Build del proyecto
echo "🏗️  Construyendo proyecto..."
pnpm run build
show_status "Build exitoso"
echo ""

# 7. Verificar vulnerabilidades post-update
echo "🔍 Verificando vulnerabilidades post-actualización..."
pnpm audit
show_status "Auditoría de seguridad completada"
echo ""

echo -e "${GREEN}=================================================="
echo "✅ DEPENDENCIAS ACTUALIZADAS CORRECTAMENTE"
echo "==================================================${NC}"
echo ""
echo "Próximos pasos:"
echo "  1. Revisar cambios: git diff pnpm-lock.yaml"
echo "  2. Crear commit: git commit -am 'chore(deps): update dependencies'"
echo "  3. Crear PR para revisión"
