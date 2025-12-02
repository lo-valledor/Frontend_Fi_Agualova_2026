import type { AxiosError } from 'axios';
import type {
  UsuarioErrorInfo,
  UsuarioModalState,
  UsuarioModalMode,
  UsuarioPermissions,
  Usuarios
} from '~/types/administracion';

/**
 * Constantes para las rutas y configuración del módulo de usuarios
 */
export const USUARIOS_ROUTE = '/dashboard/administracion/usuarios';

/**
 * Crear el estado inicial de modales
 */
export const createInitialModalState = (): UsuarioModalState => ({
  userForm: {
    isOpen: false,
    mode: 'add'
  },
  deleteDialog: {
    isOpen: false
  },
  permissions: {
    isOpen: false
  },
  roles: {
    isOpen: false
  }
});

/**
 * Extrae el mensaje de error de una respuesta de error de Axios
 * Maneja múltiples niveles de error y proporciona un mensaje por defecto
 *
 * @param error - Error capturado (potencialmente AxiosError)
 * @param defaultMessage - Mensaje por defecto si no se puede extraer uno
 * @returns Objeto con el mensaje de error e indicador de error de red
 */
export const extractErrorMessage = (
  error: unknown,
  defaultMessage: string
): UsuarioErrorInfo => {
  // Early return para errores de red sin respuesta
  if (isNetworkError(error)) {
    return {
      message: 'Error de conexión. Por favor, intenta nuevamente.',
      isNetworkError: true
    };
  }

  // Intentar extraer mensaje del servidor
  const serverMessage = extractServerErrorMessage(error);
  if (serverMessage) {
    return {
      message: serverMessage,
      isNetworkError: false
    };
  }

  // Fallback al mensaje por defecto
  return {
    message: defaultMessage,
    isNetworkError: false
  };
};

/**
 * Verifica si es un error de red (sin respuesta del servidor)
 * @param error
 */
const isNetworkError = (error: unknown): boolean => {
  const axiosError = error as AxiosError;
  return !axiosError?.response;
};

/**
 * Extrae el mensaje de error de la respuesta del servidor
 * @param error
 */
const extractServerErrorMessage = (error: unknown): string | null => {
  const axiosError = error as AxiosError<{ message?: string }>;
  return axiosError?.response?.data?.message || null;
};

/**
 * Validar si es seguro operar con un usuario seleccionado
 * Evita acciones con usuarios null/undefined
 *
 * @param user - Usuario a validar
 * @returns true si el usuario es válido para operaciones
 */
export const isValidUserForOperation = (
  user: Usuarios | null | undefined
): user is Usuarios => {
  return user !== null && user !== undefined && user.idUsuario > 0;
};

/**
 * Obtener información de permisos del usuario
 * Centraliza la lógica de validación de permisos
 *
 * @param canCreate - Función de validación de permisos de crear
 * @param canEdit - Función de validación de permisos de editar
 * @param route - Ruta a validar
 * @returns Objeto con los permisos validados
 */
export const getUserPermissions = (
  canCreate: (route: string) => boolean,
  canEdit: (route: string) => boolean,
  route: string = USUARIOS_ROUTE
): UsuarioPermissions => ({
  hasCreatePermission: canCreate(route),
  hasEditPermission: canEdit(route)
});

/**
 * Validar si la lista de usuarios está vacía
 * @param usuarios
 */
export const isUsuariosListEmpty = (usuarios: Usuarios[]): boolean => {
  return !Array.isArray(usuarios) || usuarios.length === 0;
};

/**
 * Obtener el título del modal basado en el modo
 * @param mode
 */
export const getModalTitle = (mode: UsuarioModalMode): string => {
  return mode === 'add' ? 'Crear Nuevo Usuario' : 'Editar Usuario';
};

/**
 * Obtener el mensaje de éxito basado en el modo
 * @param mode
 */
export const getSuccessMessage = (mode: UsuarioModalMode): string => {
  return mode === 'add'
    ? 'Usuario creado exitosamente'
    : 'Usuario actualizado exitosamente';
};

/**
 * Crear un handler de modal con early returns
 * Abre un modal específico para un usuario
 * @param modalKey
 * @param modeForUserForm
 */
export const createModalHandler = <T extends keyof UsuarioModalState>(
  modalKey: T,
  modeForUserForm?: UsuarioModalMode
) => {
  return (user: Usuarios | null = null) => ({
    selectedUser: user,
    modalState: {
      [modalKey]: { isOpen: true, ...(modeForUserForm && { mode: modeForUserForm }) }
    } as Partial<UsuarioModalState>
  });
};
