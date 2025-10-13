# Plantilla para Documentar Servicios

Esta plantilla te ayuda a documentar servicios de forma consistente usando JSDoc.

## Estructura Básica de un Servicio

```typescript
import api from '~/lib/api';
import type { MiTipo } from '~/types/mi-modulo';

/**
 * Interfaz estándar para respuestas del servicio
 * Encapsula el resultado exitoso o error de operaciones
 *
 * @template T - Tipo de datos que retorna la operación exitosa
 */
export interface MiServiceResponse<T> {
  /** Datos devueltos en caso de éxito, null si hay error */
  data: T | null;
  /** Mensaje de error si falla la operación, null si es exitosa */
  error: string | null;
}

/**
 * Servicio para [DESCRIPCIÓN DEL MÓDULO]
 *
 * Maneja las operaciones CRUD y consultas para:
 * - [Entidad 1]
 * - [Entidad 2]
 * - [Entidad 3]
 *
 * Todas las operaciones retornan un objeto MiServiceResponse
 * que encapsula el resultado o error.
 *
 * @example
 * ```typescript
 * import { miServicio } from '~/services/miServicio';
 *
 * const { data, error } = await miServicio.getDatos();
 * if (error) {
 *   console.error('Error:', error);
 * } else {
 *   console.log('Datos:', data);
 * }
 * ```
 */
class MiServicio {
  /**
   * [DESCRIPCIÓN DEL MÉTODO]
   *
   * [DETALLES ADICIONALES SI SON NECESARIOS]
   *
   * @param param1 - Descripción del parámetro 1
   * @param param2 - Descripción del parámetro 2 (opcional)
   * @returns Promise con [tipo de dato] o error
   *
   * @throws {Error} Si [condición de error específica]
   *
   * @example
   * ```typescript
   * const { data, error } = await miServicio.miMetodo('valor');
   * if (error) {
   *   toast.error(error);
   * } else {
   *   console.log('Resultado:', data);
   * }
   * ```
   */
  async miMetodo(
    param1: string,
    param2?: number
  ): Promise<MiServiceResponse<MiTipo>> {
    try {
      const response = await api.get('/endpoint', {
        params: { param1, param2 }
      });

      return {
        data: response.data,
        error: null
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  /**
   * [MÉTODO GET - Obtiene datos]
   *
   * @returns Promise con array de [tipo] o error
   */
  async getDatos(): Promise<MiServiceResponse<MiTipo[]>> {
    try {
      const response = await api.get('/datos');
      return { data: response.data, error: null };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  /**
   * Crea un nuevo [entidad] en el sistema
   *
   * @param datos - Datos del [entidad] a crear
   * @returns Promise con el [entidad] creado o error
   *
   * @example
   * ```typescript
   * const nuevo = { nombre: 'Test', valor: 100 };
   * const { data, error } = await miServicio.crear(nuevo);
   * if (data) {
   *   toast.success(`Creado con ID: ${data.id}`);
   * }
   * ```
   */
  async crear(datos: CreateRequest): Promise<MiServiceResponse<MiTipo>> {
    try {
      const response = await api.post('/datos', datos);
      return { data: response.data, error: null };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  /**
   * Actualiza un [entidad] existente
   *
   * @param id - ID del [entidad] a actualizar
   * @param datos - Datos actualizados
   * @returns Promise con el [entidad] actualizado o error
   *
   * @example
   * ```typescript
   * const { data, error } = await miServicio.actualizar(1, {
   *   nombre: 'Nuevo nombre'
   * });
   * ```
   */
  async actualizar(
    id: number,
    datos: UpdateRequest
  ): Promise<MiServiceResponse<MiTipo>> {
    try {
      const response = await api.patch(`/datos/${id}`, datos);
      return { data: response.data, error: null };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  /**
   * Elimina un [entidad] por ID
   *
   * @param id - ID del [entidad] a eliminar
   * @returns Promise con resultado de la eliminación
   *
   * @example
   * ```typescript
   * const { error } = await miServicio.eliminar(1);
   * if (!error) {
   *   toast.success('Eliminado correctamente');
   * }
   * ```
   */
  async eliminar(id: number): Promise<MiServiceResponse<void>> {
    try {
      await api.delete(`/datos/${id}`);
      return { data: null, error: null };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  /**
   * Método que realiza múltiples peticiones en paralelo
   *
   * Usa Promise.all para optimizar el tiempo de carga cuando
   * se necesitan datos de múltiples endpoints relacionados.
   *
   * @returns Promise con objeto conteniendo múltiples arrays o error
   *
   * @example
   * ```typescript
   * const { data, error } = await miServicio.getDatosCompletos();
   * if (data) {
   *   const { datos1, datos2, datos3 } = data;
   * }
   * ```
   */
  async getDatosCompletos(): Promise<
    MiServiceResponse<{
      datos1: Tipo1[];
      datos2: Tipo2[];
      datos3: Tipo3[];
    }>
  > {
    try {
      // Realizar peticiones en paralelo para mejor performance
      const [res1, res2, res3] = await Promise.all([
        api.get('/endpoint1'),
        api.get('/endpoint2'),
        api.get('/endpoint3')
      ]);

      return {
        data: {
          datos1: res1.data,
          datos2: res2.data,
          datos3: res3.data
        },
        error: null
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }
}

/**
 * Instancia singleton del servicio
 *
 * @example
 * ```typescript
 * import { miServicio } from '~/services/miServicio';
 *
 * const { data, error } = await miServicio.getDatos();
 * ```
 */
export const miServicio = new MiServicio();
```

---

## Guías de Documentación

### ¿Qué documentar en métodos?

#### SIEMPRE documenta:
- ✅ Qué hace el método (descripción breve)
- ✅ Parámetros y su tipo
- ✅ Qué retorna
- ✅ Ejemplo de uso (al menos para métodos públicos)

#### Documenta CUANDO sea relevante:
- 🔸 Errores que puede lanzar específicamente
- 🔸 Comportamientos no obvios o edge cases
- 🔸 Por qué se hace algo de cierta manera
- 🔸 Limitaciones o consideraciones especiales

#### NO documentes:
- ❌ Lo obvio (ej: "// Llama a la API" antes de `api.get()`)
- ❌ Implementación interna (a menos que sea compleja)
- ❌ Tipos que ya están en TypeScript

### Ejemplos de Buena Documentación

```typescript
/**
 * ✅ BUENO: Explica QUÉ y POR QUÉ
 *
 * Normaliza respuestas de API con formato variable
 *
 * El backend puede retornar datos en dos formatos diferentes:
 * - Formato anidado: { data: { data: T[] } }
 * - Formato directo: { data: T[] }
 *
 * Este método normaliza ambos casos y retorna siempre un array.
 */
```

```typescript
/**
 * ❌ MALO: Repite lo obvio
 *
 * Llama al endpoint de la API y retorna los datos
 */
```

### Tags JSDoc Útiles

- `@param` - Documenta parámetros
- `@returns` - Documenta el valor de retorno
- `@throws` - Documenta errores que puede lanzar
- `@example` - Proporciona ejemplo de uso
- `@template` - Documenta parámetros de tipo genérico
- `@private` - Marca método como privado
- `@deprecated` - Marca método como obsoleto

---

## Checklist de Documentación

Antes de considerar un servicio completo, verifica:

- [ ] Todas las interfaces tienen descripción
- [ ] La clase de servicio tiene descripción general
- [ ] Todos los métodos públicos están documentados
- [ ] Métodos con parámetros tienen `@param`
- [ ] Métodos con retorno tienen `@returns`
- [ ] Al menos los métodos principales tienen `@example`
- [ ] Métodos complejos tienen explicación del POR QUÉ
- [ ] El export singleton está documentado
