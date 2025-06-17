import { useCallback, useState } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "~/context/AuthContext";
import api from "~/lib/api";
import type {
  Usuarios,
  CrearUsuarioProps,
  ActualizarUsuarioProps,
  GetClientes,
  ClientesFormData,
  GetClientesByRut,
} from "~/types/administracion";

interface LoadingState {
  isLoading: boolean;
  error: Error | null;
}

export function useAdministracion() {
  const [usuarios, setUsuarios] = useState<Usuarios[]>([]);
  const [clientes, setClientes] = useState<GetClientes[]>([]);

  //Estado unificado para manejo de carga y errores
  const [loadingState, setLoadingState] = useState<
    Record<string, LoadingState>
  >({
    fetchUsuarios: { isLoading: false, error: null },
    createUsuario: { isLoading: false, error: null },
    updateUsuario: { isLoading: false, error: null },
    deleteUsuario: { isLoading: false, error: null },
    fetchClientes: { isLoading: false, error: null },
    createCliente: { isLoading: false, error: null },
    updateCliente: { isLoading: false, error: null },
    deleteCliente: { isLoading: false, error: null },
    fetchClienteByRut: { isLoading: false, error: null },
    exportClientesToExcel: { isLoading: false, error: null },
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

  // ========== FUNCIONES DE CLIENTES ==========

  //Función para obtener clientes
  const fetchClientes = useCallback(async () => {
    if (!checkAuth()) return;

    try {
      setLoading("fetchClientes", true);
      const response = await api.get("ClienteBuscar");
      setClientes(response.data as GetClientes[]);
      return response.data;
    } catch (error: any) {
      setError("fetchClientes", error);
      throw error;
    } finally {
      setLoading("fetchClientes", false);
    }
  }, [checkAuth, setLoading, setError]);

  //Función para crear cliente
  const createCliente = useCallback(
    async (clienteData: ClientesFormData) => {
      if (!checkAuth()) return;

      try {
        setLoading("createCliente", true);
        const response = await api.post("/cliente/crear", clienteData);
        // Recargar la lista después de crear
        await fetchClientes();
        return response.data;
      } catch (error: any) {
        setError("createCliente", error);
        throw error;
      } finally {
        setLoading("createCliente", false);
      }
    },
    [checkAuth, setLoading, setError, fetchClientes]
  );

  //Función para actualizar cliente
  const updateCliente = useCallback(
    async (clienteData: ClientesFormData) => {
      if (!checkAuth()) return;

      try {
        setLoading("updateCliente", true);
        const response = await api.put("/cliente/modificar", clienteData);
        // Recargar la lista después de actualizar
        await fetchClientes();
        return response.data;
      } catch (error: any) {
        setError("updateCliente", error);
        throw error;
      } finally {
        setLoading("updateCliente", false);
      }
    },
    [checkAuth, setLoading, setError, fetchClientes]
  );

  //Función para eliminar cliente - usando RUT como identificador
  const deleteCliente = useCallback(
    async (rut: string) => {
      if (!checkAuth()) return;

      try {
        setLoading("deleteCliente", true);
        // Asumiendo que existe un endpoint DELETE para clientes
        const response = await api.delete(`/cliente/eliminar/${rut}`);
        // Recargar la lista después de eliminar
        await fetchClientes();
        return response.data;
      } catch (error: any) {
        setError("deleteCliente", error);
        throw error;
      } finally {
        setLoading("deleteCliente", false);
      }
    },
    [checkAuth, setLoading, setError, fetchClientes]
  );

  //Función para obtener cliente por RUT
  const fetchClienteByRut = useCallback(
    async (rut: string): Promise<GetClientesByRut> => {
      if (!checkAuth()) throw new Error('No autenticado');

      try {
        setLoading("fetchClienteByRut", true);
        const response = await api.get(`/cliente/${rut}`);
        return response.data as GetClientesByRut;
      } catch (error: any) {
        setError("fetchClienteByRut", error);
        throw error;
      } finally {
        setLoading("fetchClienteByRut", false);
      }
    },
    [checkAuth, setLoading, setError]
  );

  //Función para exportar clientes a Excel
  const exportClientesToExcel = useCallback(async () => {
    if (!checkAuth()) return;

    try {
      setLoading("exportClientesToExcel", true);
      const response = await api.get("/cliente/exportar-excel", {
        responseType: 'blob',
      });
      
      // Crear un enlace de descarga
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `clientes_${new Date().toISOString().split('T')[0]}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      return response.data;
    } catch (error: any) {
      setError("exportClientesToExcel", error);
      throw error;
    } finally {
      setLoading("exportClientesToExcel", false);
    }
  }, [checkAuth, setLoading, setError]);

  const isLoading = Object.values(loadingState).some(
    (state) => state.isLoading
  );

  const error =
    Object.values(loadingState).find((state) => state.error)?.error || null;
    
  return {
    // Usuarios
    usuarios,
    fetchUsuarios,
    createUsuario,
    updateUsuario,
    deleteUsuario,
    
    // Clientes
    clientes,
    fetchClientes,
    createCliente,
    updateCliente,
    deleteCliente,
    fetchClienteByRut,
    exportClientesToExcel,
    
    // Estado
    loadingState,
    isLoading,
    error,
  };
}
