/**
 * Módulo de utilidades para procesar respuestas de API
 *
 * Normaliza y transforma respuestas del servidor en formatos consistentes,
 * manejando variaciones en la estructura de datos del backend.
 */

// ============================================================================
// TIPOS
// ============================================================================

/** Respuesta anidada: { data: { data: T[] } } */
interface NestedArrayResponse<T> {
  data: T[];
}

// ============================================================================
// FUNCIONES
// ============================================================================

/**
 * Procesa respuesta de API con formato variable y retorna array
 *
 * El backend puede retornar datos en múltiples formatos:
 * - Formato anidado: `{ data: { data: T[] } }`
 * - Formato directo: `{ data: T[] }`
 * - Array directo: `T[]`
 *
 * Esta función normaliza todos los casos a un array consistente.
 *
 * @template T - Tipo de elementos del array
 * @param response - Respuesta del servidor (posiblemente con estructura variable)
 * @returns Array de tipo T, o array vacío si no hay datos válidos
 *
 * @example
 * ```typescript
 * // Formato anidado
 * const result = processArrayResponse({ data: { data: [item1, item2] } });
 * // result => [item1, item2]
 *
 * // Formato directo
 * const result = processArrayResponse({ data: [item1, item2] });
 * // result => [item1, item2]
 * ```
 */
export function processArrayResponse<T>(response: any): T[] {
  if (!response) {
    return [];
  }

  // Caso 1: Formato anidado { data: { data: T[] } }
  if (
    response.data &&
    typeof response.data === 'object' &&
    'data' in response.data &&
    Array.isArray((response.data as NestedArrayResponse<T>).data)
  ) {
    return (response.data as NestedArrayResponse<T>).data;
  }

  // Caso 2: Array directo
  if (Array.isArray(response.data)) {
    return response.data;
  }

  // Caso 3: Objeto single (envolver en array)
  if (
    response.data &&
    typeof response.data === 'object' &&
    !Array.isArray(response.data)
  ) {
    return [response.data as T];
  }

  return [];
}

/**
 * Procesa respuesta de API y retorna un objeto único
 *
 * Extrae un único objeto de la respuesta, manejo múltiples formatos:
 * - Formato anidado: `{ data: { data: T } }`
 * - Formato directo: `{ data: T }`
 *
 * @template T - Tipo del objeto a retornar
 * @param response - Respuesta del servidor
 * @returns Objeto de tipo T o null si no hay datos válidos
 *
 * @example
 * ```typescript
 * const result = processSingleResponse({ data: { data: { id: 1 } } });
 * // result => { id: 1 } o null
 * ```
 */
export function processSingleResponse<T>(response: any): T | null {
  if (!response?.data) {
    return null;
  }

  // Caso 1: Formato anidado
  if (typeof response.data === 'object' && 'data' in response.data) {
    return (response.data as { data: T }).data || null;
  }

  // Caso 2: Formato directo
  return response.data as T;
}

/**
 * Verifica si una respuesta contiene datos válidos
 *
 * @param response - Respuesta a validar
 * @returns true si la respuesta contiene datos
 */
export function hasData(response: any): boolean {
  return response && response.data !== undefined && response.data !== null;
}

/**
 * Extrae error de respuesta de error HTTP
 *
 * @param errorResponse - Objeto de error de axios o similar
 * @returns Mensaje de error extraído o null
 */
export function extractErrorMessage(errorResponse: any): string | null {
  if (!errorResponse) {
    return null;
  }

  // Caso 1: Objeto con propiedad message
  if (typeof errorResponse === 'object' && 'message' in errorResponse) {
    if (typeof errorResponse.message === 'string') {
      return errorResponse.message;
    }
  }

  // Caso 2: String directo
  if (typeof errorResponse === 'string') {
    return errorResponse;
  }

  return null;
}
