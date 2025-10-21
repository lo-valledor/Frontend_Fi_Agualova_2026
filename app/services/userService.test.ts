import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { userService } from './userService';
import api from '~/lib/api';
import type { Usuarios } from '~/types/administracion';

// Mock de api
vi.mock('~/lib/api', () => ({
  default: {
    get: vi.fn(),
    put: vi.fn()
  }
}));

describe('userService', () => {
  const mockUsers: Usuarios[] = [
    {
      idUsuario: 1,
      nombreDeUsuario: 'admin',
      perfilId: 1,
      nombres: 'Admin',
      apellidos: 'User',
      departamento: 1,
      activo: true,
      fechaCreacion: '2024-01-01T00:00:00Z'
    },
    {
      idUsuario: 2,
      nombreDeUsuario: 'testuser',
      perfilId: 2,
      nombres: 'Test',
      apellidos: 'User',
      departamento: 2,
      activo: true,
      fechaCreacion: '2024-01-02T00:00:00Z'
    }
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    userService.clearCache();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('getAllUsers', () => {
    it('debe obtener todos los usuarios exitosamente', async () => {
      vi.mocked(api.get).mockResolvedValueOnce({
        data: mockUsers
      });

      const result = await userService.getAllUsers();

      expect(api.get).toHaveBeenCalledWith('/listar');
      expect(result.data).toEqual(mockUsers);
      expect(result.error).toBeNull();
      expect(result.fromCache).toBe(false);
    });

    it('debe manejar errores al obtener usuarios', async () => {
      const errorMessage = 'Network error';
      vi.mocked(api.get).mockRejectedValueOnce(new Error(errorMessage));

      const result = await userService.getAllUsers();

      expect(result.data).toBeNull();
      expect(result.error).toBe(errorMessage);
      expect(result.fromCache).toBe(false);
    });
  });

  describe('getUserById', () => {
    it('debe obtener un usuario por ID exitosamente', async () => {
      vi.mocked(api.get).mockResolvedValueOnce({
        data: mockUsers
      });

      const result = await userService.getUserById(1);

      expect(result.data).toEqual(mockUsers[0]);
      expect(result.error).toBeNull();
      expect(result.fromCache).toBe(false);
    });

    it('debe retornar error si el ID es inválido', async () => {
      const result = await userService.getUserById('');

      expect(result.data).toBeNull();
      expect(result.error).toBe('ID de usuario es requerido');
      expect(result.fromCache).toBe(false);
    });

    it('debe retornar error si el usuario no existe', async () => {
      vi.mocked(api.get).mockResolvedValueOnce({
        data: mockUsers
      });

      const result = await userService.getUserById(999);

      expect(result.data).toBeNull();
      expect(result.error).toBe('Usuario no encontrado');
      expect(result.fromCache).toBe(false);
    });

    it('debe usar caché en llamadas subsecuentes', async () => {
      vi.mocked(api.get).mockResolvedValueOnce({
        data: mockUsers
      });

      // Primera llamada
      const result1 = await userService.getUserById(1);
      expect(result1.fromCache).toBe(false);

      // Segunda llamada (debe usar caché)
      const result2 = await userService.getUserById(1);
      expect(result2.fromCache).toBe(true);
      expect(result2.data).toEqual(mockUsers[0]);

      // API solo debe llamarse una vez
      expect(api.get).toHaveBeenCalledTimes(1);
    });

    it('debe manejar errores de la API', async () => {
      vi.mocked(api.get).mockRejectedValueOnce(new Error('API Error'));

      const result = await userService.getUserById(1);

      expect(result.data).toBeNull();
      expect(result.error).toBe('API Error');
      expect(result.fromCache).toBe(false);
    });
  });

  describe('getUserByUsername', () => {
    it('debe obtener un usuario por nombre de usuario', async () => {
      vi.mocked(api.get).mockResolvedValueOnce({
        data: mockUsers
      });

      const result = await userService.getUserByUsername('admin');

      expect(result.data).toEqual(mockUsers[0]);
      expect(result.error).toBeNull();
      expect(result.fromCache).toBe(false);
    });

    it('debe ser case-insensitive', async () => {
      vi.mocked(api.get).mockResolvedValueOnce({
        data: mockUsers
      });

      const result = await userService.getUserByUsername('ADMIN');

      expect(result.data).toEqual(mockUsers[0]);
      expect(result.error).toBeNull();
    });

    it('debe retornar error si el usuario no existe', async () => {
      vi.mocked(api.get).mockResolvedValueOnce({
        data: mockUsers
      });

      const result = await userService.getUserByUsername('nonexistent');

      expect(result.data).toBeNull();
      expect(result.error).toBe('Usuario no encontrado');
    });

    it('debe usar caché en llamadas subsecuentes', async () => {
      vi.mocked(api.get).mockResolvedValueOnce({
        data: mockUsers
      });

      // Primera llamada
      const result1 = await userService.getUserByUsername('admin');
      expect(result1.fromCache).toBe(false);

      // Segunda llamada (debe usar caché)
      const result2 = await userService.getUserByUsername('admin');
      expect(result2.fromCache).toBe(true);
      expect(result2.data).toEqual(mockUsers[0]);

      // API solo debe llamarse una vez
      expect(api.get).toHaveBeenCalledTimes(1);
    });
  });

  describe('getOwnProfile', () => {
    it('debe obtener el perfil del usuario autenticado', async () => {
      const mockProfile = mockUsers[0];

      vi.mocked(api.get).mockResolvedValueOnce({
        data: mockProfile
      });

      const result = await userService.getOwnProfile();

      expect(api.get).toHaveBeenCalledWith('/me');
      expect(result.data).toEqual(mockProfile);
      expect(result.error).toBeNull();
      expect(result.fromCache).toBe(false);
    });

    it('debe manejar errores de autenticación', async () => {
      vi.mocked(api.get).mockRejectedValueOnce({
        response: {
          data: { message: 'No autenticado' }
        }
      });

      const result = await userService.getOwnProfile();

      expect(result.data).toBeNull();
      expect(result.error).toBe('No autenticado');
    });

    it('debe manejar errores genéricos', async () => {
      vi.mocked(api.get).mockRejectedValueOnce(new Error('Network error'));

      const result = await userService.getOwnProfile();

      expect(result.data).toBeNull();
      expect(result.error).toBe('Network error');
    });
  });

  describe('updateUser', () => {
    it('debe actualizar un usuario exitosamente', async () => {
      const userId = 1;
      const updateData = {
        nombres: 'Updated',
        apellidos: 'Name'
      };
      const updatedUser = { ...mockUsers[0], ...updateData };

      vi.mocked(api.put).mockResolvedValueOnce({
        data: updatedUser
      });

      const result = await userService.updateUser(userId, updateData);

      expect(api.put).toHaveBeenCalledWith(`actualizar/${userId}`, updateData);
      expect(result.data).toEqual(updatedUser);
      expect(result.error).toBeNull();
      expect(result.fromCache).toBe(false);
    });

    it('debe actualizar el caché después de actualizar', async () => {
      const userId = 1;
      const updateData = { nombres: 'Updated' };
      const updatedUser = { ...mockUsers[0], ...updateData };

      vi.mocked(api.put).mockResolvedValueOnce({
        data: updatedUser
      });

      await userService.updateUser(userId, updateData);

      // Verificar que el caché se actualizó
      const cacheStats = userService.getCacheStats();
      expect(cacheStats.size).toBeGreaterThan(0);
    });

    it('debe manejar errores al actualizar', async () => {
      const userId = 1;
      const updateData = { nombres: 'Updated' };

      vi.mocked(api.put).mockRejectedValueOnce(
        new Error('Error al actualizar')
      );

      const result = await userService.updateUser(userId, updateData);

      expect(result.data).toBeNull();
      expect(result.error).toBe('Error al actualizar');
    });
  });

  describe('createMockUserData', () => {
    it('debe crear datos mock de usuario correctamente', () => {
      const mockTokenUser = {
        id: '1',
        username: 'testuser',
        profileId: '2',
        fullName: 'John Doe'
      };

      const result = userService.createMockUserData(mockTokenUser);

      expect(result).toEqual({
        idUsuario: 1,
        nombreDeUsuario: 'testuser',
        perfilId: 2,
        nombres: 'John',
        apellidos: 'Doe',
        departamento: 1,
        activo: true,
        fechaCreacion: expect.any(String)
      });
    });

    it('debe manejar nombres con múltiples apellidos', () => {
      const mockTokenUser = {
        id: '1',
        username: 'testuser',
        profileId: '2',
        fullName: 'John Michael Doe Smith'
      };

      const result = userService.createMockUserData(mockTokenUser);

      expect(result.nombres).toBe('John');
      expect(result.apellidos).toBe('Michael Doe Smith');
    });

    it('debe manejar nombres sin apellidos', () => {
      const mockTokenUser = {
        id: '1',
        username: 'testuser',
        profileId: '2',
        fullName: 'John'
      };

      const result = userService.createMockUserData(mockTokenUser);

      expect(result.nombres).toBe('John');
      expect(result.apellidos).toBe('');
    });
  });

  describe('Cache Management', () => {
    it('clearCache debe limpiar todo el caché', async () => {
      vi.mocked(api.get).mockResolvedValueOnce({
        data: mockUsers
      });

      // Agregar algo al caché
      await userService.getUserById(1);

      let stats = userService.getCacheStats();
      expect(stats.size).toBeGreaterThan(0);

      // Limpiar caché
      userService.clearCache();

      stats = userService.getCacheStats();
      expect(stats.size).toBe(0);
    });

    it('clearUserCache debe limpiar caché de un usuario específico', async () => {
      vi.mocked(api.get).mockResolvedValue({
        data: mockUsers
      });

      // Agregar usuarios al caché
      await userService.getUserById(1);
      await userService.getUserById(2);

      // Limpiar caché de usuario 1
      userService.clearUserCache(1);

      // Usuario 1 debe hacer nueva llamada a API
      vi.mocked(api.get).mockClear();
      vi.mocked(api.get).mockResolvedValueOnce({
        data: mockUsers
      });

      const result1 = await userService.getUserById(1);
      expect(result1.fromCache).toBe(false);
      expect(api.get).toHaveBeenCalled();

      // Usuario 2 debe seguir en caché
      const result2 = await userService.getUserById(2);
      expect(result2.fromCache).toBe(true);
    });

    it('getCacheStats debe retornar estadísticas correctas', async () => {
      vi.mocked(api.get).mockResolvedValue({
        data: mockUsers
      });

      // Agregar usuarios al caché
      await userService.getUserById(1);
      await userService.getUserByUsername('admin');

      const stats = userService.getCacheStats();

      expect(stats.size).toBeGreaterThan(0);
      expect(stats.entries).toBeInstanceOf(Array);
      expect(stats.entries.length).toBe(stats.size);
      expect(stats.entries[0]).toHaveProperty('key');
      expect(stats.entries[0]).toHaveProperty('age');
    });
  });
});
