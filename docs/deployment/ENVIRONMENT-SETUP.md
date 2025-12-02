# Configuración de Entornos (Dev/Prod)

Este proyecto soporta diferenciación visual entre entornos de desarrollo y producción mediante colores y estilos distintos.

## Cómo Funciona

### Variables de Entorno

Se utilizan las siguientes variables de entorno para controlar el comportamiento:

- `VITE_ENV_MODE`: Define el modo del entorno (`development` o `production`)
- `NODE_ENV`: Variable estándar de Node.js
- `VITE_API_URL`: URL del backend principal
- `VITE_AI_API_URL`: URL del servicio de IA

### Archivos CSS por Entorno

- **Production**: `app/app.css` - Colores azules (por defecto)
- **Development**: `app/app.dev.css` - Colores naranjas/cálidos

El plugin de Vite (`envCssPlugin` en `vite.config.ts`) automáticamente carga el CSS correcto según `VITE_ENV_MODE`.

### Badge Visual

Se muestra un badge "DEV" en la esquina inferior derecha **solo en desarrollo**:

```tsx
import { EnvironmentBadge } from './components/ui/environment-badge';
```

Este componente está integrado en `app/root.tsx` y se renderiza automáticamente.

## Configuración Local

### Desarrollo Local

Crea o usa el archivo `.env.development`:

```env
VITE_API_URL=http://192.168.1.139:8082/Enerlova
VITE_ENV_MODE=development
```

Ejecuta:
```bash
pnpm dev
```

### Producción Local

Crea o usa el archivo `.env.production`:

```env
VITE_API_URL=https://api.enerlova.com/Enerlova
VITE_ENV_MODE=production
```

Ejecuta:
```bash
pnpm build
pnpm start
```

## Configuración con Docker

### Dockerfile (Producción)

Build con variables de entorno:

```bash
docker build -f Dockerfile \
  --build-arg VITE_API_URL=https://api.enerlova.com/Enerlova \
  --build-arg VITE_API_ENERLINK_URL=https://api.enerlova.com/api \
  --build-arg VITE_AI_API_URL=https://ai-api.enerlova.com \
  --build-arg VITE_ENV_MODE=production \
  -t enerlova-frontend:prod .
```

### Dockerfile.dev (Desarrollo)

Build con variables de entorno de desarrollo:

```bash
docker build -f Dockerfile.dev \
  --target development-nginx \
  --build-arg VITE_API_URL=http://192.168.1.139:8082/Enerlova \
  --build-arg VITE_API_ENERLINK_URL=http://192.168.1.139:8082/api \
  --build-arg VITE_AI_API_URL=http://localhost:8001 \
  --build-arg VITE_ENV_MODE=development \
  -t enerlova-frontend:dev .
```

### Docker Compose

Ejemplo de configuración en `docker-compose.yml`:

```yaml
version: '3.8'

services:
  frontend-dev:
    build:
      context: .
      dockerfile: Dockerfile.dev
      target: development-nginx
      args:
        VITE_API_URL: http://192.168.1.139:8082/Enerlova
        VITE_API_ENERLINK_URL: http://192.168.1.139:8082/api
        VITE_AI_API_URL: http://localhost:8001
        VITE_ENV_MODE: development
    ports:
      - "4200:4200"

  frontend-prod:
    build:
      context: .
      dockerfile: Dockerfile
      args:
        VITE_API_URL: https://api.enerlova.com/Enerlova
        VITE_API_ENERLINK_URL: https://api.enerlova.com/api
        VITE_AI_API_URL: https://ai-api.enerlova.com
        VITE_ENV_MODE: production
    ports:
      - "80:80"
```

## Personalizar Colores

### Cambiar Colores de Desarrollo

Edita `app/app.dev.css` y modifica las variables CSS en `:root`:

```css
:root {
  /* Cambia el color primario (actualmente naranja) */
  --primary: oklch(0.62 0.14 39.15); /* Formato OKLCH */

  /* Otros colores personalizables */
  --sidebar-primary: oklch(0.62 0.14 39.15);
  --border: oklch(0.88 0.01 100.76);
  /* ... más variables */
}

.dark {
  /* Colores para modo oscuro en desarrollo */
  --primary: oklch(0.67 0.13 38.92);
  /* ... */
}
```

### Cambiar Colores de Producción

Edita `app/app.css` de la misma manera.

## Diferencias Visuales Esperadas

| Característica | Desarrollo | Producción |
|---------------|-----------|------------|
| Color primario | Naranja/Cálido | Azul/Frío |
| Badge DEV | Visible (esquina inferior derecha) | No visible |
| Bordes | Tono naranja sutil | Neutro |
| Sidebar principal | Acento naranja | Acento azul |

## Verificar Configuración

Para verificar qué entorno está activo, abre la consola del navegador y ejecuta:

```javascript
console.log(import.meta.env.VITE_ENV_MODE);
```

Deberías ver `"development"` o `"production"`.

## Troubleshooting

### El CSS no cambia

1. Verifica que `VITE_ENV_MODE` esté configurado correctamente
2. Limpia el cache de Vite: `rm -rf node_modules/.vite`
3. Reinicia el servidor de desarrollo

### El badge no aparece

1. Verifica que `VITE_ENV_MODE=development`
2. Verifica que el componente `EnvironmentBadge` esté importado en `root.tsx`
3. Revisa la consola del navegador por errores

### Los colores están mezclados

1. Asegúrate de que solo un archivo CSS se está importando (el plugin maneja esto)
2. Verifica que no haya imports duplicados de CSS en otros archivos
3. Limpia el build: `rm -rf build/` y reconstruye

## Notas Importantes

- **NO** commites archivos `.env` con credenciales reales
- Usa `.env.example` para documentar las variables necesarias
- Las variables `VITE_*` son embebidas en el build, no están disponibles en runtime
- Cambiar `VITE_ENV_MODE` requiere rebuild completo
