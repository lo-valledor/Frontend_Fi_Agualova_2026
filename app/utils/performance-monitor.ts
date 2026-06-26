const isDevelopment = import.meta.env.DEV;

type PerformanceRating = 'good' | 'needs-improvement' | 'poor';

interface PerformanceMetric {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  timestamp: number;
}

function getRating(name: string, value: number): PerformanceRating {
  const thresholds = {
    LCP: { good: 2500, poor: 4000 },
    FID: { good: 100, poor: 300 },
    CLS: { good: 0.1, poor: 0.25 },
    FCP: { good: 1800, poor: 4200 },
    TTFB: { good: 800, poor: 1800 }
  };

  const threshold = thresholds[name as keyof typeof thresholds];
  if (!threshold) return 'good';

  if (value <= threshold.good) return 'good';
  if (value <= threshold.poor) return 'needs-improvement';
  return 'poor';
}

function getEmojiForRating(rating: PerformanceRating): string {
  if (rating === 'good') return '✅';
  if (rating === 'needs-improvement') return '⚠️';
  return '❌';
}

function sendToAnalytics(metric: PerformanceMetric) {
  if (isDevelopment) {
    // En desarrollo, solo log a consola
    const emoji = getEmojiForRating(metric.rating);
    console.log(
      `${emoji} Performance: ${metric.name} = ${metric.value.toFixed(2)}ms (${metric.rating})`
    );
    return;
  }

  // En producción, enviar a tu servicio de analytics
  // Ejemplo con Google Analytics:
  if (typeof globalThis !== 'undefined' && (globalThis as any).gtag) {
    (globalThis as any).gtag('event', metric.name, {
      value: Math.round(metric.value),
      metric_rating: metric.rating,
      metric_delta: metric.value
    });
  }
}

export function initPerformanceMonitoring() {
  if (typeof globalThis === 'undefined') return;

  // LCP - Largest Contentful Paint
  try {
    const lcpObserver = new PerformanceObserver(list => {
      const entries = list.getEntries();
      const lastEntry = entries.at(-1) as any;

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
    if (isDevelopment) console.warn('LCP monitoring not supported', e);
  }

  // FID - First Input Delay
  try {
    const fidObserver = new PerformanceObserver(list => {
      const entries = list.getEntries();
      for (const entry of entries) {
        const metric: PerformanceMetric = {
          name: 'FID',
          value: (entry as any).processingStart - entry.startTime,
          rating: getRating(
            'FID',
            (entry as any).processingStart - entry.startTime
          ),
          timestamp: Date.now()
        };

        sendToAnalytics(metric);
      }
    });

    fidObserver.observe({ type: 'first-input', buffered: true });
  } catch (e) {
    if (isDevelopment) console.warn('FID monitoring not supported', e);
  }

  // CLS - Cumulative Layout Shift
  try {
    let clsValue = 0;
    const clsObserver = new PerformanceObserver(list => {
      const entries = list.getEntries();
      for (const entry of entries) {
        if (!(entry as any).hadRecentInput) {
          clsValue += (entry as any).value;
        }
      }

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
    if (isDevelopment) console.warn('CLS monitoring not supported', e);
  }

  // FCP - First Contentful Paint
  try {
    const fcpObserver = new PerformanceObserver(list => {
      const entries = list.getEntries();
      for (const entry of entries) {
        const metric: PerformanceMetric = {
          name: 'FCP',
          value: (entry as any).startTime,
          rating: getRating('FCP', (entry as any).startTime),
          timestamp: Date.now()
        };

        sendToAnalytics(metric);
      }
    });

    fcpObserver.observe({ type: 'paint', buffered: true });
  } catch (e) {
    if (isDevelopment) console.warn('FCP monitoring not supported', e);
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
    if (isDevelopment) console.warn('TTFB monitoring not supported', e);
  }
}

export function measureComponentPerformance(componentName: string) {
  if (typeof globalThis === 'undefined')
    return { start: () => {}, end: () => {} };

  let startTime: number;

  return {
    start: () => {
      startTime = performance.now();
    },
    end: () => {
      const duration = performance.now() - startTime;

      if (isDevelopment) {
        console.log(`⏱️ ${componentName} render time: ${duration.toFixed(2)}ms`);
      }
      // Enviar a analytics si es muy lento (>100ms)
      if (duration > 100) {
        let rating: PerformanceRating;
        if (duration > 500) {
          rating = 'poor';
        } else if (duration > 200) {
          rating = 'needs-improvement';
        } else {
          rating = 'good';
        }

        sendToAnalytics({
          name: `Component_${componentName}`,
          value: duration,
          rating,
          timestamp: Date.now()
        });
      }
    }
  };
}

export function getCurrentPerformanceMetrics() {
  if (typeof globalThis === 'undefined') return null;
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
