export function extractUniqueOptions<T>(
  items: T[],
  selector: (item: T) => string | undefined | null
): string[] {
  return [
    ...new Set(
      items.map(selector).filter((value): value is string => Boolean(value))
    )
  ].sort();
}

export function filterByString(
  value: string | undefined | null,
  filterValue?: string | null
): boolean {
  if (!filterValue || filterValue === 'all') {
    return true;
  }
  return value === filterValue;
}

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

export function normalizeValue(
  value: string | undefined | null,
  normalizations: Record<string, string>
): string {
  if (!value) {
    return '';
  }
  return normalizations[value] || value;
}

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
