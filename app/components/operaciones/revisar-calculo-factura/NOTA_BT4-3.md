# Nota Especial: Procesamiento de Tarifa BT4-3

## Contexto

Los contratos con tarifa **BT4-3** (Baja Tensión 4.3) presentan tiempos de procesamiento ligeramente superiores al resto de las tarifas en el sistema de cálculo de facturación.

## Razón Técnica

La tarifa BT4-3 requiere:

- Cálculos más complejos en el backend
- Procesamiento de múltiples componentes de cargo
- Validaciones adicionales específicas de esta tarifa
- Aplicación de reglas tarifarias más detalladas

## Impacto en el Usuario

### Tiempo Adicional Estimado

- **3-5 segundos adicionales** por lote de contratos BT4-3
- Este tiempo es **normal y esperado**
- No indica ningún error o problema en el sistema

### Experiencia del Usuario

Durante el procesamiento de facturas que incluyen contratos BT4-3:

1. **Antes de iniciar** (Sistema listo):

   ```
   💡 Nota: Si hay contratos con tarifa BT4-3, el procesamiento
   puede demorar unos segundos adicionales.
   ```

2. **Durante el procesamiento**:

   ```
   ℹ️ Nota: Los cargos de tarifa BT4-3 pueden demorar unos segundos
   adicionales en procesarse, pero se mostrarán automáticamente
   una vez completados.
   ```

3. **En los toasts de progreso**:
   ```
   "Esto puede tomar varios minutos. Nota: Los cargos BT4-3
   pueden demorar un poco más."
   ```

## Ajustes Realizados en el Sistema

### 1. Delay Inicial Aumentado

- **Sin datos previos:** 12 segundos
- **Con datos previos:** 8 segundos

Estos tiempos incluyen margen para el procesamiento de BT4-3.

### 2. Mensajes Informativos

Se agregaron disclaimers en:

- ✅ Mensaje de "Sistema listo para procesar"
- ✅ Indicador de procesamiento activo
- ✅ Toasts de progreso del polling

### 3. No Cambios en Lógica de Detención

- El sistema sigue deteniendo el polling si no hay datos después del primer intento
- La demora de BT4-3 está **dentro** del delay inicial, no requiere intentos adicionales
- Si el backend está procesando BT4-3, el delay inicial de 12 segundos es suficiente

## Comportamiento Esperado

### Escenario 1: Con Contratos BT4-3

```
1. Usuario hace clic en "Preparar Cálculo"
2. Backend procesa todos los contratos
3. Contratos BT4-3 toman 3-5 seg más que el resto
4. Delay inicial de 12 seg cubre este tiempo
5. Primera verificación detecta todos los datos listos
6. Se muestran todos los cálculos (incluyendo BT4-3)
```

### Escenario 2: Solo BT4-3 (Peor caso)

```
1. Usuario hace clic en "Preparar Cálculo"
2. Backend procesa solo contratos BT4-3
3. Toma ~15 segundos total (10 seg base + 5 seg BT4-3)
4. Delay inicial: 12 seg
5. Primera verificación a los 12 seg: aún no hay datos
6. Segunda verificación a los 16 seg: datos listos ✅
7. Total: ~16-20 segundos
```

## Comunicación al Usuario

### Lo que SÍ decimos:

✅ "Los cargos BT4-3 pueden demorar unos segundos adicionales"  
✅ "Se mostrarán automáticamente una vez completados"  
✅ "El procesamiento puede demorar unos segundos adicionales"

### Lo que NO decimos:

❌ "Hay un problema con BT4-3"  
❌ "Error en el procesamiento de BT4-3"  
❌ "BT4-3 está fallando"

**Mensaje clave:** Es un comportamiento normal y esperado, no un error.

## Testing con BT4-3

### Caso de prueba 1: Mix de tarifas

```
Datos: 10 contratos (5 BT1, 3 BT2, 2 BT4-3)
Tiempo esperado: ~14-16 segundos
Resultado esperado: Todos se muestran juntos
```

### Caso de prueba 2: Solo BT4-3

```
Datos: 10 contratos BT4-3
Tiempo esperado: ~16-20 segundos (puede llegar a 2do intento)
Resultado esperado: Todos se muestran juntos
```

### Caso de prueba 3: Muchos BT4-3

```
Datos: 100 contratos BT4-3
Tiempo esperado: ~20-30 segundos
Resultado esperado: Puede requerir 2-3 intentos de verificación
```

## Monitoreo y Logging

Si necesitas verificar el comportamiento de BT4-3:

```typescript
// En use-calculo-proceso.ts, línea ~89
console.log('📊 Verificación de datos:', {
  intento: intentoActual,
  registrosActuales,
  tiempoTranscurrido: tiempoTranscurridoRef.current,
  posiblesBT43: registrosActuales > 0 && intentoActual > 1
});
```

**Indicador:** Si se necesita más de 1 intento y hay datos, probablemente hay contratos BT4-3.

## Preguntas Frecuentes

### ¿Por qué BT4-3 es más lento?

**R:** La estructura tarifaria de BT4-3 es más compleja y requiere más validaciones y cálculos en el backend.

### ¿Es un error del sistema?

**R:** No, es el comportamiento esperado debido a la complejidad de esta tarifa.

### ¿Se pueden optimizar estos tiempos?

**R:** Posiblemente en el backend, pero no es crítico ya que el delay está dentro de parámetros aceptables (3-5 segundos adicionales).

### ¿Afecta a todos los usuarios?

**R:** Solo a usuarios que tengan contratos con tarifa BT4-3 en su cartera.

### ¿Qué pasa si toma más de 20 segundos?

**R:** El sistema seguirá intentando (hasta 3 verificaciones por defecto). Si persiste, puede ser un problema del backend.

## Métricas de Referencia

| Tarifa    | Tiempo Promedio | Tiempo con BT4-3 |
| --------- | --------------- | ---------------- |
| BT1       | ~8-10 seg       | ~8-10 seg        |
| BT2       | ~8-10 seg       | ~8-10 seg        |
| BT3       | ~9-11 seg       | ~9-11 seg        |
| **BT4-3** | **~13-15 seg**  | **~13-15 seg**   |
| Mix       | ~10-12 seg      | ~13-15 seg       |

## Mantenimiento Futuro

### Si los tiempos cambian:

1. Ajustar `DELAY_INICIAL` en `use-calculo-proceso.ts`
2. Actualizar mensajes al usuario
3. Revisar threshold de verificaciones

### Si se optimiza el backend:

1. Reducir delay inicial si es posible
2. Actualizar documentación
3. Posiblemente remover disclaimers si la diferencia se vuelve insignificante

## Referencias

- Archivo principal: `use-calculo-proceso.ts`
- Componente UI: `revisar-calculo-factura-component.tsx`
- Documentación completa: `FIX_404_LOOP.md`

---

**Última actualización:** Octubre 2025  
**Responsable:** Equipo de Desarrollo Enerlova  
**Estado:** Comportamiento normal y documentado
