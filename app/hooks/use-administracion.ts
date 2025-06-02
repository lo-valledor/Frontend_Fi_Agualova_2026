import { useCallback, useState } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "~/context/AuthContext";
import api from "~/lib/api";
import type {
  Usuarios,
  CrearUsuarioProps,
  ActualizarUsuarioProps,
} from "~/types/administracion";

interface LoadingState {
  isLoading: boolean;
  error: Error | null;
}

export function useAdministracion() {
  const [usuarios, setUsuarios] = useState<Usuarios[]>([]);

  //Estado unificado para manejo de carga y errores
  const [loadingState, setLoadingState] = useState<
    Record<string, LoadingState>
  >({
    fetchUsuarios: { isLoading: false, error: null },
    createUsuario: { isLoading: false, error: null },
    updateUsuario: { isLoading: false, error: null },
    deleteUsuario: { isLoading: false, error: null },
  });

  const auth = useAuth();
  const navigate = useNavigate();

  // Función para actualizar el estado de carga
  const setLoading = useCallback((key: string, isLoading: boolean) => {
    setLoadingState((prev) => ({
      ...prev,
      [key]: {
        ...prev[key],
        isLoading,
      },
    }));
  }, []);

  // Función para actualizar el estado de error
  const setError = useCallback((key: string, error: Error | null) => {
    setLoadingState((prev) => ({
      ...prev,
      [key]: {
        ...prev[key],
        error,
      },
    }));
  }, []);

  // Verificar autenticación y redirigir si es necesario
  const checkAuth = useCallback(() => {
    if (!auth.isAuthenticated) {
      navigate("/auth/login", { replace: true });
      return false;
    }
    return true;
  }, [auth, navigate]);

  //Función para obtener usuarios
  const fetchUsuarios = useCallback(async () => {
    if (!checkAuth()) return;

    try {
      setLoading("fetchUsuarios", true);
      const response = await api.get("/listar");
      setUsuarios(response.data as Usuarios[]);
      return response.data;
    } catch (error: any) {
      setError("fetchUsuarios", error);
      throw error;
    } finally {
      setLoading("fetchUsuarios", false);
    }
  }, [checkAuth, setLoading, setError]);
  //Función para crear usuario
  const createUsuario = useCallback(
    async (usuarioData: CrearUsuarioProps) => {
      if (!checkAuth()) return;

      try {
        setLoading("createUsuario", true);
        const response = await api.post("/registrar", usuarioData);
        // Recargar la lista después de crear
        await fetchUsuarios();
        return response.data;
      } catch (error: any) {
        setError("createUsuario", error);
        throw error;
      } finally {
        setLoading("createUsuario", false);
      }
    },
    [checkAuth, setLoading, setError, fetchUsuarios]
  );
  //Función para actualizar usuario
  const updateUsuario = useCallback(
    async (id: number, usuarioData: ActualizarUsuarioProps) => {
      if (!checkAuth()) return;

      try {
        setLoading("updateUsuario", true);
        const response = await api.put(`/actualizar/${id}`, usuarioData);
        // Recargar la lista después de actualizar
        await fetchUsuarios();
        return response.data;
      } catch (error: any) {
        setError("updateUsuario", error);
        throw error;
      } finally {
        setLoading("updateUsuario", false);
      }
    },
    [checkAuth, setLoading, setError, fetchUsuarios]
  );

  //Función para eliminar usuario
  const deleteUsuario = useCallback(
    async (id: number) => {
      if (!checkAuth()) return;

      try {
        setLoading("deleteUsuario", true);
        const response = await api.delete(`/eliminar/${id}`);
        // Recargar la lista después de eliminar
        await fetchUsuarios();
        return response.data;
      } catch (error: any) {
        setError("deleteUsuario", error);
        throw error;
      } finally {
        setLoading("deleteUsuario", false);
      }
    },
    [checkAuth, setLoading, setError, fetchUsuarios]
  );

  const isLoading = Object.values(loadingState).some(
    (state) => state.isLoading
  );

  const error =
    Object.values(loadingState).find((state) => state.error)?.error || null;
  return {
    usuarios,
    fetchUsuarios,
    createUsuario,
    updateUsuario,
    deleteUsuario,
    loadingState,
    isLoading,
    error,
  };
}
