// src/contexts/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';
import { useNavigate } from 'react-router';
import { jwtDecode } from 'jwt-decode';

export interface UserData {
  id: string;
  username: string;
  role: string;
  profileId: string;
  fullName: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: UserData | null;
  login: (
    usuario: string,
    contrasena: string,
    redirectTo?: string,
  ) => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const isTokenValid = (token: string): boolean => {
    try {
      const decoded = jwtDecode<{ exp: number }>(token);
      const currentTime = Date.now() / 1000;
      return decoded.exp > currentTime;
    } catch {
      return false;
    }
  };

  const parseUserFromToken = (token: string): UserData => {
    try {
      const decoded = jwtDecode<{
        sub: string;
        name: string;
        NombreUsuario: string;
        role: string;
        exp: number;
        iss: string;
        aud: string;
      }>(token);

      return {
        id: decoded.sub,
        username: decoded.name,
        role: decoded.role,
        profileId: decoded.sub,
        fullName: decoded.NombreUsuario,
      };
    } catch (error) {
      console.error('Error al decodificar el token:', error);
      throw new Error('Token inválido');
    }
  };

  useEffect(() => {
    // Verificar si hay un token almacenado al cargar la aplicación
    const initializeAuth = async () => {
      try {
        const token = sessionStorage.getItem('token');
        if (token && isTokenValid(token)) {
          const userData = parseUserFromToken(token);
          setUser(userData);
        } else if (token) {
          // Token expirado o inválido
          sessionStorage.removeItem('token');
          console.warn(
            'Token expirado o inválido, removido del sessionStorage',
          );
        }
      } catch (error) {
        console.error('Error al inicializar autenticación:', error);
        sessionStorage.removeItem('token');
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (
    usuario: string,
    contrasena: string,
    redirectTo?: string,
  ) => {
    try {
      setLoading(true);
      setError(null);
      const token = await authService.login({ usuario, contrasena });

      // Verificar que el token recibido es válido antes de guardarlo
      if (!isTokenValid(token)) {
        throw new Error('Token recibido inválido');
      }

      // Guardar token y datos del usuario
      sessionStorage.setItem('token', token);
      const userData = parseUserFromToken(token);
      setUser(userData);

      // Redirigir al dashboard o a la página específica después del login
      navigate(redirectTo || '/dashboard');
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
      // Limpiar cualquier token residual en caso de error
      sessionStorage.removeItem('token');
      setUser(null);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      await authService.logout();
    } catch (err) {
      console.error('Error al cerrar sesión:', err);
    } finally {
      // Siempre limpiar la sesión local, incluso si hay error en el servidor
      sessionStorage.removeItem('token');
      setUser(null);
      setError(null);
      setLoading(false);
      navigate('/auth/login'); // Redirigir al login después del logout
    }
  };

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
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};
