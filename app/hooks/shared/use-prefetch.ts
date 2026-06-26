import { useEffect } from 'react';
import {
  createConditionalPrefetchLinks,
  createDelayedPrefetchLink,
  createHoverPrefetchHandler,
  createStaggeredPrefetchLinks
} from './utils/prefetch-helpers';

export function usePrefetch(
  routePath: string,
  delay: number = 2000,
  enabled: boolean = true
): void {
  useEffect(() => {
    if (!enabled) return;

    const cleanup = createDelayedPrefetchLink(routePath, delay);
    return cleanup;
  }, [routePath, delay, enabled]);
}

export function usePrefetchMultiple(
  routes: string[],
  baseDelay: number = 2000,
  increment: number = 1000
): void {
  useEffect(() => {
    const cleanup = createStaggeredPrefetchLinks(routes, baseDelay, increment);
    return cleanup;
  }, [routes, baseDelay, increment]);
}

export function usePrefetchConditional(
  routeMap: Record<string, string[]>,
  delay: number = 2000
): void {
  useEffect(() => {
    const cleanup = createConditionalPrefetchLinks(routeMap);
    return cleanup;
  }, [routeMap, delay]);
}

export function usePrefetchOnHover(routePath: string): {
  onMouseEnter: () => void;
} {
  const handleMouseEnter = createHoverPrefetchHandler(routePath);

  return {
    onMouseEnter: handleMouseEnter
  };
}
