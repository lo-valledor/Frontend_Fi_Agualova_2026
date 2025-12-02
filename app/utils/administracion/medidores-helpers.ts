import type { AxiosError } from 'axios';
import type {
  GetMedidores,
  MedidorErrorInfo,
  MedidorModalState,
  MedidorPermissions
} from '~/types/administracion';

/**
 * Constantes para el módulo de medidores
 */
export const MEDIDORES_ROUTE = '/dashboard/administracion/medidores';
export const MEDIDORES_CREAR_ROUTE = '/dashboard/administracion/medidores/crear';

/**
 * Crear el estado inicial de modales para medidores
 */
export const createInitialMedidorModalState = (): MedidorModalState => ({
  delete: {
    isOpen: false
  },
  asociarSubempalme: {
    isOpen: false
  }
});

/**
 * Extrae el mensaje de error de una respuesta de error de Axios
 * Maneja múltiples niveles de error
 *
 * @param error - Error capturado
 * @param defaultMessage - Mensaje por defecto
 * @returns Objeto con información de error normalizada
 */
export const extractMedidorErrorMessage = (
  error: unknown,
  defaultMessage: string
): MedidorErrorInfo => {
  // Early return para errores de red
  if (isNetworkError(error)) {
    return {
      message: 'Error de conexión. Por favor, intenta nuevamente.',
      isNetworkError: true
    };
  }

  // Intentar extraer mensaje del servidor
  const serverMessage = extractServerMessage(error);
  if (serverMessage) {
    return {
      message: serverMessage,
      isNetworkError: false
    };
  }

  // Fallback
  return {
    message: defaultMessage,
    isNetworkError: false
  };
};

/**
 * Verifica si es un error de red
 * @param error
 */
const isNetworkError = (error: unknown): boolean => {
  const axiosError = error as AxiosError;
  return !axiosError?.response;
};

/**
 * Extrae mensaje del servidor
 * @param error
 */
const extractServerMessage = (error: unknown): string | null => {
  const axiosError = error as AxiosError<{ message?: string }>;
  return axiosError?.response?.data?.message || null;
};

/**
 * Validar si es seguro operar con un medidor
 * @param medidor
 */
export const isValidMedidorForOperation = (
  medidor: GetMedidores | null | undefined
): medidor is GetMedidores => {
  return medidor !== null && medidor !== undefined && medidor.codigo > 0;
};

/**
 * Obtener permisos del usuario para medidores
 * @param canCreate
 * @param canEdit
 * @param route
 */
export const getMedidorPermissions = (
  canCreate: (route: string) => boolean,
  canEdit: (route: string) => boolean,
  route: string = MEDIDORES_ROUTE
): MedidorPermissions => ({
  hasCreatePermission: canCreate(route),
  hasEditPermission: canEdit(route)
});

/**
 * Obtener URL de edición de medidor
 * @param codigoMedidor
 */
export const getMedidorEditUrl = (codigoMedidor: number): string => {
  return `${MEDIDORES_ROUTE}/${codigoMedidor}`;
};

/**
 * Validar si la lista de medidores está vacía
 * @param medidores
 */
export const isMedidoresListEmpty = (medidores: GetMedidores[]): boolean => {
  return !Array.isArray(medidores) || medidores.length === 0;
};

/**
 * Obtener resumen de estado de medidor
 * @param medidores
 */
export const getMedidorStatusSummary = (
  medidores: GetMedidores[]
): {
  total: number;
  conUbicacion: number;
  sinUbicacion: number;
} => {
  const total = medidores.length;
  const conUbicacion = medidores.filter((m) => m.ubicacion).length;
  const sinUbicacion = total - conUbicacion;

  return {
    total,
    conUbicacion,
    sinUbicacion
  };
};
