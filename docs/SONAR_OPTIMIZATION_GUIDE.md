# 🎯 Guía de Optimización de SonarQube para el Proyecto

## 📊 Estado Actual del Proyecto

El proyecto tiene configuración básica de SonarQube pero requiere optimizaciones en varios aspectos del código.

## 🔍 Problemas Comunes Detectados

### 1. **`.forEach()` vs `for...of`**

**Severidad:** Info  
**Ocurrencias:** ~50+  
**Ubicaciones principales:**

- `app/components/dashboard/*.tsx`
- `app/hooks/shared/*.ts`
- `app/components/monitor/**/*.tsx`

**Solución:**

```typescript
// ❌ Antes
data.forEach((item, index) => {
  // código
});

// ✅ Después
for (const [index, item] of data.entries()) {
  // código
}

// O si no necesitas el índice:
for (const item of data) {
  // código
}
```

### 2. **Anidamiento Excesivo (>4 niveles)**

**Severidad:** Major  
**Ubicaciones:** Funciones complejas con callbacks anidados

**Solución:**

```typescript
// ❌ Antes
function complex() {
  if (condition1) {
    if (condition2) {
      data.forEach(item => {
        item.forEach(sub => {
          if (sub.value) {
            // demasiado anidamiento
          }
        });
      });
    }
  }
}

// ✅ Después - Extraer funciones helper
const processItem = (item: Item) => {
  for (const sub of item) {
    if (sub.value) {
      // lógica
    }
  }
};

function complex() {
  if (!condition1 || !condition2) return;

  for (const item of data) {
    processItem(item);
  }
}
```

### 3. **Parámetros No Utilizados**

**Severidad:** Warning  
**Solución:**

```typescript
// ❌ Antes
array.map((item, index) => item.name);

// ✅ Después
array.map((item, _index) => item.name);
// o mejor aún:
array.map(item => item.name);
```

### 4. **Complejidad Cognitiva Alta**

**Severidad:** Critical  
**Ubicaciones:** Componentes grandes y funciones de procesamiento

**Solución:**

- Dividir componentes grandes en sub-componentes
- Extraer lógica de negocio a hooks personalizados
- Usar custom hooks para lógica reutilizable
- Aplicar principio de responsabilidad única

## 🛠️ Scripts de Automatización

### Optimizador Automático

```bash
# Ejecutar optimizaciones automáticas
node scripts/sonar-optimizer.js
```

### Análisis Manual

```bash
# Generar reporte de issues
pnpm run lint
pnpm run sonar:analyze
```

## 📋 Plan de Acción por Prioridad

### ✅ Prioridad ALTA (Hacer Primero)

1. **Corregir `parseInt` restantes** (3 archivos)
   - `app/components/mantencion/ciclos-facturacion/ciclos-facturacion-modal-form.tsx`
   - `app/components/reportes/consultar-contrato/contrato/facturas/*.tsx`

2. **Reducir complejidad cognitiva** en archivos críticos:
   - `dashboard-component.tsx`
   - `crear-contrato-component.tsx`
   - `resultados-busqueda.tsx`

### ⚠️ Prioridad MEDIA

3. **Convertir `.forEach()` a `for...of`** (gradual)
   - Comenzar por archivos de utilidades
   - Luego hooks compartidos
   - Finalmente componentes

4. **Eliminar parámetros no usados**
   - Revisar callbacks de `.map()`, `.filter()`, etc.
   - Usar `_` como prefijo para parámetros requeridos pero no usados

### 💡 Prioridad BAJA (Mejoras)

5. **Refactorizar componentes grandes**
   - Dividir componentes >500 líneas
   - Extraer lógica a custom hooks
   - Crear sub-componentes reutilizables

6. **Mejorar documentación JSDoc**
   - Ya tienes buena configuración en `eslint.config.js`
   - Añadir JSDoc a funciones públicas

## 🔧 Configuración Mejorada

### Actualizar `sonar-project.properties`

```properties
sonar.projectKey=Enerlova-front
sonar.projectName=Enerlova Frontend
sonar.projectVersion=1.0

# Directorios
sonar.sources=app
sonar.tests=app
sonar.exclusions=**/node_modules/**,**/build/**,**/*.config.js,**/*.config.ts
sonar.test.inclusions=**/*.test.ts,**/*.test.tsx,**/*.spec.ts,**/*.spec.tsx

# Cobertura
sonar.typescript.lcov.reportPaths=coverage/lcov.info
sonar.javascript.lcov.reportPaths=coverage/lcov.info

# Umbrales de calidad
sonar.qualitygate.wait=true

# Configuración de análisis
sonar.sourceEncoding=UTF-8
```

### Añadir scripts a `package.json`

```json
{
  "scripts": {
    "sonar:optimize": "node scripts/sonar-optimizer.js",
    "sonar:analyze": "bash scripts/sonar-analyzer.sh",
    "sonar:fix": "pnpm run sonar:optimize && pnpm run lint:fix"
  }
}
```

## 📊 Métricas Objetivo

| Métrica               | Estado Actual | Objetivo     |
| --------------------- | ------------- | ------------ |
| Code Smells           | ~150+         | <50          |
| Duplicaciones         | Variable      | <3%          |
| Complejidad Cognitiva | >15 en varios | <15 en todos |
| Cobertura Tests       | ~60%          | >80%         |
| Deuda Técnica         | ~5h           | <2h          |

## 🚀 Proceso de Optimización Incremental

### Semana 1: Fixes Críticos

- [ ] Corregir todos los `parseInt` → `Number.parseInt`
- [ ] Arreglar parámetros no usados en archivos core
- [ ] Reducir complejidad en top 5 archivos más complejos

### Semana 2: Refactorización Media

- [ ] Convertir 50% de `.forEach()` a `for...of`
- [ ] Dividir 3-5 componentes grandes
- [ ] Mejorar test coverage de archivos críticos

### Semana 3: Pulido Final

- [ ] Completar conversión de `.forEach()`
- [ ] Añadir JSDoc faltante
- [ ] Ejecutar análisis completo y validar métricas

## 🎓 Mejores Prácticas del Equipo

### 1. **Pre-commit Hooks**

Ya tienes Husky configurado. Asegúrate de que ejecuta:

```bash
# .husky/pre-commit
pnpm run lint
pnpm run typecheck
```

### 2. **Code Review Checklist**

- ✅ No hay `.forEach()` que puedan ser `for...of`
- ✅ Funciones <50 líneas
- ✅ Complejidad cognitiva <15
- ✅ JSDoc en funciones públicas
- ✅ Tests cubren >80% del código nuevo

### 3. **Refactoring Seguro**

1. Escribir test antes de refactorizar
2. Hacer cambios pequeños e incrementales
3. Ejecutar `pnpm test` después de cada cambio
4. Validar con `pnpm run lint`

## 🔗 Recursos Adicionales

- [SonarQube Rules for TypeScript](https://rules.sonarsource.com/typescript/)
- [Cognitive Complexity](https://www.sonarsource.com/docs/CognitiveComplexity.pdf)
- [Clean Code Principles](https://github.com/ryanmcdermott/clean-code-javascript)

## 📞 Soporte

Para dudas sobre optimizaciones específicas:

1. Revisar esta guía
2. Consultar documentación de SonarQube
3. Ejecutar `node scripts/sonar-optimizer.js --help`

---

**Última actualización:** Noviembre 2025  
**Versión:** 1.0.0
