// src/contexts/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect } from "react";
import { authService } from "../services/authService";
import { useNavigate } from "react-router";
import { jwtDecode } from 'jwt-decode'

export interface UserData {
  id: string
  username: string
  role: string
  profileId: string
  fullName: string
}

interface AuthContextType {
  isAuthenticated: boolean
  user: UserData | null
  login: (usuario: string, contrasena: string) => Promise<void>
  logout: () => Promise<void>
  loading: boolean
  error: string | null
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()

  const parseUserFromToken = (token: string): UserData => {
    try {
      const decoded = jwtDecode<{
        sub: string
        name: string
        NombreUsuario: string
        role: string
        exp: number
        iss: string
        aud: string
      }>(token)

      return {
        id: decoded.sub,
        username: decoded.name,
        role: decoded.role,
        profileId: decoded.sub,
        fullName: decoded.NombreUsuario,
      }
    } catch (error) {
      console.error('Error al decodificar el token:', error)
      throw new Error('Token inválido')
    }
  }

  useEffect(() => {
    // Verificar si hay un token almacenado al cargar la aplicación
    const token = localStorage.getItem('token')
    if (token) {
      try {
        const userData = parseUserFromToken(token)
        setUser(userData)
      } catch (error) {
        // Si hay un error al decodificar, limpiar el token
        localStorage.removeItem('token')
      }
    }
    setLoading(false)
  }, [])

  const login = async (usuario: string, contrasena: string) => {
    try {
      setLoading(true)
      setError(null)
      const token = await authService.login({ usuario, contrasena })

      // Guardar token y datos del usuario
      localStorage.setItem('token', token)
      const userData = parseUserFromToken(token)
      setUser(userData)

      navigate('/dashboard') // Redirigir al dashboard después del login
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
      throw err
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    try {
      setLoading(true)
      await authService.logout()
      localStorage.removeItem('token')
      setUser(null)
      navigate('/auth/login') // Redirigir al login después del logout
    } catch (err) {
      console.error('Error al cerrar sesión:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: !!user,
        user,
        login,
        logout,
        loading,
        error,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth debe ser usado dentro de un AuthProvider");
  }
  return context;
};
