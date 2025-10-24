# Guía de Debugging: Edición de Contratos

## 🔧 Sistema de Debug Implementado

Se ha implementado un sistema completo de debugging con console.log en el componente de edición de contratos para identificar errores y problemas durante el proceso.

## 📊 Puntos de Debug

### 1. **Inicialización del Componente** 🔧

Al cargar el componente, verás:

```
🔧 [DEBUG INIT] EditarContratoComponent montado
📦 [DEBUG INIT] Contrato recibido: {objeto completo}
👥 [DEBUG INIT] Propietarios disponibles: {cantidad}
🏢 [DEBUG INIT] Locales disponibles: {cantidad}
🗺️ [DEBUG INIT] Comunas disponibles: {cantidad}
🔗 [DEBUG INIT] Madres disponibles: {cantidad}
👤 [DEBUG INIT] Clientes disponibles: {cantidad}
```

**Qué verificar:**

- ✅ El objeto `contrato` tiene todos los campos esperados
- ✅ Las listas de propietarios, locales, comunas, etc. no están vacías
- ❌ Si alguna lista está vacía, puede causar problemas al buscar RUTs

### 2. **Mapeo de Datos** 🗺️

Cuando los datos del contrato se convierten al formato del formulario:

```
🗺️ [DEBUG MAP] Mapeando contrato a FormData
📥 [DEBUG MAP] Datos de entrada: {datos del contrato}
📅 [DEBUG MAP] fechaInicio original: "valor original"
📅 [DEBUG MAP] fechaInicio convertida: "YYYY-MM-DD"
📅 [DEBUG MAP] fechaTermino original: "valor original"
📅 [DEBUG MAP] fechaTermino convertida: "YYYY-MM-DD"
📤 [DEBUG MAP] Datos mapeados: {formData completo}
```

**Qué verificar:**

- ✅ Las fechas se convierten correctamente al formato `YYYY-MM-DD`
- ✅ Todos los campos tienen valores (excepto fechaTermino que puede ser vacío)
- ❌ Si `fechaInicio` convertida está vacía, hay un problema con el formato de fecha del backend

### 3. **Búsqueda de RUTs** 🔍

Al hacer submit, se buscan los RUTs del propietario y cliente:

```
🔍 [DEBUG RUT] Buscando propietario por nombre: "Nombre del Propietario"
🔍 [DEBUG RUT] Propietarios disponibles: [{nombre, rut}, ...]
✅ [DEBUG RUT] Propietario RUT resultado: "12345678-9"

🔍 [DEBUG RUT] Buscando cliente por nombre: "Nombre del Cliente"
🔍 [DEBUG RUT] Clientes disponibles: [{nombre, rut}, ...]
✅ [DEBUG RUT] Cliente encontrado en lista de clientes: "98765432-1"
```

**Qué verificar:**

- ✅ El nombre del propietario/cliente coincide exactamente con alguno de la lista
- ❌ Si retorna el nombre en vez del RUT, significa que no se encontró match
- ⚠️ **IMPORTANTE**: Los nombres deben coincidir EXACTAMENTE (con espacios, mayúsculas, etc.)

### 4. **Proceso de Submit** 🚀

Al enviar el formulario:

```
🚀 [DEBUG] Iniciando handleSubmit
📋 [DEBUG] FormData actual: {todos los campos del formulario}
✅ [DEBUG] Todas las validaciones pasaron
🔗 [DEBUG] URL Path: "/dashboard/administracion/contratos/editar/123"
🆔 [DEBUG] Contrato ID de URL: "123"
👤 [DEBUG] Propietario RUT: "12345678-9"
👥 [DEBUG] Cliente RUT: "98765432-1"
📤 [DEBUG] Datos a enviar al backend: {objeto JSON formateado}
📥 [DEBUG] Respuesta del backend: {respuesta}
✅ [DEBUG] Contrato actualizado exitosamente
🏁 [DEBUG] handleSubmit finalizado
```

**Si hay error:**

```
❌ [DEBUG] Error capturado en catch: {objeto de error}
❌ [DEBUG] Error stack: {stack trace}
❌ [DEBUG] Error response: {respuesta HTTP}
❌ [DEBUG] Error data: {datos del error del backend}
```

## 🐛 Cómo Usar el Debug

### Paso 1: Abrir la Consola del Navegador

1. **Chrome/Edge**: `F12` o `Ctrl+Shift+I`
2. **Firefox**: `F12` o `Ctrl+Shift+K`
3. Ve a la pestaña **Console**

### Paso 2: Reproducir el Error

1. Navega a editar un contrato
2. Observa los logs iniciales de carga
3. Llena el formulario (o déjalo como está)
4. Haz clic en "Actualizar Contrato"
5. Observa los logs del proceso de submit

### Paso 3: Identificar el Problema

Busca estos indicadores de error:

#### ❌ Error: Validación falló

```
❌ [DEBUG] Validación falló: fechaInicio vacía
```

**Solución**: La fecha de inicio no se cargó correctamente. Revisa los logs de `[DEBUG MAP]`.

#### ❌ Error: RUT no encontrado

```
✅ [DEBUG RUT] Propietario RUT resultado: "Nombre Completo"
```

**Solución**: El nombre del propietario no coincide con ninguno en la lista. Problema de datos.

#### ❌ Error del Backend

```
❌ [DEBUG] Error response: {status: 400, data: {mensaje: "..."}}
```

**Solución**: El backend rechazó los datos. Lee el mensaje de error en `response.data.mensaje`.

#### ❌ Error de Red

```
❌ [DEBUG] Error capturado en catch: Network Error
```

**Solución**: Problema de conexión o el backend no está disponible.

## 📋 Checklist de Verificación

Cuando encuentres un error, verifica en orden:

### ✅ Paso 1: Inicialización

- [ ] El contrato se cargó correctamente
- [ ] Todas las listas (propietarios, clientes, etc.) tienen datos
- [ ] No hay errores en los logs de `[DEBUG INIT]`

### ✅ Paso 2: Mapeo de Datos

- [ ] Las fechas se convirtieron correctamente
- [ ] `fechaInicio` no está vacía
- [ ] Todos los campos del formData tienen valores válidos
- [ ] No hay errores en los logs de `[DEBUG MAP]`

### ✅ Paso 3: Validaciones

- [ ] Todas las validaciones pasaron
- [ ] No hay mensajes de `❌ [DEBUG] Validación falló`

### ✅ Paso 4: Búsqueda de RUTs

- [ ] El propietario RUT es un RUT válido (formato XX.XXX.XXX-X)
- [ ] El cliente RUT es un RUT válido
- [ ] No se están retornando nombres en vez de RUTs

### ✅ Paso 5: Datos a Enviar

- [ ] El objeto `submitData` tiene todos los campos necesarios
- [ ] Los valores tienen el tipo correcto (números como números, strings como strings)
- [ ] El `codigo` del contrato es correcto

### ✅ Paso 6: Respuesta del Backend

- [ ] No hay error HTTP (200 OK)
- [ ] La respuesta no contiene `result.error`
- [ ] Se muestra el mensaje de éxito

## 🔍 Errores Comunes y Soluciones

### Error 1: Fecha de Inicio Vacía

**Síntoma:**

```
❌ [DEBUG] Validación falló: fechaInicio vacía
```

**Diagnóstico:**

```
📅 [DEBUG MAP] fechaInicio original: null
📅 [DEBUG MAP] fechaInicio convertida: ""
```

**Solución**: El contrato en el backend no tiene `fechaInicio`. Verificar la base de datos.

---

### Error 2: RUT Retorna Nombre

**Síntoma:**

```
✅ [DEBUG RUT] Propietario RUT resultado: "Juan Pérez González"
```

**Diagnóstico:**

```
🔍 [DEBUG RUT] Propietarios disponibles: [
  {nombre: "JUAN PEREZ GONZALEZ", rut: "12345678-9"},
  ...
]
```

**Problema**: El nombre en el contrato es "Juan Pérez González" pero en la lista de propietarios está como "JUAN PEREZ GONZALEZ" (mayúsculas).

**Solución**:

1. Normalizar nombres en el backend
2. O modificar la búsqueda para ser case-insensitive:

```typescript
p =>
  p.nombre.trim().toLowerCase() ===
  formData.nombrePropietario.trim().toLowerCase();
```

---

### Error 3: Error 400 del Backend

**Síntoma:**

```
❌ [DEBUG] Error response: {status: 400, data: {mensaje: "Campo requerido: tarifa"}}
```

**Diagnóstico:**

```
📤 [DEBUG] Datos a enviar al backend: {
  ...
  tarifa: 0,  // ❌ Backend espera un ID válido
  ...
}
```

**Problema**: El campo `tarifa` se convirtió a `0` por el `parseInt(formData.tarifa) || 0`.

**Solución**: Verificar que `formData.tarifa` tiene un valor válido antes del parseInt.

---

### Error 4: Fecha en Formato Incorrecto

**Síntoma:**

```
❌ [DEBUG] Error data: {mensaje: "Formato de fecha inválido"}
```

**Diagnóstico:**

```
📤 [DEBUG] Datos a enviar al backend: {
  fechaInicio: "24/10/2024",  // ❌ Backend espera YYYY-MM-DD
  ...
}
```

**Problema**: La función `convertirFechaParaInput` no convirtió la fecha correctamente.

**Solución**: Verificar la implementación de `convertirFechaParaInput` y el formato de fecha del backend.

## 📝 Formato de Datos Esperado por el Backend

```typescript
{
  codigo: string,              // ID del contrato
  tipoContrato: number,        // ID del tipo (no 0)
  tarifa: number,              // ID de la tarifa (no 0)
  propietario: string,         // RUT formato XX.XXX.XXX-X
  cliente: string,             // RUT formato XX.XXX.XXX-X
  localId: string,             // ID del local
  fechaInicio: string,         // Formato YYYY-MM-DD
  activo: boolean,             // true/false
  fechaTermino: string,        // Formato YYYY-MM-DD o vacío ""
  direccion: string,           // Dirección completa
  comuna: string,              // Código de comuna
  limite: number,              // Límite de invierno
  ciclo: number,               // Siempre 1
  potencia: string,            // Potencia contratada
  madre: string,               // Código contrato madre o ""
  lugar: string,               // ID del local (igual que localId)
  sinCorte: number             // 1 o 0
}
```

## 🎯 Próximos Pasos Después de Identificar el Error

1. **Copiar los logs relevantes** de la consola
2. **Identificar en qué paso falló** (Inicialización, Mapeo, RUTs, Submit, Backend)
3. **Verificar los datos de entrada** contra los datos esperados
4. **Si es problema de backend**: Compartir los logs con el equipo de backend
5. **Si es problema de frontend**: Corregir la lógica en el componente

## 🧹 Remover el Debug en Producción

Una vez solucionado el problema, puedes:

1. **Comentar los console.log**:

```typescript
// console.log('🚀 [DEBUG] Iniciando handleSubmit');
```

2. **O eliminarlos completamente**

3. **O usar un flag de desarrollo**:

```typescript
const DEBUG = import.meta.env.DEV;
if (DEBUG) console.log('🚀 [DEBUG] Iniciando handleSubmit');
```

---

**Fecha de Implementación:** Octubre 2025  
**Responsable:** Equipo de Desarrollo Enerlova  
**Estado:** 🔍 Debug Activo - Listo para identificar errores
