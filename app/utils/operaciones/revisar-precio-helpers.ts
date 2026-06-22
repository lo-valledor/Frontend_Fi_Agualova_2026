import type { AxiosError } from 'axios';

/**
 * Extrae un mensaje legible desde un error de Axios.
 * Acepta tanto `mensaje` (backend) como `message` (estándar).
 */
export function getErrorMessage(error: AxiosError<unknown>): string {
  const data = error.response?.data as
    | { mensaje?: string; message?: string }
    | undefined;
  return data?.mensaje ?? data?.message ?? '';
}

/**
 * Determina si un mensaje de error corresponde a un problema de credenciales.
 */
export function isCredentialError(errorMessage: string): boolean {
  const lower = errorMessage.toLowerCase();
  return (
    lower.includes('contraseña') ||
    lower.includes('password') ||
    lower.includes('clave') ||
    lower.includes('credenciales')
  );
}

/**
 * Determina si un mensaje de error corresponde a un problema de autorización
 * (permisos insuficientes, no credenciales).
 */
export function isAuthorizationError(errorMessage: string): boolean {
  const lower = errorMessage.toLowerCase();
  return (
    isCredentialError(lower) ||
    lower.includes('autorización') ||
    lower.includes('autorizacion') ||
    lower.includes('permisos')
  );
}
