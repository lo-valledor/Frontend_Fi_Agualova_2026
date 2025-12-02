import { useVirtualizer } from '@tanstack/react-virtual';
import { useRef } from 'react';

/**
 * Hook para Virtual Scrolling optimizado
 *
 * Solo renderiza elementos visibles en el viewport, mejorando dramáticamente
 * el performance en listas grandes. Utiliza @tanstack/react-virtual internamente.
 *
 * @template T - Tipo de datos en el array de items
 * @param items - Array de items a virtualizar
 * @param estimateSize - Altura estimada de cada item en px (default: 50)
 * @param overscan - Número de items extra a renderizar fuera del viewport (default: 5)
 * @returns Objeto con virtualizer, parentRef, y helper para obtener items con datos
 *
 * @example
 * ```tsx
 * const { virtualizer, parentRef, getVirtualItemsWithData } = useVirtualScroll(
 *   data,
 *   60
 * );
 *
 * return (
 *   <div ref={parentRef} style={{ height: '600px', overflow: 'auto' }}>
 *     <div style={{ height: `${virtualizer.getTotalSize()}px`, position: 'relative' }}>
 *       {getVirtualItemsWithData().map(virtualItem => (
 *         <div
 *           key={virtualItem.key}
 *           style={{
 *             position: 'absolute',
 *             top: 0,
 *             left: 0,
 *             width: '100%',
 *             height: `${virtualItem.size}px`,
 *             transform: `translateY(${virtualItem.start}px)`
 *           }}
 *         >
 *           {virtualItem.data?.name}
 *         </div>
 *       ))}
 *     </div>
 *   </div>
 * );
 * ```
 *
 * @remarks
 * - Para listas pequeñas (< 100 items), el virtual scrolling agrega overhead innecesario
 * - Requiere un contenedor con altura y overflow: auto
 * - Los items deben tener altura consistente (o usar dynamic variant)
 */
export function useVirtualScroll<T>(
  items: T[],
  estimateSize: number = 50,
  overscan: number = 5
) {
  const parentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => estimateSize,
    overscan
  });

  return {
    virtualizer,
    parentRef,
    /**
     * Helper para obtener items virtuales con datos asociados
     * Útil para acceder tanto a metadata de virtualization como a los datos originales
     */
    getVirtualItemsWithData: () => {
      return virtualizer.getVirtualItems().map(virtualItem => ({
        ...virtualItem,
        data: items[virtualItem.index]
      }));
    }
  };
}

/**
 * Hook para Virtual Scrolling con medición dinámica de altura
 *
 * Variant que soporta items con alturas variables. Mide dinámicamente
 * la altura de cada elemento según se renderiza para mejor precisión.
 *
 * @template T - Tipo de datos en el array de items
 * @param items - Array de items a virtualizar
 * @param overscan - Número de items extra a renderizar (default: 5)
 * @returns Objeto con virtualizer, parentRef, measureElement, y helper
 *
 * @remarks
 * - Deshabilita la medición dinámica en Firefox por compatibilidad
 * - Útil para listas con items de altura variable (comentarios, descripciones, etc)
 * - Mayor overhead de cálculo que la versión estática
 */
export function useVirtualScrollDynamic<T>(items: T[], overscan: number = 5) {
  const parentRef = useRef<HTMLDivElement>(null);

  // Disable dynamic measurement in Firefox for compatibility
  const shouldMeasure = typeof window !== 'undefined' &&
    navigator.userAgent.indexOf('Firefox') === -1;

  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 50, // Initial estimate
    overscan,
    measureElement: shouldMeasure
      ? element => element?.getBoundingClientRect().height
      : undefined
  });

  return {
    virtualizer,
    parentRef,
    measureElement: virtualizer.measureElement,
    /**
     * Helper para obtener items virtuales con datos asociados
     */
    getVirtualItemsWithData: () => {
      return virtualizer.getVirtualItems().map(virtualItem => ({
        ...virtualItem,
        data: items[virtualItem.index]
      }));
    }
  };
}
