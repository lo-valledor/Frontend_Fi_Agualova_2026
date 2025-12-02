/**
 * Mantencion module types and interfaces
 */

export interface MantencionRequest {
  id?: number;
  name?: string;
  description?: string;
}

export interface MantencionResult<T> {
  data: T;
  timestamp: Date;
}
