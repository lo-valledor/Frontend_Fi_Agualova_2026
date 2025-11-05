#!/bin/bash
# Script para analizar el código con SonarQube y generar reporte

echo "🔍 Analizando código con SonarQube..."

# Colores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Verificar si SonarScanner está instalado
if ! command -v sonar-scanner &> /dev/null; then
    echo -e "${RED}❌ SonarScanner no está instalado${NC}"
    echo "Instalar con: npm install -g sonarqube-scanner"
    exit 1
fi

# Ejecutar análisis
echo -e "${YELLOW}📊 Ejecutando análisis...${NC}"
sonar-scanner \
  -Dsonar.projectKey=Enerlova-front \
  -Dsonar.sources=app \
  -Dsonar.exclusions="**/*.test.ts,**/*.test.tsx,**/*.spec.ts,**/node_modules/**,**/build/**" \
  -Dsonar.tests=app \
  -Dsonar.test.inclusions="**/*.test.ts,**/*.test.tsx,**/*.spec.ts" \
  -Dsonar.typescript.lcov.reportPaths=coverage/lcov.info \
  -Dsonar.javascript.lcov.reportPaths=coverage/lcov.info

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Análisis completado exitosamente${NC}"
else
    echo -e "${RED}❌ Error en el análisis${NC}"
    exit 1
fi
