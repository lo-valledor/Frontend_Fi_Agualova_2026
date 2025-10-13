# Guía de Documentación del Proyecto

Esta guía explica cómo documentar código en el proyecto Enerlova Frontend.

## 📚 Recursos Disponibles

### Documentación Principal
- **[ARCHITECTURE.md](../ARCHITECTURE.md)** - Arquitectura completa del sistema
- **[CLAUDE.md](../CLAUDE.md)** - Guía para Claude Code
- **[DEPLOY-README.md](../DEPLOY-README.md)** - Guía de deployment
- **[README.md](../README.md)** - README principal

### Plantillas de Documentación
- **[SERVICE_TEMPLATE.md](./templates/SERVICE_TEMPLATE.md)** - Plantilla para servicios
- **[COMPONENT_TEMPLATE.md](./templates/COMPONENT_TEMPLATE.md)** - Plantilla para componentes

---

## 🎯 Filosofía de Documentación

### Principios

1. **Documenta el POR QUÉ, no el QUÉ**
   - ❌ "Llama a la API" (obvio)
   - ✅ "Usa Promise.all para hacer requests en paralelo y reducir tiempo de carga" (útil)

2. **TypeScript ya documenta los tipos**
   - No repitas información de tipos en JSDoc
   - Enfócate en comportamiento, no en firma

3. **Los ejemplos valen más que mil palabras**
   - Incluye ejemplos de uso en métodos públicos
   - Muestra casos comunes y edge cases

4. **Consistencia sobre exhaustividad**
   - Mejor poco documentado consistentemente que mucho inconsistente
   - Sigue las plantillas del proyecto

---

## 📝 Qué Documentar

### ✅ SIEMPRE Documenta

#### Servicios (app/services/)
- [ ] Interfaz de respuesta (`ServiceResponse`)
- [ ] Clase de servicio con descripción general
- [ ] Todos los métodos públicos
- [ ] Métodos con parámetros: incluir `@param`
- [ ] Métodos que retornan datos: incluir `@returns`
- [ ] Al menos un `@example` en métodos principales

#### Componentes Complejos
- [ ] Componentes de vista de módulo (CRUD completos)
- [ ] Hooks personalizados
- [ ] Componentes con lógica no trivial
- [ ] Props complejos o no obvios
- [ ] Ejemplo de uso

#### Utilidades
- [ ] Funciones helper complejas
- [ ] Funciones con side effects
- [ ] Funciones reutilizadas en múltiples lugares

### 🔸 Documenta CUANDO Sea Relevante

- Comportamientos no obvios o edge cases
- Workarounds o decisiones técnicas especiales
- Limitaciones conocidas
- Dependencias importantes
- Performance considerations

### ❌ NO Documentes

- Componentes UI simples (`<Button>`, `<Input>`)
- Props auto-explicativos con tipos claros
- Código obvio o autoexplicativo
- Implementación interna de métodos privados simples
- Lo que TypeScript ya documenta

---

## 🛠️ Herramientas Instaladas

### 1. ESLint Plugin JSDoc

**Configurado en**: `eslint.config.js`

Valida automáticamente la calidad de JSDoc:
- Alineación y formato
- Nombres de parámetros
- Descripciones requeridas
- Consistencia

**Ejecución**:
```bash
pnpm lint        # Ver warnings de documentación
pnpm lint:fix    # Fix automático de formato
```

### 2. VSCode Extensions (Recomendadas)

Instala estas extensiones para mejorar la experiencia:

#### **Better Comments**
Colorea comentarios especiales:
```typescript
// TODO: Implementar validación
// FIXME: Bug en el cálculo de fecha
// NOTE: Este método es lento, optimizar en v2
// HACK: Workaround temporal hasta que backend lo soporte
```

#### **Document This**
Genera JSDoc automáticamente:
- Posiciona cursor sobre función
- `Ctrl+Alt+D` (Windows) o `Cmd+Alt+D` (Mac)
- Genera plantilla JSDoc

#### **TypeScript JSDoc Generator**
Similar a Document This pero más completo.

---

## 📖 Guía Rápida por Tipo de Archivo

### Servicios (`.ts` en `app/services/`)

```typescript
/**
 * Servicio para operaciones de [MÓDULO]
 *
 * Maneja las operaciones CRUD y consultas para:
 * - [Entidad 1]
 * - [Entidad 2]
 */
class MiServicio {
  /**
   * Obtiene la lista de [entidades]
   *
   * @returns Promise con array de [entidades] o error
   *
   * @example
   * ```typescript
   * const { data, error } = await miServicio.getDatos();
   * if (error) {
   *   toast.error(error);
   * } else {
   *   console.log('Datos:', data);
   * }
   * ```
   */
  async getDatos(): Promise<ServiceResponse<Dato[]>> {
    // Implementación...
  }
}
```

**Ver**: [SERVICE_TEMPLATE.md](./templates/SERVICE_TEMPLATE.md)

---

### Componentes (`.tsx` en `app/components/`)

#### Componentes Simples
No necesitan documentación si son obvios.

#### Componentes de Módulo
```typescript
/**
 * Componente principal para la gestión de [entidades]
 *
 * Funcionalidades principales:
 * - Visualización en tabla con paginación
 * - CRUD completo
 * - Exportación a Excel
 *
 * @param props.datos - Lista de [entidades] desde el loader
 */
export default function MiModuloComponent({ datos }: Props) {
  // Implementación...
}
```

**Ver**: [COMPONENT_TEMPLATE.md](./templates/COMPONENT_TEMPLATE.md)

---

### Hooks (`app/hooks/`)

```typescript
/**
 * Hook para [DESCRIPCIÓN]
 *
 * [DETALLES DEL COMPORTAMIENTO]
 *
 * @param options - Opciones de configuración
 * @returns Objeto con datos, loading, error, refetch
 *
 * @example
 * ```typescript
 * const { datos, loading, refetch } = useMiHook({
 *   intervalo: 5000
 * });
 * ```
 */
export function useMiHook(options: Options): Return {
  // Implementación...
}
```

---

### Utilidades (`app/utils/`)

```typescript
/**
 * Formatea un RUT chileno con guión y puntos
 *
 * @param rut - RUT sin formato (solo números y dígito verificador)
 * @returns RUT formateado (ej: "12.345.678-9")
 *
 * @example
 * ```typescript
 * formatRut("123456789") // "12.345.678-9"
 * ```
 */
export function formatRut(rut: string): string {
  // Implementación...
}
```

---

## 🔍 Revisión de Documentación

### Checklist Pre-Commit

Antes de hacer commit, verifica:

- [ ] Ejecutaste `pnpm lint` y no hay warnings de JSDoc
- [ ] Servicios nuevos/modificados tienen JSDoc completo
- [ ] Componentes complejos tienen descripción clara
- [ ] Métodos públicos tienen `@example` (al menos los principales)
- [ ] No hay JSDoc duplicado o autogenerado vacío

### Revisión en PR

Revisor debe verificar:

- [ ] Código nuevo está documentado según esta guía
- [ ] Documentación es clara y útil (no solo cumple reglas)
- [ ] Ejemplos funcionan y son realistas
- [ ] No hay comentarios obvios o redundantes

---

## 🚀 Workflow de Documentación

### Al Crear Código Nuevo

1. **Escribe el código** con tipos TypeScript claros
2. **Agrega JSDoc** a métodos públicos/exports
3. **Incluye ejemplo** en al menos un método principal
4. **Ejecuta lint** para verificar formato
5. **Lee tu documentación** como si fueras nuevo en el proyecto

### Al Modificar Código Existente

1. **Actualiza JSDoc** si cambia el comportamiento
2. **Agrega JSDoc** si no existía y el código es complejo
3. **Verifica ejemplos** que sigan siendo válidos

### Al Revisar PRs

1. **Verifica que exista** documentación en código complejo
2. **Lee la documentación** antes que el código
3. **Sugiere mejoras** si no está clara
4. **Rechaza** si falta documentación crítica

---

## 💡 Ejemplos de Buena Documentación

### ✅ Ejemplo Excelente

```typescript
/**
 * Normaliza respuestas de API con formato variable
 *
 * El backend puede retornar datos en dos formatos diferentes:
 * - Formato anidado: `{ data: { data: T[] } }`
 * - Formato directo: `{ data: T[] }`
 *
 * Este método normaliza ambos casos y retorna siempre un array.
 *
 * @template T - Tipo de elementos del array esperado
 * @param response - Respuesta de axios con estructura variable
 * @returns Array de tipo T, o array vacío si no se encuentra data válida
 *
 * @private
 */
private processApiResponse<T>(response: any): T[] {
  // Implementación...
}
```

**Por qué es bueno:**
- ✅ Explica el POR QUÉ (backend inconsistente)
- ✅ Documenta formatos específicos con ejemplos
- ✅ Describe comportamiento de fallback
- ✅ Usa tags apropiados (@template, @private)

### ✅ Ejemplo Bueno

```typescript
/**
 * Obtiene la lista de ciclos de facturación
 *
 * @returns Promise con array de ciclos o error
 */
async getCiclosFacturacion(): Promise<ServiceResponse<CiclosFacturacion[]>> {
  // Implementación...
}
```

**Por qué es bueno:**
- ✅ Conciso y claro
- ✅ No repite información obvia
- ✅ TypeScript ya documenta los tipos

### ❌ Ejemplo Malo

```typescript
/**
 * Get ciclos facturacion
 *
 * @return {*}  {Promise<ServiceResponse<CiclosFacturacion[]>>}
 * @memberof MantencionService
 */
async getCiclosFacturacion(): Promise<ServiceResponse<CiclosFacturacion[]>> {
  // Implementación...
}
```

**Por qué es malo:**
- ❌ Descripción vacía/inútil
- ❌ Mezcla inglés y español
- ❌ Tags innecesarios (@memberof)
- ❌ @return duplica info de TypeScript

---

## 📊 Métricas de Documentación

### Objetivo del Proyecto

| Categoría | Meta | Estado Actual |
|-----------|------|---------------|
| Servicios | 100% métodos públicos | ~80% ✅ |
| Componentes de módulo | 100% componentes principales | ~20% ⚠️ |
| Hooks personalizados | 100% | ~0% ❌ |
| Utilidades | 80% funciones complejas | ~30% ⚠️ |

### Cómo Mejorar

1. **Documenta mientras codeas** (no después)
2. **Usa plantillas** para consistencia
3. **Revisa en PRs** la calidad de documentación
4. **Refactoriza doc vieja** cuando toques ese código

---

## 🆘 FAQ

### ¿Debo documentar componentes UI simples como Button?
**No**. Si el componente es obvio y sigue patrones estándar, no necesita JSDoc.

### ¿Qué hago si el autogenerador crea JSDoc vacío?
**Bórralo y escribe uno útil**. JSDoc autogenerado sin contenido es peor que nada.

### ¿Debo documentar en español o inglés?
**Español** para descripciones, **inglés** para nombres de código (funciones, variables).

### ¿Los tags @param y @returns son obligatorios?
**Sí** para métodos con parámetros/retorno no triviales. ESLint te avisará si faltan.

### ¿Necesito ejemplos en todos los métodos?
**No**, solo en:
- Métodos públicos principales
- Hooks personalizados
- APIs no obvias

### ¿Qué hago si no sé qué documentar?
1. Lee las **plantillas** en `docs/templates/`
2. Mira **ejemplos reales** en `app/services/mantencionService.ts`
3. Pregunta en tu PR

---

## 📚 Referencias

- [JSDoc Official](https://jsdoc.app/)
- [TypeScript JSDoc Reference](https://www.typescriptlang.org/docs/handbook/jsdoc-supported-types.html)
- [Plantilla de Servicios](./templates/SERVICE_TEMPLATE.md)
- [Plantilla de Componentes](./templates/COMPONENT_TEMPLATE.md)
- [Arquitectura del Proyecto](../ARCHITECTURE.md)

---

## 🔄 Actualizaciones

Este documento será actualizado conforme el proyecto evolucione.

**Última actualización**: 2025-01-13

**Próximos pasos**:
- [ ] Documentar hooks personalizados existentes
- [ ] Completar JSDoc en componentes de módulo
- [ ] Agregar más ejemplos en utilidades
- [ ] Considerar Storybook para componentes UI (Fase 2)
