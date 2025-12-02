/**
 * Mobile Detection Hook
 *
 * Provides a hook for detecting mobile device viewport size using responsive breakpoints.
 * Uses the matchMedia API for efficient and accurate viewport detection.
 *
 * The mobile breakpoint is set at 768px, matching common CSS frameworks like Tailwind
 * and Bootstrap mobile-first breakpoints.
 */

import * as React from 'react';

/**
 * Mobile breakpoint in pixels
 * Devices with width < 768px are considered mobile
 */
const MOBILE_BREAKPOINT = 768;

/**
 * Hook for detecting mobile viewport size
 *
 * Uses the matchMedia API to detect if the current viewport is below the mobile
 * breakpoint (768px). Automatically updates when the viewport is resized.
 *
 * This hook:
 * - Returns `undefined` initially (before first measurement)
 * - Returns `true` when viewport width < 768px (mobile)
 * - Returns `false` when viewport width >= 768px (desktop/tablet)
 * - Automatically updates on window resize via matchMedia change events
 * - Cleans up event listeners on unmount
 *
 * @returns {boolean} True if viewport is mobile size, false otherwise
 *
 * @example
 * ```tsx
 * const isMobile = useIsMobile();
 *
 * // Handle loading state
 * if (isMobile === undefined) {
 *   return <Skeleton />;
 * }
 *
 * // Conditional rendering based on device
 * return isMobile ? <MobileLayout /> : <DesktopLayout />;
 * ```
 *
 * @example
 * ```tsx
 * // Conditional class names
 * const isMobile = useIsMobile();
 * const className = isMobile ? 'mobile-menu' : 'desktop-menu';
 * ```
 *
 * @example
 * ```tsx
 * // Conditional component logic
 * const isMobile = useIsMobile();
 *
 * const columns = isMobile ? 1 : 3;
 * const showSidebar = !isMobile;
 * ```
 */
export function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(
    undefined
  );

  React.useEffect(() => {
    // Create media query for mobile breakpoint
    const mediaQuery = globalThis.matchMedia(
      `(max-width: ${MOBILE_BREAKPOINT - 1}px)`
    );

    /**
     * Handler for media query changes
     * Updates state when viewport crosses the mobile breakpoint
     */
    const handleChange = (): void => {
      setIsMobile(globalThis.innerWidth < MOBILE_BREAKPOINT);
    };

    // Register change listener
    mediaQuery.addEventListener('change', handleChange);

    // Set initial value
    setIsMobile(globalThis.innerWidth < MOBILE_BREAKPOINT);

    // Cleanup listener on unmount
    return (): void => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, []);

  // Convert undefined to false for convenience
  return !!isMobile;
}
