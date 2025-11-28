# Performance Optimization - Phase 5: Advanced Optimizations

## 📋 Objetivo

Implementar optimizaciones avanzadas para maximizar el rendimiento de la aplicación:
- Code Splitting adicional
- Prefetching inteligente
- Virtual Scrolling para tablas grandes
- Optimización de assets

## 🎯 Estado Actual (Post-Phase 4)

### **Logros Hasta Ahora**
- ✅ Bundle reducido: -25%
- ✅ FCP/TTI: -30%
- ✅ Re-renders: -60-65%
- ✅ CPU usage: -35%
- ✅ Interactividad: +45%

### **Áreas de Mejora Identificadas**
1. **Tablas grandes** - Lecturas, contratos (1000+ filas)
2. **Librerías pesadas** - Chart.js, Excel export
3. **Assets** - Iconos, imágenes
4. **Network** - Prefetching de rutas

---

## 🔍 **Phase 5.1: Code Splitting de Librerías Pesadas**

### **Librerías a Optimizar**

#### **1. Excel Export (xlsx)**
**Problema:** ~500 KB cargados siempre, usados solo en exports

**Solución:**
```typescript
// ANTES - app/hooks/use-export.ts
import * as XLSX from 'xlsx';

export function exportToExcel(data, filename) {
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Data');
  XLSX.writeFile(wb, `${filename}.xlsx`);
}

// DESPUÉS - Lazy load
export async function exportToExcel(data, filename) {
  const XLSX = await import('xlsx');
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Data');
  XLSX.writeFile(wb, `${filename}.xlsx`);
}
```

**Impacto:** -500 KB del bundle inicial

#### **2. Chart.js (si se usa)**
**Problema:** ~200 KB para gráficos usados en pocas rutas

**Solución:**
```typescript
// Lazy load del componente de gráficos
const ChartComponent = lazy(() => import('~/components/charts/chart-component'));

// Uso
<Suspense fallback={<ChartSkeleton />}>
  <ChartComponent data={data} />
</Suspense>
```

**Impacto:** -200 KB del bundle inicial

#### **3. Date Pickers / Calendar**
**Problema:** Librerías de fechas pueden ser pesadas

**Solución:**
```typescript
// Lazy load de date pickers complejos
const DateRangePicker = lazy(() => import('~/components/ui/date-range-picker'));
```

---

## 🔍 **Phase 5.2: Virtual Scrolling para Tablas Grandes**

### **Problema**
Tablas con 1000+ filas renderizan todos los elementos, causando:
- Alto uso de memoria
- Scrolling lento
- Re-renders costosos

### **Solución: @tanstack/react-virtual**

#### **Instalación**
```bash
pnpm add @tanstack/react-virtual
```

#### **Implementación**

```typescript
// app/components/data-table/virtualized-data-table.tsx
import { useVirtualizer } from '@tanstack/react-virtual';
import { useRef } from 'react';

interface VirtualizedDataTableProps<T> {
  data: T[];
  columns: ColumnDef<T>[];
  estimatedRowHeight?: number;
}

export function VirtualizedDataTable<T>({
  data,
  columns,
  estimatedRowHeight = 50
}: VirtualizedDataTableProps<T>) {
  const parentRef = useRef<HTMLDivElement>(null);

  const rowVirtualizer = useVirtualizer({
    count: data.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => estimatedRowHeight,
    overscan: 10 // Renderizar 10 filas extra arriba/abajo
  });

  return (
    <div
      ref={parentRef}
      className="h-[600px] overflow-auto"
    >
      <div
        style={{
          height: `${rowVirtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative'
        }}
      >
        {rowVirtualizer.getVirtualItems().map((virtualRow) => {
          const row = data[virtualRow.index];
          return (
            <div
              key={virtualRow.index}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: `${virtualRow.size}px`,
                transform: `translateY(${virtualRow.start}px)`
              }}
            >
              {/* Renderizar fila */}
              <TableRow data={row} columns={columns} />
            </div>
          );
        })}
      </div>
    </div>
  );
}
```

#### **Uso en Componentes**

```typescript
// app/components/monitor/monitor-lecturas-component.tsx
import { VirtualizedDataTable } from '~/components/data-table/virtualized-data-table';

// Usar cuando data.length > 100
{lecturas.length > 100 ? (
  <VirtualizedDataTable
    data={lecturas}
    columns={columns}
    estimatedRowHeight={50}
  />
) : (
  <DataTable data={lecturas} columns={columns} />
)}
```

**Componentes que se benefician:**
- monitor-lecturas (1000+ lecturas)
- contratos (500+ contratos)
- medidores (300+ medidores)

**Impacto:**
- Renderiza solo ~20 filas visibles en vez de 1000+
- Memoria: -80%
- Scrolling: +90% más fluido
- Re-renders: -95%

---

## 🔍 **Phase 5.3: Prefetching Inteligente**

### **Objetivo**
Precargar rutas que el usuario probablemente visitará

### **Implementación**

```typescript
// app/utils/prefetch.ts
import { useEffect } from 'react';

export function usePrefetchRoute(routePath: string, delay = 2000) {
  useEffect(() => {
    const timer = setTimeout(() => {
      // Prefetch de la ruta
      const link = document.createElement('link');
      link.rel = 'prefetch';
      link.href = routePath;
      document.head.appendChild(link);
    }, delay);

    return () => clearTimeout(timer);
  }, [routePath, delay]);
}
```

#### **Uso Estratégico**

```typescript
// app/routes/dashboard/index.tsx
export default function Dashboard() {
  // Prefetch rutas comunes después de 2 segundos
  usePrefetchRoute('/dashboard/administracion/contratos', 2000);
  usePrefetchRoute('/dashboard/monitor/lecturas', 4200);
  usePrefetchRoute('/dashboard/operaciones/precios-cargo', 4000);

  return <DashboardComponent />;
}
```

**Estrategia:**
1. Dashboard → Prefetch rutas más visitadas
2. Contratos → Prefetch crear/editar
3. Monitor → Prefetch importar lecturas

**Impacto:**
- Navegación instantánea a rutas prefetched
- Mejor UX percibida

---

## 🔍 **Phase 5.4: Optimización de Assets**

### **1. Iconos**

#### **Problema Actual**
```typescript
// Importar todos los iconos de lucide-react
import { Plus, Edit, Trash, ... } from 'lucide-react';
```

**Solución:** Ya está optimizado con tree-shaking de lucide-react ✅

### **2. Imágenes (si las hay)**

```typescript
// Lazy loading de imágenes
<img 
  src="/logo.png" 
  loading="lazy" 
  decoding="async"
  alt="Logo"
/>
```

### **3. Fonts**

```css
/* Preload critical fonts */
<link 
  rel="preload" 
  href="/fonts/inter.woff2" 
  as="font" 
  type="font/woff2" 
  crossorigin
/>
```

---

## 🔍 **Phase 5.5: Debouncing en Búsquedas**

### **Problema**
Búsquedas en tiempo real causan re-renders en cada tecla

### **Solución**

```typescript
// app/hooks/use-debounce.ts
import { useEffect, useState } from 'react';

export function useDebounce<T>(value: T, delay = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
}
```

#### **Uso**

```typescript
// En componentes con búsqueda
const [searchTerm, setSearchTerm] = useState('');
const debouncedSearch = useDebounce(searchTerm, 300);

const filteredData = useMemo(
  () => data.filter(item => item.name.includes(debouncedSearch)),
  [data, debouncedSearch] // ← Usa debounced en vez de searchTerm
);
```

**Componentes que se benefician:**
- monitor-lecturas (búsqueda de medidores)
- contratos (búsqueda de clientes)
- clientes (búsqueda general)

**Impacto:**
- Re-renders: -70% durante búsqueda
- CPU: -60% durante typing

---

## 📊 **Impacto Esperado - Phase 5**

### **Por Optimización**

| Optimización | Bundle | Memoria | CPU | UX |
|--------------|--------|---------|-----|-----|
| Excel lazy load | -500 KB | - | - | ✅ |
| Virtual Scrolling | - | -80% | -95% | +++++ |
| Prefetching | - | - | - | +++++ |
| Debouncing | - | - | -60% | ++++ |

### **Total Acumulado (Phases 1-5)**

| Métrica | Phase 1-4 | Phase 5 | Total |
|---------|-----------|---------|-------|
| Bundle Size | -25% | -30% | **-55%** |
| FCP/TTI | -30% | -10% | **-40%** |
| Re-renders | -65% | -20% | **-85%** |
| CPU Usage | -35% | -40% | **-75%** |
| Memoria | - | -60% | **-60%** |
| UX Score | +45% | +30% | **+75%** |

---

## 📋 **Plan de Implementación**

### **Prioridad Alta (1-2 horas)**
1. ✅ Lazy load de xlsx (Excel export)
2. ✅ Virtual Scrolling en monitor-lecturas
3. ✅ Debouncing en búsquedas

### **Prioridad Media (2-3 horas)**
4. ⏳ Virtual Scrolling en contratos
5. ⏳ Virtual Scrolling en medidores
6. ⏳ Prefetching de rutas comunes

### **Prioridad Baja (1 hora)**
7. ⏳ Optimización de fonts
8. ⏳ Lazy load de Chart.js (si se usa)

---

## ✅ **Checklist de Implementación**

### **Code Splitting**
- [ ] Lazy load xlsx en exports
- [ ] Lazy load Chart.js (si aplica)
- [ ] Lazy load date pickers complejos

### **Virtual Scrolling**
- [ ] Instalar @tanstack/react-virtual
- [ ] Crear VirtualizedDataTable component
- [ ] Implementar en monitor-lecturas
- [ ] Implementar en contratos
- [ ] Implementar en medidores

### **Prefetching**
- [ ] Crear usePrefetchRoute hook
- [ ] Implementar en Dashboard
- [ ] Implementar en rutas principales

### **Debouncing**
- [ ] Crear useDebounce hook
- [ ] Implementar en búsquedas de monitor-lecturas
- [ ] Implementar en búsquedas de contratos
- [ ] Implementar en búsquedas de clientes

---

## 🎯 **Próximos Pasos**

1. **Implementar optimizaciones de Prioridad Alta**
2. **Medir impacto con Lighthouse**
3. **Ajustar según métricas reales**
4. **Documentar resultados**

---

**Fecha:** 21 de Octubre, 2025  
**Versión:** Phase 5 - Planning  
**Estado:** 📋 Listo para implementar
