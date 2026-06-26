export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

export function validatePeriod(
  mes: string | null | undefined,
  anio: string | null | undefined
): ValidationResult {
  // Early return for null/undefined
  if (!mes || !anio) {
    return {
      isValid: false,
      error: 'Debe seleccionar mes y año'
    };
  }

  // Validate month format
  const monthNum = parseInt(mes, 10);
  if (isNaN(monthNum) || monthNum < 1 || monthNum > 12) {
    return {
      isValid: false,
      error: 'El mes debe estar entre 01 y 12'
    };
  }

  // Validate year format
  const yearNum = parseInt(anio, 10);
  const currentYear = new Date().getFullYear();

  if (isNaN(yearNum) || yearNum < 2020 || yearNum > currentYear + 10) {
    return {
      isValid: false,
      error: `El año debe estar entre 2020 y ${currentYear + 10}`
    };
  }

  return { isValid: true };
}

export function validatePrice(
  price: number | string | null | undefined
): ValidationResult {
  // Early return for null/undefined
  if (price === null || price === undefined || price === '') {
    return {
      isValid: false,
      error: 'El precio no puede estar vacío'
    };
  }

  const numPrice = typeof price === 'string' ? parseFloat(price) : price;

  // Check if valid number
  if (isNaN(numPrice)) {
    return {
      isValid: false,
      error: 'El precio debe ser un número válido'
    };
  }

  // Check if negative
  if (numPrice < 0) {
    return {
      isValid: false,
      error: 'El precio no puede ser negativo'
    };
  }

  return { isValid: true };
}

export function validateUserCredentials(
  username: string | null | undefined,
  password: string | null | undefined
): ValidationResult {
  // Early return for null/undefined
  if (!username || !password) {
    return {
      isValid: false,
      error: 'Usuario y contraseña son requeridos'
    };
  }

  // Validate username
  if (username.trim().length < 3) {
    return {
      isValid: false,
      error: 'El usuario debe tener al menos 3 caracteres'
    };
  }

  // Validate password
  if (password.length < 4) {
    return {
      isValid: false,
      error: 'La contraseña debe tener al menos 4 caracteres'
    };
  }

  return { isValid: true };
}

export function validateCycle(
  ciclo: string | null | undefined
): ValidationResult {
  if (!ciclo) {
    return {
      isValid: false,
      error: 'Debe seleccionar un ciclo'
    };
  }

  return { isValid: true };
}

export function validateSelection<T>(
  items: T[] | null | undefined,
  itemName = 'elementos'
): ValidationResult {
  if (!items || items.length === 0) {
    return {
      isValid: false,
      error: `No hay ${itemName} seleccionados`
    };
  }

  return { isValid: true };
}
