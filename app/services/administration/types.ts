// ============================================================================
// TIPOS DE RESPUESTA GENÉRICOS
// ============================================================================


export interface EntityOperationResponse<T> {
  data: T;
  message: string;
  timestamp: string;
}


export interface EntityListResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

// ============================================================================
// TIPOS DE SOLICITUD
// ============================================================================


export interface SearchByRutRequest {
  rut: string;
}


export interface SearchByIdRequest {
  id: string | number;
}


export interface SearchByRelationRequest {
  relationId: string | number;
}

// ============================================================================
// TIPOS DE VALIDACIÓN
// ============================================================================


export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}


export interface ValidationError {
  field: string;
  message: string;
  code?: string;
}
