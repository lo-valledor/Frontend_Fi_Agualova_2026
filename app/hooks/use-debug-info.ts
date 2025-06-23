import { useEffect, useState } from 'react';

interface DebugInfo {
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

export const useDebugInfo = () => {
  const [debugInfo, setDebugInfo] = useState<DebugInfo | null>(null);

  const getBrowserName = (userAgent: string): string => {
    if (userAgent.includes('Chrome') && !userAgent.includes('Edg')) return 'Chrome';
    if (userAgent.includes('Firefox')) return 'Firefox';
    if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) return 'Safari';
    if (userAgent.includes('Edg')) return 'Edge';
    if (userAgent.includes('Opera') || userAgent.includes('OPR')) return 'Opera';
    return 'Unknown';
  };

  const detectPrivateMode = async (): Promise<boolean> => {
    try {
      // Método para detectar modo privado/incógnito
      if ('storage' in navigator && 'estimate' in navigator.storage) {
        const estimate = await navigator.storage.estimate();
        return (estimate.quota || 0) < 120000000; // Menos de 120MB generalmente indica modo privado
      }
      return false;
    } catch {
      return false;
    }
  };

  const detectProxyOrInterception = (): { detected: boolean; evidence: string[] } => {
    const evidence: string[] = [];
    
    // Verificar si hay scripts externos sospechosos
    const scripts = Array.from(document.querySelectorAll('script')).map(s => s.src);
    const suspiciousScripts = scripts.filter(src => 
      src.includes('main.js') || 
      src.includes('fiddler') || 
      src.includes('charles') || 
      src.includes('proxy') ||
      src.includes('debug')
    );
    
    if (suspiciousScripts.length > 0) {
      evidence.push(`Scripts sospechosos: ${suspiciousScripts.join(', ')}`);
    }

    // Verificar si XMLHttpRequest ha sido modificado
    if (window.XMLHttpRequest.toString().includes('native code') === false) {
      evidence.push('XMLHttpRequest modificado (posible proxy)');
    }

    // Verificar headers personalizados en fetch
    const originalFetch = window.fetch;
    if (originalFetch.toString().includes('native code') === false) {
      evidence.push('fetch() modificado (posible interceptor)');
    }

    return {
      detected: evidence.length > 0,
      evidence
    };
  };

  useEffect(() => {
    const gatherDebugInfo = async () => {
      const userAgent = navigator.userAgent;
      const token = sessionStorage.getItem('token');
      const isPrivate = await detectPrivateMode();
      const proxyInfo = detectProxyOrInterception();

      const info: DebugInfo = {
        userAgent,
        url: window.location.href,
        sessionStorageSupported: typeof Storage !== 'undefined',
        hasToken: !!token,
        tokenPreview: token ? `${token.substring(0, 20)}...` : undefined,
        timestamp: new Date().toISOString(),
        browserName: getBrowserName(userAgent),
        isPrivateMode: isPrivate,
        proxyDetected: proxyInfo.detected,
        networkInterception: proxyInfo.evidence,
      };

      setDebugInfo(info);
      
      // Log automático en consola
      console.log('🔍 DEBUG INFO:', info);
      
      if (proxyInfo.detected) {
        console.warn('⚠️ POSIBLE INTERFERENCIA DETECTADA:');
        proxyInfo.evidence.forEach(e => console.warn(`  - ${e}`));
        console.warn('  Esto puede causar problemas con las headers de autorización');
      }
    };

    gatherDebugInfo();
  }, []);

  return debugInfo;
}; 