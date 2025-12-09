# MANUAL DE INSTALACIÓN: Docker, Kubernetes, Prometheus & Grafana en Ubuntu Server 24.04

Este manual detalla los pasos para configurar un entorno de desarrollo/producción con Docker, Kubernetes y un stack de monitoreo completo (Prometheus y Grafana) en un Ubuntu Server 24.04 recién instalado.

---

## Capítulo 1: Instalación y Configuración de Docker Engine

Este capítulo detalla la instalación de Docker Engine, `containerd` y Docker Compose. Docker será la herramienta que usaremos para construir y publicar las imágenes de nuestras aplicaciones.

### 1.1. Preparación del Sistema

Asegúrate de que tu sistema está actualizado y tienes las utilidades necesarias.

```bash
# 1. Actualizar el índice de paquetes y el software del sistema
sudo apt update
sudo apt upgrade -y
sudo apt autoremove -y

# 2. Instalar paquetes esenciales para la gestión de repositorios y utilidades básicas
sudo apt install -y curl wget gnupg apt-transport-https ca-certificates lsb-release vim git net-tools
```

### 1.2. Añadir el Repositorio Oficial de Docker

Para asegurar que instalamos la versión más reciente y estable de Docker, añadiremos su repositorio oficial.

```bash
# 1. Limpiar cualquier configuración antigua de Docker para evitar conflictos
sudo rm -f /etc/apt/sources.list.d/docker.list

# 2. Crear el directorio para las claves GPG de APT si no existe
sudo install -m 0755 -d /etc/apt/keyrings

# 3. Descargar la clave GPG oficial de Docker y guardarla correctamente
curl -fsSL https://download.docker.com/linux/ubuntu/gpg \
  | sudo gpg --dearmor -o /etc/apt/keyrings/docker.asc

# 4. Configurar los permisos de la clave GPG
sudo chmod a+r /etc/apt/keyrings/docker.asc

# 5. Añadir el repositorio de Docker a las fuentes de APT usando el esquema moderno
sudo tee /etc/apt/sources.list.d/docker.sources > /dev/null <<EOF
Types: deb
URIs: https://download.docker.com/linux/ubuntu
Suites: $(. /etc/os-release && echo "${UBUNTU_CODENAME:-$VERSION_CODENAME}")
Components: stable
Signed-By: /etc/apt/keyrings/docker.asc
EOF

# 6. Actualizar el índice de paquetes de APT nuevamente
sudo apt update
```

### 1.3. Instalar Docker Engine, `containerd` y Docker Compose

Ahora que el repositorio está configurado, podemos instalar los componentes principales de Docker.

```bash
# 1. Instalar Docker Engine, Docker CLI, containerd.io, Docker Buildx y Docker Compose plugin
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
```

### 1.4. Verificar la Instalación de Docker

Confirma que Docker se ha instalado correctamente y está funcionando.

```bash
# 1. Verificar el estado del servicio Docker
sudo systemctl status docker

# Si no está activo, iniciarlo y habilitarlo:
sudo systemctl enable --now docker

# 2. Ejecutar un contenedor de prueba
sudo docker run --rm hello-world
```
Deberías ver un mensaje que indica que tu instalación de Docker funciona correctamente.

### 1.5. Configurar Docker para Usuarios Sin Privilegios (Recomendado)

Por defecto, los comandos de Docker requieren `sudo`. Añadir tu usuario al grupo `docker` te permite ejecutar comandos Docker sin `sudo`.

```bash
# 1. Crear el grupo 'docker' si no existe
sudo groupadd docker 2>/dev/null || true

# 2. Añadir tu usuario actual al grupo 'docker'
sudo usermod -aG docker $USER
```
> **¡IMPORTANTE!** Después de ejecutar este comando, debes **cerrar tu sesión SSH y volver a iniciarla** (o reiniciar el servidor con `sudo reboot`) para que los cambios de grupo surtan efecto.

---

## Capítulo 2: Instalar Kubernetes con `kubeadm` en Ubuntu 24.04

### 2.1. Requisitos previos para Kubernetes

-   Ubuntu Server 24.04 (Noble) actualizado.
-   Mínimo 2 vCPU y 4 GB de RAM.
-   Acceso `sudo`.
-   Docker Engine instalado.

### 2.2. Deshabilitar Swap (Requisito de Kubernetes)

```bash
sudo swapoff -a
sudo sed -i '/[[:space:]]swap[[:space:]]/ s/^/#/' /etc/fstab
```

Verificar que el swap está deshabilitado:

```bash
swapon --show
```
> (Este comando no debe mostrar ninguna salida)

### 2.3. Habilitar Módulos de Red y Ajustes de `sysctl`

```bash
cat <<EOF | sudo tee /etc/modules-load.d/k8s.conf
overlay
br_netfilter
EOF

sudo modprobe overlay
sudo modprobe br_netfilter

cat <<EOF | sudo tee /etc/sysctl.d/k8s.conf
net.bridge.bridge-nf-call-iptables  = 1
net.bridge.bridge-nf-call-ip6tables = 1
net.ipv4.ip_forward                 = 1
EOF

sudo sysctl --system
```

### 2.4. Configurar `containerd` para Kubernetes

Aunque Docker instaló `containerd.io`, es crucial configurar `containerd` explícitamente para que Kubernetes lo use correctamente.

```bash
# Crear el directorio de configuración por defecto si no existe
sudo mkdir -p /etc/containerd
# Generar la configuración por defecto y sobreescribirla si es necesario
sudo containerd config default | sudo tee /etc/containerd/config.toml > /dev/null

# Cambiar 'SystemdCgroup = false' a 'SystemdCgroup = true'
sudo sed -i 's/SystemdCgroup = false/SystemdCgroup = true/' /etc/containerd/config.toml

# Reiniciar y habilitar el servicio containerd
sudo systemctl restart containerd
sudo systemctl enable containerd
```

### 2.5. Añadir el Repositorio Oficial de Kubernetes (pkgs.k8s.io)

```bash
# 1. Crear el directorio para los keyrings de APT
sudo mkdir -p /etc/apt/keyrings

# 2. Definir la versión de Kubernetes a instalar (ej. v1.30)
K8S_VERSION="v1.30"

# 3. Descargar y añadir la clave GPG pública de Kubernetes
curl -fsSL https://pkgs.k8s.io/core:/stable:/$K8S_VERSION/deb/Release.key \
  | sudo gpg --dearmor -o /etc/apt/keyrings/kubernetes-apt-keyring.gpg

# 4. Añadir la nueva definición del repositorio de Kubernetes
echo "deb [signed-by=/etc/apt/keyrings/kubernetes-apt-keyring.gpg] \
https://pkgs.k8s.io/core:/stable:/$K8S_VERSION/deb/ /" \
  | sudo tee /etc/apt/sources.list.d/kubernetes.list > /dev/null

# 5. Actualizar el índice de paquetes de APT
sudo apt update
```

### 2.6. Instalar `kubeadm`, `kubelet` y `kubectl`

```bash
sudo apt install -y kubelet kubeadm kubectl
sudo apt-mark hold kubelet kubeadm kubectl # Evita que se actualicen accidentalmente
```

### 2.7. Inicializar el Clúster Kubernetes (Control Plane)

Para un clúster de un solo nodo (control-plane y worker en la misma máquina):

```bash
sudo kubeadm init --pod-network-cidr=10.244.0.0/16
```
> **¡IMPORTANTE!** Anota la línea `kubeadm join ...` que aparece al final. La necesitarás si en el futuro decides añadir más nodos worker. Si el proceso falla, puedes limpiar con `sudo kubeadm reset -f` y `sudo rm -rf $HOME/.kube` y reintentar.

### 2.8. Configurar `kubectl` para tu Usuario

```bash
mkdir -p $HOME/.kube
sudo cp -i /etc/kubernetes/admin.conf $HOME/.kube/config
sudo chown "$(id -u):$(id -g)" $HOME/.kube/config
```

Verificar que el nodo aparece (estará en `NotReady` por ahora):

```bash
kubectl get nodes
```

### 2.9. Instalar la Red de Pods (CNI - Calico)

```bash
kubectl apply -f https://raw.githubusercontent.com/projectcalico/calico/v3.28.0/manifests/calico.yaml
```

Verifica el estado del clúster hasta que los pods y el nodo estén `Running` y `Ready`:

```bash
kubectl get pods -n kube-system
kubectl get nodes
```

### 2.10. Quitar el Taint del Nodo Control Plane (para clúster de un solo nodo)

En un clúster de un solo nodo, el nodo control-plane tiene un "taint" que impide que los pods de usuario se programen en él. Para un entorno de desarrollo de un solo nodo, lo quitamos:

```bash
kubectl taint nodes saturno node-role.kubernetes.io/control-plane-  || true
kubectl taint nodes saturno node-role.kubernetes.io/master-        - 2>/dev/null || true
```
Verificar:
```bash
kubectl describe node saturno | grep -i Taint
```
> (Debería mostrar "Taints: <none>")

---

## Capítulo 3: Instalar Helm

Helm es el gestor de paquetes estándar para Kubernetes.

```bash
curl -fsSL -o get_helm.sh https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-4
chmod 700 get_helm.sh
./get_helm.sh
```

Verificar:

```bash
helm version
```

---

## Capítulo 4: Instalar Prometheus + Grafana con `kube-prometheus-stack`

`kube-prometheus-stack` es el chart que despliega Prometheus, Alertmanager, Grafana y los exporters necesarios (kube-state-metrics, node-exporter) en Kubernetes.

### 4.1. Añadir el Repositorio de Charts de Prometheus

```bash
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm repo update
```

### 4.2. Crear Namespace de Monitoreo

```bash
kubectl create namespace monitoring
```

### 4.3. Instalar `kube-prometheus-stack`

```bash
helm upgrade --install prometheus-stack prometheus-community/kube-prometheus-stack \
  -n monitoring --create-namespace --timeout 15m
```
> **¡IMPORTANTE!** Deja que este comando termine sin interrupciones. Puede tardar varios minutos en descargar imágenes y aplicar todos los recursos.

Verificar el estado:

```bash
kubectl get pods -n monitoring
```
> (Espera a que todos los pods estén en estado 'Running')

### 4.4. Acceder a Grafana

1.  **Obtener el password inicial de `admin`:**

    ```bash
    kubectl get secret prometheus-stack-grafana \
      -n monitoring \
      -o jsonpath="{.data.admin-password}" | base64 --decode; echo
    ```
    Guarda este password temporal.

2.  **Hacer port-forward para acceso inicial (desde tu PC):**

    ```bash
    kubectl port-forward --address 0.0.0.0 svc/prometheus-stack-grafana \
      -n monitoring 3000:80
    ```
    Deja este comando ejecutándose en una terminal.

3.  **Acceder en tu navegador:**
    *   URL: `http://<IP_DE_TU_SERVIDOR>:3000` (ej. `http://192.168.1.139:3000`)
    *   Usuario: `admin`
    *   Contraseña: la obtenida del Secret.
4.  **Cambiar la contraseña de `admin` en Grafana:**  
    Una vez logueado, ve a tu perfil o configuración de administración para cambiar la contraseña por una personalizada y segura.

### 4.5. (Opcional) Resetear contraseña de Grafana si se pierde

```bash
# Obtener el nombre del pod de Grafana
kubectl get pods -n monitoring -l app.kubernetes.io/name=grafana

# Ejecutar el reset (reemplaza <nombre-del-pod-grafana> y la contraseña)
kubectl exec -it -n monitoring <nombre-del-pod-grafana> -- \
  grafana-cli admin reset-admin-password "TuNuevaPasswordFuerte"
```

¡Por supuesto, Gerard! Aquí tienes la documentación desde el Capítulo 5 hasta el 8, lista para copiar y pegar en tu archivo `.md`.

---

## Capítulo 5: Exponer Servicios de Monitoreo vía NodePort

Para tener un acceso permanente a Grafana y Prometheus sin necesidad de `kubectl port-forward`, configuraremos sus Services para que usen NodePorts.

### 5.1. Grafana como NodePort (puerto fijo)

Configura el Service de Grafana para que use un NodePort (ej. `32000`).

```bash
helm upgrade prometheus-stack prometheus-community/kube-prometheus-stack \
  -n monitoring \
  --reuse-values \
  --set grafana.service.type=NodePort \
  --set grafana.service.nodePort=32000
```

Verificar el Service:

```bash
kubectl get svc -n monitoring prometheus-stack-grafana
```
> **Salida Esperada (aprox.):**
> ```text
> NAME                       TYPE       CLUSTER-IP    EXTERNAL-IP   PORT(S)       AGE
> prometheus-stack-grafana   NodePort   10.x.x.x      <none>        80:32000/TCP  ...
> ```

Abrir puerto en el firewall UFW:

```bash
sudo ufw allow 32000/tcp
sudo ufw reload
```

Ahora puedes acceder a Grafana desde cualquier equipo de tu red en: `http://<IP_DE_TU_SERVIDOR>:32000`.

### 5.2. (Opcional) Prometheus como NodePort

Para acceder a la UI de Prometheus directamente (ej. puerto `32001`):

```bash
helm upgrade prometheus-stack prometheus-community/kube-prometheus-stack \
  -n monitoring \
  --reuse-values \
  --set grafana.service.type=NodePort \
  --set grafana.service.nodePort=32000 \
  --set prometheus.service.type=NodePort \
  --set prometheus.service.nodePort=32001
```

Abrir el puerto en UFW:

```bash
sudo ufw allow 32001/tcp
sudo ufw reload
```

Ahora puedes acceder a la UI de Prometheus en: `http://<IP_DE_TU_SERVIDOR>:32001`.

---

## Capítulo 6: Desplegar una app de ejemplo (`demo-nginx`)

Este capítulo ilustra cómo desplegar una aplicación simple en Kubernetes y verificar su funcionamiento y observabilidad.

### 6.1. Crear Namespace `apps`

```bash
kubectl create namespace apps
```

### 6.2. Crear y aplicar el Deployment `demo-nginx`

Crear el directorio de manifiestos y el archivo del Deployment:

```bash
mkdir -p /home/saturno/k8s/apps
cd /home/saturno/k8s/apps
nano demo-nginx.yaml
```
Contenido de `demo-nginx.yaml`:
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: demo-nginx
  namespace: apps
spec:
  replicas: 2
  selector:
    matchLabels:
      app: demo-nginx
  template:
    metadata:
      labels:
        app: demo-nginx
    spec:
      containers:
        - name: nginx
          image: nginx:1.27
          ports:
            - containerPort: 80
          resources:
            requests:
              cpu: "100m"
              memory: "128Mi"
            limits:
              cpu: "200m"
              memory: "256Mi"
```
Aplicar y verificar que los pods estén `Running`:
```bash
kubectl apply -f demo-nginx.yaml
kubectl get pods -n apps -w
```

### 6.3. Crear y aplicar el Service `demo-nginx`

Crea `demo-nginx-service.yaml`:
```bash
nano demo-nginx-service.yaml
```
Contenido de `demo-nginx-service.yaml`:
```yaml
apiVersion: v1
kind: Service
metadata:
  name: demo-nginx
  namespace: apps
spec:
  selector:
    app: demo-nginx
  ports:
    - name: http
      port: 80
      targetPort: 80
      protocol: TCP
  type: ClusterIP
```
Aplicar y verificar:
```bash
kubectl apply -f demo-nginx-service.yaml
kubectl get svc -n apps demo-nginx
```

---

## Capítulo 7: Ver la app `demo-nginx` en los dashboards de Kubernetes

Las métricas de `demo-nginx` son automáticamente recolectadas por Prometheus.

### 7.1. Navegar a Dashboards en Grafana

1.  Accede a Grafana: `http://<IP_DE_TU_SERVIDOR>:32000`
2.  Menú izquierdo → `Dashboards`.

### 7.2. Dashboards de recursos de Kubernetes

Busca y abre dashboards como:

-   `Kubernetes / Compute Resources / Namespace (Pods)`
-   `Kubernetes / Compute Resources / Workload`
-   `Kubernetes / Compute Resources / Pod`

En estos dashboards:

-   Selecciona `namespace = apps`.
-   Filtra por `workload` o `pod` (ej. `demo-nginx`).

Verás gráficos de CPU, memoria, réplicas y otros datos para tu aplicación de ejemplo.

---

## Capítulo 8: Migrar Backend .NET y Frontend React a Kubernetes

Este capítulo cubre la traducción de tus aplicaciones desde Docker Compose a Kubernetes, incluyendo la gestión de imágenes, variables de entorno y comunicación entre ellas.

### 8.1. Preparar Imágenes Docker para Kubernetes

Las imágenes deben ser construidas y subidas a un registry (ej. Docker Hub) accesible desde tu clúster.

```bash
# Navegar al directorio de tu backend (.NET)
cd /var/Backend_Fi_Enerlova_2025

# Construir la imagen de la API y pushearla
docker build --no-cache -t lovalledor/enerlova-api:1.0.6 . # Usar la última tag con el fix de CORS, actual 1.0.6
docker push lovalledor/enerlova-api:1.0.6

# Navegar al directorio de tu frontend (React)
cd /var/Frontend_Fi_Enerlova_2025

# Construir la imagen del frontend con la VITE_API_URL pública
docker build -t lovalledor/enerlova-frontend:1.0.6 \
  --build-arg VITE_API_URL="http://192.168.1.139:32011/Enerlova" \
  --build-arg VITE_APP_ENV=production \
  .
docker push lovalledor/enerlova-frontend:1.0.6
```
> **Nota:** La URL del `VITE_API_URL` (`http://192.168.1.139:32011/Enerlova`) usa la IP de tu nodo y el NodePort `32011` del backend para ser accesible desde el navegador del usuario.

### 8.2. Backend .NET: Secret para Variables de Entorno

Crear un Secret a partir de tu archivo `.env` del backend.

Desde el directorio donde está el `.env` del backend (ej. `/var/Backend_Fi_Enerlova_2025`):
```bash
kubectl create secret generic enerlova-api-env \
  --from-env-file=.env \
  -n apps
```

### 8.3. Backend .NET: Deployment y Service

#### 8.3.1. Deployment del backend

Crea o edita `enerlova-api.yaml` en `/home/saturno/k8s/apps`:
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: enerlova-api
  namespace: apps
spec:
  replicas: 1
  selector:
    matchLabels:
      app: enerlova-api
  template:
    metadata:
      labels:
        app: enerlova-api
    spec:
      containers:
        - name: enerlova-api
          image: lovalledor/enerlova-api:1.0.5
          imagePullPolicy: IfNotPresent
          ports:
            - containerPort: 8080
          env:
            - name: ASPNETCORE_ENVIRONMENT
              value: "Production"
          envFrom:
            - secretRef:
                name: enerlova-api-env
          resources:
            requests:
              cpu: "100m"
              memory: "256Mi"
            limits:
              cpu: "500m"
              memory: "512Mi"
```
Aplicar y verificar:
```bash
kubectl apply -f enerlova-api.yaml
kubectl get pods -n apps -l app=enerlova-api
```

#### 8.3.2. Service del backend (NodePort)

Crea o edita `enerlova-api-service.yaml` en `/home/saturno/k8s/apps`:
```yaml
apiVersion: v1
kind: Service
metadata:
  name: enerlova-api
  namespace: apps
spec:
  selector:
    app: enerlova-api
  ports:
    - name: http
      port: 8080
      targetPort: 8080
      nodePort: 32011
      protocol: TCP
  type: NodePort
```
Aplicar y verificar:
```bash
kubectl apply -f enerlova-api-service.yaml
kubectl get svc -n apps enerlova-api
```
Abrir puerto en UFW:
```bash
sudo ufw allow 32011/tcp
sudo ufw reload
```

### 8.4. Frontend React: Deployment y Service

#### 8.4.1. Deployment del frontend

Crea o edita `enerlova-frontend.yaml` en `/home/saturno/k8s/apps`:
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: enerlova-frontend
  namespace: apps
spec:
  replicas: 1
  selector:
    matchLabels:
      app: enerlova-frontend
  template:
    metadata:
      labels:
        app: enerlova-frontend
    spec:
      securityContext: # Necesario para que Nginx pueda abrir el puerto 80 dentro del contenedor
        runAsUser: 0
        runAsGroup: 0
      containers:
        - name: enerlova-frontend
          image: lovalledor/enerlova-frontend:1.0.4
          imagePullPolicy: IfNotPresent
          ports:
            - containerPort: 80
          env:
            - name: NODE_ENV
              value: "production"
            - name: VITE_APP_ENV
              value: "production"
          resources:
            requests:
              cpu: "50m"
              memory: "128Mi"
            limits:
              cpu: "200m"
              memory: "256Mi"
```
Aplicar y verificar:
```bash
kubectl apply -f enerlova-frontend.yaml
kubectl get pods -n apps -l app=enerlova-frontend
```

#### 8.4.2. Service del frontend (NodePort)

Crea o edita `enerlova-frontend-service.yaml` en `/home/saturno/k8s/apps`:
```yaml
apiVersion: v1
kind: Service
metadata:
  name: enerlova-frontend
  namespace: apps
spec:
  selector:
    app: enerlova-frontend
  ports:
    - name: http
      port: 80
      targetPort: 80
      nodePort: 32010
      protocol: TCP
  type: NodePort
```
Aplicar y verificar:
```bash
kubectl apply -f enerlova-frontend-service.yaml
kubectl get svc -n apps enerlova-frontend
```
Abrir puerto en UFW:
```bash
sudo ufw allow 32010/tcp
sudo ufw reload
```

### 8.5. Verificación de la Aplicación y CORS

1.  **Acceso al Frontend:** Abre tu navegador y ve a `http://<IP_DE_TU_SERVIDOR>:32010`.
2.  **Prueba de Login:** Intenta iniciar sesión. El frontend llamará al backend en `http://<IP_DE_TU_SERVIDOR>:32011/Enerlova/login`.
3.  **Verificación de CORS (desde el servidor):**
    ```bash
    curl -i -X OPTIONS "http://192.168.1.139:32011/Enerlova/login" \
      -H "Origin: http://192.168.1.139:32010" \
      -H "Access-Control-Request-Method: POST"
    ```
    > (La respuesta debe incluir cabeceras CORS como `Access-Control-Allow-Origin: http://192.168.1.139:32010`).

---

## Capítulo 9: Limpieza del Clúster y Organización de Namespaces

> Este capítulo se enfoca en limpiar cualquier recurso de prueba restante y establecer una estructura clara de namespaces para tus aplicaciones e infraestructura. Es crucial mantener el clúster ordenado para una gestión eficiente y una observabilidad clara.

### 9.1. Eliminar los deployments y services de prueba

Se eliminan los recursos que se utilizaron únicamente para probar el despliegue de aplicaciones genéricas.

#### 9.2.1. Borrar `demo-nginx` (Deployment y Service)

```bash
kubectl delete deployment demo-nginx -n apps
kubectl delete service demo-nginx -n apps
```

#### 9.2.2. Borrar `curl-test` (Pod)

```bash
kubectl delete pod curl-test -n apps --ignore-not-found
```
> El flag `--ignore-not-found` evita errores si el recurso ya no existe.

### 9.3. Crear un namespace `infra` para recursos de infraestructura

Se crea un nuevo namespace para alojar servicios de infraestructura compartidos, como bases de datos, colas de mensajes o cachés, separándolos de las aplicaciones de negocio.

```bash
kubectl create namespace infra
```

### 9.4. Etiquetar namespaces para organización

Aplicar etiquetas a los namespaces facilita su organización y gestión, permitiendo identificar rápidamente el entorno (`env`) o propietario de las aplicaciones.

```bash
kubectl label namespace apps env=prod app-owner=enerlova
kubectl label namespace infra env=prod
kubectl label namespace monitoring env=prod
```

### 9.5. Verificar el estado final del clúster

Comprueba que el clúster contenga únicamente los recursos esperados y que los namespaces estén correctamente creados y etiquetados.

```bash
# Verificar todos los recursos en el namespace 'apps'
kubectl get all -n apps

# Verificar todos los namespaces y sus etiquetas
kubectl get ns --show-labels
```
> **Estado Esperado:** El namespace `apps` solo debe contener los Deployments, Pods y Services de `enerlova-api` y `enerlova-frontend`. Los namespaces `apps`, `infra` y `monitoring` deben aparecer con sus respectivas etiquetas.

---

## Capítulo 10: Exponer Servicios de Aplicación vía NodePort

> Dada la configuración actual del entorno, se ha optado por exponer las aplicaciones directamente a través de Kubernetes NodePorts. Esto proporciona un acceso directo y permanente utilizando la IP del servidor y un puerto específico para cada servicio.

### 10.1. Repaso de la Configuración de NodePorts de las Aplicaciones

#### 10.1.1. Frontend React (`enerlova-frontend`)

El frontend está configurado como un Service de tipo `NodePort`, accesible en el puerto `32010` del servidor.

*   **Archivo `enerlova-frontend-service.yaml`:**
    ```yaml
    apiVersion: v1
    kind: Service
    metadata:
      name: enerlova-frontend
      namespace: apps
    spec:
      selector:
        app: enerlova-frontend
      ports:
        - name: http
          port: 80
          targetPort: 80
          nodePort: 32010
          protocol: TCP
      type: NodePort
    ```
*   **Acceso en el navegador:** `http://<IP_DE_TU_SERVIDOR>:32010`

#### 10.1.2. Backend .NET (`enerlova-api`)

El backend también está configurado como un Service de tipo `NodePort`, accesible en el puerto `32011`.

*   **Archivo `enerlova-api-service.yaml`:**
    ```yaml
    apiVersion: v1
    kind: Service
    metadata:
      name: enerlova-api
      namespace: apps
    spec:
      selector:
        app: enerlova-api
      ports:
        - name: http
          port: 8080
          targetPort: 8080
          nodePort: 32011
          protocol: TCP
      type: NodePort
    ```
*   **Acceso directo (para pruebas):** `http://<IP_DE_TU_SERVIDOR>:32011/Enerlova/<endpoint>`

### 10.2. Configuración de URLs y CORS

#### 10.2.1. `VITE_API_URL` en el Frontend

La URL del backend se configura durante el *build* del frontend.

*   **Comando `docker build` del Frontend:**
    ```bash
    cd /var/Frontend_Fi_Enerlova_2025
    docker build -t lovalledor/enerlova-frontend:1.0.4 \
      --build-arg VITE_API_URL="http://<IP_DE_TU_SERVIDOR>:32011/Enerlova" \
      --build-arg VITE_APP_ENV=production \
      .
    docker push lovalledor/enerlova-frontend:1.0.4
    ```

#### 10.2.2. CORS en el Backend .NET

El backend debe permitir peticiones desde el origen del frontend (su URL con NodePort).

*   **Fragmento de `Program.cs` del Backend:**
    ```csharp
    // ...
    var allowedOrigins = new[] { "http://<IP_DE_TU_SERVIDOR>:32010" };

    builder.Services.AddCors(options =>
    {
        options.AddPolicy("MiPoliticaCORS", policy =>
        {
            policy.WithOrigins(allowedOrigins)
                  .AllowAnyHeader()
                  .AllowAnyMethod()
                  .AllowCredentials();
        });
    });
    // ... asegurar que app.UseCors("MiPoliticaCORS") esté en el pipeline correcto
    ```

### 10.3. Verificación Final de Acceso

1.  Asegúrate de que los puertos NodePort estén abiertos en el firewall (UFW):
    ```bash
    sudo ufw allow 32010/tcp
    sudo ufw allow 32011/tcp
    sudo ufw reload
    ```
2.  Accede a tu frontend en el navegador: `http://<IP_DE_TU_SERVIDOR>:32010`.
3.  Verifica que el login y las interacciones con la API funcionen correctamente.

---

## Capítulo 11: Tuning de Recursos y Autoescalado (HPA)

> La gestión de recursos (`requests` y `limits`) y el autoescalado (`HorizontalPodAutoscaler` o HPA) son fundamentales para que tus aplicaciones de Kubernetes sean eficientes y estables.

### 11.1. Ajustar Solicitudes (`requests`) y Límites (`limits`) de Recursos

Se han configurado los Deployments para especificar las solicitudes y límites de recursos. Estos valores son ejemplos iniciales y deben ajustarse con el tiempo basándose en el monitoreo del uso real.

*   **Archivo `enerlova-api.yaml` (fragmento):**
    ```yaml
    # ...
          resources:
            requests:
              cpu: "100m"
              memory: "256Mi"
            limits:
              cpu: "500m"
              memory: "512Mi"
    ```
*   **Archivo `enerlova-frontend.yaml` (fragmento):**
    ```yaml
    # ...
          resources:
            requests:
              cpu: "50m"
              memory: "128Mi"
            limits:
              cpu: "200m"
              memory: "256Mi"
    ```
> **Aplicar Cambios:**
> ```bash
> kubectl apply -f enerlova-api.yaml
> kubectl apply -f enerlova-frontend.yaml
> ```

### 11.2. Configurar Autoescalado Horizontal de Pods (HPA) para el Backend

Se ha implementado un HPA para el Deployment del backend, que escalará el número de réplicas si el uso promedio de CPU supera el 70% del `request`.

*   **Archivo `enerlova-api-hpa.yaml`:**
    ```yaml
    apiVersion: autoscaling/v2
    kind: HorizontalPodAutoscaler
    metadata:
      name: enerlova-api-hpa
      namespace: apps
    spec:
      scaleTargetRef:
        apiVersion: apps/v1
        kind: Deployment
        name: enerlova-api
      minReplicas: 1
      maxReplicas: 5
      metrics:
        - type: Resource
          resource:
            name: cpu
            target:
              type: Utilization
              averageUtilization: 70
    ```
*   **Aplicar HPA:**
    ```bash
    kubectl apply -f enerlova-api-hpa.yaml
    ```
*   **Verificar el HPA:**
    ```bash
    kubectl get hpa -n apps
    ```

---

## Capítulo 12: Base de Alertas con Prometheus y Alertmanager

> Este capítulo establece la base para la gestión de alertas en el clúster. Se crean reglas de alerta en Prometheus y se configura Alertmanager para procesarlas.

### 12.1. Definir Reglas de Alerta en Prometheus (`PrometheusRule`)

*   **Archivo `enerlova-alerts.yaml`:**
    ```yaml
    apiVersion: monitoring.coreos.com/v1
    kind: PrometheusRule
    metadata:
      name: enerlova-app-alerts
      namespace: apps
    spec:
      groups:
        - name: enerlova.rules
          rules:
            - alert: EnerlovaApiHighCpuUsage
              expr: sum(rate(container_cpu_usage_seconds_total{namespace="apps",pod=~"enerlova-api-.*"}[5m])) / sum(kube_pod_container_resource_requests{resource="cpu",namespace="apps",pod=~"enerlova-api-.*"}) * 100 > 80
              for: 5m
              labels:
                severity: warning
              annotations:
                summary: "Alta utilización de CPU en pod de Enerlova API ({{ $labels.pod }})"
                description: "El pod {{ $labels.pod }} está usando más del 80% de su CPU request durante 5 minutos."

            - alert: PodRestarting
              expr: rate(kube_pod_container_status_restarts_total{namespace="apps"}[5m]) * 60 > 1
              for: 5m
              labels:
                severity: critical
              annotations:
                summary: "Contenedor reiniciándose ({{ $labels.pod }}/{{ $labels.container }})"
                description: "El contenedor {{ $labels.container }} en el pod {{ $labels.pod }} se está reiniciando."
    ```
*   **Aplicar Reglas:**
    ```bash
    kubectl apply -f enerlova-alerts.yaml
    ```

### 12.2. Configurar Alertmanager (`AlertmanagerConfig`)

#### 12.2.1. Crear un Secret para la contraseña SMTP

```bash
kubectl create secret generic enerlova-smtp-pass \
  --from-literal=password='TU_PASSWORD_SMTP' \
  -n monitoring
```

#### 12.2.2. Definir la Configuración de Alertmanager

*   **Archivo `enerlova-alertmanager-config.yaml`:**
    ```yaml
    apiVersion: monitoring.coreos.com/v1alpha1
    kind: AlertmanagerConfig
    metadata:
      name: enerlova-app-amconfig
      namespace: monitoring
    spec:
      route:
        groupBy: ['job', 'alertname']
        groupWait: 30s
        groupInterval: 5m
        repeatInterval: 1h
        receiver: default-receiver
        routes:
          - receiver: enerlova-email-receiver
            matchers:
            - name: namespace
              value: apps
              matchType: "="
            continue: true

      receivers:
        - name: default-receiver
        - name: enerlova-email-receiver
          emailConfigs:
            - to: "tu_email_de_destino@example.com"
              from: "tu_email_de_origen@example.com"
              smarthost: "smtp.yourprovider.com:587"
              authUsername: "tu_usuario_smtp"
              authPassword:
                name: enerlova-smtp-pass
                key: password
              requireTLS: true
    ```
*   **Aplicar Configuración:**
    ```bash
    kubectl apply -f enerlova-alertmanager-config.yaml
    ```

### 12.3. Verificar Alertas

*   **UI de Prometheus:** `http://<IP_DE_TU_SERVIDOR>:32001` (pestaña "Alerts").
*   **UI de Alertmanager:** Accede con `kubectl port-forward --address 0.0.0.0 svc/prometheus-stack-kube-prom-alertmanager -n monitoring 9093:9093` y navega a `http://<IP_DE_TU_SERVIDOR>:9093`.