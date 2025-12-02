import { toast } from 'sonner';

import axiosInstance from './axiosConfig';

// ============================================================================
// TIPOS
// ============================================================================

/** Credenciales de inicio de sesión */
interface LoginCredentials {
  usuario: string;
  contrasena: string;
}

/** Respuesta del servidor al iniciar sesión */
interface AuthTokenResponse {
  token: string;
}

/** Errores de autenticación específicos */
class AuthenticationError extends Error {
  constructor(
    public readonly statusCode: number | undefined,
    message: string
  ) {
    super(message);
    this.name = 'AuthenticationError';
  }
}

// ============================================================================
// FUNCIONES PRIVADAS
// ============================================================================

/**
 * Extrae el mensaje de error de una respuesta de axios
 */
function extractErrorMessage(error: unknown, defaultMessage: string): string {
  if (error instanceof AxiosError) {
    if (
      typeof error.response?.data === 'object' &&
      error.response?.data !== null
    ) {
      const data = error.response.data as Record<string, unknown>;
      if (typeof data.message === 'string') {
        return data.message;
      }
    }

    if (typeof error.response?.data === 'string') {
      return error.response.data;
    }
  }

  return defaultMessage;
}

/**
 * Valida que la respuesta contenga un token válido
 * @throws AuthenticationError si no hay token
 */
function validateTokenResponse(
  response: any
): asserts response is { data: AuthTokenResponse } {
  if (!response?.data?.token) {
    throw new AuthenticationError(
      response?.status,
      'No se recibió token del servidor'
    );
  }
}

/**
 * Guarda el token en almacenamiento local
 */
function persistToken(token: string): void {
  localStorage.setItem('token', token);
}

/**
 * Elimina el token del almacenamiento
 */
function clearStoredToken(): void {
  localStorage.removeItem('token');
}

/**
 * Maneja errores específicos de autenticación por código de estado
 */
function handleAuthenticationError(error: unknown): never {
  if (!(error instanceof AxiosError)) {
    throw new AuthenticationError(
      undefined,
      'Error al intentar iniciar sesión'
    );
  }

  const statusCode = error.response?.status;

  switch (statusCode) {
    case 401:
      throw new AuthenticationError(
        statusCode,
        'Usuario o contraseña incorrectos'
      );

    case 400:
      throw new AuthenticationError(
        statusCode,
        'Datos de inicio de sesión inválidos'
      );

    default:
      throw new AuthenticationError(
        statusCode,
        extractErrorMessage(error, 'Error al intentar iniciar sesión')
      );
  }
}

// ============================================================================
// SERVICIO DE AUTENTICACIÓN
// ============================================================================

/**
 * Servicio de autenticación
 *
 * Maneja todas las operaciones relacionadas con autenticación:
 * - Inicio de sesión
 * - Cierre de sesión
 * - Refresh de token
 * - Recuperación y restablecimiento de contraseña
 */
class AuthService {
  /**
   * Inicia sesión con credenciales de usuario
   *
   * @param credentials - Credenciales de inicio de sesión
   * @returns Token de autenticación
   * @throws AuthenticationError si falla la autenticación
   */
  async login(credentials: LoginCredentials): Promise<string> {
    try {
      const response = await axiosInstance.post<AuthTokenResponse>(
        '/login',
        credentials
      );

      validateTokenResponse(response);

      const token = response.data.token;
      persistToken(token);
      toast.success('Inicio de sesión exitoso');

      return token;
    } catch (error) {
      if (error instanceof AuthenticationError) {
        toast.error(error.message);
        throw error;
      }

      handleAuthenticationError(error);
    }
  }

  /**
   * Cierra la sesión del usuario actual
   *
   * @throws Error si la solicitud al servidor falla
   */
  async logout(): Promise<void> {
    try {
      await axiosInstance.post('/logout');
      clearStoredToken();
      toast.success('Cierre de sesión exitoso');
    } catch (error) {
      // Log del error para debugging pero no lanzamos excepción
      // El logout local siempre se ejecuta
      console.error('Error durante logout:', error);
      clearStoredToken();
      toast.error('Error al cerrar sesión');
    }
  }

  /**
   * Refresca el token de autenticación actual
   *
   * @returns Nuevo token de autenticación
   * @throws Error si el refresh falla
   */
  async refreshToken(): Promise<string> {
    try {
      const response =
        await axiosInstance.post<AuthTokenResponse>('/refresh-token');

      validateTokenResponse(response);

      return response.data.token;
    } catch (error) {
      console.error('Error al refrescar token:', error);

      const message = extractErrorMessage(error, 'Error al refrescar el token');

      throw new AuthenticationError(
        error instanceof AxiosError ? error.response?.status : undefined,
        message
      );
    }
  }

  /**
   * Solicita la recuperación de contraseña
   *
   * @param email - Email del usuario
   * @throws Error si la solicitud falla
   */
  async requestPasswordRecovery(email: string): Promise<void> {
    try {
      await axiosInstance.post('/forgot-password', { email });
    } catch (error) {
      console.error('Error al solicitar recuperación de contraseña:', error);

      const message = extractErrorMessage(
        error,
        'Error al solicitar la recuperación de contraseña'
      );

      throw new Error(message);
    }
  }

  /**
   * Restablece la contraseña usando un token de recuperación
   *
   * @param resetToken - Token de recuperación
   * @param newPassword - Nueva contraseña
   * @throws Error si el reset falla
   */
  async resetPassword(resetToken: string, newPassword: string): Promise<void> {
    try {
      await axiosInstance.post('/reset-password', {
        token: resetToken,
        newPassword
      });

      toast.success('Contraseña restablecida exitosamente');
    } catch (error) {
      if (!(error instanceof AxiosError)) {
        throw new Error('Error al restablecer la contraseña');
      }

      const statusCode = error.response?.status;
      let errorMessage = 'Error al restablecer la contraseña';

      switch (statusCode) {
        case 400:
          errorMessage = 'Token inválido o expirado';
          break;

        case 404:
          errorMessage = 'Token no encontrado';
          break;

        default:
          errorMessage = extractErrorMessage(
            error,
            'Error al restablecer la contraseña'
          );
      }

      toast.error(errorMessage);
      throw new Error(errorMessage);
    }
  }
}

// Exportar instancia singleton
export const authService = new AuthService();
