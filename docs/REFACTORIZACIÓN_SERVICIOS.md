# 🔧 Refactorización de Servicios - Guía de Implementación

## 📋 Resumen de Cambios

Se ha refactorizado la carpeta `/app/services` aplicando principios SOLID, mejorando:

- **Type Safety**: Tipos estrictos en TypeScript
- **Error Handling**: Manejo robusto de errores
- **Code Organization**: Mejor estructura y separación de responsabilidades
- **Reusability**: Funciones pequeñas y reutilizables
- **Maintainability**: Código más legible y fácil de mantener

## 🏗️ Estructura Nueva

```
app/services/
├── core/                          # Módulo base y utilidades
│   ├── api-response.ts           # Tipos y constructores de respuestas
│   ├── api-processing.ts         # Procesamiento normalizado de API
│   ├── base-service.ts           # Clase base para todos los servicios
│   └── index.ts                  # Exportaciones
├── administration/               # Servicios de administración
│   ├── types.ts                  # Tipos específicos
│   └── [nuevos servicios especializados]
├── axiosConfig.ts               # ✅ REFACTORIZADO
├── authService.ts               # ✅ REFACTORIZADO
├── [otros servicios]            # ⏳ Por refactorizar
└── index.ts                     # Exportaciones principales
```

## ✨ Mejoras Principales

### 1. **axiosConfig.ts** - Refactorizado

- ✅ Tipos bien definidos para configuración
- ✅ Funciones pequeñas y responsables
- ✅ Early returns para reducir nesting
- ✅ Mejor manejo de errores con función centralizada
- ✅ Constantes organizadas y documentadas

**Antes:**

```typescript
// Código anidado y mixto
axiosInstance.interceptors.response.use(
  response => response,
  async error => {
    // ... 80+ líneas de lógica anidada
  }
);
```

**Después:**

```typescript
// Funciones separadas, responsables y testables
async function handleUnauthorizedError(error, originalRequest) { ... }
function handleNetworkError() { ... }
function isExpectedError(requestUrl, statusCode) { ... }

axiosInstance.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => handleErrorResponse(error)
);
```

### 2. **authService.ts** - Refactorizado

- ✅ Clase estructurada (antes era object anónimo)
- ✅ Clase personalizada `AuthenticationError` para errores específicos
- ✅ Funciones privadas para lógica común
- ✅ Métodos con nombres descriptivos
- ✅ Validación de respuestas con type guards
- ✅ Mejor documentación

**Antes:**

```typescript
export const authService = {
  login: async (credentials) => { ... },
  logout: async () => { ... },
  // Métodos duplicados, sin estructura clara
};
```

**Después:**

```typescript
class AuthService {
  async login(credentials: LoginCredentials): Promise<string> { ... }
  async logout(): Promise<void> { ... }
  private validateTokenResponse(response): asserts response is... { ... }
}

export const authService = new AuthService();
```

### 3. **Core Module** - Nuevo

Proporciona abstracciones reutilizables para todos los servicios:

- **api-response.ts**: Tipos de respuestas `ServiceResponse<T>`
- **api-processing.ts**: Normalización de formatos de API
- **base-service.ts**: Clase base con lógica común

**Ventajas:**

- Consistencia en todo el código
- Menos duplicación
- Fácil testing

### 4. **Principios SOLID Aplicados**

#### **S - Single Responsibility**

```typescript
// ✅ Cada función tiene una responsabilidad
function getStoredToken(): string | null { ... }
function saveToken(token: string): void { ... }
function extractErrorMessage(errorData, defaultMessage): string { ... }

// ❌ Antes: una función hacía todo
```

#### **O - Open/Closed**

```typescript
// ✅ BaseApiService es extensible
class CustomService extends BaseApiService {
  async customOperation() {
    return this.executeDataOperation(() => ...)
  }
}

// Nuevos servicios pueden extender sin modificar existentes
```

#### **L - Liskov Substitution**

```typescript
// ✅ HttpClient es una interfaz abstracta
interface HttpClient {
  get<T>(url: string): Promise<any>;
  post<T>(url: string, data: any): Promise<any>;
}

// Cualquier implementación es intercambiable
```

#### **I - Interface Segregation**

```typescript
// ✅ Interfaces pequeñas y específicas
interface LoginCredentials {
  usuario: string;
  contrasena: string;
}

interface AuthTokenResponse {
  token: string;
}

// Antes: interfaces genéricas y grandes
```

#### **D - Dependency Inversion**

```typescript
// ✅ Dependencia inyectable
class AuthService {
  constructor(private httpClient: HttpClient) {}
}

// Permite testing sin axios real
```

## 🎯 Early Returns Pattern

Reducción de nesting con early returns:

**Antes:**

```typescript
async handleError(error) {
  if (!error.response) {
    toast.error('Error de red');
    if (error.response?.status === 401) {
      // ... 50 líneas anidadas más
    }
  }
}
```

**Después:**

```typescript
async handleError(error) {
  if (!error.response) {
    handleNetworkError();
    return;  // Early return
  }

  const { status } = error.response;

  switch (status) {
    case 400:
      handleBadRequestError(data);
      return;  // Early return
    case 401:
      await handleUnauthorizedError(error);
      return;  // Early return
    // ...
  }
}
```

## 🛡️ Type Safety Mejorado

```typescript
// ✅ Tipos estrictos en toda la aplicación

// Respuestas estandarizadas
type ServiceResponse<T> = {
  data: T | null;
  error: string | null;
};

// Errores específicos
class AuthenticationError extends Error {
  constructor(
    public statusCode: number | undefined,
    message: string
  ) {
    super(message);
  }
}

// Type guards
function isSuccess<T>(response: ServiceResponse<T>): boolean {
  return response.data !== null && response.error === null;
}

// Validación con asserts
function validateTokenResponse(
  response
): asserts response is { data: AuthTokenResponse } {
  if (!response?.data?.token) {
    throw new AuthenticationError(response?.status, 'Sin token');
  }
}
```

## 📝 Funciones Pequeñas y Reutilizables

```typescript
// ✅ Funciones responsables de una sola cosa

// Extracción de token
function getStoredToken(): string | null {
  return localStorage.getItem('token');
}

// Persistencia de token
function saveToken(token: string): void {
  localStorage.setItem('token', token);
}

// Limpieza de token
function clearStoredToken(): void {
  localStorage.removeItem('token');
}

// Redirección
function redirectToSessionExpired(): void {
  clearStoredToken();
  globalThis.location.href = '/session-expired';
}

// Determinación de rutas esperadas
function isExpectedError(
  requestUrl: string | undefined,
  statusCode: number
): boolean {
  if (!requestUrl) return false;
  const expectedRoute = EXPECTED_ERROR_ROUTES.find(
    route => route.status === statusCode
  );
  return (
    expectedRoute?.routes.some(route => requestUrl.includes(route)) ?? false
  );
}
```

## 🔄 Próximos Pasos

### Servicios a Refactorizar (en orden de prioridad):

1. **administracionService.ts** (1195 líneas)
   - Separar en submódulos por entidad
   - Crear interfaz base para operaciones CRUD
   - Reducir duplication de error handling

2. **rolesPermisosService.ts** (805 líneas)
   - Aplicar base service
   - Separar roles y permisos en servicios distintos

3. **insercionAutomaticaService.ts** (390 líneas)
   - Mejorar validación con tipos
   - Extraer funciones de validación

4. **Servicios menores**
   - mantencionService.ts
   - operacionesService.ts
   - reportesService.ts
   - monitorService.ts
   - userService.ts

## 💡 Cómo Usar los Nuevos Servicios

### Usando authService Refactorizado

```typescript
// Antes
try {
  const token = await authService.login(credentials);
} catch (error) {
  // Manejo manual
}

// Después - Mismo uso, código más limpio internamente
try {
  const token = await authService.login(credentials);
} catch (error) {
  if (error instanceof AuthenticationError) {
    console.error(`Error ${error.statusCode}: ${error.message}`);
  }
}
```

### Extendiendo BaseApiService

```typescript
import { BaseApiService } from '~/services/core';
import api from '~/lib/api';

class ProductService extends BaseApiService {
  constructor() {
    super(api);
  }

  async getProducts() {
    return this.executeDataOperation(
      () => this.httpClient.get('/products'),
      'Error al obtener productos'
    );
  }
}
```

## ✅ Checklist de Refactorización

- [x] axiosConfig.ts - Refactorizado
- [x] authService.ts - Refactorizado
- [x] Core module creado
- [ ] administracionService.ts - Refactorizar
- [ ] rolesPermisosService.ts - Refactorizar
- [ ] insercionAutomaticaService.ts - Refactorizar
- [ ] Tests actualizados
- [ ] Documentación completada

## 📚 Referencias SOLID

- **Single Responsibility**: Cada función/clase tiene una única razón para cambiar
- **Open/Closed**: Abierto para extensión, cerrado para modificación
- **Liskov Substitution**: Subclases pueden reemplazar superclases
- **Interface Segregation**: Clientes no deben depender de interfaces que no usan
- **Dependency Inversion**: Depender de abstracciones, no de concreciones

## 🚀 Beneficios de la Refactorización

✅ **Mantenibilidad**: Código más fácil de entender y modificar
✅ **Testabilidad**: Servicios inyectables, fáciles de mockear
✅ **Reusabilidad**: Código base compartido reduce duplicación
✅ **Type Safety**: Prevención de errores en tiempo de compilación
✅ **Escalabilidad**: Estructura permite crecer sin problemas
✅ **Performance**: Mismo rendimiento, mejor organized
✅ **Developer Experience**: IDE autocomplete mejorado
