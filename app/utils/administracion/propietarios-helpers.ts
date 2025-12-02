/**
 * Utilidades y helpers para el módulo de propietarios
 */

import axios from 'axios';

import type {
  GetPropietario,
  PropietarioErrorInfo,
  PropietarioModalState,
  PropietarioPermissions
} from '~/types/administracion';

/**
 * Crea el estado inicial para los modales de propietarios
 */
export function createInitialPropietarioModalState(): PropietarioModalState {
  return {
    details: {
      isOpen: false
    }
  };
}

/**
 * Obtiene la información de permisos para el módulo de propietarios
 * @param canEdit - Función para verificar permiso de edición
 * @param route - Ruta del módulo
 */
export function getPropietarioPermissions(
  canEdit: (route: string) => boolean,
  route: string
): PropietarioPermissions {
  return {
    hasEditPermission: canEdit(route)
  };
}

/**
 * Extrae un mensaje de error de una excepción
 * @param error - Error capturado
 * @param defaultMessage - Mensaje por defecto si no se puede extraer
 */
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

/**
 * Valida que un propietario sea válido para una operación
 * @param propietario - Propietario a validar
 */
export function isValidPropietarioForOperation(
  propietario: GetPropietario | null | undefined
): propietario is GetPropietario {
  return propietario !== null && propietario !== undefined && !!propietario.rut;
}

/**
 * Verifica si la lista de propietarios está vacía
 * @param propietarios - Lista de propietarios
 */
export function isPropietariosListEmpty(propietarios: GetPropietario[]): boolean {
  return !Array.isArray(propietarios) || propietarios.length === 0;
}

/**
 * Obtiene un resumen del estado de sincronización
 * @param isSyncing - Estado de sincronización
 */
export function getSyncStatusMessage(isSyncing: boolean): string {
  return isSyncing ? 'Sincronizando...' : 'Sincronizar con Locales';
}
