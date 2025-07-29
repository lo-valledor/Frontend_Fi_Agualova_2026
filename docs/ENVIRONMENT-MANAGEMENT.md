# Gestión de Entornos - Enerlova Frontend

Este documento describe cómo gestionar los diferentes entornos de desarrollo y producción para el proyecto Enerlova Frontend.

## Estructura de Entornos

### 🏭 Entorno de Producción

- **Rama**: `main`
- **Puerto**: `8080`
- **Workflow**: `.github/workflows/build.yml`
- **Docker**: `docker-compose.yml` + `Dockerfile`
- **Características**:
  - Análisis de código con SonarQube
  - Build optimizado para producción
  - Configuración de nginx para producción
  - Sin hot reload

### 🛠️ Entorno de Desarrollo

- **Rama**: `develop`
- **Puerto**: `3000` (servidor dev) / `3001` (nginx)
- **Workflow**: `.github/workflows/development.yml`
- **Docker**: `docker-compose.dev.yml` + `Dockerfile.dev`
- **Características**:
  - Hot reload habilitado
  - Configuración de desarrollo optimizada
  - Tests automáticos
  - Logs detallados

## Configuración de Ramas

### Rama Principal (main)

- Solo se ejecuta el workflow de producción
- Análisis de código con SonarQube
- Build para producción
- Despliegue automático

### Rama de Desarrollo (develop)

- Se ejecuta el workflow de desarrollo
- Tests automáticos
- Build de desarrollo
- Sin análisis de SonarQube

## Uso de Scripts de Gestión

### Windows (PowerShell)

```powershell
# Iniciar entorno de desarrollo con hot reload
.\scripts\manage-environments.ps1 dev

# Iniciar entorno de desarrollo con nginx
.\scripts\manage-environments.ps1 dev nginx

# Iniciar entorno de producción
.\scripts\manage-environments.ps1 prod

# Detener todos los entornos
.\scripts\manage-environments.ps1 stop

# Ver logs del entorno actual
.\scripts\manage-environments.ps1 logs

# Ver estado de contenedores
.\scripts\manage-environments.ps1 status

# Limpiar contenedores no utilizados
.\scripts\manage-environments.ps1 cleanup
```

### Linux/macOS (Bash)

```bash
# Iniciar entorno de desarrollo con hot reload
./scripts/manage-environments.sh dev

# Iniciar entorno de desarrollo con nginx
./scripts/manage-environments.sh dev nginx

# Iniciar entorno de producción
./scripts/manage-environments.sh prod

# Detener todos los entornos
./scripts/manage-environments.sh stop

# Ver logs del entorno actual
./scripts/manage-environments.sh logs

# Ver estado de contenedores
./scripts/manage-environments.sh status

# Limpiar contenedores no utilizados
./scripts/manage-environments.sh cleanup
```

### Ubuntu Server

```bash
# Instalación inicial
./scripts/ubuntu-server-setup.sh install
./scripts/ubuntu-server-setup.sh setup

# Gestión de entornos
./scripts/ubuntu-server-setup.sh dev          # Desarrollo con hot reload
./scripts/ubuntu-server-setup.sh dev nginx    # Desarrollo con nginx
./scripts/ubuntu-server-setup.sh prod         # Producción
./scripts/ubuntu-server-setup.sh stop         # Detener todos
./scripts/ubuntu-server-setup.sh status       # Estado completo del sistema
./scripts/ubuntu-server-setup.sh logs         # Ver logs
./scripts/ubuntu-server-setup.sh cleanup      # Limpiar sistema
./scripts/ubuntu-server-setup.sh update       # Actualizar proyecto

# Despliegue remoto (desde máquina local)
./scripts/deploy-to-ubuntu.sh 192.168.1.100 main prod
./scripts/deploy-to-ubuntu.sh 192.168.1.100 develop dev
```

> 📖 **Documentación completa**: Ver [Despliegue en Ubuntu Server](docs/UBUNTU-SERVER-DEPLOYMENT.md)

## Configuración Manual

### Entorno de Desarrollo

```bash
# Con servidor de desarrollo (hot reload)
docker-compose -f docker-compose.dev.yml up -d

# Con nginx (sin hot reload)
docker-compose -f docker-compose.dev.yml --profile nginx-dev up -d
```

### Entorno de Producción

```bash
docker-compose up -d
```

## Variables de Entorno

### Desarrollo

- `NODE_ENV=development`
- `VITE_API_URL=http://192.168.1.139:8081/Enerlova`

### Producción

- `NODE_ENV=production`
- `VITE_API_URL=http://192.168.1.139:8081/Enerlova`

## Puertos y URLs

| Entorno                 | Puerto | URL                   | Descripción           |
| ----------------------- | ------ | --------------------- | --------------------- |
| Desarrollo (Dev Server) | 3000   | http://localhost:3000 | Hot reload habilitado |
| Desarrollo (Nginx)      | 3001   | http://localhost:3001 | Sin hot reload        |
| Producción              | 8080   | http://localhost:8080 | Build optimizado      |

## Workflows de GitHub Actions

### Producción (.github/workflows/build.yml)

- Se ejecuta solo en push a `main`
- Análisis de código con SonarQube
- Build optimizado para producción

### Desarrollo (.github/workflows/development.yml)

- Se ejecuta en push a `develop` y pull requests
- Tests automáticos
- Build de desarrollo
- Despliegue automático al entorno de desarrollo

## Configuración de Nginx

### Desarrollo (nginx.dev.conf)

- Configuración optimizada para desarrollo
- CORS habilitado
- Logs detallados
- Caché permisivo

### Producción (nginx.conf)

- Configuración optimizada para producción
- Compresión habilitada
- Caché agresivo
- Seguridad mejorada

## Troubleshooting

### Problemas Comunes

1. **Puerto ya en uso**

   ```bash
   # Verificar qué está usando el puerto
   netstat -ano | findstr :3000

   # Detener todos los contenedores
   .\scripts\manage-environments.ps1 stop
   ```

2. **Docker no está ejecutándose**

   - Iniciar Docker Desktop
   - Verificar que Docker esté funcionando: `docker info`

3. **Cambios no se reflejan en desarrollo**

   - Verificar que esté usando el servidor de desarrollo (puerto 3000)
   - Reiniciar el contenedor: `docker-compose -f docker-compose.dev.yml restart`

4. **Problemas de permisos en Windows**
   - Ejecutar PowerShell como administrador
   - Verificar configuración de Docker Desktop

### Logs y Debugging

```bash
# Ver logs del entorno de desarrollo
docker-compose -f docker-compose.dev.yml logs -f

# Ver logs del entorno de producción
docker-compose logs -f

# Ver logs de un servicio específico
docker-compose -f docker-compose.dev.yml logs -f frontend-dev
```

## Mejores Prácticas

1. **Siempre trabajar en la rama `develop`** para desarrollo
2. **Usar el script de gestión** en lugar de comandos manuales
3. **Verificar el estado** antes de hacer cambios importantes
4. **Limpiar contenedores** regularmente para evitar conflictos
5. **Revisar logs** cuando haya problemas

## Estructura de Archivos

```
├── .github/workflows/
│   ├── build.yml              # Workflow de producción
│   └── development.yml        # Workflow de desarrollo
├── docker-compose.yml         # Configuración de producción
├── docker-compose.dev.yml     # Configuración de desarrollo
├── Dockerfile                 # Dockerfile de producción
├── Dockerfile.dev            # Dockerfile de desarrollo
├── nginx.conf                # Configuración nginx de producción
├── nginx.dev.conf            # Configuración nginx de desarrollo
└── scripts/
    ├── manage-environments.sh     # Script bash para Linux/macOS
    ├── manage-environments.ps1    # Script PowerShell para Windows
    ├── ubuntu-server-setup.sh     # Script completo para Ubuntu Server
    └── deploy-to-ubuntu.sh        # Script de despliegue remoto
```
