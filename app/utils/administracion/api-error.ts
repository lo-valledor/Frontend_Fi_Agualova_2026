import axios from 'axios';

export interface ApiErrorInfo {
  message: string;
  isNetworkError: boolean;
}

const NETWORK_ERROR_MESSAGE =
  'Error de conexión. Por favor, intenta nuevamente.';

/**
 * Extrae un mensaje legible a partir de un error desconocido.
 *
 * Estrategia (early returns):
 * 1. Si es error de red (sin `response`): devuelve mensaje de red.
 * 2. Si el backend envió un mensaje en `response.data.message`: lo usa.
 * 3. Si el error es un `Error` nativo: usa su `message`.
 * 4. Fallback al `defaultMessage` provisto.
 */
export function extractApiErrorMessage(
  error: unknown,
  defaultMessage: string
): ApiErrorInfo {
  if (axios.isAxiosError(error) && !error.response) {
    return {
      message: NETWORK_ERROR_MESSAGE,
      isNetworkError: true
    };
  }

  if (axios.isAxiosError(error) && error.response?.data) {
    const data = error.response.data as Record<string, unknown>;
    const message =
      (typeof data.message === 'string' && data.message) ||
      (typeof data.error === 'string' && data.error) ||
      defaultMessage;
    return {
      message,
      isNetworkError: false
    };
  }

  if (error instanceof Error && error.message) {
    return {
      message: error.message,
      isNetworkError: false
    };
  }

  return {
    message: defaultMessage,
    isNetworkError: false
  };
}
