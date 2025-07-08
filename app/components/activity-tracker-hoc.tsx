import React, { useEffect } from 'react';
import { useActivityTracker } from '~/hooks/useActivityTracker';

interface ActivityTrackerProps {
  module: string;
  action?: string;
  details?: string;
}

export function withActivityTracker<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  defaultModule: string,
  defaultAction?: string
) {
  return function ActivityTrackedComponent(props: P & ActivityTrackerProps) {
    const { logActivity } = useActivityTracker();
    const { module = defaultModule, action = defaultAction, details, ...componentProps } = props;

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

  const trackEvent = (
    action: string,
    module: string,
    details?: string
  ) => {
    logActivity(action, module, details);
  };

  const trackPageView = (pageName: string) => {
    logActivity('Ver página', 'Navegación', `Página: ${pageName}`);
  };

  const trackFormAction = (action: string, formName: string, details?: string) => {
    logActivity(action, 'Formulario', `${formName}: ${details || ''}`);
  };

  const trackDataAction = (action: string, dataType: string, details?: string) => {
    logActivity(action, dataType, details);
  };

  return {
    trackEvent,
    trackPageView,
    trackFormAction,
    trackDataAction,
  };
};
