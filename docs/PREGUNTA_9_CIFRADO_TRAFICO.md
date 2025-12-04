# 🔒 Pregunta 9: ¿Todo el tráfico interno/externo va cifrado (HTTPS, TLS 1.2/1.3)?

**Fecha de análisis**: 4 de Diciembre 2025  
**Versión del análisis**: 1.0  
**Estado**: Análisis de código sin cambios - Solo documentación

---

## 📌 Resumen Ejecutivo

El proyecto **ENERLOVA Frontend** actualmente **NO utiliza HTTPS/TLS de forma completa**. El tráfico está principalmente en **HTTP sin cifrar**, aunque existen headers de seguridad configurados en Nginx. Se requieren mejoras significativas para garantizar cifrado end-to-end.

| Aspecto | Estado | Riesgo |
|--------|--------|--------|
| Frontend → Nginx | ❌ HTTP (sin cifrar) | 🔴 CRÍTICO |
| Nginx → Backend | ❌ HTTP (sin cifrar) | 🔴 CRÍTICO |
| HTTPS en Frontend | ❌ No configurado | 🔴 CRÍTICO |
| TLS Version | ❌ No especificada | 🔴 CRÍTICO |
| Headers de Seguridad | ✅ Configurados | 🟢 OK |
| HSTS | ✅ Configurado (pero sin efecto en HTTP) | ⚠️ PARCIAL |

---

## 🔍 Análisis Detallado

### 1. **Estado Actual del Cifrado**

#### 1.1 Frontend Container
```dockerfile
# Dockerfile (Producción)
FROM nginx:alpine

EXPOSE 80  # ❌ SOLO HTTP

# Usuario no-root
USER nginx

CMD ["nginx", "-g", "daemon off;"]
```

**Hallazgo**: 
- ❌ Expone **solo puerto 80 (HTTP)**
- ❌ No hay soporte HTTPS
- ❌ No hay certificado SSL/TLS

#### 1.2 Docker Compose - Producción
```yaml
frontend-prod:
  ports:
    - "8080:80"  # ❌ Mapeo HTTP único
  container_name: enerlova-frontend-prod
```

**Hallazgo**:
- ❌ Container mapea puerto **80 únicamente**
- ❌ No hay puerto **443 (HTTPS)**
- ❌ Sin configuración de certificados

#### 1.3 Docker Compose - Desarrollo
```yaml
frontend-dev:
  ports:
    - "${DEV_PORT:-4200}:80"  # ❌ HTTP únicamente
```

**Hallazgo**:
- ❌ También solo HTTP
- ⚠️ Esperado para desarrollo pero inconsistente con producción

---

### 2. **Configuración de Nginx**

#### 2.1 Nginx Producción (nginx.conf)
```nginx
server {
    listen 80;  # ❌ SOLO HTTP
    server_name localhost;
    root /usr/share/nginx/html;
    
    # Headers de seguridad (parcialmente efectivos)
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
    # ❌ HSTS no tiene efecto en HTTP
    # ⚠️ Solo funciona si hay HTTPS configurado
}
```

**Problemas**:
- ❌ Escucha **solo en puerto 80**
- ❌ Sin bloque `ssl_` configurado
- ❌ Sin certificados SSL/TLS
- ⚠️ HSTS header presente pero **inútil sin HTTPS**

#### 2.2 Nginx Desarrollo (nginx.dev.conf)
```nginx
server {
    listen 80;  # ❌ SOLO HTTP
    server_name localhost;
    root /usr/share/nginx/html;
    
    # Headers de seguridad (igual que producción)
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
}
```

**Hallazgo**: Mismo escenario que producción

---

### 3. **Comunicación Frontend → Backend**

#### 3.1 Configuración de Axios
```typescript
// app/services/axiosConfig.ts
const API_URL = import.meta.env.VITE_API_URL;

const AXIOS_CONFIG: AxiosConfig = {
  baseURL: API_URL,  // ❌ Desde variable de entorno (sin protocolo especificado)
  withCredentials: true,
  timeout: REQUEST_TIMEOUT_MS
};
```

#### 3.2 Variables de Entorno
```dotenv
# .env.example
VITE_API_URL=http://localhost:8081/Enerlova
# ❌ EXPLÍCITAMENTE HTTP
```

```yaml
# docker-compose.prod.yml
VITE_API_URL: http://192.168.1.139:8081/Enerlova
# ❌ EXPLÍCITAMENTE HTTP
```

**Hallazgos**:
- ❌ Base URL configurada con **http://** (sin cifrar)
- ❌ IP interna **192.168.1.139** expuesta
- ❌ Sin redireccionamiento a HTTPS
- ❌ Sin validación de certificados

---

### 4. **Headers de Seguridad Implementados**

Aunque no hay HTTPS, el proyecto implementa algunos headers que **solo son efectivos con HTTPS**:

```nginx
# Headers presentes pero parcialmente efectivos
add_header Content-Security-Policy "...";
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-Frame-Options "DENY" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
add_header Permissions-Policy "geolocation=(), microphone=(), camera=()" always;
```

**Evaluación**:
- ✅ Headers correctamente sintácticos
- ⚠️ HSTS solo funciona con HTTPS
- ⚠️ CSP solo efectiva contra ataques HTTPS
- ✅ X-Frame-Options, X-Content-Type-Options funcionan en HTTP

---

### 5. **Flujo de Comunicación Sin Cifrado**

```
┌─────────────────┐
│   Navegador     │
│  (Usuario)      │
└────────┬────────┘
         │
         │ ❌ HTTP (sin cifrar)
         │ Puerto 80
         ▼
┌─────────────────────┐
│   Nginx Container   │
│  (Frontend)         │
│  EXPOSE 80          │
└────────┬────────────┘
         │
         │ ❌ HTTP (sin cifrar)
         │ Tráfico interno
         ▼
┌──────────────────────────────┐
│   Backend API                │
│  192.168.1.139:8081/Enerlova │
│  ❌ HTTP (sin cifrar)        │
└──────────────────────────────┘
```

**Vulnerabilidades**:
- 🔴 **Man-in-the-Middle (MITM)**: Cualquiera en la red puede interceptar
- 🔴 **Token JWT expuesto**: El JWT viaja sin cifrar
- 🔴 **Credenciales visibles**: Login/password sin protección
- 🔴 **Datos sensibles**: Información de facturación expuesta
- 🔴 **DNS spoofing**: Sin validación HTTPS

---

### 6. **Análisis de Variables de Entorno**

```typescript
// vite.config.ts
const AXIOS_CONFIG: AxiosConfig = {
  baseURL: API_URL,  // Desde import.meta.env.VITE_API_URL
  withCredentials: true,
  timeout: REQUEST_TIMEOUT_MS
};
```

**Variables configuradas en diferentes escenarios**:

| Escenario | URL | Protocolo |
|-----------|-----|-----------|
| `.env.example` | `http://localhost:8081/Enerlova` | HTTP ❌ |
| `docker-compose.prod.yml` | `http://192.168.1.139:8081/Enerlova` | HTTP ❌ |
| `docker-compose.dev.yml` | `${VITE_API_URL:-http://192.168.1.139:8082/Enerlova}` | HTTP ❌ |

**Todos usan HTTP sin cifrar**

---

### 7. **Análisis de Certificados SSL/TLS**

#### 7.1 ¿Existen certificados en el proyecto?
```bash
# Búsqueda de certificados
find . -name "*.pem" -o -name "*.crt" -o -name "*.key" -o -name "*.cert"
# Resultado: ❌ No encontrados
```

#### 7.2 ¿Configuración SSL/TLS en nginx?
```nginx
# nginx.conf - Búsqueda de ssl_
# Resultado: ❌ No existe configuración SSL/TLS
```

#### 7.3 ¿Manejo de certificados en Docker?
```dockerfile
# Dockerfile - Búsqueda de certificados
# Resultado: ❌ No hay copia ni instalación de certificados
```

**Conclusión**: ❌ **No hay infraestructura SSL/TLS configurada**

---

### 8. **Análisis de Interceptores Axios**

```typescript
// axiosConfig.ts - Request Interceptor
axiosInstance.interceptors.request.use(
  config => {
    const token = getStoredToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;  // ❌ Enviado en HTTP
    }
    return config;
  }
);
```

**Vulnerabilidad**: 
- 🔴 Token JWT se envía en header `Authorization` via HTTP sin cifrar
- 🔴 No hay validación de certificado del servidor
- 🔴 No hay pinning de certificados

---

### 9. **TLS Version Requerida vs. Actual**

#### Requerimiento de Seguridad
```
TLS 1.2 o superior (TLS 1.3 preferido)
```

#### Realidad del Proyecto
```
❌ No hay TLS en absoluto
HTTP sin cifrar es el único protocolo disponible
```

---

### 10. **Matriz de Riesgos de Seguridad**

| Riesgo | Probabilidad | Impacto | Mitigación Actual |
|--------|-------------|--------|------------------|
| **MITM - Intercepción de JWT** | 🔴 ALTA | 🔴 CRÍTICO | ❌ Ninguna |
| **MITM - Robo de credenciales** | 🔴 ALTA | 🔴 CRÍTICO | ❌ Ninguna |
| **DNS Spoofing** | 🟠 MEDIA | 🔴 CRÍTICO | ❌ Ninguna |
| **Inyección de contenido** | 🔴 ALTA | 🟠 ALTO | ✅ CSP headers |
| **Session fixation** | 🟠 MEDIA | 🟠 ALTO | ⚠️ Parcial |
| **Datos expuestos en tránsito** | 🔴 ALTA | 🔴 CRÍTICO | ❌ Ninguna |

---

## 📊 Comparativa: Actual vs. Requerimiento de Seguridad

```
REQUISITO: ¿Todo el tráfico interno/externo va cifrado (HTTPS, TLS 1.2/1.3)?

┌──────────────────────────────────────────────────────┐
│ RESPUESTA: NO                                         │
│                                                       │
│ ❌ Frontend: HTTP sin cifrar (puerto 80)             │
│ ❌ Backend: HTTP sin cifrar (puerto 8081)            │
│ ❌ HTTPS: No configurado                             │
│ ❌ TLS: No disponible                                │
│ ❌ Certificados: No existen                          │
│ ⚠️ Headers: Configurados (pero sin efecto en HTTP)  │
└──────────────────────────────────────────────────────┘
```

---

## 🔍 Validación de Cada Componente

### 1. **Navegador → Nginx (Frontend)**
```
Protocolo: HTTP ❌
Puerto: 80 ❌
Cifrado: No ❌
Certificado: N/A ❌
TLS Version: N/A ❌
Validación: No ❌
Estado: 🔴 INSEGURO
```

### 2. **Nginx → Backend**
```
Protocolo: HTTP ❌
Puerto: 8081 ❌
Cifrado: No ❌
Certificado: N/A ❌
TLS Version: N/A ❌
Validación: No ❌
Estado: 🔴 INSEGURO
```

### 3. **Headers de Seguridad HTTP**
```
Strict-Transport-Security: Presente ✅ pero inútil sin HTTPS
X-Content-Type-Options: Presente ✅ funciona en HTTP
X-Frame-Options: Presente ✅ funciona en HTTP
Content-Security-Policy: Presente ✅ pero limitado sin HTTPS
X-XSS-Protection: Presente ✅ funciona en HTTP
```

---

## 🛡️ Implicaciones de Seguridad Críticas

### 1. **Datos en Tránsito Desprotegidos**
```
Información sensible que viaja sin cifrar:
- JWT tokens (acceso de usuario)
- Credenciales de login (usuario/contraseña)
- Datos de facturación
- Información de clientes y medidores
- Datos financieros
```

### 2. **Vulnerabilidad en Red Interna**
```
Aunque está "protegida" por IP privada:
- Cualquiera dentro de la red LAN puede interceptar
- No hay cifrado end-to-end
- Posible comprometer toda la seguridad del sistema
```

### 3. **Ataques Potenciales**
```
MITM (Man-in-the-Middle):
- Interceptar JWT → Acceso no autorizado
- Modificar datos en tránsito → Integridad comprometida
- Inyectar código malicioso → Compromiso del sistema

Session Hijacking:
- Robar token JWT → Suplantar usuario
- Cambiar credenciales → Denegar acceso

DNS Spoofing:
- Redirigir a servidor falso → Robo de datos
```

---

## 📋 Checklist Actual vs. Estándar de Seguridad

| Requisito | Presente | Correcto | Cantidad |
|-----------|----------|----------|----------|
| HTTPS en Frontend | ❌ | ❌ | 0/1 |
| HTTPS en Backend | ❌ | ❌ | 0/1 |
| TLS 1.2+ | ❌ | ❌ | 0/1 |
| Certificados válidos | ❌ | ❌ | 0/2 |
| HSTS Header | ✅ | ❌ | 1/1 (inútil) |
| Redirects a HTTPS | ❌ | ❌ | 0/1 |
| Verificación de certificados | ❌ | ❌ | 0/1 |
| Certificate Pinning | ❌ | ❌ | 0/1 |

---

## 🔐 Contexto de la Configuración Actual

### Por qué está así (Probable)
```
1. Proyecto en desarrollo inicial
2. Ambiente local/intranet (IP 192.168.1.139)
3. No hay requisitos de seguridad HTTPS en fase actual
4. Foco en funcionalidad, no en hardening
5. Backend no tiene HTTPS configurado tampoco
```

### Consideraciones Importantes
```
⚠️ Aunque sea desarrollo local, las mejores prácticas
   recomiendan HTTPS incluso en desarrollo

⚠️ Si esto llega a producción/exposición pública,
   es una vulnerabilidad crítica

⚠️ Datos financieros/energéticos requieren protección
   según regulaciones (GDPR, etc.)
```

---

## 📝 Conclusión del Análisis

### Respuesta Directa a la Pregunta

**¿Todo el tráfico interno/externo va cifrado (HTTPS, TLS 1.2/1.3)?**

### 🔴 **NO**

```
Tráfico Frontend:     ❌ HTTP sin cifrar
Tráfico Backend:      ❌ HTTP sin cifrar
HTTPS:                ❌ No configurado
TLS Version:          ❌ N/A
Certificados:         ❌ No existen
Validación SSL:       ❌ No existe
Status: CRÍTICO - Requiere implementación inmediata
```

---

## 🚨 Recomendaciones de Seguridad (No implementadas, solo documentadas)

### Inmediatas (Producción)
1. ✅ Implementar HTTPS con certificados válidos
2. ✅ Configurar TLS 1.2+ en Nginx
3. ✅ Redirigir HTTP → HTTPS
4. ✅ Habilitar HSTS header
5. ✅ Validar certificados en cliente

### Corto Plazo
1. ⏳ Certificate pinning en Axios
2. ⏳ Renovación automática de certificados
3. ⏳ Monitoreo de certificados expirados

### Evidencia de Configuración Actual
```typescript
// ❌ Sin opciones de HTTPS en Axios
const AXIOS_CONFIG: AxiosConfig = {
  baseURL: API_URL,           // http://...
  withCredentials: true,
  timeout: REQUEST_TIMEOUT_MS
  // ❌ Sin httpsAgent, rejectUnauthorized, etc.
};
```

---

**Documento de Análisis**: Pregunta 9  
**Fecha**: 4 Diciembre 2025  
**Clasificación**: ANÁLISIS SOLO - No se implementó ningún cambio  
**Estado de Seguridad**: 🔴 CRÍTICO
