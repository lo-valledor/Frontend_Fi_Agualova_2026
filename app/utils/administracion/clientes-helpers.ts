import type { AxiosError } from 'axios';
import type {
  ClienteErrorInfo,
  ClienteLoadingState,
  ClienteModalState,
  ClientePermissions,
  GetClienteById,
  GetClientes,
  GetClientesByRut
} from '~/types/administracion';

/**
 * Constantes para el módulo de clientes
 */
export const CLIENTES_ROUTE = '/dashboard/administracion/clientes';
export const CLIENTES_CREAR_ROUTE = '/dashboard/administracion/clientes/crear';

/**
 * Crear el estado inicial de modales para clientes
 */
export const createInitialClienteModalState = (): ClienteModalState => ({
  details: {
    isOpen: false
  }
});

/**
 * Crear el estado inicial de carga
 */
export const createInitialLoadingState = (): ClienteLoadingState => ({
  isLoading: false,
  rutLoading: null
});

/**
 * Extrae el mensaje de error de una respuesta de error de Axios
 * Maneja múltiples niveles de error
 *
 * @param error - Error capturado
 * @param defaultMessage - Mensaje por defecto
 * @returns Objeto con información de error normalizada
 */
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
 * Validar si es seguro operar con un cliente
 * @param cliente
 */
export const isValidClienteForOperation = (
  cliente: GetClientes | null | undefined
): cliente is GetClientes => {
  return cliente !== null && cliente !== undefined && Boolean(cliente.rut);
};

/**
 * Validar si cliente detallado es válido
 * @param cliente
 */
export const isValidDetailedCliente = (
  cliente: GetClienteById | GetClientesByRut | null | undefined
): cliente is GetClienteById | GetClientesByRut => {
  return cliente !== null && cliente !== undefined && Boolean(cliente.rut);
};

/**
 * Obtener permisos del usuario para clientes
 * @param canCreate
 * @param canEdit
 * @param route
 */
export const getClientePermissions = (
  canCreate: (route: string) => boolean,
  canEdit: (route: string) => boolean,
  route: string = CLIENTES_ROUTE
): ClientePermissions => ({
  hasCreatePermission: canCreate(route),
  hasEditPermission: canEdit(route)
});

/**
 * Obtener URL de edición de cliente
 * @param rutCliente
 */
export const getClienteEditUrl = (rutCliente: string): string => {
  return `${CLIENTES_ROUTE}/${rutCliente}`;
};

/**
 * Normalizar cliente detallado desde respuesta de API
 * Convierte GetClienteById a GetClientesByRut
 * @param clienteDetallado
 */
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

/**
 * Validar si está cargando un cliente específico
 * @param loading
 * @param rutCliente
 */
export const isLoadingCliente = (
  loading: ClienteLoadingState,
  rutCliente: string
): boolean => {
  return loading.isLoading && loading.rutLoading === rutCliente;
};
