import { jwtDecode } from 'jwt-decode';

import React, { createContext, useContext, useEffect, useState } from 'react';

import { useNavigate } from 'react-router';

import { authService } from '../services/authService';

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
    redirectTo?: string
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
      const isValid = decoded.exp > currentTime;
      return isValid;
    } catch (error) {
      console.warn('Token inválido o mal formateado:', error);
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
        const token = localStorage.getItem('token');

        if (token) {
          const isValid = isTokenValid(token);

          if (isValid) {
            const userData = parseUserFromToken(token);
            setUser(userData);
          } else {
            // Token expirado o inválido
            localStorage.removeItem('token');
            console.warn(
              'Token expirado o inválido, removido del localStorage'
            );
          }
        } else {
          console.log('No hay token en localStorage');
          setUser(null);
        }
      } catch (error) {
        console.error('Error al inicializar autenticación:', error);
        localStorage.removeItem('token');
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    // Escuchar cambios en localStorage de otras pestañas
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'token') {
        if (event.newValue === null) {
          setUser(null);
          navigate('/session-expired');
        } else if (event.newValue && event.newValue !== event.oldValue) {
          try {
            if (isTokenValid(event.newValue)) {
              const userData = parseUserFromToken(event.newValue);
              setUser(userData);
            }
          } catch (error) {
            console.error('Error al procesar token de otra pestaña:', error);
          }
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [navigate]);

  const login = async (
    usuario: string,
    contrasena: string,
    redirectTo?: string
  ) => {
    try {
      setLoading(true);
      setError(null);
      const token = await authService.login({ usuario, contrasena });

      // Verificar que el token recibido es válido antes de guardarlo
      if (!token || token.trim() === '') {
        throw new Error('Token vacío recibido del servidor');
      }

      // Intentar validar el token, pero no fallar si hay problemas menores
      try {
        const isValid = isTokenValid(token);
        if (!isValid) {
          console.warn(
            'Token posiblemente inválido, pero continuando con el login'
          );
        }
      } catch (validationError) {
        console.warn(
          'Error al validar token, pero continuando:',
          validationError
        );
      }

      // Guardar token y datos del usuario
      localStorage.setItem('token', token);
      const userData = parseUserFromToken(token);
      setUser(userData);

      // Redirigir al dashboard o a la página específica después del login
      navigate(redirectTo || '/dashboard');
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
      // Limpiar cualquier token residual en caso de error
      localStorage.removeItem('token');
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
      localStorage.removeItem('token');
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
