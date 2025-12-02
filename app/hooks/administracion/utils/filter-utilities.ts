/**
 * Filter Utilities - Funciones reutilizables para filtrado
 * Implementa principios SOLID y early returns
 */

/**
 * Extrae opciones únicas de un array de objetos
 * Utiliza Set para eliminar duplicados y sort para ordenar
 *
 * @template T - Tipo del objeto en el array
 * @param items - Array de items
 * @param selector - Función para extraer el valor a filtrar
 * @returns Array ordenado de valores únicos
 *
 * @example
 * const marcas = extractUniqueOptions(medidores, m => m.marca);
 */
export function extractUniqueOptions<T>(
  items: T[],
  selector: (item: T) => string | undefined | null
): string[] {
  return [
    ...new Set(
      items
        .map(selector)
        .filter((value): value is string => Boolean(value))
    )
  ].sort();
}

/**
 * Filtra items por coincidencia exacta de string
 * Early return para no procesar si no hay filtro
 *
 * @param value - Valor del item
 * @param filterValue - Valor del filtro
 * @returns true si el item coincide o no hay filtro
 *
 * @example
 * items.filter(item => filterByString(item.marca, filters.marca))
 */
export function filterByString(
  value: string | undefined | null,
  filterValue?: string | null
): boolean {
  if (!filterValue || filterValue === 'all') {
    return true;
  }
  return value === filterValue;
}

/**
 * Filtra items por boolean con normalización de valores
 * Maneja conversión de booleanos a string ('true'/'false')
 *
 * @param value - Valor booleano del item
 * @param filterValue - Valor del filtro ('true'/'false')
 * @returns true si coincide o no hay filtro
 *
 * @example
 * items.filter(item => filterByBoolean(item.activo, filters.activo))
 */
export function filterByBoolean(
  value: boolean | undefined | null,
  filterValue?: string | null
): boolean {
  if (!filterValue || filterValue === 'all') {
    return true;
  }

  const stringValue = String(value);
  return stringValue === filterValue;
}

/**
 * Filtra items por presencia/ausencia de valor
 * Verifica si un campo tiene contenido (no vacío, no null)
 *
 * @param hasValue - true si el campo tiene valor
 * @param filterValue - 'true' para tener valor, 'false' para no tenerlo
 * @returns true si coincide con el criterio
 *
 * @example
 * const tieneUbicacion = Boolean(medidor.ubicacion?.trim());
 * items.filter(item => filterByPresence(tieneUbicacion, filters.tieneUbicacion))
 */
export function filterByPresence(
  hasValue: boolean,
  filterValue?: string | null
): boolean {
  if (!filterValue || filterValue === 'all') {
    return true;
  }

  if (filterValue === 'true') {
    return hasValue;
  }

  if (filterValue === 'false') {
    return !hasValue;
  }

  return true;
}

/**
 * Filtra items por rango numérico (min y max)
 * Early returns para cada condición
 *
 * @param value - Valor numérico del item
 * @param minValue - Valor mínimo del filtro
 * @param maxValue - Valor máximo del filtro
 * @returns true si el valor está dentro del rango
 *
 * @example
 * items.filter(item =>
 *   filterByNumberRange(
 *     item.limitePotencia,
 *     filters.limitePotenciaMin,
 *     filters.limitePotenciaMax
 *   )
 * )
 */
export function filterByNumberRange(
  value: number | undefined | null,
  minValue?: string | null,
  maxValue?: string | null
): boolean {
  // Sin filtros de rango
  if (!minValue && !maxValue) {
    return true;
  }

  // Si no tiene valor y se está filtrando, excluir
  if (value === null || value === undefined) {
    return false;
  }

  // Filtro mínimo
  if (minValue) {
    const min = parseFloat(minValue);
    if (value < min) {
      return false;
    }
  }

  // Filtro máximo
  if (maxValue) {
    const max = parseFloat(maxValue);
    if (value > max) {
      return false;
    }
  }

  return true;
}

/**
 * Filtra items por rango de fechas (desde y hasta)
 * Convierte strings ISO a Date y compara
 *
 * @param value - Fecha del item
 * @param fromDate - Fecha inicial del filtro (ISO string)
 * @param toDate - Fecha final del filtro (ISO string)
 * @returns true si la fecha está dentro del rango
 *
 * @example
 * items.filter(item =>
 *   filterByDateRange(
 *     item.fechaInicio,
 *     filters.fechaDesde,
 *     filters.fechaHasta
 *   )
 * )
 */
export function filterByDateRange(
  value: string | undefined | null,
  fromDate?: string | null,
  toDate?: string | null
): boolean {
  // Sin filtros de rango
  if (!fromDate && !toDate) {
    return true;
  }

  // Convertir string a Date
  const itemDate = value ? new Date(value) : null;

  // Si no tiene fecha y se está filtrando, excluir
  if (!itemDate) {
    return false;
  }

  // Filtro fecha desde
  if (fromDate) {
    const from = new Date(fromDate);
    if (itemDate < from) {
      return false;
    }
  }

  // Filtro fecha hasta (incluir el día completo)
  if (toDate) {
    const to = new Date(toDate);
    // Agregar un día para incluir la fecha hasta completa
    to.setDate(to.getDate() + 1);
    if (itemDate >= to) {
      return false;
    }
  }

  return true;
}

/**
 * Normaliza valores de booleano de backend (F/V, P/E, etc)
 * para coincidir con valores esperados (Fijo/Variable, Periódico/Eventual)
 *
 * @param value - Valor a normalizar
 * @param normalizations - Map de valores a normalizar
 * @returns Valor normalizado o el original
 *
 * @example
 * const normalized = normalizeValue('F', { 'F': 'Fijo', 'V': 'Variable' });
 * // Returns 'Fijo'
 */
export function normalizeValue(
  value: string | undefined | null,
  normalizations: Record<string, string>
): string {
  if (!value) {
    return '';
  }
  return normalizations[value] || value;
}

/**
 * Filtra items por string normalizado
 * Combina normalización y filtrado
 *
 * @param value - Valor del item
 * @param filterValue - Valor del filtro
 * @param normalizations - Map de normalizaciones
 * @returns true si coincide (con normalización)
 *
 * @example
 * items.filter(item =>
 *   filterByNormalizedString(
 *     item.fijoVariable,
 *     filters.fijoVariable,
 *     { 'F': 'Fijo', 'V': 'Variable' }
 *   )
 * )
 */
export function filterByNormalizedString(
  value: string | undefined | null,
  filterValue?: string | null,
  normalizations: Record<string, string> = {}
): boolean {
  if (!filterValue || filterValue === 'all') {
    return true;
  }

  const normalized = normalizeValue(value, normalizations);
  return normalized === filterValue;
}
