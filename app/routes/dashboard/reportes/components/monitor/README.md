# Monitor de Lecturas - Documentación Completa

Sistema integral para el monitoreo, gestión e ingreso de lecturas de medidores de energía con interfaz de usuario reactiva y validaciones avanzadas.

## Tabla de Contenidos

- [Arquitectura](#arquitectura)
- [Componentes Principales](#componentes-principales)
- [Servicio API](#servicio-api)
- [Flujo de Datos](#flujo-de-datos)
- [Ejemplos de Uso](#ejemplos-de-uso)
- [Edge Cases y Manejo de Errores](#edge-cases-y-manejo-de-errores)
- [Validaciones](#validaciones)
- [Performance](#performance)

## Arquitectura

```
┌─────────────────────────────────────────────────────────┐
│          Page Route (monitor-lecturas.tsx)              │
├─────────────────────────────────────────────────────────┤
│  - Lazy loads main component (183 KB optimization)      │
│  - Fetches basic data via clientLoader                  │
│  - Handles hydration with skeleton                      │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│    MonitorLecturasComponent (Main Container)            │
├─────────────────────────────────────────────────────────┤
│  - Filter Management (sector, period, dates)            │
│  - Search Orchestration                                 │
│  - State Management (9 local states)                    │
│  - Keyboard Shortcuts (Ctrl+K, Ctrl+Enter, Esc)       │
│  - Interactive Tour Guide (driver.js)                  │
└────────────┬──────────────────────────┬─────────────────┘
             │                          │
    ┌────────▼────────────┐   ┌────────▼──────────┐
    │ Control Panel       │   │ Results Section   │
    │ (Filters & Search)  │   │ (Suspense)        │
    └────────┬────────────┘   └────────┬──────────┘
             │                         │
    ┌────────▼──────────────────────────▼──────────┐
    │  ResultadosBusqueda Component                │
    ├───────────────────────────────────────────────┤
    │  - Fetches filtered meter readings           │
    │  - Displays results by nicho (niche)         │
    │  - Calculates statistics                     │
    └────────┬──────────────────────────┬──────────┘
             │                          │
    ┌────────▼────────────────┐ ┌──────▼────────┐
    │ MonitorNichos           │ │ DetallesMedidor
    │ (Meter Details List)    │ │ (Reading Info)
    ├────────────────────────┤ ├────────────────┤
    │ - Virtualized Table    │ │ - 4 Stages    │
    │ - Search within nicho  │ │ - Edit Forms  │
    │ - Auto-validation      │ │ - Consumption │
    │ - Edit Dialog          │ │   Analysis    │
    └────────┬────────────────┘ └──────┬────────┘
             │                         │
    ┌────────▼──────────────────────────▼──────────┐
    │  EditarMedidores Component                   │
    ├───────────────────────────────────────────────┤
    │  - BT1/BT2 Form (basic readings)             │
    │  - BT4-3 Form (reopening procedure)          │
    │  - Validation & Error Display                │
    └───────────────────────────────────────────────┘
```

## Componentes Principales

### 1. MonitorLecturasComponent
**Ubicación:** `app/components/monitor/monitor-lecturas-component.tsx`

Componente principal que contiene toda la lógica de filtrado y búsqueda.

#### Propiedades
```typescript
interface MonitorLecturasComponentProps {
  periodos: Periodo[];              // Períodos de facturación disponibles
  sectores: Sector[];               // Sectores disponibles
  claves: Clave[];                  // Códigos de lectura
  activePeriodoId: number | null;   // ID del período activo
  error: Error | null;              // Error de carga
}
```

#### Estados Principales
```typescript
// Filtros de búsqueda
const [selectedSector, setSelectedSector] = useState<Sector | null>(null);
const [selectedPeriodo, setSelectedPeriodo] = useState<Periodo | null>(null);
const [selectedClave, setSelectedClave] = useState<Clave | null>(null);
const [meterSerial, setMeterSerial] = useState<string>('');
const [selectedStatusFilter, setSelectedStatusFilter] = useState<number>(0);

// Rangos de fechas
const [fechaInicio, setFechaInicio] = useState<string>('');
const [fechaFin, setFechaFin] = useState<string>('');

// Estados de UI
const [isSearchActive, setIsSearchActive] = useState(false);
const [isFiltersOpen, setIsFiltersOpen] = useState(false);
```

#### Funciones Principales

##### `handleSearch()`
Ejecuta la búsqueda con validación de parámetros requeridos.
```typescript
const handleSearch = () => {
  // Valida que sector y período estén seleccionados
  const validation = validateSearchParams(selectedSector, selectedPeriodo);

  if (!validation.isValid) {
    toast.error(validation.error);
    return;
  }

  // Activa búsqueda y colapsa filtros
  setIsSearchActive(true);
  setSearchTrigger(prev => prev + 1);
  setIsFiltersOpen(false);
};
```

##### `handleLimpiezaFiltros()`
Limpia todos los filtros y restaura valores por defecto.
```typescript
const handleLimpiezaFiltros = () => {
  // Reinicia todos los estados
  setIsSearchActive(false);
  setSelectedSector(null);
  setSelectedPeriodo(findActivePeriod(periodos));
  setSelectedClave(null);
  setMeterSerial('');
  setSelectedStatusFilter(0);

  // Restaura fechas por defecto
  const defaultDates = getDefaultDates(selectedPeriodo);
  setFechaInicio(defaultDates.fechaInicio);
  setFechaFin(defaultDates.fechaFin);

  // Abre panel de filtros
  setIsFiltersOpen(true);
};
```

##### `startTour()`
Inicia tour interactivo guiado con driver.js.
```typescript
const startTour = () => {
  const driverjs = driver({
    showProgress: true,
    smoothScroll: true,
    animate: true,
    allowClose: true
  });

  driverjs.setSteps(tourSteps);
  driverjs.drive();
};
```

### 2. ResultadosBusqueda Component
**Ubicación:** `app/components/monitor/monitor-lecturas/resultados-busqueda.tsx`

Gestiona la obtención y visualización de resultados de búsqueda.

#### Responsabilidades
- Fetch de lecturas basado en filtros
- Cálculo de estadísticas por nicho
- Renderizado de resultados agrupados
- Integración con componentes de detalles

### 3. MonitorNichos Component
**Ubicación:** `app/components/monitor/monitor-lecturas/monitor-nichos.tsx`

Tabla virtualizada de medidores dentro de un nicho específico.

#### Características
- **Virtualización:** Renderiza solo items visibles (rendimiento optimizado)
- **Búsqueda Debounced:** Filtra por N° Serie, Ubicación, Local, Tarifa
- **Auto-validación:** Inserción automática de lecturas importadas (BT1/BT2)
- **Edición Inline:** Abre diálogo para editar medidor
- **Resaltado Temporal:** Indica último elemento editado (4.2s)

#### Props
```typescript
interface MonitorNichosProps {
  periodo: string;           // ID del período
  nicho: string;            // Identificador del nicho
  onSuccess?: () => void;   // Callback de actualización exitosa
}
```

#### Estados de Búsqueda
```typescript
const [searchTerm, setSearchTerm] = useState('');
const debouncedSearch = useDebounce(searchTerm, 300); // 300ms debounce
const [results, setResults] = useState<MedidorNichoItem[]>([]);
const [filteredResults, useMemo(() => {
  // Filtra resultados en base a searchTerm
}, [results, debouncedSearch]);
```

### 4. DetallesMedidor Component
**Ubicación:** `app/components/monitor/monitor-lecturas/detalles-medidor.tsx`

Información detallada de un medidor en 4 etapas.

#### Etapas de Datos
```typescript
type EtapaNumber = 1 | 2 | 3 | 4;

// Etapa 1: Información del Medidor
type EtapaUno = { ME_NSerie, Ubicacion, Tarifa, ... };

// Etapa 2: Lectura Actual
type EtapaDos = { LecturaNormal, FechaLectura, ... };

// Etapa 3: Claves de Lectura
type EtapaTres = { IdClave, DescripcionClave, ... };

// Etapa 4: Análisis de Consumo
type EtapaCuatro = { ConsumoPromedio, Variacion, ... };
```

#### Carga Concurrente
```typescript
const stageNumbers: EtapaNumber[] = [1, 2, 3, 4];
const results = await Promise.allSettled(
  stageNumbers.map(etapa => api.get('/datos-basicos-medidor', { params }))
);
```

## Servicio API

### MonitorService
**Ubicación:** `app/services/monitorService.ts`

Gestiona toda la comunicación con el backend para datos de monitoreo.

```typescript
class MonitorService {
  // Fetch de todos los datos básicos (paralelo)
  async getBasicData(): Promise<MonitorServiceResponse<MonitorBasicData>>

  // Fetch de períodos y sectores (sin claves)
  async getPeriodosAndSectores(): Promise<MonitorServiceResponse<...>>

  // Fetch individual de períodos
  async getPeriodos(): Promise<MonitorServiceResponse<Periodo[]>>

  // Fetch individual de sectores
  async getSectores(): Promise<MonitorServiceResponse<Sector[]>>

  // Fetch individual de claves
  async getClaves(): Promise<MonitorServiceResponse<Clave[]>>

  // Busca el período activo en un array
  findActivePeriodo(periodos: Periodo[]): number | null
}
```

#### Patrón de Respuesta
```typescript
// Éxito
{
  data: { periodos: [...], sectores: [...], ... },
  error: null
}

// Error
{
  data: null,
  error: 'No authentication token found'
}
```

#### Validación de Token
Todos los métodos verifican token antes de hacer requests:
```typescript
const token = localStorage.getItem('token');
if (!token) {
  throw new Error('No authentication token found');
}
```

## Flujo de Datos

### 1. Carga Inicial
```
route load (clientLoader)
  ↓
monitorService.getBasicData() [paralelo: periodos, sectores, claves]
  ↓
findActivePeriod(periodos)
  ↓
MonitorLecturasComponent recibe props
  ↓
useEffect: inicializa período y fechas por defecto
```

### 2. Búsqueda de Resultados
```
Usuario clicks "Iniciar Monitoreo"
  ↓
handleSearch() valida filtros
  ↓
setIsSearchActive(true)
  ↓
ResultadosBusqueda fetches con filtros
  ↓
Calcula estadísticas y agrupa por nicho
  ↓
Renderiza MonitorNichos para cada nicho
```

### 3. Edición de Medidor
```
Usuario clicks en fila de medidor
  ↓
handleRowClick() abre Dialog
  ↓
EditarMedidores renderiza formulario apropiado
  ↓
Submit → handleSuccess()
  ↓
setNeedsRefreshOnClose(true)
  ↓
Dialog cierra → Refetch de datos
  ↓
Resalta elemento editado (4.2s)
```

## Ejemplos de Uso

### Ejemplo 1: Integración Básica en Layout
```tsx
import { MonitorLecturasComponent } from '~/components/monitor';

export default function MonitorPage({ loaderData }) {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <MonitorLecturasComponent {...loaderData} />
    </Suspense>
  );
}
```

### Ejemplo 2: Uso del Servicio en Componente Personalizado
```tsx
import { monitorService } from '~/services/monitorService';
import { useState, useEffect } from 'react';

export function CustomMonitor() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      const result = await monitorService.getBasicData();

      if (result.error) {
        setError(result.error);
      } else {
        setData(result.data);
      }
    };

    loadData();
  }, []);

  if (error) return <Alert variant="destructive">{error}</Alert>;
  if (!data) return <LoadingSpinner />;

  return (
    <div>
      <p>Períodos disponibles: {data.periodos.length}</p>
      <p>Sectores: {data.sectores.length}</p>
    </div>
  );
}
```

### Ejemplo 3: Búsqueda Programática
```tsx
import { monitorService } from '~/services/monitorService';

// En un route loader
export async function clientLoader() {
  const result = await monitorService.getBasicData();

  if (result.error) {
    return {
      periodos: [],
      sectores: [],
      claves: [],
      activePeriodoId: null,
      error: new Error(result.error)
    };
  }

  return {
    ...result.data,
    error: null
  };
}
```

### Ejemplo 4: Acceso a Datos Individuales
```tsx
import { monitorService } from '~/services/monitorService';

// Solo períodos
const periodosResult = await monitorService.getPeriodos();

// Solo sectores
const sectoresResult = await monitorService.getSectores();

// Encontrar período activo
const activeId = monitorService.findActivePeriodo(periods);
const activePeriodo = periods.find(p => p.IdPeriodo === activeId);
```

### Ejemplo 5: Manejo de Errores Completo
```tsx
import { monitorService } from '~/services/monitorService';
import { toast } from 'sonner';

async function loadMonitorData() {
  try {
    const result = await monitorService.getBasicData();

    if (result.error) {
      // Handle específico por tipo de error
      if (result.error.includes('token')) {
        // Redirigir a login
        window.location.href = '/login';
      } else if (result.error.includes('timeout')) {
        toast.error('Conexión tardó demasiado. Intenta nuevamente.');
      } else {
        toast.error(result.error);
      }
      return null;
    }

    return result.data;

  } catch (error) {
    console.error('Unexpected error:', error);
    toast.error('Error inesperado al cargar datos');
    return null;
  }
}
```

## Edge Cases y Manejo de Errores

### 1. Sin Token de Autenticación
**Caso:** Usuario intenta acceder sin token válido

**Comportamiento:**
- Todos los métodos del servicio retornan error
- clientLoader captura error y retorna arrays vacíos
- MonitorLecturasComponent muestra Alert destructivo

**Código:**
```typescript
if (result.error || !result.data) {
  return {
    periodos: [],
    sectores: [],
    claves: [],
    activePeriodoId: null,
    error: new Error(result.error || 'Error al cargar datos')
  };
}
```

### 2. Sin Períodos Disponibles
**Caso:** La API retorna array vacío para períodos

**Comportamiento:**
- `selectedPeriodo` permanece null
- Botón "Iniciar Monitoreo" queda deshabilitado
- No se ejecuta búsqueda
- useEffect tiene early return

**Código:**
```typescript
useEffect(() => {
  if (!periodos || periodos.length === 0) return;

  if (selectedPeriodo) return;

  const periodoActivo = findActivePeriod(periodos);
  if (!periodoActivo) return;

  setSelectedPeriodo(periodoActivo);
}, [periodos, selectedPeriodo, fechaFin]);
```

### 3. Sin Sectores Disponibles
**Caso:** La API retorna array vacío para sectores

**Comportamiento:**
- Grid de botones de sector muestra mensaje vacío
- Búsqueda queda deshabilitada
- Validación requiere sector

**Render:**
```tsx
{sectores && sectores.length > 0 ? (
  <div className='grid grid-cols-1 xs:grid-cols-2 ...'>
    {/* Botones de sector */}
  </div>
) : (
  <div className='text-center py-8 sm:py-12 text-muted-foreground'>
    <Settings2 className='w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-3 opacity-50' />
    <p className='text-sm sm:text-base'>No hay sectores disponibles</p>
  </div>
)}
```

### 4. Búsqueda Sin Resultados
**Caso:** Filtros válidos pero sin medidores que coincidan

**Comportamiento:**
- MonitorNichos muestra EmptyState
- Mensaje: "No se encontraron medidores para los parámetros seleccionados"
- Botones de acción deshabilitados

**Código:**
```typescript
if (results.length === 0 && !isLoading) {
  return (
    <div className='flex items-center justify-center min-h-[400px]'>
      <EmptyState message='No se encontraron medidores para los parámetros seleccionados' />
    </div>
  );
}
```

### 5. Falla de Red Durante Búsqueda
**Caso:** API no responde o timeout

**Comportamiento:**
- ResultadosBusqueda captura error en try-catch
- Muestra Alert con mensaje de error
- Usuario puede reintentar sin limpiar filtros

**Código:**
```typescript
try {
  const response = await api.get('/lecturas-nicho', { params });
  setResults(response.data as MedidorNichoItem[]);
} catch (error) {
  console.error('Error al cargar los medidores por nicho:', error);
  // Toast con error automático del componente
}
```

### 6. Período Activo No Existe
**Caso:** `EstadoPeriodo` nunca es igual a 2

**Comportamiento:**
- `findActivePeriodo()` retorna null
- `activePeriodoId` en loaderData es null
- useEffect no ejecuta inicialización
- Usuario debe seleccionar período manualmente

**Código:**
```typescript
const findActivePeriodo = (periodos: Periodo[]): number | null => {
  if (!periodos || periodos.length === 0) return null;

  const activePeriodo = periodos.find(
    (periodo: Periodo) => periodo.EstadoPeriodo === 2
  );

  return activePeriodo ? Number(activePeriodo.IdPeriodo) : null;
};
```

### 7. Respuesta API No es Array
**Caso:** Backend retorna objeto en lugar de array

**Comportamiento:**
- `Array.isArray()` retorna false
- Service usa array vacío como fallback
- Componente recibe datos seguros

**Código:**
```typescript
const periodosData = Array.isArray(periodosRes.data)
  ? periodosRes.data
  : [];
```

### 8. Actualización Mientras Busca
**Caso:** Usuario abre búsqueda mientras se actualiza

**Comportamiento:**
- `setIsRefreshing(true)` previene spinner duplicado
- Datos anteriores permanecen visibles
- Nuevo contenido reemplaza cuando completa

**Código:**
```typescript
const handleRefresh = () => {
  setIsRefreshing(true);
  searchResults();
};

// En searchResults()
if (!isRefreshing) {
  setIsLoading(true);
}
// ... fetch ...
setIsRefreshing(false);
```

### 9. Búsqueda en Tabla Mientras Carga
**Caso:** Usuario busca mientras datos de nicho se cargan

**Comportamiento:**
- Búsqueda debounced (300ms)
- Filtra contra `results` actualizado
- No bloquea búsqueda durante carga

**Código:**
```typescript
const debouncedSearch = useDebounce(searchTerm, 300);

const filteredResults = useMemo(() => {
  if (!debouncedSearch.trim()) {
    return results;
  }
  return results.filter(item => {
    return (
      item.ME_NSerie?.toLowerCase().includes(searchLower) ||
      item.ubicacion?.toLowerCase().includes(searchLower) ||
      // ... más campos ...
    );
  });
}, [results, debouncedSearch]);
```

### 10. Tour Iniciado Sin Elementos
**Caso:** Usuario inicia tour pero elementos falta

**Comportamiento:**
- driver.js busca elementos por ID
- Si no encuentra, omite paso y continúa
- Tour no falla, solo salta pasos

**Configuración:**
```typescript
const driverjs = driver({
  showProgress: true,
  progressText: 'Paso {{current}} de {{total}}',
  allowClose: true,
  animate: true
});
```

## Validaciones

### Validaciones de Formulario
```typescript
// En hook use-monitor
export function validateSearchParams(
  sector: Sector | null,
  periodo: Periodo | null
): { isValid: boolean; error: string } {
  if (!sector) {
    return {
      isValid: false,
      error: 'Debe seleccionar un sector'
    };
  }

  if (!periodo) {
    return {
      isValid: boolean,
      error: 'Debe seleccionar un período'
    };
  }

  return { isValid: true, error: '' };
}
```

### Validaciones de Fechas
```typescript
// Fecha fin debe ser >= fecha inicio
if (new Date(fechaFin) < new Date(fechaInicio)) {
  toast.error('La fecha fin debe ser posterior a la fecha inicio');
  return;
}
```

### Validaciones de Entrada de Búsqueda
```typescript
// Serial de medidor: permite números y guiones
const isValidSerial = /^[0-9\-]*$/.test(meterSerial);

// Búsqueda debounced previene requests excesivos
const debouncedSearch = useDebounce(searchTerm, 300);
```

## Performance

### Optimizaciones Implementadas

#### 1. Code Splitting
```typescript
// Lazy load de componente pesado (183 KB)
const MonitorLecturasComponent = lazy(() =>
  import('~/components/monitor/monitor-lecturas-component')
);

// Con Suspense fallback
<Suspense fallback={<MonitorLecturasSkeleton />}>
  <MonitorLecturasComponent {...loaderData} />
</Suspense>
```

#### 2. Virtualización de Tabla
```typescript
// Solo renderiza filas visibles
<DataTableNichosVirtualized
  columns={columnsNichos(columnProps)}
  data={filteredResults}
  columnGroups={columnGroups}
  onRowClick={handleRowClick}
/>
```

#### 3. Debouncing de Búsqueda
```typescript
// Espera 300ms antes de filtrar
const debouncedSearch = useDebounce(searchTerm, 300);

const filteredResults = useMemo(() => {
  // Solo recalcula cuando debouncedSearch cambia
}, [results, debouncedSearch]);
```

#### 4. Parallelización de Requests
```typescript
// Carga 3 requests simultáneamente
const [periodosRes, sectoresRes, clavesRes] = await Promise.all([
  api.get<Periodo[]>('/Periodos'),
  api.get<Sector[]>('/Sectores'),
  api.get<Clave[]>('/Claves')
]);
```

#### 5. Memoización de Valores
```typescript
// Recalcula solo cuando dependencias cambian
const filteredResults = useMemo(() => {
  // Filtrado complejo
}, [results, debouncedSearch]);

const columnProps = useMemo(() => {
  // Props para columnas
}, [handleOpenDialog, openDialogs, lastEditedId, handleSuccess]);
```

#### 6. Animaciones Optimizadas
```typescript
// Motion animations con transiciones suaves
<motion.div
  initial={{ opacity: 0, y: 10 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.3 }}
>
  {/* contenido */}
</motion.div>
```

### Métricas Esperadas
- **First Contentful Paint:** < 2s (con skeleton)
- **Time to Interactive:** < 3s (lazy load)
- **Search Response:** < 500ms (debounced)
- **Scroll Performance:** 60 FPS (virtualized)

## Keyboard Shortcuts

El componente implementa los siguientes atajos de teclado:

| Atajo | Acción | Descripción |
|-------|--------|-------------|
| `Ctrl+K` | Abrir Búsqueda | Abre panel de filtros y enfoca input |
| `Ctrl+Enter` | Buscar/Refrescar | Ejecuta búsqueda con filtros actuales |
| `Esc` | Cerrar Filtros | Colapsa panel de filtros |

```typescript
useMonitorKeyboardShortcuts({
  onSearch: () => {
    if (!isFiltersOpen) setIsFiltersOpen(true);
    setTimeout(() => {
      const input = document.getElementById('meter-serial-input');
      input?.focus();
    }, 100);
  },
  onRefresh: handleSearch,
  onEscape: () => setIsFiltersOpen(false)
});
```

## Referencias de Tipos

Ver archivos de tipos en `~/types/monitor.ts`:
- `Periodo` - Configuración de período de facturación
- `Sector` - Definición de sector de monitoreo
- `Clave` - Código de lectura/estado
- `Medidor` - Información de medidor
- `Lectura` - Registro de lectura
- `MedidorNichoItem` - Item en tabla virtualizada
- `EtapaUno|Dos|Tres|Cuatro` - Etapas de datos del medidor

