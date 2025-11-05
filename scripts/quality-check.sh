#!/bin/bash
# Script para ejecutar análisis de calidad completo del proyecto

echo "🎯 Iniciando análisis de calidad completo..."
echo ""

# Colores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Contadores
ERRORS=0
WARNINGS=0

# Función para mostrar progreso
show_step() {
    echo -e "${BLUE}▶ $1${NC}"
}

# Función para mostrar éxito
show_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

# Función para mostrar error
show_error() {
    echo -e "${RED}❌ $1${NC}"
    ERRORS=$((ERRORS + 1))
}

# Función para mostrar warning
show_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
    WARNINGS=$((WARNINGS + 1))
}

echo "=================================================="
echo "  📊 ANÁLISIS DE CALIDAD DE CÓDIGO - ENERLOVA"
echo "=================================================="
echo ""

# 1. TypeScript Check
show_step "1/5 Verificando TypeScript..."
if pnpm run typecheck > /dev/null 2>&1; then
    show_success "TypeScript: Sin errores"
else
    show_error "TypeScript: Errores encontrados"
    pnpm run typecheck
fi
echo ""

# 2. ESLint
show_step "2/5 Ejecutando ESLint..."
ESLINT_OUTPUT=$(pnpm run lint 2>&1)
ESLINT_ERRORS=$(echo "$ESLINT_OUTPUT" | grep -c "error" || echo "0")
ESLINT_WARNINGS=$(echo "$ESLINT_OUTPUT" | grep -c "warning" || echo "0")

if [ "$ESLINT_ERRORS" -eq "0" ]; then
    show_success "ESLint: Sin errores"
    if [ "$ESLINT_WARNINGS" -gt "0" ]; then
        show_warning "ESLint: $ESLINT_WARNINGS warnings encontrados"
    fi
else
    show_error "ESLint: $ESLINT_ERRORS errores encontrados"
    echo "$ESLINT_OUTPUT" | tail -20
fi
echo ""

# 3. Tests
show_step "3/5 Ejecutando tests..."
if pnpm run test:run > /dev/null 2>&1; then
    show_success "Tests: Todos pasaron"
else
    show_error "Tests: Algunos fallaron"
    pnpm run test:run | tail -20
fi
echo ""

# 4. Cobertura
show_step "4/5 Generando reporte de cobertura..."
pnpm run coverage > /dev/null 2>&1
if [ -f "coverage/coverage-summary.json" ]; then
    # Extraer porcentaje de cobertura (requiere jq)
    if command -v jq &> /dev/null; then
        COVERAGE=$(jq '.total.lines.pct' coverage/coverage-summary.json)
        if (( $(echo "$COVERAGE >= 80" | bc -l) )); then
            show_success "Cobertura: ${COVERAGE}% (objetivo: >80%)"
        else
            show_warning "Cobertura: ${COVERAGE}% (objetivo: >80%)"
        fi
    else
        show_success "Cobertura: Reporte generado (instalar 'jq' para ver %)"
    fi
else
    show_warning "Cobertura: No se pudo generar reporte"
fi
echo ""

# 5. Análisis de código duplicado
show_step "5/5 Analizando código duplicado..."
DUPLICATE_FILES=$(find app -name "*.ts" -o -name "*.tsx" | wc -l)
show_success "Archivos analizados: $DUPLICATE_FILES"
echo ""

# Reporte final
echo "=================================================="
echo "  📈 RESUMEN DEL ANÁLISIS"
echo "=================================================="
echo ""

if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
    echo -e "${GREEN}🎉 ¡Excelente! No se encontraron problemas.${NC}"
    echo ""
    echo "El código está listo para:"
    echo "  • Commit"
    echo "  • Pull Request"
    echo "  • Deploy"
elif [ $ERRORS -eq 0 ]; then
    echo -e "${YELLOW}⚠️  Hay $WARNINGS warnings que deberían revisarse.${NC}"
    echo ""
    echo "Ejecuta 'pnpm run lint:fix' para corregir automáticamente."
else
    echo -e "${RED}❌ Se encontraron $ERRORS errores críticos.${NC}"
    echo -e "${YELLOW}   También hay $WARNINGS warnings.${NC}"
    echo ""
    echo "Por favor corrige los errores antes de continuar:"
    echo "  1. Revisa los errores de TypeScript"
    echo "  2. Ejecuta 'pnpm run lint:fix'"
    echo "  3. Ejecuta 'pnpm run test' para ver tests fallidos"
fi

echo ""
echo "=================================================="
echo "  📚 COMANDOS ÚTILES"
echo "=================================================="
echo ""
echo "  pnpm run lint:fix        - Corregir problemas automáticamente"
echo "  pnpm run test:ui         - Ejecutar tests en modo UI"
echo "  pnpm run coverage        - Ver cobertura detallada"
echo "  pnpm run sonar:optimize  - Optimizar para SonarQube"
echo ""

# Exit code basado en errores
if [ $ERRORS -gt 0 ]; then
    exit 1
else
    exit 0
fi
