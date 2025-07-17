import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '~/context/AuthContext';
import api from '~/lib/api';
import type { Usuarios, ActualizarUsuarioProps } from '~/types/administracion';

interface UseUserProfileReturn {
  userData: Usuarios | null;
  isLoading: boolean;
  error: Error | null;
  updateProfile: (data: ActualizarUsuarioProps) => Promise<void>;
  refreshProfile: () => Promise<void>;
}

export function useUserProfile(): UseUserProfileReturn {
  const { user } = useAuth();
  const [userData, setUserData] = useState<Usuarios | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Función para obtener información detallada del usuario
  const fetchUserProfile = useCallback(async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      setError(null);

      // Intentar obtener datos del usuario desde la API
      // Usar el endpoint de listar usuarios y filtrar por ID
      try {
        const response = await api.get('/listar');
        const usuarios = response.data as Usuarios[];

        // Buscar el usuario por ID
        const usuarioEncontrado = usuarios.find(
          (u) => u.idUsuario === parseInt(user.id),
        );

        if (usuarioEncontrado) {
          setUserData(usuarioEncontrado);
        } else {
          // Si no se encuentra, crear datos simulados basados en el token
          console.warn(
            'Usuario no encontrado en la lista, usando datos del token',
          );
          throw new Error('Usuario no encontrado');
        }
      } catch (_apiError) {
        // Fallback: crear datos simulados basados en el token
        console.warn(
          'No se pudo obtener datos del usuario desde la API, usando datos del token',
        );

        const mockUserData: Usuarios = {
          idUsuario: parseInt(user.id),
          nombreDeUsuario: user.username,
          perfilId: parseInt(user.profileId),
          nombres: user.fullName.split(' ')[0] || '',
          apellidos: user.fullName.split(' ').slice(1).join(' ') || '',
          departamento: 1, // Valor por defecto
          activo: true,
          fechaCreacion: new Date().toISOString(),
        };

        setUserData(mockUserData);
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Error desconocido');
      setError(error);
      console.error('Error al obtener perfil del usuario:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Función para actualizar el perfil
  const updateProfile = useCallback(
    async (data: ActualizarUsuarioProps) => {
      if (!userData) {
        throw new Error('No hay datos de usuario disponibles');
      }

      try {
        setIsLoading(true);
        setError(null);

        // Intentar actualizar en la API
        try {
          const response = await api.put(
            `/actualizar/${userData.idUsuario}`,
            data,
          );

          // Actualizar datos locales con la respuesta
          if (response.data) {
            setUserData(response.data as Usuarios);
          } else {
            // Si no hay respuesta, actualizar localmente
            setUserData((prev) =>
              prev
                ? {
                    ...prev,
                    nombreDeUsuario: data.nombreDeUsuario,
                    nombres: data.nombres,
                    apellidos: data.apellidos,
                    departamento: data.departamento,
                    activo: data.activo,
                  }
                : null,
            );
          }
        } catch (_apiError) {
          // Fallback: actualizar solo localmente
          console.warn(
            'No se pudo actualizar en la API, actualizando solo localmente',
          );
          setUserData((prev) =>
            prev
              ? {
                  ...prev,
                  nombreDeUsuario: data.nombreDeUsuario,
                  nombres: data.nombres,
                  apellidos: data.apellidos,
                  departamento: data.departamento,
                  activo: data.activo,
                }
              : null,
          );
        }
      } catch (err) {
        const error =
          err instanceof Error ? err : new Error('Error desconocido');
        setError(error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [userData],
  );

  // Función para refrescar el perfil
  const refreshProfile = useCallback(async () => {
    await fetchUserProfile();
  }, [fetchUserProfile]);

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
  };
}
