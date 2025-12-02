/**
 * Módulo para manejo estándar de respuestas de API
 *
 * Proporciona tipos y utilidades para encapsular respuestas exitosas o con error,
 * siguiendo un patrón consistente en toda la aplicación.
 */

// ============================================================================
// TIPOS
// ============================================================================

/**
 * Respuesta estándar de servicio API
 *
 * Encapsula el resultado de una operación como exitosa (con datos) o fallida (con error).
 * Garantiza type safety y manejo consistente de errores.
 *
 * @template T - Tipo de datos retornado en caso de éxito
 */
export interface ServiceResponse<T> {
  /** Datos retornados en caso de éxito */
  data: T | null;
  /** Mensaje de error en caso de fallo */
  error: string | null;
}

/**
 * Resultado de una operación que puede fallar
 *
 * @template T - Tipo de datos en caso de éxito
 */
export type OperationResult<T> =
  | {
      success: true;
      data: T;
    }
  | {
      success: false;
      error: Error;
    };

// ============================================================================
// CONSTRUCTORES
// ============================================================================

/**
 * Crea una respuesta exitosa
 *
 * @template T
 * @param data - Datos a retornar
 * @returns Respuesta con datos y sin error
 */
export function successResponse<T>(data: T): ServiceResponse<T> {
  return { data, error: null };
}

/**
 * Crea una respuesta fallida
 *
 * @template T
 * @param error - Mensaje de error
 * @returns Respuesta sin datos y con error
 */
export function errorResponse<T>(error: string): ServiceResponse<T> {
  return { data: null, error };
}

/**
 * Crea un resultado exitoso
 *
 * @template T - Tipo de datos del resultado
 * @param data - Datos a encapsular
 * @returns Resultado exitoso con datos
 */
export function successResult<T>(data: T): OperationResult<T> {
  return { success: true, data };
}

/**
 * Crea un resultado fallido
 *
 * @template T - Tipo de datos que se habría retornado
 * @param error - Error ocurrido
 * @returns Resultado fallido con error
 */
export function errorResult<T>(error: Error): OperationResult<T> {
  return { success: false, error };
}

// ============================================================================
// UTILIDADES
// ============================================================================

/**
 * Convierte un error a mensaje legible
 *
 * @param error - Error a convertir (puede ser Error, string o cualquier tipo)
 * @returns Mensaje de error en string
 */
export function toErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  return 'Error desconocido';
}

/**
 * Verifica si una respuesta fue exitosa
 *
 * @template T - Tipo de datos
 * @param response - Respuesta a verificar
 * @returns true si la respuesta contiene datos
 */
export function isSuccess<T>(
  response: ServiceResponse<T>
): response is ServiceResponse<T> & { data: T; error: null } {
  return response.data !== null && response.error === null;
}

/**
 * Verifica si una respuesta tiene error
 *
 * @template T - Tipo de datos
 * @param response - Respuesta a verificar
 * @returns true si la respuesta contiene error
 */
export function hasError<T>(
  response: ServiceResponse<T>
): response is ServiceResponse<T> & { data: null; error: string } {
  return response.error !== null;
}
