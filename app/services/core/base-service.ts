/**
 * Base clase para servicios API
 *
 * Proporciona funcionalidad común para todos los servicios:
 * - Manejo de errores consistente
 * - Transformación de respuestas
 * - Manejo seguro de promises
 *
 * Sigue principios SOLID:
 * - Single Responsibility: cada servicio tiene una única responsabilidad
 * - Open/Closed: extensible sin modificar código existente
 * - Liskov Substitution: servicios intercambiables
 * - Interface Segregation: interfaces específicas
 * - Dependency Inversion: depende de abstracciones
 */

import type { ServiceResponse } from './api-response';
import { errorResponse, successResponse, toErrorMessage } from './api-response';
import { processArrayResponse, processSingleResponse } from './api-processing';

// ============================================================================
// TIPOS
// ============================================================================

/**
 * Cliente HTTP que el servicio usará
 * Abstracción para permitir testing e inyección de dependencias
 */
export interface HttpClient {
  get<_T = any>(url: string, config?: any): Promise<any>;
  post<_T = any>(url: string, data?: any, config?: any): Promise<any>;
  put<_T = any>(url: string, data?: any, config?: any): Promise<any>;
  delete<_T = any>(url: string, config?: any): Promise<any>;
  patch<_T = any>(url: string, data?: any, config?: any): Promise<any>;
}

// ============================================================================
// BASE SERVICE
// ============================================================================

/**
 * Clase base para todos los servicios API
 *
 * Proporciona métodos comunes para manejo de errores y transformación de respuestas
 * Todos los servicios específicos deben extender esta clase.
 *
 * @template TClient - Tipo del cliente HTTP
 */
export abstract class BaseApiService<TClient extends HttpClient = HttpClient> {
  /**
   * Constructor protegido
   *
   * @param httpClient - Cliente HTTP para realizar solicitudes
   */
  constructor(protected readonly httpClient: TClient) {}

  /**
   * Procesa respuesta de API a array y maneja errores
   *
   * @template T - Tipo de elementos del array
   * @param response - Respuesta del servidor
   * @returns Array de tipo T o array vacío en error
   *
   * @protected
   */
  protected processResponseArray<T>(response: any): T[] {
    return processArrayResponse<T>(response);
  }

  /**
   * Procesa respuesta de API a objeto único y maneja errores
   *
   * @template T - Tipo del objeto
   * @param response - Respuesta del servidor
   * @returns Objeto de tipo T o null en error
   *
   * @protected
   */
  protected processResponseSingle<T>(response: any): T | null {
    return processSingleResponse<T>(response);
  }

  /**
   * Maneja error y retorna respuesta normalizada
   *
   * @template T - Tipo del dato que se habría retornado en caso de éxito
   * @param error - Error capturado
   * @param defaultMessage - Mensaje por defecto si no se puede extraer uno
   * @returns Respuesta de error normalizada
   *
   * @protected
   */
  protected handleError<T>(
    error: unknown,
    defaultMessage: string = 'Error desconocido'
  ): ServiceResponse<T> {
    const message = toErrorMessage(error) || defaultMessage;
    return errorResponse<T>(message);
  }

  /**
   * Ejecuta una operación asincrónica con manejo de errores
   *
   * Útil para operaciones que no retornan datos (POST, DELETE, etc.)
   *
   * @template T - Tipo de respuesta esperada
   * @param operation - Función que realiza la operación
   * @param successMessage - Mensaje a retornar en caso de éxito (opcional)
   * @returns Respuesta normalizada con datos o error
   *
   * @protected
   */
  protected async executeOperation<T = void>(
    operation: () => Promise<any>,
    successMessage?: string
  ): Promise<ServiceResponse<T | string>> {
    try {
      await operation();
      return successResponse<T | string>(
        successMessage || ('Success' as T | string)
      );
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Ejecuta una operación que retorna datos con manejo de errores
   *
   * @template T - Tipo de datos a retornar
   * @param operation - Función que realiza la operación y retorna datos
   * @param defaultError - Mensaje de error por defecto
   * @returns Respuesta normalizada con datos o error
   *
   * @protected
   */
  protected async executeDataOperation<T>(
    operation: () => Promise<T>,
    defaultError: string = 'Error al procesar operación'
  ): Promise<ServiceResponse<T>> {
    try {
      const data = await operation();
      return successResponse<T>(data);
    } catch (error) {
      return this.handleError<T>(error, defaultError);
    }
  }

  /**
   * Ejecuta múltiples operaciones en paralelo con manejo de errores
   *
   * @template T - Tuple con tipos de cada operación
   * @param operations - Array de operaciones a ejecutar
   * @param defaultError - Mensaje de error por defecto
   * @returns Promise que se resuelve cuando todas las operaciones completan
   *
   * @protected
   */
  protected async executeParallelOperations<_T extends readonly any[]>(
    operations: readonly (() => Promise<any>)[],
    defaultError: string = 'Error en operaciones paralelas'
  ): Promise<unknown[]> {
    try {
      return await Promise.all(operations.map(op => op()));
    } catch (error) {
      throw new Error(toErrorMessage(error) || defaultError);
    }
  }
}
