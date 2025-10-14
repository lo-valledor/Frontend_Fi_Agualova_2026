# Inserción Automática de Lecturas - Documentación Técnica

## 🏗️ Arquitectura

### Componentes

```
┌─────────────────────────────────────────────┐
│         MonitorNichos Component             │
│  - Botón "Auto-Insertar"                    │
│  - Estado isInsercionAutomaticaOpen         │
└──────────────┬──────────────────────────────┘
               │
               │ onClick
               ▼
┌─────────────────────────────────────────────┐
│   InsercionAutomaticaDialog Component      │
│  - Fase: analisis → confirmacion →         │
│          procesando → resultados            │
└──────────────┬──────────────────────────────┘
               │
               │ uses
               ▼
┌─────────────────────────────────────────────┐
│    insercionAutomaticaService.ts           │
│  - validarLecturaParaInsercionAutomatica() │
│  - detectarConsumoAnomalo()                 │
│  - analizarMedidoresParaInsercion()         │
│  - procesarInsercionAutomatica()            │
└──────────────┬──────────────────────────────┘
               │
               │ POST /lecturas
               ▼
┌─────────────────────────────────────────────┐
│            Backend API                      │
│  POST /lecturas                             │
│  - Guarda lectura en base de datos          │
└─────────────────────────────────────────────┘
```

## 📦 Estructura de Archivos

```
app/
├── services/
│   └── insercionAutomaticaService.ts      # Lógica de negocio
├── components/
│   └── monitor/
│       └── monitor-lecturas/
│           ├── monitor-nichos.tsx          # Integración del botón
│           └── insercion-automatica-dialog.tsx  # UI del diálogo
└── types/
    └── monitor.ts                          # Tipos TypeScript
```

## 🔧 API del Servicio

### `validarLecturaParaInsercionAutomatica()`

Valida si una lectura individual califica para inserción automática.

```typescript
function validarLecturaParaInsercionAutomatica(
  medidor: MedidorNichoItem
): ValidacionResultado

// Retorna:
{
  valido: boolean;
  razones: string[];
  severidad: 'ok' | 'warning' | 'error';
}
```

**Validaciones realizadas:**

1. ✅ Tarifa es BT1 o BT2
2. ✅ Tiene energía activa importada (no null, no negativa, **no cero**)
3. ✅ Tiene lectura anterior válida
4. ✅ Lecturas son diferentes (consumo ≠ 0)
5. ✅ **C8 coincide EXACTAMENTE con (8 - Ant)** ← Nueva validación crítica
6. ✅ Sin anomalías en consumo
7. ✅ No guardada previamente

### `detectarConsumoAnomalo()`

Detecta patrones anómalos en el consumo calculado.

```typescript
function detectarConsumoAnomalo(
  lecturaActual: number,
  lecturaAnterior: number,
  consumoAnterior: number | null,
  capacidadMedidor: number = 99999
): { anomalo: boolean; tipo?: string; razon?: string };
```

**Anomalías detectadas:**

- `decimal_truncado`: 4+ dígitos 9 consecutivos
- `rollover_incorrecto`: Rollover > 80% capacidad
- `excesivo`: Consumo > 3x anterior o > 2000 kWh
- `muy_bajo`: Consumo < 0.3x anterior (si > 100 kWh)

### `analizarMedidoresParaInsercion()`

Clasifica todos los medidores en auto-insertables vs revisión manual.

```typescript
function analizarMedidoresParaInsercion(medidores: MedidorNichoItem[]): {
  autoInsertables: LecturaParaInsertar[];
  requierenRevision: LecturaParaInsertar[];
  resumen: {
    total: number;
    autoInsertables: number;
    requierenRevision: number;
  };
};
```

### `procesarInsercionAutomatica()`

Procesa la inserción en lote de las lecturas validadas.

```typescript
async function procesarInsercionAutomatica(
  lecturas: LecturaParaInsertar[],
  periodo: string
): Promise<ResultadoInsercion> {
  // Retorna:
  exitosas: number;
  fallidas: number;
  omitidas: number;
  detalles: Array<{
    id: number;
    nSerie: string;
    estado: 'exitosa' | 'fallida' | 'omitida';
    mensaje: string;
  }>;
}
```

## 🎨 Componentes UI

### `InsercionAutomaticaDialog`

**Props:**

```typescript
interface InsercionAutomaticaDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  medidores: MedidorNichoItem[];
  periodo: string;
  onSuccess?: () => void;
}
```

**Fases del flujo:**

1. `analisis`: Análisis inicial automático
2. `confirmacion`: Mostrar resumen y solicitar confirmación
3. `procesando`: Ejecutar inserción con barra de progreso
4. `resultados`: Mostrar resultados detallados

**Estados internos:**

```typescript
const [fase, setFase] = useState<
  'analisis' | 'confirmacion' | 'procesando' | 'resultados'
>('analisis');
const [autoInsertables, setAutoInsertables] = useState<LecturaParaInsertar[]>(
  []
);
const [requierenRevision, setRequierenRevision] = useState<
  LecturaParaInsertar[]
>([]);
const [resultado, setResultado] = useState<ResultadoInsercion | null>(null);
const [progreso, setProgreso] = useState(0);
```

## 🔒 Criterios de Validación

### Tabla de Decisión

| Condición                  | Auto-insertable | Razón                                      |
| -------------------------- | --------------- | ------------------------------------------ |
| Tarifa BT1/BT2             | ✅              | Solo tarifas simples                       |
| Tarifa BT3/BT4             | ❌              | Requiere validación de reactiva/demandas   |
| Lectura importada válida   | ✅              | Tiene datos para guardar                   |
| Sin lectura importada      | ❌              | No hay datos                               |
| **Lectura actual = 0**     | ❌              | **No es un dato válido - requiere revisión** |
| Consumo 0 kWh              | ❌              | Lectura igual a anterior                   |
| **C8 ≠ (8 - Ant)**         | ❌              | **Inconsistencia menor - requiere revisión manual** |
| Consumo 1-1999 kWh         | ✅              | Rango normal                               |
| Consumo > 2000 kWh         | ❌              | Excesivo absoluto                          |
| Patrón 9999+ kWh           | ❌              | Probable decimal truncado                  |
| Rollover válido            | ⚠️              | Permitido con advertencia                  |
| Rollover inválido          | ❌              | Cálculo incorrecto                         |
| Ya guardada                | ❌              | Prevención de duplicados                   |

## 🧪 Casos de Prueba

### Test 1: Lectura Normal BT1

```typescript
const medidor: MedidorNichoItem = {
  tarifa: 'BT1',
  LMC_EnergiaActiva: 10850,
  LM_ValorUltimaLectura: 10500,
  LM_ConsumoMesAnterior: '320',
  LM_FechaLectura: null
  // ... otros campos
};

const resultado = validarLecturaParaInsercionAutomatica(medidor);
// Esperado: resultado.valido === true
// Consumo: 350 kWh (ratio 1.09x vs anterior)
```

### Test 2: Decimal Truncado

```typescript
const medidor: MedidorNichoItem = {
  tarifa: 'BT2',
  LMC_EnergiaActiva: 22, // Truncado de 22.503
  LM_ValorUltimaLectura: 22,
  LM_ConsumoMesAnterior: '450',
  LM_FechaLectura: null
};

const resultado = validarLecturaParaInsercionAutomatica(medidor);
// Esperado: resultado.valido === false
// Razón: "Lectura actual igual a la anterior (consumo 0)"
```

### Test 3: Consumo Excesivo

```typescript
const medidor: MedidorNichoItem = {
  tarifa: 'BT1',
  LMC_EnergiaActiva: 16500,
  LM_ValorUltimaLectura: 15000,
  LM_ConsumoMesAnterior: '350',
  LM_FechaLectura: null
};

const resultado = validarLecturaParaInsercionAutomatica(medidor);
// Esperado: resultado.valido === false
// Razón: "Consumo 4.3x mayor al anterior (1500 vs 350 kWh)"
```

### Test 4: Tarifa No Permitida

```typescript
const medidor: MedidorNichoItem = {
  tarifa: 'BT4-3',
  LMC_EnergiaActiva: 5420,
  LM_ValorUltimaLectura: 5000,
  LM_ConsumoMesAnterior: '400',
  LM_FechaLectura: null
};

const resultado = validarLecturaParaInsercionAutomatica(medidor);
// Esperado: resultado.valido === false
// Razón: "Solo BT1 y BT2 califican para inserción automática"
```

### Test 5: Lectura Actual es Cero (Nueva Validación)

```typescript
const medidor: MedidorNichoItem = {
  tarifa: 'BT1',
  LMC_EnergiaActiva: 0, // ❌ Lectura actual es 0
  LM_ValorUltimaLectura: 9427,
  LM_ConsumoMesAnterior: '991',
  LM_FechaLectura: null
};

const resultado = validarLecturaParaInsercionAutomatica(medidor);
// Esperado: resultado.valido === false
// Razón: "Lectura actual es 0 - requiere revisión manual"
```

### Test 6: Inconsistencia C8 vs (8 - Ant) (Nueva Validación)

```typescript
const medidor: MedidorNichoItem = {
  tarifa: 'BT1',
  LMC_EnergiaActiva: 336, // 8 (lectura actual)
  LM_ValorUltimaLectura: 307, // Ant (lectura anterior)
  LMC_ConsumoEnergiaActiva: 28, // C8 (consumo importado) ❌
  LM_ConsumoMesAnterior: '38',
  LM_FechaLectura: null
};

const resultado = validarLecturaParaInsercionAutomatica(medidor);
// Esperado: resultado.valido === false
// Razón: "Inconsistencia detectada: C8 (28) ≠ 8-Ant (29) - requiere validación manual"
// Nota: 336 - 307 = 29, pero C8 muestra 28
```

### Test 7: Validación Exitosa con Datos Consistentes

```typescript
const medidor: MedidorNichoItem = {
  tarifa: 'BT1',
  LMC_EnergiaActiva: 874, // 8 (lectura actual)
  LM_ValorUltimaLectura: 783, // Ant (lectura anterior)
  LMC_ConsumoEnergiaActiva: 91, // C8 (consumo importado) ✅
  LM_ConsumoMesAnterior: '99',
  LM_FechaLectura: null // ✅ No guardada previamente
};

const resultado = validarLecturaParaInsercionAutomatica(medidor);
// Esperado: resultado.valido === true
// Razón: "Consumo válido: 91 kWh"
// Nota: 874 - 783 = 91, coincide exactamente con C8
```

## 📊 Métricas de Detección

### Umbrales Configurados

```typescript
const UMBRALES = {
  PATRON_9S: /9{4,}/, // 4+ dígitos 9 consecutivos
  CONSUMO_EXCESIVO_ABSOLUTO: 2000, // kWh
  CONSUMO_EXCESIVO_RATIO: 3, // 3x consumo anterior
  CONSUMO_BAJO_RATIO: 0.3, // 0.3x consumo anterior
  CONSUMO_BAJO_MIN: 100, // kWh mínimo para validar ratio bajo
  ROLLOVER_MAX_PERCENT: 0.8, // 80% de capacidad
  CAPACIDAD_MEDIDOR: 99999 // Capacidad estándar
};
```

## 🔄 Flujo de Ejecución

### Diagrama de Secuencia

```
Usuario → Botón "Auto-Insertar"
           ↓
        Diálogo se abre
           ↓
    analizarMedidoresParaInsercion()
           ↓
    ┌──────────────────────┐
    │ Para cada medidor:   │
    │ 1. Validar tarifa    │
    │ 2. Validar datos     │
    │ 3. Detectar anomalías│
    │ 4. Clasificar        │
    └──────────────────────┘
           ↓
    Mostrar resumen en UI
           ↓
    Usuario confirma
           ↓
    procesarInsercionAutomatica()
           ↓
    ┌──────────────────────┐
    │ Para cada lectura:   │
    │ 1. POST /lecturas    │
    │ 2. Capturar respuesta│
    │ 3. Registrar resultado
    └──────────────────────┘
           ↓
    Mostrar resultados
           ↓
    Refrescar tabla (onSuccess)
```

## 🛠️ Personalización

### Ajustar Umbrales de Validación

```typescript
// En insercionAutomaticaService.ts
function detectarConsumoAnomalo(
  lecturaActual: number,
  lecturaAnterior: number,
  consumoAnterior: number | null,
  capacidadMedidor: number = 99999 // ← Cambiar aquí para medidores especiales
): { anomalo: boolean; tipo?: string; razon?: string } {
  // ...

  // Ajustar ratio de consumo excesivo
  if (ratio > 3) {
    // ← Cambiar a 5 para ser más permisivo
    return {
      anomalo: true,
      tipo: 'excesivo',
      razon: `Consumo ${ratio.toFixed(1)}x mayor al anterior`
    };
  }

  // Ajustar consumo absoluto máximo
  if (consumo > 2000) {
    // ← Cambiar a 3000 para medidores industriales
    return {
      anomalo: true,
      tipo: 'excesivo_absoluto',
      razon: `Consumo muy alto (${consumo} kWh)`
    };
  }
}
```

### Agregar Nuevas Validaciones

```typescript
// En validarLecturaParaInsercionAutomatica()

// Ejemplo: Validar que el medidor esté activo
if (medidor.Estado !== 1) {
  razones.push('Medidor no está activo');
  severidad = 'error';
  return { valido: false, razones, severidad };
}

// Ejemplo: Validar constante multiplicadora
if (medidor.ME_ConstanteMultiplicar !== 1) {
  razones.push('Medidor con constante multiplicadora requiere revisión');
  severidad = 'warning';
  return { valido: false, razones, severidad };
}
```

## 🐛 Debugging

### Logs Útiles

```typescript
// En procesarInsercionAutomatica()
console.log('🔄 Procesando inserción automática:', {
  totalLecturas: lecturas.length,
  periodo
});

// En detectarConsumoAnomalo()
console.log('🔍 Detectando anomalías:', {
  lecturaActual,
  lecturaAnterior,
  consumo,
  consumoAnterior,
  anomalia: resultado
});
```

### Errores Comunes

| Error                                         | Causa                    | Solución                            |
| --------------------------------------------- | ------------------------ | ----------------------------------- |
| `Property 'LMA_EnergiaActiva' does not exist` | Campo incorrecto en tipo | Usar `LM_ValorUltimaLectura`        |
| `Cannot read property 'tarifa' of undefined`  | Medidor no tiene tarifa  | Validar existencia antes de acceder |
| `Network error on POST /lecturas`             | Backend no disponible    | Verificar conexión y endpoint       |
| `Unauthorized`                                | Token expirado           | Refrescar autenticación             |

## 📚 Referencias

- **Tipos TypeScript**: `app/types/monitor.ts`
- **API Backend**: Documentación de endpoints en Swagger
- **Guía de Usuario**: `docs/INSERCION_AUTOMATICA.md`
- **Detección de Anomalías**: Basado en `bt1-bt2-form.tsx`

## 🚀 Mejoras Futuras

### Corto Plazo

- [ ] Exportar reporte de resultados en PDF
- [ ] Configurar umbrales desde UI
- [ ] Agregar preview de datos antes de confirmar

### Mediano Plazo

- [ ] Soporte para BT3/BT4 con validación de reactiva
- [ ] Validación de demandas automática
- [ ] Integración con sistema de notificaciones

### Largo Plazo

- [ ] Machine Learning para detección de anomalías
- [ ] Predicción de consumos futuros
- [ ] Dashboard de calidad de datos importados

## 📞 Contacto y Soporte

Para preguntas técnicas o reportar bugs:

- Revisar esta documentación primero
- Consultar código fuente con comentarios inline
- Revisar tests unitarios (cuando estén disponibles)
