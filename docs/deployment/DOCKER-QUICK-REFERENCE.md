# 🚀 Docker Quick Reference

Comandos más usados para trabajar con Docker en el proyecto Enerlova.

---

## ⚡ Comandos Más Comunes

### Iniciar Entornos

```bash
# UAT (puerto 4200, tema naranja)
docker-compose -f docker-compose.dev.yml up -d --build

# Producción (puerto 8080, tema azul)
docker-compose -f docker-compose.prod.yml up -d --build
```

### Ver Logs

```bash
# UAT
docker-compose -f docker-compose.dev.yml logs -f

# Producción
docker-compose -f docker-compose.prod.yml logs -f
```

### Detener

```bash
# UAT
docker-compose -f docker-compose.dev.yml down

# Producción
docker-compose -f docker-compose.prod.yml down
```

---

## 🔧 Troubleshooting Rápido

### Rebuild Completo (soluciona el 90% de problemas)

```bash
# UAT
docker-compose -f docker-compose.dev.yml down -v
docker-compose -f docker-compose.dev.yml build --no-cache
docker-compose -f docker-compose.dev.yml up -d

# Producción
docker-compose -f docker-compose.prod.yml down -v
docker-compose -f docker-compose.prod.yml build --no-cache
docker-compose -f docker-compose.prod.yml up -d
```

### Ver Estado

```bash
# Ver todos los contenedores
docker ps

# Ver contenedores específicos
docker ps | grep enerlova
```

### Verificar Salud

```bash
# UAT
docker inspect enerlova-frontend-dev | grep -A 5 Health

# Producción
docker inspect enerlova-frontend-prod | grep -A 5 Health
```

---

## 🔍 Diagnóstico

### Variables de Entorno

```bash
# UAT
docker exec -it enerlova-frontend-dev env | grep VITE

# Producción
docker exec -it enerlova-frontend-prod env | grep VITE
```

### Archivos Servidos

```bash
# UAT
docker exec -it enerlova-frontend-dev ls -la /usr/share/nginx/html

# Producción
docker exec -it enerlova-frontend-prod ls -la /usr/share/nginx/html
```

### Entrar al Contenedor

```bash
# UAT
docker exec -it enerlova-frontend-dev sh

# Producción
docker exec -it enerlova-frontend-prod sh
```

---

## 🧹 Limpieza

```bash
# Limpiar contenedores detenidos
docker container prune

# Limpiar imágenes antiguas
docker image prune -a

# Limpiar TODO (cuidado!)
docker system prune -a --volumes
```

---

## 📊 Información

```bash
# Ver imágenes
docker images | grep enerlova

# Ver uso de recursos
docker stats enerlova-frontend-dev

# Ver puertos
docker port enerlova-frontend-dev
```

---

## 🎯 Accesos Rápidos

| Entorno | URL | Tema | Banner |
|---------|-----|------|--------|
| **UAT** | http://localhost:4200 | 🟠 Naranja | ✅ Sí |
| **Prod** | http://localhost:8080 | 🔵 Azul | ❌ No |

---

## 🆘 Comandos de Emergencia

```bash
# Detener TODO
docker stop $(docker ps -q)

# Reiniciar Docker Desktop (Windows)
# 1. Cerrar Docker Desktop
# 2. Abrir como Administrador
# 3. Start

# Limpiar TODO y empezar de cero
docker system prune -a --volumes
docker-compose -f docker-compose.dev.yml build --no-cache
docker-compose -f docker-compose.dev.yml up -d
```

---

## 📝 Notas Importantes

- ⚠️ Docker NO tiene hot reload - requiere rebuild para ver cambios
- ✅ Para desarrollo activo usa: `pnpm dev`
- 🔧 UAT y Prod usan nginx en puerto 80 internamente
- 🎨 El tema se controla con `VITE_APP_ENV` (development/production)

---

## 📚 Más Documentación

- [README-DOCKER.md](README-DOCKER.md) - Guía completa
- [DOCKER-ENVIRONMENTS.md](DOCKER-ENVIRONMENTS.md) - Arquitectura
- [docker-debug.md](docker-debug.md) - Troubleshooting detallado
- [UAT-GUIDE.md](UAT-GUIDE.md) - Sistema de temas
