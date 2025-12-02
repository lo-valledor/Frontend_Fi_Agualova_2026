import axios, { type AxiosError, type AxiosInstance } from 'axios';
import { toast } from 'sonner';

// ============================================================================
// TIPOS
// ============================================================================

/** Configuración de Axios */
interface AxiosConfig {
  readonly baseURL: string;
  readonly withCredentials: boolean;
  readonly timeout: number;
}

/** Rutas donde ciertos errores HTTP son respuestas esperadas */
interface ExpectedErrorRoutes {
  readonly status: number;
  readonly routes: readonly string[];
}

// ============================================================================
// CONSTANTES
// ============================================================================

const API_URL = import.meta.env.VITE_API_URL;
const REQUEST_TIMEOUT_MS = 15000;

const AXIOS_CONFIG: AxiosConfig = {
  baseURL: API_URL,
  withCredentials: true,
  timeout: REQUEST_TIMEOUT_MS
};

/** Rutas donde los errores son respuestas esperadas del negocio */
const EXPECTED_ERROR_ROUTES: readonly ExpectedErrorRoutes[] = [
  {
    status: 401,
    routes: [
      '/login',
      '/refresh-token',
      'validar-usuario-modificacion',
      'cambiar-contrasena'
    ] as const
  },
  {
    status: 404,
    routes: [
      '/datos-basicos-medidor',
      '/calculo-prefactura-encabezado',
      '/calculo-prefactura-cargos'
    ] as const
  }
];

// ============================================================================
// INSTANCIAS
// ============================================================================

/** Instancia separada para refresh token - evita loop infinito en interceptores */
const refreshAxiosInstance: AxiosInstance = axios.create(AXIOS_CONFIG);

/** Instancia principal con interceptores configurados */
const axiosInstance: AxiosInstance = axios.create(AXIOS_CONFIG);

// ============================================================================
// FUNCIONES PRIVADAS
// ============================================================================

/**
 * Obtiene el token del almacenamiento local
 * @returns Token o null si no existe
 */
function getStoredToken(): string | null {
  return localStorage.getItem('token');
}

/**
 * Guarda el token en almacenamiento local
 * @param token - Token a guardar
 */
function saveToken(token: string): void {
  localStorage.setItem('token', token);
}

/**
 * Elimina el token del almacenamiento
 */
function clearToken(): void {
  localStorage.removeItem('token');
}

/**
 * Redirige a la página de sesión expirada
 */
function redirectToSessionExpired(): void {
  clearToken();
  globalThis.location.href = '/session-expired';
}

/**
 * Determina si una ruta espera cierto error HTTP como respuesta válida
 * @param requestUrl - URL de la solicitud
 * @param statusCode - Código HTTP
 * @returns true si el error es esperado para esta ruta
 */
function isExpectedError(
  requestUrl: string | undefined,
  statusCode: number
): boolean {
  if (!requestUrl) return false;

  const expectedRoute = EXPECTED_ERROR_ROUTES.find(
    route => route.status === statusCode
  );

  return (
    expectedRoute?.routes.some(route => requestUrl.includes(route)) ?? false
  );
}

/**
 * Extrae el mensaje de error de la respuesta del servidor
 * @param errorData - Datos de error de la respuesta
 * @param defaultMessage - Mensaje por defecto si no hay mensaje disponible
 * @returns Mensaje de error a mostrar
 */
function extractErrorMessage(
  errorData: unknown,
  defaultMessage: string
): string {
  if (typeof errorData === 'object' && errorData !== null) {
    const data = errorData as Record<string, unknown>;
    if (typeof data.message === 'string') {
      return data.message;
    }
  }

  if (typeof errorData === 'string') {
    return errorData;
  }

  return defaultMessage;
}

/**
 * Maneja errores de solicitud (sin respuesta del servidor)
 */
function handleNetworkError(): void {
  toast.error('Error de red. Por favor, verifica tu conexión.');
}

/**
 * Maneja error 400 (Bad Request)
 */
function handleBadRequestError(errorData: unknown): void {
  const message = extractErrorMessage(
    errorData,
    'Error en la solicitud. Verifica los datos.'
  );
  toast.error(message);
}

/**
 * Maneja error 403 (Forbidden)
 */
function handleForbiddenError(): void {
  toast.error('No tienes permiso para realizar esta acción.');
}

/**
 * Maneja error 500 (Internal Server Error)
 */
function handleServerError(): void {
  toast.error('Error del servidor. Por favor, intenta más tarde.');
}

/**
 * Maneja error 404 (Not Found)
 */
function handleNotFoundError(errorData: unknown): void {
  const message = extractErrorMessage(errorData, 'Recurso no encontrado.');
  toast.error(message);
}

/**
 * Maneja error genérico
 */
function handleGenericError(errorData: unknown): void {
  const message = extractErrorMessage(
    errorData,
    'Ha ocurrido un error inesperado.'
  );
  toast.error(message);
}

/**
 * Intenta refrescar el token de autenticación
 * @returns Nuevo token
 * @throws Error si el refresh falla
 */
async function attemptTokenRefresh(): Promise<string> {
  const response = await refreshAxiosInstance.post<{ token: string }>(
    '/refresh-token'
  );

  const newToken = response.data?.token;
  if (!newToken) {
    throw new Error('No se recibió token válido del servidor');
  }

  return newToken;
}

/**
 * Maneja error 401 (Unauthorized) con refresh automático de token
 */
async function handleUnauthorizedError(
  error: AxiosError,
  originalRequest: any
): Promise<void> {
  const isExpectedUnauthorized = isExpectedError(originalRequest.url, 401);

  if (isExpectedUnauthorized) {
    return Promise.reject(error);
  }

  // Early return si ya se intentó refrescar
  if (originalRequest._retry) {
    toast.error('Tu sesión ha expirado. Por favor, inicia sesión de nuevo.');
    redirectToSessionExpired();
    throw error;
  }

  originalRequest._retry = true;

  try {
    const newToken = await attemptTokenRefresh();
    saveToken(newToken);
    originalRequest.headers.Authorization = `Bearer ${newToken}`;
    return axiosInstance(originalRequest);
  } catch {
    toast.error('Tu sesión ha expirado. Por favor, inicia sesión de nuevo.');
    redirectToSessionExpired();
    throw error;
  }
}

/**
 * Maneja respuestas de error HTTP según el código de estado
 */
async function handleErrorResponse(error: AxiosError): Promise<void> {
  if (!error.response) {
    handleNetworkError();
    throw error;
  }

  const { status, data } = error.response;

  switch (status) {
    case 400:
      handleBadRequestError(data);
      break;

    case 401:
      await handleUnauthorizedError(error, error.config);
      return;

    case 403:
      handleForbiddenError();
      break;

    case 404:
      if (!isExpectedError(error.config?.url, 404)) {
        handleNotFoundError(data);
      }
      break;

    case 500:
      handleServerError();
      break;

    default:
      handleGenericError(data);
      break;
  }

  throw error;
}

// ============================================================================
// INTERCEPTORES
// ============================================================================

/**
 * Interceptor de request: Agrega token de autenticación automáticamente
 */
axiosInstance.interceptors.request.use(
  config => {
    const token = getStoredToken();

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  error => Promise.reject(error)
);

/**
 * Interceptor de response: Maneja errores y refresh de token
 */
axiosInstance.interceptors.response.use(
  response => response,
  (error: AxiosError) => handleErrorResponse(error)
);

export default axiosInstance;
