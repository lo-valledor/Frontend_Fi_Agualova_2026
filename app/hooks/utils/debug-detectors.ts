/**
 * Debug Detection Utilities
 *
 * Helper functions for detecting browser environment conditions
 * such as private mode, proxies, and network interception.
 */

export interface ProxyDetectionResult {
  detected: boolean;
  evidence: string[];
}

export interface DebugDetectionResult {
  userAgent: string;
  url: string;
  sessionStorageSupported: boolean;
  hasToken: boolean;
  tokenPreview?: string;
  timestamp: string;
  browserName: string;
  isPrivateMode?: boolean;
  proxyDetected?: boolean;
  networkInterception?: string[];
}

/**
 * Detects browser name from user agent string
 *
 * @param userAgent - Navigator user agent string
 * @returns Browser name (Chrome, Firefox, Safari, Edge, Opera, or Unknown)
 */
export function detectBrowserName(userAgent: string): string {
  if (userAgent.includes('Chrome') && !userAgent.includes('Edg')) return 'Chrome';
  if (userAgent.includes('Firefox')) return 'Firefox';
  if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) return 'Safari';
  if (userAgent.includes('Edg')) return 'Edge';
  if (userAgent.includes('Opera') || userAgent.includes('OPR')) return 'Opera';
  return 'Unknown';
}

/**
 * Detects if browser is in private/incognito mode
 *
 * Uses storage quota estimation which is significantly lower in private mode.
 * Fallback detection via IndexedDB and LocalStorage availability.
 *
 * @returns Promise resolving to true if private mode detected
 */
export async function detectPrivateMode(): Promise<boolean> {
  try {
    // Method 1: Storage quota estimation
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      const estimate = await navigator.storage.estimate();
      // Less than 120MB typically indicates private mode
      return (estimate.quota || 0) < 120000000;
    }
  } catch {
    // Method 1 failed, try Method 2
  }

  try {
    // Method 2: IndexedDB test
    const test = indexedDB.open('_private_mode_test_');
    return new Promise(resolve => {
      test.onsuccess = () => {
        indexedDB.deleteDatabase('_private_mode_test_');
        resolve(false);
      };
      test.onerror = () => resolve(true);
    });
  } catch {
    return false;
  }
}

/**
 * Detects potential proxy or network interception
 *
 * Checks for:
 * - Suspicious scripts (Fiddler, Charles, proxy tools)
 * - Modified XMLHttpRequest
 * - Modified fetch() API
 *
 * @returns Detection result with evidence list
 */
export function detectProxyOrInterception(): ProxyDetectionResult {
  const evidence: string[] = [];

  // Check for suspicious scripts
  const scripts = Array.from(document.querySelectorAll('script'))
    .map(s => s.src)
    .filter(src => src.length > 0);

  const suspiciousScripts = scripts.filter(
    src =>
      src.includes('main.js') ||
      src.includes('fiddler') ||
      src.includes('charles') ||
      src.includes('proxy') ||
      src.includes('debug')
  );

  if (suspiciousScripts.length > 0) {
    evidence.push(`Scripts sospechosos: ${suspiciousScripts.join(', ')}`);
  }

  // Check if XMLHttpRequest has been modified
  if (globalThis.XMLHttpRequest.toString().includes('native code') === false) {
    evidence.push('XMLHttpRequest modificado (posible proxy)');
  }

  // Check if fetch has been modified
  if (globalThis.fetch.toString().includes('native code') === false) {
    evidence.push('fetch() modificado (posible interceptor)');
  }

  return {
    detected: evidence.length > 0,
    evidence
  };
}

/**
 * Gets token preview (first 20 characters + ellipsis)
 *
 * @param token - Full token string
 * @returns Preview string or undefined if no token
 */
export function getTokenPreview(token: string | null): string | undefined {
  return token ? `${token.substring(0, 20)}...` : undefined;
}

/**
 * Gathers complete debug information
 *
 * Combines all detection methods to build comprehensive debug info.
 *
 * @returns Promise resolving to complete debug information
 */
export async function gatherDebugInfo(): Promise<DebugDetectionResult> {
  const userAgent = navigator.userAgent;
  const token = localStorage.getItem('token');
  const isPrivate = await detectPrivateMode();
  const proxyInfo = detectProxyOrInterception();

  return {
    userAgent,
    url: globalThis.location.href,
    sessionStorageSupported: typeof Storage !== 'undefined',
    hasToken: !!token,
    tokenPreview: getTokenPreview(token),
    timestamp: new Date().toISOString(),
    browserName: detectBrowserName(userAgent),
    isPrivateMode: isPrivate,
    proxyDetected: proxyInfo.detected,
    networkInterception: proxyInfo.evidence
  };
}
