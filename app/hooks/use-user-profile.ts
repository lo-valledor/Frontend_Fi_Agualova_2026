import { useCallback, useEffect, useState } from 'react';

import { useAuth } from '~/context/AuthContext';
import api from '~/lib/api';
import type { ActualizarUsuarioProps, Usuarios } from '~/types/administracion';


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
  const nombres = nameParts[0] || '';
  const apellidos = nameParts.slice(1).join(' ') || '';

  return {
    idUsuario: Number.parseInt(user.id),
    nombreDeUsuario: user.username,
    perfilId: Number.parseInt(user.profileId),
    nombres,
    apellidos,
    departamento: 1, // Default value
    activo: true,
    fechaCreacion: new Date().toISOString(),
    email: null,
    roles: []
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

      const usuarioEncontrado = usuarios.find(
        u => u.idUsuario === Number.parseInt(user.id)
      );

      if (usuarioEncontrado) {
        setUserData(usuarioEncontrado);
      } else {
        // User not found in database, create mock data
        console.warn(
          'Usuario no encontrado en la lista, usando datos del token'
        );
        throw new Error('Usuario no encontrado');
      }
    } catch (apiError) {
      // Fallback: create mock data from token
      console.warn(
        'No se pudo obtener datos del usuario desde la API, usando datos del token',
        apiError
      );

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
        const response = await api.put(
          `/actualizar/${userData.idUsuario}`,
          data
        );

        // Update with API response if available
        if (response.data) {
          setUserData(response.data as Usuarios);
        } else {
          // Fallback: update locally
          setUserData(prev =>
            prev
              ? {
                  ...prev,
                  nombreDeUsuario: data.nombreDeUsuario,
                  nombres: data.nombres,
                  apellidos: data.apellidos,
                  departamento: data.departamento,
                  activo: data.activo
                }
              : null
          );
        }
      } catch (apiError) {
        // Fallback: update locally only
        console.warn(
          'No se pudo actualizar en la API, actualizando solo localmente',
          apiError
        );

        setUserData(prev =>
          prev
            ? {
                ...prev,
                nombreDeUsuario: data.nombreDeUsuario,
                nombres: data.nombres,
                apellidos: data.apellidos,
                departamento: data.departamento,
                activo: data.activo
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
