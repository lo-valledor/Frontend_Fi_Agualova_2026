import type { AxiosError } from 'axios';
import type {
  ClienteErrorInfo,
  ClienteLoadingState,
  ClienteModalState,
  GetClienteById,
  GetClientes,
  GetClientesByRut
} from '~/types/administracion';

export const CLIENTES_ROUTE = '/dashboard/administracion/clientes';
export const CLIENTES_CREAR_ROUTE = '/dashboard/administracion/clientes/crear';

export const createInitialClienteModalState = (): ClienteModalState => ({
  details: {
    isOpen: false
  }
});

export const createInitialLoadingState = (): ClienteLoadingState => ({
  isLoading: false,
  rutLoading: null
});

export const extractClienteErrorMessage = (
  error: unknown,
  defaultMessage: string
): ClienteErrorInfo => {
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

const isNetworkError = (error: unknown): boolean => {
  const axiosError = error as AxiosError;
  return !axiosError?.response;
};

const extractServerMessage = (error: unknown): string | null => {
  const axiosError = error as AxiosError<{ message?: string }>;
  return axiosError?.response?.data?.message || null;
};

export const isValidClienteForOperation = (
  cliente: GetClientes | null | undefined
): cliente is GetClientes => {
  return cliente !== null && cliente !== undefined && Boolean(cliente.rut);
};

export const isValidDetailedCliente = (
  cliente: GetClienteById | GetClientesByRut | null | undefined
): cliente is GetClienteById | GetClientesByRut => {
  return cliente !== null && cliente !== undefined && Boolean(cliente.rut);
};

export const getClienteEditUrl = (rutCliente: string): string => {
  return `${CLIENTES_ROUTE}/${rutCliente}`;
};

export const normalizeClienteDetallado = (
  clienteDetallado: GetClienteById | GetClientesByRut | any
): GetClientesByRut => {
  return {
    rut: clienteDetallado.rut,
    nombre: clienteDetallado.nombre,
    apellido: clienteDetallado.apellido,
    esEmpresa: clienteDetallado.esEmpresa,
    direccion: clienteDetallado.direccion,
    comuna: clienteDetallado.comuna,
    codComuna: clienteDetallado.codComuna ?? '',
    contacto: clienteDetallado.contacto,
    telefono: clienteDetallado.telefono,
    correo: clienteDetallado.email ?? clienteDetallado.correo ?? '',
    codigoGiro: clienteDetallado.codigoGiro ?? '',
    giro: clienteDetallado.giro ?? ''
  };
};

export const isLoadingCliente = (
  loading: ClienteLoadingState,
  rutCliente: string
): boolean => {
  return loading.isLoading && loading.rutLoading === rutCliente;
};
