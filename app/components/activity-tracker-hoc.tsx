import React, { useEffect, useRef, useCallback } from 'react';
import { useActivityTracker } from '~/hooks/useActivityTracker';

interface ActivityTrackerProps {
  module: string;
  action?: string;
  details?: string;
}

export function withActivityTracker<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  defaultModule: string,
  defaultAction?: string,
) {
  return function ActivityTrackedComponent(props: P & ActivityTrackerProps) {
    const { logActivity } = useActivityTracker();
    const {
      module = defaultModule,
      action = defaultAction,
      details,
      ...componentProps
    } = props;

    useEffect(() => {
      if (action) {
        logActivity(action, module, details);
      }
    }, [action, module, details, logActivity]);

    return <WrappedComponent {...(componentProps as P)} />;
  };
}

// Hook personalizado para rastrear eventos específicos
export const useActivityEvent = () => {
  const { logActivity } = useActivityTracker();
  const lastPageViewRef = useRef<{ page: string; timestamp: number } | null>(null);
  const lastDataActionRef = useRef<{ action: string; dataType: string; details: string; timestamp: number } | null>(null);
  const PAGE_DEBOUNCE_TIME = 3000; // 3 segundos para páginas
  const DATA_DEBOUNCE_TIME = 1000; // 1 segundo para acciones de datos

  const clearPageViewHistory = useCallback(() => {
    lastPageViewRef.current = null;
  }, []);

  const clearDataActionHistory = useCallback(() => {
    lastDataActionRef.current = null;
  }, []);

  const trackEvent = useCallback((action: string, module: string, details?: string) => {
    logActivity(action, module, details);
  }, [logActivity]);

  const trackPageView = useCallback((pageName: string) => {
    const now = Date.now();
    const lastPageView = lastPageViewRef.current;

    // Verificar si ya se registró esta página recientemente
    if (
      lastPageView &&
      lastPageView.page === pageName &&
      now - lastPageView.timestamp < PAGE_DEBOUNCE_TIME
    ) {
      // Evitar registro duplicado
      return;
    }

    // Registrar la nueva vista de página
    logActivity('Ver página', 'Navegación', `Página: ${pageName}`);

    // Actualizar la referencia
    lastPageViewRef.current = {
      page: pageName,
      timestamp: now,
    };
  }, [logActivity]);

  const trackFormAction = useCallback((
    action: string,
    formName: string,
    details?: string,
  ) => {
    logActivity(action, 'Formulario', `${formName}: ${details || ''}`);
  }, [logActivity]);

  const trackDataAction = useCallback((
    action: string,
    dataType: string,
    details?: string,
  ) => {
    const now = Date.now();
    const lastDataAction = lastDataActionRef.current;

    // Verificar si ya se registró esta acción recientemente
    if (
      lastDataAction &&
      lastDataAction.action === action &&
      lastDataAction.dataType === dataType &&
      lastDataAction.details === (details || '') &&
      now - lastDataAction.timestamp < DATA_DEBOUNCE_TIME
    ) {
      // Evitar registro duplicado
      return;
    }

    // Registrar la nueva acción de datos
    logActivity(action, dataType, details);

    // Actualizar la referencia
    lastDataActionRef.current = {
      action,
      dataType,
      details: details || '',
      timestamp: now,
    };
  }, [logActivity]);

  return {
    trackEvent,
    trackPageView,
    trackFormAction,
    trackDataAction,
    clearPageViewHistory,
    clearDataActionHistory,
  };
};
