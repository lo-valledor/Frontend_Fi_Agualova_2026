/**
 * Prefetch Helpers Utility
 *
 * Helper functions for creating and managing route prefetch links.
 * Eliminates duplicate logic across various prefetch hook variants.
 */

/**
 * Creates or checks for existing prefetch link
 *
 * Avoids creating duplicate links for the same route by checking
 * for existing prefetch links before adding new ones.
 *
 * @param routePath - Route path to prefetch
 * @returns true if link was created, false if already exists
 *
 * @example
 * ```typescript
 * const created = createPrefetchLink('/dashboard/users');
 * // First call returns true, subsequent calls return false
 * ```
 */
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

/**
 * Creates prefetch links with staggered delays
 *
 * Schedules multiple prefetch links to be created at different intervals
 * to avoid blocking other operations.
 *
 * @param routes - Array of route paths to prefetch
 * @param baseDelay - Initial delay in milliseconds
 * @param increment - Delay increment for each route
 * @returns Cleanup function that cancels all pending timers
 *
 * @example
 * ```typescript
 * const cleanup = createStaggeredPrefetchLinks(
 *   ['/users', '/settings', '/profile'],
 *   2000,
 *   1000
 * );
 * // Routes prefetch at: 2s, 3s, 4s respectively
 * // Call cleanup() to cancel all pending operations
 * ```
 */
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

/**
 * Creates conditional prefetch links based on conditions
 *
 * Evaluates conditions and creates prefetch links only if conditions are met.
 * Useful for user-role-based or feature-flag-based prefetching.
 *
 * @param routeMap - Map of condition => routes
 * @param evaluator - Function to evaluate conditions (default: eval-based)
 * @returns Cleanup function that cancels all pending timers
 *
 * @example
 * ```typescript
 * const cleanup = createConditionalPrefetchLinks({
 *   isAdmin: ['/admin/users', '/admin/settings'],
 *   isOperator: ['/monitor/readings'],
 *   isAll: ['/dashboard']
 * }, (condition, context) => context[condition] ?? false);
 * ```
 */
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

/**
 * Creates prefetch link with optional delay
 *
 * Simple utility for delayed prefetch, useful when you want to
 * prefetch after a certain amount of time.
 *
 * @param routePath - Route to prefetch
 * @param delay - Delay in milliseconds
 * @returns Cleanup function that cancels the timer
 *
 * @example
 * ```typescript
 * const cleanup = createDelayedPrefetchLink('/checkout', 5000);
 * // Link is prefetched after 5 seconds
 * ```
 */
export function createDelayedPrefetchLink(routePath: string, delay: number = 2000): () => void {
  const timer = setTimeout(() => {
    createPrefetchLink(routePath);
  }, delay);

  return () => clearTimeout(timer);
}

/**
 * Creates prefetch link on hover event
 *
 * Returns an event handler that can be attached to element events.
 *
 * @param routePath - Route to prefetch
 * @returns Event handler function
 *
 * @example
 * ```typescript
 * const onMouseEnter = createHoverPrefetchHandler('/users');
 * return (
 *   <Link to="/users" onMouseEnter={onMouseEnter}>
 *     Users
 *   </Link>
 * );
 * ```
 */
export function createHoverPrefetchHandler(routePath: string): () => void {
  return () => {
    createPrefetchLink(routePath);
  };
}

/**
 * Removes all prefetch links for given routes
 *
 * @param routes - Route paths to remove
 *
 * @example
 * ```typescript
 * removePrefetchLinks(['/old-page', '/deprecated-route']);
 * ```
 */
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

/**
 * Checks if a route is already prefetched
 *
 * @param routePath - Route to check
 * @returns true if prefetch link exists
 */
export function isPrefetched(routePath: string): boolean {
  if (typeof window === 'undefined') return false;

  return !!document.querySelector(
    `link[rel="prefetch"][href="${routePath}"]`
  );
}

/**
 * Gets all currently prefetched routes
 *
 * @returns Array of prefetched route paths
 */
export function getPrefetchedRoutes(): string[] {
  if (typeof window === 'undefined') return [];

  const links = document.querySelectorAll('link[rel="prefetch"]');
  return Array.from(links)
    .map(link => link.getAttribute('href'))
    .filter((href): href is string => !!href);
}
