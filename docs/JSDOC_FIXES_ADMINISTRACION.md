# Guía de Corrección JSDoc - administracionService.ts

## ❌ Métodos que Necesitan Completar JSDoc

### 1. **getCargoTipoContrato()**

```typescript
/**
 * Obtiene lista de relaciones entre cargos y tipos de contrato
 *
 * @returns Promise con array de cargo-tipo-contrato o error
 */
```

### 2. **getCargoTipoContratoById(cargoTipoContratoId)**

```typescript
/**
 * Obtiene datos completos de una relación cargo-tipo-contrato específica
 *
 * Incluye datos de edición, detalles, listbox y todos los combos necesarios
 * para la visualización y edición del registro
 *
 * @param cargoTipoContratoId - ID de la relación cargo-tipo-contrato
 * @returns Promise con todos los datos relacionados o error
 */
```

### 3. **getCondicionesContratoData()**

```typescript
/**
 * Obtiene condiciones de contrato con sus conceptos asociados
 *
 * @returns Promise con condiciones y conceptos o error
 */
```

### 4. **getCargoFacturableData()**

```typescript
/**
 * Obtiene cargos facturables con sus datos de configuración
 *
 * Incluye conceptos, tarifas y tipos de medidor asociados
 *
 * @returns Promise con cargos y combos relacionados o error
 */
```

### 5. **crearContrato(contratoData)**

````typescript
/**
 * Crea un nuevo contrato en el sistema
 *
 * @param contratoData - Datos del contrato a crear
 * @returns Promise con confirmación de creación o error
 *
 * @example
 * ```typescript
 * const nuevoContrato = { ... };
 * const { data, error } = await administracionService.crearContrato(nuevoContrato);
 * if (error) {
 *   console.error('Error al crear contrato:', error);
 * }
 * ```
 */
````

### 6. **modificarContrato(contratoData)**

````typescript
/**
 * Modifica un contrato existente
 *
 * Realiza validación y actualización completa del contrato.
 * Incluye manejo detallado de errores de validación del backend.
 *
 * @param contratoData - Datos actualizados del contrato
 * @returns Promise con confirmación o error detallado
 *
 * @example
 * ```typescript
 * const datosActualizados = { id: 123, ... };
 * const { data, error} = await administracionService.modificarContrato(datosActualizados);
 * ```
 */
````

### 7. **getGiros()**

```typescript
/**
 * Obtiene catálogo completo de giros comerciales
 *
 * @returns Promise con array de giros o error
 */
```

### 8. **getComunas()**

```typescript
/**
 * Obtiene listado de comunas organizadas por región
 *
 * @returns Promise con array de comunas o error
 */
```

### 9. **getClientesByRut()**

```typescript
/**
 * Obtiene lista completa de clientes indexados por RUT
 *
 * @returns Promise con array de clientes o error
 */
```

### 10. **getClienteByRut(rut)**

````typescript
/**
 * Busca un cliente específico por su RUT
 *
 * @param rut - RUT del cliente (con o sin formato)
 * @returns Promise con datos del cliente o error
 *
 * @example
 * ```typescript
 * const { data, error } = await administracionService.getClienteByRut('12345678-9');
 * ```
 */
````

### 11. **getContratanteByRut(rut)**

```typescript
/**
 * Busca un contratante específico por su RUT
 *
 * @param rut - RUT del contratante
 * @returns Promise con datos del contratante o error
 */
```

### 12. **getPropietarioByRut(rut)**

```typescript
/**
 * Busca un propietario específico por su RUT
 *
 * @param rut - RUT del propietario
 * @returns Promise con datos del propietario o error
 */
```

### 13. **crearMedidor(data)**

```typescript
/**
 * Crea un nuevo medidor en el sistema
 *
 * @param data - Datos del medidor a crear
 * @returns Promise con ID del medidor creado o error
 */
```

### 14. **modificarMedidor(data)**

```typescript
/**
 * Modifica un medidor existente
 *
 * @param data - Datos actualizados del medidor
 * @returns Promise con confirmación o error
 */
```

### 15. **crearContratante(contratanteData)**

```typescript
/**
 * Crea un nuevo contratante en el sistema
 *
 * @param contratanteData - Datos del contratante a crear
 * @returns Promise con confirmación de creación o error
 */
```

### 16. **sincronizarPropietarios()**

```typescript
/**
 * Sincroniza propietarios con sus locales asociados
 *
 * Actualiza las relaciones entre propietarios y locales asegurando
 * la consistencia de datos en el sistema
 *
 * @returns Promise con número de registros afectados o error
 */
```

## 📝 Plantilla Estándar para Métodos

````typescript
/**
 * [Descripción breve de qué hace el método]
 *
 * [Descripción detallada opcional explicando el POR QUÉ o casos especiales]
 *
 * @param nombreParam - Descripción del parámetro
 * @returns Promise con [qué retorna] o error
 *
 * @example
 * ```typescript
 * const { data, error } = await administracionService.metodo();
 * if (error) {
 *   console.error('Error:', error);
 * } else {
 *   console.log('Éxito:', data);
 * }
 * ```
 */
````

## ✅ Checklist de Documentación

Para cada método verifica:

- [ ] Tiene descripción clara y concisa
- [ ] Explica el "POR QUÉ" si es complejo
- [ ] Todos los `@param` tienen descripción
- [ ] Tiene `@returns` documentado
- [ ] Incluye `@example` para métodos públicos importantes
- [ ] No duplica información de TypeScript
- [ ] Usa terminología consistente

## 🎯 Próximos Pasos

1. Revisar cada método de la lista
2. Agregar JSDoc faltantes usando las plantillas
3. Ejecutar `pnpm run lint:fix` para verificar
4. Generar documentación: `pnpm run docs:all`
5. Revisar resultado en `docs/generated/services.md`
