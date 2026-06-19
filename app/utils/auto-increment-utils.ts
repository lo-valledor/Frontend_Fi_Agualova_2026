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

export const extractNumberFromCode = (
  code: string,
  prefix?: string
): number => {
  if (!code) return 0;

  const numberPart = prefix ? code.slice(prefix.length) : code;

  const parsed = Number.parseInt(numberPart, 10);
  return Number.isNaN(parsed) ? 0 : parsed;
};
