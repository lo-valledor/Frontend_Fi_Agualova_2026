import type { AxiosError } from 'axios';

import type {
  MedidorErrorInfo,
  MedidorListItem,
  MedidorModalState
} from '~/components/administracion/medidores/medidores-types';

export const MEDIDORES_ROUTE = '/dashboard/administracion/medidores';
export const MEDIDORES_CREAR_ROUTE =
  '/dashboard/administracion/medidores/crear';

export const createInitialMedidorModalState = (): MedidorModalState => ({
  delete: {
    isOpen: false
  },
  asociarSubempalme: {
    isOpen: false
  }
});

export const extractMedidorErrorMessage = (
  error: unknown,
  defaultMessage: string
): MedidorErrorInfo => {
  if (isNetworkError(error)) {
    return {
      message: 'Error de conexión. Por favor, intenta nuevamente.',
      isNetworkError: true
    };
  }

  const serverMessage = extractServerMessage(error);
  if (serverMessage) {
    return {
      message: serverMessage,
      isNetworkError: false
    };
  }

  return {
    message: defaultMessage,
    isNetworkError: false
  };
};

const isNetworkError = (error: unknown): boolean => {
  const axiosError = error as AxiosError;
  return !axiosError?.response;
};

const extractServerMessage = (error: unknown): string | null => {
  const axiosError = error as AxiosError<{ message?: string }>;
  return axiosError?.response?.data?.message || null;
};

export const isValidMedidorForOperation = (
  medidor: MedidorListItem | null | undefined
): medidor is MedidorListItem => {
  return medidor !== null && medidor !== undefined && medidor.idMedidor > 0;
};

export const getMedidorEditUrl = (codigoMedidor: string | number): string => {
  return `${MEDIDORES_ROUTE}/${codigoMedidor}`;
};

export const isMedidoresListEmpty = (medidores: MedidorListItem[]): boolean => {
  return !Array.isArray(medidores) || medidores.length === 0;
};

export const getMedidorStatusSummary = (
  medidores: MedidorListItem[]
): {
  total: number;
  conUbicacion: number;
  sinUbicacion: number;
} => {
  const total = medidores.length;
  const conUbicacion = medidores.filter(m => m.ubicacion).length;
  const sinUbicacion = total - conUbicacion;

  return {
    total,
    conUbicacion,
    sinUbicacion
  };
};
