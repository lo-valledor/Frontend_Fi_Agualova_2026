#!/bin/bash
# Comandos útiles para optimización de SonarQube
# Copiar y pegar según necesites

echo "🎯 Comandos de Optimización SonarQube"
echo "====================================="
echo ""

# ============================================
# VERIFICACIÓN Y ANÁLISIS
# ============================================
echo "📊 VERIFICACIÓN Y ANÁLISIS"
echo "-----------------------------------"
echo ""
echo "# Verificar calidad completa (recomendado antes de commit)"
echo "pnpm run quality:check"
echo ""
echo "# Verificar TypeScript"
echo "pnpm run typecheck"
echo ""
echo "# Ejecutar ESLint"
echo "pnpm run lint"
echo ""
echo "# Ejecutar tests"
echo "pnpm run test:run"
echo ""
echo "# Ver cobertura de tests"
echo "pnpm run coverage"
echo ""

# ============================================
# OPTIMIZACIÓN AUTOMÁTICA
# ============================================
echo "⚡ OPTIMIZACIÓN AUTOMÁTICA"
echo "-----------------------------------"
echo ""
echo "# Optimizar código para SonarQube"
echo "pnpm run sonar:optimize"
echo ""
echo "# Fix automático de ESLint"
echo "pnpm run lint:fix"
echo ""
echo "# Optimización completa (optimize + lint:fix)"
echo "pnpm run sonar:fix"
echo ""

# ============================================
# ANÁLISIS DE SONARQUBE
# ============================================
echo "🔍 ANÁLISIS DE SONARQUBE"
echo "-----------------------------------"
echo ""
echo "# Ejecutar análisis de SonarQube"
echo "pnpm run sonar:analyze"
echo ""
echo "# Verificar archivo específico con SonarQube (en VS Code)"
echo "# Comando: SonarQube: Analyze current file"
echo ""

# ============================================
# TESTS
# ============================================
echo "🧪 TESTS"
echo "-----------------------------------"
echo ""
echo "# Ejecutar tests en modo watch"
echo "pnpm run test:watch"
echo ""
echo "# Ejecutar tests con UI"
echo "pnpm run test:ui"
echo ""
echo "# Ejecutar un archivo de test específico"
echo "pnpm run test -- path/to/file.test.ts"
echo ""

# ============================================
# FORMATO Y ESTILO
# ============================================
echo "🎨 FORMATO Y ESTILO"
echo "-----------------------------------"
echo ""
echo "# Formatear código con Prettier"
echo "pnpm run format"
echo ""
echo "# Verificar formato sin modificar"
echo "pnpm run format:check"
echo ""

# ============================================
# BÚSQUEDA DE PROBLEMAS
# ============================================
echo "🔎 BÚSQUEDA DE PROBLEMAS"
echo "-----------------------------------"
echo ""
echo "# Buscar todos los .forEach() en el código"
echo "grep -r '\\.forEach(' app/"
echo ""
echo "# Buscar parseInt (debería ser Number.parseInt)"
echo "grep -r 'parseInt(' app/ | grep -v 'Number.parseInt'"
echo ""
echo "# Buscar funciones muy largas (>50 líneas)"
echo "# Esto requiere un script custom"
echo ""

# ============================================
# DASHBOARD Y REPORTES
# ============================================
echo "📊 DASHBOARD Y REPORTES"
echo "-----------------------------------"
echo ""
echo "# Abrir dashboard HTML"
echo "# Windows:"
echo "start docs/sonar-dashboard.html"
echo ""
echo "# Mac:"
echo "open docs/sonar-dashboard.html"
echo ""
echo "# Linux:"
echo "xdg-open docs/sonar-dashboard.html"
echo ""
echo "# Ver reporte de cobertura"
echo "open coverage/index.html"
echo ""

# ============================================
# GIT Y COMMITS
# ============================================
echo "📝 GIT Y COMMITS"
echo "-----------------------------------"
echo ""
echo "# Pre-commit check completo"
echo "pnpm run quality:check && git add . && git commit -m 'mensaje'"
echo ""
echo "# Verificar cambios antes de push"
echo "pnpm run ci"
echo ""

# ============================================
# SCRIPTS PERSONALIZADOS
# ============================================
echo "🛠️ SCRIPTS PERSONALIZADOS"
echo "-----------------------------------"
echo ""
echo "# Ejecutar optimizador (Node)"
echo "node scripts/sonar-optimizer.js"
echo ""
echo "# Ejecutar verificación de calidad (Bash)"
echo "bash scripts/quality-check.sh"
echo ""
echo "# Ejecutar verificación de calidad (PowerShell)"
echo "./scripts/quality-check.ps1"
echo ""

# ============================================
# WORKFLOW RECOMENDADO
# ============================================
echo ""
echo "✨ WORKFLOW RECOMENDADO"
echo "====================================="
echo ""
echo "Antes de empezar a trabajar:"
echo "  1. git pull"
echo "  2. pnpm install"
echo ""
echo "Durante el desarrollo:"
echo "  1. pnpm run dev (en otra terminal)"
echo "  2. pnpm run test:watch (opcional)"
echo "  3. Hacer cambios"
echo "  4. pnpm run lint (frecuentemente)"
echo ""
echo "Antes de commit:"
echo "  1. pnpm run quality:check"
echo "  2. pnpm run sonar:fix (si hay issues)"
echo "  3. pnpm run test:run"
echo "  4. git add ."
echo "  5. git commit -m 'mensaje descriptivo'"
echo ""
echo "Antes de push:"
echo "  1. pnpm run ci"
echo "  2. git push"
echo ""

# ============================================
# ATAJOS ÚTILES
# ============================================
echo ""
echo "⚡ ATAJOS ÚTILES"
echo "====================================="
echo ""
echo "# Fix rápido antes de commit"
echo "alias sonar-fix='pnpm run sonar:fix && pnpm run test:run'"
echo ""
echo "# Verificación rápida"
echo "alias check='pnpm run quality:check'"
echo ""
echo "# Commit seguro"
echo "alias safe-commit='pnpm run quality:check && git add . && git commit'"
echo ""
echo "# Agregar estos aliases a tu ~/.bashrc o ~/.zshrc"
echo ""

# ============================================
# RECURSOS
# ============================================
echo ""
echo "📚 RECURSOS"
echo "====================================="
echo ""
echo "Documentación:"
echo "  • docs/SONAR_README.md - Inicio rápido"
echo "  • docs/SONAR_QUICK_REFERENCE.md - Referencia rápida"
echo "  • docs/REFACTORING_EXAMPLES.md - Ejemplos prácticos"
echo "  • docs/CODE_REVIEW_CHECKLIST.md - Checklist"
echo ""
echo "Scripts:"
echo "  • scripts/sonar-optimizer.js - Optimizador"
echo "  • scripts/quality-check.sh - Verificación (bash)"
echo "  • scripts/quality-check.ps1 - Verificación (PowerShell)"
echo ""

# ============================================
# TIPS
# ============================================
echo ""
echo "💡 TIPS"
echo "====================================="
echo ""
echo "1. Ejecuta 'quality:check' frecuentemente"
echo "2. Usa 'sonar:fix' para correcciones automáticas"
echo "3. Revisa el dashboard HTML para visualizar métricas"
echo "4. Comitea cambios pequeños e incrementales"
echo "5. Lee SONAR_QUICK_REFERENCE.md cuando tengas dudas"
echo ""
echo "¡Éxito con la optimización! 🚀"
