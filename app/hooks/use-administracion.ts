import { useEffect, useState } from 'react';

import api from '~/lib/api';
import { administracionService } from '~/services/administracionService';
import type {
  Acometida,
  BuscarCargoFacturable,
  ComboEmpalmes,
  ComboNichos,
  ComboSectores,
  ContratosDisponibles,
  GeCombosConceptos,
  GetCargoTipoContrato,
  GetClienteById,
  GetClientes,
  GetCombosTarifas,
  GetCombosTiposMedidor,
  GetComunas,
  GetCondicionesContrato,
  GetContratos,
  GetContratosClientes,
  GetFechaActual,
  GetGiros,
  GetLimiteInvierno,
  GetMedidores,
  GetRegiones,
  Usuarios
} from '~/types/administracion';
import type {
  Conceptos,
  Marca,
  Tarifas,
  TiposContrato
} from '~/types/mantencion';

export function useAcometidasData() {
  const [data, setData] = useState<{
    acometidas: Acometida[];
    comboEmpalmes: ComboEmpalmes[];
    comboNichos: ComboNichos[];
    comboSectores: ComboSectores[];
    contratosDisponibles: ContratosDisponibles[];
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        const result = await administracionService.getAcometidasData();

        if (result.error) {
          setError(result.error);
        } else if (result.data) {
          setData(result.data as any);
        } else {
          setError('No se pudieron cargar los datos');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const refreshData = async () => {
    try {
      setLoading(true);
      setError(null);

      const result = await administracionService.getAcometidasData();

      if (result.error) {
        setError(result.error);
      } else if (result.data) {
        setData(result.data);
      } else {
        setError('No se pudieron cargar los datos');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  return {
    data,
    loading,
    error,
    refreshData
  };
}

export function useClientesData() {
  const [data, setData] = useState<{
    clientes: GetClientes[];
    giros: GetGiros[];
    comunas: GetComunas[];
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        const result = await administracionService.getClientesData();

        if (result.error) {
          setError(result.error);
        } else if (result.data) {
          setData(result.data);
        } else {
          setError('No se pudieron cargar los datos');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  return {
    data,
    loading,
    error
  };
}

export function useContratosData() {
  const [data, setData] = useState<{
    contratos: GetContratos[];
    regiones: GetRegiones[];
    contratosClientes: GetContratosClientes[];
    limiteInvierno: GetLimiteInvierno[];
    fechaActual: GetFechaActual[];
    tipoContrato: TiposContrato[];
    tarifas: Tarifas[];
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        const result = await administracionService.getContratosData();

        if (result.error) {
          setError(result.error);
        } else if (result.data) {
          setData(result.data as any);
        } else {
          setError('No se pudieron cargar los datos');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  return {
    data,
    loading,
    error
  };
}

export function useMedidoresData() {
  const [data, setData] = useState<{
    medidores: GetMedidores[];
    marcas: Marca[];
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        const result = await administracionService.getMedidoresData();

        if (result.error) {
          setError(result.error);
        } else if (result.data) {
          setData(result.data);
        } else {
          setError('No se pudieron cargar los datos');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  return {
    data,
    loading,
    error
  };
}

export function useUsuarios() {
  const [data, setData] = useState<Usuarios[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        const result = await administracionService.getUsuarios();

        if (result.error) {
          setError(result.error);
        } else if (result.data) {
          setData(result.data);
        } else {
          setError('No se pudieron cargar los datos');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  return {
    data,
    loading,
    error
  };
}

export function useCargoTipoContrato() {
  const [data, setData] = useState<GetCargoTipoContrato[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        const result = await administracionService.getCargoTipoContrato();

        if (result.error) {
          setError(result.error);
        } else if (result.data) {
          setData(result.data);
        } else {
          setError('No se pudieron cargar los datos');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  return {
    data,
    loading,
    error
  };
}

export function useCondicionesContrato() {
  const [data, setData] = useState<{
    condicionesContrato: GetCondicionesContrato[];
    conceptos: Conceptos[];
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        const result = await administracionService.getCondicionesContratoData();

        if (result.error) {
          setError(result.error);
        } else if (result.data) {
          setData(result.data);
        } else {
          setError('No se pudieron cargar los datos');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  return {
    data,
    loading,
    error
  };
}

export function useCargoFacturable() {
  const [data, setData] = useState<{
    cargos: BuscarCargoFacturable[];
    conceptos: GeCombosConceptos[];
    tarifas: GetCombosTarifas[];
    tiposMedidor: GetCombosTiposMedidor[];
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        const result = await administracionService.getCargoFacturableData();

        if (result.error) {
          setError(result.error);
        } else if (result.data) {
          setData(result.data);
        } else {
          setError('No se pudieron cargar los datos');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  return {
    data,
    loading,
    error
  };
}

export function useAdministracion() {
  const [loadingState, setLoadingState] = useState({
    createUsuario: { isLoading: false },
    updateUsuario: { isLoading: false },
    deleteUsuario: { isLoading: false },
    fetchUsuarios: { isLoading: false }
  });

  const createUsuario = async (userData: any) => {
    setLoadingState(prev => ({
      ...prev,
      createUsuario: { isLoading: true }
    }));
    try {
      const response = await api.post('/registrar', userData);
      return response.data;
    } finally {
      setLoadingState(prev => ({
        ...prev,
        createUsuario: { isLoading: false }
      }));
    }
  };

  const updateUsuario = async (idUsuario: number, userData: any) => {
    setLoadingState(prev => ({
      ...prev,
      updateUsuario: { isLoading: true }
    }));
    try {
      const response = await api.put(`/actualizar/${idUsuario}`, userData);
      return response.data;
    } finally {
      setLoadingState(prev => ({
        ...prev,
        updateUsuario: { isLoading: false }
      }));
    }
  };

  const deleteUsuario = async (idUsuario: number) => {
    setLoadingState(prev => ({
      ...prev,
      deleteUsuario: { isLoading: true }
    }));
    try {
      const response = await api.delete(`/eliminar/${idUsuario}`);
      return response.data;
    } finally {
      setLoadingState(prev => ({
        ...prev,
        deleteUsuario: { isLoading: false }
      }));
    }
  };

  const fetchUsuarios = async () => {
    setLoadingState(prev => ({
      ...prev,
      fetchUsuarios: { isLoading: true }
    }));
    try {
      const response = await api.get('/listar');
      return response.data;
    } finally {
      setLoadingState(prev => ({
        ...prev,
        fetchUsuarios: { isLoading: false }
      }));
    }
  };

  const getUsuarioById = async (idUsuario: number): Promise<Usuarios> => {
    try {
      const response = await api.get(`/obtener/${idUsuario}`);
      return response.data as Usuarios;
    } catch (error) {
      console.error('Error al obtener usuario:', error);
      throw error;
    }
  };

  return {
    createUsuario,
    updateUsuario,
    deleteUsuario,
    fetchUsuarios,
    getUsuarioById,
    loadingState
  };
}

export function useClientes() {
  const getClienteByRut = async (rut: string) => {
    const response = await api.get(`/cliente/${rut}`);
    return response.data as GetClienteById;
  };

  return {
    getClienteByRut
  };
}
