import * as React from 'react';


const MOBILE_BREAKPOINT = 768;


export function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(
    undefined
  );

  React.useEffect(() => {
    // Create media query for mobile breakpoint
    const mediaQuery = globalThis.matchMedia(
      `(max-width: ${MOBILE_BREAKPOINT - 1}px)`
    );

    
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
