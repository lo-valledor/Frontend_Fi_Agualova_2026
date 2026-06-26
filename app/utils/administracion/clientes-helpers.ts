import type { Cliente, ClientesRow } from '~/types/administracion';
import { extractApiErrorMessage } from './api-error';

export const CLIENTES_ROUTE = '/dashboard/administracion/clientes';
export const CLIENTES_CREAR_ROUTE = '/dashboard/administracion/clientes/crear';

export const createInitialClienteModalState = () => ({
  details: {
    isOpen: false
  }
});

export const createInitialLoadingState = () => ({
  isLoading: false,
  rutLoading: null
});

export const extractClienteErrorMessage = (
  error: unknown,
  defaultMessage: string
) => extractApiErrorMessage(error, defaultMessage);

export const isValidClienteForOperation = (
  cliente: ClientesRow | null | undefined
): cliente is ClientesRow => {
  return cliente !== null && cliente !== undefined && Boolean(cliente.rut);
};

export const isValidDetailedCliente = (
  cliente: Cliente | null | undefined
): cliente is Cliente => {
  return cliente !== null && cliente !== undefined && Boolean(cliente.rut);
};

export const getClienteEditUrl = (rutCliente: string): string => {
  return `${CLIENTES_ROUTE}/${rutCliente}`;
};

export const normalizeClienteDetallado = (
  clienteDetallado: Cliente
): Cliente => {
  return {
    rut: clienteDetallado.rut,
    nombreComuna: clienteDetallado.nombreComuna,
    nombreGiro: clienteDetallado.nombreGiro,
    nombre: clienteDetallado.nombre,
    apellido: clienteDetallado.apellido,
    esEmpresa: clienteDetallado.esEmpresa,
    direccion: clienteDetallado.direccion,
    codigoComuna: clienteDetallado.codigoComuna,
    contacto: clienteDetallado.contacto,
    telefono: clienteDetallado.telefono,
    email: clienteDetallado.email,
    codigoGiro: clienteDetallado.codigoGiro
  };
};

export const isLoadingCliente = (
  loading: { isLoading: boolean; rutLoading: string | null },
  rutCliente: string
): boolean => {
  return loading.isLoading && loading.rutLoading === rutCliente;
};
