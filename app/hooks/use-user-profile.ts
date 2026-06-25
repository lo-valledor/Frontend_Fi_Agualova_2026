import { useCallback, useEffect, useState } from 'react';

import { useAuth } from '~/context/AuthContext';
import api from '~/lib/api';
import type { Usuarios } from '~/types/administracion';

type ActualizarUsuarioProps = {
  username?: string;
  nombre?: string;
  apellido?: string;
  email?: string;
  contrasena?: string;
  nombres?: string;
  apellidos?: string;
  departamento?: number;
  activo?: boolean;
};

interface UseUserProfileReturn {
  userData: Usuarios | null;
  isLoading: boolean;
  error: Error | null;
  updateProfile: (data: ActualizarUsuarioProps) => Promise<void>;
  refreshProfile: () => Promise<void>;
}

function createMockUserData(user: {
  id: string;
  username: string;
  profileId: string;
  fullName: string;
}): Usuarios {
  const nameParts = user.fullName.split(' ');
  const nombre = nameParts[0] || '';
  const apellido = nameParts.slice(1).join(' ') || '';

  return {
    id: user.id,
    userName: user.username,
    normalizedUserName: user.username.toUpperCase(),
    email: '',
    normalizedEmail: '',
    emailConfirmed: false,
    passwordHash: '',
    securityStamp: '',
    concurrencyStamp: '',
    phoneNumber: null,
    phoneNumberConfirmed: false,
    twoFactorEnabled: false,
    lockoutEnd: null,
    lockoutEnabled: false,
    accessFailedCount: 0,
    nombre_Usuario: nombre,
    apellidos_Usuario: apellido
  };
}

export function useUserProfile(): UseUserProfileReturn {
  const { user } = useAuth();
  const [userData, setUserData] = useState<Usuarios | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchUserProfile = useCallback(async (): Promise<void> => {
    // Early return if no authenticated user
    if (!user) {
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Fetch user list and find current user
      const response = await api.get('/GetAllUsers');
      const usuarios = response.data as Usuarios[];

      const usuarioEncontrado = usuarios.find(u => u.id === user.id);

      if (usuarioEncontrado) {
        setUserData(usuarioEncontrado);
      } else {
        if (import.meta.env.DEV) {
          console.warn(
            'Usuario no encontrado en la lista, usando datos del token'
          );
        }
        throw new Error('Usuario no encontrado');
      }
    } catch (apiError) {
      if (import.meta.env.DEV) {
        console.warn(
          'No se pudo obtener datos del usuario desde la API, usando datos del token',
          apiError
        );
      }

      const mockUserData = createMockUserData(user);
      setUserData(mockUserData);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const updateProfile = useCallback(
    async (data: ActualizarUsuarioProps): Promise<void> => {
      // Early return if no user data loaded
      if (!userData) {
        throw new Error('No hay datos de usuario disponibles');
      }

      try {
        setIsLoading(true);
        setError(null);

        // Attempt API update
        const response = await api.put(`/actualizar/${userData.id}`, data);

        // Update with API response if available
        if (response.data) {
          setUserData(response.data as Usuarios);
        } else {
          // Fallback: update locally
          setUserData((prev): Usuarios | null =>
            prev
              ? {
                  ...prev,
                  userName: data.username ?? prev.userName,
                  normalizedUserName: (
                    data.username ?? prev.userName
                  ).toUpperCase(),
                  nombre_Usuario: data.nombre ?? prev.nombre_Usuario,
                  apellidos_Usuario: data.apellido ?? prev.apellidos_Usuario,
                  email: data.email ?? prev.email,
                  normalizedEmail: (data.email ?? prev.email).toUpperCase()
                }
              : null
          );
        }
      } catch (apiError) {
        if (import.meta.env.DEV) {
          console.warn(
            'No se pudo actualizar en la API, actualizando solo localmente',
            apiError
          );
        }

        setUserData((prev): Usuarios | null =>
          prev
            ? {
                ...prev,
                userName: data.username ?? prev.userName,
                normalizedUserName: (
                  data.username ?? prev.userName
                ).toUpperCase(),
                nombre_Usuario: data.nombre ?? prev.nombre_Usuario,
                apellidos_Usuario: data.apellido ?? prev.apellidos_Usuario,
                email: data.email ?? prev.email,
                normalizedEmail: (data.email ?? prev.email).toUpperCase()
              }
            : null
        );

        // Still throw error for caller to handle
        const profileError =
          apiError instanceof Error ? apiError : new Error('Error desconocido');
        setError(profileError);
        throw profileError;
      } finally {
        setIsLoading(false);
      }
    },
    [userData]
  );

  const refreshProfile = useCallback(async (): Promise<void> => {
    await fetchUserProfile();
  }, [fetchUserProfile]);

  // Load profile on mount
  useEffect(() => {
    fetchUserProfile();
  }, [fetchUserProfile]);

  return {
    userData,
    isLoading,
    error,
    updateProfile,
    refreshProfile
  };
}
