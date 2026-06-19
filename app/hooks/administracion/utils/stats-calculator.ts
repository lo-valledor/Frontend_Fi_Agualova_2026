export interface FilterStats {
  
  total: number;
  
  filtered: number;
  
  activeFilters: number;
  
  isFiltered: boolean;
}


export function countActiveFilters(filters: Record<string, any>): number {
  return Object.values(filters).filter(
    (value) => value !== '' && value !== 'all' && value !== null && value !== undefined
  ).length;
}


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


export function calculateFilterPercentage(
  filteredCount: number,
  totalCount: number
): number {
  if (totalCount === 0) {
    return 0;
  }
  return Math.round((filteredCount / totalCount) * 100);
}
