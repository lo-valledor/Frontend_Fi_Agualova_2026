# 🚀 Configuración del GitHub Actions Runner

Esta guía te ayudará a configurar y solucionar problemas del GitHub Actions self-hosted runner para el despliegue automático.

## 📋 Requisitos Previos

### En el Servidor de Despliegue:

- ✅ **Ubuntu/Debian** (recomendado) o CentOS/RHEL
- ✅ **Docker** y **Docker Compose** instalados
- ✅ **Git** instalado
- ✅ **Acceso root** o permisos sudo
- ✅ **Puerto 8080** disponible
- ✅ **Conexión a internet** para descargar el runner

## 🔧 Instalación del Runner

### Paso 1: Preparar el Servidor

```bash
# Actualizar sistema
sudo apt update && sudo apt upgrade -y

# Instalar dependencias
sudo apt install -y curl wget git docker.io docker-compose

# Agregar usuario al grupo docker
sudo usermod -aG docker $USER
newgrp docker
```

### Paso 2: Descargar y Configurar el Runner

```bash
# Navegar al directorio del proyecto
cd /ruta/a/tu/proyecto

# Usar el script de configuración
./scripts/setup-runner.sh install
```

### Paso 3: Obtener Token de GitHub

1. 🌐 Ve a tu repositorio: `https://github.com/lo-valledor/Frontend_Fi_Enerlova_2025`
2. ⚙️ **Settings** → **Actions** → **Runners**
3. 🔘 Haz clic en **"New self-hosted runner"**
4. 📋 Copia el token de configuración

### Paso 4: Configurar el Runner

```bash
# En el servidor, en el directorio actions-runner
cd actions-runner

# Configurar con el token (reemplaza [TOKEN] con el token real)
./config.sh --url https://github.com/lo-valledor/Frontend_Fi_Enerlova_2025 --token [TOKEN]

# Instalar como servicio
sudo ./svc.sh install

# Iniciar el servicio
sudo ./svc.sh start
```

## 🔍 Verificar Estado del Runner

### Usar el Script de Diagnóstico

```bash
# Verificar estado
./scripts/setup-runner.sh status

# Ver logs
./scripts/setup-runner.sh logs

# Verificar despliegue
./scripts/setup-runner.sh deploy
```

### Verificar Manualmente

```bash
# Estado del servicio
sudo systemctl status actions.runner.*

# Logs del servicio
sudo journalctl -u actions.runner.* -f

# Verificar que el runner aparece online en GitHub
# Settings > Actions > Runners
```

## 🚨 Solucionar Problemas

### Runner Offline

#### Opción 1: Reiniciar el Servicio

```bash
./scripts/setup-runner.sh restart
```

#### Opción 2: Reinstalar el Runner

```bash
# Detener y desinstalar
cd actions-runner
sudo ./svc.sh stop
sudo ./svc.sh uninstall

# Reinstalar con nuevo token
./config.sh --url https://github.com/lo-valledor/Frontend_Fi_Enerlova_2025 --token [NUEVO_TOKEN]
sudo ./svc.sh install
sudo ./svc.sh start
```

### Problemas de Docker

```bash
# Verificar que Docker está corriendo
sudo systemctl status docker

# Reiniciar Docker si es necesario
sudo systemctl restart docker

# Verificar permisos
docker ps
```

### Problemas de Puerto

```bash
# Verificar si el puerto 8080 está en uso
netstat -tlnp | grep :8080

# Si está en uso, detener el proceso
sudo lsof -ti:8080 | xargs kill -9

# O cambiar el puerto en docker-compose.yml
```

## 🔧 Configuración del Workflow

### Variables de Entorno Requeridas

Configura estos secrets en GitHub (`Settings > Secrets and variables > Actions`):

```
VITE_API_URL=http://192.168.1.139:8081/Enerlova
```

### Estructura del Proyecto

```
tu-proyecto/
├── .github/
│   └── workflows/
│       └── ci-cd.yml          # Pipeline principal
├── scripts/
│   └── setup-runner.sh        # Script de configuración
├── docker-compose.yml         # Configuración Docker
├── Dockerfile                 # Imagen Docker
└── docs/
    └── RUNNER-SETUP.md        # Esta documentación
```

## 🚀 Probar el Despliegue

### 1. Crear un PR

```bash
git checkout -b test-deploy
git add .
git commit -m "test: probar despliegue automático"
git push origin test-deploy
```

### 2. Crear Pull Request

- Ve a GitHub y crea un PR desde `test-deploy` a `main`
- El CI se ejecutará automáticamente
- Si el PR se mergea a `main`, se activará el deploy

### 3. Verificar Despliegue

```bash
# En el servidor
./scripts/setup-runner.sh deploy

# O manualmente
curl http://localhost:8080
```

## 📊 Monitoreo

### Logs del Runner

```bash
# Logs en tiempo real
sudo journalctl -u actions.runner.* -f

# Logs del archivo
tail -f actions-runner/runner.log
```

### Logs del Despliegue

```bash
# Logs de Docker Compose
docker-compose logs -f

# Estado de contenedores
docker-compose ps
```

### Métricas del Servidor

```bash
# Uso de CPU y memoria
htop

# Uso de disco
df -h

# Uso de red
iftop
```

## 🔄 Mantenimiento

### Actualizar el Runner

```bash
cd actions-runner
sudo ./svc.sh stop
./run.sh --update
sudo ./svc.sh start
```

### Limpiar Docker

```bash
# Limpiar imágenes no utilizadas
docker image prune -f

# Limpiar contenedores detenidos
docker container prune -f

# Limpiar volúmenes no utilizados
docker volume prune -f
```

### Backup de Configuración

```bash
# Backup del runner
tar -czf runner-backup-$(date +%Y%m%d).tar.gz actions-runner/

# Backup de Docker Compose
cp docker-compose.yml docker-compose.yml.backup
```

## 🆘 Troubleshooting

### Error: "Runner is offline"

- ✅ Verificar conexión a internet
- ✅ Reiniciar el servicio del runner
- ✅ Verificar logs del runner
- ✅ Reinstalar con nuevo token

### Error: "Docker not found"

- ✅ Instalar Docker: `sudo apt install docker.io`
- ✅ Agregar usuario al grupo docker
- ✅ Reiniciar sesión o ejecutar `newgrp docker`

### Error: "Port 8080 already in use"

- ✅ Verificar qué proceso usa el puerto: `netstat -tlnp | grep :8080`
- ✅ Detener proceso: `sudo lsof -ti:8080 | xargs kill -9`
- ✅ O cambiar puerto en `docker-compose.yml`

### Error: "Build failed"

- ✅ Verificar que `VITE_API_URL` está configurado
- ✅ Verificar logs del build en GitHub Actions
- ✅ Probar build localmente: `pnpm run build`

## 📞 Soporte

Si tienes problemas:

1. 🔍 Revisa los logs: `./scripts/setup-runner.sh logs`
2. 📋 Verifica el estado: `./scripts/setup-runner.sh status`
3. 🐛 Revisa los logs de GitHub Actions en la pestaña "Actions"
4. 📧 Contacta al equipo de desarrollo

---

**¡Con esta configuración, tu aplicación se desplegará automáticamente cada vez que hagas merge a main!** 🚀
