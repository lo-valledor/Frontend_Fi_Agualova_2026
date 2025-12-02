/**
 * Procesamiento deconfirmaciones de precios en lote
 */

import api from '~/lib/api';
import {
  getErrorMessage,
  isAuthorizationError
} from './revisar-precio-helpers';

interface ProcessResult {
  exitosas: number;
  fallidas: number;
  shouldStop: boolean;
}

/**
 * Procesa una lista de confirmaciones de precios
 * @param items
 * @param userName
 * @param toast
 */
export async function processConfirmations(
  items: Array<{ indice: string; codigo: string }>,
  userName: string,
  toast: any
): Promise<ProcessResult> {
  let exitosas = 0;
  let fallidas = 0;

  for (const item of items) {
    try {
      const response = await api.post(
        `/ConfirmarPrecio?indice=${item.indice}&usuario=${userName}`
      );

      if (response.status === 200) {
        exitosas++;
      } else {
        fallidas++;
      }
    } catch (error: any) {
      // Manejo de errores 401 (autorización)
      if (error.response?.status === 401) {
        const errorMessage = getErrorMessage(error);

        // Si es error de autorización pero NO de sesión, continuar
        if (isAuthorizationError(errorMessage)) {
          fallidas++;
          continue;
        }

        // Error de sesión expirada - detener todo
        toast.error('Sesión expirada durante el proceso. Reinicia la página.');
        return { exitosas, fallidas, shouldStop: true };
      }

      fallidas++;
    }
  }

  return { exitosas, fallidas, shouldStop: false };
}

/**
 * Filtra registros pendientes de confirmación
 * @param data
 * @param selectedCodes
 * @param codeField
 */
export function filterPendingConfirmations<
  T extends { indice: string; confirmacion: string }
>(data: T[], selectedCodes: string[], codeField: keyof T): T[] {
  return data.filter(
    item =>
      selectedCodes.includes(item[codeField] as string) &&
      item.indice !== '' &&
      item.confirmacion !== 'Confirmado'
  );
}
