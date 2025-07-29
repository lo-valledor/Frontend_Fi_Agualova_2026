# Despliegue en Ubuntu Server - Enerlova Frontend

Esta guía describe cómo desplegar Enerlova Frontend en un servidor Ubuntu Server, incluyendo la instalación de dependencias, configuración del sistema y gestión de entornos.

## 🖥️ Requisitos del Servidor

### Especificaciones Mínimas

- **Sistema Operativo**: Ubuntu Server 20.04 LTS o superior
- **CPU**: 2 cores
- **RAM**: 4 GB
- **Almacenamiento**: 20 GB de espacio libre
- **Red**: Conexión a internet para descarga de dependencias

### Especificaciones Recomendadas

- **CPU**: 4 cores
- **RAM**: 8 GB
- **Almacenamiento**: 50 GB SSD
- **Red**: Conexión estable a internet

## 🚀 Instalación Inicial

### 1. Preparación del Servidor

```bash
# Conectarse al servidor
ssh usuario@ip-del-servidor

# Actualizar el sistema
sudo apt update && sudo apt upgrade -y

# Instalar herramientas básicas
sudo apt install -y curl wget git unzip htop
```

### 2. Instalación Automática (Recomendado)

```bash
# Clonar el proyecto
git clone <repository-url> /opt/enerlova
cd /opt/enerlova

# Ejecutar script de instalación
chmod +x scripts/ubuntu-server-setup.sh
./scripts/ubuntu-server-setup.sh install
```

### 3. Configuración del Proyecto

```bash
# Configurar directorio y servicios
./scripts/ubuntu-server-setup.sh setup

# Cerrar sesión y volver a iniciar (para cambios del grupo docker)
exit
ssh usuario@ip-del-servidor
```

## 📦 Scripts Disponibles

### Script Principal: `ubuntu-server-setup.sh`

#### Comandos de Instalación

```bash
# Instalar todas las dependencias del sistema
./scripts/ubuntu-server-setup.sh install

# Configurar directorio y servicios del proyecto
./scripts/ubuntu-server-setup.sh setup
```

#### Comandos de Gestión

```bash
# Iniciar entorno de desarrollo con hot reload
./scripts/ubuntu-server-setup.sh dev

# Iniciar entorno de desarrollo con nginx
./scripts/ubuntu-server-setup.sh dev nginx

# Iniciar entorno de producción
./scripts/ubuntu-server-setup.sh prod

# Detener todos los contenedores
./scripts/ubuntu-server-setup.sh stop

# Ver logs del entorno actual
./scripts/ubuntu-server-setup.sh logs

# Ver estado completo del sistema
./scripts/ubuntu-server-setup.sh status

# Limpiar contenedores no utilizados
./scripts/ubuntu-server-setup.sh cleanup

# Actualizar proyecto desde git
./scripts/ubuntu-server-setup.sh update
```

### Script de Despliegue: `deploy-to-ubuntu.sh`

```bash
# Desplegar en servidor remoto
./scripts/deploy-to-ubuntu.sh 192.168.1.100 main prod

# Desplegar rama de desarrollo
./scripts/deploy-to-ubuntu.sh 192.168.1.100 develop dev

# Ver ayuda
./scripts/deploy-to-ubuntu.sh help
```

## 🔧 Configuración Manual

### Instalación de Docker

```bash
# Agregar repositorio oficial de Docker
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg

echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Instalar Docker
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

# Iniciar y habilitar Docker
sudo systemctl start docker
sudo systemctl enable docker

# Agregar usuario al grupo docker
sudo usermod -aG docker $USER
```

### Instalación de Docker Compose

```bash
# Descargar Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.24.5/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose

# Hacer ejecutable
sudo chmod +x /usr/local/bin/docker-compose

# Crear enlace simbólico
sudo ln -sf /usr/local/bin/docker-compose /usr/bin/docker-compose
```

### Configuración del Firewall

```bash
# Instalar ufw si no está instalado
sudo apt install -y ufw

# Configurar reglas básicas
sudo ufw --force enable
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 3000/tcp  # Puerto de desarrollo
sudo ufw allow 3001/tcp  # Puerto alternativo de desarrollo
sudo ufw allow 8080/tcp  # Puerto de producción
```

## 🐳 Gestión de Contenedores

### Estructura de Directorios

```
/opt/enerlova/
├── app/                    # Código fuente de la aplicación
├── scripts/               # Scripts de gestión
├── logs/                  # Logs de la aplicación
├── backups/               # Backups automáticos
├── docker-compose.yml     # Configuración de producción
├── docker-compose.dev.yml # Configuración de desarrollo
├── Dockerfile             # Dockerfile de producción
├── Dockerfile.dev         # Dockerfile de desarrollo
└── .env                   # Variables de entorno
```

### Variables de Entorno

#### Desarrollo

```bash
NODE_ENV=development
VITE_API_URL=http://192.168.1.139:8081/Enerlova
```

#### Producción

```bash
NODE_ENV=production
VITE_API_URL=http://192.168.1.139:8081/Enerlova
```

## 🌐 URLs de Acceso

| Entorno                 | Puerto | URL                     | Descripción           |
| ----------------------- | ------ | ----------------------- | --------------------- |
| Desarrollo (Dev Server) | 3000   | http://IP-SERVIDOR:3000 | Hot reload habilitado |
| Desarrollo (Nginx)      | 3001   | http://IP-SERVIDOR:3001 | Sin hot reload        |
| Producción              | 8080   | http://IP-SERVIDOR:8080 | Build optimizado      |

## 🔄 Despliegue Automático

### Usando el Script de Despliegue

```bash
# Desde tu máquina local
./scripts/deploy-to-ubuntu.sh 192.168.1.100 main prod
```

### Proceso de Despliegue

1. **Verificación de conectividad SSH**
2. **Backup del proyecto actual**
3. **Detención de contenedores**
4. **Copia de archivos del proyecto**
5. **Configuración de variables de entorno**
6. **Inicio del entorno correspondiente**
7. **Verificación del estado**

## 📊 Monitoreo y Mantenimiento

### Verificar Estado del Sistema

```bash
# Estado completo del sistema
./scripts/ubuntu-server-setup.sh status

# Ver logs en tiempo real
./scripts/ubuntu-server-setup.sh logs

# Ver logs de un contenedor específico
docker logs -f enerlova-frontend-dev
```

### Limpieza del Sistema

```bash
# Limpiar contenedores no utilizados
./scripts/ubuntu-server-setup.sh cleanup

# Limpiar imágenes Docker
docker image prune -f

# Limpiar volúmenes no utilizados
docker volume prune -f
```

### Actualización del Proyecto

```bash
# Actualizar desde git y reconstruir
./scripts/ubuntu-server-setup.sh update

# O manualmente
cd /opt/enerlova
git pull origin main
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

## 🔧 Servicio Systemd

El script crea automáticamente un servicio systemd para gestionar la aplicación:

```bash
# Ver estado del servicio
sudo systemctl status enerlova-frontend

# Iniciar servicio
sudo systemctl start enerlova-frontend

# Detener servicio
sudo systemctl stop enerlova-frontend

# Habilitar inicio automático
sudo systemctl enable enerlova-frontend
```

## 🛠️ Troubleshooting

### Problemas Comunes

#### 1. Docker no está ejecutándose

```bash
# Verificar estado de Docker
sudo systemctl status docker

# Iniciar Docker
sudo systemctl start docker

# Habilitar Docker
sudo systemctl enable docker
```

#### 2. Usuario no está en el grupo docker

```bash
# Agregar usuario al grupo docker
sudo usermod -aG docker $USER

# Verificar grupos
groups $USER

# Cerrar sesión y volver a iniciar
exit
ssh usuario@ip-del-servidor
```

#### 3. Puerto ya en uso

```bash
# Verificar qué está usando el puerto
sudo netstat -tlnp | grep :3000

# Detener todos los contenedores
./scripts/ubuntu-server-setup.sh stop

# Verificar contenedores activos
docker ps
```

#### 4. Problemas de permisos

```bash
# Verificar permisos del directorio
ls -la /opt/enerlova

# Corregir permisos
sudo chown -R $USER:$USER /opt/enerlova
chmod +x scripts/ubuntu-server-setup.sh
```

#### 5. Problemas de red

```bash
# Verificar conectividad
ping 8.8.8.8

# Verificar puertos abiertos
sudo ufw status

# Verificar logs de Docker
docker logs enerlova-frontend-dev
```

### Logs y Debugging

```bash
# Ver logs del sistema
sudo journalctl -u enerlova-frontend -f

# Ver logs de Docker
docker logs -f enerlova-frontend-dev

# Ver logs de nginx
docker exec enerlova-frontend-dev cat /var/log/nginx/error.log
```

## 🔒 Seguridad

### Configuración de Firewall

```bash
# Verificar estado del firewall
sudo ufw status

# Agregar reglas adicionales si es necesario
sudo ufw allow from 192.168.1.0/24 to any port 3000
sudo ufw allow from 192.168.1.0/24 to any port 8080
```

### Actualizaciones de Seguridad

```bash
# Actualizar el sistema regularmente
sudo apt update && sudo apt upgrade -y

# Actualizar Docker
sudo apt update
sudo apt install docker-ce docker-ce-cli containerd.io
```

## 📈 Optimización

### Configuración de Recursos

```bash
# Limitar recursos de contenedores
docker-compose up -d --scale frontend-dev=1

# Configurar límites de memoria
docker run --memory=2g --cpus=1 enerlova-frontend:dev
```

### Monitoreo de Recursos

```bash
# Ver uso de recursos
htop

# Ver uso de Docker
docker stats

# Ver uso de disco
df -h
```

## 📚 Comandos Útiles

### Gestión de Contenedores

```bash
# Ver contenedores activos
docker ps

# Ver todos los contenedores
docker ps -a

# Ver logs de un contenedor
docker logs -f container_name

# Ejecutar comando en contenedor
docker exec -it container_name bash
```

### Gestión de Imágenes

```bash
# Ver imágenes
docker images

# Eliminar imagen
docker rmi image_name

# Construir imagen
docker build -t enerlova-frontend:latest .
```

### Gestión de Volúmenes

```bash
# Ver volúmenes
docker volume ls

# Eliminar volumen
docker volume rm volume_name

# Ver información de volumen
docker volume inspect volume_name
```

## 🆘 Soporte

Para problemas específicos o consultas adicionales:

1. Revisar la documentación en `docs/ENVIRONMENT-MANAGEMENT.md`
2. Verificar logs del sistema y contenedores
3. Consultar la documentación oficial de Docker
4. Revisar issues del proyecto en GitHub
