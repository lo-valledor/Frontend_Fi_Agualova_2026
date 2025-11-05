/**
 * Performance Monitoring con Web Vitals
 *
 * Monitorea métricas clave de performance:
 * - LCP (Largest Contentful Paint)
 * - FID (First Input Delay)
 * - CLS (Cumulative Layout Shift)
 * - FCP (First Contentful Paint)
 * - TTFB (Time to First Byte)
 *
 * Solo funciona en producción para no afectar desarrollo
 */

interface PerformanceMetric {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  timestamp: number;
}

const isDevelopment = process.env.NODE_ENV === 'development';

function getRating(
  name: string,
  value: number
): 'good' | 'needs-improvement' | 'poor' {
  const thresholds = {
    LCP: { good: 2500, poor: 4000 },
    FID: { good: 100, poor: 300 },
    CLS: { good: 0.1, poor: 0.25 },
    FCP: { good: 1800, poor: 3000 },
    TTFB: { good: 800, poor: 1800 }
  };

  const threshold = thresholds[name as keyof typeof thresholds];
  if (!threshold) return 'good';

  if (value <= threshold.good) return 'good';
  if (value <= threshold.poor) return 'needs-improvement';
  return 'poor';
}

function sendToAnalytics(metric: PerformanceMetric) {
  if (isDevelopment) {
    // En desarrollo, solo log a consola
    const emoji =
      metric.rating === 'good'
        ? '✅'
        : metric.rating === 'needs-improvement'
          ? '⚠️'
          : '❌';
    console.log(
      `${emoji} Performance: ${metric.name} = ${metric.value.toFixed(2)}ms (${metric.rating})`
    );
    return;
  }

  // En producción, enviar a tu servicio de analytics
  // Ejemplo con Google Analytics:
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', metric.name, {
      value: Math.round(metric.value),
      metric_rating: metric.rating,
      metric_delta: metric.value
    });
  }
}

/**
 * Observa Web Vitals usando Performance Observer API
 */
export function initPerformanceMonitoring() {
  if (typeof window === 'undefined') return;

  // LCP - Largest Contentful Paint
  try {
    const lcpObserver = new PerformanceObserver(list => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1] as any;

      const metric: PerformanceMetric = {
        name: 'LCP',
        value: lastEntry.renderTime || lastEntry.loadTime,
        rating: getRating('LCP', lastEntry.renderTime || lastEntry.loadTime),
        timestamp: Date.now()
      };

      sendToAnalytics(metric);
    });

    lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });
  } catch (e) {
    console.warn('LCP monitoring not supported', e);
  }

  // FID - First Input Delay
  try {
    const fidObserver = new PerformanceObserver(list => {
      const entries = list.getEntries();
      entries.forEach((entry: any) => {
        const metric: PerformanceMetric = {
          name: 'FID',
          value: entry.processingStart - entry.startTime,
          rating: getRating('FID', entry.processingStart - entry.startTime),
          timestamp: Date.now()
        };

        sendToAnalytics(metric);
      });
    });

    fidObserver.observe({ type: 'first-input', buffered: true });
  } catch (e) {
    console.warn('FID monitoring not supported', e);
  }

  // CLS - Cumulative Layout Shift
  try {
    let clsValue = 0;
    const clsObserver = new PerformanceObserver(list => {
      const entries = list.getEntries();
      entries.forEach((entry: any) => {
        if (!entry.hadRecentInput) {
          clsValue += entry.value;
        }
      });

      const metric: PerformanceMetric = {
        name: 'CLS',
        value: clsValue,
        rating: getRating('CLS', clsValue),
        timestamp: Date.now()
      };

      sendToAnalytics(metric);
    });

    clsObserver.observe({ type: 'layout-shift', buffered: true });
  } catch (e) {
    console.warn('CLS monitoring not supported', e);
  }

  // FCP - First Contentful Paint
  try {
    const fcpObserver = new PerformanceObserver(list => {
      const entries = list.getEntries();
      entries.forEach((entry: any) => {
        const metric: PerformanceMetric = {
          name: 'FCP',
          value: entry.startTime,
          rating: getRating('FCP', entry.startTime),
          timestamp: Date.now()
        };

        sendToAnalytics(metric);
      });
    });

    fcpObserver.observe({ type: 'paint', buffered: true });
  } catch (e) {
    console.warn('FCP monitoring not supported', e);
  }

  // TTFB - Time to First Byte
  try {
    const navigationEntry = performance.getEntriesByType(
      'navigation'
    )[0] as any;
    if (navigationEntry) {
      const metric: PerformanceMetric = {
        name: 'TTFB',
        value: navigationEntry.responseStart - navigationEntry.requestStart,
        rating: getRating(
          'TTFB',
          navigationEntry.responseStart - navigationEntry.requestStart
        ),
        timestamp: Date.now()
      };

      sendToAnalytics(metric);
    }
  } catch (e) {
    console.warn('TTFB monitoring not supported', e);
  }
}

export function measureComponentPerformance(componentName: string) {
  if (typeof window === 'undefined') return { start: () => {}, end: () => {} };

  let startTime: number;

  return {
    start: () => {
      startTime = performance.now();
    },
    end: () => {
      const duration = performance.now() - startTime;

      if (isDevelopment) {
        console.log(
          `⏱️ ${componentName} render time: ${duration.toFixed(2)}ms`
        );
      }

      // Enviar a analytics si es muy lento (>100ms)
      if (duration > 100) {
        sendToAnalytics({
          name: `Component_${componentName}`,
          value: duration,
          rating:
            duration > 500
              ? 'poor'
              : duration > 200
                ? 'needs-improvement'
                : 'good',
          timestamp: Date.now()
        });
      }
    }
  };
}

export function getCurrentPerformanceMetrics() {
  if (typeof window === 'undefined') return null;

  const navigation = performance.getEntriesByType('navigation')[0] as any;
  const paint = performance.getEntriesByType('paint');

  return {
    // Navigation Timing
    dns: navigation?.domainLookupEnd - navigation?.domainLookupStart,
    tcp: navigation?.connectEnd - navigation?.connectStart,
    ttfb: navigation?.responseStart - navigation?.requestStart,
    download: navigation?.responseEnd - navigation?.responseStart,
    domInteractive: navigation?.domInteractive,
    domComplete: navigation?.domComplete,
    loadComplete: navigation?.loadEventEnd - navigation?.loadEventStart,

    // Paint Timing
    fcp: paint.find((entry: any) => entry.name === 'first-contentful-paint')
      ?.startTime,

    // Memory (si está disponible)
    memory: (performance as any).memory
      ? {
          usedJSHeapSize: (performance as any).memory.usedJSHeapSize,
          totalJSHeapSize: (performance as any).memory.totalJSHeapSize,
          jsHeapSizeLimit: (performance as any).memory.jsHeapSizeLimit
        }
      : null
  };
}
