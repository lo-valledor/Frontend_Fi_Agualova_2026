/**
 * Utilidades para manejo estandarizado de errores
 * Centraliza la lógica de extracción y procesamiento de mensajes de error
 */

import type { AxiosError } from 'axios';

/**
 * Interface para respuesta de error estandarizada
 */
export interface ErrorResponse {
  message: string;
  statusCode?: number;
  isNotFound: boolean;
  originalError: any;
}

/**
 * Extrae el mensaje de error de una excepción de manera segura
 *
 * @param error - Error capturado (puede ser AxiosError, Error, o desconocido)
 * @returns Objeto con información del error estructurada
 *
 * @example
 * try {
 *   await api.get('/endpoint');
 * } catch (error) {
 *   const { message, statusCode, isNotFound } = extraerErrorMessage(error);
 *   if (isNotFound) {
 *     toast.info('No se encontraron datos');
 *   }
 * }
 */
export function extraerErrorMessage(error: any): ErrorResponse {
  // Verificar si es AxiosError
  if (error?.response?.status === 404) {
    return {
      message:
        error.response?.data?.mensaje ||
        error.message ||
        'Recurso no encontrado',
      statusCode: 404,
      isNotFound: true,
      originalError: error
    };
  }

  // Error con mensaje en response.data
  if (error?.response?.data?.mensaje) {
    return {
      message: error.response.data.mensaje,
      statusCode: error.response?.status,
      isNotFound: false,
      originalError: error
    };
  }

  // Error estándar con message
  if (error instanceof Error) {
    return {
      message: error.message || 'Error desconocido',
      isNotFound: false,
      originalError: error
    };
  }

  // Fallback para errores desconocidos
  return {
    message: error?.message || 'Error desconocido',
    isNotFound: false,
    originalError: error
  };
}

/**
 * Validación segura de respuesta de API
 * Verifica que los datos existan y sean arrays válidos
 *
 * @param data - Datos a validar
 * @returns true si es un array válido con al menos un elemento
 *
 * @example
 * if (!validarRespuestaAPI(response.data)) {
 *   toast.error('Respuesta inválida del servidor');
 *   return;
 * }
 */
export function validarRespuestaAPI(data: any): data is any[] {
  return Array.isArray(data) && data.length > 0;
}

/**
 * Manejo de error 404 especial (caso no encontrado)
 *
 * @param error - Error capturado
 * @returns true si es un error 404
 */
export function es404(error: any): boolean {
  return error?.response?.status === 404;
}

/**
 * Extrae código de estado HTTP de manera segura
 *
 * @param error - Error capturado
 * @returns Código de estado (0 si no está disponible)
 */
export function extraerCodigoEstatus(error: any): number {
  return error?.response?.status ?? 0;
}
