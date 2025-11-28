# 🐳 Docker - Entornos de Enerlova

## 📋 Arquitectura de Entornos

Este proyecto maneja **dos entornos dockerizados**:

### 1. **UAT/Development** (Ambiente de Pruebas)
- **Puerto**: 4200 (externo) → 80 (interno)
- **Servidor**: nginx (estático, igual que producción)
- **API**: `http://192.168.1.139:8082/Enerlova`
- **Tema**: 🟠 **Naranja** con banner "ENTORNO DE DESARROLLO"
- **Propósito**: User Acceptance Testing antes de pasar a producción

### 2. **Production** (Producción)
- **Puerto**: 8080 (externo) → 80 (interno)
- **Servidor**: nginx (estático)
- **API**: `http://192.168.1.139:8081/Enerlova`
- **Tema**: 🔵 **Azul** sin banner
- **Propósito**: Aplicación en producción

---

## 🎯 Concepto Clave: UAT vs Desarrollo Local

### ❌ **Lo que NO es UAT/Development**
- **NO** es un entorno con hot reload
- **NO** es para desarrollar activamente
- **NO** es un servidor de desarrollo Vite

### ✅ **Lo que SÍ es UAT/Development**
- **SÍ** es una réplica de producción con tema naranja
- **SÍ** usa nginx y archivos compilados
- **SÍ** es para probar antes de pasar a producción
- **SÍ** funciona exactamente igual que producción

---

## 🔄 Flujo de Trabajo

```
Desarrollo Local → UAT/Development (Docker) → Producción (Docker)
   (tu IDE)        (Pruebas/Testing)          (Usuarios)
   pnpm dev        docker-compose.dev         docker-compose.prod
   localhost:5173  localhost:4200             localhost:8080
```

---

## 📊 Comparación Técnica

| Aspecto | UAT/Development | Production |
|---------|-----------------|------------|
| **Puerto Externo** | 4200 | 8080 |
| **Puerto Interno** | 80 | 80 |
| **Servidor** | nginx | nginx |
| **Archivos** | Estáticos (build) | Estáticos (build) |
| **Build** | Una vez al deploy | Una vez al deploy |
| **Hot Reload** | ❌ No | ❌ No |
| **Tema** | 🟠 Naranja | 🔵 Azul |
| **Banner** | ✅ "ENTORNO DE DESARROLLO" | ❌ Sin banner |
| **API Backend** | :8082 | :8081 |
| **Variable** | `VITE_APP_ENV=development` | `VITE_APP_ENV=production` |
| **Propósito** | Testing/UAT | Usuarios finales |

---

## 🚀 Comandos

### UAT/Development
```bash
# Iniciar UAT
docker-compose -f docker-compose.dev.yml up -d --build

# Ver logs
docker-compose -f docker-compose.dev.yml logs -f

# Detener
docker-compose -f docker-compose.dev.yml down

# Acceder
http://localhost:4200
```

### Production
```bash
# Iniciar Producción
docker-compose -f docker-compose.prod.yml up -d --build

# Ver logs
docker-compose -f docker-compose.prod.yml logs -f

# Detener
docker-compose -f docker-compose.prod.yml down

# Acceder
http://localhost:8080
```

### Desarrollo Local (Sin Docker)
```bash
# Para desarrollo activo con hot reload
pnpm dev

# Acceder
http://localhost:5173
```

---

## 🔧 Variables de Entorno

### Archivo `.env` para UAT
```bash
# .env (para UAT/Development)
VITE_API_URL=http://192.168.1.139:8082/Enerlova
VITE_APP_ENV=development
NODE_ENV=development
DEV_PORT=4200
```

### Archivo `.env` para Producción
```bash
# .env (para Producción)
VITE_API_URL=http://192.168.1.139:8081/Enerlova
VITE_APP_ENV=production
NODE_ENV=production
FRONTEND_PORT=8080
```

---

## 📁 Archivos Docker

### Para UAT/Development
- `Dockerfile.dev` - Multi-stage build para UAT
- `docker-compose.dev.yml` - Configuración de UAT
- `nginx.dev.conf` - Configuración nginx UAT

### Para Production
- `Dockerfile` - Multi-stage build para producción
- `docker-compose.prod.yml` - Configuración de producción
- `nginx.conf` - Configuración nginx producción

---

## 🎨 Diferenciación Visual

### UAT/Development (Tema Naranja)
```css
/* app.dev.css */
--primary: 25 95% 53%;        /* Naranja */
--primary-foreground: 60 9% 98%;
--ring: 25 95% 53%;
```

**Características**:
- Color principal: `#E67E22` (naranja)
- Banner superior con pulso animado
- Texto: "ENTORNO DE DESARROLLO"
- Toda la UI en tonos naranjas

### Production (Tema Azul)
```css
/* app.css */
--primary: 226 71% 66%;        /* Azul */
--primary-foreground: 210 20% 98%;
--ring: 226 71% 66%;
```

**Características**:
- Color principal: `#5B7FED` (azul)
- Sin banner
- UI limpia y profesional
- Toda la UI en tonos azules

---

## ✅ Verificación de Entornos

### Verificar UAT está corriendo
```bash
# Ver contenedores
docker ps | grep enerlova-frontend-dev

# Ver estado del servicio
curl http://localhost:4200/health
# Debe responder: "healthy - UAT environment"

# Ver headers
curl -I http://localhost:4200
# Debe incluir: X-Environment: development
```

### Verificar Production está corriendo
```bash
# Ver contenedores
docker ps | grep enerlova-frontend-prod

# Ver estado del servicio
curl http://localhost:8080/health
# Debe responder: "healthy"

# Ver headers
curl -I http://localhost:8080
# NO debe incluir X-Environment
```

---

## 🐛 Troubleshooting

### Problema: "No carga la página en puerto 4200"

**Verificar que el contenedor está corriendo**:
```bash
docker ps | grep enerlova-frontend-dev
```

**Ver logs**:
```bash
docker-compose -f docker-compose.dev.yml logs -f
```

**Rebuild completo**:
```bash
docker-compose -f docker-compose.dev.yml down -v
docker-compose -f docker-compose.dev.yml build --no-cache
docker-compose -f docker-compose.dev.yml up -d
```

### Problema: "El tema no cambia entre entornos"

**Causa**: Variable `VITE_APP_ENV` no se está pasando correctamente

**Verificar**:
```bash
# Entrar al contenedor
docker exec -it enerlova-frontend-dev sh

# Ver archivos HTML generados
cat /usr/share/nginx/html/index.html | grep -i "dev-environment"
```

**Si UAT**: Debe incluir clase `dev-environment` en el `<body>`
**Si Prod**: NO debe incluir esa clase

### Problema: "Puerto ya en uso"

```bash
# Ver qué está usando el puerto
netstat -ano | findstr :4200  # Windows
lsof -i :4200                 # Linux/Mac

# Cambiar puerto en .env
DEV_PORT=3001
```

---

## 📝 Notas Importantes

1. **Ambos entornos usan nginx en puerto 80 internamente**
   - UAT: `4200:80`
   - Prod: `8080:80`

2. **Para cambios se requiere rebuild**
   - No hay hot reload en Docker
   - Después de cambios: `docker-compose up --build`

3. **Desarrollo activo: usar `pnpm dev` localmente**
   - No usar Docker para desarrollo día a día
   - Docker es solo para UAT y Producción

4. **Las diferencias entre UAT y Prod son**:
   - Color del tema (naranja vs azul)
   - Banner visual
   - URL del backend
   - Puerto de acceso

---

## 🎯 Mejores Prácticas

### Desarrollo Diario
```bash
# Trabajar localmente con hot reload
pnpm dev
```

### Testing de Features
```bash
# Probar en UAT antes de producción
git checkout develop
docker-compose -f docker-compose.dev.yml up --build
# Probar en http://localhost:4200
```

### Deployment a Producción
```bash
# Merge a main y deployar
git checkout main
git merge develop
docker-compose -f docker-compose.prod.yml up -d --build
# Disponible en http://localhost:8080
```

---

## 📚 Referencias

- [Dockerfile](Dockerfile) - Build de producción
- [Dockerfile.dev](Dockerfile.dev) - Build de UAT
- [docker-compose.prod.yml](docker-compose.prod.yml) - Configuración producción
- [docker-compose.dev.yml](docker-compose.dev.yml) - Configuración UAT
- [CLAUDE.md](CLAUDE.md) - Documentación general del proyecto
