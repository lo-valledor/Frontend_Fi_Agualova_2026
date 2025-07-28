# Estructura de Servicios de API

## Descripción General

Esta documentación describe la nueva estructura organizada para manejar las llamadas a APIs externas en React Router v7, siguiendo las mejores prácticas de separación de responsabilidades y reutilización de código.

## Estructura de Archivos

```
app/
├── services/
│   ├── index.ts                    # Exportaciones centralizadas
│   ├── authService.ts              # Servicios de autenticación
│   ├── userService.ts              # Servicios de usuario
│   ├── monitorService.ts           # Servicios del módulo monitor
│   ├── administracionService.ts    # Servicios del módulo administración
│   ├── operacionesService.ts       # Servicios del módulo operaciones
│   └── activityTracker.ts          # Servicios de actividad
├── hooks/
│   ├── use-monitor.ts              # Hooks para monitor
│   ├── use-administracion.ts       # Hooks para administración
│   └── use-operaciones.ts          # Hooks para operaciones
└── routes/
    └── dashboard/
        ├── monitor/
        │   ├── monitor-lecturas.tsx
        │   └── exportar-lecturas.tsx
        └── administracion/
            ├── clientes.tsx
            ├── acometida.tsx
            └── ...
```

## Patrón de Servicios

### 1. Estructura Base de un Servicio

```typescript
import api from '~/lib/api';
import type { TipoDatos } from '~/types/modulo';

export interface ModuloServiceResponse<T> {
  data: T | null;
  error: string | null;
}

class ModuloService {
  async getDatos(): Promise<ModuloServiceResponse<TipoDatos[]>> {
    try {
      const response = await api.get('/endpoint');

      return {
        data: response.data as TipoDatos[],
        error: null,
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Error desconocido',
      };
    }
  }
}

export const moduloService = new ModuloService();
```

### 2. Uso en Rutas (clientLoader)

```typescript
import { moduloService } from '~/services/moduloService';

export async function clientLoader() {
  const result = await moduloService.getDatos();

  if (result.error || !result.data) {
    return {
      datos: [],
      error: new Error(result.error || 'Error al cargar datos'),
    };
  }

  return {
    datos: result.data,
    error: null,
  };
}
```

### 3. Hooks Personalizados

```typescript
import { useEffect, useState } from 'react';

import { moduloService } from '~/services/moduloService';

export function useModuloData() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      const result = await moduloService.getDatos();
      // Manejo de estado...
    };
    loadData();
  }, []);

  return { data, loading, error };
}
```

## Servicios Implementados

### MonitorService (`monitorService.ts`)

**Métodos disponibles:**

- `getBasicData()`: Obtiene períodos, sectores y claves
- `getPeriodosAndSectores()`: Obtiene solo períodos y sectores
- `getPeriodos()`: Obtiene solo períodos
- `getSectores()`: Obtiene solo sectores
- `getClaves()`: Obtiene solo claves
- `findActivePeriodo()`: Encuentra el período activo

**Uso:**

```typescript
import { monitorService } from '~/services/monitorService';

// En clientLoader
const result = await monitorService.getBasicData();
```

### AdministracionService (`administracionService.ts`)

**Métodos disponibles:**

- `getAcometidasData()`: Datos de acometidas con combos
- `getClientesData()`: Datos de clientes con giros y regiones
- `getContratosData()`: Datos de contratos con combos
- `getMedidoresData()`: Datos de medidores con marcas
- `getUsuarios()`: Lista de usuarios
- `getCargoTipoContrato()`: Cargo tipo contrato
- `getCondicionesContratoData()`: Condiciones contrato con conceptos
- `getCargoFacturableData()`: Cargo facturable con combos

**Uso:**

```typescript
import { administracionService } from '~/services/administracionService';

// En clientLoader
const result = await administracionService.getClientesData();
```

### OperacionesService (`operacionesService.ts`)

**Métodos disponibles:**

- `getPeriodoAbierto()`: Obtiene período abierto
- `getCiclosFacturacion()`: Obtiene ciclos de facturación activos
- `getPrepararLecturasData()`: Datos completos para preparar lecturas
- `getAsignacionSectores()`: Asignación de sectores por ciclo y período
- `getPreciosCargoData()`: Precios de cargo por mes y año
- `getRevisarPrecioData()`: Datos para revisar precios
- `getPreciosPorCiclo()`: Precios específicos por ciclo
- `getCorteReposicionData()`: Datos de corte y reposición
- `getCerrarLecturasData()`: Datos para cerrar lecturas
- `getPeriodoFacturacionData()`: Datos de período de facturación

**Uso:**

```typescript
import { operacionesService } from '~/services/operacionesService';

// En clientLoader
const result = await operacionesService.getPrepararLecturasData();
```

### MantencionService (`mantencionService.ts`)

**Métodos disponibles:**

- `getCiclosFacturacion()`: Obtiene ciclos de facturación
- `getClaves()`: Obtiene claves
- `getConceptosData()`: Obtiene conceptos con combo asociado
- `getEmpalmes()`: Obtiene empalmes
- `getMarcas()`: Obtiene marcas
- `getNichos()`: Obtiene nichos
- `getParametros()`: Obtiene parámetros
- `getSectores()`: Obtiene sectores
- `getTarifas()`: Obtiene tarifas
- `getTiposContratos()`: Obtiene tipos de contratos
- `getZonas()`: Obtiene zonas

**Uso:**

```typescript
import { mantencionService } from '~/services/mantencionService';

// En clientLoader
const result = await mantencionService.getConceptosData();
```

## Ventajas de esta Estructura

### 1. **Reutilización de Código**

- Los servicios pueden ser usados en múltiples rutas
- Lógica centralizada para manejo de errores
- Procesamiento consistente de respuestas de API

### 2. **Mantenibilidad**

- Cambios en endpoints solo requieren modificar el servicio
- Fácil testing de lógica de negocio
- Separación clara de responsabilidades

### 3. **Type Safety**

- Tipos TypeScript consistentes
- Interfaces bien definidas para respuestas
- Mejor autocompletado en el IDE

### 4. **Performance**

- Carga paralela de datos cuando es posible
- Manejo eficiente de errores
- Reutilización de datos entre componentes

## Migración de Rutas Existentes

### Antes (Código Duplicado)

```typescript
export async function clientLoader() {
  try {
    const [resA, resB, resC] = await Promise.all([
      api.get('/endpointA'),
      api.get('/endpointB'),
      api.get('/endpointC'),
    ]);

    // Procesamiento manual de respuestas...
    // Manejo manual de errores...

    return { dataA, dataB, dataC };
  } catch (error) {
    // Manejo manual de errores...
  }
}
```

### Después (Código Limpio)

```typescript
export async function clientLoader() {
  const result = await moduloService.getDatosCompletos();

  if (result.error || !result.data) {
    return {
      dataA: [],
      dataB: [],
      dataC: [],
      error: new Error(result.error || 'Error al cargar datos'),
    };
  }

  return result.data;
}
```

## Hooks Personalizados

### useMonitorData (`use-monitor.ts`)

Hook para datos básicos del monitor (períodos, sectores, claves).

### useOperaciones (`use-operaciones.ts`)

Hooks especializados para operaciones (refactorizados):

- `usePrepararLecturasData()`: Datos para preparar lecturas
- `useAsignacionSectores()`: Asignación de sectores
- `usePreciosCargo()`: Precios de cargo por mes/año
- `useRevisarPrecio()`: Datos para revisar precios
- `useCorteReposicion()`: Datos de corte y reposición
- `useCerrarLecturas()`: Datos para cerrar lecturas
- `usePeriodoFacturacion()`: Datos de período de facturación

### useAdministracion (`use-administracion.ts`)

Hooks especializados para administración:

- `useAcometidasData()`: Datos de acometidas con combos
- `useClientesData()`: Datos de clientes con giros y regiones
- `useContratosData()`: Datos de contratos con combos
- `useMedidoresData()`: Datos de medidores con marcas
- `useUsuarios()`: Lista de usuarios
- `useCargoTipoContrato()`: Cargo tipo contrato
- `useCondicionesContrato()`: Condiciones contrato con conceptos
- `useCargoFacturable()`: Cargo facturable con combos

### useMantencion (`use-mantencion.ts`)

Hooks especializados para mantención:

- `useCiclosFacturacion()`: Ciclos de facturación
- `useClaves()`: Claves
- `useConceptos()`: Conceptos con combo asociado
- `useEmpalmes()`: Empalmes
- `useMarcas()`: Marcas
- `useNichos()`: Nichos
- `useParametros()`: Parámetros
- `useSectores()`: Sectores
- `useTarifas()`: Tarifas
- `useTiposContratos()`: Tipos de contratos
- `useZonas()`: Zonas

## Próximos Pasos

1. **Migrar módulos restantes:**

   - `reportes`

2. **Implementar caché** para datos frecuentemente usados

3. **Añadir tests unitarios** para los servicios

4. **Documentar endpoints** específicos de cada servicio

## Convenciones de Nomenclatura

- **Servicios:** `moduloService.ts` (camelCase)
- **Métodos:** `getDatos()`, `createDato()`, `updateDato()` (camelCase)
- **Interfaces:** `ModuloServiceResponse<T>` (PascalCase)
- **Tipos:** `ModuloData` (PascalCase)

## Ejemplos de Uso Completo

### En una Ruta

```typescript
import { monitorService } from '~/services/monitorService';

export async function clientLoader() {
  const result = await monitorService.getBasicData();

  if (result.error || !result.data) {
    return {
      periodos: [],
      sectores: [],
      claves: [],
      activePeriodoId: null,
      error: new Error(result.error || 'Error al cargar datos'),
    };
  }

  return {
    periodos: result.data.periodos,
    sectores: result.data.sectores,
    claves: result.data.claves,
    activePeriodoId: result.data.activePeriodoId,
    error: null,
  };
}
```

### En un Componente

```typescript
import { useMonitorData } from '~/hooks/use-monitor';

export function MonitorComponent() {
  const { data, loading, error, refreshData } = useMonitorData();

  if (loading) return <div>Cargando...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!data) return <div>No hay datos</div>;

  return (
    <div>
      {/* Usar data.periodos, data.sectores, etc. */}
    </div>
  );
}
```
