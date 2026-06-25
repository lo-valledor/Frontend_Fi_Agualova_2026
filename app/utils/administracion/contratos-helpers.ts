import type {
  ContratoErrorInfo,
  ContratoModalState,
  ContratosRow
} from '~/types/administracion';
import { extractApiErrorMessage } from './api-error';

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
  return extractApiErrorMessage(error, defaultMessage);
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
