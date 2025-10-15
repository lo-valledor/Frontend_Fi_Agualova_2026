# Plantilla para Documentar Componentes

Esta plantilla te ayuda a documentar componentes React de forma consistente.

## Componente Simple

````typescript
import React from 'react';

/**
 * Props del componente MiComponente
 */
interface MiComponenteProps {
  /** Título a mostrar */
  titulo: string;
  /** Descripción opcional */
  descripcion?: string;
  /** Callback cuando se hace click */
  onClick?: () => void;
  /** Children elements */
  children?: React.ReactNode;
}

/**
 * [DESCRIPCIÓN BREVE DEL COMPONENTE]
 *
 * [DESCRIPCIÓN DETALLADA SI ES NECESARIO]
 *
 * @param props - Props del componente
 * @param props.titulo - Título a mostrar
 * @param props.descripcion - Descripción opcional
 * @param props.onClick - Callback cuando se hace click
 * @param props.children - Elementos hijos
 *
 * @example
 * ```tsx
 * <MiComponente
 *   titulo="Hola Mundo"
 *   descripcion="Este es un ejemplo"
 *   onClick={() => console.log('clicked')}
 * >
 *   <p>Contenido adicional</p>
 * </MiComponente>
 * ```
 */
export function MiComponente({
  titulo,
  descripcion,
  onClick,
  children
}: MiComponenteProps) {
  return (
    <div onClick={onClick}>
      <h2>{titulo}</h2>
      {descripcion && <p>{descripcion}</p>}
      {children}
    </div>
  );
}
````

---

## Componente Complejo (Vista de Módulo)

````typescript
import { useState } from 'react';
import { DataTable } from '~/components/data-table/data-table';
import { columns } from './columns';

/**
 * Props del componente principal de gestión de [entidades]
 */
interface MiModuloComponentProps {
  /** Lista de [entidades] a mostrar */
  datos: MiTipo[];
  /** Datos adicionales para filtros/selects */
  datosAdicionales?: DatosExtra;
}

/**
 * Componente principal para la gestión de [entidades]
 *
 * Funcionalidades principales:
 * - Visualización en tabla con paginación y filtros
 * - Creación de nuevas [entidades]
 * - Edición de [entidades] existentes
 * - Eliminación con confirmación
 * - Exportación a Excel
 *
 * Arquitectura:
 * - Usa TanStack Table para la tabla de datos
 * - Formularios con React Hook Form + Zod
 * - Filtros con estado local
 * - Comunicación con backend vía [servicio]Service
 *
 * @param props - Props del componente
 * @param props.datos - Lista de [entidades] cargada desde el loader
 * @param props.datosAdicionales - Datos extra para selects (opcionales)
 *
 * @example
 * ```tsx
 * // Usado en app/routes/dashboard/modulo/ruta.tsx
 * export default function Ruta({ loaderData }: Route.ComponentProps) {
 *   return <MiModuloComponent datos={loaderData.datos} />;
 * }
 * ```
 */
export default function MiModuloComponent({
  datos,
  datosAdicionales
}: MiModuloComponentProps) {
  const [filtros, setFiltros] = useState<Filtros>({});
  const [modalAbierto, setModalAbierto] = useState(false);

  // Lógica del componente...

  return (
    <div>
      {/* UI del componente */}
    </div>
  );
}
````

---

## Hook Personalizado

````typescript
import { useState, useEffect } from 'react';

/**
 * Opciones para el hook useMiHook
 */
interface UseMiHookOptions {
  /** Intervalo de actualización en ms */
  intervalo?: number;
  /** Si debe iniciar automáticamente */
  autoStart?: boolean;
}

/**
 * Valor de retorno del hook useMiHook
 */
interface UseMiHookReturn {
  /** Datos actuales */
  datos: MiTipo | null;
  /** Si está cargando */
  loading: boolean;
  /** Error si ocurrió */
  error: string | null;
  /** Función para recargar manualmente */
  refetch: () => Promise<void>;
}

/**
 * Hook personalizado para [DESCRIPCIÓN]
 *
 * [DETALLES DEL HOOK]
 *
 * @param options - Opciones de configuración
 * @param options.intervalo - Intervalo de actualización automática
 * @param options.autoStart - Si debe iniciar la carga automáticamente
 * @returns Objeto con datos, loading, error y refetch
 *
 * @example
 * ```typescript
 * function MiComponente() {
 *   const { datos, loading, error, refetch } = useMiHook({
 *     intervalo: 5000,
 *     autoStart: true
 *   });
 *
 *   if (loading) return <Spinner />;
 *   if (error) return <Error message={error} />;
 *
 *   return <div>{datos?.nombre}</div>;
 * }
 * ```
 */
export function useMiHook(options: UseMiHookOptions = {}): UseMiHookReturn {
  const { intervalo, autoStart = true } = options;

  const [datos, setDatos] = useState<MiTipo | null>(null);
  const [loading, setLoading] = useState(autoStart);
  const [error, setError] = useState<string | null>(null);

  const refetch = async () => {
    setLoading(true);
    setError(null);

    try {
      const { data, error: err } = await miServicio.getDatos();

      if (err) {
        setError(err);
      } else {
        setDatos(data);
      }
    } catch (err) {
      setError('Error inesperado');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!autoStart) return;

    refetch();

    if (intervalo) {
      const id = setInterval(refetch, intervalo);
      return () => clearInterval(id);
    }
  }, [autoStart, intervalo]);

  return { datos, loading, error, refetch };
}
````

---

## Guías de Documentación de Componentes

### ¿Qué documentar en componentes?

#### SIEMPRE documenta:

- ✅ Propósito y funcionalidad del componente
- ✅ Props y su significado
- ✅ Ejemplo de uso básico
- ✅ Componentes complejos o no obvios

#### Documenta CUANDO sea relevante:

- 🔸 Arquitectura interna de componentes grandes
- 🔸 Dependencias de otros componentes
- 🔸 Side effects importantes
- 🔸 Limitaciones o casos especiales
- 🔸 Estado interno complejo

#### NO documentes:

- ❌ Componentes UI simples y obvios (Button, Input)
- ❌ Props auto-explicativos con tipos claros
- ❌ Implementación DOM interna

### Niveles de Documentación por Tipo

#### Componentes UI Base (`app/components/ui/`)

**Documentación mínima**: Solo si tiene comportamiento no estándar

```typescript
// ❌ No necesario para componentes simples
export function Button({ children, ...props }: ButtonProps) {
  return <button {...props}>{children}</button>;
}

// ✅ Documenta si tiene lógica especial
/**
 * Select component con búsqueda y creación de opciones
 *
 * Extiende react-select con soporte para:
 * - Búsqueda fuzzy
 * - Creación de nuevas opciones on-the-fly
 * - Validación customizada
 */
export function CreatableSelect({ ... }) { ... }
```

#### Componentes de Vista/Módulo

**Documentación completa**: Siempre documenta

```typescript
/**
 * Vista principal de gestión de contratos
 *
 * Funcionalidades:
 * - CRUD completo de contratos
 * - Filtros avanzados por cliente, estado, fechas
 * - Exportación a Excel con formato SAP
 * - Asignación de medidores a contratos
 *
 * @param props.contratos - Lista de contratos desde loader
 * @param props.clientes - Lista de clientes para filtros
 */
export default function ContratosComponent({ contratos, clientes }) { ... }
```

#### Hooks Personalizados

**Documentación completa**: Siempre documenta

```typescript
/**
 * Hook para gestionar autenticación con refresh automático
 *
 * Mantiene sincronizado el estado de autenticación con:
 * - LocalStorage
 * - JWT token
 * - Context API
 *
 * Refresca automáticamente el token antes de expirar.
 */
export function useAuth() { ... }
```

---

## Ejemplos de Documentación

### Componente con Props Complejos

````typescript
interface GraficoCONFiguration {
  /** Tipo de gráfico a renderizar */
  tipo: 'linea' | 'barra' | 'pie';
  /** Colores personalizados (hex codes) */
  colores?: string[];
  /** Si mostrar leyenda */
  mostrarLeyenda?: boolean;
  /** Configuración del eje Y */
  ejeY?: {
    min?: number;
    max?: number;
    formato?: 'numero' | 'moneda' | 'porcentaje';
  };
}

/**
 * Componente para renderizar gráficos de datos
 *
 * Usa Recharts internamente y soporta múltiples tipos de gráficos.
 * Los datos se formatean automáticamente según la configuración.
 *
 * @param props.datos - Array de datos a graficar
 * @param props.config - Configuración del gráfico
 * @param props.config.tipo - Tipo de gráfico ('linea' | 'barra' | 'pie')
 * @param props.config.colores - Colores personalizados en formato hex
 * @param props.config.mostrarLeyenda - Si mostrar la leyenda (default: true)
 * @param props.config.ejeY - Configuración del eje Y
 *
 * @example
 * ```tsx
 * <Grafico
 *   datos={[
 *     { mes: 'Ene', valor: 100 },
 *     { mes: 'Feb', valor: 150 }
 *   ]}
 *   config={{
 *     tipo: 'barra',
 *     colores: ['#3b82f6'],
 *     ejeY: { formato: 'moneda' }
 *   }}
 * />
 * ```
 */
export function Grafico({ datos, config }: GraficoProps) { ... }
````

### Componente con Children Pattern

````typescript
/**
 * Layout de página con sidebar colapsable
 *
 * Proporciona estructura común para páginas del dashboard:
 * - Header con breadcrumbs
 * - Sidebar colapsable
 * - Área de contenido principal
 * - Footer (opcional)
 *
 * @param props.children - Contenido principal de la página
 * @param props.sidebar - Contenido del sidebar (opcional)
 * @param props.showFooter - Si mostrar el footer (default: false)
 *
 * @example
 * ```tsx
 * <PageLayout sidebar={<Filtros />}>
 *   <h1>Mi Página</h1>
 *   <DataTable data={datos} />
 * </PageLayout>
 * ```
 */
export function PageLayout({
  children,
  sidebar,
  showFooter = false
}: PageLayoutProps) { ... }
````

---

## Checklist de Documentación de Componentes

- [ ] Componentes complejos tienen descripción clara
- [ ] Props están documentados (al menos los no obvios)
- [ ] Componentes principales tienen `@example`
- [ ] Hooks personalizados están completamente documentados
- [ ] Componentes reutilizables tienen ejemplos de uso
- [ ] Side effects importantes están explicados
- [ ] Limitaciones o edge cases están mencionados
