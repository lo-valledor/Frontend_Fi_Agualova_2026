# 🚀 Guía Rápida: Diferenciación de Entornos

## ¿Qué se implementó?

Se creó un sistema de **tematización visual por entorno** que permite identificar de forma inmediata si estás en **desarrollo** o **producción**.

## 🎨 Diferencias Visuales

| Aspecto             | Producción         | Desarrollo                |
| ------------------- | ------------------ | ------------------------- |
| **Color Principal** | 🔵 Azul            | 🟠 Naranja                |
| **Indicador**       | ❌ Ninguno         | ✅ Banner superior        |
| **Paleta**          | Fría (azul/morado) | Cálida (naranja/amarillo) |
| **Sidebar**         | Azul               | Naranja                   |

## 📦 Archivos Creados/Modificados

### ✅ Archivos Nuevos

- `app/app.dev.css` - Estilos para desarrollo
- `.env.development` - Variables de entorno para desarrollo
- `.env.production` - Variables de entorno para producción
- `.env.example` - Ejemplo de configuración
- `docs/ENVIRONMENT_THEMING.md` - Documentación completa

### 🔧 Archivos Modificados

- `app/root.tsx` - Carga condicional de estilos + indicador
- `vite.config.ts` - Expone variables de entorno
- `Dockerfile` - Añade VITE_APP_ENV
- `Dockerfile.dev` - Añade VITE_APP_ENV
- `docker-compose.prod.yml` - Configura entorno producción
- `docker-compose.dev.yml` - Configura entorno desarrollo

## 🎯 Cómo Usar

### 1️⃣ Desarrollo Local

```bash
# Opción 1: Con variable de entorno explícita
VITE_APP_ENV=development pnpm run dev

# Opción 2: Automático (usa .env.development)
pnpm run dev
```

**Resultado**: Verás un banner naranja en la parte superior que dice "ENTORNO DE DESARROLLO"

### 2️⃣ Producción Local

```bash
VITE_APP_ENV=production pnpm run build
pnpm run start
```

**Resultado**: Interfaz azul sin banner

### 3️⃣ Docker Desarrollo

```bash
docker-compose -f docker-compose.dev.yml up --build
```

**Acceso**: `http://localhost:4200`  
**Resultado**: Tema naranja con banner

### 4️⃣ Docker Producción

```bash
docker-compose -f docker-compose.prod.yml up --build
```

**Acceso**: `http://localhost:8080`  
**Resultado**: Tema azul sin banner

## 🎨 Vista Previa

### Producción

```
┌─────────────────────────────┐
│   [Logo]  Dashboard    👤   │ ← Azul
├─────────────────────────────┤
│ Sidebar │   Contenido       │
│  Azul   │                   │
└─────────────────────────────┘
```

### Desarrollo

```
╔═════════════════════════════╗
║ 🟠 ENTORNO DE DESARROLLO    ║ ← Banner naranja
╚═════════════════════════════╝
┌─────────────────────────────┐
│   [Logo]  Dashboard    👤   │ ← Naranja
├─────────────────────────────┤
│ Sidebar │   Contenido       │
│ Naranja │                   │
└─────────────────────────────┘
```

## ⚙️ Personalización

### Cambiar colores de desarrollo

Edita `app/app.dev.css`:

```css
:root {
  /* Cambia esto por tus colores preferidos */
  --primary: oklch(0.65 0.18 35); /* Naranja actual */
}
```

### Cambiar el mensaje del banner

Edita `app/root.tsx` → función `EnvironmentIndicator`:

```tsx
<span>TU MENSAJE AQUÍ</span>
```

### Ocultar el banner

En `app/root.tsx`, comenta o elimina:

```tsx
<EnvironmentIndicator />
```

## ✅ Verificación

Para confirmar que funciona:

1. **Iniciar en desarrollo**: Deberías ver colores naranjas y el banner
2. **Abrir DevTools**: Verificar `import.meta.env.VITE_APP_ENV === 'development'`
3. **Inspeccionar CSS**: Variables como `--primary` deberían tener valores naranjas

## 🐛 Troubleshooting

### No veo el banner en desarrollo

**Solución**:

```bash
# Asegúrate de que la variable esté configurada
echo $VITE_APP_ENV

# Si no está, exporta explícitamente
export VITE_APP_ENV=development
pnpm run dev
```

### Los colores no cambian

**Solución**:

```bash
# Limpia el build cache
rm -rf build/ node_modules/.vite/

# Reinstala y reconstruye
pnpm install
pnpm run dev
```

### Docker no muestra cambios

**Solución**:

```bash
# Rebuild forzado sin cache
docker-compose -f docker-compose.dev.yml build --no-cache
docker-compose -f docker-compose.dev.yml up
```

## 📚 Más Información

Lee la documentación completa en:

- `docs/ENVIRONMENT_THEMING.md` - Guía detallada del sistema

## 🎉 ¡Listo!

Ahora puedes diferenciar visualmente tus entornos y nunca confundirás dónde estás trabajando.

---

**Nota**: Si tienes más entornos (staging, QA, etc.), puedes crear archivos CSS adicionales como `app.staging.css` y seguir el mismo patrón.
