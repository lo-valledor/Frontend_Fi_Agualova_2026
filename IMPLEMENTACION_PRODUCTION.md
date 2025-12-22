## 📄 Documentación: Despliegue y Hardening de Enerlova en Saturno

Esta guía documenta la clonación, el despliegue con Docker Compose (puertos **6001/7001**), y la configuración de NGINX como proxy inverso con SSL, basándose en tu archivo actual.

### 1\. Fase I: Preparación del Entorno y Despliegue

#### 1.1. Crear el Directorio de Aplicación

Asegura un directorio estándar y los permisos correctos.

```bash
# Crear la carpeta principal para las aplicaciones
sudo mkdir -p /var/www/enerlova 

# Dar permisos al usuario saturno (para manejar archivos)
sudo chown saturno:saturno /var/www/enerlova

# Navegar a la carpeta
cd /var/www/enerlova
```

#### 1.2. Clonar el Repositorio de la Aplicación

```bash
# Clonar el repositorio. El punto (.) clona el contenido en la carpeta actual.
git clone <URL_DE_TU_REPOSITORIO_ENERLOVA> .
```

#### 1.3. Ajuste de Puertos en Docker Compose (6001/7001)

Asegúrate de que tu archivo `docker-compose.yml` exponga los puertos internos que queremos usar (6001 y 7001) a la interfaz del servidor.

**Ejemplo de cómo deben verse las secciones `ports:` en `docker-compose.yml`:**

```yaml
services:
  frontend:
    # ...
    ports:
      - "6001:6001" # Host:Contenedor
  backend:
    # ...
    ports:
      - "7001:7001" # Host:Contenedor
```

#### 1.4. Iniciar la Aplicación con Docker Compose

```bash
# Construir las imágenes y levantar los servicios en modo detached (-d)
docker compose up -d --build 
```

#### 1.5. Verificar la Conectividad Inicial

Confirma que los servicios están en ejecución y son accesibles localmente en los puertos deseados.

```bash
# Verificar que los contenedores estén en estado 'Up'
docker compose ps

# Comprobar la conexión local del Frontend (6001) y Backend (7001)
curl http://localhost:6001
curl http://localhost:7001/Enerlova # (Ajustar según la ruta de tu API)
```

### 2\. Fase II: Hardening y Ocultamiento de Puertos (NGINX)

Ahora configuramos NGINX para que deje de usar los puertos antiguos (`32010`, `8081`) y apunte a los nuevos de Docker Compose (`6001`, `7001`), ocultándolos tras el puerto seguro `443`.

#### 2.1. Ubicar y Editar la Configuración de NGINX

Asumimos que tu archivo de configuración es **`/etc/nginx/sites-available/enerlovauat.mmlovalledor.cl.conf`**.

```bash
# Abrir el archivo de configuración para editar
sudo nano /etc/nginx/sites-available/enerlovauat.mmlovalledor.cl.conf 
```

#### 2.2. Aplicar las Modificaciones del Proxy

**Modifica la sección `location /` y la sección `location /Enerlova`** para que apunten a los puertos correctos (`6001` y `7001`).

| Bloque a modificar | Línea `proxy_pass` antigua | Línea `proxy_pass` nueva |
| :--- | :--- | :--- |
| **Frontend (`/`)** | `proxy_pass http://127.0.0.1:32010;` | `proxy_pass http://127.0.0.1:6001;` |
| **Backend (`/Enerlova`)** | `proxy_pass http://127.0.0.1:8081;` | `proxy_pass http://127.0.0.1:7001;` |

**Ejemplo de las secciones modificadas:**

```nginx
# ...
# --- FRONTEND (React) ---
location / {
    proxy_pass http://127.0.0.1:6001; # <--- PUERTO CORREGIDO
    # ...
}

# --- BACKEND (.NET API) ---
location /Enerlova {
    proxy_pass http://127.0.0.1:7001; # <--- PUERTO CORREGIDO
    # ...
}
# ...
```

#### 2.3. Instalar y Configurar Certificado Auto-Firmado (Si los Certificados no existen)

Si los archivos referenciados (`nginx-selfsigned.crt` y `nginx-selfsigned.key`) aún no existen, NGINX fallará. Debes crearlos, a menos que ya los hayas generado previamente.

```bash
# Creación de clave privada y certificado auto-firmado (Solo si no existe)
sudo mkdir -p /etc/ssl/private
sudo mkdir -p /etc/ssl/certs
sudo openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout /etc/ssl/private/nginx-selfsigned.key \
  -out /etc/ssl/certs/nginx-selfsigned.crt
```

#### 2.4. Recargar NGINX

```bash
# 1. Verificar la sintaxis (Obligatorio)
sudo nginx -t

# 2. Recargar NGINX para aplicar los cambios de proxy (6001/7001)
sudo systemctl reload nginx
```

-----