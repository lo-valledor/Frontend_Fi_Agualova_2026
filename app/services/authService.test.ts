import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { toast } from 'sonner';
import { authService } from './authService';
import axiosInstance from './axiosConfig';

// Mock de axios
vi.mock('./axiosConfig', () => ({
  default: {
    post: vi.fn()
  }
}));

// Mock de sonner
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn()
  }
}));

describe('authService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('login', () => {
    it('debe iniciar sesión exitosamente y guardar el token', async () => {
      const mockToken = 'mock-jwt-token';
      const credentials = { usuario: 'testuser', contrasena: 'password123' };

      vi.mocked(axiosInstance.post).mockResolvedValueOnce({
        data: { token: mockToken }
      });

      const result = await authService.login(credentials);

      expect(axiosInstance.post).toHaveBeenCalledWith('/login', credentials);
      expect(localStorage.setItem).toHaveBeenCalledWith('token', mockToken);
      expect(toast.success).toHaveBeenCalledWith('Inicio de sesión exitoso');
      expect(result).toBe(mockToken);
    });

    it('debe lanzar error si no se recibe token', async () => {
      const credentials = { usuario: 'testuser', contrasena: 'password123' };

      vi.mocked(axiosInstance.post).mockResolvedValueOnce({
        data: {}
      });

      await expect(authService.login(credentials)).rejects.toThrow(
        'No se recibió token del servidor'
      );
    });

    it('debe manejar error 401 (credenciales incorrectas)', async () => {
      const credentials = { usuario: 'testuser', contrasena: 'wrongpass' };

      vi.mocked(axiosInstance.post).mockRejectedValueOnce({
        isAxiosError: true,
        response: { status: 401 }
      });

      await expect(authService.login(credentials)).rejects.toThrow(
        'Usuario o contraseña incorrectos'
      );
      expect(toast.error).toHaveBeenCalledWith(
        'Usuario o contraseña incorrectos'
      );
    });

    it('debe manejar errores de red', async () => {
      const credentials = { usuario: 'testuser', contrasena: 'password123' };

      vi.mocked(axiosInstance.post).mockRejectedValueOnce({
        isAxiosError: true,
        response: { status: 500, data: 'Error del servidor' }
      });

      await expect(authService.login(credentials)).rejects.toThrow(
        'Error del servidor'
      );
    });

    it('debe manejar errores genéricos', async () => {
      const credentials = { usuario: 'testuser', contrasena: 'password123' };

      vi.mocked(axiosInstance.post).mockRejectedValueOnce(
        new Error('Network error')
      );

      await expect(authService.login(credentials)).rejects.toThrow(
        'Error al intentar iniciar sesión'
      );
    });
  });

  describe('logout', () => {
    it('debe cerrar sesión exitosamente y limpiar el token', async () => {
      localStorage.setItem('token', 'mock-token');

      vi.mocked(axiosInstance.post).mockResolvedValueOnce({});

      await authService.logout();

      expect(axiosInstance.post).toHaveBeenCalledWith('/logout');
      expect(localStorage.removeItem).toHaveBeenCalledWith('token');
      expect(toast.success).toHaveBeenCalledWith('Cierre de sesión exitoso');
    });

    it('debe manejar errores al cerrar sesión', async () => {
      vi.mocked(axiosInstance.post).mockRejectedValueOnce(
        new Error('Network error')
      );

      await authService.logout();

      expect(toast.error).toHaveBeenCalledWith('Error al cerrar sesión');
    });
  });

  describe('refreshToken', () => {
    it('debe refrescar el token exitosamente', async () => {
      const newToken = 'new-mock-token';

      vi.mocked(axiosInstance.post).mockResolvedValueOnce({
        data: { token: newToken }
      });

      const result = await authService.refreshToken();

      expect(axiosInstance.post).toHaveBeenCalledWith('/refresh-token');
      expect(result).toBe(newToken);
    });

    it('debe lanzar error si falla el refresh', async () => {
      vi.mocked(axiosInstance.post).mockRejectedValueOnce(
        new Error('Refresh failed')
      );

      await expect(authService.refreshToken()).rejects.toThrow(
        'Error al refrescar el token'
      );
    });
  });

  describe('forgotPassword', () => {
    it('debe enviar solicitud de recuperación de contraseña', async () => {
      const email = 'test@example.com';

      vi.mocked(axiosInstance.post).mockResolvedValueOnce({});

      await authService.forgotPassword(email);

      expect(axiosInstance.post).toHaveBeenCalledWith('/forgot-password', {
        email
      });
    });

    it('debe lanzar error si falla la solicitud', async () => {
      const email = 'test@example.com';

      vi.mocked(axiosInstance.post).mockRejectedValueOnce(
        new Error('Request failed')
      );

      await expect(authService.forgotPassword(email)).rejects.toThrow(
        'Error al solicitar la recuperación de contraseña'
      );
    });
  });

  describe('resetPassword', () => {
    it('debe restablecer la contraseña exitosamente', async () => {
      const token = 'reset-token';
      const newPassword = 'newPassword123';

      vi.mocked(axiosInstance.post).mockResolvedValueOnce({});

      await authService.resetPassword(token, newPassword);

      expect(axiosInstance.post).toHaveBeenCalledWith('/reset-password', {
        token,
        newPassword
      });
      expect(toast.success).toHaveBeenCalledWith(
        'Contraseña restablecida exitosamente'
      );
    });

    it('debe manejar token inválido (400)', async () => {
      const token = 'invalid-token';
      const newPassword = 'newPassword123';

      vi.mocked(axiosInstance.post).mockRejectedValueOnce({
        isAxiosError: true,
        response: { status: 400 }
      });

      await expect(
        authService.resetPassword(token, newPassword)
      ).rejects.toThrow('Token inválido o expirado');
      expect(toast.error).toHaveBeenCalledWith('Token inválido o expirado');
    });

    it('debe manejar token no encontrado (404)', async () => {
      const token = 'not-found-token';
      const newPassword = 'newPassword123';

      vi.mocked(axiosInstance.post).mockRejectedValueOnce({
        isAxiosError: true,
        response: { status: 404 }
      });

      await expect(
        authService.resetPassword(token, newPassword)
      ).rejects.toThrow('Token no encontrado');
      expect(toast.error).toHaveBeenCalledWith('Token no encontrado');
    });

    it('debe manejar mensajes de error personalizados', async () => {
      const token = 'reset-token';
      const newPassword = 'weak';
      const errorMessage = 'La contraseña es muy débil';

      vi.mocked(axiosInstance.post).mockRejectedValueOnce({
        isAxiosError: true,
        response: { status: 400, data: { message: errorMessage } }
      });

      await expect(
        authService.resetPassword(token, newPassword)
      ).rejects.toThrow(errorMessage);
      expect(toast.error).toHaveBeenCalledWith(errorMessage);
    });

    it('debe manejar errores genéricos', async () => {
      const token = 'reset-token';
      const newPassword = 'newPassword123';

      vi.mocked(axiosInstance.post).mockRejectedValueOnce(
        new Error('Network error')
      );

      await expect(
        authService.resetPassword(token, newPassword)
      ).rejects.toThrow('Error al restablecer la contraseña');
      expect(toast.error).toHaveBeenCalledWith(
        'Error al restablecer la contraseña'
      );
    });
  });
});
