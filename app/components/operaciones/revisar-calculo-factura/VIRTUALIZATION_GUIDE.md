# Guía de Virtualización - Revisar Cálculo de Factura

## 📋 Resumen

Se ha implementado la virtualización para la tabla jerárquica de Revisar Cálculo de Factura, mejorando significativamente el rendimiento cuando se manejan grandes cantidades de datos.

## 🎯 Problema Resuelto

La tabla jerárquica tenía dos niveles de datos:

1. **Encabezado (Contratos)**: Obtenido de `/calculo-prefactura-encabezado`
2. **Cargos**: Obtenido de `/calculo-prefactura-cargos` (por `contratoId`)

Con miles de contratos y múltiples cargos por contrato, el renderizado completo de todas las filas causaba problemas de rendimiento.

## ✨ Solución Implementada

### Nuevo Componente: `hierarchical-data-table-virtualized.tsx`

Este componente utiliza `@tanstack/react-virtual` para renderizar solo las filas visibles en el viewport.

### Características Principales

#### 1. **Filas Virtuales Planas**

```typescript
type VirtualRow =
  | { type: 'main'; index: number; data: CalculoPrefacturaCompleto }
  | { type: 'cargo-header'; parentIndex: number }
  | {
      type: 'cargo';
      parentIndex: number;
      cargoIndex: number;
      cargo: CalculoPrefacturaCargo;
    }
  | { type: 'cargo-separator'; parentIndex: number };
```

La tabla convierte la estructura jerárquica en una lista plana de filas virtuales, incluyendo:

- Filas principales (contratos)
- Encabezados de cargos
- Filas de cargos individuales
- Separadores visuales

#### 2. **Cálculo Dinámico de Filas**

```typescript
const virtualRows = useMemo<VirtualRow[]>(() => {
  const rows = table.getRowModel().rows;
  const result: VirtualRow[] = [];

  rows.forEach((row, index) => {
    // Agregar fila principal
    result.push({ type: 'main', index, data: row.original });

    // Si está expandida, agregar cargos
    if (
      row.getIsExpanded() &&
      row.original.cargos &&
      row.original.cargos.length > 0
    ) {
      result.push({ type: 'cargo-header', parentIndex: index });
      row.original.cargos.forEach((cargo, cargoIndex) => {
        result.push({ type: 'cargo', parentIndex: index, cargoIndex, cargo });
      });
      result.push({ type: 'cargo-separator', parentIndex: index });
    }
  });

  return result;
}, [table.getRowModel().rows, expanded]);
```

#### 3. **Alturas Dinámicas**

```typescript
estimateSize: index => {
  const vRow = virtualRows[index];
  if (!vRow) return 24;

  if (vRow.type === 'main') return 24; // h-6 (fila principal)
  if (vRow.type === 'cargo-header') return 20; // h-5 (encabezado)
  if (vRow.type === 'cargo') return 24; // h-6 (cargo)
  if (vRow.type === 'cargo-separator') return 4; // h-1 (separador)

  return 24;
};
```

#### 4. **Virtualización con Scroll**

```typescript
const rowVirtualizer = useVirtualizer({
  count: virtualRows.length,
  getScrollElement: () => tableContainerRef.current,
  estimateSize: /* función de arriba */,
  overscan: 10 // Renderiza 10 filas extra fuera del viewport
});
```

## 📊 Mejoras de Rendimiento

### Antes (Sin Virtualización)

- ❌ Renderizaba **todas las filas** siempre
- ❌ Con 100 contratos + 6 cargos c/u = **700+ elementos DOM**
- ❌ Re-render completo al expandir/colapsar
- ❌ Lag visible con >50 contratos

### Después (Con Virtualización)

- ✅ Renderiza solo **~20-30 filas visibles**
- ✅ Con 100 contratos = **~30 elementos DOM** (solo visibles)
- ✅ Re-render incremental y eficiente
- ✅ Rendimiento fluido con **1000+ contratos**

## 🔄 Cambios en el Componente Principal

### `revisar-calculo-factura-component.tsx`

```diff
- import { HierarchicalDataTable } from './hierarchical-data-table';
+ import { HierarchicalDataTableVirtualized } from './hierarchical-data-table-virtualized';

  // ... resto del código ...

- <HierarchicalDataTable
+ <HierarchicalDataTableVirtualized
    columns={columns}
    data={filteredData}
    onSelectionChange={handleSelectionChange}
  />
```

## 🎨 Características Visuales Mantenidas

- ✅ Expansión/colapso de filas
- ✅ Selección de contratos con checkboxes
- ✅ Estilos diferenciados para cargos
- ✅ Encabezados sticky (permanecen visibles al hacer scroll)
- ✅ Separadores visuales entre grupos de cargos

## 🧩 Estructura de Datos

### Entrada (del Hook `useCalculoFactura`)

```typescript
interface CalculoPrefacturaCompleto {
  // Datos del encabezado
  sector: string;
  contratoId: number;
  codigoTarifa: string;
  rutCliente: string;
  nombreCliente: string;
  localId: string;
  direccion: string;
  comuna: string;
  numeroSerie: string;
  fechaLectura: string;
  consumoPeriodo: number;
  lecturaId: number;

  // Datos combinados del endpoint de cargos
  cargos: CalculoPrefacturaCargo[];
  totalFacturado: number;
}
```

### Cargos

```typescript
interface CalculoPrefacturaCargo {
  codigoEnerlova: string;
  descripcion: string;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
}
```

## 🚀 Uso

El componente funciona exactamente igual que antes desde la perspectiva del usuario:

1. **Preparar Cálculo**: Lanza el proceso de facturación
2. **Ver Cálculos**: Carga los datos de encabezados y cargos
3. **Expandir/Colapsar**: Click en el icono de expansión para ver los cargos
4. **Seleccionar**: Checkbox para marcar contratos a aceptar
5. **Scroll**: Desplazamiento suave con renderizado eficiente

## 🔧 Configuración

### Altura del Contenedor

```typescript
style={{ height: '600px' }}
```

Actualmente fija en 600px. Puede ajustarse según necesidades.

### Overscan

```typescript
overscan: 10;
```

Renderiza 10 filas adicionales fuera del viewport para scroll más suave. Aumentar si hay lag en scroll rápido.

## 📝 Notas Técnicas

1. **Estado de Expansión**: Se mantiene usando `ExpandedState` de TanStack Table
2. **Selección**: Se sincroniza con el componente padre a través de `onSelectionChange`
3. **Memoización**: Las filas virtuales se recalculan solo cuando cambian los datos o el estado de expansión
4. **Sticky Headers**: Se usa `position: sticky` en los encabezados de la tabla

## 🐛 Depuración

Si encuentras problemas:

1. **Filas desalineadas**: Verifica que las alturas en `estimateSize` coincidan con las clases de Tailwind
2. **Scroll errático**: Aumenta el valor de `overscan`
3. **Rendimiento**: Verifica que `virtualRows` esté memoizado correctamente

## 📈 Próximas Mejoras Potenciales

- [ ] Altura dinámica del contenedor (responsive)
- [ ] Virtualización horizontal para columnas muy anchas
- [ ] Persistencia del estado de expansión (localStorage)
- [ ] Animaciones al expandir/colapsar
- [ ] Filtrado y ordenamiento más avanzado

## 🔗 Referencias

- [TanStack Virtual](https://tanstack.com/virtual/latest)
- [TanStack Table](https://tanstack.com/table/latest)
- [React Window vs React Virtual](https://blog.logrocket.com/react-window-react-virtuoso-vs-react-virtual/)
