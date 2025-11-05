#!/bin/bash
# Script de instalación y configuración de optimización SonarQube
# Autor: Sistema de Optimización SonarQube
# Fecha: Noviembre 2025

set -e  # Exit on error

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Banner
echo ""
echo -e "${CYAN}╔═══════════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║                                                       ║${NC}"
echo -e "${CYAN}║   ${PURPLE}🎯 SonarQube Optimization Setup${CYAN}               ║${NC}"
echo -e "${CYAN}║   ${YELLOW}Configuración Automática${CYAN}                      ║${NC}"
echo -e "${CYAN}║                                                       ║${NC}"
echo -e "${CYAN}╚═══════════════════════════════════════════════════════╝${NC}"
echo ""

# Verificar que estamos en el directorio correcto
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ Error: No se encontró package.json${NC}"
    echo "   Ejecuta este script desde la raíz del proyecto"
    exit 1
fi

echo -e "${BLUE}📋 Verificando dependencias...${NC}"
echo ""

# Verificar Node.js
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js no está instalado${NC}"
    echo "   Instala Node.js desde: https://nodejs.org/"
    exit 1
fi
echo -e "${GREEN}✅ Node.js $(node --version)${NC}"

# Verificar pnpm
if ! command -v pnpm &> /dev/null; then
    echo -e "${YELLOW}⚠️  pnpm no está instalado${NC}"
    echo -e "${BLUE}📦 Instalando pnpm...${NC}"
    npm install -g pnpm
    echo -e "${GREEN}✅ pnpm instalado${NC}"
else
    echo -e "${GREEN}✅ pnpm $(pnpm --version)${NC}"
fi

echo ""
echo -e "${BLUE}📦 Instalando dependencias del proyecto...${NC}"
pnpm install

echo ""
echo -e "${BLUE}🔍 Verificando configuración de SonarQube...${NC}"

# Verificar si los scripts ya existen en package.json
if grep -q "sonar:optimize" package.json; then
    echo -e "${GREEN}✅ Scripts de SonarQube ya configurados${NC}"
else
    echo -e "${YELLOW}⚠️  Scripts de SonarQube no encontrados en package.json${NC}"
    echo "   Por favor, añade manualmente los scripts al package.json"
fi

# Verificar archivos de documentación
echo ""
echo -e "${BLUE}📚 Verificando documentación...${NC}"

DOCS_EXIST=true
REQUIRED_DOCS=(
    "docs/SONAR_README.md"
    "docs/OPTIMIZATION_SUMMARY.md"
    "docs/SONAR_OPTIMIZATION_GUIDE.md"
    "docs/SONAR_QUICK_REFERENCE.md"
    "docs/CODE_REVIEW_CHECKLIST.md"
)

for doc in "${REQUIRED_DOCS[@]}"; do
    if [ -f "$doc" ]; then
        echo -e "${GREEN}✅ $doc${NC}"
    else
        echo -e "${RED}❌ $doc (falta)${NC}"
        DOCS_EXIST=false
    fi
done

# Verificar scripts
echo ""
echo -e "${BLUE}🛠️  Verificando scripts...${NC}"

SCRIPTS_EXIST=true
REQUIRED_SCRIPTS=(
    "scripts/sonar-optimizer.js"
    "scripts/quality-check.sh"
    "scripts/quality-check.ps1"
)

for script in "${REQUIRED_SCRIPTS[@]}"; do
    if [ -f "$script" ]; then
        echo -e "${GREEN}✅ $script${NC}"
        # Hacer ejecutables los scripts bash
        if [[ "$script" == *.sh ]]; then
            chmod +x "$script"
        fi
    else
        echo -e "${RED}❌ $script (falta)${NC}"
        SCRIPTS_EXIST=false
    fi
done

# Ejecutar primera verificación
echo ""
echo -e "${BLUE}🔍 Ejecutando primera verificación de calidad...${NC}"
echo ""

if pnpm run quality:check; then
    echo ""
    echo -e "${GREEN}✅ Verificación inicial exitosa${NC}"
else
    echo ""
    echo -e "${YELLOW}⚠️  Se encontraron algunos issues${NC}"
    echo "   Esto es normal en la primera ejecución"
fi

# Abrir dashboard
echo ""
echo -e "${BLUE}📊 Configurando dashboard...${NC}"

if [ -f "docs/sonar-dashboard.html" ]; then
    echo -e "${GREEN}✅ Dashboard disponible en: docs/sonar-dashboard.html${NC}"
    
    # Preguntar si abrir el dashboard
    read -p "¿Deseas abrir el dashboard ahora? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        if [[ "$OSTYPE" == "darwin"* ]]; then
            open docs/sonar-dashboard.html
        elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
            xdg-open docs/sonar-dashboard.html
        else
            echo "Abre manualmente: docs/sonar-dashboard.html"
        fi
    fi
fi

# Resumen final
echo ""
echo -e "${CYAN}╔═══════════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║                                                       ║${NC}"
echo -e "${CYAN}║   ${GREEN}✅ Instalación Completada${CYAN}                       ║${NC}"
echo -e "${CYAN}║                                                       ║${NC}"
echo -e "${CYAN}╚═══════════════════════════════════════════════════════╝${NC}"
echo ""

echo -e "${PURPLE}📚 Documentación disponible:${NC}"
echo "   • docs/SONAR_README.md - Inicio rápido"
echo "   • docs/SETUP_COMPLETE.md - Guía completa"
echo "   • docs/sonar-dashboard.html - Dashboard visual"
echo ""

echo -e "${PURPLE}🚀 Comandos disponibles:${NC}"
echo "   • pnpm run quality:check - Verificar calidad"
echo "   • pnpm run sonar:optimize - Optimizar código"
echo "   • pnpm run sonar:fix - Fix automático"
echo ""

echo -e "${PURPLE}📖 Próximos pasos:${NC}"
echo "   1. Lee docs/SONAR_README.md"
echo "   2. Ejecuta: pnpm run quality:check"
echo "   3. Abre docs/sonar-dashboard.html"
echo "   4. Revisa docs/SONAR_QUICK_REFERENCE.md"
echo ""

echo -e "${GREEN}🎉 ¡Todo listo para comenzar la optimización!${NC}"
echo ""

# Crear un archivo de estado
echo "Setup completado: $(date)" > .sonar-setup-complete
echo "Versión: 1.0.0" >> .sonar-setup-complete

exit 0
