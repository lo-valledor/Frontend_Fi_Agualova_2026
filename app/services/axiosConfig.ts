import axios, { type AxiosError, type AxiosInstance } from 'axios';
import { toast } from 'sonner';

// ============================================================================
// TIPOS
// ============================================================================

interface AxiosConfig {
  readonly baseURL: string;
  readonly timeout: number;
}

interface ExpectedErrorRoutes {
  readonly status: number;
  readonly routes: readonly string[];
}

// ============================================================================
// CONSTANTES
// ============================================================================

function joinUrl(base: string, path: string): string {
  const normalizedBase = base.replace(/\/+$/, '');
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${normalizedBase}${normalizedPath}`;
}

function resolveApiUrl(): string {
  const apiPath = import.meta.env.VITE_API_URL;
  const devBackend = import.meta.env.VITE_DEV_BACKEND;

  if (!apiPath) {
    throw new Error('VITE_API_URL is not configured');
  }

  const isAbsoluteUrl = /^https?:\/\//i.test(apiPath);
  if (isAbsoluteUrl) {
    return apiPath;
  }

  if (import.meta.env.DEV) {
    if (!devBackend) {
      throw new Error(
        'VITE_DEV_BACKEND is required in development when VITE_API_URL is a relative path'
      );
    }

    return joinUrl(devBackend, apiPath);
  }

  return apiPath;
}

const API_URL = resolveApiUrl();
const REQUEST_TIMEOUT_MS = 15000;

const AXIOS_CONFIG: AxiosConfig = {
  baseURL: API_URL,
  timeout: REQUEST_TIMEOUT_MS
};

const EXPECTED_ERROR_ROUTES: readonly ExpectedErrorRoutes[] = [
  {
    status: 401,
    routes: [
      '/Login',
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

const axiosInstance: AxiosInstance = axios.create(AXIOS_CONFIG);

// ============================================================================
// HELPERS DE TOKEN (única fuente de verdad para localStorage)
// ============================================================================

export function getAuthToken(): string | null {
  if (typeof localStorage === 'undefined') return null;
  return localStorage.getItem('token');
}

export function setAuthToken(token: string): void {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem('token', token);
}

export function clearAuthToken(): void {
  if (typeof localStorage === 'undefined') return;
  localStorage.removeItem('token');
}

function redirectToSessionExpired(): void {
  clearAuthToken();
  globalThis.location.href = '/session-expired';
}

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

function handleNetworkError(): void {
  toast.error('Error de red. Por favor, verifica tu conexión.');
}

function handleBadRequestError(errorData: unknown): void {
  const message = extractErrorMessage(
    errorData,
    'Error en la solicitud. Verifica los datos.'
  );
  toast.error(message);
}

function handleForbiddenError(): void {
  toast.error('No tienes permiso para realizar esta acción.');
}

function handleServerError(): void {
  toast.error('Error del servidor. Por favor, intenta más tarde.');
}

function handleNotFoundError(errorData: unknown): void {
  const message = extractErrorMessage(errorData, 'Recurso no encontrado.');
  toast.error(message);
}

function handleGenericError(errorData: unknown): void {
  const message = extractErrorMessage(
    errorData,
    'Ha ocurrido un error inesperado.'
  );
  toast.error(message);
}

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

  toast.error('Tu sesión ha expirado. Por favor, inicia sesión de nuevo.');
  redirectToSessionExpired();
  throw error;
}

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

axiosInstance.interceptors.request.use(
  config => {
    const token = getAuthToken();

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  error => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
  response => response,
  (error: AxiosError) => handleErrorResponse(error)
);

export default axiosInstance;
