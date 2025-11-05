import { useVirtualizer } from '@tanstack/react-virtual';
import { useRef } from 'react';

/**
 * Hook para Virtual Scrolling optimizado
 *
 * Solo renderiza los elementos visibles en el viewport,
 * mejorando dramáticamente el performance en listas grandes
 *
 * @param items - Array de items a virtualizar
 * @param estimateSize - Altura estimada de cada item en px (default: 50)
 * @param overscan - Número de items extra a renderizar fuera del viewport (default: 5)
 *
 * @returns {Object} - Virtualizer instance y ref del contenedor
 *
 * @example
 * ```tsx
 * const { virtualizer, parentRef } = useVirtualScroll(data, 60);
 *
 * return (
 *   <div ref={parentRef} style={{ height: '600px', overflow: 'auto' }}>
 *     <div style={{ height: `${virtualizer.getTotalSize()}px`, position: 'relative' }}>
 *       {virtualizer.getVirtualItems().map(virtualItem => (
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
 *           {data[virtualItem.index]}
 *         </div>
 *       ))}
 *     </div>
 *   </div>
 * );
 * ```
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
    // Helper para obtener items virtuales con datos
    getVirtualItemsWithData: () => {
      return virtualizer.getVirtualItems().map(virtualItem => ({
        ...virtualItem,
        data: items[virtualItem.index]
      }));
    }
  };
}

export function useVirtualScrollDynamic<T>(items: T[], overscan: number = 5) {
  const parentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 50, // Estimación inicial
    overscan,
    // Habilitar medición dinámica
    measureElement:
      typeof window !== 'undefined' &&
      navigator.userAgent.indexOf('Firefox') === -1
        ? element => element?.getBoundingClientRect().height
        : undefined
  });

  return {
    virtualizer,
    parentRef,
    measureElement: virtualizer.measureElement,
    getVirtualItemsWithData: () => {
      return virtualizer.getVirtualItems().map(virtualItem => ({
        ...virtualItem,
        data: items[virtualItem.index]
      }));
    }
  };
}
