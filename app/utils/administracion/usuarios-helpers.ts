import type {
  UsuarioErrorInfo,
  UsuarioModalMode,
  UsuarioModalState,
  Usuarios
} from '~/types/administracion';
import { extractApiErrorMessage } from './api-error';

export const USUARIOS_ROUTE = '/dashboard/administracion/usuarios';

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

export const extractErrorMessage = (
  error: unknown,
  defaultMessage: string
): UsuarioErrorInfo => extractApiErrorMessage(error, defaultMessage);

export const isValidUserForOperation = (
  user: Usuarios | null | undefined
): user is Usuarios => {
  return (
    user !== null &&
    user !== undefined &&
    user.id !== undefined &&
    user.id !== ''
  );
};

export const isUsuariosListEmpty = (usuarios: Usuarios[]): boolean => {
  return !Array.isArray(usuarios) || usuarios.length === 0;
};

export const getModalTitle = (mode: UsuarioModalMode): string => {
  return mode === 'add' ? 'Crear Nuevo Usuario' : 'Editar Usuario';
};

export const getSuccessMessage = (mode: UsuarioModalMode): string => {
  return mode === 'add'
    ? 'Usuario creado exitosamente'
    : 'Usuario actualizado exitosamente';
};

export const createModalHandler = <T extends keyof UsuarioModalState>(
  modalKey: T,
  modeForUserForm?: UsuarioModalMode
) => {
  return (user: Usuarios | null = null) => ({
    selectedUser: user,
    modalState: {
      [modalKey]: {
        isOpen: true,
        ...(modeForUserForm && { mode: modeForUserForm })
      }
    } as Partial<UsuarioModalState>
  });
};
