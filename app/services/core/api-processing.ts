// ============================================================================
// TIPOS
// ============================================================================


interface NestedArrayResponse<T> {
  data: T[];
}

// ============================================================================
// FUNCIONES
// ============================================================================


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


export function hasData(response: any): boolean {
  return response && response.data !== undefined && response.data !== null;
}


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
