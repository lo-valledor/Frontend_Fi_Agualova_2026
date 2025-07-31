# 🚀 Enerlova Frontend - Configuración Multi-Entorno

Este proyecto incluye configuración para desplegar en múltiples entornos usando Docker.

## 📋 Entornos Disponibles

| Entorno        | Rama      | Puerto | API URL                            |
| -------------- | --------- | ------ | ---------------------------------- |
| **Producción** | `main`    | 8080   | http://192.168.1.139:8081/Enerlova |
| **Desarrollo** | `develop` | 3000   | http://192.168.1.139:8082/Enerlova |

## 🛠️ Uso Rápido

### Método 1: Scripts Automatizados

#### Linux/Mac:

```bash
# Dar permisos de ejecución
chmod +x deploy.sh

# Desplegar producción
./deploy.sh prod

# Desplegar desarrollo
./deploy.sh dev

# Desplegar ambos
./deploy.sh both

# Ver estado
./deploy.sh status

# Detener servicios
./deploy.sh stop
```

#### Windows PowerShell:

```powershell
# Desplegar producción
.\deploy.ps1 prod

# Desplegar desarrollo
.\deploy.ps1 dev

# Desplegar ambos
.\deploy.ps1 both

# Ver estado
.\deploy.ps1 status

# Detener servicios
.\deploy.ps1 stop
```

### Método 2: Docker Compose Manual

#### Producción (Puerto 8080):

```bash
docker-compose -f docker-compose.prod.yml up --build -d
```

#### Desarrollo (Puerto 3000):

```bash
docker-compose -f docker-compose.develop.yml up --build -d
```

#### Ambos entornos:

```bash
docker-compose -f docker-compose.multi.yml up --build -d
```

## 🔧 Configuración

### Variables de Entorno

Cada entorno tiene su configuración específica:

- **Producción**: `VITE_API_URL=http://192.168.1.139:8081/Enerlova`
- **Desarrollo**: `VITE_API_URL=http://192.168.1.139:8082/Enerlova`

### Archivos de Configuración

```
├── docker-compose.yml          # Configuración original
├── docker-compose.prod.yml     # Solo producción
├── docker-compose.develop.yml  # Solo desarrollo
├── docker-compose.multi.yml    # Ambos entornos
├── Dockerfile                  # Dockerfile original
├── Dockerfile.multi           # Dockerfile multi-stage
├── deploy.sh                  # Script Linux/Mac
├── deploy.ps1                 # Script Windows
└── .github/workflows/         # CI/CD automático
    ├── deploy-production.yml
    └── deploy-development.yml
```

## 🚀 CI/CD Automático

### GitHub Actions

El proyecto incluye workflows automáticos:

1. **Push a `main`** → Despliega automáticamente a **producción** (puerto 8080)
2. **Push a `develop`** → Despliega automáticamente a **desarrollo** (puerto 3000)

### Configurar Secrets en GitHub

Para el CI/CD automático, configura estos secrets en tu repositorio:

```
DOCKER_USERNAME=tu-usuario-docker
DOCKER_PASSWORD=tu-password-docker
PROD_HOST=ip-servidor-produccion
PROD_USER=usuario-servidor
PROD_SSH_KEY=clave-ssh-privada
DEV_HOST=ip-servidor-desarrollo
DEV_USER=usuario-servidor
DEV_SSH_KEY=clave-ssh-privada
```

## 🌐 Acceso a los Entornos

Una vez desplegados:

- **Producción**: http://localhost:8080
- **Desarrollo**: http://localhost:3000

## 🐛 Solución de Problemas

### Ver logs de contenedores:

```bash
# Producción
docker-compose -f docker-compose.prod.yml logs -f

# Desarrollo
docker-compose -f docker-compose.develop.yml logs -f
```

### Limpiar y reiniciar:

```bash
# Detener todo
./deploy.sh stop

# Limpiar imágenes y contenedores
./deploy.sh clean

# Reiniciar
./deploy.sh both
```

### Verificar estado:

```bash
./deploy.sh status
```

## 📦 Comandos Útiles

```bash
# Ver contenedores activos
docker ps

# Ver imágenes
docker images

# Limpiar sistema Docker
docker system prune -f

# Reconstruir sin caché
docker-compose -f docker-compose.prod.yml up --build --force-recreate -d
```

## 🔄 Flujo de Trabajo Recomendado

1. **Desarrollo**: Trabaja en la rama `develop` y haz push para desplegar automáticamente en puerto 3000
2. **Testing**: Prueba cambios en el entorno de desarrollo
3. **Producción**: Merge a `main` para desplegar automáticamente en puerto 8080

¡Listo! Ahora tienes un sistema completo de CI/CD con múltiples entornos. 🎉
