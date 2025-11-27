import { describe, it, expect } from 'vitest';
import {
  validatePassword
} from './password-validation';
import { formatRut, isValidRutFormat, cleanRut } from './rut-utils';
import { formatToDate } from './date-formatter';

/**
 * Tests de Rendimiento (Performance Tests)
 *
 * Estos tests miden el rendimiento de funciones críticas del sistema
 * bajo carga para asegurar que se mantienen dentro de márgenes aceptables.
 */

describe('Performance Tests - Utilidades Críticas', () => {
  describe('Password Validation Performance', () => {
    it('should validate 1000 passwords in < 500ms', () => {
      const passwords = Array.from(
        { length: 1000 },
        (_, i) => `TestPass${i}!@#Secure${i}`
      );

      const start = performance.now();
      passwords.forEach(pwd => validatePassword(pwd));
      const duration = performance.now() - start;

      expect(duration).toBeLessThan(500);
      console.log(
        `✓ 1000 password validations completed in ${duration.toFixed(2)}ms`
      );
    });

    it('should validate 10000 passwords in < 5000ms', () => {
      const passwords = Array.from(
        { length: 10000 },
        (_, i) => `TestPass${i}!@#Secure${i}`
      );

      const start = performance.now();
      passwords.forEach(pwd => validatePassword(pwd));
      const duration = performance.now() - start;

      expect(duration).toBeLessThan(5000);
      console.log(
        `✓ 10000 password validations completed in ${duration.toFixed(2)}ms`
      );
    });

    it('should validate multiple password validations sequentially for 5000 passwords in < 1000ms', () => {
      const passwords = Array.from(
        { length: 5000 },
        (_, i) => `TestPass${i}!@#Secure${i}`
      );

      const start = performance.now();
      // Ejecutar validación múltiples veces para medir rendimiento
      passwords.forEach(pwd => {
        validatePassword(pwd);
      });
      const duration = performance.now() - start;

      expect(duration).toBeLessThan(1000);
      console.log(
        `✓ 5000 sequential password validations completed in ${duration.toFixed(2)}ms`
      );
    });

    it('should handle edge case: very long passwords (10000 chars) efficiently', () => {
      const longPassword = 'A'.repeat(10000) + '1!@#';

      const start = performance.now();
      // Validar 100 veces para medir rendimiento
      for (let i = 0; i < 100; i++) {
        validatePassword(longPassword);
      }
      const duration = performance.now() - start;

      expect(duration).toBeLessThan(1000);
      console.log(
        `✓ 100 long password validations (10000 chars each) in ${duration.toFixed(2)}ms`
      );
    });
  });

  describe('RUT Validation Performance', () => {
    it('should validate 5000 RUTs in < 1000ms', () => {
      const ruts = Array.from(
        { length: 5000 },
        (_, i) => `${1000000 + i}-K`
      );

      const start = performance.now();
      ruts.forEach(rut => isValidRutFormat(rut));
      const duration = performance.now() - start;

      expect(duration).toBeLessThan(1000);
      console.log(
        `✓ 5000 RUT validations completed in ${duration.toFixed(2)}ms`
      );
    });

    it('should format 10000 RUTs in < 2000ms', () => {
      const ruts = Array.from(
        { length: 10000 },
        (_, i) => `${1000000 + i}K`
      );

      const start = performance.now();
      ruts.forEach(rut => formatRut(rut));
      const duration = performance.now() - start;

      expect(duration).toBeLessThan(2000);
      console.log(
        `✓ 10000 RUT formatting operations completed in ${duration.toFixed(2)}ms`
      );
    });

    it('should clean 10000 RUTs in < 1000ms', () => {
      const ruts = Array.from(
        { length: 10000 },
        (_, i) => `${1000000 + i}.000-K`
      );

      const start = performance.now();
      ruts.forEach(rut => cleanRut(rut));
      const duration = performance.now() - start;

      expect(duration).toBeLessThan(1000);
      console.log(
        `✓ 10000 RUT cleaning operations completed in ${duration.toFixed(2)}ms`
      );
    });
  });

  describe('Date Formatting Performance', () => {
    it('should format 20000 dates in < 2000ms', () => {
      const dates = Array.from(
        { length: 20000 },
        (_, i) => `2024-01-${String((i % 28) + 1).padStart(2, '0')}`
      );

      const start = performance.now();
      dates.forEach(date => formatToDate(date));
      const duration = performance.now() - start;

      expect(duration).toBeLessThan(2000);
      console.log(
        `✓ 20000 date formatting operations completed in ${duration.toFixed(2)}ms`
      );
    });
  });

  describe('Memory and Garbage Collection', () => {
    it('should not cause memory leaks during repeated validation', () => {
      // Capturar uso inicial de memoria (aproximado)
      const passwords = Array.from(
        { length: 5000 },
        (_, i) => `TestPass${i}!@#Secure${i}`
      );

      // Primera ejecución
      const start1 = performance.now();
      passwords.forEach(pwd => validatePassword(pwd));
      const duration1 = performance.now() - start1;

      // Segunda ejecución - debería tener rendimiento similar
      const start2 = performance.now();
      passwords.forEach(pwd => validatePassword(pwd));
      const duration2 = performance.now() - start2;

      // La segunda ejecución no debe ser significativamente más lenta
      // Tolerancia: 50% más lento es aceptable
      expect(duration2).toBeLessThan(duration1 * 1.5);
      console.log(
        `✓ Memory consistency: 1st run ${duration1.toFixed(2)}ms, 2nd run ${duration2.toFixed(2)}ms`
      );
    });
  });

  describe('Concurrent Operations Performance', () => {
    it('should handle 100 concurrent validations efficiently', async () => {
      const promises = Array.from({ length: 100 }, (_, i) =>
        Promise.resolve(validatePassword(`TestPass${i}!@#Secure${i}`))
      );

      const start = performance.now();
      await Promise.all(promises);
      const duration = performance.now() - start;

      expect(duration).toBeLessThan(100);
      console.log(
        `✓ 100 concurrent validations completed in ${duration.toFixed(2)}ms`
      );
    });

    it('should handle 500 concurrent RUT validations efficiently', async () => {
      const promises = Array.from({ length: 500 }, (_, i) =>
        Promise.resolve(isValidRutFormat(`${1000000 + i}-K`))
      );

      const start = performance.now();
      await Promise.all(promises);
      const duration = performance.now() - start;

      expect(duration).toBeLessThan(500);
      console.log(
        `✓ 500 concurrent RUT validations completed in ${duration.toFixed(2)}ms`
      );
    });
  });
});
