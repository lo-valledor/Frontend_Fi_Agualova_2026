/**
 * Debug Information Hook
 *
 * Provides a hook for gathering comprehensive debug information about the browser
 * environment, including browser detection, private mode detection, proxy detection,
 * and network interception detection.
 *
 * Uses debug-detectors utilities to avoid code duplication and maintain consistent
 * detection logic across the application.
 */

import { useEffect, useState } from 'react';

import {
  gatherDebugInfo,
  type DebugDetectionResult
} from './utils/debug-detectors';

/**
 * Hook for gathering debug information
 *
 * Collects comprehensive debug information on mount including:
 * - User agent string
 * - Current URL
 * - Session storage support
 * - Authentication token presence
 * - Browser name detection
 * - Private/incognito mode detection
 * - Proxy detection
 * - Network interception detection
 *
 * This hook automatically runs once on mount and warns if proxy or network
 * interception is detected, as these can cause authorization header issues.
 *
 * @returns {DebugDetectionResult|null} Complete debug information or null if not loaded
 *
 * @example
 * ```tsx
 * const debugInfo = useDebugInfo();
 *
 * if (debugInfo?.proxyDetected) {
 *   console.warn('Proxy detected:', debugInfo.networkInterception);
 * }
 *
 * return (
 *   <DebugPanel
 *     browser={debugInfo?.browserName}
 *     isPrivate={debugInfo?.isPrivateMode}
 *   />
 * );
 * ```
 */
export const useDebugInfo = (): DebugDetectionResult | null => {
  const [debugInfo, setDebugInfo] = useState<DebugDetectionResult | null>(null);

  useEffect(() => {
    const loadDebugInfo = async (): Promise<void> => {
      const info = await gatherDebugInfo();
      setDebugInfo(info);

      // Warn if proxy or network interception is detected
      if (info.proxyDetected) {
        console.warn(
          'Deteccion de proxy/interceptor de red:',
          info.networkInterception
        );
        console.warn(
          'Esto puede causar problemas con las headers de autorizacion'
        );
      }
    };

    loadDebugInfo();
  }, []);

  return debugInfo;
};
