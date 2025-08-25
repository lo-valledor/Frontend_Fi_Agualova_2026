import api from '~/lib/api';
import type { ActualizarUsuarioProps, Usuarios } from '~/types/administracion';

// Cache para usuarios
const userCache = new Map<string, { data: Usuarios; timestamp: number }>();
const CACHE_DURATION = 10 * 60 * 1000; // 10 minutos

export interface UserServiceResponse<T> {
  data: T | null;
  error: string | null;
  fromCache: boolean;
}

class UserService {
  /**
   * Obtiene todos los usuarios
   */
  async getAllUsers(): Promise<UserServiceResponse<Usuarios[]>> {
    try {
      const response = await api.get('/listar');
      return {
        data: response.data as Usuarios[],
        error: null,
        fromCache: false
      };
    } catch (error: any) {
      return {
        data: null,
        error: error.message || 'Error al obtener usuarios',
        fromCache: false
      };
    }
  }

  /**
   * Obtiene un usuario específico por ID
   */
  async getUserById(
    userId: string | number
  ): Promise<UserServiceResponse<Usuarios>> {
    if (!userId) {
      return {
        data: null,
        error: 'ID de usuario es requerido',
        fromCache: false
      };
    }

    const userIdStr = userId.toString();
    const cacheKey = `user_${userIdStr}`;

    // Verificar caché
    if (userCache.has(cacheKey)) {
      const cached = userCache.get(cacheKey)!;
      if (Date.now() - cached.timestamp < CACHE_DURATION) {
        return {
          data: cached.data,
          error: null,
          fromCache: true
        };
      }
    }

    try {
      // Obtener todos los usuarios y filtrar
      const allUsersResponse = await this.getAllUsers();

      if (allUsersResponse.error) {
        return {
          data: null,
          error: allUsersResponse.error,
          fromCache: false
        };
      }

      const usuarios = allUsersResponse.data!;
      const usuarioEncontrado = usuarios.find(
        u => u.idUsuario === parseInt(userIdStr)
      );

      if (!usuarioEncontrado) {
        return {
          data: null,
          error: 'Usuario no encontrado',
          fromCache: false
        };
      }

      // Guardar en caché
      userCache.set(cacheKey, {
        data: usuarioEncontrado,
        timestamp: Date.now()
      });

      return {
        data: usuarioEncontrado,
        error: null,
        fromCache: false
      };
    } catch (error: any) {
      return {
        data: null,
        error: error.message || 'Error al obtener usuario',
        fromCache: false
      };
    }
  }

  /**
   * Obtiene un usuario por nombre de usuario
   */
  async getUserByUsername(
    username: string
  ): Promise<UserServiceResponse<Usuarios>> {
    const cacheKey = `user_username_${username}`;

    // Verificar caché
    if (userCache.has(cacheKey)) {
      const cached = userCache.get(cacheKey)!;
      if (Date.now() - cached.timestamp < CACHE_DURATION) {
        return {
          data: cached.data,
          error: null,
          fromCache: true
        };
      }
    }

    try {
      const allUsersResponse = await this.getAllUsers();

      if (allUsersResponse.error) {
        return {
          data: null,
          error: allUsersResponse.error,
          fromCache: false
        };
      }

      const usuarios = allUsersResponse.data!;
      const usuarioEncontrado = usuarios.find(
        u => u.nombreDeUsuario.toLowerCase() === username.toLowerCase()
      );

      if (!usuarioEncontrado) {
        return {
          data: null,
          error: 'Usuario no encontrado',
          fromCache: false
        };
      }

      // Guardar en caché
      userCache.set(cacheKey, {
        data: usuarioEncontrado,
        timestamp: Date.now()
      });

      return {
        data: usuarioEncontrado,
        error: null,
        fromCache: false
      };
    } catch (error: any) {
      return {
        data: null,
        error: error.message || 'Error al obtener usuario',
        fromCache: false
      };
    }
  }

  /**
   * Obtiene el perfil del usuario actualmente autenticado desde la API.
   * La API identifica al usuario a través del token JWT enviado por el interceptor de Axios.
   */
  async getOwnProfile(): Promise<UserServiceResponse<Usuarios>> {
    try {
      // Asumimos que tienes un endpoint como '/me' o '/profile' que devuelve el usuario logueado
      const response = await api.get('/me');
      return {
        data: response.data as Usuarios,
        error: null,
        fromCache: false
      };
    } catch (error: any) {
      // El interceptor de Axios manejará los 401/403, pero por si acaso...
      return {
        data: null,
        error:
          error.response?.data?.message ||
          error.message ||
          'Error al obtener el perfil',
        fromCache: false
      };
    }
  }

  /**
   * Actualiza un usuario
   */
  async updateUser(
    userId: number,
    userData: ActualizarUsuarioProps
  ): Promise<UserServiceResponse<Usuarios>> {
    try {
      const response = await api.put(`actualizar/${userId}`, userData);

      const updatedUser = response.data as Usuarios;

      // Actualizar caché
      const cacheKey = `user_${userId}`;
      userCache.set(cacheKey, {
        data: updatedUser,
        timestamp: Date.now()
      });

      // También actualizar caché por username si existe
      const usernameCacheKey = `user_username_${updatedUser.nombreDeUsuario}`;
      userCache.set(usernameCacheKey, {
        data: updatedUser,
        timestamp: Date.now()
      });

      return {
        data: updatedUser,
        error: null,
        fromCache: false
      };
    } catch (error: any) {
      return {
        data: null,
        error: error.message || 'Error al actualizar usuario',
        fromCache: false
      };
    }
  }

  /**
   * Crea datos simulados de usuario basados en el token
   */
  createMockUserData(user: any): Usuarios {
    const nameParts = user.fullName.split(' ');
    return {
      idUsuario: parseInt(user.id),
      nombreDeUsuario: user.username,
      perfilId: parseInt(user.profileId),
      nombres: nameParts[0] || '',
      apellidos: nameParts.slice(1).join(' ') || '',
      departamento: 1, // Valor por defecto
      activo: true,
      fechaCreacion: new Date().toISOString()
    };
  }

  /**
   * Limpia el caché
   */
  clearCache(): void {
    userCache.clear();
  }

  /**
   * Limpia el caché de un usuario específico
   */
  clearUserCache(userId: string | number): void {
    const userIdStr = userId.toString();
    userCache.delete(`user_${userIdStr}`);
  }

  /**
   * Obtiene estadísticas del caché
   */
  getCacheStats(): {
    size: number;
    entries: Array<{ key: string; age: number }>;
  } {
    const now = Date.now();
    const entries = Array.from(userCache.entries()).map(([key, value]) => ({
      key,
      age: now - value.timestamp
    }));

    return {
      size: userCache.size,
      entries
    };
  }
}

export const userService = new UserService();
