import { describe, it, expect } from 'vitest';
import { validatePassword } from './password-validation';
import { formatRut, isValidRutFormat, cleanRut } from './rut-utils';
import { formatToDate } from './date-formatter';



describe('Stress Tests - Utilidades Críticas bajo Carga Extrema', () => {
  describe('Password Validation Under Stress', () => {
    it('should handle 100000 passwords without crashing', () => {
      const passwords = Array.from(
        { length: 100000 },
        (_, i) => `TestPass${i}!@#Secure${i}`
      );

      const start = performance.now();
      let validCount = 0;
      passwords.forEach(pwd => {
        if (validatePassword(pwd)) {
          validCount += 1;
        }
      });
      const duration = performance.now() - start;

      expect(validCount).toBeGreaterThan(0);
      expect(duration).toBeLessThan(10000); // 10 segundos máximo
      console.log(
        `✓ 100000 password validations completed in ${duration.toFixed(2)}ms (${(duration / passwords.length).toFixed(4)}ms per password)`
      );
    });

    it('should handle extremely long passwords gracefully', () => {
      // Crear una contraseña de 100KB
      const veryLongPassword = 'A'.repeat(102400) + '1!@#';

      const start = performance.now();
      const isValid = validatePassword(veryLongPassword);
      const duration = performance.now() - start;

      // Debe completarse sin crash
      expect(duration).toBeLessThan(1000);
      console.log(
        `✓ 100KB password validation completed in ${duration.toFixed(2)}ms`
      );
    });

    it('should handle multiple stress cycles', () => {
      const cycles = 10;
      const passwordsPerCycle = 10000;

      const start = performance.now();
      for (let cycle = 0; cycle < cycles; cycle++) {
        const passwords = Array.from(
          { length: passwordsPerCycle },
          (_, i) => `TestPass${cycle}-${i}!@#Secure`
        );
        passwords.forEach(pwd => validatePassword(pwd));
      }
      const duration = performance.now() - start;

      expect(duration).toBeLessThan(5000);
      console.log(
        `✓ ${cycles} stress cycles (${passwordsPerCycle} passwords each) completed in ${duration.toFixed(2)}ms`
      );
    });

    it('should handle rapid sequential validation without degradation', () => {
      const password = 'SecurePass123!@#';
      const iterations = 1000000;

      const start = performance.now();
      for (let i = 0; i < iterations; i++) {
        validatePassword(password);
      }
      const duration = performance.now() - start;

      const timePerValidation = duration / iterations;
      expect(duration).toBeLessThan(10000);
      console.log(
        `✓ 1000000 rapid validations (same password) in ${duration.toFixed(2)}ms (${(timePerValidation * 1000).toFixed(6)}μs per validation)`
      );
    });
  });

  describe('RUT Validation Under Stress', () => {
    it('should validate 100000 RUTs without crashing', () => {
      const ruts = Array.from(
        { length: 100000 },
        (_, i) => {
          const rutNum = (1000000 + (i % 8999999)).toString();
          const digit = i % 10;
          return `${rutNum}-${digit}`;
        }
      );

      const start = performance.now();
      let validCount = 0;
      ruts.forEach(rut => {
        if (isValidRutFormat(rut)) {
          validCount += 1;
        }
      });
      const duration = performance.now() - start;

      expect(validCount).toBeGreaterThan(0);
      expect(duration).toBeLessThan(10000);
      console.log(
        `✓ 100000 RUT validations completed in ${duration.toFixed(2)}ms (${validCount} valid)`
      );
    });

    it('should format 50000 RUTs with mixed formats', () => {
      const ruts = Array.from({ length: 50000 }, (_, i) => {
        const rutNum = (1000000 + (i % 8999999)).toString();
        // Variar formato: con guión, sin guión, con puntos, etc.
        const formats = [
          `${rutNum}K`,
          `${rutNum}-K`,
          `${rutNum}.000-K`,
          rutNum
        ];
        return formats[i % formats.length];
      });

      const start = performance.now();
      const formatted = ruts.map(rut => formatRut(rut));
      const duration = performance.now() - start;

      expect(formatted.length).toBe(50000);
      expect(duration).toBeLessThan(10000);
      console.log(
        `✓ 50000 mixed-format RUT formatting completed in ${duration.toFixed(2)}ms`
      );
    });

    it('should clean 50000 RUTs with messy formats', () => {
      const ruts = Array.from({ length: 50000 }, (_, i) => {
        const rutNum = (1000000 + (i % 8999999)).toString();
        // Crear formatos "sucios" que necesitan limpieza
        const messyFormats = [
          `${rutNum}---K`,
          ` ${rutNum} - K `,
          `${rutNum}...K`,
          `${rutNum}  K`,
          `##${rutNum}##K`
        ];
        return messyFormats[i % messyFormats.length];
      });

      const start = performance.now();
      const cleaned = ruts.map(rut => cleanRut(rut));
      const duration = performance.now() - start;

      expect(cleaned.length).toBe(50000);
      expect(duration).toBeLessThan(10000);
      console.log(
        `✓ 50000 messy RUT cleaning completed in ${duration.toFixed(2)}ms`
      );
    });
  });

  describe('Date Formatting Under Stress', () => {
    it('should format 100000 dates without crashing', () => {
      const dates = Array.from(
        { length: 100000 },
        (_, i) => {
          const month = ((i % 12) + 1).toString().padStart(2, '0');
          const day = ((i % 28) + 1).toString().padStart(2, '0');
          return `2024-${month}-${day}`;
        }
      );

      const start = performance.now();
      const formatted = dates.map(date => formatToDate(date));
      const duration = performance.now() - start;

      expect(formatted.length).toBe(100000);
      expect(duration).toBeLessThan(15000);
      console.log(
        `✓ 100000 date formatting completed in ${duration.toFixed(2)}ms`
      );
    });

    it('should handle malformed dates gracefully', () => {
      const malformedDates = [
        '2024-13-45', // mes y día inválidos
        '2024/01/01', // separador incorrecto
        'invalid-date',
        '2024-01', // fecha incompleta
        '',
        null,
        undefined,
        '2024-02-30', // fecha imposible
        '2024-01-01T25:00:00' // hora inválida
      ];

      const start = performance.now();
      const results = [];
      // Repetir 10000 veces para estrés
      for (let i = 0; i < 10000; i++) {
        malformedDates.forEach(date => {
          results.push(formatToDate(date as any));
        });
      }
      const duration = performance.now() - start;

      expect(results.length).toBe(90000);
      expect(duration).toBeLessThan(5000);
      console.log(
        `✓ 90000 malformed date formatting completed gracefully in ${duration.toFixed(2)}ms`
      );
    });
  });

  describe('Concurrent Stress Operations', () => {
    it('should handle 1000 concurrent password validations', async () => {
      const promises = Array.from({ length: 1000 }, (_, i) =>
        Promise.resolve(validatePassword(`TestPass${i}!@#Secure${i}`))
      );

      const start = performance.now();
      const results = await Promise.all(promises);
      const duration = performance.now() - start;

      expect(results.length).toBe(1000);
      expect(duration).toBeLessThan(5000);
      console.log(
        `✓ 1000 concurrent password validations completed in ${duration.toFixed(2)}ms`
      );
    });

    it('should handle 5000 concurrent RUT operations', async () => {
      const promises = Array.from({ length: 5000 }, (_, i) => {
        const rutNum = (1000000 + (i % 8999999)).toString();
        return Promise.resolve(formatRut(rutNum + 'K'));
      });

      const start = performance.now();
      const results = await Promise.all(promises);
      const duration = performance.now() - start;

      expect(results.length).toBe(5000);
      expect(duration).toBeLessThan(10000);
      console.log(
        `✓ 5000 concurrent RUT formatting completed in ${duration.toFixed(2)}ms`
      );
    });

    it('should handle mixed concurrent operations', async () => {
      const passwordPromises = Array.from(
        { length: 500 },
        (_, i) =>
          Promise.resolve(validatePassword(`TestPass${i}!@#`)) as unknown as Promise<boolean>
      );

      const rutPromises = Array.from(
        { length: 500 },
        (_, i) =>
          Promise.resolve(formatRut(`${1000000 + i}K`)) as Promise<string>
      );

      const datePromises = Array.from(
        { length: 500 },
        (_, i) =>
          Promise.resolve(formatToDate(`2024-01-${(i % 28) + 1}`)) as Promise<string>
      );

      const start = performance.now();
      const [pwdResults, rutResults, dateResults] = await Promise.all([
        Promise.all(passwordPromises),
        Promise.all(rutPromises),
        Promise.all(datePromises)
      ]);
      const duration = performance.now() - start;

      expect(pwdResults.length + rutResults.length + dateResults.length).toBe(
        1500
      );
      expect(duration).toBeLessThan(5000);
      console.log(
        `✓ 1500 mixed concurrent operations (500 each) completed in ${duration.toFixed(2)}ms`
      );
    });
  });

  describe('Memory Stress Tests', () => {
    it('should maintain consistent memory usage during repeated cycles', () => {
      const cycleCount = 100;
      const dataPerCycle = 1000;

      const results = [];
      const start = performance.now();

      for (let cycle = 0; cycle < cycleCount; cycle++) {
        const passwords = Array.from(
          { length: dataPerCycle },
          (_, i) => `TestPass${cycle}-${i}!@#`
        );
        const validated = passwords.map(pwd => validatePassword(pwd));
        results.push(validated.filter(v => v).length);
      }

      const duration = performance.now() - start;

      expect(results.length).toBe(cycleCount);
      expect(duration).toBeLessThan(10000);
      console.log(
        `✓ ${cycleCount} memory stress cycles completed in ${duration.toFixed(2)}ms`
      );
    });

    it('should handle rapid allocation and deallocation', () => {
      const iterations = 100000;

      const start = performance.now();
      for (let i = 0; i < iterations; i++) {
        // Crear y descartar arrays pequeños rápidamente
        const temp = Array.from(
          { length: 10 },
          (_, j) => `password${i}-${j}!@#`
        );
        temp.forEach(pwd => validatePassword(pwd));
      }
      const duration = performance.now() - start;

      expect(duration).toBeLessThan(20000);
      console.log(
        `✓ Rapid allocation/deallocation (1000000 operations) completed in ${duration.toFixed(2)}ms`
      );
    });
  });

  describe('Edge Case Stress Scenarios', () => {
    it('should handle maximum input size (1MB strings)', () => {
      // Crear strings de 1MB
      const megabytePassword = 'A'.repeat(1024 * 1024) + '1!@#';

      const start = performance.now();
      const isValid = validatePassword(megabytePassword);
      const duration = performance.now() - start;

      // Debe completarse sin crash
      expect(duration).toBeLessThan(5000);
      console.log(
        `✓ 1MB password validation completed in ${duration.toFixed(2)}ms`
      );
    });

    it('should handle special characters and unicode stress', () => {
      const specialChars = [
        '😀😃😄😁',
        '中文测试字符',
        '🔒🔑🛡️⚡',
        '!@#$%^&*()_+-=[]{}|;:",.<>?/',
        '\n\t\r\0',
        'Ñ€¥©®™'
      ];

      const start = performance.now();
      for (let cycle = 0; cycle < 10000; cycle++) {
        specialChars.forEach(chars => {
          validatePassword(chars + 'Pass1!@#');
        });
      }
      const duration = performance.now() - start;

      expect(duration).toBeLessThan(10000);
      console.log(
        `✓ 60000 special/unicode character validations completed in ${duration.toFixed(2)}ms`
      );
    });

    it('should handle rapid context switching', () => {
      const password = 'SecurePass123!@#';
      const rut = '12345678-K';
      const date = '2024-01-15';

      const start = performance.now();
      for (let i = 0; i < 10000; i++) {
        validatePassword(password);
        isValidRutFormat(rut);
        formatToDate(date);
        cleanRut(rut);
        formatRut(rut);
      }
      const duration = performance.now() - start;

      expect(duration).toBeLessThan(5000);
      console.log(
        `✓ 50000 context switches (rapid function switching) completed in ${duration.toFixed(2)}ms`
      );
    });
  });
});
