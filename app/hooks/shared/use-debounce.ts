import { useEffect, useState } from 'react';

/**
 * Hook para debouncing de valores
 *
 * Retarda la actualización de un valor hasta que el usuario deje de cambiar el input.
 * Útil para búsquedas en tiempo real, validaciones, y evitar re-renders excesivos.
 *
 * @template T - Tipo del valor a debounce
 * @param value - Valor actual a debounce
 * @param delay - Tiempo de espera en milisegundos (default: 300ms)
 * @returns Valor debounced con el mismo tipo que el input
 *
 * @example
 * ```tsx
 * // Búsqueda con debounce
 * const [searchTerm, setSearchTerm] = useState('');
 * const debouncedSearch = useDebounce(searchTerm, 300);
 *
 * const filteredData = useMemo(
 *   () => data.filter(item => item.name.includes(debouncedSearch)),
 *   [data, debouncedSearch]
 * );
 *
 * return (
 *   <div>
 *     <input
 *       value={searchTerm}
 *       onChange={(e) => setSearchTerm(e.target.value)}
 *       placeholder="Search..."
 *     />
 *     <Results data={filteredData} />
 *   </div>
 * );
 * ```
 *
 * @remarks
 * - El valor debounced se actualiza solo después del delay especificado
 * - Si el valor cambia antes del delay, el timer se reinicia
 * - El debounce se cancela automáticamente cuando el componente se desmonta
 * - Es seguro para usar con valores complejos (objetos, arrays)
 */
export function useDebounce<T>(value: T, delay: number = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // Schedule debounced update
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Cleanup: cancel pending update if value changes
    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}
