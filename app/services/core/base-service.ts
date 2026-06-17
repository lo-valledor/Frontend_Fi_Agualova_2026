import type { ServiceResponse } from './api-response';
import { errorResponse, successResponse, toErrorMessage } from './api-response';
import { processArrayResponse, processSingleResponse } from './api-processing';

// ============================================================================
// TIPOS
// ============================================================================


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


export abstract class BaseApiService<TClient extends HttpClient = HttpClient> {
  
  constructor(protected readonly httpClient: TClient) {}

  
  protected processResponseArray<T>(response: any): T[] {
    return processArrayResponse<T>(response);
  }

  
  protected processResponseSingle<T>(response: any): T | null {
    return processSingleResponse<T>(response);
  }

  
  protected handleError<T>(
    error: unknown,
    defaultMessage: string = 'Error desconocido'
  ): ServiceResponse<T> {
    const message = toErrorMessage(error) || defaultMessage;
    return errorResponse<T>(message);
  }

  
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
