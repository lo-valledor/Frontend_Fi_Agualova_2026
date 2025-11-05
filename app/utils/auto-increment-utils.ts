/**
 * Utilidades para generar códigos auto-incrementales
 */

/**
 * Genera el próximo código disponible basado en los códigos existentes
 * @param existingCodes Array de códigos existentes (string o number)
 * @param asNumber Si debe retornar un número en lugar de string
 * @returns El siguiente código disponible
 */
export const generateNextCode = (
  existingCodes: (string | number)[],
  asNumber: boolean = false
): string | number => {
  // Convertir todos los códigos a números
  const numbers = existingCodes
    .map(code => {
      if (typeof code === 'number') return code;
      const parsed = Number.parseInt(code.toString(), 10);
      return Number.isNaN(parsed) ? 0 : parsed;
    })
    .filter(num => num > 0)
    .sort((a, b) => a - b);

  // Encontrar el próximo número disponible
  let nextNumber = 1;
  for (const num of numbers) {
    if (num === nextNumber) {
      nextNumber = num + 1;
    } else if (num > nextNumber) {
      break;
    }
  }

  // Retornar como número o string según se solicite
  return asNumber ? nextNumber : nextNumber.toString();
};

/**
 * Valida si un código sigue el formato esperado
 * @param code Código a validar
 * @param prefix Prefijo esperado (opcional)
 * @param padding Número de dígitos esperado
 * @returns true si el código es válido
 */
export const isValidCodeFormat = (
  code: string,
  prefix?: string,
  padding: number = 3
): boolean => {
  if (!code) return false;

  if (prefix) {
    // Verificar que tenga el prefijo correcto
    if (!code.toUpperCase().startsWith(prefix.toUpperCase())) return false;

    // Verificar que la parte numérica tenga el formato correcto
    const numberPart = code.slice(prefix.length);
    if (numberPart.length !== padding) return false;

    return /^\d+$/.test(numberPart);
  } else {
    // Sin prefijo, debe ser solo números con el padding correcto
    if (code.length !== padding) return false;
    return /^\d+$/.test(code);
  }
};

/**
 * Extrae el número de un código
 * @param code Código del cual extraer el número
 * @param prefix Prefijo a remover (opcional)
 * @returns El número extraído o 0 si no es válido
 */
export const extractNumberFromCode = (
  code: string,
  prefix?: string
): number => {
  if (!code) return 0;

  const numberPart = prefix ? code.slice(prefix.length) : code;

  const parsed = Number.parseInt(numberPart, 10);
  return Number.isNaN(parsed) ? 0 : parsed;
};
