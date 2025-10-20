// src/services/authService.ts
import { AxiosError } from 'axios';
import { toast } from 'sonner';

import axiosInstance from './axiosConfig';

interface LoginDto {
  usuario: string;
  contrasena: string;
}

interface LoginResponse {
  token: string;
}

export const authService = {
  login: async (credentials: LoginDto): Promise<string> => {
    try {
      const response = await axiosInstance.post<LoginResponse>(
        '/login',
        credentials
      );

      if (!response.data?.token) {
        throw new Error('No se recibió token del servidor');
      }

      localStorage.setItem('token', response.data.token);
      toast.success('Inicio de sesión exitoso');
      return response.data.token;
    } catch (error) {
      if (error instanceof AxiosError) {
        if (error.response?.status === 401) {
          toast.error('Usuario o contraseña incorrectos');
          throw new Error('Usuario o contraseña incorrectos');
        }
        throw new Error(
          error.response?.data || 'Error al intentar iniciar sesión'
        );
      }
      throw new Error('Error al intentar iniciar sesión');
    }
  },

  logout: async (): Promise<void> => {
    try {
      await axiosInstance.post('/logout');
      localStorage.removeItem('token');
      toast.success('Cierre de sesión exitoso');
    } catch (_error) {
      toast.error('Error al cerrar sesión');
    }
  },

  refreshToken: async (): Promise<string> => {
    try {
      const response =
        await axiosInstance.post<LoginResponse>('/refresh-token');
      return response.data.token;
    } catch (_error) {
      throw new Error('Error al refrescar el token');
    }
  },

  forgotPassword: async (email: string): Promise<void> => {
    try {
      await axiosInstance.post('/forgot-password', { email });
    } catch (_error) {
      throw new Error('Error al solicitar la recuperación de contraseña');
    }
  },

  resetPassword: async (token: string, newPassword: string): Promise<void> => {
    try {
      await axiosInstance.post('/reset-password', {
        token,
        newPassword
      });
      toast.success('Contraseña restablecida exitosamente');
    } catch (error) {
      if (error instanceof AxiosError) {
        if (error.response?.status === 400) {
          toast.error('Token inválido o expirado');
          throw new Error('Token inválido o expirado');
        }
        if (error.response?.status === 404) {
          toast.error('Token no encontrado');
          throw new Error('Token no encontrado');
        }
        const errorMessage =
          error.response?.data?.message ||
          error.response?.data ||
          'Error al restablecer la contraseña';
        toast.error(errorMessage);
        throw new Error(errorMessage);
      }
      toast.error('Error al restablecer la contraseña');
      throw new Error('Error al restablecer la contraseña');
    }
  }
};
