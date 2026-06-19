import type { AxiosError } from 'axios';


export function isCredentialError(errorMessage: string): boolean {
  const lowerMessage = errorMessage.toLowerCase();
  return (
    lowerMessage.includes('contraseña') ||
    lowerMessage.includes('password') ||
    lowerMessage.includes('clave') ||
    lowerMessage.includes('credenciales')
  );
}


export function isAuthorizationError(errorMessage: string): boolean {
  const lowerMessage = errorMessage.toLowerCase();
  return (
    lowerMessage.includes('contraseña') ||
    lowerMessage.includes('password') ||
    lowerMessage.includes('clave') ||
    lowerMessage.includes('credenciales') ||
    lowerMessage.includes('autorización') ||
    lowerMessage.includes('permisos')
  );
}


export function getErrorMessage(error: AxiosError<any>): string {
  return error.response?.data?.mensaje || error.response?.data?.message || '';
}


export function handleValidationHTTPError(
  error: AxiosError<any>,
  toast: any
): boolean {
  const status = error.response?.status;

  // 401: No autorizado
  if (status === 401) {
    const errorMessage = getErrorMessage(error);

    if (isCredentialError(errorMessage)) {
      toast.error('Credenciales de usuario incorrectas');
    } else {
      toast.error('Contraseña incorrecta');
    }
    return true;
  }

  // 400: Bad request
  if (status === 400) {
    toast.error('Credenciales de usuario incorrectas');
    return true;
  }

  // 403: Forbidden
  if (status === 403) {
    toast.error('No tienes permisos para realizar esta acción.');
    return true;
  }

  return false;
}


export function handleGeneralValidationError(error: any, toast: any): void {
  if (error.response) {
    const errorMessage = getErrorMessage(error as AxiosError<any>);
    toast.error(`Error ${error.response.status}: ${errorMessage}`);
  } else if (error.request) {
    toast.error('No se recibió respuesta del servidor. Verifica tu conexión.');
  } else {
    toast.error(`Error: ${error.message}`);
  }
}
