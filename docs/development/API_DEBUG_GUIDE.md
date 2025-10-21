# Guía de Debugging de APIs

## 🎯 Objetivo

Sistema de debugging para APIs que permite:
- Ver requests/responses en consola
- Validar datos contra plantillas esperadas
- Detectar errores de integración con backend
- Facilitar la comunicación con el equipo de backend

---

## 📋 Plantillas de Datos

### **Permiso Rol-Menú**
```json
{
  "idRol": 1,
  "idMenu": 2,
  "puedeVer": true,
  "puedeCrear": true,
  "puedeEditar": true,
  "puedeEliminar": true,
  "fechaAsignacion": "2025-10-21T14:26:55.731Z"
}
```

### **Rol**
```json
{
  "idRol": 1,
  "nombreRol": "Administrador",
  "descripcion": "Rol con todos los permisos",
  "estadoRol": true
}
```

### **Menú**
```json
{
  "idMenu": 1,
  "nombreMenu": "Dashboard",
  "ruta": "/dashboard",
  "orden": 1,
  "icono": "home",
  "esVisible": true
}
```

---

## 🔍 Cómo Funciona

### **En Desarrollo (NODE_ENV=development)**

Cuando ejecutas la aplicación en modo desarrollo, verás en la consola:

#### **Request (antes de enviar)**
```
🔍 API Debug: POST AsignarPermisos
⏰ Timestamp: 2025-10-21T14:26:55.731Z
📤 Request Payload:
{
  "idRol": 1,
  "idMenu": 2,
  "puedeVer": true,
  "puedeCrear": true,
  "puedeEditar": true,
  "puedeEliminar": true,
  "fechaAsignacion": "2025-10-21T14:26:55.731Z"
}
📋 Expected Template:
{
  "idRol": 0,
  "idMenu": 0,
  "puedeVer": true,
  "puedeCrear": true,
  "puedeEditar": true,
  "puedeEliminar": true,
  "fechaAsignacion": "2025-01-01T00:00:00"
}
✅ Payload matches template
```

#### **Response (después de recibir)**
```
🔍 API Debug: POST AsignarPermisos
📥 Response:
{
  "status": 204,
  "message": "Success - No Content"
}
```

#### **Error (si falla)**
```
❌ API Error: AsignarPermisos
Error: Request failed with status code 400
Response Status: 400
Response Data: {
  "title": "Bad Request",
  "message": "idRol is required"
}
Context: {
  "permisoData": {
    "idRol": null,
    "idMenu": 2,
    ...
  }
}
```

---

## 🚨 Detección de Problemas

### **Campos Faltantes**
```
⚠️ Response does NOT match template:
Missing fields: ["fechaAsignacion"]
```

### **Campos Extra**
```
⚠️ Response does NOT match template:
Extra fields: ["idUsuario"]  ← Backend envía campo no esperado
```

### **Tipos Incorrectos**
```
⚠️ Response does NOT match template:
Type mismatches: [
  {
    "field": "idRol",
    "expected": "number",
    "actual": "string"  ← Backend envía string en vez de number
  }
]
```

---

## 📊 Endpoints Monitoreados

### **1. GET /ListarMenu/{idRol}**
**Descripción:** Lista todos los menús y permisos de un rol

**Request:**
```json
{
  "idRol": 1
}
```

**Response Esperada:**
```json
[
  {
    "idRol": 1,
    "idMenu": 1,
    "puedeVer": true,
    "puedeCrear": true,
    "puedeEditar": true,
    "puedeEliminar": true,
    "fechaAsignacion": "2025-07-23T12:54:07"
  },
  {
    "idRol": 1,
    "idMenu": 2,
    "puedeVer": true,
    "puedeCrear": true,
    "puedeEditar": true,
    "puedeEliminar": true,
    "fechaAsignacion": "2025-07-23T12:54:07"
  }
]
```

---

### **2. POST /AsignarPermisos**
**Descripción:** Asigna o actualiza permisos de un rol en un menú

**Request:**
```json
{
  "idRol": 1,
  "idMenu": 2,
  "puedeVer": true,
  "puedeCrear": true,
  "puedeEditar": true,
  "puedeEliminar": true,
  "fechaAsignacion": "2025-10-21T14:26:55.731Z"
}
```

**Response Esperada:**
```
Status: 204 No Content
```

---

## 🛠️ Cómo Usar

### **Para Desarrolladores Frontend**

1. **Abre la consola del navegador** (F12)
2. **Realiza la acción** (ej: asignar permiso)
3. **Revisa los logs** con el ícono 🔍
4. **Verifica que el payload sea correcto**
5. **Si hay error, copia el log completo** para reportar

### **Para Reportar Bugs al Backend**

Cuando encuentres un error, copia el log completo:

```
🔍 API Debug: POST AsignarPermisos
⏰ Timestamp: 2025-10-21T14:26:55.731Z
📤 Request Payload:
{
  "idRol": 6,  ← Este es el problema
  "idMenu": 2,
  ...
}

❌ API Error: AsignarPermisos
Response Status: 400
Response Data: {
  "title": "Bad Request",
  "message": "idRol 6 no existe"
}
```

Y envía al equipo de backend:
- ✅ Timestamp
- ✅ Endpoint
- ✅ Payload enviado
- ✅ Error recibido
- ✅ Contexto adicional

---

## 🎨 Colores en Consola

- 🔵 **Azul** - Título del debug
- 🟢 **Verde** - Request payload
- 🟣 **Morado** - Response
- 🟠 **Naranja** - Template esperada
- ✅ **Verde** - Validación exitosa
- ⚠️ **Amarillo** - Advertencia
- ❌ **Rojo** - Error

---

## 📝 Agregar Debugging a Nuevos Endpoints

```typescript
import { API_TEMPLATES, debugApi, logApiError } from '~/utils/api-debug';

async miNuevoEndpoint(data: any) {
  const endpoint = 'MiEndpoint';
  
  try {
    // Log del request
    debugApi({
      endpoint,
      method: 'POST',
      payload: data,
      expectedTemplate: API_TEMPLATES.miTemplate
    });
    
    const response = await api.post(endpoint, data);
    
    // Log del response
    debugApi({
      endpoint,
      method: 'POST',
      response: response.data,
      expectedTemplate: API_TEMPLATES.miTemplate
    });
    
    return response.data;
  } catch (error) {
    // Log del error
    logApiError(endpoint, error, { data });
    throw error;
  }
}
```

---

## ⚙️ Configuración

El debugging **solo funciona en desarrollo** (`NODE_ENV=development`).

En producción, todos los logs están deshabilitados automáticamente.

---

**Fecha:** 21 de Octubre, 2025  
**Versión:** 1.0  
**Estado:** ✅ Activo en desarrollo
