/**
 * User Profile Hook
 *
 * Provides a hook for loading and updating user profile data.
 * Includes error handling and fallback mechanisms for offline or API unavailability scenarios.
 *
 * The hook attempts to fetch user data from the API, but gracefully falls back
 * to creating mock data from the authentication token if the API is unavailable.
 */

import { useCallback, useEffect, useState } from 'react';

import { useAuth } from '~/context/AuthContext';
import api from '~/lib/api';
import type { ActualizarUsuarioProps, Usuarios } from '~/types/administracion';

/**
 * Return type for useUserProfile hook
 */
interface UseUserProfileReturn {
  userData: Usuarios | null;
  isLoading: boolean;
  error: Error | null;
  updateProfile: (data: ActualizarUsuarioProps) => Promise<void>;
  refreshProfile: () => Promise<void>;
}

/**
 * Creates mock user data from authenticated user token
 *
 * Used as fallback when API is unavailable or user is not found in database.
 *
 * @param user - Authenticated user from token
 * @param user.id
 * @param user.username
 * @param user.profileId
 * @param user.fullName
 * @returns Mock user data
 */
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

/**
 * Hook for loading and updating user profile
 *
 * Fetches detailed user profile information from the API and provides
 * functions to update and refresh the profile. Includes graceful fallback
 * to token-based data if API is unavailable.
 *
 * Features:
 * - Automatic loading on mount
 * - Fallback to token data if API fails
 * - Profile update with optimistic updates
 * - Manual refresh capability
 *
 * @returns {UseUserProfileReturn} Hook state and profile operations
 *
 * @example
 * ```tsx
 * const {
 *   userData,
 *   isLoading,
 *   error,
 *   updateProfile,
 *   refreshProfile
 * } = useUserProfile();
 *
 * if (isLoading) return <Loading />;
 * if (error) return <Error message={error.message} />;
 * if (!userData) return null;
 *
 * return (
 *   <ProfileForm
 *     userData={userData}
 *     onSubmit={updateProfile}
 *   />
 * );
 * ```
 *
 * @example
 * ```tsx
 * // Update user profile
 * const { updateProfile } = useUserProfile();
 *
 * const handleSubmit = async (formData) => {
 *   try {
 *     await updateProfile({
 *       nombreDeUsuario: formData.username,
 *       nombres: formData.firstName,
 *       apellidos: formData.lastName,
 *       departamento: formData.department,
 *       activo: true
 *     });
 *     toast.success('Profile updated successfully');
 *   } catch (error) {
 *     toast.error('Failed to update profile');
 *   }
 * };
 * ```
 */
export function useUserProfile(): UseUserProfileReturn {
  const { user } = useAuth();
  const [userData, setUserData] = useState<Usuarios | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  /**
   * Fetches user profile from API or creates fallback from token
   */
  const fetchUserProfile = useCallback(async (): Promise<void> => {
    // Early return if no authenticated user
    if (!user) {
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Fetch user list and find current user
      const response = await api.get('/listar');
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

  /**
   * Updates user profile
   *
   * Attempts to update via API, falls back to local update only if API fails.
   * Throws error on failure for the caller to handle.
   *
   * @param data - Profile data to update
   * @throws Error if update fails
   */
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

  /**
   * Refreshes user profile from API
   */
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
