# 🎨 Sistema de Diferenciación Visual de Entornos

> **IMPORTANTE**: Este proyecto implementa un sistema visual para diferenciar los entornos de producción y desarrollo, evitando confusiones al trabajar.

## 📸 Comparativa Visual

### 🔵 PRODUCCIÓN

```
┌────────────────────────────────────────────────┐
│  🏢 Sistema Enerlova                      👤   │  ← Azul Profesional
├────────────────────────────────────────────────┤
│ ┌─────────┐                                    │
│ │ 📊 Menu │  Dashboard Principal               │
│ │  Azul   │  ┌──────────────────────┐          │
│ │         │  │  Gráficos y Datos    │          │
│ │ Items   │  │  (Tema Azul/Morado)  │          │
│ │  Lista  │  └──────────────────────┘          │
│ └─────────┘                                    │
└────────────────────────────────────────────────┘
```

### 🟠 DESARROLLO

```
╔════════════════════════════════════════════════╗
║ 🟠 ● ENTORNO DE DESARROLLO [DEV]              ║  ← Banner Naranja
╚════════════════════════════════════════════════╝
┌────────────────────────────────────────────────┐
│  🔧 Sistema Enerlova (DEV)               👤   │  ← Naranja Cálido
├────────────────────────────────────────────────┤
│ ┌─────────┐                                    │
│ │ 📊 Menu │  Dashboard Principal               │
│ │ Naranja │  ┌──────────────────────┐          │
│ │         │  │  Gráficos y Datos    │          │
│ │ Items   │  │  (Tema Naranja)      │          │
│ │  Lista  │  └──────────────────────┘          │
│ └─────────┘                                    │
└────────────────────────────────────────────────┘
```

## 🎯 Características Principales

| Característica       | Producción       | Desarrollo              |
| -------------------- | ---------------- | ----------------------- |
| **Color Primary**    | `#5B7FED` (Azul) | `#E67E22` (Naranja)     |
| **Sidebar**          | Azul oscuro      | Naranja oscuro          |
| **Banner Superior**  | ❌ No            | ✅ Sí                   |
| **Indicador Visual** | Ninguno          | "ENTORNO DE DESARROLLO" |
| **Animaciones**      | Ninguna especial | Punto pulsante          |
| **Puerto Docker**    | 8080             | 4200                    |

## 🚀 Inicio Rápido

### Desarrollo Local

```bash
pnpm run dev
# → Abre http://localhost:5173 con tema NARANJA
```

### Producción Local

```bash
pnpm run build
pnpm run start
# → Tema AZUL
```

### Docker Desarrollo

```bash
docker-compose -f docker-compose.dev.yml up --build
# → http://localhost:4200 con tema NARANJA
```

### Docker Producción

```bash
docker-compose -f docker-compose.prod.yml up --build
# → http://localhost:8080 con tema AZUL
```

## 🎨 Paletas de Color

### Producción (Azul Profesional)

```css
--primary: oklch(0.71 0.15 239.15); /* #5B7FED */
--sidebar-primary: oklch(0.62 0.15 240.95); /* Azul sidebar */
```

### Desarrollo (Naranja Cálido)

```css
--primary: oklch(0.65 0.18 35); /* #E67E22 */
--sidebar-primary: oklch(0.65 0.18 35); /* Naranja sidebar */
```

## 📁 Archivos del Sistema

```
app/
├── app.css              # Base (producción)
├── app.dev.css          # Override para desarrollo
└── root.tsx             # Lógica de carga condicional

Dockerfile               # Build producción
Dockerfile.dev          # Build desarrollo

docker-compose.prod.yml # Compose producción
docker-compose.dev.yml  # Compose desarrollo

.env.development        # Variables desarrollo
.env.production         # Variables producción
```

## 🔧 Variables de Entorno

La clave está en `VITE_APP_ENV`:

```bash
# Desarrollo
VITE_APP_ENV=development  # → Naranja + Banner

# Producción
VITE_APP_ENV=production   # → Azul + Sin banner
```

## 💡 Ventajas

1. ✅ **Identificación inmediata** del entorno
2. ✅ **Previene errores** al trabajar en el entorno equivocado
3. ✅ **Visual y no intrusivo**
4. ✅ **Compatible con modo oscuro**
5. ✅ **Zero config en Docker**
6. ✅ **Fácil de personalizar**

## 📚 Documentación Detallada

- **Guía Completa**: `docs/ENVIRONMENT_THEMING.md`
- **Guía Rápida**: `docs/ENVIRONMENT_QUICK_START.md`
- **Este archivo**: Resumen visual

## 🎓 Cómo Funciona

1. **Vite** lee `VITE_APP_ENV` del entorno
2. **root.tsx** detecta la variable en `import.meta.env.VITE_APP_ENV`
3. Si es `development`, importa dinámicamente `app.dev.css`
4. `app.dev.css` sobrescribe las variables CSS de `app.css`
5. Se muestra el componente `<EnvironmentIndicator />` solo en dev

## 🔍 Verificación Visual

Al iniciar la aplicación:

### ✅ En Desarrollo verás:

- Banner naranja en la parte superior
- Colores cálidos (naranja/amarillo)
- Punto pulsante en el banner
- Mensaje "ENTORNO DE DESARROLLO"

### ✅ En Producción verás:

- Sin banner
- Colores fríos (azul/morado)
- Interfaz limpia y profesional

## 🎬 Demo

```bash
# Terminal 1 - Desarrollo
pnpm run dev

# Terminal 2 - Producción (en otro puerto)
pnpm run build && pnpm run start

# Abre ambos en tu navegador y compara
```

## 🆘 Soporte

Si los colores no cambian:

```bash
# Limpia cache y reconstruye
rm -rf build/ node_modules/.vite/
pnpm install
pnpm run dev
```

---

**🎨 Creado con colores que importan**  
Sistema de tematización por entorno v1.0.0
