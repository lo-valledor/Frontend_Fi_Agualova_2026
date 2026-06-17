import { useEffect, useState } from 'react';

import {
  gatherDebugInfo,
  type DebugDetectionResult
} from './utils/debug-detectors';


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
