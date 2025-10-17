# 🎨 Sistema de Tematización por Entorno

## 📋 Descripción

Este proyecto implementa un sistema de diferenciación visual entre los entornos de **producción** y **desarrollo**, facilitando la identificación inmediata del entorno en el que se está trabajando.

## 🎯 Características

### ✨ Diferenciación Visual

#### 🔵 Entorno de Producción

- **Colores**: Paleta azul/morada profesional
- **Primary**: `oklch(0.71 0.15 239.15)` - Azul
- **Sin indicadores**: Interfaz limpia sin banners

#### 🟠 Entorno de Desarrollo

- **Colores**: Paleta naranja/cálida para desarrollo
- **Primary**: `oklch(0.65 0.18 35)` - Naranja
- **Indicador visual**: Banner superior con la leyenda "ENTORNO DE DESARROLLO"
- **Badge pulsante**: Animación para llamar la atención

## 📁 Estructura de Archivos

```
app/
├── app.css           # Estilos base para producción
├── app.dev.css       # Estilos específicos para desarrollo (se sobrescriben los de producción)
└── root.tsx          # Punto de entrada que carga los estilos correctos
```

## 🔧 Configuración

### Variables de Entorno

El sistema utiliza la variable `VITE_APP_ENV` para determinar el entorno:

```bash
# Desarrollo
VITE_APP_ENV=development

# Producción
VITE_APP_ENV=production
```

### Vite Config

El archivo `vite.config.ts` expone las variables de entorno al cliente:

```typescript
export default defineConfig({
  define: {
    'import.meta.env.VITE_APP_ENV': JSON.stringify(
      process.env.VITE_APP_ENV || 'production'
    )
  }
});
```

### Docker

#### Producción (`Dockerfile`)

```dockerfile
ARG VITE_APP_ENV=production
ENV VITE_APP_ENV=$VITE_APP_ENV
```

#### Desarrollo (`Dockerfile.dev`)

```dockerfile
ARG VITE_APP_ENV=development
ENV VITE_APP_ENV=$VITE_APP_ENV
```

## 🚀 Uso

### Desarrollo Local

```bash
# Con pnpm
VITE_APP_ENV=development pnpm run dev

# O simplemente (usa DEV por defecto)
pnpm run dev
```

### Docker Compose

#### Producción

```bash
docker-compose -f docker-compose.prod.yml up --build
```

#### Desarrollo

```bash
docker-compose -f docker-compose.dev.yml up --build
```

## 🎨 Paletas de Colores

### Producción (Azul)

```css
--primary: oklch(0.71 0.15 239.15); /* Azul profesional */
--sidebar-primary: oklch(0.62 0.15 240.95); /* Azul sidebar */
--accent: oklch(0.92 0.01 87.42); /* Gris neutro */
```

### Desarrollo (Naranja)

```css
--primary: oklch(0.65 0.18 35); /* Naranja cálido */
--sidebar-primary: oklch(0.65 0.18 35); /* Naranja sidebar */
--accent: oklch(0.92 0.02 45); /* Amarillo cálido */
```

## 🔍 Indicadores Visuales

### Banner Superior (Desarrollo)

- **Posición**: Fijo en la parte superior
- **Color**: Naranja (`--env-indicator-bg`)
- **Contenido**: "ENTORNO DE DESARROLLO" + badge del entorno
- **Animación**: Punto pulsante para llamar la atención

### Ajuste de Layout

Cuando el banner está presente, el body recibe la clase `dev-environment` que añade padding superior para evitar que el contenido quede oculto.

## 🎯 Ventajas del Sistema

1. **Identificación Inmediata**: Es imposible confundir en qué entorno estás trabajando
2. **Colores Distintivos**: La paleta completa cambia, no solo un elemento
3. **No Intrusivo**: El indicador es visible pero no molesta
4. **Modo Oscuro Compatible**: Funciona en ambos modos de tema
5. **Zero Config en Dev**: En desarrollo local, automáticamente detecta el entorno
6. **Docker Ready**: Funciona perfectamente con contenedores

## 📝 Personalización

### Cambiar Colores de Desarrollo

Edita `app/app.dev.css` y modifica las variables CSS:

```css
:root {
  --primary: oklch(0.65 0.18 35); /* Tu color preferido */
  /* ... otros colores ... */
}
```

### Cambiar el Indicador

En `app/root.tsx`, puedes modificar el componente `EnvironmentIndicator`:

```tsx
function EnvironmentIndicator() {
  // Personaliza el banner aquí
}
```

### Ocultar el Banner

Si prefieres un badge más discreto, puedes usar la clase `env-badge-corner` en lugar de `env-indicator`.

## 🧪 Testing

Para verificar que el sistema funciona:

1. **Local Dev**: `pnpm run dev` → Deberías ver el banner naranja
2. **Docker Dev**: `docker-compose -f docker-compose.dev.yml up` → Banner naranja
3. **Docker Prod**: `docker-compose -f docker-compose.prod.yml up` → Sin banner, colores azules

## 📊 Impacto en Performance

- **Sin impacto**: Los estilos se cargan de forma condicional en tiempo de build
- **Tamaño**: ~2KB adicionales para `app.dev.css`
- **Runtime**: La detección de entorno es instantánea

## 🔄 Migración de Entornos Existentes

Si tienes contenedores corriendo:

```bash
# Detener contenedores
docker-compose down

# Rebuild con nueva configuración
docker-compose -f docker-compose.dev.yml up --build

# O para producción
docker-compose -f docker-compose.prod.yml up --build
```

## 📚 Referencias

- [Vite Environment Variables](https://vitejs.dev/guide/env-and-mode.html)
- [CSS Custom Properties](https://developer.mozilla.org/en-US/docs/Web/CSS/--*)
- [OKLCH Color Space](https://oklch.com/)

---

**Creado**: 2025-10-17  
**Versión**: 1.0.0  
**Mantenedor**: Tu Equipo de Desarrollo
