// src/services/authService.ts
import axiosInstance from './axiosConfig'
import { AxiosError } from 'axios'
import { toast } from 'sonner'

// Usar una URL hardcodeada si la variable de entorno no está disponible
const API_URL = import.meta.env.VITE_API_URL

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
      const response = await axiosInstance.post<LoginResponse>(
        '/login',
        credentials,
      )
      localStorage.setItem('token', response.data.token)
      toast.success('Inicio de sesión exitoso')
      return response.data.token
    } catch (error) {
      if (error instanceof AxiosError) {
        if (error.response?.status === 401) {
          toast.error('Usuario o contraseña incorrectos')
          throw new Error('Usuario o contraseña incorrectos')
        }
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
      localStorage.removeItem('token')
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
