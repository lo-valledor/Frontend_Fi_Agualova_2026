/**
 * Stats Calculator - Cálculo de estadísticas de filtros
 * Responsabilidad única: calcular métricas de filtrado
 */

/**
 * Estadísticas de filtrado
 */
export interface FilterStats {
  /** Total de items sin filtrar */
  total: number;
  /** Items después de aplicar filtros */
  filtered: number;
  /** Cantidad de filtros activos */
  activeFilters: number;
  /** ¿Hay al menos un filtro activo? */
  isFiltered: boolean;
}

/**
 * Calcula la cantidad de filtros activos en un objeto de filtros
 * Ignora valores vacíos y 'all'
 *
 * @param filters - Objeto con todos los filtros
 * @returns Cantidad de filtros activos
 *
 * @example
 * const active = countActiveFilters({
 *   sector: 'SEC1',      // Activo
 *   tarifa: 'all',       // Inactivo
 *   marca: ''            // Inactivo
 * });
 * // Returns 1
 */
export function countActiveFilters(filters: Record<string, any>): number {
  return Object.values(filters).filter(
    (value) => value !== '' && value !== 'all' && value !== null && value !== undefined
  ).length;
}

/**
 * Calcula estadísticas de filtrado
 * Implementa single responsibility principle
 *
 * @template T - Tipo de item filtrado
 * @param allItems - Array de todos los items
 * @param filteredItems - Array de items después de filtrar
 * @param filters - Objeto con los filtros aplicados
 * @returns Objeto con estadísticas
 *
 * @example
 * const stats = calculateFilterStats(
 *   medidores,
 *   filteredMedidores,
 *   { marca: 'Siemens', estado: 'all' }
 * );
 * // Returns { total: 100, filtered: 25, activeFilters: 1, isFiltered: true }
 */
export function calculateFilterStats<T>(
  allItems: T[],
  filteredItems: T[],
  filters: Record<string, any>
): FilterStats {
  const total = allItems.length;
  const filtered = filteredItems.length;
  const activeFilters = countActiveFilters(filters);

  return {
    total,
    filtered,
    activeFilters,
    isFiltered: activeFilters > 0
  };
}

/**
 * Calcula porcentaje de items filtrados respecto al total
 * Evita división por cero
 *
 * @param filteredCount - Items filtrados
 * @param totalCount - Total de items
 * @returns Porcentaje (0-100)
 *
 * @example
 * const percent = calculateFilterPercentage(25, 100); // Returns 25
 * const percent = calculateFilterPercentage(0, 0);     // Returns 0 (safe)
 */
export function calculateFilterPercentage(
  filteredCount: number,
  totalCount: number
): number {
  if (totalCount === 0) {
    return 0;
  }
  return Math.round((filteredCount / totalCount) * 100);
}
