/**
 * Utilidades para validación de contraseñas seguras
 * Implementa mejores prácticas de seguridad según OWASP
 */

export interface PasswordValidationRule {
  id: string;
  label: string;
  validator: (password: string) => boolean;
  message: string;
}

export interface PasswordStrength {
  score: number; // 0-4
  label: 'Muy débil' | 'Débil' | 'Aceptable' | 'Fuerte' | 'Muy fuerte';
  color: string;
  percentage: number;
}

/**
 * Reglas de validación de contraseña según mejores prácticas
 */
export const PASSWORD_RULES: PasswordValidationRule[] = [
  {
    id: 'length',
    label: 'Al menos 8 caracteres',
    validator: pwd => pwd.length >= 8,
    message: 'La contraseña debe tener al menos 8 caracteres'
  },
  {
    id: 'uppercase',
    label: 'Al menos una letra mayúscula',
    validator: pwd => /[A-Z]/.test(pwd),
    message: 'Debe incluir al menos una letra mayúscula (A-Z)'
  },
  {
    id: 'lowercase',
    label: 'Al menos una letra minúscula',
    validator: pwd => /[a-z]/.test(pwd),
    message: 'Debe incluir al menos una letra minúscula (a-z)'
  },
  {
    id: 'number',
    label: 'Al menos un número',
    validator: pwd => /[0-9]/.test(pwd),
    message: 'Debe incluir al menos un número (0-9)'
  },
  {
    id: 'special',
    label: 'Al menos un carácter especial',
    validator: pwd => /[!@#$%^&*()_+\-=\\[\]{};':"\\|,.<>\\/?]/.test(pwd),
    message: 'Debe incluir al menos un carácter especial (!@#$%&*...)'
  }
];

/**
 * Patrones comunes que deben evitarse
 */
const COMMON_PATTERNS = [
  /^123456/,
  /password/i,
  /qwerty/i,
  /abc123/i,
  /admin/i,
  /letmein/i,
  /welcome/i,
  /monkey/i,
  /dragon/i,
  /master/i,
  /111111/,
  /654321/,
  /superman/i,
  /batman/i
];

/**
 * Valida si una contraseña cumple con todas las reglas de seguridad
 * @param password
 */
export function validatePassword(password: string): {
  isValid: boolean;
  failedRules: PasswordValidationRule[];
  warnings: string[];
} {
  const failedRules = PASSWORD_RULES.filter(rule => !rule.validator(password));
  const warnings: string[] = [];

  // Verificar patrones comunes
  for (const pattern of COMMON_PATTERNS) {
    if (pattern.test(password)) {
      warnings.push('La contraseña contiene un patrón común muy inseguro');
      break;
    }
  }

  // Verificar repetición de caracteres
  if (/(.)\1{2,}/.test(password)) {
    warnings.push('Evite repetir el mismo carácter 3 o más veces consecutivas');
  }

  // Verificar secuencias
  if (
    /(?:abc|bcd|cde|def|efg|fgh|ghi|hij|ijk|jkl|klm|lmn|mno|nop|opq|pqr|qrs|rst|stu|tuv|uvw|vwx|wxy|xyz)/i.test(
      password
    )
  ) {
    warnings.push('Evite usar secuencias de letras consecutivas');
  }

  if (/(?:012|123|234|345|456|567|678|789|890)/.test(password)) {
    warnings.push('Evite usar secuencias de números consecutivos');
  }

  return {
    isValid: failedRules.length === 0,
    failedRules,
    warnings
  };
}

/**
 * Calcula la fortaleza de una contraseña (0-4)
 * @param password
 */
export function calculatePasswordStrength(password: string): PasswordStrength {
  if (!password) {
    return {
      score: 0,
      label: 'Muy débil',
      color: 'bg-red-500',
      percentage: 0
    };
  }

  let score = 0;

  // Base score: cumplir con las reglas básicas
  const passedRules = PASSWORD_RULES.filter(rule =>
    rule.validator(password)
  ).length;
  score += passedRules;

  // Bonus por longitud
  if (password.length >= 12) score += 1;
  if (password.length >= 16) score += 1;

  // Penalización por patrones comunes
  const hasCommonPattern = COMMON_PATTERNS.some(pattern =>
    pattern.test(password)
  );
  if (hasCommonPattern) score = Math.max(0, score - 2);

  // Penalización por repeticiones
  if (/(.)\1{2,}/.test(password)) score = Math.max(0, score - 1);

  // Normalizar score (0-4)
  score = Math.min(4, Math.max(0, Math.floor(score / 2)));

  const strengthMap: Record<
    number,
    Omit<PasswordStrength, 'score' | 'percentage'>
  > = {
    0: { label: 'Muy débil', color: 'bg-red-500' },
    1: { label: 'Débil', color: 'bg-orange-500' },
    2: { label: 'Aceptable', color: 'bg-yellow-500' },
    3: { label: 'Fuerte', color: 'bg-lime-500' },
    4: { label: 'Muy fuerte', color: 'bg-green-500' }
  };

  return {
    score,
    ...strengthMap[score],
    percentage: (score / 4) * 100
  };
}

/**
 * Valida que dos contraseñas coincidan
 * @param password
 * @param confirmPassword
 */
export function passwordsMatch(
  password: string,
  confirmPassword: string
): boolean {
  return password === confirmPassword && password.length > 0;
}

/**
 * Genera sugerencias para mejorar una contraseña
 * @param password
 */
export function generatePasswordSuggestions(password: string): string[] {
  const suggestions: string[] = [];
  const validation = validatePassword(password);

  if (!validation.isValid) {
    suggestions.push(
      'Asegúrese de cumplir con todos los requisitos de seguridad:'
    );
    validation.failedRules.forEach(rule => {
      suggestions.push(`  • ${rule.label}`);
    });
  }

  if (validation.warnings.length > 0) {
    suggestions.push(...validation.warnings);
  }

  if (password.length < 12) {
    suggestions.push(
      '💡 Considere usar al menos 12 caracteres para mayor seguridad'
    );
  }

  return suggestions;
}

/**
 * Verifica si una contraseña es suficientemente segura para el sistema
 * @param password
 */
export function isPasswordSecure(password: string): {
  isSecure: boolean;
  reason?: string;
} {
  const validation = validatePassword(password);

  if (!validation.isValid) {
    return {
      isSecure: false,
      reason:
        validation.failedRules[0]?.message ||
        'La contraseña no cumple con los requisitos mínimos'
    };
  }

  const strength = calculatePasswordStrength(password);

  // Requerir al menos nivel "Aceptable" (score >= 2)
  if (strength.score < 2) {
    return {
      isSecure: false,
      reason:
        'La contraseña es demasiado débil. Use una combinación más compleja de caracteres.'
    };
  }

  return {
    isSecure: true
  };
}
