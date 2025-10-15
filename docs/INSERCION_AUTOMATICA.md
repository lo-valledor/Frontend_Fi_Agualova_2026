# Guía de Inserción Automática de Lecturas

## 📋 Descripción General

La **Inserción Automática de Lecturas** es una funcionalidad diseñada para acelerar el proceso de carga de lecturas importadas, validando automáticamente y guardando solo aquellas que cumplen con criterios estrictos de calidad y seguridad.

## 🎯 Objetivo

Permitir la inserción masiva y segura de lecturas importadas que sean **BT1 o BT2**, garantizando que:

- Los cálculos de consumo sean correctos
- No existan anomalías en los datos
- Se prevengan errores de truncamiento decimal
- Se validen rollovers de medidores

## 🔒 Criterios de Validación

### ✅ Lecturas que Califican para Inserción Automática

Una lectura será **auto-insertable** si cumple TODAS estas condiciones:

1. **Tarifa válida**: Solo BT1 o BT2
2. **Datos importados**: Tiene valor de energía activa importado (LMC_EnergiaActiva)
3. **Lectura anterior válida**: Existe lectura anterior válida (LM_ValorUltimaLectura)
4. **Lecturas diferentes**: La lectura actual es diferente a la anterior (consumo ≠ 0)
5. **Sin anomalías detectadas**:
   - ❌ No tiene patrón de 9s consecutivos (4 o más)
   - ❌ No tiene consumo excesivo (>2000 kWh)
   - ❌ No tiene consumo negativo inválido
   - ❌ No tiene variación extrema vs consumo anterior (>3x o <0.3x)
6. **No guardada previamente**: No tiene fecha de lectura registrada

### ⚠️ Lecturas que Requieren Revisión Manual

Las lecturas que NO califican para inserción automática se marcarán como **Requieren Revisión** con razones específicas:

| Razón                    | Descripción                          | Severidad |
| ------------------------ | ------------------------------------ | --------- |
| **Solo BT1 y BT2**       | Tarifa no permitida (BT3, BT4, etc.) | Error     |
| **Sin datos importados** | Falta energía activa importada       | Error     |
| **Sin lectura anterior** | No existe valor de referencia        | Error     |
| **Consumo 0**            | Lectura actual = lectura anterior    | Warning   |
| **Decimal truncado**     | Patrón de 9999+ kWh detectado        | Error     |
| **Rollover sospechoso**  | Rollover de medidor incorrecto       | Error     |
| **Consumo excesivo**     | >3x del consumo anterior o >2000 kWh | Error     |
| **Consumo muy bajo**     | <0.3x del consumo anterior           | Error     |
| **Ya guardada**          | Lectura con fecha de guardado previa | Error     |

## 🚀 Cómo Usar la Función

### Paso 1: Importar Lecturas

1. Navegar a **Monitor de Nichos**
2. Importar archivo con lecturas (CSV o Excel)
3. Las lecturas se cargarán en la tabla

### Paso 2: Activar Inserción Automática

1. Click en el botón **"Auto-Insertar"** (icono de rayo ⚡)
   - Ubicado junto al botón "Actualizar"
   - Color ámbar para diferenciarlo

### Paso 3: Revisar Análisis

El sistema mostrará un diálogo con:

**Resumen General:**

- Total de medidores
- Cantidad auto-insertable (verde)
- Cantidad que requiere revisión (ámbar)

**Tabla de Auto-insertables:**

- N° Serie del medidor
- Tarifa (BT1/BT2)
- Lectura anterior
- Lectura nueva importada
- Consumo calculado
- Estado de validación (✓ Válido)

**Tabla de Requieren Revisión:**

- N° Serie del medidor
- Tarifa
- **Razones específicas** de por qué no califica

### Paso 4: Confirmar Inserción

1. Revisar el resumen y tablas
2. Si está conforme, click en **"Insertar X Lecturas"**
3. El sistema procesará todas las lecturas auto-insertables

### Paso 5: Ver Resultados

Al finalizar, verá:

**Resumen de Resultados:**

- ✅ **Exitosas**: Lecturas insertadas correctamente
- ❌ **Fallidas**: Lecturas que generaron error al guardar
- ⏸️ **Omitidas**: Lecturas que no se procesaron

**Tabla de Detalles:**

- N° Serie
- Estado (Exitosa/Fallida)
- Mensaje descriptivo

## 🔍 Detección de Anomalías

### 1. Decimal Truncado (Patrón de 9s)

**Problema:**

```
Lectura anterior: 22
Lectura importada: 22,503 → truncada a 22
Consumo calculado: 22 - 22 = 0 (pero debería ser 0.503)
```

**Detección:**

- Busca 4 o más 9s consecutivos en el consumo
- Ejemplo: consumo = 999999 kWh → Anomalía detectada

**Acción:**

- ❌ No se auto-inserta
- 💡 Se marca para revisión manual

### 2. Rollover Incorrecto

**Problema:**

```
Lectura anterior: 99800
Lectura nueva: 100 (medidor dio la vuelta)
Consumo: 100 - 99800 = -99700 (negativo)
```

**Detección:**

- Calcula consumo con rollover: (99999 + 1 - 99800 + 100)
- Valida si consumo rollover > 80% de capacidad máxima

**Acción:**

- ❌ No se auto-inserta si es sospechoso
- ⚠️ Se permite si es rollover válido (con advertencia)

### 3. Consumo Excesivo

**Detección:**

- Consumo > 3x del consumo anterior
- O consumo > 2000 kWh absoluto

**Acción:**

- ❌ No se auto-inserta
- 💡 Requiere verificación manual

### 4. Consumo Muy Bajo

**Detección:**

- Consumo < 0.3x del consumo anterior
- Y consumo > 100 kWh

**Acción:**

- ❌ No se auto-inserta
- 💡 Requiere verificación manual

## 📊 Ejemplos Prácticos

### Ejemplo 1: Caso Exitoso ✅

```
Medidor: BT1
Lectura anterior: 10500 kWh
Lectura nueva: 10850 kWh
Consumo: 350 kWh
Consumo mes anterior: 320 kWh
Validación: Sin anomalías, ratio 1.09x ✓
```

**Resultado:** ✅ Auto-insertable

### Ejemplo 2: Decimal Truncado ❌

```
Medidor: BT2
Lectura anterior: 22 kWh
Lectura nueva (importada): 22,503 → truncada a 22
Consumo: 0 kWh
Consumo mes anterior: 450 kWh
Validación: Consumo 0, probable truncamiento
```

**Resultado:** ❌ Requiere revisión manual
**Razón:** "Lectura actual igual a la anterior (consumo 0)"

### Ejemplo 3: Consumo Excesivo ❌

```
Medidor: BT1
Lectura anterior: 15000 kWh
Lectura nueva: 16500 kWh
Consumo: 1500 kWh
Consumo mes anterior: 350 kWh
Validación: Ratio 4.29x, excesivo
```

**Resultado:** ❌ Requiere revisión manual
**Razón:** "Consumo 4.3x mayor al anterior (1500 vs 350 kWh)"

### Ejemplo 4: Tarifa No Permitida ℹ️

```
Medidor: BT4-3
Lectura anterior: 5000 kWh
Lectura nueva: 5420 kWh
Consumo: 420 kWh
Validación: Tarifa no es BT1 ni BT2
```

**Resultado:** ℹ️ Requiere revisión manual
**Razón:** "Solo BT1 y BT2 califican para inserción automática"

## 🛡️ Seguridad y Prevención de Errores

### Validaciones Pre-Inserción

✅ **Verificación de datos completos**

- Valida existencia de periodo
- Valida ID de lectura válido
- Valida datos de energía activa

✅ **Cálculo correcto de consumo**

- Usa valores exactos sin truncamiento
- Maneja rollovers de medidor
- Detecta inconsistencias

✅ **Prevención de duplicados**

- No inserta si ya existe fecha de lectura
- Valida estado del medidor

### Validaciones Post-Inserción

✅ **Confirmación de guardado**

- Verifica respuesta del servidor
- Captura errores específicos
- Registra resultados individuales

✅ **Refresco automático**

- Actualiza tabla al finalizar
- Muestra estado "Guardado" en columna

## 💡 Mejores Prácticas

### Para el Usuario

1. **Revisar siempre el resumen** antes de confirmar
2. **Atender las advertencias** en lecturas con rollover
3. **Verificar manualmente** las que requieren revisión
4. **Exportar reportes** de lecturas procesadas

### Para Datos de Calidad

1. **Importar archivos validados** previamente
2. **Usar formato correcto** de decimales (22.503 no 22,503)
3. **Verificar coherencia** de lecturas antes de importar
4. **Mantener actualizado** el consumo del mes anterior

## 🔧 Consideraciones Técnicas

### Endpoint Utilizado

```
POST /lecturas
Body: {
  lectura_id: number,
  periodo: string,
  energia_activa: number,
  observaciones: "Inserción automática desde importación"
}
```

### Campos Validados

- `LMC_EnergiaActiva`: Energía activa importada
- `LM_ValorUltimaLectura`: Última lectura registrada
- `LM_ConsumoMesAnterior`: Consumo del mes anterior para comparación
- `LM_FechaLectura`: Fecha de guardado (debe estar null)
- `tarifa`: Tipo de tarifa del medidor

### Limitaciones Actuales

- ⚠️ Solo soporta **BT1 y BT2**
- ⚠️ No procesa **energía reactiva** automáticamente
- ⚠️ No maneja **demandas** (BT4-3)
- ⚠️ Requiere **lectura anterior válida**

## 📈 Beneficios

✅ **Ahorro de tiempo**: Inserta múltiples lecturas en segundos
✅ **Mayor precisión**: Validaciones automáticas previenen errores
✅ **Trazabilidad**: Registro detallado de cada operación
✅ **Transparencia**: Usuario ve exactamente qué se insertará
✅ **Seguridad**: Validaciones estrictas protegen integridad de datos

## 🚨 Solución de Problemas

### Problema: "No hay lecturas para inserción automática"

**Causas posibles:**

- Todas las tarifas son BT3/BT4
- Todas las lecturas tienen anomalías
- No hay lecturas importadas

**Solución:**

1. Verificar que hay lecturas importadas en la tabla
2. Revisar la tabla "Requieren Revisión" para ver razones
3. Corregir datos en origen y re-importar

### Problema: "Muchas lecturas fallan al insertarse"

**Causas posibles:**

- Problema de conexión con servidor
- Periodo incorrecto
- Datos ya insertados

**Solución:**

1. Verificar conexión a internet
2. Confirmar periodo seleccionado
3. Revisar tabla de detalles para mensajes específicos

### Problema: "Consumos con muchos 9s no se detectan"

**Causa:**

- Umbral de detección es 4+ dígitos 9 consecutivos

**Solución:**

1. Revisar manualmente lecturas sospechosas
2. Ajustar formato de importación para preservar decimales

## 📝 Notas de Desarrollo

### Archivos Involucrados

- `insercionAutomaticaService.ts`: Lógica de validación y procesamiento
- `insercion-automatica-dialog.tsx`: Componente de interfaz
- `monitor-nichos.tsx`: Integración del botón y diálogo

### Funciones Principales

- `validarLecturaParaInsercionAutomatica()`: Valida una lectura individual
- `detectarConsumoAnomalo()`: Detecta anomalías en consumo
- `analizarMedidoresParaInsercion()`: Clasifica todas las lecturas
- `procesarInsercionAutomatica()`: Ejecuta inserción en lote

### Extensibilidad Futura

- ✨ Agregar soporte para BT3/BT4
- ✨ Validar energía reactiva
- ✨ Incluir validación de demandas
- ✨ Exportar reporte de resultados en PDF/Excel
- ✨ Configurar umbrales de validación personalizados
