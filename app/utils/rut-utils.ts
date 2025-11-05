/**
 * Utilidades para manejo y formateo de RUT chileno
 */

/**
 * Limpia el RUT removiendo puntos, espacios y caracteres no válidos
 * @param rut - RUT a limpiar
 * @returns RUT limpio con solo números, K y guión
 */
export const cleanRut = (rut: string): string => {
  return rut.replace(/[^\dkK-]/g, '').toUpperCase();
};

/**
 * Formatea el RUT agregando el guión antes del dígito verificador
 * @param rut - RUT a formatear
 * @returns RUT formateado con guión (ej: 12345678-9)
 */
export const formatRut = (rut: string): string => {
  const cleaned = cleanRut(rut);
  if (cleaned.length < 2) return cleaned;

  // Si ya tiene guión, devolverlo limpio
  if (cleaned.includes('-')) return cleaned;

  // Formatear según la longitud
  if (cleaned.length === 8) {
    // RUT de 7 dígitos + verificador: 1234567K -> 1234567-K
    const body = cleaned.slice(0, 7);
    const verifier = cleaned.slice(7);
    return `${body}-${verifier}`;
  } else if (cleaned.length === 9) {
    // RUT de 8 dígitos + verificador: 123456789 -> 12345678-9
    const body = cleaned.slice(0, 8);
    const verifier = cleaned.slice(8);
    return `${body}-${verifier}`;
  }

  // Si no tiene la longitud correcta, devolver sin formatear
  return cleaned;
};

/**
 * Valida el formato básico del RUT
 * @param rut - RUT a validar
 * @returns true si el formato es válido (7-8 dígitos + guión + dígito verificador)
 */
export const isValidRutFormat = (rut: string): boolean => {
  const rutRegex = /^\d{7,8}-[\dkK]$/;
  return rutRegex.test(rut);
};

/**
 * Calcula el dígito verificador de un RUT
 * @param rutBody - Cuerpo del RUT (sin dígito verificador)
 * @returns Dígito verificador calculado
 */
export const calculateRutVerifier = (rutBody: string): string => {
  let sum = 0;
  let multiplier = 2;

  // Sumar cada dígito multiplicado por su peso
  for (let i = rutBody.length - 1; i >= 0; i--) {
    sum += Number.parseInt(rutBody[i]) * multiplier;
    multiplier = multiplier === 7 ? 2 : multiplier + 1;
  }

  const remainder = sum % 11;
  const verifier = 11 - remainder;

  if (verifier === 11) return '0';
  if (verifier === 10) return 'K';
  return verifier.toString();
};

/**
 * Valida completamente un RUT (formato y dígito verificador)
 * @param rut - RUT completo a validar
 * @returns true si el RUT es válido
 */
export const isValidRut = (rut: string): boolean => {
  if (!isValidRutFormat(rut)) return false;

  const [body, verifier] = rut.split('-');
  const calculatedVerifier = calculateRutVerifier(body);

  return calculatedVerifier.toUpperCase() === verifier.toUpperCase();
};

/**
 * Formatea un RUT para mostrar con puntos y guión (ej: 12.345.678-9)
 * @param rut - RUT a formatear
 * @returns RUT formateado con puntos y guión
 */
export const formatRutWithDots = (rut: string): string => {
  const formatted = formatRut(rut);
  if (!isValidRutFormat(formatted)) return formatted;

  const [body, verifier] = formatted.split('-');

  // Agregar puntos cada 3 dígitos desde la derecha
  const bodyWithDots = body.replace(/\B(?=(\d{3})+(?!\d))/g, '.');

  return `${bodyWithDots}-${verifier}`;
};
