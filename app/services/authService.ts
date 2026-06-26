import { AxiosError } from 'axios';
import { toast } from 'sonner';

import axiosInstance, { clearAuthToken, setAuthToken } from './axiosConfig';

// ============================================================================
// TIPOS
// ============================================================================

interface LoginCredentials {
  email: string;
  password: string;
}

interface AuthTokenResponse {
  token: string;
}

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

function extractErrorMessage(error: unknown, defaultMessage: string): string {
  if (error instanceof AxiosError) {
    const axiosError = error as AxiosError;
    if (
      typeof axiosError.response?.data === 'object' &&
      axiosError.response?.data !== null
    ) {
      const data = axiosError.response.data as Record<string, unknown>;
      if (typeof data.message === 'string') {
        return data.message;
      }
    }

    if (typeof axiosError.response?.data === 'string') {
      return axiosError.response.data;
    }
  }

  return defaultMessage;
}

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

function persistToken(token: string): void {
  setAuthToken(token);
}

function clearStoredToken(): void {
  clearAuthToken();
}

function handleAuthenticationError(error: unknown): never {
  if (!(error instanceof AxiosError)) {
    throw new AuthenticationError(
      undefined,
      'Error al intentar iniciar sesión'
    );
  }

  const axiosError = error as AxiosError;
  const statusCode = axiosError.response?.status;

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

class AuthService {
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

  async refreshToken(): Promise<string> {
    try {
      const response =
        await axiosInstance.post<AuthTokenResponse>('/refresh-token');

      validateTokenResponse(response);

      return response.data.token;
    } catch (error) {
      console.error('Error al refrescar token:', error);

      const message = extractErrorMessage(error, 'Error al refrescar el token');
      const statusCode =
        error instanceof AxiosError
          ? (error as AxiosError).response?.status
          : undefined;

      throw new AuthenticationError(statusCode, message);
    }
  }

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

  async forgotPassword(email: string): Promise<void> {
    return this.requestPasswordRecovery(email);
  }

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

      const axiosError = error as AxiosError;
      const statusCode = axiosError.response?.status;
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
