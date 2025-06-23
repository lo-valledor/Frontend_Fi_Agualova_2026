// src/services/authService.ts
import axiosInstance from './axiosConfig'
import { AxiosError } from 'axios'
import { toast } from 'sonner'

interface LoginDto {
  usuario: string
  contrasena: string
}

interface LoginResponse {
  token: string
}

export const authService = {
  login: async (credentials: LoginDto): Promise<string> => {
    try {
      //console.log('Intentando login con:', { usuario: credentials.usuario });
      const response = await axiosInstance.post<LoginResponse>(
        '/login',
        credentials,
      )
      //console.log('Respuesta del servidor:', response.status, response.data);
      
      if (!response.data?.token) {
        throw new Error('No se recibió token del servidor');
      }
      
      sessionStorage.setItem('token', response.data.token)
      toast.success('Inicio de sesión exitoso')
      return response.data.token
    } catch (error) {
      console.error('Error en authService.login:', error);
      if (error instanceof AxiosError) {
        if (error.response?.status === 401) {
          toast.error('Usuario o contraseña incorrectos')
          throw new Error('Usuario o contraseña incorrectos')
        }
        console.error('Error response:', error.response?.data);
        throw new Error(
          error.response?.data || 'Error al intentar iniciar sesión',
        )
      }
      throw new Error('Error al intentar iniciar sesión')
    }
  },

  logout: async (): Promise<void> => {
    try {
      await axiosInstance.post('/logout')
      sessionStorage.removeItem('token')
      toast.success('Cierre de sesión exitoso')
      // No podemos usar navigate aquí, la redirección debe hacerse en el componente
    } catch (error) {
      toast.error('Error al cerrar sesión')
      console.error('Error al cerrar sesión:', error)
    }
  },

  refreshToken: async (): Promise<string> => {
    try {
      const response = await axiosInstance.post<LoginResponse>(
        '/refresh-token',
      )
      return response.data.token
    } catch (error) {
      if (error instanceof AxiosError) {
        console.error('Error al refrescar el token:', error.response?.data)
      }
      throw new Error('Error al refrescar el token')
    }
  },
}
