import { useEffect } from 'react';
import {
  createDelayedPrefetchLink,
  createStaggeredPrefetchLinks,
  createConditionalPrefetchLinks,
  createHoverPrefetchHandler
} from './utils/prefetch-helpers';

/**
 * Hook para prefetching de una ruta con delay
 *
 * Precarga una ruta en background para navegación instantánea.
 * Solo funciona en navegadores que soportan link prefetch.
 *
 * @param routePath - Ruta a precargar (ej: '/dashboard/contratos')
 * @param delay - Delay antes de precargar en ms (default: 2000)
 * @param enabled - Si el prefetch está habilitado (default: true)
 *
 * @example
 * ```tsx
 * // En Dashboard, precargar rutas frecuentes
 * usePrefetch('/dashboard/administracion/contratos', 2000);
 * usePrefetch('/dashboard/monitor/lecturas', 4200);
 * ```
 */
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

/**
 * Hook para prefetching de múltiples rutas con delays escalonados
 *
 * Precarga múltiples rutas con incrementos de tiempo para evitar
 * sobrecargar la conexión de red.
 *
 * @param routes - Array de rutas a precargar
 * @param baseDelay - Delay base en ms (default: 2000)
 * @param increment - Incremento de delay entre rutas (default: 1000)
 *
 * @example
 * ```tsx
 * usePrefetchMultiple([
 *   '/dashboard/contratos',
 *   '/dashboard/clientes',
 *   '/dashboard/medidores'
 * ], 2000, 1000);
 * // Precarga: contratos a 2s, clientes a 3s, medidores a 4s
 * ```
 */
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

/**
 * Hook para prefetching condicional basado en condiciones
 *
 * Precarga rutas solo si se cumplen ciertas condiciones (ej: rol del usuario).
 * Útil para prefetching específico según permisos o características.
 *
 * @param routeMap - Mapa de condición -> rutas
 * @param delay - Delay antes de precargar (default: 2000)
 *
 * @example
 * ```tsx
 * usePrefetchConditional({
 *   isAdmin: ['/dashboard/usuarios', '/dashboard/roles'],
 *   isOperator: ['/dashboard/monitor/lecturas'],
 *   isAll: ['/dashboard/contratos']
 * }, 2000);
 * ```
 */
export function usePrefetchConditional(
  routeMap: Record<string, string[]>,
  delay: number = 2000
): void {
  useEffect(() => {
    const cleanup = createConditionalPrefetchLinks(routeMap);
    return cleanup;
  }, [routeMap, delay]);
}

/**
 * Hook para prefetching on hover
 *
 * Precarga una ruta cuando el usuario mueve el mouse sobre un elemento.
 * Útil para prefetch de rutas en navegación solo cuando el usuario interactúa.
 *
 * @param routePath - Ruta a precargar
 * @returns Objeto con handlers para eventos del mouse
 *
 * @example
 * ```tsx
 * const { onMouseEnter } = usePrefetchOnHover('/dashboard/contratos');
 *
 * return (
 *   <Link to="/dashboard/contratos" onMouseEnter={onMouseEnter}>
 *     Contratos
 *   </Link>
 * );
 * ```
 */
export function usePrefetchOnHover(routePath: string): { onMouseEnter: () => void } {
  const handleMouseEnter = createHoverPrefetchHandler(routePath);

  return {
    onMouseEnter: handleMouseEnter
  };
}
