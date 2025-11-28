# 🚀 Quick Start - Ambos Entornos Simultáneos

Esta guía te muestra cómo levantar PRODUCCIÓN y DESARROLLO al mismo tiempo para poder comparar ambos entornos.

## ⚡ Inicio Rápido (Recomendado)

### Opción 1: Script deploy.sh

```bash
./deploy.sh both
```

Esto levantará:
- 🔵 **PRODUCCIÓN**: http://localhost:8080 (colores azules, sin badge)
- 🟠 **DESARROLLO**: http://localhost:4200 (colores naranjas, badge "DEV")

### Opción 2: Docker Compose directo

```bash
docker-compose -f docker-compose.multi.yml up -d --build
```

---

## 🎯 Qué Esperar

### PRODUCCIÓN (Puerto 8080)

✅ **URL**: http://localhost:8080
✅ **Colores**: Azules/Fríos (tema por defecto)
✅ **Badge DEV**: No visible
✅ **API Backend**: http://192.168.1.139:8081/Enerlova
✅ **CSS Cargado**: `app.css`

### DESARROLLO (Puerto 4200)

✅ **URL**: http://localhost:4200
✅ **Colores**: Naranjas/Cálidos
✅ **Badge DEV**: Visible en esquina inferior derecha
✅ **API Backend**: http://192.168.1.139:8082/Enerlova
✅ **CSS Cargado**: `app.dev.css`

---

## 📋 Comandos Útiles

### Ver logs en tiempo real

```bash
# Logs de ambos
docker-compose -f docker-compose.multi.yml logs -f

# Solo producción
docker logs -f enerlova-frontend-prod

# Solo desarrollo
docker logs -f enerlova-frontend-dev
```

### Ver estado

```bash
./deploy.sh status

# O directamente:
docker ps --filter "name=enerlova-frontend"
```

### Detener todo

```bash
./deploy.sh stop

# O directamente:
docker-compose -f docker-compose.multi.yml down
```

### Rebuild completo

```bash
./deploy.sh clean
./deploy.sh both
```

---

## 🔧 Verificación

### 1. Verifica que ambos contenedores estén corriendo

```bash
docker ps --filter "name=enerlova-frontend"
```

Deberías ver:
```
enerlova-frontend-prod   Up X minutes   0.0.0.0:8080->80/tcp
enerlova-frontend-dev    Up X minutes   0.0.0.0:4200->4200/tcp
```

### 2. Verifica los colores

Abre ambas URLs en pestañas diferentes:

**Producción (8080)**:
- Colores primarios azules
- Sin badge "DEV"
- Presiona F12 → Network → busca `app.css`

**Desarrollo (4200)**:
- Colores primarios naranjas
- Badge "DEV" en esquina inferior derecha
- Presiona F12 → Network → busca `app.dev.css`

### 3. Verifica las variables de entorno

```bash
# Producción
docker exec enerlova-frontend-prod env | grep VITE_ENV_MODE
# Debe mostrar: VITE_ENV_MODE=production

# Desarrollo
docker exec enerlova-frontend-dev env | grep VITE_ENV_MODE
# Debe mostrar: VITE_ENV_MODE=development
```

---

## 🐛 Troubleshooting

### Problema: Puerto ya en uso

```bash
# Verificar qué está usando el puerto
netstat -ano | findstr :8080
netstat -ano | findstr :4200

# Detener todos los contenedores de Enerlova
docker stop enerlova-frontend-prod enerlova-frontend-dev
```

### Problema: Los colores no cambian

```bash
# Rebuild sin cache
docker-compose -f docker-compose.multi.yml build --no-cache
docker-compose -f docker-compose.multi.yml up -d

# Limpia cache del navegador
# Presiona Ctrl+Shift+R en el navegador
```

### Problema: No se ve el badge DEV

1. Verifica que estés en http://localhost:4200 (NO 8080)
2. Verifica la variable de entorno:
   ```bash
   docker exec enerlova-frontend-dev env | grep VITE_ENV_MODE
   ```
3. Verifica en DevTools (F12) → Console:
   ```javascript
   console.log(import.meta.env.VITE_ENV_MODE)
   ```

### Problema: "Cannot connect to Docker daemon"

```bash
# Windows: Inicia Docker Desktop
# Linux: Inicia el servicio
sudo systemctl start docker

# Verifica que Docker esté corriendo
docker info
```

---

## 🔄 Flujo de Trabajo Típico

```
1. Desarrollo Local
   ↓ pnpm dev (localhost:5173)
   ↓ Cambios rápidos con hot reload
   ↓
2. Probar en Docker Development
   ↓ ./deploy.sh dev
   ↓ localhost:4200 - colores naranjas, badge DEV
   ↓
3. Comparar con Producción
   ↓ ./deploy.sh both
   ↓ localhost:8080 (prod) vs localhost:4200 (dev)
   ↓
4. Deploy Final
   ↓ Solo producción en servidor
```

---

## 📦 Archivos Importantes

- **[docker-compose.multi.yml](docker-compose.multi.yml)** - Configuración para ambos entornos
- **[deploy.sh](deploy.sh)** - Script automatizado
- **[Dockerfile](Dockerfile)** - Build de producción
- **[Dockerfile.dev](Dockerfile.dev)** - Build de desarrollo
- **[app/app.css](app/app.css)** - Estilos de producción (azules)
- **[app/app.dev.css](app/app.dev.css)** - Estilos de desarrollo (naranjas)

---

## 💡 Tips

### Comparación lado a lado

Abre ambos entornos en ventanas separadas del navegador:

```
┌─────────────────┬─────────────────┐
│  PRODUCCIÓN     │   DESARROLLO    │
│  :8080          │   :4200         │
│  🔵 Azul        │   🟠 Naranja    │
│  Sin badge      │   Badge "DEV"   │
└─────────────────┴─────────────────┘
```

### Cambiar colores rápidamente

Edita los archivos CSS y reconstruye solo el que necesitas:

```bash
# Solo desarrollo
docker-compose -f docker-compose.multi.yml build frontend-dev
docker-compose -f docker-compose.multi.yml up -d frontend-dev

# Solo producción
docker-compose -f docker-compose.multi.yml build frontend-prod
docker-compose -f docker-compose.multi.yml up -d frontend-prod
```

---

## ✅ Checklist de Verificación

Antes de considerar que todo está funcionando:

- [ ] `docker ps` muestra ambos contenedores corriendo
- [ ] http://localhost:8080 carga con colores azules
- [ ] http://localhost:4200 carga con colores naranjas
- [ ] Badge "DEV" visible solo en :4200
- [ ] Badge "DEV" NO visible en :8080
- [ ] F12 → Network muestra `app.css` en :8080
- [ ] F12 → Network muestra `app.dev.css` en :4200
- [ ] Ambos entornos conectan a sus respectivos backends

---

## 🆘 Necesitas Ayuda?

1. Lee [README-DOCKER.md](README-DOCKER.md) para guía completa
2. Lee [ENVIRONMENT-SETUP.md](ENVIRONMENT-SETUP.md) para personalización
3. Ejecuta `./deploy.sh status` para diagnóstico
4. Revisa logs: `docker-compose -f docker-compose.multi.yml logs`

---

**¡Listo para desarrollar!** 🎉

Ahora puedes comparar ambos entornos lado a lado y asegurarte de que los cambios se vean correctamente antes de pasar a producción.
