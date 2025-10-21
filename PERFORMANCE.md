# ⚡ Performance Optimization Guide - Enerlova Frontend

Este documento describe las optimizaciones de performance implementadas en el proyecto y cómo utilizarlas.

---

## 📋 Tabla de Contenidos

- [Optimizaciones Implementadas](#optimizaciones-implementadas)
- [Análisis de Bundle](#análisis-de-bundle)
- [Code Splitting](#code-splitting)
- [Lazy Loading](#lazy-loading)
- [Mejores Prácticas](#mejores-prácticas)
- [Monitoreo](#monitoreo)

---

## 🚀 Optimizaciones Implementadas

### 1. **Bundle Splitting Estratégico**

El proyecto está configurado para dividir el bundle en chunks optimizados:

```typescript
// vite.config.ts
manualChunks: {
  'react-vendor': ['react', 'react-dom', 'react-router'],
  'ui-vendor': ['@radix-ui/...'],
  'form-vendor': ['react-hook-form', 'zod'],
  'table-vendor': ['@tanstack/react-table'],
  'chart-vendor': ['recharts'],
  'icons-vendor': ['lucide-react'],
  'utils-vendor': ['axios', 'date-fns'],
}
```

**Beneficios:**
- ✅ Carga inicial más rápida
- ✅ Mejor caching del navegador
- ✅ Actualizaciones más eficientes

---

### 2. **Compresión Gzip y Brotli**

Archivos comprimidos automáticamente en build de producción:

```bash
# Archivos generados
build/
├── assets/
│   ├── index-abc123.js      # Original
│   ├── index-abc123.js.gz   # Gzip (~70% reducción)
│   └── index-abc123.js.br   # Brotli (~80% reducción)
```

**Configuración del servidor:**
```nginx
# nginx.conf
gzip on;
gzip_types text/css application/javascript;
brotli on;
brotli_types text/css application/javascript;
```

---

### 3. **Optimización de Dependencias**

Pre-bundling optimizado para desarrollo rápido:

```typescript
optimizeDeps: {
  include: [
    'react',
    'react-dom',
    'react-router',
    '@radix-ui/react-dialog',
    'react-hook-form',
    'zod',
  ],
}
```

---

### 4. **Server Warmup**

Precarga de archivos críticos en desarrollo:

```typescript
server: {
  warmup: {
    clientFiles: [
      './app/root.tsx',
      './app/routes/**/*.tsx',
    ],
  },
}
```

---

## 📊 Análisis de Bundle

### Generar Reporte de Bundle

```bash
# Analizar tamaño del bundle
pnpm run build:analyze

# O directamente
pnpm run perf:analyze
```

Esto generará:
- 📄 `dist/stats.html` - Visualización interactiva del bundle
- 📊 Muestra tamaño de cada chunk
- 🔍 Identifica dependencias grandes

### Interpretar el Reporte

**Buscar:**
- 🔴 Chunks > 500KB (considerar lazy loading)
- 🟡 Dependencias duplicadas
- 🟢 Oportunidades de tree-shaking

**Ejemplo de análisis:**
```
react-vendor.js      150KB  ✅ OK
ui-vendor.js         280KB  ✅ OK
chart-vendor.js      450KB  ⚠️  Considerar lazy loading
administracion.js    600KB  🔴 Dividir en sub-rutas
```

---

## 🎯 Code Splitting

### Estrategia Actual

#### 1. **Vendor Splitting** ✅ Implementado
Librerías separadas por categoría (react, ui, forms, etc.)

#### 2. **Route-based Splitting** 🚧 Próximo paso
Cada ruta carga solo lo necesario

#### 3. **Component-based Splitting** 🚧 Próximo paso
Componentes pesados con lazy loading

---

### Implementar Lazy Loading en Rutas

**Antes:**
```typescript
// app/routes/dashboard/administracion/clientes.tsx
import { ClientesComponent } from '~/components/administracion/clientes';

export default function ClientesRoute() {
  return <ClientesComponent />;
}
```

**Después:**
```typescript
import { lazy, Suspense } from 'react';
import { LoadingSpinner } from '~/components/loading-spinner';

const ClientesComponent = lazy(() => 
  import('~/components/administracion/clientes/clientes-component')
);

export default function ClientesRoute() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <ClientesComponent />
    </Suspense>
  );
}
```

**Beneficios:**
- ✅ Reduce bundle inicial en ~100-200KB por ruta
- ✅ Carga bajo demanda
- ✅ Mejor experiencia en navegación

---

### Lazy Loading de Componentes Pesados

**Componentes candidatos:**
- 📊 Gráficos (Recharts)
- 📋 Tablas grandes (TanStack Table)
- 📝 Editores ricos
- 🗺️ Mapas

**Ejemplo:**
```typescript
// Lazy load de gráfico
const Chart = lazy(() => import('~/components/dashboard/chart'));

function Dashboard() {
  return (
    <div>
      <h1>Dashboard</h1>
      <Suspense fallback={<ChartSkeleton />}>
        <Chart data={data} />
      </Suspense>
    </div>
  );
}
```

---

## 🎨 Mejores Prácticas

### 1. **React.memo para Componentes Pesados**

```typescript
import { memo } from 'react';

// Componente que renderiza tabla grande
export const DataTable = memo(({ data, columns }) => {
  return <TanStackTable data={data} columns={columns} />;
});
```

**Cuándo usar:**
- ✅ Componentes que reciben props complejas
- ✅ Listas o tablas grandes
- ✅ Componentes que no cambian frecuentemente

**Cuándo NO usar:**
- ❌ Componentes simples (< 10 líneas)
- ❌ Componentes que cambian en cada render
- ❌ Componentes sin props

---

### 2. **useMemo para Cálculos Costosos**

```typescript
import { useMemo } from 'react';

function ExpensiveComponent({ data }) {
  // Evita recalcular en cada render
  const processedData = useMemo(() => {
    return data.map(item => ({
      ...item,
      calculated: expensiveCalculation(item)
    }));
  }, [data]);

  return <Table data={processedData} />;
}
```

**Cuándo usar:**
- ✅ Transformaciones de datos complejas
- ✅ Filtrado/ordenamiento de arrays grandes
- ✅ Cálculos matemáticos pesados

---

### 3. **useCallback para Funciones**

```typescript
import { useCallback } from 'react';

function ParentComponent() {
  // Evita recrear función en cada render
  const handleClick = useCallback((id: string) => {
    console.log('Clicked:', id);
  }, []);

  return <ChildComponent onClick={handleClick} />;
}
```

**Cuándo usar:**
- ✅ Funciones pasadas a componentes memoizados
- ✅ Funciones en dependencias de useEffect
- ✅ Event handlers en listas grandes

---

### 4. **Virtual Scrolling para Listas Grandes**

Para tablas con > 100 filas, usar virtualización:

```typescript
import { useVirtualizer } from '@tanstack/react-virtual';

function VirtualTable({ data }) {
  const parentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: data.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 50, // altura estimada de cada fila
  });

  return (
    <div ref={parentRef} style={{ height: '400px', overflow: 'auto' }}>
      <div style={{ height: `${virtualizer.getTotalSize()}px` }}>
        {virtualizer.getVirtualItems().map(virtualRow => (
          <div
            key={virtualRow.index}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: `${virtualRow.size}px`,
              transform: `translateY(${virtualRow.start}px)`,
            }}
          >
            {data[virtualRow.index].name}
          </div>
        ))}
      </div>
    </div>
  );
}
```

**Próximo paso:** Instalar `@tanstack/react-virtual`

---

### 5. **Image Optimization**

```typescript
// Usar loading lazy nativo
<img 
  src="/large-image.jpg" 
  loading="lazy" 
  alt="Description"
/>

// O con librería optimizada
import { Image } from '@unpic/react';

<Image
  src="/large-image.jpg"
  layout="constrained"
  width={800}
  height={600}
  alt="Description"
/>
```

---

## 📈 Monitoreo

### Métricas Clave

| Métrica | Objetivo | Herramienta |
|---------|----------|-------------|
| **First Contentful Paint (FCP)** | < 1.5s | Lighthouse |
| **Largest Contentful Paint (LCP)** | < 2.5s | Lighthouse |
| **Time to Interactive (TTI)** | < 3.0s | Lighthouse |
| **Total Bundle Size** | < 500KB | Bundle Analyzer |
| **Main Thread Blocking** | < 300ms | Chrome DevTools |

---

### Lighthouse Audit

```bash
# Instalar Lighthouse CLI
npm install -g lighthouse

# Ejecutar audit
lighthouse http://localhost:5173 --view

# O usar Chrome DevTools
# F12 → Lighthouse → Analyze page load
```

**Objetivos:**
- 🎯 Performance: 90+
- 🎯 Accessibility: 95+
- 🎯 Best Practices: 90+
- 🎯 SEO: 90+

---

### Chrome DevTools Performance

1. Abrir DevTools (F12)
2. Tab "Performance"
3. Click "Record" 🔴
4. Navegar por la app
5. Stop recording
6. Analizar:
   - 🟡 Long tasks (> 50ms)
   - 🔴 Layout shifts
   - 🟢 Paint timing

---

## 🔧 Comandos Útiles

```bash
# Desarrollo
pnpm dev                    # Servidor de desarrollo

# Build
pnpm build                  # Build de producción
pnpm build:analyze          # Build + análisis de bundle

# Performance
pnpm perf:analyze           # Analizar bundle size
pnpm perf:preview           # Preview de producción

# Análisis
pnpm typecheck              # Verificar tipos (afecta performance)
```

---

## 📊 Checklist de Performance

### Antes de Cada Release

- [ ] Ejecutar `pnpm run build:analyze`
- [ ] Verificar que ningún chunk > 500KB
- [ ] Lighthouse score > 90
- [ ] No hay console.logs en producción
- [ ] Images optimizadas y lazy loaded
- [ ] Fonts preloaded
- [ ] CSS crítico inline (si aplica)

### Optimizaciones Pendientes

- [ ] Implementar lazy loading en rutas principales
- [ ] Virtualizar tablas con > 100 filas
- [ ] Optimizar imágenes con @unpic/react
- [ ] Implementar service worker para caching
- [ ] Configurar CDN para assets estáticos

---

## 🎯 Roadmap de Performance

### Fase 1: Análisis ✅ COMPLETADO
- ✅ Bundle analyzer configurado
- ✅ Compresión gzip/brotli
- ✅ Code splitting estratégico

### Fase 2: Lazy Loading 🚧 EN PROGRESO
- [ ] Lazy load de rutas principales
- [ ] Lazy load de componentes pesados
- [ ] Suspense boundaries

### Fase 3: Optimización Avanzada 📅 PLANIFICADO
- [ ] Virtual scrolling en tablas
- [ ] Image optimization
- [ ] Service Worker
- [ ] Preload critical resources

### Fase 4: Monitoreo 📅 FUTURO
- [ ] Real User Monitoring (RUM)
- [ ] Performance budgets en CI
- [ ] Automated Lighthouse CI

---

## 📚 Recursos

### Documentación
- [Vite Performance](https://vitejs.dev/guide/performance.html)
- [React Performance](https://react.dev/learn/render-and-commit)
- [Web Vitals](https://web.dev/vitals/)

### Herramientas
- [Bundle Analyzer](https://www.npmjs.com/package/rollup-plugin-visualizer)
- [Lighthouse](https://developers.google.com/web/tools/lighthouse)
- [WebPageTest](https://www.webpagetest.org/)

---

## 🤝 Contribuir

Al agregar nuevas features:

1. ✅ Verificar impacto en bundle size
2. ✅ Usar lazy loading para componentes > 50KB
3. ✅ Memoizar componentes pesados
4. ✅ Ejecutar Lighthouse antes de PR

---

**⚡ Performance Optimization Guide v1.0.0**  
**Última actualización:** Octubre 2025  
**Mantenedor:** Equipo Enerlova
