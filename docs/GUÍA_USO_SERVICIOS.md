# 📚 Guía de Uso - Servicios Refactorizados

## 🎯 Introducción

Los servicios refactorizados proporcionan una base sólida y extensible para todas las operaciones de API. Esta guía muestra cómo usarlos correctamente.

## 🔌 Usando el Sistema Core

### 1. **ServiceResponse** - Respuestas Tipadas

```typescript
import {
  type ServiceResponse,
  successResponse,
  errorResponse,
  isSuccess
} from '~/services/core';

// Crear una respuesta exitosa
const response: ServiceResponse<string> = successResponse(
  'Operación completada'
);
// resultado: { data: 'Operación completada', error: null }

// Crear una respuesta de error
const errorResp: ServiceResponse<string> = errorResponse('Error del servidor');
// resultado: { data: null, error: 'Error del servidor' }

// Verificar si fue exitosa
if (isSuccess(response)) {
  console.log(response.data); // Type-safe: string
}

// Usar en componentes
async function loadData() {
  const { data, error } = await userService.getAll();

  if (error) {
    toast.error(error);
    return;
  }

  // data es type-safe aquí
  setUsers(data);
}
```

### 2. **Procesamiento de API** - Normalización

```typescript
import { processArrayResponse, processSingleResponse } from '~/services/core';

// El backend retorna diferentes formatos
const response1 = { data: { data: [user1, user2] } }; // Formato anidado
const response2 = { data: [user1, user2] }; // Formato directo
const response3 = { data: user1 }; // Objeto único

// Todos se normalizan igual
const users1 = processArrayResponse<User>(response1); // [user1, user2]
const users2 = processArrayResponse<User>(response2); // [user1, user2]
const users3 = processArrayResponse<User>(response3); // [user1]

// Para objetos únicos
const user = processSingleResponse<User>(response1); // user o null
```

## 🏗️ Extendiendo BaseApiService

### Patrón: Crear un Nuevo Servicio

```typescript
import { BaseApiService, type ServiceResponse } from '~/services/core';
import api from '~/lib/api';

// 1. Definir tipos específicos
interface Product {
  id: number;
  nombre: string;
  precio: number;
}

interface CreateProductRequest {
  nombre: string;
  precio: number;
}

// 2. Extender BaseApiService
class ProductService extends BaseApiService {
  constructor(httpClient = api) {
    super(httpClient);
  }

  // 3. Implementar operaciones
  async getAll(): Promise<ServiceResponse<Product[]>> {
    return this.executeDataOperation(async () => {
      const response = await this.httpClient.get('productos');
      return this.processResponseArray<Product>(response);
    }, 'Error al obtener productos');
  }

  async getById(id: number): Promise<ServiceResponse<Product | null>> {
    return this.executeDataOperation(async () => {
      const response = await this.httpClient.get(`productos/${id}`);
      return this.processResponseSingle<Product>(response);
    }, `Error al obtener producto ${id}`);
  }

  async create(data: CreateProductRequest): Promise<ServiceResponse<Product>> {
    return this.executeDataOperation(async () => {
      const response = await this.httpClient.post('productos', data);
      return this.processResponseSingle<Product>(response);
    }, 'Error al crear producto');
  }

  async delete(id: number): Promise<ServiceResponse<void>> {
    return this.executeDataOperation(async () => {
      await this.httpClient.delete(`productos/${id}`);
    }, `Error al eliminar producto ${id}`);
  }
}

// 4. Exportar instancia
export const productService = new ProductService();
```

### Uso del Servicio Personalizado

```typescript
import { productService } from '~/services/products';

// Obtener todos
const { data: productos, error } = await productService.getAll();

// Obtener uno
const { data: producto } = await productService.getById(123);

// Crear
const { data: nuevoProducto } = await productService.create({
  nombre: 'Nuevo Producto',
  precio: 99.99
});

// Eliminar
const { error: deleteError } = await productService.delete(123);
```

## 🛡️ Manejo de Errores Robusto

### Patrón: Errores Personalizados

```typescript
// Crear error personalizado
class ValidationError extends Error {
  constructor(
    public readonly field: string,
    public readonly value: any,
    message: string
  ) {
    super(message);
    this.name = 'ValidationError';
  }
}

// Usar en servicio
class ValidatedService extends BaseApiService {
  private validateInput(data: any): void {
    if (!data.email || !data.email.includes('@')) {
      throw new ValidationError('email', data.email, 'Email inválido');
    }
  }

  async createWithValidation(data: any): Promise<ServiceResponse<any>> {
    try {
      this.validateInput(data);
      return this.executeDataOperation(
        () => this.httpClient.post('crear', data),
        'Error al crear'
      );
    } catch (error) {
      if (error instanceof ValidationError) {
        return this.handleError(error, `Campo ${error.field} es inválido`);
      }
      return this.handleError(error);
    }
  }
}
```

### Patrón: Validación con Type Guards

```typescript
// Type guard para validar datos
function isValidUser(
  data: any
): data is { id: number; name: string; email: string } {
  return (
    typeof data === 'object' &&
    typeof data.id === 'number' &&
    typeof data.name === 'string' &&
    typeof data.email === 'string'
  );
}

// Usar en servicio
class StrictUserService extends BaseApiService {
  async getUser(id: number): Promise<ServiceResponse<any>> {
    return this.executeDataOperation(async () => {
      const response = await this.httpClient.get(`usuario/${id}`);
      const user = this.processResponseSingle(response);

      if (!isValidUser(user)) {
        throw new Error('Formato de usuario inválido');
      }

      return user;
    }, 'Error al obtener usuario');
  }
}
```

## 🔐 AuthService Refactorizado

### Usando el nuevo AuthService

```typescript
import { authService } from '~/services';

// Login con error handling mejorado
try {
  const token = await authService.login({
    usuario: 'jperez',
    contrasena: 'password123'
  });
  console.log('Token:', token);
} catch (error) {
  if (error instanceof AuthenticationError) {
    console.error(`Error [${error.statusCode}]: ${error.message}`);
  }
}

// Logout seguro
await authService.logout();

// Refresh de token
try {
  const newToken = await authService.refreshToken();
  // Token se guarda automáticamente
} catch (error) {
  // Sesión expirada
  redirectToLogin();
}

// Recuperación de contraseña
await authService.requestPasswordRecovery('user@example.com');

// Restablecer contraseña
try {
  await authService.resetPassword(resetToken, 'NuevaPas123!');
} catch (error) {
  console.error('Error al restablecer:', error.message);
}
```

## 🔗 AxiosConfig Refactorizado

### Características del Interceptor Mejorado

```typescript
// Manejo automático de:
// 1. Token en headers
// 2. Refresh automático en 401
// 3. Errores por código HTTP
// 4. Errores de red
// 5. Rutas con 401/404 esperados

// Ejemplo: Componente sin preocuparse por token
async function fetchUserData() {
  // El token se agrega automáticamente
  const response = await api.get('/usuario/perfil');

  // Si 401, se intenta refrescar automáticamente
  // Si falla el refresh, redirige a login

  return response.data;
}
```

## 📊 Patrón: Operaciones Paralelas

```typescript
// Para operaciones que necesitan múltiples calls
class ComplexService extends BaseApiService {
  async getCompleteData(
    userId: number
  ): Promise<ServiceResponse<CompleteData>> {
    return this.executeDataOperation(async () => {
      const [userResp, postsResp, commentsResp] =
        (await this.executeParallelOperations([
          () => this.httpClient.get(`usuarios/${userId}`),
          () => this.httpClient.get(`usuarios/${userId}/posts`),
          () => this.httpClient.get(`usuarios/${userId}/comments`)
        ])) as Promise<[any, any, any]>;

      return {
        usuario: this.processResponseSingle(userResp),
        posts: this.processResponseArray(postsResp),
        comentarios: this.processResponseArray(commentsResp)
      };
    }, 'Error al obtener datos completos');
  }
}
```

## 🎨 Patrón: Validación y Transformación

```typescript
// Transformar respuestas del backend
class TransformService extends BaseApiService {
  async getProducts(): Promise<ServiceResponse<Product[]>> {
    return this.executeDataOperation(async () => {
      const response = await this.httpClient.get('productos');
      const raw = this.processResponseArray<any>(response);

      // Transformar datos
      return raw.map(item => ({
        id: item.idProducto,
        nombre: item.nombreProducto,
        precio: parseFloat(item.precioProducto),
        activo: item.estado === 'A'
      }));
    }, 'Error al obtener productos');
  }
}
```

## ✅ Testing

### Mockear Servicios para Tests

```typescript
import { describe, it, expect, vi } from 'vitest';
import { BaseApiService } from '~/services/core';

describe('ProductService', () => {
  it('debería obtener productos', async () => {
    // Mock del HttpClient
    const mockHttpClient = {
      get: vi.fn().mockResolvedValue({
        data: [
          { idProducto: 1, nombreProducto: 'Producto 1' },
          { idProducto: 2, nombreProducto: 'Producto 2' }
        ]
      })
    };

    const service = new ProductService(mockHttpClient);
    const { data, error } = await service.getAll();

    expect(error).toBeNull();
    expect(data).toHaveLength(2);
    expect(mockHttpClient.get).toHaveBeenCalledWith('productos');
  });

  it('debería manejar errores', async () => {
    const mockHttpClient = {
      get: vi.fn().mockRejectedValue(new Error('Network error'))
    };

    const service = new ProductService(mockHttpClient);
    const { data, error } = await service.getAll();

    expect(data).toBeNull();
    expect(error).toBe('Network error');
  });
});
```

## 🚀 Checklist de Migración

Cuando refactorices servicios existentes:

- [ ] Extender `BaseApiService`
- [ ] Definir tipos específicos
- [ ] Usar `executeDataOperation` para operaciones con datos
- [ ] Usar `executeOperation` para operaciones sin datos
- [ ] Implementar validaciones con type guards
- [ ] Documentar métodos públicos
- [ ] Agregar tests
- [ ] Exportar como singleton
- [ ] Actualizar imports en componentes

## 💡 Best Practices

1. **Siempre usar tipos estrictos**

   ```typescript
   // ✅ Bien
   async getUser(id: number): Promise<ServiceResponse<User | null>>

   // ❌ Mal
   async getUser(id: any): Promise<any>
   ```

2. **Validar entrada y salida**

   ```typescript
   // ✅ Bien
   if (!this.isValidId(id)) {
     return this.handleError(new Error('ID inválido'));
   }

   // ❌ Mal
   // Asumir que los datos son correctos
   ```

3. **Mensajes de error descriptivos**

   ```typescript
   // ✅ Bien
   'Error al obtener usuario 123: No encontrado';

   // ❌ Mal
   'Error';
   ```

4. **Documentar excepciones**

   ```typescript
   /**
    * @throws Error si el usuario no existe
    * @throws ValidationError si el email es inválido
    */
   async updateUser(id: number, data: UpdateRequest): Promise<ServiceResponse<User>> {
   ```

5. **Usar early returns**

   ```typescript
   // ✅ Bien
   if (!isValid) return errorResponse('Invalid');
   if (!exists) return errorResponse('Not found');
   // ... lógica principal

   // ❌ Mal
   if (isValid) {
     if (exists) {
       // 10 niveles de nesting...
     }
   }
   ```
