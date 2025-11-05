# 🔄 Ejemplos Prácticos de Refactorización

Ejemplos reales del código del proyecto con optimizaciones aplicadas.

## 📋 Tabla de Contenidos

1. [forEach → for...of](#1-foreach--forof)
2. [Reducir Complejidad Cognitiva](#2-reducir-complejidad-cognitiva)
3. [Extraer Funciones Helper](#3-extraer-funciones-helper)
4. [Componentes React Grandes](#4-componentes-react-grandes)
5. [Lógica de Negocio en Hooks](#5-lógica-de-negocio-en-hooks)

---

## 1. forEach → for...of

### ❌ Antes (Código actual en el proyecto)

```typescript
// app/hooks/administracion/use-export-contratos.ts
export function useExportContratos() {
  const exportToExcel = (data: Contrato[]) => {
    const rows: any[] = [];

    data.forEach(contrato => {
      rows.push({
        Código: contrato.codigo,
        Cliente: contrato.cliente,
        Estado: contrato.estado
      });
    });

    // crear excel...
  };
}
```

### ✅ Después (Optimizado)

```typescript
// app/hooks/administracion/use-export-contratos.ts
export function useExportContratos() {
  const exportToExcel = (data: Contrato[]) => {
    const rows: any[] = [];

    for (const contrato of data) {
      rows.push({
        Código: contrato.codigo,
        Cliente: contrato.cliente,
        Estado: contrato.estado
      });
    }

    // crear excel...
  };
}
```

**Beneficios:**

- ✅ Cumple con SonarQube
- ✅ Más idiomático en JavaScript moderno
- ✅ Mejor performance en algunos casos

---

## 2. Reducir Complejidad Cognitiva

### ❌ Antes (Alta complejidad)

```typescript
// app/components/dashboard/dashboard-component.tsx (simplificado)
const processContratos = (contratos: any[]) => {
  if (contratos && contratos.length > 0) {
    let totalActivos = 0;
    let totalInactivos = 0;

    contratos.forEach(contrato => {
      if (contrato.estado) {
        if (contrato.estado === 'activo') {
          if (contrato.monto) {
            if (contrato.monto > 0) {
              totalActivos += contrato.monto;
            }
          }
        } else if (contrato.estado === 'inactivo') {
          if (contrato.monto) {
            totalInactivos += contrato.monto;
          }
        }
      }
    });

    return { totalActivos, totalInactivos };
  }
  return { totalActivos: 0, totalInactivos: 0 };
};
```

### ✅ Después (Baja complejidad)

```typescript
// app/components/dashboard/dashboard-component.tsx (optimizado)

// Helpers tipados y reutilizables
const isActiveContract = (contrato: Contrato): boolean =>
  contrato.estado === 'activo' && contrato.monto > 0;

const isInactiveContract = (contrato: Contrato): boolean =>
  contrato.estado === 'inactivo' && contrato.monto > 0;

const sumMontos = (contratos: Contrato[]): number =>
  contratos.reduce((sum, c) => sum + (c.monto || 0), 0);

// Función principal simplificada
const processContratos = (contratos: Contrato[] = []) => {
  if (contratos.length === 0) {
    return { totalActivos: 0, totalInactivos: 0 };
  }

  const activos = contratos.filter(isActiveContract);
  const inactivos = contratos.filter(isInactiveContract);

  return {
    totalActivos: sumMontos(activos),
    totalInactivos: sumMontos(inactivos)
  };
};
```

**Beneficios:**

- ✅ Complejidad cognitiva reducida de ~15 a ~5
- ✅ Funciones helper reutilizables
- ✅ Más fácil de testear
- ✅ Código más declarativo

---

## 3. Extraer Funciones Helper

### ❌ Antes (Lógica repetida)

```typescript
// Múltiples archivos con lógica similar
// app/components/monitor/monitor-lecturas/detalles-medidor/analisis-consumo.tsx

const getMes = (periodo: string): number => {
  return Number.parseInt(periodo.substring(0, 2), 10);
};

const getAnio = (periodo: string): number => {
  return Number.parseInt(periodo.substring(2), 10);
};

// Más adelante en el mismo archivo...
const sortByPeriod = (a: Lectura, b: Lectura) => {
  const aPeriod =
    Number.parseInt(a.LM_Periodo.slice(2)) * 100 +
    Number.parseInt(a.LM_Periodo.slice(0, 2));
  const bPeriod =
    Number.parseInt(b.LM_Periodo.slice(2)) * 100 +
    Number.parseInt(b.LM_Periodo.slice(0, 2));
  return aPeriod - bPeriod;
};
```

### ✅ Después (Utilidad centralizada)

```typescript
// app/utils/periodo-utils.ts (NUEVO)

/**
 * Utilidades para manejo de períodos en formato MMAAAA
 */

export interface Periodo {
  mes: number;
  anio: number;
}

/**
 * Extrae mes de un período
 * @param periodo - Período en formato MMAAAA
 * @returns Número del mes (1-12)
 */
export const getMes = (periodo: string): number => {
  return Number.parseInt(periodo.substring(0, 2), 10);
};

/**
 * Extrae año de un período
 * @param periodo - Período en formato MMAAAA
 * @returns Año completo
 */
export const getAnio = (periodo: string): number => {
  return Number.parseInt(periodo.substring(2), 10);
};

/**
 * Convierte período a objeto estructurado
 * @param periodo - Período en formato MMAAAA
 */
export const parsePeriodo = (periodo: string): Periodo => ({
  mes: getMes(periodo),
  anio: getAnio(periodo)
});

/**
 * Convierte período a número para comparación
 * @param periodo - Período en formato MMAAAA
 * @returns Número para ordenamiento
 */
export const periodoToNumber = (periodo: string): number => {
  const { mes, anio } = parsePeriodo(periodo);
  return anio * 100 + mes;
};

/**
 * Comparador para ordenar por período
 */
export const comparePeriodos = (a: string, b: string): number => {
  return periodoToNumber(a) - periodoToNumber(b);
};

// Uso en el componente
import { comparePeriodos, parsePeriodo } from '@/utils/periodo-utils';

const sortByPeriod = (a: Lectura, b: Lectura) => {
  return comparePeriodos(a.LM_Periodo, b.LM_Periodo);
};
```

**Beneficios:**

- ✅ DRY (Don't Repeat Yourself)
- ✅ Documentación JSDoc
- ✅ Tipado completo
- ✅ Fácil de testear
- ✅ Reutilizable en todo el proyecto

---

## 4. Componentes React Grandes

### ❌ Antes (Componente monolítico de 500+ líneas)

```typescript
// app/components/administracion/contratos/crear-contrato-component.tsx
export function CrearContratoComponent() {
  // 20+ estados
  const [formData, setFormData] = useState({...});
  const [errors, setErrors] = useState({...});
  const [loading, setLoading] = useState(false);
  const [clientes, setClientes] = useState([]);
  const [tarifas, setTarifas] = useState([]);
  // ... más estados

  // 10+ effects
  useEffect(() => { /* fetch clientes */ }, []);
  useEffect(() => { /* fetch tarifas */ }, []);
  useEffect(() => { /* validar */ }, [formData]);
  // ... más effects

  // 15+ funciones
  const handleSubmit = () => { /* 50 líneas */ };
  const validateForm = () => { /* 40 líneas */ };
  const handleClienteChange = () => { /* 30 líneas */ };
  // ... más funciones

  return (
    <div>
      {/* 300 líneas de JSX */}
    </div>
  );
}
```

### ✅ Después (Componente dividido)

```typescript
// app/components/administracion/contratos/crear-contrato-component.tsx
export function CrearContratoComponent() {
  const logic = useCrearContratoLogic();

  return (
    <ContratoFormLayout>
      <ContratoFormHeader onClose={logic.handleClose} />

      <ContratoFormBody>
        <ClienteSection {...logic.clienteProps} />
        <TarifaSection {...logic.tarifaProps} />
        <ConfiguracionSection {...logic.configProps} />
      </ContratoFormBody>

      <ContratoFormFooter
        onSubmit={logic.handleSubmit}
        onCancel={logic.handleCancel}
        loading={logic.loading}
      />
    </ContratoFormLayout>
  );
}

// app/hooks/administracion/use-crear-contrato-logic.ts
export function useCrearContratoLogic() {
  const { formData, handleChange } = useContratoForm();
  const { clientes, loading: loadingClientes } = useClientes();
  const { tarifas, loading: loadingTarifas } = useTarifas();
  const { submit, loading: submitting } = useSubmitContrato();

  const handleSubmit = useCallback(async () => {
    if (!validateForm(formData)) return;
    await submit(formData);
  }, [formData, submit]);

  return {
    clienteProps: { clientes, loading: loadingClientes, onChange: handleChange },
    tarifaProps: { tarifas, loading: loadingTarifas, onChange: handleChange },
    configProps: { data: formData, onChange: handleChange },
    handleSubmit,
    handleCancel: () => {},
    handleClose: () => {},
    loading: submitting
  };
}

// app/components/administracion/contratos/sections/cliente-section.tsx
interface ClienteSectionProps {
  clientes: Cliente[];
  loading: boolean;
  onChange: (field: string, value: any) => void;
}

export function ClienteSection({ clientes, loading, onChange }: ClienteSectionProps) {
  if (loading) return <Skeleton />;

  return (
    <FormSection title="Información del Cliente">
      <Select
        options={clientes}
        onChange={(value) => onChange('cliente', value)}
      />
    </FormSection>
  );
}
```

**Beneficios:**

- ✅ Componente principal <100 líneas
- ✅ Lógica separada en hooks
- ✅ Sub-componentes reutilizables
- ✅ Fácil de testear cada parte
- ✅ Mejor performance (memoización selectiva)

---

## 5. Lógica de Negocio en Hooks

### ❌ Antes (Lógica mezclada con UI)

```typescript
// app/components/reportes/resumen-facturacion-component.tsx
export function ResumenFacturacionComponent() {
  const [data, setData] = useState<Factura[]>([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({...});

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await api.get('/facturas', { params: filters });
        const processed = response.data.map(item => ({
          ...item,
          total: calculateTotal(item),
          status: getStatus(item)
        }));
        setData(processed);
      } catch (error) {
        toast.error('Error al cargar datos');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [filters]);

  const calculateTotal = (factura: Factura) => {
    // lógica compleja...
  };

  const getStatus = (factura: Factura) => {
    // más lógica...
  };

  return (
    <div>
      {/* UI */}
    </div>
  );
}
```

### ✅ Después (Hook personalizado)

```typescript
// app/hooks/reportes/use-resumen-facturacion.ts

interface UseResumenFacturacionOptions {
  filters?: FacturaFilters;
}

interface UseResumenFacturacionReturn {
  data: ProcessedFactura[];
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

/**
 * Hook para manejar el resumen de facturación
 * @param options - Opciones de configuración
 */
export function useResumenFacturacion(
  options: UseResumenFacturacionOptions = {}
): UseResumenFacturacionReturn {
  const [data, setData] = useState<ProcessedFactura[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const processFactura = useCallback((factura: Factura): ProcessedFactura => ({
    ...factura,
    total: calculateTotal(factura),
    status: getStatus(factura)
  }), []);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await reportesService.getFacturas(options.filters);
      const processed = response.data.map(processFactura);
      setData(processed);
    } catch (err) {
      const error = err as Error;
      setError(error);
      toast.error('Error al cargar datos');
    } finally {
      setLoading(false);
    }
  }, [options.filters, processFactura]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}

// Helpers en archivo separado
// app/utils/factura-utils.ts

export const calculateTotal = (factura: Factura): number => {
  return factura.subtotal + factura.impuestos - factura.descuentos;
};

export const getStatus = (factura: Factura): FacturaStatus => {
  if (factura.pagada) return 'PAGADA';
  if (isOverdue(factura.fechaVencimiento)) return 'VENCIDA';
  return 'PENDIENTE';
};

// Componente simplificado
// app/components/reportes/resumen-facturacion-component.tsx

export function ResumenFacturacionComponent() {
  const [filters, setFilters] = useState<FacturaFilters>({});
  const { data, loading, error, refetch } = useResumenFacturacion({ filters });

  if (error) return <ErrorState onRetry={refetch} />;
  if (loading) return <LoadingState />;

  return (
    <ResumenLayout>
      <FacturaFilters filters={filters} onChange={setFilters} />
      <FacturaTable data={data} />
      <FacturaChart data={data} />
    </ResumenLayout>
  );
}
```

**Beneficios:**

- ✅ Lógica completamente testeable
- ✅ Componente <50 líneas
- ✅ Hook reutilizable
- ✅ Separación de responsabilidades
- ✅ Documentación clara

---

## 🎯 Resumen de Mejores Prácticas

### Antes de Refactorizar

1. ✅ Escribir tests si no existen
2. ✅ Identificar responsabilidades
3. ✅ Planear la estructura

### Durante la Refactorización

1. ✅ Hacer cambios pequeños
2. ✅ Ejecutar tests después de cada cambio
3. ✅ Commitear incrementalmente

### Después de Refactorizar

1. ✅ Verificar tests pasan
2. ✅ Ejecutar `pnpm run lint`
3. ✅ Revisar métricas de SonarQube

---

## 📚 Referencias

- [Clean Code JavaScript](https://github.com/ryanmcdermott/clean-code-javascript)
- [React Patterns](https://reactpatterns.com/)
- [SonarQube Best Practices](https://rules.sonarsource.com/typescript/)

---

**💡 Tip**: Aplica estas refactorizaciones gradualmente, priorizando los archivos más complejos primero.
