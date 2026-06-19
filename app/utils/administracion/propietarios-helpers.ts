import axios from 'axios';

import type { PropietariosRow } from '~/types/administracion';

type PropietarioModalState = {
  details: {
    isOpen: boolean;
  };
};

type PropietarioErrorInfo = {
  message: string;
  isNetworkError: boolean;
};

export function createInitialPropietarioModalState(): PropietarioModalState {
  return {
    details: {
      isOpen: false
    }
  };
}

export function extractPropietarioErrorMessage(
  error: unknown,
  defaultMessage: string = 'Error al procesar propietario'
): PropietarioErrorInfo {
  const isNetworkError = axios.isAxiosError(error) && !error.response;

  if (axios.isAxiosError(error) && error.response?.data) {
    const responseData = error.response.data as Record<string, any>;
    return {
      message: responseData.message || responseData.error || defaultMessage,
      isNetworkError: false
    };
  }

  if (error instanceof Error) {
    return {
      message: error.message || defaultMessage,
      isNetworkError
    };
  }

  return {
    message: defaultMessage,
    isNetworkError
  };
}

export function isValidPropietarioForOperation(
  propietario: PropietariosRow | null | undefined
): propietario is PropietariosRow {
  return propietario !== null && propietario !== undefined && !!propietario.rut;
}

export function isPropietariosListEmpty(
  propietarios: PropietariosRow[]
): boolean {
  return !Array.isArray(propietarios) || propietarios.length === 0;
}

export function getSyncStatusMessage(isSyncing: boolean): string {
  return isSyncing ? 'Sincronizando...' : 'Sincronizar con Locales';
}
