# 🐛 Debugging Docker UAT/Development

## ⚠️ IMPORTANTE - Concepto del Entorno

El entorno "development" es en realidad **UAT (User Acceptance Testing)**, NO es para desarrollo activo:
- ✅ Usa **nginx** en puerto **80** (igual que producción)
- ❌ **NO** tiene hot reload
- ✅ Es una réplica de producción con tema naranja
- ✅ Para probar antes de pasar a producción

## Problema Reportado
El contenedor de UAT/Development no carga las páginas en el puerto 4200.

## Pasos de Diagnóstico

### 1. Verificar que el Contenedor Esté Corriendo

```bash
docker ps | grep enerlova-frontend-dev
```

**Esperado**: Deberías ver `enerlova-frontend-dev` con STATUS `Up`

### 2. Ver los Logs del Contenedor

```bash
docker-compose -f docker-compose.dev.yml logs -f frontend-dev
```

**Buscar**:
- ✅ Logs de nginx iniciando
- ✅ Sin errores de permisos
- ❌ Errores de build
- ❌ Errores de configuración nginx

### 3. Verificar que nginx Esté Escuchando en Puerto 80

```bash
docker exec -it enerlova-frontend-dev sh
```

Dentro del contenedor:
```bash
# Ver procesos nginx
ps aux | grep nginx

# Verificar puerto 80
netstat -tulpn | grep 80

# Probar curl interno
curl http://localhost/
```

**Esperado**: Debe retornar HTML de la aplicación

### 4. Verificar Mapeo de Puertos

```bash
docker port enerlova-frontend-dev
```

**Esperado**: `80/tcp -> 0.0.0.0:4200`

### 5. Probar Acceso desde el Host

```bash
# Windows
curl http://localhost:4200

# PowerShell
Invoke-WebRequest http://localhost:4200

# Navegador
http://localhost:4200
```

### 6. Verificar Healthcheck

```bash
docker inspect enerlova-frontend-dev | grep -A 10 Health
```

**Esperado**: `"Status": "healthy"`

## Soluciones Comunes

### Solución 1: Rebuild Completo

```bash
# Detener y eliminar contenedores
docker-compose -f docker-compose.dev.yml down -v

# Eliminar imágenes antiguas
docker rmi enerlova-frontend:dev-uat

# Build desde cero sin cache
docker-compose -f docker-compose.dev.yml build --no-cache

# Iniciar
docker-compose -f docker-compose.dev.yml up -d

# Ver logs
docker-compose -f docker-compose.dev.yml logs -f
```

### Solución 2: Verificar que el Build Funciona Localmente

```bash
# Probar build local
pnpm install
pnpm build

# Verificar que se generó el build
ls -la build/client
```

**Si funciona local**: Problema está en Docker
**Si no funciona local**: Problema está en el código

### Solución 3: Verificar Variables de Entorno

```bash
# Verificar variables durante el build
docker-compose -f docker-compose.dev.yml config

# Verificar variables en el contenedor
docker exec -it enerlova-frontend-dev env | grep VITE
```

**Esperado**:
```
VITE_API_URL=http://192.168.1.139:8082/Enerlova
VITE_APP_ENV=development
```

### Solución 4: Verificar Archivos Buildados

```bash
# Ver contenido del directorio servido por nginx
docker exec -it enerlova-frontend-dev ls -la /usr/share/nginx/html

# Ver index.html
docker exec -it enerlova-frontend-dev cat /usr/share/nginx/html/index.html
```

**Esperado**: Deberías ver archivos HTML, JS, CSS

### Solución 5: Verificar Configuración de nginx

```bash
# Ver configuración de nginx
docker exec -it enerlova-frontend-dev cat /etc/nginx/nginx.conf

# Test de configuración nginx
docker exec -it enerlova-frontend-dev nginx -t
```

## Errores Comunes y Soluciones

### Error: "Connection refused" al acceder a localhost:4200

**Causa**: El contenedor no está corriendo o el puerto no está mapeado

**Solución**:
```bash
# Verificar que el contenedor está UP
docker ps | grep enerlova-frontend-dev

# Verificar mapeo de puertos
docker port enerlova-frontend-dev

# Reiniciar contenedor
docker-compose -f docker-compose.dev.yml restart
```

### Error: Página en blanco / 404

**Causa**: Build fallido o archivos no copiados correctamente

**Solución**:
```bash
# Ver logs del build
docker-compose -f docker-compose.dev.yml build 2>&1 | tee build.log

# Verificar que los archivos existen
docker exec -it enerlova-frontend-dev ls -la /usr/share/nginx/html
```

### Error: "This site can't be reached"

**Causa**: Puerto bloqueado por firewall o ya en uso

**Solución**:
```bash
# Windows - verificar puerto en uso
netstat -ano | findstr :4200

# Cambiar puerto si es necesario (.env)
DEV_PORT=3001

# Verificar firewall Windows
# PowerShell como Administrador
Get-NetFirewallRule | Where-Object {$_.DisplayName -like "*Docker*"}
```

### Error: El tema no es naranja (es azul)

**Causa**: Variable `VITE_APP_ENV` no está configurada correctamente

**Solución**:
```bash
# Verificar que la variable se pasa al build
docker-compose -f docker-compose.dev.yml config | grep VITE_APP_ENV

# Debe mostrar: VITE_APP_ENV=development

# Rebuild forzando la variable
docker-compose -f docker-compose.dev.yml build --build-arg VITE_APP_ENV=development --no-cache
```

## Configuración Verificada

### ✅ docker-compose.dev.yml
```yaml
ports:
  - "4200:80"  # ✅ Mapeo correcto: host:container
build:
  target: development-nginx  # ✅ Target correcto
  args:
    VITE_APP_ENV: development  # ✅ Variable correcta
```

### ✅ Dockerfile.dev
```dockerfile
EXPOSE 80  # ✅ Puerto 80 (nginx)
CMD ["nginx", "-g", "daemon off;"]  # ✅ Comando nginx
```

### ✅ nginx.dev.conf
```nginx
listen 80;  # ✅ Puerto 80
location / {
    try_files $uri $uri/ /index.html;  # ✅ SPA routing
}
```

## Test de Configuración Paso a Paso

### Test 1: Build de la Imagen
```bash
docker-compose -f docker-compose.dev.yml build
```
**Esperado**: Sin errores, build completado

### Test 2: Iniciar Contenedor
```bash
docker-compose -f docker-compose.dev.yml up -d
```
**Esperado**: Contenedor iniciado

### Test 3: Verificar Estado
```bash
docker-compose -f docker-compose.dev.yml ps
```
**Esperado**: Status = `Up` y `healthy`

### Test 4: Acceder a la Aplicación
```bash
curl http://localhost:4200
```
**Esperado**: HTML de la aplicación

### Test 5: Verificar Tema Naranja
Abrir en navegador: `http://localhost:4200`
**Esperado**:
- Banner naranja superior con "ENTORNO DE DESARROLLO"
- UI en tonos naranjas
- Botones naranjas

## Comandos Rápidos de Diagnóstico

```bash
# Estado completo
docker-compose -f docker-compose.dev.yml ps
docker-compose -f docker-compose.dev.yml logs --tail=50

# Healthcheck
docker inspect enerlova-frontend-dev | grep -A 5 Health

# Ver archivos servidos
docker exec -it enerlova-frontend-dev ls -la /usr/share/nginx/html

# Test interno
docker exec -it enerlova-frontend-dev curl http://localhost/

# Restart
docker-compose -f docker-compose.dev.yml restart

# Rebuild completo
docker-compose -f docker-compose.dev.yml down -v && \
docker-compose -f docker-compose.dev.yml build --no-cache && \
docker-compose -f docker-compose.dev.yml up -d
```

## Diferencia con Desarrollo Local

### Para Desarrollo Activo (Hot Reload)
```bash
# Usar directamente pnpm (SIN Docker)
pnpm dev
# Acceder en: http://localhost:5173
```

### Para UAT (Docker, sin hot reload)
```bash
# Usar docker-compose.dev.yml
docker-compose -f docker-compose.dev.yml up -d
# Acceder en: http://localhost:4200
```

### Para Desarrollo Local con Docker (opcional)
```bash
# Usar docker-compose.local.yml (con hot reload)
docker-compose -f docker-compose.local.yml up
# Acceder en: http://localhost:5173
```

## Información del Sistema

Compartir si necesitas ayuda adicional:

```bash
# Versiones
docker --version
docker-compose --version

# Sistema
systeminfo | findstr /B /C:"OS Name" /C:"OS Version"  # Windows
uname -a  # Linux/Mac

# Estado Docker
docker info

# Logs completos
docker-compose -f docker-compose.dev.yml logs > docker-logs.txt
```

## Próximos Pasos

1. ✅ Verificar que el contenedor está corriendo (`docker ps`)
2. ✅ Verificar logs (`docker-compose logs -f`)
3. ✅ Verificar puerto 4200 está libre
4. ✅ Rebuild si es necesario
5. ✅ Compartir logs si el problema persiste

## Enlaces Útiles

- [DOCKER-ENVIRONMENTS.md](DOCKER-ENVIRONMENTS.md) - Documentación completa de entornos
- [docker-compose.dev.yml](docker-compose.dev.yml) - Configuración UAT
- [docker-compose.prod.yml](docker-compose.prod.yml) - Configuración Producción
- [docker-compose.local.yml](docker-compose.local.yml) - Desarrollo local con hot reload
