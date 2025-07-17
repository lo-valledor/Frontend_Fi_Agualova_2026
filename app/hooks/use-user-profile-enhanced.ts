import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '~/context/AuthContext';
import api from '~/lib/api';
import type { Usuarios, ActualizarUsuarioProps } from '~/types/administracion';

interface UseUserProfileEnhancedReturn {
  userData: Usuarios | null;
  isLoading: boolean;
  error: Error | null;
  updateProfile: (data: ActualizarUsuarioProps) => Promise<void>;
  refreshProfile: () => Promise<void>;
  clearCache: () => void;
}

// Cache para evitar llamadas repetidas
const userProfileCache = new Map<
  string,
  { data: Usuarios; timestamp: number }
>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

export function useUserProfileEnhanced(): UseUserProfileEnhancedReturn {
  const { user } = useAuth();
  const [userData, setUserData] = useState<Usuarios | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Función para crear datos simulados del usuario
  const createMockUserData = useCallback((user: any): Usuarios => {
    const nameParts = user.fullName.split(' ');
    return {
      idUsuario: parseInt(user.id),
      nombreDeUsuario: user.username,
      perfilId: parseInt(user.profileId),
      nombres: nameParts[0] || '',
      apellidos: nameParts.slice(1).join(' ') || '',
      departamento: 1, // Valor por defecto
      activo: true,
      fechaCreacion: new Date().toISOString(),
    };
  }, []);

  // Función para obtener información detallada del usuario
  const fetchUserProfile = useCallback(
    async (forceRefresh = false) => {
      if (!user) return;

      const userId = user.id;
      const cacheKey = `user_${userId}`;

      // Verificar caché
      if (!forceRefresh && userProfileCache.has(cacheKey)) {
        const cached = userProfileCache.get(cacheKey)!;
        if (Date.now() - cached.timestamp < CACHE_DURATION) {
          setUserData(cached.data);
          return;
        }
      }

      try {
        setIsLoading(true);
        setError(null);

        // Cancelar llamada anterior si existe
        if (abortControllerRef.current) {
          abortControllerRef.current.abort();
        }

        abortControllerRef.current = new AbortController();

        // Intentar obtener datos del usuario desde la API
        try {
          const response = await api.get('/listar', {
            signal: abortControllerRef.current.signal,
          });

          const usuarios = response.data as Usuarios[];

          // Buscar el usuario por ID
          const usuarioEncontrado = usuarios.find(
            (u) => u.idUsuario === parseInt(userId),
          );

          if (usuarioEncontrado) {
            // Guardar en caché
            userProfileCache.set(cacheKey, {
              data: usuarioEncontrado,
              timestamp: Date.now(),
            });

            setUserData(usuarioEncontrado);
          } else {
            // Si no se encuentra, crear datos simulados
            console.warn(
              'Usuario no encontrado en la lista, usando datos del token',
            );
            throw new Error('Usuario no encontrado en la base de datos');
          }
        } catch (apiError: any) {
          // Si es un error de aborto, no hacer nada
          if (apiError.name === 'AbortError') {
            return;
          }

          // Fallback: crear datos simulados basados en el token
          console.warn(
            'No se pudo obtener datos del usuario desde la API, usando datos del token:',
            apiError.message,
          );

          const mockUserData = createMockUserData(user);

          // Guardar en caché
          userProfileCache.set(cacheKey, {
            data: mockUserData,
            timestamp: Date.now(),
          });

          setUserData(mockUserData);
        }
      } catch (err) {
        const error =
          err instanceof Error ? err : new Error('Error desconocido');
        setError(error);
        console.error('Error al obtener perfil del usuario:', error);
      } finally {
        setIsLoading(false);
        abortControllerRef.current = null;
      }
    },
    [user, createMockUserData],
  );

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
            const updatedUserData = response.data as Usuarios;
            setUserData(updatedUserData);

            // Actualizar caché
            const cacheKey = `user_${userData.idUsuario}`;
            userProfileCache.set(cacheKey, {
              data: updatedUserData,
              timestamp: Date.now(),
            });
          } else {
            // Si no hay respuesta, actualizar localmente
            const updatedUserData = {
              ...userData,
              nombreDeUsuario: data.nombreDeUsuario,
              nombres: data.nombres,
              apellidos: data.apellidos,
              departamento: data.departamento,
              activo: data.activo,
            };

            setUserData(updatedUserData);

            // Actualizar caché
            const cacheKey = `user_${userData.idUsuario}`;
            userProfileCache.set(cacheKey, {
              data: updatedUserData,
              timestamp: Date.now(),
            });
          }
        } catch (apiError: any) {
          // Fallback: actualizar solo localmente
          console.warn(
            'No se pudo actualizar en la API, actualizando solo localmente:',
            apiError.message,
          );

          const updatedUserData = {
            ...userData,
            nombreDeUsuario: data.nombreDeUsuario,
            nombres: data.nombres,
            apellidos: data.apellidos,
            departamento: data.departamento,
            activo: data.activo,
          };

          setUserData(updatedUserData);

          // Actualizar caché
          const cacheKey = `user_${userData.idUsuario}`;
          userProfileCache.set(cacheKey, {
            data: updatedUserData,
            timestamp: Date.now(),
          });
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
    await fetchUserProfile(true); // Forzar refresh
  }, [fetchUserProfile]);

  // Función para limpiar caché
  const clearCache = useCallback(() => {
    userProfileCache.clear();
  }, []);

  // Cargar datos del usuario al montar el componente
  useEffect(() => {
    fetchUserProfile();

    // Cleanup: cancelar llamada pendiente al desmontar
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
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
