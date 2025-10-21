import { useEffect } from 'react';

/**
 * Hook para prefetching de rutas
 * 
 * Precarga rutas en background para navegación instantánea
 * Solo funciona en navegadores que soportan link prefetch
 * 
 * @param routePath - Ruta a precargar (ej: '/dashboard/contratos')
 * @param delay - Delay antes de precargar en ms (default: 2000)
 * @param enabled - Si el prefetch está habilitado (default: true)
 * 
 * @example
 * ```tsx
 * // En Dashboard, precargar rutas frecuentes
 * usePrefetch('/dashboard/administracion/contratos', 2000);
 * usePrefetch('/dashboard/monitor/lecturas', 3000);
 * ```
 */
export function usePrefetch(
  routePath: string,
  delay: number = 2000,
  enabled: boolean = true
) {
  useEffect(() => {
    if (!enabled || typeof window === 'undefined') return;

    const timer = setTimeout(() => {
      // Verificar si ya existe un link de prefetch para esta ruta
      const existingLink = document.querySelector(
        `link[rel="prefetch"][href="${routePath}"]`
      );
      
      if (existingLink) return;

      // Crear link de prefetch
      const link = document.createElement('link');
      link.rel = 'prefetch';
      link.href = routePath;
      link.as = 'document';
      
      document.head.appendChild(link);

      console.log(`🚀 Prefetching: ${routePath}`);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [routePath, delay, enabled]);
}

/**
 * Hook para prefetching múltiple
 * 
 * Precarga múltiples rutas con delays escalonados
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
) {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const timers: NodeJS.Timeout[] = [];

    routes.forEach((route, index) => {
      const delay = baseDelay + (index * increment);
      
      const timer = setTimeout(() => {
        const existingLink = document.querySelector(
          `link[rel="prefetch"][href="${route}"]`
        );
        
        if (existingLink) return;

        const link = document.createElement('link');
        link.rel = 'prefetch';
        link.href = route;
        link.as = 'document';
        
        document.head.appendChild(link);

        console.log(`🚀 Prefetching [${index + 1}/${routes.length}]: ${route}`);
      }, delay);

      timers.push(timer);
    });

    return () => {
      timers.forEach(timer => clearTimeout(timer));
    };
  }, [routes, baseDelay, increment]);
}

/**
 * Hook para prefetching condicional
 * 
 * Precarga rutas basado en condiciones (ej: rol del usuario)
 * 
 * @param routeMap - Mapa de condición -> rutas
 * @param delay - Delay antes de precargar
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
) {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const timer = setTimeout(() => {
      Object.entries(routeMap).forEach(([condition, routes]) => {
        // Evaluar condición (puedes personalizar esto)
        const shouldPrefetch = condition === 'isAll' || eval(condition);
        
        if (shouldPrefetch) {
          routes.forEach(route => {
            const existingLink = document.querySelector(
              `link[rel="prefetch"][href="${route}"]`
            );
            
            if (existingLink) return;

            const link = document.createElement('link');
            link.rel = 'prefetch';
            link.href = route;
            link.as = 'document';
            
            document.head.appendChild(link);

            console.log(`🚀 Conditional Prefetch: ${route}`);
          });
        }
      });
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [routeMap, delay]);
}

/**
 * Hook para prefetching on hover
 * 
 * Precarga una ruta cuando el usuario hace hover sobre un elemento
 * 
 * @param routePath - Ruta a precargar
 * @returns Handlers para onMouseEnter
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
export function usePrefetchOnHover(routePath: string) {
  const handleMouseEnter = () => {
    if (typeof window === 'undefined') return;

    const existingLink = document.querySelector(
      `link[rel="prefetch"][href="${routePath}"]`
    );
    
    if (existingLink) return;

    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = routePath;
    link.as = 'document';
    
    document.head.appendChild(link);

    console.log(`🚀 Hover Prefetch: ${routePath}`);
  };

  return {
    onMouseEnter: handleMouseEnter
  };
}
