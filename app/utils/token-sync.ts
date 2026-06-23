// Utilidad para sincronizar el estado del token entre pestañas
import { jwtDecode } from 'jwt-decode';

import {
  clearAuthToken,
  getAuthToken,
  setAuthToken
} from '~/services/axiosConfig';

export interface TokenData {
  sub: string;
  name: string;
  NombreUsuario: string;
  role: string;
  exp: number;
  iss: string;
  aud: string;
}

export const isTokenValid = (token: string): boolean => {
  try {
    const decoded = jwtDecode<{ exp: number }>(token);
    const currentTime = Date.now() / 1000;
    return decoded.exp > currentTime;
  } catch (error) {
    if (import.meta.env.DEV) console.error('Error al validar el token:', error);
    return false;
  }
};

export const getStoredToken = (): string | null => getAuthToken();

export const setStoredToken = (token: string): void => {
  setAuthToken(token);
};

export const removeStoredToken = (): void => {
  clearAuthToken();
  // También limpiar sessionStorage por si acaso hay tokens residuales
  sessionStorage.removeItem('token');
};

export const parseTokenData = (token: string): TokenData => {
  try {
    return jwtDecode<TokenData>(token);
  } catch (error) {
    if (import.meta.env.DEV) {
      console.error('Error al decodificar el token:', error);
    }
    throw new Error('Token inválido');
  }
};

// Evento personalizado para notificar cambios de autenticación entre componentes
export const TOKEN_CHANGED_EVENT = 'tokenChanged';

export const dispatchTokenChange = (
  action: 'login' | 'logout',
  token?: string
) => {
  globalThis.dispatchEvent(
    new CustomEvent(TOKEN_CHANGED_EVENT, {
      detail: { action, token }
    })
  );
};

export const listenToTokenChanges = (
  callback: (action: 'login' | 'logout', token?: string) => void
) => {
  const handler = (event: Event) => {
    const customEvent = event as CustomEvent;
    callback(customEvent.detail.action, customEvent.detail.token);
  };

  globalThis.addEventListener(TOKEN_CHANGED_EVENT, handler);

  return () => {
    globalThis.removeEventListener(TOKEN_CHANGED_EVENT, handler);
  };
};
