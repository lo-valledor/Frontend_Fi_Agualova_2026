import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '~/context/AuthContext';
import { userService } from '~/services/userService';
import type { Usuarios, ActualizarUsuarioProps } from '~/types/administracion';

interface UseUserProfileSimpleReturn {
  userData: Usuarios | null;
  isLoading: boolean;
  error: string | null;
  updateProfile: (data: ActualizarUsuarioProps) => Promise<void>;
  refreshProfile: () => Promise<void>;
  clearCache: () => void;
}

export function useUserProfileSimple(): UseUserProfileSimpleReturn {
  const { user } = useAuth();
  const [userData, setUserData] = useState<Usuarios | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Función para obtener el perfil del usuario
  const fetchUserProfile = useCallback(async (_forceRefresh = false) => {
    if (!user) return;

    try {
      setIsLoading(true);
      setError(null);

      // Intentar obtener datos del usuario usando el servicio
      const response = await userService.getUserById(user.id);

      if (response.error) {
        // Si hay error, crear datos simulados
        console.warn('Error al obtener usuario:', response.error);
        const mockUserData = userService.createMockUserData(user);
        setUserData(mockUserData);
      } else {
        setUserData(response.data);
      }
      } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
      console.error('Error al obtener perfil del usuario:', errorMessage);

      // Fallback: crear datos simulados
      if (user) {
        const mockUserData = userService.createMockUserData(user);
        setUserData(mockUserData);
      }
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Función para actualizar el perfil
  const updateProfile = useCallback(async (data: ActualizarUsuarioProps) => {
    if (!userData) {
      throw new Error('No hay datos de usuario disponibles');
    }

    try {
      setIsLoading(true);
      setError(null);

      const response = await userService.updateUser(userData.idUsuario, data);

      if (response.error) {
        // Si hay error en la API, actualizar localmente
        console.warn('Error al actualizar en API:', response.error);
        const updatedUserData = {
          ...userData,
          nombreDeUsuario: data.nombreDeUsuario,
          nombres: data.nombres,
          apellidos: data.apellidos,
          departamento: data.departamento,
          activo: data.activo,
        };
        setUserData(updatedUserData);
      } else {
        setUserData(response.data);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [userData]);

  // Función para refrescar el perfil
  const refreshProfile = useCallback(async () => {
    await fetchUserProfile(true);
  }, [fetchUserProfile]);

  // Función para limpiar caché
  const clearCache = useCallback(() => {
    userService.clearCache();
  }, []);

  // Cargar datos del usuario al montar el componente
  useEffect(() => {
    fetchUserProfile();
  }, [fetchUserProfile]);

  return {
    userData,
    isLoading,
    error,
    updateProfile,
    refreshProfile,
    clearCache,
  };
}
