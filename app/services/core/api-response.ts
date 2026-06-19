// ============================================================================
// TIPOS
// ============================================================================

export interface ServiceResponse<T> {
  data: T | null;

  error: string | null;
}

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

export function successResponse<T>(data: T): ServiceResponse<T> {
  return { data, error: null };
}

export function errorResponse<T>(error: string): ServiceResponse<T> {
  return { data: null, error };
}

export function successResult<T>(data: T): OperationResult<T> {
  return { success: true, data };
}

export function errorResult<T>(error: Error): OperationResult<T> {
  return { success: false, error };
}

// ============================================================================
// UTILIDADES
// ============================================================================

export function toErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  return 'Error desconocido';
}

export function isSuccess<T>(
  response: ServiceResponse<T>
): response is ServiceResponse<T> & { data: T; error: null } {
  return response.data !== null && response.error === null;
}

export function hasError<T>(
  response: ServiceResponse<T>
): response is ServiceResponse<T> & { data: null; error: string } {
  return response.error !== null;
}
