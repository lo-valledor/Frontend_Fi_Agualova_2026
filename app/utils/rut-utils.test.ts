import { describe, expect, it } from 'vitest';
import {
  calculateRutVerifier,
  cleanRut,
  formatRut,
  formatRutWithDots,
  isValidRut,
  isValidRutFormat
} from './rut-utils';

describe('rut-utils', () => {
  describe('cleanRut', () => {
    it('debe remover puntos y espacios', () => {
      expect(cleanRut('12.345.678-9')).toBe('12345678-9');
      expect(cleanRut('12 345 678-9')).toBe('12345678-9');
    });

    it('debe convertir k minúscula a mayúscula', () => {
      expect(cleanRut('12345678-k')).toBe('12345678-K');
    });

    it('debe remover caracteres no válidos', () => {
      expect(cleanRut('12.345.678-9abc')).toBe('12345678-9');
      expect(cleanRut('!@#12345678-9')).toBe('12345678-9');
    });

    it('debe mantener el guión', () => {
      expect(cleanRut('12345678-9')).toBe('12345678-9');
    });
  });

  describe('formatRut', () => {
    it('debe formatear RUT de 8 caracteres (7 dígitos + verificador)', () => {
      expect(formatRut('1234567K')).toBe('1234567-K');
      expect(formatRut('1234567k')).toBe('1234567-K');
    });

    it('debe formatear RUT de 9 caracteres (8 dígitos + verificador)', () => {
      expect(formatRut('123456789')).toBe('12345678-9');
    });

    it('debe mantener el formato si ya tiene guión', () => {
      expect(formatRut('12345678-9')).toBe('12345678-9');
      expect(formatRut('1234567-K')).toBe('1234567-K');
    });

    it('debe retornar el input si tiene menos de 2 caracteres', () => {
      expect(formatRut('1')).toBe('1');
      expect(formatRut('')).toBe('');
    });

    it('debe limpiar y formatear RUT con puntos', () => {
      expect(formatRut('12.345.678-9')).toBe('12345678-9');
    });
  });

  describe('isValidRutFormat', () => {
    it('debe validar formato correcto de RUT', () => {
      expect(isValidRutFormat('12345678-9')).toBe(true);
      expect(isValidRutFormat('1234567-K')).toBe(true);
      expect(isValidRutFormat('1234567-k')).toBe(true);
    });

    it('debe rechazar formato incorrecto', () => {
      expect(isValidRutFormat('123456789')).toBe(false);
      expect(isValidRutFormat('12.345.678-9')).toBe(false);
      expect(isValidRutFormat('123456-9')).toBe(false);
      expect(isValidRutFormat('123456789-9')).toBe(false);
      expect(isValidRutFormat('12345678')).toBe(false);
    });
  });

  describe('calculateRutVerifier', () => {
    it('debe calcular dígito verificador correcto', () => {
      expect(calculateRutVerifier('12345678')).toBe('5');
      expect(calculateRutVerifier('11111111')).toBe('1');
      expect(calculateRutVerifier('22222222')).toBe('2');
    });

    it('debe retornar K cuando el verificador es 10', () => {
      expect(calculateRutVerifier('24965101')).toBe('K');
    });
  });

  describe('isValidRut', () => {
    it('debe validar RUTs correctos', () => {
      expect(isValidRut('12345678-5')).toBe(true);
      expect(isValidRut('11111111-1')).toBe(true);
      expect(isValidRut('24965101-K')).toBe(true);
    });

    it('debe rechazar RUTs con dígito verificador incorrecto', () => {
      expect(isValidRut('12345678-9')).toBe(false);
      expect(isValidRut('11111111-2')).toBe(false);
    });

    it('debe rechazar RUTs con formato incorrecto', () => {
      expect(isValidRut('123456789')).toBe(false);
      expect(isValidRut('12.345.678-5')).toBe(false);
    });

    it('debe ser case-insensitive con K', () => {
      expect(isValidRut('24965101-k')).toBe(true);
      expect(isValidRut('24965101-K')).toBe(true);
    });
  });

  describe('formatRutWithDots', () => {
    it('debe formatear RUT con puntos y guión', () => {
      expect(formatRutWithDots('12345678-9')).toBe('12.345.678-9');
      expect(formatRutWithDots('1234567-K')).toBe('1.234.567-K');
    });

    it('debe formatear RUT sin formato previo', () => {
      expect(formatRutWithDots('123456789')).toBe('12.345.678-9');
      expect(formatRutWithDots('1234567K')).toBe('1.234.567-K');
    });

    it('debe limpiar y formatear RUT con espacios', () => {
      expect(formatRutWithDots('12 345 678-9')).toBe('12.345.678-9');
    });

    it('debe retornar el input si el formato es inválido', () => {
      expect(formatRutWithDots('123')).toBe('123');
      expect(formatRutWithDots('12345')).toBe('12345');
    });
  });

  describe('Edge cases', () => {
    it('debe manejar strings vacíos', () => {
      expect(cleanRut('')).toBe('');
      expect(formatRut('')).toBe('');
    });

    it('debe manejar RUTs muy cortos', () => {
      expect(formatRut('1')).toBe('1');
      expect(formatRut('12')).toBe('12');
    });

    it('debe manejar RUTs con múltiples guiones', () => {
      expect(cleanRut('12-345-678-9')).toBe('12-345-678-9');
    });
  });
});
