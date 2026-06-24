import type { PropietariosRow } from '~/types/administracion';
import { extractApiErrorMessage, type ApiErrorInfo } from './api-error';

type PropietarioModalState = {
  details: {
    isOpen: boolean;
  };
};

type PropietarioErrorInfo = ApiErrorInfo;

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
  return extractApiErrorMessage(error, defaultMessage);
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
