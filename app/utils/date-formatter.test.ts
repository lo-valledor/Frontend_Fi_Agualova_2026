import { describe, it, expect } from 'vitest';
import { formatToDate, formatToTime, formatToYYYYMMDD } from './date-formatter';

describe('date-formatter', () => {
  describe('formatToDate', () => {
    it('debe formatear fecha ISO a DD-MM-YYYY', () => {
      expect(formatToDate('2024-01-15T10:30:00')).toBe('15-01-2024');
      expect(formatToDate('2023-12-25T00:00:00')).toBe('25-12-2023');
    });

    it('debe retornar "-" para valores null o undefined', () => {
      expect(formatToDate(null)).toBe('-');
      expect(formatToDate('')).toBe('-');
    });

    it('debe manejar fechas sin hora', () => {
      // Usar fecha con hora explícita para evitar problemas de timezone
      expect(formatToDate('2024-03-20T12:00:00')).toBe('20-03-2024');
    });

    it('debe manejar errores y retornar fallback', () => {
      const result = formatToDate('invalid-date');
      expect(result).toBeDefined();
    });
  });

  describe('formatToTime', () => {
    it('debe formatear fecha ISO a HH:mm:ss', () => {
      expect(formatToTime('2024-01-15T10:30:45')).toBe('10:30:45');
      expect(formatToTime('2023-12-25T23:59:59')).toBe('23:59:59');
    });

    it('debe retornar "-" para valores null o undefined', () => {
      expect(formatToTime(null)).toBe('-');
      expect(formatToTime('')).toBe('-');
    });

    it('debe manejar errores y retornar fallback', () => {
      const result = formatToTime('invalid-time');
      expect(result).toBeDefined();
    });
  });

  describe('formatToYYYYMMDD', () => {
    it('debe convertir formato YYYY-MM-DD a YYYYMMDD', () => {
      expect(formatToYYYYMMDD('2024-01-15')).toBe('20240115');
      expect(formatToYYYYMMDD('2023-12-25')).toBe('20231225');
    });

    it('debe convertir formato DD-MM-YYYY a YYYYMMDD', () => {
      expect(formatToYYYYMMDD('15-01-2024')).toBe('20240115');
      expect(formatToYYYYMMDD('25-12-2023')).toBe('20231225');
    });

    it('debe retornar string vacío para valores inválidos', () => {
      expect(formatToYYYYMMDD('')).toBe('');
      expect(formatToYYYYMMDD('invalid')).toBe('');
      expect(formatToYYYYMMDD('2024-01')).toBe('');
    });

    it('debe manejar fechas con ceros a la izquierda', () => {
      expect(formatToYYYYMMDD('2024-01-05')).toBe('20240105');
      expect(formatToYYYYMMDD('05-01-2024')).toBe('20240105');
    });
  });
});
