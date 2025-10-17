# 🎯 Guía Rápida - Entorno UAT

## ✅ Sistema Completo Implementado

Tu sistema de diferenciación de entornos está **completamente configurado** y listo para usar.

---

## 🎨 Diferenciación Visual

### UAT/Development (Puerto 3000)

Cuando accedas a `http://localhost:3000` verás:

```
┌─────────────────────────────────────────────────┐
│ 🟠 ● ENTORNO DE DESARROLLO      DEVELOPMENT     │  ← Banner naranja fijo
├─────────────────────────────────────────────────┤
│                                                 │
│  [Interfaz de la aplicación en tonos naranjas] │
│                                                 │
│  - Botones naranjas                            │
│  - Sidebar naranja                             │
│  - Acentos en naranja                          │
│                                                 │
└─────────────────────────────────────────────────┘
```

**Características UAT**:
- ✅ Banner superior con punto pulsante
- ✅ Texto: "ENTORNO DE DESARROLLO"
- ✅ Badge: "DEVELOPMENT"
- ✅ Color principal: `#E67E22` (naranja)
- ✅ Toda la UI en tonos naranjas
- ✅ Padding superior para compensar el banner

### Production (Puerto 8080)

Cuando accedas a `http://localhost:8080` verás:

```
┌─────────────────────────────────────────────────┐
│                                                 │  ← Sin banner
│  [Interfaz de la aplicación en tonos azules]   │
│                                                 │
│  - Botones azules                              │
│  - Sidebar azul                                │
│  - Acentos en azul                             │
│                                                 │
└─────────────────────────────────────────────────┘
```

**Características Producción**:
- ❌ Sin banner
- ✅ Color principal: `#5B7FED` (azul)
- ✅ Toda la UI en tonos azules
- ✅ Interfaz limpia y profesional

---

## 🚀 Comandos para Probar

### 1. Iniciar UAT (tema naranja con banner)

```bash
docker-compose -f docker-compose.dev.yml up -d --build
```

**Acceder**: `http://localhost:3000`

**Deberías ver**:
- Banner naranja en la parte superior
- UI completamente naranja
- Punto pulsante animado

### 2. Iniciar Producción (tema azul sin banner)

```bash
docker-compose -f docker-compose.prod.yml up -d --build
```

**Acceder**: `http://localhost:8080`

**Deberías ver**:
- Sin banner
- UI completamente azul
- Interfaz limpia

---

## 🔍 Verificación del Sistema

### Verificar que UAT está funcionando correctamente:

```bash
# 1. Contenedor corriendo
docker ps | grep enerlova-frontend-dev

# 2. Ver logs
docker-compose -f docker-compose.dev.yml logs -f

# 3. Verificar variables de entorno
docker exec -it enerlova-frontend-dev env | grep VITE_APP_ENV
# Debe mostrar: VITE_APP_ENV=development

# 4. Test del banner en el HTML
docker exec -it enerlova-frontend-dev cat /usr/share/nginx/html/index.html | grep -i "dev-environment"
# Debe encontrar la clase "dev-environment"
```

### Verificar que Producción está funcionando:

```bash
# 1. Contenedor corriendo
docker ps | grep enerlova-frontend-prod

# 2. Verificar variables
docker exec -it enerlova-frontend-prod env | grep VITE_APP_ENV
# Debe mostrar: VITE_APP_ENV=production

# 3. Test que NO tiene banner en el HTML
docker exec -it enerlova-frontend-prod cat /usr/share/nginx/html/index.html | grep -i "dev-environment"
# NO debe encontrar nada
```

---

## 📝 Cómo Funciona

### 1. Variables de Entorno

La variable `VITE_APP_ENV` controla todo:

```javascript
// En vite.config.ts
define: {
  'import.meta.env.VITE_APP_ENV': JSON.stringify(
    process.env.VITE_APP_ENV || 'production'
  )
}
```

### 2. Carga Condicional de CSS

En [root.tsx](app/root.tsx):

```typescript
// Líneas 17-21
const isDevelopment =
  import.meta.env.VITE_APP_ENV === 'development' || import.meta.env.DEV;
if (isDevelopment) {
  import('./app.dev.css');  // ← Carga estilos naranjas
}
```

### 3. Banner Condicional

En [root.tsx](app/root.tsx):

```typescript
// Líneas 42-57
function EnvironmentIndicator() {
  const env = import.meta.env.VITE_APP_ENV || 'production';

  if (env === 'production') {
    return null;  // ← No mostrar en producción
  }

  return (
    <div className='env-indicator'>  {/* ← Banner naranja */}
      <span className='env-badge-pulse'></span>
      <span>ENTORNO DE DESARROLLO</span>
      <span className='env-indicator-badge'>{env.toUpperCase()}</span>
    </div>
  );
}
```

### 4. Clase en Body

En [root.tsx](app/root.tsx):

```typescript
// Líneas 59-79
export function Layout({ children }: { children: React.ReactNode }) {
  const isDev = import.meta.env.VITE_APP_ENV === 'development';

  return (
    <body className={isDev ? 'dev-environment' : ''}>  {/* ← Añade padding */}
      <EnvironmentIndicator />
      {children}
    </body>
  );
}
```

### 5. Estilos del Banner

En [app.dev.css](app/app.dev.css):

```css
/* Líneas 54-56 */
--env-indicator-bg: oklch(0.62 0.14 39.15); /* Naranja */
--env-indicator-text: oklch(1 0 0); /* Blanco */

/* Líneas 171-189 */
.env-indicator {
  position: fixed;
  top: 0;
  background: var(--env-indicator-bg);
  color: var(--env-indicator-text);
  z-index: 9999;
}

/* Líneas 199-201 */
body.dev-environment {
  padding-top: 1.75rem;  /* ← Compensar altura del banner */
}
```

---

## ✅ Checklist de Verificación

Cuando inicies el entorno UAT, verifica:

- [ ] El contenedor está corriendo (`docker ps`)
- [ ] Puedes acceder a `http://localhost:3000`
- [ ] Ves el banner naranja en la parte superior
- [ ] El banner dice "ENTORNO DE DESARROLLO"
- [ ] Hay un punto naranja pulsante
- [ ] Los botones son naranjas
- [ ] El sidebar es naranja
- [ ] En modo oscuro también funciona

Cuando inicies producción, verifica:

- [ ] El contenedor está corriendo (`docker ps`)
- [ ] Puedes acceder a `http://localhost:8080`
- [ ] **NO** ves ningún banner
- [ ] Los botones son azules
- [ ] El sidebar es azul
- [ ] La UI es limpia y profesional

---

## 🎯 Diferencias Clave

| Aspecto | UAT (Dev) | Producción |
|---------|-----------|------------|
| **Puerto** | 3000 | 8080 |
| **Banner** | ✅ Sí | ❌ No |
| **Color** | 🟠 Naranja | 🔵 Azul |
| **CSS** | app.css + app.dev.css | app.css |
| **Variable** | `VITE_APP_ENV=development` | `VITE_APP_ENV=production` |
| **API Backend** | :8082 | :8081 |
| **Body Class** | `dev-environment` | - |

---

## 🔧 Troubleshooting

### El banner no aparece en UAT

```bash
# Verificar variable de entorno
docker exec -it enerlova-frontend-dev env | grep VITE_APP_ENV

# Si no aparece o es "production", rebuild:
docker-compose -f docker-compose.dev.yml down -v
docker-compose -f docker-compose.dev.yml build --no-cache
docker-compose -f docker-compose.dev.yml up -d
```

### El banner aparece en producción

```bash
# Verificar variable de entorno
docker exec -it enerlova-frontend-prod env | grep VITE_APP_ENV

# Si es "development", rebuild:
docker-compose -f docker-compose.prod.yml down -v
docker-compose -f docker-compose.prod.yml build --no-cache
docker-compose -f docker-compose.prod.yml up -d
```

### Los colores no cambian

```bash
# Verificar que app.dev.css se está cargando
docker exec -it enerlova-frontend-dev ls -la /usr/share/nginx/html/assets

# Rebuild forzando cache
docker-compose -f docker-compose.dev.yml build --no-cache
```

---

## 📚 Archivos Relacionados

- [app/root.tsx](app/root.tsx) - Lógica del banner y carga de CSS
- [app/app.css](app/app.css) - Estilos de producción (azul)
- [app/app.dev.css](app/app.dev.css) - Estilos UAT (naranja) + banner
- [vite.config.ts](vite.config.ts) - Configuración de variables
- [docker-compose.dev.yml](docker-compose.dev.yml) - Config UAT
- [docker-compose.prod.yml](docker-compose.prod.yml) - Config Producción
- [DOCKER-ENVIRONMENTS.md](DOCKER-ENVIRONMENTS.md) - Documentación completa

---

## 🎉 ¡Todo Listo!

Tu sistema de diferenciación de entornos está completamente implementado:

✅ Variables de entorno configuradas
✅ Carga condicional de CSS
✅ Banner implementado
✅ Estilos naranjas y azules
✅ Docker configurado correctamente
✅ Documentación completa

**Ahora puedes**:
1. Iniciar UAT y ver el banner naranja
2. Iniciar Producción y ver la interfaz azul limpia
3. Diferenciar visualmente en qué entorno estás
4. Probar features en UAT antes de pasar a producción

¡Disfruta tu setup! 🚀
