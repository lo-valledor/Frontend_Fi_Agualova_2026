import { describe, it, expect, beforeEach } from 'vitest';
import { getAuthenticatedUser } from './auth-utils';

describe('auth-utils', () => {
  beforeEach(() => {
    // Limpiar localStorage antes de cada test
    localStorage.clear();
  });

  describe('getAuthenticatedUser', () => {
    it('debe retornar null si no hay token', () => {
      const result = getAuthenticatedUser();
      expect(result).toBeNull();
    });

    it('debe retornar null si el token es inválido', () => {
      localStorage.setItem('token', 'invalid-token');
      const result = getAuthenticatedUser();
      expect(result).toBeNull();
    });

    it('debe limpiar localStorage si el token es inválido', () => {
      localStorage.setItem('token', 'invalid-token');
      getAuthenticatedUser();
      // Verificar que el token fue removido (puede ser null o undefined en el mock)
      const token = localStorage.getItem('token');
      expect(token).toBeFalsy();
    });
  });
});
