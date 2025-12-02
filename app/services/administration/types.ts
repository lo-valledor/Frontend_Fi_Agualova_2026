/**
 * Tipos compartidos para servicios de administración
 *
 * Define interfaces y tipos utilizados por múltiples servicios
 * especializados de administración.
 */

// ============================================================================
// TIPOS DE RESPUESTA GENÉRICOS
// ============================================================================

/**
 * Respuesta genérica para operación de entidad
 *
 * @template T - Tipo de datos de la entidad
 */
export interface EntityOperationResponse<T> {
  data: T;
  message: string;
  timestamp: string;
}

/**
 * Respuesta genérica para listado de entidades
 *
 * @template T - Tipo de datos de la entidad
 */
export interface EntityListResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

// ============================================================================
// TIPOS DE SOLICITUD
// ============================================================================

/** Solicitud de búsqueda por RUT */
export interface SearchByRutRequest {
  rut: string;
}

/** Solicitud de búsqueda por ID */
export interface SearchByIdRequest {
  id: string | number;
}

/** Solicitud de búsqueda por relación */
export interface SearchByRelationRequest {
  relationId: string | number;
}

// ============================================================================
// TIPOS DE VALIDACIÓN
// ============================================================================

/**
 * Resultado de validación
 */
export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

/**
 * Error de validación
 */
export interface ValidationError {
  field: string;
  message: string;
  code?: string;
}
