import type { AxiosError } from "axios";
import type {
  UsuarioErrorInfo,
  UsuarioModalMode,
  UsuarioModalState,
  Usuarios,
} from "~/types/administracion";

export const USUARIOS_ROUTE = "/dashboard/administracion/usuarios";

export const createInitialModalState = (): UsuarioModalState => ({
  userForm: {
    isOpen: false,
    mode: "add",
  },
  deleteDialog: {
    isOpen: false,
  },
  permissions: {
    isOpen: false,
  },
  roles: {
    isOpen: false,
  },
});

export const extractErrorMessage = (
  error: unknown,
  defaultMessage: string,
): UsuarioErrorInfo => {
  // Early return para errores de red sin respuesta
  if (isNetworkError(error)) {
    return {
      message: "Error de conexión. Por favor, intenta nuevamente.",
      isNetworkError: true,
    };
  }

  // Intentar extraer mensaje del servidor
  const serverMessage = extractServerErrorMessage(error);
  if (serverMessage) {
    return {
      message: serverMessage,
      isNetworkError: false,
    };
  }

  // Fallback al mensaje por defecto
  return {
    message: defaultMessage,
    isNetworkError: false,
  };
};

const isNetworkError = (error: unknown): boolean => {
  const axiosError = error as AxiosError;
  return !axiosError?.response;
};

const extractServerErrorMessage = (error: unknown): string | null => {
  const axiosError = error as AxiosError<{ message?: string }>;
  return axiosError?.response?.data?.message || null;
};

export const isValidUserForOperation = (
  user: Usuarios | null | undefined,
): user is Usuarios => {
  return (
    user !== null &&
    user !== undefined &&
    user.id !== undefined &&
    user.id !== ""
  );
};

export const isUsuariosListEmpty = (usuarios: Usuarios[]): boolean => {
  return !Array.isArray(usuarios) || usuarios.length === 0;
};

export const getModalTitle = (mode: UsuarioModalMode): string => {
  return mode === "add" ? "Crear Nuevo Usuario" : "Editar Usuario";
};

export const getSuccessMessage = (mode: UsuarioModalMode): string => {
  return mode === "add"
    ? "Usuario creado exitosamente"
    : "Usuario actualizado exitosamente";
};

export const createModalHandler = <T extends keyof UsuarioModalState>(
  modalKey: T,
  modeForUserForm?: UsuarioModalMode,
) => {
  return (user: Usuarios | null = null) => ({
    selectedUser: user,
    modalState: {
      [modalKey]: {
        isOpen: true,
        ...(modeForUserForm && { mode: modeForUserForm }),
      },
    } as Partial<UsuarioModalState>,
  });
};
