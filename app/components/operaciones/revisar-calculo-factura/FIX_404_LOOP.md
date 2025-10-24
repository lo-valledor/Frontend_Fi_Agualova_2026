# Fix: Loop Infinito con Error 404 - Solución Simple y Directa

## Problema Identificado

Cuando el endpoint `/calculo-prefactura-encabezado` retornaba un error 404 (datos no encontrados), el componente `revisar-calculo-factura` presentaba **múltiples problemas críticos**:

1. **Loop infinito** de peticiones al servidor (seguía intentando 150 veces incluso sin datos)
2. **Toasts de error** repetidos mostrando "Recurso no encontrado"
3. **Contador incorrecto** de verificaciones (mostraba "/10" en vez de "/150")
4. **Mal uso de recursos** esperando hasta 10 minutos cuando los datos no existen

### Síntomas

- Múltiples peticiones GET consecutivas a `/calculo-prefactura-encabezado`
- Error 404 repetido en consola
- **Múltiples toasts de error** "Recurso no encontrado" apareciendo en pantalla
- Contador mostrando "13/150" o más cuando NO hay datos disponibles
- El proceso sigue esperando y consumiendo recursos innecesariamente
- El navegador se vuelve lento

## Solución Simple

**Principio:** Si no hay datos después de la primera verificación, **detener inmediatamente**. No seguir esperando indefinidamente.

### Cambios Principales

#### 1. Detección Inmediata de "Sin Datos"

**Archivo:** `app/hooks/operaciones/use-calculo-proceso.ts`

Cambié la función `verificarDatosDisponibles` para que retorne un objeto con dos flags:

- `datosListos`: ¿Hay datos disponibles?
- `detenerPolling`: ¿Debe detenerse el polling?

```typescript
const verificarDatosDisponibles = useCallback(
  async (
    intentoActual: number
  ): Promise<{ datosListos: boolean; detenerPolling: boolean }> => {
    try {
      const registrosActuales = await obtenerNumeroRegistros();
      const registrosIniciales = registrosInicialesRef.current;

      // Caso 1: Hubo cambio (nuevas lecturas procesadas)
      const hayCambio = registrosActuales > registrosIniciales;
      if (registrosActuales > 0 && hayCambio) {
        return { datosListos: true, detenerPolling: true }; // ✅ Hay datos nuevos
      }

      // Caso 2: Sin datos después del primer intento -> DETENER INMEDIATAMENTE
      if (intentoActual === 1 && registrosActuales === 0) {
        return { datosListos: false, detenerPolling: true }; // ❌ No hay datos, parar
      }

      // Caso 3: Sin cambios pero hay datos existentes después de 3 intentos
      const SIN_CAMBIOS_THRESHOLD = 3; // ~12 segundos
      if (
        registrosActuales > 0 &&
        registrosActuales === registrosIniciales &&
        intentoActual >= SIN_CAMBIOS_THRESHOLD
      ) {
        return { datosListos: true, detenerPolling: true }; // ✅ Datos previos
      }

      return { datosListos: false, detenerPolling: false }; // Seguir esperando
    } catch (error) {
      console.error('Error verificando datos disponibles:', error);
      // En caso de error, DETENER el polling
      return { datosListos: false, detenerPolling: true };
    }
  },
  [obtenerNumeroRegistros]
);
```

**Beneficio clave:** En el intento 1, si no hay datos (0 registros), se detiene inmediatamente. No espera más.

#### 2. Lógica de Polling Simplificada

```typescript
const resultado = await verificarDatosDisponibles(intentos);

// Si debemos detener el polling
if (resultado.detenerPolling) {
  limpiarIntervalos();
  setIsProcesando(false);

  if (resultado.datosListos) {
    // ✅ Hay datos - mostrar éxito
    setIsCalculoPreparado(true);
    toast.success('¡Cálculos completados!', { ... });
  } else {
    // ❌ No hay datos - mostrar info y parar
    setIsCalculoPreparado(false);
    toast.info('No hay datos procesados', {
      description: 'No se encontraron cálculos de facturación para este periodo y ciclo...',
      duration: 6000
    });
  }
}
```

#### 3. Supresión de Toasts de Error 404

**Archivo:** `app/services/axiosConfig.ts`

```typescript
case 404: {
  const routesWithExpected404 = [
    '/datos-basicos-medidor',
    '/calculo-prefactura-encabezado' // 🆕 404 esperado, no mostrar toast
  ];
  // ...
}
```

#### 4. Corrección del Contador

**Archivo:** `revisar-calculo-factura-component.tsx`

```typescript
<div>Verificaciones: {intentosPolling}/150</div>
```

#### 5. Protección contra Llamadas Simultáneas

```typescript
const isCheckingRef = useRef<boolean>(false);

const verificarDatosIniciales = useCallback(async () => {
  if (isCheckingRef.current) return; // Ya se está ejecutando

  try {
    isCheckingRef.current = true;
    // ... lógica de verificación
  } finally {
    isCheckingRef.current = false;
  }
}, [periodoFormateado, cicloId, obtenerNumeroRegistros]);
```

#### 6. Manejo Silencioso de 404 en obtenerNumeroRegistros

```typescript
catch (error: any) {
  // Si es un 404, es normal que no haya datos aún
  if (error.response?.status === 404) {
    return 0; // Retornar 0 sin loguear error
  }
  console.error('Error obteniendo número de registros:', error);
  return 0;
}
```

## Flujo Corregido (Simple y Directo)

### Escenario 1: Sin Datos (Caso común problemático)

**Antes ❌**

```
1. Usuario hace clic en "Preparar Cálculo"
2. Espera 12 segundos (delay inicial)
3. Intento 1: GET → 404 → "Recurso no encontrado" (toast)
4. Intento 2: GET → 404 → "Recurso no encontrado" (toast)
5. Intento 3: GET → 404 → "Recurso no encontrado" (toast)
...
148. Intento 148: GET → 404 → "Recurso no encontrado" (toast)
149. Intento 149: GET → 404 → "Recurso no encontrado" (toast)
150. Intento 150: GET → 404 → Timeout después de 10 minutos 😱
```

**Después ✅**

```
1. Usuario hace clic en "Preparar Cálculo"
2. Espera 12 segundos (delay inicial)
3. Intento 1: GET → 404 (sin toast) → 0 registros
4. Detener inmediatamente ✋
5. Mostrar: "No hay datos procesados" (toast informativo)
6. Tiempo total: ~16 segundos ⚡
```

### Escenario 2: Con Datos Nuevos

```
1. Usuario hace clic en "Preparar Cálculo"
2. Espera 12 segundos (delay inicial)
3. Intento 1: GET → 200 OK → 45 registros (había 0 antes)
4. Detecta cambio: 45 > 0 ✅
5. Detener polling
6. Mostrar: "¡Cálculos completados! 45 nuevas lecturas"
```

### Escenario 3: Con Datos Previos (Sin Cambios)

```
1. Usuario hace clic en "Preparar Cálculo"
2. Espera 8 segundos (delay corto porque hay datos previos)
3. Intento 1: GET → 200 OK → 45 registros (había 45 antes)
4. Sin cambios, esperar...
5. Intento 2: GET → 200 OK → 45 registros (sin cambios)
6. Intento 3: GET → 200 OK → 45 registros (sin cambios)
7. Threshold alcanzado (3 intentos = 12 segundos)
8. Detener polling
9. Mostrar: "Datos disponibles - 45 cálculos ya procesados"
```

## Archivos Modificados

1. **`app/hooks/operaciones/use-calculo-proceso.ts`**

   - ✅ Retorno de objeto `{datosListos, detenerPolling}` en lugar de boolean simple
   - ✅ Detención inmediata si no hay datos en primer intento
   - ✅ Threshold reducido de 8 a 3 intentos para datos previos
   - ✅ Manejo de errores que detiene el polling
   - ✅ Flag `isCheckingRef` para prevenir llamadas simultáneas
   - ✅ Manejo silencioso de errores 404

2. **`app/services/axiosConfig.ts`**

   - ✅ Agregado `/calculo-prefactura-encabezado` a excepciones de 404
   - ✅ Ya no muestra toasts para este endpoint

3. **`app/components/operaciones/revisar-calculo-factura/revisar-calculo-factura-component.tsx`**
   - ✅ Contador corregido de "/10" a "/150"

## Comparación de Tiempo de Respuesta

| Escenario                   | Antes (❌)                 | Después (✅)              | Mejora             |
| --------------------------- | -------------------------- | ------------------------- | ------------------ |
| Sin datos                   | ~10 minutos (150 intentos) | ~16 segundos (1 intento)  | **97% más rápido** |
| Con datos nuevos            | ~16 segundos               | ~16 segundos              | Igual              |
| Datos previos (sin cambios) | ~44 segundos (8 intentos)  | ~24 segundos (3 intentos) | **45% más rápido** |

## Testing

### ✅ Caso 1: Sin Datos Procesados

1. Entra al componente cuando NO hay cálculos
2. Haz clic en "Preparar Cálculo"
3. **Espera ~16 segundos**
4. Debe mostrar: "No hay datos procesados" (toast azul info)
5. **NO** debe seguir esperando
6. **NO** debe mostrar toasts de "Recurso no encontrado"

### ✅ Caso 2: Con Datos Nuevos

1. Procesa lecturas en el backend
2. Haz clic en "Preparar Cálculo"
3. Espera ~16 segundos
4. Debe detectar los datos automáticamente
5. Mostrar: "¡Cálculos completados! X nuevas lecturas"

### ✅ Caso 3: Datos Ya Procesados

1. Ya hay cálculos procesados del periodo
2. Haz clic en "Preparar Cálculo"
3. Espera ~24 segundos (3 intentos)
4. Debe mostrar: "Datos disponibles - X cálculos ya procesados"

### ✅ Caso 4: Verificación Inicial

1. Entra al componente con datos ya procesados
2. Debe detectarlos automáticamente SIN toasts de error
3. Botón "Ver Cálculo" se habilita automáticamente

## Beneficios

✅ **97% más rápido** cuando no hay datos  
✅ **No más loops infinitos** - se detiene en 1 intento si no hay datos  
✅ **No más toasts molestos** - experiencia limpia  
✅ **Menos carga al servidor** - de 150 a 1 petición en caso sin datos  
✅ **UX mejorada** - feedback claro e inmediato  
✅ **Código más simple** - lógica directa y fácil de entender  
✅ **Recursos optimizados** - no espera 10 minutos innecesariamente

## Principio de Diseño

> **"Si no hay datos después de la primera verificación, detener inmediatamente. No seguir esperando que aparezcan mágicamente."**

Este enfoque es:

- ✅ Más simple
- ✅ Más rápido
- ✅ Más eficiente
- ✅ Mejor UX
- ✅ Fácil de entender y mantener

## Notas Técnicas

- El **delay inicial** (12 segundos) da tiempo al backend para iniciar el proceso
- La **primera verificación** determina si hay datos o no
- Si no hay datos en el intento 1: **parar inmediatamente**
- Si hay datos pero sin cambios: **verificar 3 veces** para confirmar (~12 segundos adicionales)
- En caso de **error**: siempre detener el polling para evitar loops

### ⚠️ Consideración Especial: Tarifa BT4-3

**Importante:** Los cargos asociados a la tarifa **BT4-3** tienden a demorar unos segundos adicionales en procesarse en el backend debido a su complejidad de cálculo. Esto es normal y esperado.

**Impacto:**

- El delay inicial de 12 segundos considera este tiempo adicional
- Los usuarios verán una nota informativa durante el procesamiento
- Los datos se mostrarán automáticamente una vez completado el procesamiento de todos los cargos

**Mensajes al usuario:**

- 💡 "Si hay contratos con tarifa BT4-3, el procesamiento puede demorar unos segundos adicionales."
- ℹ️ "Los cargos de tarifa BT4-3 pueden demorar unos segundos adicionales en procesarse, pero se mostrarán automáticamente una vez completados."

## Configuración Actual

| Parámetro                         | Valor      | Propósito                                                    |
| --------------------------------- | ---------- | ------------------------------------------------------------ |
| Delay inicial (sin datos previos) | 12 seg     | Dar tiempo al backend (incluye tiempo extra para BT4-3)      |
| Delay inicial (con datos previos) | 8 seg      | Verificación rápida                                          |
| Intervalo de polling              | 4 seg      | Balance entre rapidez y carga                                |
| Threshold sin cambios             | 3 intentos | ~12 segundos de confirmación                                 |
| Máximo intentos                   | 150        | Fallback de seguridad (ya no se debería alcanzar)            |
| Tiempo extra BT4-3                | 3-5 seg    | Tiempo adicional estimado para procesamiento de cargos BT4-3 |

## Código de Ejemplo para Debugging

Si necesitas verificar el comportamiento:

```typescript
console.log('🔍 Verificación:', {
  intento: intentoActual,
  registrosActuales,
  registrosIniciales: registrosInicialesRef.current,
  hayCambio: registrosActuales > registrosInicialesRef.current,
  decision: resultado.detenerPolling ? 'DETENER' : 'CONTINUAR',
  datosListos: resultado.datosListos
});
```
