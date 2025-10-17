# 🐳 Docker Setup - Frontend Enerlova

Guía completa para trabajar con Docker en el proyecto Frontend Enerlova.

## 📋 Tabla de Contenidos

- [Requisitos](#requisitos)
- [Inicio Rápido](#inicio-rápido)
- [Entornos](#entornos)
- [Comandos Principales](#comandos-principales)
- [Troubleshooting](#troubleshooting)
- [Documentación Completa](#documentación-completa)

---

## ⚡ Requisitos

- Docker v20.10+
- Docker Compose v2.0+
- 4GB RAM disponibles
- 2GB espacio en disco

---

## 🚀 Inicio Rápido

### UAT/Development (Pruebas)

```bash
# 1. Iniciar entorno UAT
docker-compose -f docker-compose.dev.yml up -d --build

# 2. Ver logs
docker-compose -f docker-compose.dev.yml logs -f

# 3. Acceder en navegador
http://localhost:3000
```

**Deberías ver**:
- ✅ Banner naranja: "ENTORNO DE DESARROLLO"
- ✅ UI en tonos naranjas
- ✅ Punto pulsante animado

### Production

```bash
# 1. Iniciar producción
docker-compose -f docker-compose.prod.yml up -d --build

# 2. Ver logs
docker-compose -f docker-compose.prod.yml logs -f

# 3. Acceder en navegador
http://localhost:8080
```

**Deberías ver**:
- ✅ Sin banner
- ✅ UI en tonos azules
- ✅ Interfaz limpia

---

## 🎯 Entornos

### 1. UAT/Development (Testing)

**Propósito**: Ambiente de pruebas antes de pasar a producción

```
┌──────────────────────────────────────────┐
│ 🟠 ● ENTORNO DE DESARROLLO  DEVELOPMENT  │
├──────────────────────────────────────────┤
│         [Interfaz naranja]               │
└──────────────────────────────────────────┘
```

| Característica | Valor |
|---------------|-------|
| Puerto | 3000 |
| Servidor | nginx:80 |
| Tema | 🟠 Naranja |
| Banner | ✅ Sí |
| Backend | :8082 |
| Hot Reload | ❌ No |

**Archivo**: `docker-compose.dev.yml`

### 2. Production

**Propósito**: Aplicación para usuarios finales

```
┌──────────────────────────────────────────┐
│         [Interfaz azul]                  │
└──────────────────────────────────────────┘
```

| Característica | Valor |
|---------------|-------|
| Puerto | 8080 |
| Servidor | nginx:80 |
| Tema | 🔵 Azul |
| Banner | ❌ No |
| Backend | :8081 |
| Hot Reload | ❌ No |

**Archivo**: `docker-compose.prod.yml`

### 3. Local Development (sin Docker)

**Propósito**: Desarrollo activo con hot reload

| Característica | Valor |
|---------------|-------|
| Puerto | 5173 |
| Servidor | Vite Dev |
| Tema | Cualquiera |
| Banner | Según VITE_APP_ENV |
| Hot Reload | ✅ Sí |

**Comando**: `pnpm dev`

---

## 📝 Comandos Principales

### Gestión de Contenedores

```bash
# Ver contenedores corriendo
docker ps

# Ver logs en tiempo real
docker-compose -f docker-compose.dev.yml logs -f

# Detener contenedores
docker-compose -f docker-compose.dev.yml down

# Detener y eliminar volúmenes
docker-compose -f docker-compose.dev.yml down -v

# Restart
docker-compose -f docker-compose.dev.yml restart
```

### Build y Rebuild

```bash
# Build normal
docker-compose -f docker-compose.dev.yml build

# Build sin cache (cuando hay problemas)
docker-compose -f docker-compose.dev.yml build --no-cache

# Build y start en un comando
docker-compose -f docker-compose.dev.yml up --build -d
```

### Inspección

```bash
# Ver estado del contenedor
docker-compose -f docker-compose.dev.yml ps

# Verificar healthcheck
docker inspect enerlova-frontend-dev | grep Health

# Ejecutar comando dentro del contenedor
docker exec -it enerlova-frontend-dev sh

# Ver archivos servidos
docker exec -it enerlova-frontend-dev ls -la /usr/share/nginx/html

# Ver variables de entorno
docker exec -it enerlova-frontend-dev env | grep VITE
```

### Limpieza

```bash
# Limpiar contenedores detenidos
docker container prune

# Limpiar imágenes sin usar
docker image prune -a

# Limpiar todo (cuidado!)
docker system prune -a --volumes
```

---

## 🔧 Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto:

### Para UAT
```bash
VITE_API_URL=http://192.168.1.139:8082/Enerlova
VITE_APP_ENV=development
NODE_ENV=development
DEV_PORT=3000
```

### Para Producción
```bash
VITE_API_URL=http://192.168.1.139:8081/Enerlova
VITE_APP_ENV=production
NODE_ENV=production
FRONTEND_PORT=8080
```

---

## 🐛 Troubleshooting

### Problema: No carga la página

```bash
# 1. Verificar que el contenedor está corriendo
docker ps | grep enerlova-frontend-dev

# 2. Ver logs completos
docker-compose -f docker-compose.dev.yml logs

# 3. Rebuild completo
docker-compose -f docker-compose.dev.yml down -v
docker-compose -f docker-compose.dev.yml build --no-cache
docker-compose -f docker-compose.dev.yml up -d
```

### Problema: Puerto ya en uso

```bash
# Windows
netstat -ano | findstr :3000

# Linux/Mac
lsof -i :3000

# Cambiar puerto en .env
DEV_PORT=3001
```

### Problema: El tema no es el correcto

```bash
# Verificar variables de entorno
docker exec -it enerlova-frontend-dev env | grep VITE_APP_ENV

# Debe mostrar "development" para UAT o "production" para Prod

# Si está mal, rebuild:
docker-compose -f docker-compose.dev.yml build --no-cache
```

### Problema: Errores de permisos nginx

```bash
# Ver logs específicos
docker-compose -f docker-compose.dev.yml logs | grep -i "permission denied"

# Si aparece, el Dockerfile ya está corregido. Hacer rebuild:
docker-compose -f docker-compose.dev.yml build --no-cache
```

### Problema: Página en blanco

```bash
# Verificar que los archivos existen
docker exec -it enerlova-frontend-dev ls -la /usr/share/nginx/html

# Verificar index.html
docker exec -it enerlova-frontend-dev cat /usr/share/nginx/html/index.html

# Si no hay archivos, el build falló. Ver logs del build:
docker-compose -f docker-compose.dev.yml build 2>&1 | tee build.log
```

---

## 📚 Documentación Completa

### Archivos de Documentación

- **[DOCKER-ENVIRONMENTS.md](DOCKER-ENVIRONMENTS.md)** - Arquitectura completa de entornos
- **[UAT-GUIDE.md](UAT-GUIDE.md)** - Guía visual del sistema de temas
- **[docker-debug.md](docker-debug.md)** - Guía detallada de troubleshooting
- **[CLAUDE.md](CLAUDE.md)** - Documentación general del proyecto

### Archivos Docker

- **[Dockerfile](Dockerfile)** - Build de producción
- **[Dockerfile.dev](Dockerfile.dev)** - Build de UAT
- **[docker-compose.prod.yml](docker-compose.prod.yml)** - Configuración producción
- **[docker-compose.dev.yml](docker-compose.dev.yml)** - Configuración UAT
- **[nginx.conf](nginx.conf)** - Configuración nginx producción
- **[nginx.dev.conf](nginx.dev.conf)** - Configuración nginx UAT
- **[.dockerignore](.dockerignore)** - Archivos excluidos del build

---

## ✅ Checklist Pre-Deploy

### UAT/Development

- [ ] Código testeado localmente con `pnpm dev`
- [ ] Build local exitoso: `pnpm build`
- [ ] Variables de entorno configuradas en `.env`
- [ ] `VITE_APP_ENV=development`
- [ ] Backend UAT disponible en :8082
- [ ] Puerto 3000 libre
- [ ] Build Docker: `docker-compose -f docker-compose.dev.yml build`
- [ ] Start: `docker-compose -f docker-compose.dev.yml up -d`
- [ ] Healthcheck: `docker ps` muestra "healthy"
- [ ] Banner naranja visible en navegador
- [ ] UI en tonos naranjas

### Production

- [ ] Código aprobado en UAT
- [ ] Tests pasando
- [ ] Variables de entorno configuradas
- [ ] `VITE_APP_ENV=production`
- [ ] Backend Prod disponible en :8081
- [ ] Puerto 8080 libre
- [ ] Build Docker: `docker-compose -f docker-compose.prod.yml build`
- [ ] Start: `docker-compose -f docker-compose.prod.yml up -d`
- [ ] Healthcheck: `docker ps` muestra "healthy"
- [ ] Sin banner en navegador
- [ ] UI en tonos azules

---

## 🔄 Flujo de Trabajo Recomendado

```
1. Desarrollo Local
   ↓ (pnpm dev - localhost:5173)
   ↓ Hot reload, cambios rápidos
   ↓
2. Probar en UAT
   ↓ (docker-compose.dev - localhost:3000)
   ↓ Banner naranja, testing completo
   ↓
3. Deploy a Producción
   ↓ (docker-compose.prod - localhost:8080)
   ↓ UI azul, usuarios finales
```

---

## 🎯 Diferencias Clave: Docker vs Local

| Aspecto | Local (`pnpm dev`) | Docker (UAT/Prod) |
|---------|-------------------|-------------------|
| **Hot Reload** | ✅ Sí | ❌ No |
| **Servidor** | Vite Dev | nginx |
| **Build** | Continuo | Una vez |
| **Velocidad** | Rápida | Más lenta |
| **Uso** | Desarrollo diario | Testing/Deploy |
| **Cambios** | Inmediatos | Requiere rebuild |

**Recomendación**: Usa `pnpm dev` para desarrollo diario. Docker solo para testing y deploy.

---

## 💡 Tips y Mejores Prácticas

### Performance

```bash
# Usar BuildKit para builds más rápidos
export DOCKER_BUILDKIT=1
docker-compose build

# Aprovechar el cache de layers
# (No uses --no-cache a menos que sea necesario)
docker-compose -f docker-compose.dev.yml build
```

### Debugging

```bash
# Entrar al contenedor para investigar
docker exec -it enerlova-frontend-dev sh

# Una vez dentro, puedes:
# - Ver logs: cat /var/log/nginx/access.log
# - Probar curl: curl http://localhost/
# - Ver archivos: ls -la /usr/share/nginx/html
```

### Logs

```bash
# Ver últimas 100 líneas
docker-compose -f docker-compose.dev.yml logs --tail=100

# Seguir logs en tiempo real
docker-compose -f docker-compose.dev.yml logs -f

# Guardar logs a archivo
docker-compose -f docker-compose.dev.yml logs > logs.txt
```

---

## 🆘 Soporte

Si tienes problemas:

1. Revisa [docker-debug.md](docker-debug.md)
2. Ejecuta el comando de diagnóstico:
   ```bash
   docker-compose -f docker-compose.dev.yml logs > debug.log
   ```
3. Revisa `debug.log` para errores específicos
4. Intenta rebuild completo sin cache

---

## 📞 Comandos de Emergencia

```bash
# Detener TODO
docker stop $(docker ps -q)

# Eliminar TODO (CUIDADO!)
docker system prune -a --volumes

# Empezar de cero
docker-compose -f docker-compose.dev.yml down -v
docker system prune -a
docker-compose -f docker-compose.dev.yml build --no-cache
docker-compose -f docker-compose.dev.yml up -d
```

---

## 🎉 ¡Listo!

Tu entorno Docker está completamente configurado. Ahora puedes:

- ✅ Desarrollar localmente con hot reload
- ✅ Probar en UAT con tema naranja
- ✅ Deployar a producción con tema azul
- ✅ Diferenciar visualmente los entornos

**¡Feliz coding!** 🚀
