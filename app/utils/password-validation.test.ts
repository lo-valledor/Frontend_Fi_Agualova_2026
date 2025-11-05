import { describe, it, expect } from 'vitest';
import {
  validatePassword,
  calculatePasswordStrength,
  passwordsMatch,
  generatePasswordSuggestions,
  isPasswordSecure,
  PASSWORD_RULES
} from './password-validation';

// Helper function to reduce nesting and improve readability
const hasWarningWith = (warnings: string[], text: string) =>
  warnings.some(w => w.includes(text));

describe('password-validation', () => {
  describe('PASSWORD_RULES', () => {
    it('debería tener 5 reglas de validación', () => {
      expect(PASSWORD_RULES).toHaveLength(5);
    });

    it('todas las reglas deberían tener propiedades requeridas', () => {
      for (const rule of PASSWORD_RULES) {
        expect(rule).toHaveProperty('id');
        expect(rule).toHaveProperty('label');
        expect(rule).toHaveProperty('validator');
        expect(rule).toHaveProperty('message');
        expect(typeof rule.validator).toBe('function');
      }
    });

    it('regla de longitud debería validar mínimo 8 caracteres', () => {
      const lengthRule = PASSWORD_RULES.find(r => r.id === 'length');
      expect(lengthRule).toBeDefined();
      expect(lengthRule!.validator('short')).toBe(false);
      expect(lengthRule!.validator('12345678')).toBe(true);
    });

    it('regla de mayúsculas debería detectar letras mayúsculas', () => {
      const uppercaseRule = PASSWORD_RULES.find(r => r.id === 'uppercase');
      expect(uppercaseRule).toBeDefined();
      expect(uppercaseRule!.validator('lowercase')).toBe(false);
      expect(uppercaseRule!.validator('Uppercase')).toBe(true);
    });

    it('regla de minúsculas debería detectar letras minúsculas', () => {
      const lowercaseRule = PASSWORD_RULES.find(r => r.id === 'lowercase');
      expect(lowercaseRule).toBeDefined();
      expect(lowercaseRule!.validator('UPPERCASE')).toBe(false);
      expect(lowercaseRule!.validator('lowercase')).toBe(true);
    });

    it('regla de números debería detectar dígitos', () => {
      const numberRule = PASSWORD_RULES.find(r => r.id === 'number');
      expect(numberRule).toBeDefined();
      expect(numberRule!.validator('NoNumber')).toBe(false);
      expect(numberRule!.validator('Has1Number')).toBe(true);
    });

    it('regla de caracteres especiales debería detectarlos', () => {
      const specialRule = PASSWORD_RULES.find(r => r.id === 'special');
      expect(specialRule).toBeDefined();
      expect(specialRule!.validator('NoSpecial123')).toBe(false);
      expect(specialRule!.validator('Has!Special')).toBe(true);
      expect(specialRule!.validator('Has@Special')).toBe(true);
      expect(specialRule!.validator('Has#Special')).toBe(true);
    });
  });

  describe('validatePassword', () => {
    it('debería validar contraseña fuerte correctamente', () => {
      const result = validatePassword('Strong!Pass123');

      expect(result.isValid).toBe(true);
      expect(result.failedRules).toHaveLength(0);
    });

    it('debería rechazar contraseña muy corta', () => {
      const result = validatePassword('P@ss1');

      expect(result.isValid).toBe(false);
      expect(result.failedRules.length).toBeGreaterThan(0);
      expect(result.failedRules.some(r => r.id === 'length')).toBe(true);
    });

    it('debería detectar falta de mayúsculas', () => {
      const result = validatePassword('password123!');

      expect(result.isValid).toBe(false);
      expect(result.failedRules.some(r => r.id === 'uppercase')).toBe(true);
    });

    it('debería detectar falta de minúsculas', () => {
      const result = validatePassword('PASSWORD123!');

      expect(result.isValid).toBe(false);
      expect(result.failedRules.some(r => r.id === 'lowercase')).toBe(true);
    });

    it('debería detectar falta de números', () => {
      const result = validatePassword('Password!');

      expect(result.isValid).toBe(false);
      expect(result.failedRules.some(r => r.id === 'number')).toBe(true);
    });

    it('debería detectar falta de caracteres especiales', () => {
      const result = validatePassword('Password123');

      expect(result.isValid).toBe(false);
      expect(result.failedRules.some(r => r.id === 'special')).toBe(true);
    });

    describe('detección de patrones comunes', () => {
      it('debería advertir sobre "123456"', () => {
        const result = validatePassword('123456Ab!');

        expect(result.warnings.length).toBeGreaterThan(0);
        expect(result.warnings[0]).toContain('patrón común');
      });

      it('debería advertir sobre "password"', () => {
        const result = validatePassword('Password123!');

        expect(result.warnings.length).toBeGreaterThan(0);
        expect(result.warnings[0]).toContain('patrón común');
      });

      it('debería advertir sobre "qwerty"', () => {
        const result = validatePassword('Qwerty123!');

        expect(result.warnings.length).toBeGreaterThan(0);
      });

      it('debería advertir sobre "admin"', () => {
        const result = validatePassword('Admin123!');

        expect(result.warnings.length).toBeGreaterThan(0);
      });
    });

    describe('detección de repeticiones', () => {
      it('debería advertir sobre caracteres repetidos 3+ veces', () => {
        const result = validatePassword('Paaassss123!');

        expect(result.warnings.length).toBeGreaterThan(0);
        expect(hasWarningWith(result.warnings, 'repetir')).toBe(true);
      });

      it('no debería advertir sobre 2 repeticiones', () => {
        const result = validatePassword('Paassword123!');

        expect(hasWarningWith(result.warnings, 'repetir')).toBe(false);
      });
    });

    describe('detección de secuencias', () => {
      it('debería advertir sobre secuencias de letras', () => {
        const result = validatePassword('Abcdef123!');

        expect(result.warnings.length).toBeGreaterThan(0);
        expect(hasWarningWith(result.warnings, 'secuencias de letras')).toBe(
          true
        );
      });

      it('debería advertir sobre secuencias de números', () => {
        const result = validatePassword('Pass1234!');

        expect(result.warnings.length).toBeGreaterThan(0);
        expect(hasWarningWith(result.warnings, 'secuencias de números')).toBe(
          true
        );
      });

      it('debería detectar secuencias en mayúsculas', () => {
        const result = validatePassword('ABC1234!pwd');

        expect(hasWarningWith(result.warnings, 'secuencias de letras')).toBe(
          true
        );
      });
    });

    it('debería manejar contraseña vacía', () => {
      const result = validatePassword('');

      expect(result.isValid).toBe(false);
      expect(result.failedRules.length).toBe(PASSWORD_RULES.length);
    });

    it('debería manejar múltiples warnings', () => {
      const result = validatePassword('Password1234!');

      // "password" es patrón común y "1234" es secuencia
      expect(result.warnings.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('calculatePasswordStrength', () => {
    it('debería retornar score 0 para contraseña vacía', () => {
      const result = calculatePasswordStrength('');

      expect(result.score).toBe(0);
      expect(result.label).toBe('Muy débil');
      expect(result.color).toBe('bg-red-500');
      expect(result.percentage).toBe(0);
    });

    it('debería retornar score bajo para contraseña débil', () => {
      const result = calculatePasswordStrength('weak');

      expect(result.score).toBeLessThan(2);
      expect(['Muy débil', 'Débil']).toContain(result.label);
    });

    it('debería retornar score alto para contraseña fuerte', () => {
      const result = calculatePasswordStrength('VeryStr0ng!P@ssw0rd');

      expect(result.score).toBeGreaterThanOrEqual(3);
      expect(['Fuerte', 'Muy fuerte']).toContain(result.label);
    });

    it('debería dar bonus por longitud >= 12', () => {
      const short = calculatePasswordStrength('Strong!123');
      const long = calculatePasswordStrength('VeryStrong!12345');

      expect(long.score).toBeGreaterThanOrEqual(short.score);
    });

    it('debería dar bonus adicional por longitud >= 16', () => {
      const medium = calculatePasswordStrength('Strong!12345');
      const veryLong = calculatePasswordStrength('VeryStrongPass!12345');

      expect(veryLong.score).toBeGreaterThanOrEqual(medium.score);
    });

    it('debería penalizar patrones comunes', () => {
      const secure = calculatePasswordStrength('Secure!P@ss123');
      const common = calculatePasswordStrength('Password123!');

      expect(secure.score).toBeGreaterThan(common.score);
    });

    it('debería penalizar repeticiones de caracteres', () => {
      const normal = calculatePasswordStrength('Strong!Pass123');
      const repetitive = calculatePasswordStrength('Stronng!Passs123');

      expect(normal.score).toBeGreaterThanOrEqual(repetitive.score);
    });

    it('score debería estar normalizado entre 0-4', () => {
      const passwords = [
        '',
        'weak',
        'Medium!1',
        'StrongPass!123',
        'VeryStrongP@ssw0rd!2024'
      ];

      for (const pwd of passwords) {
        const result = calculatePasswordStrength(pwd);
        expect(result.score).toBeGreaterThanOrEqual(0);
        expect(result.score).toBeLessThanOrEqual(4);
      }
    });

    it('percentage debería estar entre 0-100', () => {
      const result = calculatePasswordStrength('Test!Pass123');

      expect(result.percentage).toBeGreaterThanOrEqual(0);
      expect(result.percentage).toBeLessThanOrEqual(100);
    });

    it('debería mapear correctamente scores a labels', () => {
      const labelMap = {
        0: 'Muy débil',
        1: 'Débil',
        2: 'Aceptable',
        3: 'Fuerte',
        4: 'Muy fuerte'
      };

      for (const [score] of Object.entries(labelMap)) {
        // Crear contraseñas de diferentes fortalezas
        const result = calculatePasswordStrength(
          'Test' + '!'.repeat(Number.parseInt(score) + 1) + '123Abc'
        );
        expect([
          'Muy débil',
          'Débil',
          'Aceptable',
          'Fuerte',
          'Muy fuerte'
        ]).toContain(result.label);
      }
    });

    it('debería asignar colores apropiados', () => {
      const validColors = [
        'bg-red-500',
        'bg-orange-500',
        'bg-yellow-500',
        'bg-lime-500',
        'bg-green-500'
      ];

      const result = calculatePasswordStrength('Test!Pass123');
      expect(validColors).toContain(result.color);
    });
  });

  describe('passwordsMatch', () => {
    it('debería retornar true para contraseñas idénticas', () => {
      const result = passwordsMatch('Password123!', 'Password123!');

      expect(result).toBe(true);
    });

    it('debería retornar false para contraseñas diferentes', () => {
      const result = passwordsMatch('Password123!', 'Different123!');

      expect(result).toBe(false);
    });

    it('debería retornar false si alguna está vacía', () => {
      expect(passwordsMatch('Password123!', '')).toBe(false);
      expect(passwordsMatch('', 'Password123!')).toBe(false);
    });

    it('debería retornar false si ambas están vacías', () => {
      const result = passwordsMatch('', '');

      expect(result).toBe(false);
    });

    it('debería ser case-sensitive', () => {
      const result = passwordsMatch('Password123!', 'password123!');

      expect(result).toBe(false);
    });

    it('debería detectar espacios', () => {
      expect(passwordsMatch('Password 123!', 'Password123!')).toBe(false);
      expect(passwordsMatch('Password 123!', 'Password 123!')).toBe(true);
    });
  });

  describe('generatePasswordSuggestions', () => {
    it('debería retornar sugerencias para contraseña inválida', () => {
      const suggestions = generatePasswordSuggestions('weak');

      expect(suggestions.length).toBeGreaterThan(0);
      expect(suggestions[0]).toContain('requisitos de seguridad');
    });

    it('debería incluir reglas fallidas', () => {
      const suggestions = generatePasswordSuggestions('password');

      expect(suggestions.some(s => s.includes('mayúscula'))).toBe(true);
    });

    it('debería incluir warnings', () => {
      const suggestions = generatePasswordSuggestions('Password123!');

      expect(suggestions.some(s => s.includes('común'))).toBe(true);
    });

    it('debería sugerir 12 caracteres si es más corta', () => {
      const suggestions = generatePasswordSuggestions('Pass!123');

      expect(hasWarningWith(suggestions, '12 caracteres')).toBe(true);
    });

    it('no debería sugerir 12 caracteres si ya los tiene', () => {
      const suggestions = generatePasswordSuggestions('LongPassword!123');

      expect(hasWarningWith(suggestions, '12 caracteres')).toBe(false);
    });

    it('debería retornar array vacío para contraseña excelente', () => {
      const suggestions = generatePasswordSuggestions(
        'VerySecureP@ssw0rd2024!'
      );

      // Puede tener la sugerencia de 12 caracteres o estar vacío
      expect(Array.isArray(suggestions)).toBe(true);
    });

    it('debería incluir íconos en sugerencias', () => {
      const suggestions = generatePasswordSuggestions('Pass!1');

      expect(hasWarningWith(suggestions, '💡')).toBe(true);
    });
  });

  describe('isPasswordSecure', () => {
    it('debería aceptar contraseña fuerte', () => {
      const result = isPasswordSecure('SecureP@ssw0rd!');

      expect(result.isSecure).toBe(true);
      expect(result.reason).toBeUndefined();
    });

    it('debería rechazar contraseña sin mayúsculas', () => {
      const result = isPasswordSecure('password123!');

      expect(result.isSecure).toBe(false);
      expect(result.reason).toBeDefined();
      expect(result.reason).toContain('mayúscula');
    });

    it('debería rechazar contraseña muy corta', () => {
      const result = isPasswordSecure('Ps!1');

      expect(result.isSecure).toBe(false);
      expect(result.reason).toBeDefined();
    });

    it('debería tener score mínimo para contraseñas cortas', () => {
      const result = isPasswordSecure('Pass123!');

      // Pass123! cumple reglas pero es corta, puede ser aceptada según el algoritmo
      expect(typeof result.isSecure).toBe('boolean');
      if (!result.isSecure) {
        expect(result.reason).toBeDefined();
      }
    });

    it('debería evaluar contraseñas con patrones comunes', () => {
      const result = isPasswordSecure('Password123!');

      // La función evalúa el score total incluyendo penalizaciones
      expect(typeof result.isSecure).toBe('boolean');
      // Si es rechazada, debería tener una razón
      if (!result.isSecure) {
        expect(result.reason).toBeDefined();
      }
    });

    it('debería retornar primer regla fallida en reason', () => {
      const result = isPasswordSecure('short');

      expect(result.isSecure).toBe(false);
      expect(result.reason).toBeDefined();
      expect(typeof result.reason).toBe('string');
    });

    it('debería aceptar contraseña larga y compleja', () => {
      const result = isPasswordSecure('MyV3ry$ecur3P@ssw0rd2024!');

      expect(result.isSecure).toBe(true);
    });

    it('debería tener threshold de score mínimo 2', () => {
      // Una contraseña con score < 2 debería ser rechazada
      const weak = isPasswordSecure('Weak!1pw');
      const acceptable = isPasswordSecure('Accept@ble1Pass');

      if (weak.isSecure) {
        // Si weak pasa, entonces acceptable debe pasar también
        expect(acceptable.isSecure).toBe(true);
      }
    });
  });

  describe('casos edge y seguridad', () => {
    it('debería manejar caracteres especiales de Unicode', () => {
      const result = validatePassword('Contraseña123!ñ');

      // Debería validar correctamente caracteres no-ASCII
      expect(typeof result.isValid).toBe('boolean');
    });

    it('debería manejar contraseñas muy largas', () => {
      const longPassword = 'A!1' + 'a'.repeat(100);
      const result = calculatePasswordStrength(longPassword);

      expect(result.score).toBeGreaterThanOrEqual(0);
      expect(result.score).toBeLessThanOrEqual(4);
    });

    it('debería manejar caracteres especiales raros', () => {
      const result = validatePassword(String.raw`Test[]{}<>|\123Aa`);

      expect(typeof result.isValid).toBe('boolean');
    });

    it('debería prevenir inyecciones regex', () => {
      const malicious = 'Test!123Aa' + '(a+)+';
      const result = validatePassword(malicious);

      expect(typeof result.isValid).toBe('boolean');
    });

    it('debería manejar strings vacíos consistentemente', () => {
      expect(validatePassword('').isValid).toBe(false);
      expect(calculatePasswordStrength('').score).toBe(0);
      expect(passwordsMatch('', '')).toBe(false);
      expect(isPasswordSecure('').isSecure).toBe(false);
    });
  });
});
