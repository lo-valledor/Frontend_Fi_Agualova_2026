import type { MutableRefObject } from 'react';
import React, { createContext, useContext, useRef } from 'react';

import LoadingBar from 'react-top-loading-bar';

interface LoadingBarRef {
  continuousStart(): unknown;
  complete(): unknown;
  current: {
    continuousStart: () => void;
    complete: () => void;
  } | null;
}

const LoadingBarContext =
  createContext<MutableRefObject<LoadingBarRef | null> | null>(null);

export function LoadingBarProvider({
  children
}: {
  children: React.ReactNode;
}) {
  const loadingBarRef = useRef<LoadingBarRef>(null);

  return (
    <LoadingBarContext.Provider value={loadingBarRef}>
      {/* Opción 1: usar directamente la variable CSS sin acceso al DOM */}
      <LoadingBar color={'var(--primary)'} ref={loadingBarRef as any} />
      {children}
    </LoadingBarContext.Provider>
  );
}

export function useLoadingBar() {
  return useContext(LoadingBarContext);
}
