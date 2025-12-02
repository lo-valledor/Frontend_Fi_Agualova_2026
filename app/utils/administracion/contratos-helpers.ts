/**
 * Utilidades y helpers para el módulo de contratos
 */

import axios from 'axios';

import type {
  ContratoErrorInfo,
  ContratoModalState,
  ContratoPermissions,
  GetContratos
} from '~/types/administracion';

/**
 * Crea el estado inicial para los modales de contratos
 */
export function createInitialContratoModalState(): ContratoModalState {
  return {
    delete: {
      isOpen: false
    },
    details: {
      isOpen: false
    }
  };
}

/**
 * Obtiene la información de permisos para el módulo de contratos
 * @param canCreate - Función para verificar permiso de creación
 * @param canEdit - Función para verificar permiso de edición
 * @param route - Ruta del módulo
 */
export function getContratoPermissions(
  canCreate: (route: string) => boolean,
  canEdit: (route: string) => boolean,
  route: string
): ContratoPermissions {
  return {
    hasCreatePermission: canCreate(route),
    hasEditPermission: canEdit(route)
  };
}

/**
 * Extrae un mensaje de error de una excepción
 * @param error - Error capturado
 * @param defaultMessage - Mensaje por defecto si no se puede extraer
 */
export function extractContratoErrorMessage(
  error: unknown,
  defaultMessage: string = 'Error al procesar el contrato'
): ContratoErrorInfo {
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
 * Obtiene la URL para editar un contrato
 * @param codigoContrato - Código del contrato a editar
 */
export function getContratoEditUrl(codigoContrato: string): string {
  return `/dashboard/administracion/contratos/${codigoContrato}`;
}

/**
 * Obtiene la URL para crear un contrato
 */
export function getContratoCreateUrl(): string {
  return '/dashboard/administracion/contratos/crear';
}

/**
 * Valida que un contrato sea válido para una operación
 * @param contrato - Contrato a validar
 */
export function isValidContratoForOperation(
  contrato: GetContratos | null | undefined
): contrato is GetContratos {
  return contrato !== null && contrato !== undefined && !!contrato.codigoContrato;
}

/**
 * Verifica si la lista de contratos está vacía
 * @param contratos - Lista de contratos
 */
export function isContratosListEmpty(contratos: GetContratos[]): boolean {
  return !Array.isArray(contratos) || contratos.length === 0;
}
