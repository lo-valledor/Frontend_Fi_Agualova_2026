import axios from 'axios';

import type {
  ContratoErrorInfo,
  ContratoModalState,
  ContratosRow
} from '~/types/administracion';

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

export function getContratoEditUrl(codigoContrato: string): string {
  return `/dashboard/administracion/contratos/${codigoContrato}`;
}

export function getContratoCreateUrl(): string {
  return '/dashboard/administracion/contratos/crear';
}

export function isValidContratoForOperation(
  contrato: ContratosRow | null | undefined
): contrato is ContratosRow {
  return (
    contrato !== null &&
    contrato !== undefined &&
    contrato.idContrato !== undefined &&
    contrato.idContrato !== null
  );
}

export function isContratosListEmpty(contratos: ContratosRow[]): boolean {
  return !Array.isArray(contratos) || contratos.length === 0;
}
