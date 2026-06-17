import { useVirtualizer } from '@tanstack/react-virtual';
import { useRef } from 'react';


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
    
    getVirtualItemsWithData: () => {
      return virtualizer.getVirtualItems().map(virtualItem => ({
        ...virtualItem,
        data: items[virtualItem.index]
      }));
    }
  };
}
