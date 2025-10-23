# Mejoras Implementadas: Módulo de Contratos - Facturas y Lecturas

## 📋 Resumen General

Se han implementado mejoras significativas en el módulo de consulta de contratos, específicamente en las secciones de **Facturas** y **Lecturas**, agregando nuevas funcionalidades de exportación y visualizaciones mejoradas.

---

## 🎯 Funcionalidades Implementadas

### 1. **Hook de Exportación a PDF** (`use-export-pdf.ts`)

Se creó un hook personalizado para generar documentos PDF profesionales con:

- ✅ Generación de PDFs con jsPDF y jspdf-autotable
- ✅ Soporte para múltiples secciones (KPIs, tablas, texto, gráficos)
- ✅ Formato profesional con encabezados, pies de página y numeración
- ✅ Orientación configurable (portrait/landscape)
- ✅ Información de empresa personalizable
- ✅ Formato automático de columnas y anchos
- ✅ Estilos personalizados con colores y fuentes
- ✅ Manejo de paginación automática

**Características Destacadas:**

```typescript
- Soporte para KPIs visuales
- Tablas con formato automático
- Secciones de texto con wrap automático
- Placeholder para gráficos
- Footer con numeración de páginas
```

---

### 2. **Componente ExportButton Mejorado**

Se actualizó el componente de exportación para incluir:

- ✅ Exportación a **Excel (.xlsx)**
- ✅ Exportación a **CSV (.csv)**
- ✅ **NUEVO:** Exportación a **PDF (.pdf)**
- ✅ Dropdown menu con iconos por tipo de archivo
- ✅ Callback personalizado para exportación PDF
- ✅ Estado de carga durante exportación
- ✅ Validación de datos antes de exportar

---

### 3. **Facturas Analytics - Mejoras Visuales**

#### **KPIs Mejorados (6 tarjetas)**

1. **Total Facturado** - Con gradiente verde esmeralda
2. **Promedio por Factura** - Con gradiente azul
3. **Consumo Total** - Con gradiente púrpura
4. **Precio/kWh** - Con gradiente ámbar
5. **Factura Máxima** - Con gradiente rosa
6. **Tendencia** - Con indicadores visuales y variación porcentual

#### **Gráficos Interactivos (3 tabs)**

1. **Composición**: Gráfico de barras apiladas (Valor Neto + IVA)
2. **Tendencias**: Gráfico combinado con barras y línea de tendencia
3. **Comparativa**: Gráfico de líneas múltiples (Valor Total vs Consumo)

#### **Nuevas Métricas**

- Precio promedio por kWh
- Factura máxima y mínima
- Variación promedio entre períodos
- Consumo total del período

#### **Mejoras en la Tabla**

- Iconos de tendencia en consumo (↑ ↓ ─)
- Colores según fecha de vencimiento
- Formato monetario mejorado
- Virtualización para rendimiento

---

### 4. **Lecturas Analytics - Mejoras Visuales**

#### **KPIs Mejorados (6 tarjetas)**

1. **Consumo Total** - Con gradiente azul
2. **Promedio por Período** - Con gradiente esmeralda
3. **Máximo** - Con gradiente rosa
4. **Mínimo** - Con gradiente cian
5. **Sobreconsumo Total** - Con gradiente ámbar y contador de períodos
6. **Tendencia** - Con indicadores y variación porcentual

#### **Gráficos Interactivos (3 tabs)**

1. **Evolución**: Gráfico de área suave del consumo
2. **Comparativa**: Gráfico de barras apiladas (Energía Base + Sobreconsumo)
3. **Análisis**: Gráfico combinado con barras y línea de tendencia

#### **Nuevas Métricas**

- Total de sobreconsumo acumulado
- Promedio de sobreconsumo
- Períodos con sobreconsumo
- Variación promedio entre períodos

#### **Mejoras en la Tabla**

- Iconos de tendencia con umbrales (10% ↑/↓)
- Badges de severidad en sobreconsumo (Alto/Medio)
- Alertas visuales con colores
- Formato de lecturas en monospace

---

### 5. **Columnas de Tabla Mejoradas**

#### **Facturas (`columns-facturas.tsx`)**

- ✅ Período con formato destacado
- ✅ N° Factura en badge con fuente mono
- ✅ Tarifa en badge secundario
- ✅ Fechas con código de color según vencimiento:
  - 🔴 Vencida (rojo)
  - 🟡 Por vencer (< 7 días, ámbar)
  - ⚪ Normal (gris)
- ✅ Valores con formato monetario y colores:
  - Valor Neto (cian)
  - IVA (gris)
  - Total (verde esmeralda, negrita)
- ✅ Consumo con indicadores de tendencia (↑ ↓ ─)

#### **Lecturas (`columns-lecturas.tsx`)**

- ✅ Período destacado
- ✅ Lecturas en fuente monospace
- ✅ Lectura Actual en azul (destacada)
- ✅ Consumo con indicadores de variación:
  - ↑ Rojo si aumenta > 10%
  - ↓ Verde si disminuye > 10%
  - ─ Gris si es estable
- ✅ Energía Base en verde
- ✅ Sobreconsumo con badges de severidad:
  - **Alto** (> 30%) - Badge rojo con alerta
  - **Medio** (> 15%) - Badge ámbar
  - Sin badge si es bajo

---

## 🎨 Mejoras de UI/UX

### **Diseño Visual**

- 🎨 Gradientes de color en KPIs para diferenciación visual
- 🎨 Iconos contextuales en cada tarjeta
- 🎨 Sistema de colores consistente con modo oscuro
- 🎨 Badges y etiquetas con mejor legibilidad
- 🎨 Separadores y espaciado mejorado

### **Interactividad**

- 🖱️ Tabs para cambiar entre diferentes visualizaciones de gráficos
- 🖱️ Filtros de tiempo con iconos (6m, 1a, 2a, 5a, todo)
- 🖱️ Tabla colapsable para ahorrar espacio
- 🖱️ Tooltips informativos en gráficos
- 🖱️ Dropdown de exportación con iconos por formato

### **Responsividad**

- 📱 Grid adaptativo para KPIs (2-3-6 columnas)
- 📱 Filtros que se ajustan en móvil
- 📱 Gráficos con altura responsiva
- 📱 Tablas con scroll horizontal en móvil

---

## 📊 Exportación de Datos

### **Formatos Disponibles**

#### **Excel (.xlsx)**

- Encabezados con formato
- Anchos de columna automáticos
- Valores formateados correctamente
- Nombre de archivo con fecha

#### **CSV (.csv)**

- Codificación UTF-8 con BOM
- Compatible con Excel
- Valores entre comillas
- Separadores correctos

#### **PDF (.pdf)** ⭐ NUEVO

- **Sección de KPIs**: Grid visual con métricas principales
- **Tabla de datos**: Formato profesional con paginación
- **Encabezado**: Título, subtítulo, y fecha de generación
- **Información de empresa**: Personalizable
- **Orientación landscape**: Para mejor visualización
- **Numeración de páginas**: Pie de página automático

### **Ejemplo de Uso**

```typescript
// Exportar facturas a PDF
<ExportButton
  data={detalleFacturas}
  columns={facturasColumns}
  filename={`facturas_contrato_${contratoId}`}
  size='sm'
  enablePDF={true}
  onPDFExport={handlePDFExport}
/>
```

---

## 🔧 Tecnologías Utilizadas

- **React 19** - Framework principal
- **TypeScript** - Tipado estático
- **TanStack Table** - Gestión de tablas
- **TanStack Virtual** - Virtualización de filas
- **Recharts** - Gráficos interactivos
- **jsPDF** - Generación de PDFs
- **jspdf-autotable** - Tablas en PDF
- **xlsx** - Exportación a Excel
- **Tailwind CSS** - Estilos y gradientes
- **Lucide React** - Iconos

---

## 📈 Métricas y Análisis

### **Facturas**

- Total facturado en el período
- Promedio por factura
- Consumo total y promedio
- Precio promedio por kWh
- Factura máxima y mínima
- Tendencia de facturación (↑ ↓ ═)
- Variación porcentual promedio

### **Lecturas**

- Consumo total y promedio
- Consumo máximo y mínimo
- Total de sobreconsumo
- Períodos con sobreconsumo
- Tendencia de consumo (↑ ↓ ═)
- Variación porcentual promedio
- Análisis energía base vs sobreconsumo

---

## 📁 Archivos Modificados/Creados

### **Nuevos Archivos**

1. `app/hooks/shared/use-export-pdf.ts` - Hook de exportación PDF
2. `MEJORAS_CONTRATO_FACTURAS_LECTURAS.md` - Este documento

### **Archivos Modificados**

1. `app/components/shared/export-button.tsx` - Agregado soporte PDF
2. `app/components/reportes/consultar-contrato/contrato/facturas-analytics-simple.tsx` - Mejoras visuales
3. `app/components/reportes/consultar-contrato/contrato/lecturas-analytics-simple.tsx` - Mejoras visuales
4. `app/components/reportes/consultar-contrato/contrato/columns-facturas.tsx` - Mejores formatos
5. `app/components/reportes/consultar-contrato/contrato/columns-lecturas.tsx` - Mejores formatos

---

## ✅ Checklist de Funcionalidades

- [x] Hook de exportación a PDF
- [x] Exportación PDF de facturas
- [x] Exportación PDF de lecturas
- [x] Exportación Excel mejorada
- [x] Exportación CSV mejorada
- [x] KPIs con gradientes y colores
- [x] Gráficos interactivos con tabs
- [x] Múltiples visualizaciones de datos
- [x] Indicadores de tendencia
- [x] Badges de severidad
- [x] Tablas con virtualización
- [x] Columnas con formatos mejorados
- [x] Filtros de tiempo
- [x] Responsividad completa
- [x] Modo oscuro soportado
- [x] Sin errores de linting
- [x] TypeScript completamente tipado

---

## 🚀 Próximas Mejoras Sugeridas

1. **Gráficos en PDF**: Capturar gráficos con html2canvas
2. **Comparación de períodos**: Vista lado a lado
3. **Alertas automáticas**: Notificaciones de anomalías
4. **Predicciones mejoradas**: ML para proyecciones
5. **Dashboard personalizable**: Drag & drop de widgets
6. **Exportación programada**: Envío automático por email
7. **Integración con BI**: Conectores para Power BI / Tableau

---

## 📞 Soporte

Para cualquier duda o sugerencia sobre estas mejoras, contactar al equipo de desarrollo.

---

## 🔄 Actualizaciones Posteriores

### **Versión 2.0.0 - Manejo de Datos Reales**

Se realizaron actualizaciones críticas para manejar correctamente los datos reales del backend:

📄 **Ver documento completo**: [`ACTUALIZACION_DATOS_REALES.md`](./ACTUALIZACION_DATOS_REALES.md)

**Cambios principales:**

- ✅ Manejo de valores `null` en todos los campos
- ✅ Detección de períodos pendientes (sin lectura cerrada)
- ✅ Validación de datos antes de cálculos
- ✅ Indicadores visuales para estados de datos:
  - 🟡 **Pendiente** - Lectura actual sin cerrar
  - ⚫ **Sin lectura** - Período sin datos
  - 🔵 **Válido** - Datos completos y verificados
- ✅ Filtrado de lecturas válidas para análisis
- ✅ Nuevo contador: "X registros - Y con consumo"
- ✅ Badges de severidad para sobreconsumos

**Casos manejados:**

- Períodos actuales sin cerrar (`fechaLectura: "-"`)
- Lecturas con valores `null`
- Facturas duplicadas en mismo período
- Valores en 0 vs valores `null`

---

**Fecha de Implementación**: Octubre 2025  
**Versión Inicial**: 1.0.0  
**Versión Actual**: 4.0.0  
**Estado**: ✅ Completado y Actualizado

---

## Versión 3.0.0 - Dashboard Avanzado de Lecturas

**Fecha**: Octubre 2025

### 🎯 Nuevo Tab: Dashboard de Lecturas

Se ha agregado una nueva pestaña completa con 7 visualizaciones avanzadas para análisis profundo del consumo eléctrico.

**Archivo nuevo**: `app/components/reportes/consultar-contrato/contrato/lecturas-dashboard.tsx`

### 📊 Visualizaciones Implementadas

#### 1. KPIs Mejorados (4 Cards)

Reemplazando los 6 KPIs anteriores:

1. **Promedio Mensual** - Consumo promedio por período
2. **Consumo Máximo** - Valor más alto con período específico
3. **Consumo Mínimo** - Valor más bajo con período específico
4. **Proyección 102025** - Estimación inteligente:
   - 70% promedio últimos 3 meses
   - 30% promedio mismo mes años anteriores
   - Badge: Alta / Media / Baja

#### 2. Consumo Mensual (Barras)

- Barras **ROJAS**: Por encima del promedio
- Barras **AZULES**: Por debajo del promedio
- Visualización rápida de desviaciones

#### 3. Evolución del Consumo (Líneas)

- Línea sólida azul: Consumo real
- Línea punteada verde: Promedio constante
- Identifica tendencias y patrones

#### 4. Lecturas del Medidor (Área)

- Área ámbar: Lecturas acumuladas
- Línea violeta: Lecturas anteriores
- Visualiza crecimiento del contador

#### 5. Comparativa Año a Año (Barras Agrupadas)

- Agrupa por mes (01-12)
- Barras diferenciadas por año
- Colores: 2023 (índigo), 2024 (violeta), 2025 (azul)
- Caso especial: Si solo 1 año → mensaje informativo

#### 6. Base vs Sobreconsumo (Barras Apiladas)

- Verde: Energía base
- Rojo: Sobreconsumo
- Solo períodos con sobreconsumo > 0
- Caso especial: Sin sobreconsumo → mensaje informativo

#### 7. Heatmap Calendario (Estilo GitHub)

- Grid Años x Meses (12 columnas)
- 5 niveles de intensidad:
  - Nivel 0: Gris claro (sin datos)
  - Nivel 1-4: Verde claro → verde muy oscuro
- Tooltip en hover: mes/año + consumo exacto
- Leyenda de colores

### 🔧 Características Técnicas

**Filtrado de datos**:

```typescript
consumoPeriodo != null && consumoPeriodo > 0;
```

**Parseo de períodos**:

```typescript
const extraerAnoMes = (periodo: string) => {
  const mes = periodo.substring(0, 2); // MM
  const ano = periodo.substring(2, 6); // AAAA
  return { mes, ano };
};
```

**Performance**:

- `useMemo` para cálculos pesados
- Filtrado eficiente por rango de tiempo
- Procesamiento único de datos válidos

**Responsive**:

- Grid KPIs: 1 col (mobile) → 2 (tablet) → 4 (desktop)
- Textos abreviados en tabs mobile
- Gráficas altura fija, ancho responsivo

### 📝 Archivos Modificados

**1. Nuevo componente**: `lecturas-dashboard.tsx` (~800 líneas)

**2. Actualizado**: `contrato-component.tsx`

- Import: `import LecturasDashboard from './lecturas-dashboard'`
- TabsList: `grid-cols-5` → `grid-cols-6`
- Nuevo TabsTrigger con icono `BarChart3`
- Nuevo TabsContent con el dashboard

### ✅ Casos de Uso Validados

- ✅ Período actual sin cerrar (102025) → proyección calculada
- ✅ Múltiples años → comparativa funcional
- ✅ Un solo año → mensaje apropiado
- ✅ Sin sobreconsumo → mensaje apropiado
- ✅ Valores null → filtrados correctamente
- ✅ Filtros de tiempo (6m, 1a, 2a, 5a, todo)
- ✅ Heatmap con todos los años disponibles

### 🎨 Paleta de Colores

- **Azul** (#3b82f6): Consumo principal
- **Verde** (#10b981): Promedio, energía base
- **Rojo** (#ef4444): Sobreconsumo, alertas
- **Ámbar** (#f59e0b): Proyecciones, lecturas actuales
- **Violeta** (#8b5cf6): Lecturas anteriores, año 2024
- **Índigo** (#6366f1): Año 2023
- **Cyan** (#06b6d4): Mínimos
- **Rose** (#f43f5e): Máximos

---

## Versión 4.2.0 - Sistema de Filtrado Optimizado y Simplificación del Dashboard

**Fecha**: Octubre 2025

### 🎯 Mejoras Implementadas

Se ha optimizado el **sistema de filtrado** y simplificado el dashboard, eliminando visualizaciones no útiles y mejorando la búsqueda por mes para análisis estacional.

### ⚡ Cambios Principales

#### 1. Búsqueda "Por Mes" Optimizada ⭐

**Antes**: Mostraba 12 meses móviles hasta el periodo seleccionado  
**Ahora**: Muestra todos los datos del mes seleccionado a través de todos los años disponibles

```typescript
// Filtro anterior (12 meses móviles)
if (tipoVista === 'mes' && periodoSeleccionado) {
  const periodosAMostrar = periodos.slice(Math.max(0, index - 11), index + 1);
  return facturas.filter(f => periodosAMostrar.includes(f.periodo));
}

// Filtro nuevo (todos los años del mismo mes)
if (tipoVista === 'mes') {
  return facturas.filter(
    f => parseInt(extraerMes(f.periodo)) === mesSeleccionado
  );
}
```

**Ejemplo**:

- Usuario selecciona "Enero"
- Dashboard muestra: Enero 2016, Enero 2017, Enero 2018, Enero 2019... hasta el último Enero disponible
- Perfecto para análisis estacional y comparativas interanuales

**Interfaz**:

```typescript
<select value={mesSeleccionado} onChange={e => setMesSeleccionado(parseInt(e.target.value))}>
  <option value={1}>Enero</option>
  <option value={2}>Febrero</option>
  ...
  <option value={12}>Diciembre</option>
</select>
<span className='italic'>(muestra todos los años disponibles para este mes)</span>
```

#### 2. Eliminación de Proyección Financiera ❌

**Razón**: La proyección financiera (gráfica 8) no proporcionaba información útil para la toma de decisiones.

**Elementos removidos**:

- Función `calcularProyeccion()` con regresión lineal
- Toda la lógica de cálculo de proyección
- Gráfica de proyección con líneas sólidas/punteadas
- Badge con total proyectado
- Estados `proyeccion` y `tieneProyeccion` del `useMemo`

**Código eliminado**:

```typescript
// Función de regresión lineal (eliminada)
const calcularProyeccion = (historico: number[], mesesFuturos: number = 3): number[] => { ... }

// Lógica de cálculo (eliminada)
const tieneProyeccion = facturasOrdenadas.length >= 12;
let proyeccion: any[] = [];
if (tieneProyeccion) { ... }

// Return simplificado (sin proyeccion)
return {
  ...otrosDatos,
  // proyeccion: [], - REMOVIDO
  // tieneProyeccion: false - REMOVIDO
};
```

**Resultado**: Dashboard más limpio y enfocado en datos reales históricos.

#### 3. Descripción Actualizada

- **Antes**: "Análisis económico y proyecciones de facturación"
- **Ahora**: "Análisis económico y correlación consumo-costo"

### 📊 Nuevos Modos de Visualización

#### 1. Vista General (Default)

- **Rangos amplios**: 6 meses, 1 año, 2 años, 5 años, Todo
- Ideal para análisis de tendencias a largo plazo
- Muestra todos los datos dentro del rango seleccionado

#### 2. Vista por Año

- **Selector de año**: Desplegable con todos los años disponibles
- Filtra y muestra únicamente los datos del año seleccionado (12 meses)
- Perfecto para análisis anual detallado
- Comparativas más claras entre meses del mismo año

#### 3. Vista por Mes ⭐ (MEJORADO)

- **Selector de mes**: Desplegable con los 12 meses del año (Enero - Diciembre)
- Muestra **TODOS los datos** del mes seleccionado a través de todos los años disponibles
- Ejemplo: Si selecciona "Enero", verá Enero 2016, Enero 2017, Enero 2018... etc.
- Perfecto para análisis estacional y comparativas interanuales del mismo mes

### 🔧 Implementación Técnica Actualizada

**Estados modificados**:

```typescript
// ANTES
const [periodoSeleccionado, setPeriodoSeleccionado] = useState<string>('');

// AHORA
const [mesSeleccionado, setMesSeleccionado] = useState<number>(1); // Default enero
```

**Inicialización simplificada**:

```typescript
// ANTES
useMemo(() => {
  if (anosDisponibles.length > 0 && !anoSeleccionado) {
    setAnoSeleccionado(anosDisponibles[0]);
  }
  if (periodosDisponibles.length > 0 && !periodoSeleccionado) {
    setPeriodoSeleccionado(periodosDisponibles[0]);
  }
}, [
  anosDisponibles,
  periodosDisponibles,
  anoSeleccionado,
  periodoSeleccionado
]);

// AHORA
useMemo(() => {
  if (anosDisponibles.length > 0 && !anoSeleccionado) {
    setAnoSeleccionado(anosDisponibles[0]);
  }
}, [anosDisponibles, anoSeleccionado]);
```

**Dependencias del useMemo**:

```typescript
}, [
  detalleFacturas,
  detalleLecturas,
  tipoVista,
  timeRange,
  anoSeleccionado,
  mesSeleccionado, // Cambiado de periodoSeleccionado
  mesHeatmap
]);
```

### ✅ Ventajas de los Cambios

1. **Análisis Estacional Mejorado**: Comparar el mismo mes entre años es ahora trivial
2. **Simplicidad**: Dashboard más limpio sin proyecciones de dudosa utilidad
3. **Performance**: Menos cálculos complejos (regresión lineal eliminada)
4. **UX Mejorada**: Selector de mes más intuitivo que selector de periodos
5. **Código Más Limpio**: ~100 líneas de código eliminadas

### 🚧 Casos de Uso Actualizados

**Caso 1: Análisis anual**

- Usuario selecciona "Por Año" → 2024
- Ve solo los 12 meses de 2024
- Comparativas más significativas

**Caso 2: Análisis estacional** ⭐ (NUEVO)

- Usuario selecciona "Por Mes" → Enero
- Ve todos los Eneros disponibles (2016-2024)
- Identifica patrones estacionales y tendencias anuales

**Caso 3: Vista histórica completa**

- Usuario selecciona "General" → Todo
- Ve todos los datos históricos disponibles
- Tendencias a largo plazo

### 📝 Archivos Modificados

**1. `facturas-dashboard.tsx` (~1340 líneas, reducido desde ~1440)**

Cambios:

- Estados: `periodoSeleccionado` → `mesSeleccionado`
- Función `calcularProyeccion()` eliminada
- Lógica de proyección eliminada (~40 líneas)
- Gráfica 8 completa eliminada (~110 líneas)
- Filtro "Por Mes" optimizado
- Interfaz del selector de mes actualizada

### 📊 Dashboard Actualizado

**Total de visualizaciones**: 7 (antes: 9)

1. Consumo vs Facturación (Dual Axis)
2. Evolución de Facturación (Área)
3. Composición de Factura (Barras Apiladas)
4. Costo por kWh (Línea)
5. Scatter Plot - Consumo vs Costo
6. Comparativa Mensual (3 Cards)
7. Heatmap de Eficiencia

**Eliminadas**:

- ~~Proyección Financiera (Forecast)~~
- ~~Timeline de Vencimientos~~

---

## Versión 4.1.0 - Sistema de Filtrado Mejorado para Dashboard Financiero

**Fecha**: Octubre 2025

### 🎯 Mejora: Sistema de Filtrado Global

Se ha implementado un **sistema de filtrado inteligente** que permite visualizar los datos de manera más granular y comprensible, reemplazando el selector de rango único por tres modos de visualización distintos.

### 📊 Modos de Visualización

#### 1. Vista General (Default)

- **Rangos amplios**: 6 meses, 1 año, 2 años, 5 años, Todo
- Ideal para análisis de tendencias a largo plazo
- Muestra todos los datos dentro del rango seleccionado

#### 2. Vista por Año

- **Selector de año**: Desplegable con todos los años disponibles
- Filtra y muestra únicamente los datos del año seleccionado (12 meses)
- Perfecto para análisis anual detallado
- Comparativas más claras entre meses del mismo año

#### 3. Vista por Mes

- **Selector de periodo**: Desplegable con todos los periodos disponibles (formato "Mes Año")
- Muestra los últimos 12 meses hasta el periodo seleccionado
- Permite análisis de ventana móvil de 12 meses
- Útil para ver evolución hasta un mes específico

### 🔧 Implementación Técnica

**Estados nuevos**:

```typescript
const [tipoVista, setTipoVista] = useState<'general' | 'ano' | 'mes'>(
  'general'
);
const [anoSeleccionado, setAnoSeleccionado] = useState<string>('');
const [periodoSeleccionado, setPeriodoSeleccionado] = useState<string>('');
```

**Función de filtrado unificada**:

```typescript
const filterData = (facturas: any[]) => {
  if (tipoVista === 'ano' && anoSeleccionado) {
    return facturas.filter(f => extraerAno(f.periodo) === anoSeleccionado);
  } else if (tipoVista === 'mes' && periodoSeleccionado) {
    // Tomar 12 meses hasta el periodo seleccionado
    const periodosAMostrar = periodos.slice(Math.max(0, index - 11), index + 1);
    return facturas.filter(f => periodosAMostrar.includes(f.periodo));
  } else {
    return filterByTimeRange(facturas, timeRange);
  }
};
```

**Inicialización automática**:

```typescript
useMemo(() => {
  if (anosDisponibles.length > 0 && !anoSeleccionado) {
    setAnoSeleccionado(anosDisponibles[0]); // Año más reciente
  }
  if (periodosDisponibles.length > 0 && !periodoSeleccionado) {
    setPeriodoSeleccionado(periodosDisponibles[0]); // Periodo más reciente
  }
}, [anosDisponibles, periodosDisponibles]);
```

### 📝 Interfaz de Usuario

**Selector de Tipo de Vista** (3 botones horizontales):

- General | Por Año | Por Mes

**Filtros Contextuales**:

- Si selecciona "General": Muestra botones de rango (6m, 1a, 2a, 5a, Todo)
- Si selecciona "Por Año": Muestra dropdown con años disponibles
- Si selecciona "Por Mes": Muestra dropdown con periodos + texto explicativo

### ✅ Ventajas del Nuevo Sistema

1. **Claridad Visual**: Los gráficos ya no muestran datos superpoblados
2. **Análisis Focalizado**: Permite concentrarse en periodos específicos
3. **Flexibilidad**: Tres niveles de granularidad según necesidad
4. **Mejor UX**: Selectores intuitivos con retroalimentación visual
5. **Performance**: Filtra datos antes de procesarlos, reduciendo carga

### 🚧 Casos de Uso

**Caso 1: Análisis anual**

- Usuario selecciona "Por Año" → 2024
- Ve solo los 12 meses de 2024
- Comparativas más significativas

**Caso 2: Seguimiento reciente**

- Usuario selecciona "Por Mes" → Dic 2024
- Ve Ene 2024 a Dic 2024 (12 meses móviles)
- Contexto suficiente para tendencias

**Caso 3: Vista histórica completa**

- Usuario selecciona "General" → Todo
- Ve todos los datos históricos disponibles
- Tendencias a largo plazo

### 📌 Nota Importante: Heatmap

El **Heatmap de Eficiencia** mantiene su propio selector de mes independiente, permitiendo comparar el mismo mes entre diferentes años sin importar el filtro global activo.

---

## 🔮 Fase 2: Exportación Avanzada a PDF (Pendiente)

### Funcionalidades Planificadas

#### Exportación de Dashboard con Filtros

- **Informe PDF personalizado** según el filtro activo:
  - Vista General → Rango seleccionado
  - Por Año → Año completo
  - Por Mes → 12 meses móviles

#### Opciones de Exportación

1. **Rango Personalizado**:

   - Selector de fecha inicio y fin
   - Genera PDF con datos del rango específico

2. **Comparativo Anual**:

   - Seleccionar múltiples años
   - PDF con gráficos comparativos entre años

3. **Configuración de Contenido**:
   - Checkboxes para incluir/excluir gráficas específicas
   - Opciones de orientación (vertical/horizontal)
   - Inclusión de tablas de datos raw

#### Formato del PDF

- **Portada**: Logo, título, rango de fechas, fecha de generación
- **Resumen Ejecutivo**: KPIs principales
- **Gráficas Seleccionadas**: Capturas de las visualizaciones
- **Tablas de Datos**: Datos raw en formato tabular
- **Conclusiones**: Automáticas basadas en análisis de datos

#### Implementación Técnica (Propuesta)

```typescript
interface ExportConfig {
  rangoFechas?: { inicio: string; fin: string };
  anos?: string[];
  incluirGraficas: string[]; // IDs de gráficas a incluir
  incluirTablas: boolean;
  orientacion: 'portrait' | 'landscape';
  formatoFecha: string;
}

const exportarDashboardPDF = (config: ExportConfig) => {
  // 1. Filtrar datos según config
  // 2. Renderizar gráficas a canvas
  // 3. Generar PDF con jsPDF
  // 4. Agregar secciones según config
  // 5. Descargar archivo
};
```

**Estimación**: 3-5 días de desarrollo
**Prioridad**: Media
**Dependencias**: Sistema de filtrado actual (completado ✅)

---

## Versión 4.0.0 - Dashboard Financiero de Facturas

**Fecha**: Octubre 2025

### 🎯 Nuevo Tab: Dashboard Financiero

Se ha agregado una nueva pestaña completa con 9 visualizaciones avanzadas que combinan datos de consumo y facturación para análisis económico profundo.

**Archivo nuevo**: `app/components/reportes/consultar-contrato/contrato/facturas-dashboard.tsx`

### 📊 Visualizaciones Implementadas

**Formato de Eje X Mejorado**: Todas las gráficas muestran "Mes Año" (ej: "Ene 2024") en lugar del período MMAAAA para mayor claridad.

#### KPIs Financieros (4 cards)

1. **Factura Promedio** - Promedio de valorTotal por período
2. **Consumo Promedio** - Promedio de consumo en kWh
3. **Costo Promedio/kWh** - Costo unitario de energía
4. **Total Año Actual** - Suma de valorTotal del año + variación vs mes anterior

#### 1. Consumo vs Facturación (Dual Axis)

- ComposedChart con dos ejes Y independientes
- Barras azules: Consumo (kWh)
- Línea verde: Valor facturado ($)
- Visualiza correlación directa consumo-costo

#### 2. Evolución de Facturación (Área)

- AreaChart con gradiente
- Toggle: Ver Valor Total o Valor Neto
- Tendencia histórica del gasto

#### 3. Composición de Factura (Barras Apiladas)

- Valor Neto (cyan) + IVA (rojo)
- Muestra proporción de impuestos
- Útil para análisis fiscal

#### 4. Costo por kWh (Línea)

- Línea sólida ámbar: Costo real
- Línea punteada verde: Promedio histórico
- Detecta variaciones en tarifas
- Alerta cuando costo > promedio \* 1.15

#### 5. Scatter Plot - Consumo vs Costo

- Cada punto = un período
- Eje X: Consumo (kWh)
- Eje Y: Valor facturado ($)
- Detecta outliers y anomalías
- Tooltip con período + costo/kWh

#### 6. Comparativa Mensual (3 Cards)

**Card 1: vs Promedio Histórico**

- Valor actual vs promedio
- % de variación con badge

**Card 2: vs Año Anterior**

- Mismo mes del año pasado
- Icono de tendencia (↑↓)
- Si no hay datos: mensaje informativo

**Card 3: Eficiencia Energética**

- Costo/kWh actual vs promedio
- Indicador de eficiencia

#### 7. Heatmap de Eficiencia

**Selector de Mes Dinámico**: Permite comparar el mismo mes entre diferentes años

- Grid: Años (filas) x Métricas (columnas)
- Métricas: Valor Total, Consumo, Costo/kWh, IVA
- Selector desplegable con todos los meses del año
- 5 niveles de color:
  - Verde oscuro (#166534): Valores bajos
  - Verde (#22c55e): Valores bajo-medio
  - Amarillo (#eab308): Valores medios
  - Naranja (#f97316): Valores medio-alto
  - Rojo (#dc2626): Valores altos
- Normalización (0-100) por métrica para el mes seleccionado
- Compara histórico del mismo mes entre años

#### ~~8. Proyección Financiera~~ (Eliminado en v4.2.0)

**Nota**: Esta visualización fue removida en la versión 4.2.0 porque no proporcionaba información útil para la toma de decisiones.

#### ~~9. Timeline de Vencimientos~~ (Eliminado)

**Nota**: Esta visualización fue removida porque no es posible verificar el estado real de pago de las facturas sin integración con sistema de pagos. Los estados calculados por fecha de vencimiento no reflejan la realidad del pago efectivo.

### 🔧 Características Técnicas

**Correlación de datos**:

```typescript
const lecturasMap = new Map(detalleLecturas.map(l => [l.periodo, l]));
const correlacionados = facturas.map(f => ({
  ...f,
  tieneLectura: lecturasMap.has(f.periodo)
}));
```

**Cálculo de Costo/kWh**:

```typescript
const costoPorKwh = consumoPeriodo > 0 ? valorTotal / consumoPeriodo : 0;
// Maneja divisiones por 0
```

**Parseo de fechas**:

```typescript
// Formato: DD/MM/YYYY HH:MM:SS
const [datePart] = fechaStr.split(' ');
const [day, month, year] = datePart.split('/');
const fecha = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
```

**Performance**:

- `useMemo` para todos los cálculos complejos
- Filtrado eficiente por rango de tiempo
- Procesamiento único de datos válidos

**Responsive**:

- Grid 2 columnas en desktop, 1 en mobile
- Cards adaptativas
- Heatmap con scroll horizontal si necesario

### 📝 Archivos Modificados

**1. Nuevo componente**: `facturas-dashboard.tsx` (~1340 líneas)

**Mejoras implementadas**:

- Selector de mes para Heatmap de Eficiencia
- Formato de fecha "Mes Año" en todos los ejes X
- Búsqueda "Por Mes" optimizada para análisis estacional
- Proyección financiera removida (no útil) - v4.2.0
- Timeline de vencimientos removido (no verificable)

**2. Actualizado**: `contrato-component.tsx`

- Import: `import FacturasDashboard from './facturas-dashboard'`
- Import icono: `import { DollarSign } from 'lucide-react'`
- TabsList: `grid-cols-6` → `grid-cols-7`
- Nuevo TabsTrigger con icono `DollarSign`
- Nuevo TabsContent con props `detalleFacturas` y `detalleLecturas`

### ✅ Casos Especiales Manejados

- ✅ Facturas con valorTotal = 0 → excluidas de promedios
- ✅ Consumo = 0 → costo/kWh = 0 (no incluido en scatter plot)
- ✅ Sin lecturas correlacionadas → solo gráficas de facturación
- ✅ Sin datos año anterior → mensaje en comparativa
- ✅ Ejes X con formato legible (Mes Año)
- ✅ Heatmap dinámico por mes seleccionado
- ✅ Outliers visibles en scatter plot
- ✅ Análisis estacional por mes (v4.2.0)

### 🎨 Paleta de Colores

- **Emerald** (#10b981): Valores monetarios, positivos
- **Blue** (#3b82f6): Consumo, datos históricos
- **Amber** (#f59e0b): Costo/kWh, proyecciones, alertas
- **Violet** (#8b5cf6): Totales año, scatter plot
- **Cyan** (#0891b2): Valor neto
- **Red** (#dc2626): IVA, negativos, vencidos
- **Rose** (#f43f5e): Variaciones negativas
- **Verde oscuro** (#166534): Heatmap nivel bajo

### 🧮 Fórmulas Implementadas

**Costo Promedio/kWh**:

```
costoPromedioKwh = sum(valorTotal) / sum(consumoPeriodo)
```

**Variación Porcentual**:

```
variacion = ((actual - anterior) / anterior) * 100
```

**Normalización Heatmap**:

```
normalizado = ((valor - min) / (max - min)) * 100
```

### 📊 Datos Procesados

El dashboard procesa y correlaciona:

- **Facturas**: periodo, valorTotal, valorNeto, iva, consumoPeriodo
- **Lecturas**: periodo (para correlación)
- **Estados**: Calculados dinámicamente basados en fechas
- **Filtros**: General (rangos), Por Año, Por Mes (análisis estacional)

### 💡 Insights que Proporciona

1. **Eficiencia de gasto**: Identifica períodos con alto costo/kWh
2. **Tendencias financieras**: Visualiza si el gasto aumenta o disminuye
3. **Anomalías**: Scatter plot detecta períodos atípicos
4. **Comparativas**: vs promedio histórico y vs año anterior
5. **Análisis estacional**: Compara mismo mes entre diferentes años (v4.2.0)
6. **Comparación año a año**: Heatmap permite comparar mismo mes entre años
7. **Impacto fiscal**: Ve proporción de impuestos (IVA vs neto)
8. **Correlación**: Entiende relación directa consumo-costo
