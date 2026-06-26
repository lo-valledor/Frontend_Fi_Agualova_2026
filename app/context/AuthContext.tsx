import React, { createContext, useContext, useEffect, useState } from 'react';

import { useNavigate } from 'react-router';
import { getAuthenticatedUser } from '~/utils/auth-utils';
import { authService } from '../services/authService';
import {
  clearAuthToken,
  getAuthToken,
  setAuthToken
} from '../services/axiosConfig';

export interface UserData {
  id: string;
  username: string;
  role: string;
  profileId: string;
  email: string;
  fullName: string;
  permisos: string[];
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: UserData | null;
  login: (
    email: string,
    password: string,
    redirectTo?: string
  ) => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children
}) => {
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const parseUserFromStoredToken = (): UserData => {
    const decoded = getAuthenticatedUser();

    if (!decoded) {
      throw new Error('Token inválido');
    }

    const username =
      decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'] ||
      '';
    const email =
      decoded[
        'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'
      ] || '';
    const role =
      decoded['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] ||
      '';

    return {
      id: decoded.uid || '',
      username,
      role,
      profileId: decoded.uid || '',
      email,
      fullName: username,
      permisos: decoded.Permiso || []
    };
  };

  useEffect(() => {
    // Verificar si hay un token almacenado al cargar la aplicación
    const initializeAuth = async () => {
      try {
        const token = getAuthToken();

        if (token) {
          if (getAuthenticatedUser()) {
            const userData = parseUserFromStoredToken();
            setUser(userData);
          } else {
            clearAuthToken();
            if (import.meta.env.DEV) {
              console.warn(
                'Token expirado o inválido, removido del localStorage'
              );
            }
          }
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('Error al inicializar la autenticación:', error);
        clearAuthToken();
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    // Escuchar cambios en localStorage de otras pestañas
    const handleStorageChange = async (event: StorageEvent) => {
      if (event.key === 'token') {
        if (event.newValue === null) {
          setUser(null);
          navigate('/session-expired');
        } else if (event.newValue && event.newValue !== event.oldValue) {
          try {
            if (getAuthenticatedUser()) {
              const userData = parseUserFromStoredToken();
              setUser(userData);
            }
          } catch (error) {
            console.error('Error al procesar el token actualizado:', error);
          }
        }
      }
    };

    globalThis.addEventListener('storage', handleStorageChange);

    return () => {
      globalThis.removeEventListener('storage', handleStorageChange);
    };
  }, [navigate]);

  const login = async (
    email: string,
    password: string,
    redirectTo?: string
  ) => {
    try {
      setLoading(true);
      setError(null);
      const token = await authService.login({ email, password });

      // Verificar que el token recibido es válido antes de guardarlo
      if (!token || token.trim() === '') {
        throw new Error('Token vacío recibido del servidor');
      }

      // Intentar validar el token, pero no fallar si hay problemas menores
      try {
        const authenticatedUser = getAuthenticatedUser();
        if (!authenticatedUser && import.meta.env.DEV) {
          console.warn(
            'Token posiblemente inválido, pero continuando con el login'
          );
        }
      } catch (validationError) {
        if (import.meta.env.DEV) {
          console.warn(
            'Error al validar token, pero continuando:',
            validationError
          );
        }
      }

      // Guardar token y datos del usuario
      setAuthToken(token);
      const userData = parseUserFromStoredToken();
      setUser(userData);

      // Redirigir al dashboard o a la página específica después del login
      navigate(redirectTo || '/dashboard');
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
      clearAuthToken();
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
      // Ignorar errores en el logout del servidor
      console.error('Error al hacer logout en el servidor:', err);
    } finally {
      // Siempre limpiar la sesión local, incluso si hay error en el servidor
      clearAuthToken();
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
        error
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
