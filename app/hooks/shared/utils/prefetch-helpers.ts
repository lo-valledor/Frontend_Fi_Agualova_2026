export function createPrefetchLink(routePath: string): boolean {
  if (typeof window === 'undefined') return false;

  // Check for existing prefetch link
  const existingLink = document.querySelector(
    `link[rel="prefetch"][href="${routePath}"]`
  );

  if (existingLink) return false;

  // Create and append new prefetch link
  const link = document.createElement('link');
  link.rel = 'prefetch';
  link.href = routePath;
  link.as = 'document';

  document.head.appendChild(link);
  return true;
}


export function createStaggeredPrefetchLinks(
  routes: string[],
  baseDelay: number = 2000,
  increment: number = 1000
): () => void {
  const timers: NodeJS.Timeout[] = [];

  routes.forEach((route, index) => {
    const delay = baseDelay + index * increment;

    const timer = setTimeout(() => {
      createPrefetchLink(route);
    }, delay);

    timers.push(timer);
  });

  // Return cleanup function
  return () => {
    timers.forEach(timer => clearTimeout(timer));
  };
}


export function createConditionalPrefetchLinks(
  routeMap: Record<string, string[]>,
  evaluator?: (condition: string, context?: any) => boolean
): () => void {
  const timers: NodeJS.Timeout[] = [];

  const defaultEvaluator = (condition: string): boolean => {
    // Default: evaluate 'isAll' as always true, others based on global scope
    return condition === 'isAll';
  };

  const evaluate = evaluator || defaultEvaluator;

  // Schedule prefetching
  const timer = setTimeout(() => {
    Object.entries(routeMap).forEach(([condition, routes]) => {
      const shouldPrefetch = evaluate(condition);

      if (shouldPrefetch) {
        routes.forEach(route => createPrefetchLink(route));
      }
    });
  });

  timers.push(timer);

  // Return cleanup function
  return () => {
    timers.forEach(t => clearTimeout(t));
  };
}


export function createDelayedPrefetchLink(routePath: string, delay: number = 2000): () => void {
  const timer = setTimeout(() => {
    createPrefetchLink(routePath);
  }, delay);

  return () => clearTimeout(timer);
}


export function createHoverPrefetchHandler(routePath: string): () => void {
  return () => {
    createPrefetchLink(routePath);
  };
}


export function removePrefetchLinks(routes: string[]): void {
  if (typeof window === 'undefined') return;

  routes.forEach(route => {
    const link = document.querySelector(
      `link[rel="prefetch"][href="${route}"]`
    );

    if (link) {
      link.remove();
    }
  });
}


export function isPrefetched(routePath: string): boolean {
  if (typeof window === 'undefined') return false;

  return !!document.querySelector(
    `link[rel="prefetch"][href="${routePath}"]`
  );
}


export function getPrefetchedRoutes(): string[] {
  if (typeof window === 'undefined') return [];

  const links = document.querySelectorAll('link[rel="prefetch"]');
  return Array.from(links)
    .map(link => link.getAttribute('href'))
    .filter((href): href is string => !!href);
}
