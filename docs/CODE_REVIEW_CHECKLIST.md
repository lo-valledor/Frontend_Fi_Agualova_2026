# ✅ SonarQube Code Review Checklist

Use este checklist antes de hacer commit o crear un PR.

## 🔍 Pre-Commit

- [ ] No hay warnings de ESLint (`pnpm run lint`)
- [ ] TypeScript compila sin errores (`pnpm run typecheck`)
- [ ] Tests pasan (`pnpm run test:run`)
- [ ] Cobertura de código >80% en archivos nuevos/modificados

## 📝 Calidad de Código

### Patrones a Evitar

- [ ] ❌ No usar `parseInt()` → usar `Number.parseInt()`
- [ ] ❌ No usar `.forEach()` → usar `for...of` cuando sea posible
- [ ] ❌ No dejar parámetros no usados sin `_` prefix
- [ ] ❌ No usar `any` sin justificación
- [ ] ❌ No anidar callbacks >4 niveles

### Patrones a Seguir

- [ ] ✅ Funciones <50 líneas (idealmente <30)
- [ ] ✅ Complejidad cognitiva <15
- [ ] ✅ Nombres descriptivos (no `data`, `temp`, `x`)
- [ ] ✅ Early returns para reducir anidamiento
- [ ] ✅ Extraer lógica compleja a funciones helper

## 📚 Documentación

- [ ] JSDoc en funciones públicas/exportadas
- [ ] Comentarios para lógica no obvia
- [ ] README actualizado si aplica
- [ ] Tipos TypeScript bien definidos

## 🧪 Testing

- [ ] Tests unitarios para nueva funcionalidad
- [ ] Tests de integración si aplica
- [ ] Edge cases cubiertos
- [ ] Mocks apropiados

## 🎨 Componentes React

- [ ] Componentes <200 líneas
- [ ] Lógica extraída a custom hooks
- [ ] Props con tipos explícitos
- [ ] Memoización apropiada (useMemo/useCallback)
- [ ] Keys únicas en listas

## 🚀 Performance

- [ ] No hay console.log en producción
- [ ] Optimizaciones de re-renders
- [ ] Lazy loading cuando corresponde
- [ ] Imágenes optimizadas

## 🔒 Seguridad

- [ ] No hay credenciales hardcoded
- [ ] Validación de inputs
- [ ] Sanitización de datos
- [ ] HTTPS en endpoints

---

## 🛠️ Quick Fix Commands

```bash
# Fix automático de issues comunes
pnpm run sonar:fix

# Verificar calidad completa
pnpm run quality:check

# Generar reporte de cobertura
pnpm run coverage
```

## 📊 Métricas Target

| Métrica          | Valor Objetivo |
| ---------------- | -------------- |
| Code Smells      | 0              |
| Bugs             | 0              |
| Vulnerabilidades | 0              |
| Duplicación      | <3%            |
| Cobertura        | >80%           |
| Complejidad      | <15            |

---

**Tip:** Ejecuta `pnpm run quality:check` antes de cada commit!
