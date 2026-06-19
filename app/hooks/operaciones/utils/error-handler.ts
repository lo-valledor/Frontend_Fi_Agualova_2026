export interface ErrorResponse {
  message: string;
  statusCode?: number;
  isNotFound: boolean;
  originalError: any;
}

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

export function validarRespuestaAPI(data: any): data is any[] {
  return Array.isArray(data) && data.length > 0;
}

export function es404(error: any): boolean {
  return error?.response?.status === 404;
}

export function extraerCodigoEstatus(error: any): number {
  return error?.response?.status ?? 0;
}
