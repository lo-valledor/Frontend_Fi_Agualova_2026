import { useEffect, useState } from 'react';

import api from '~/lib/api';
import { administracionService } from '~/services/administracionService';
import type {
  AcometidaRow,
  BuscarContratosLibres,
  CargoFacturableConceptos,
  CargoFacturableRow,
  CargoFacturableTarifas,
  CargoFacturableTiposMedidor,
  CargoTipoContrato,
  Cliente,
  ClientesRow,
  Concepto,
  CondicionesContratoRow,
  ContratosRow,
  Empalmes,
  MedidoresRow,
  Nichos,
  NombreComuna,
  NombreGiro,
  Sectores,
  Usuarios
} from '~/types/administracion';
import type { Marca, Tarifa, TipoContrato } from '~/types/mantencion';
import { handleDataLoad } from './utils/data-loader';

export function useAcometidasData() {
  const [data, setData] = useState<{
    acometidas: AcometidaRow[];
    comboEmpalmes: Empalmes[];
    comboNichos: Nichos[];
    comboSectores: Sectores[];
    contratosDisponibles: BuscarContratosLibres[];
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    handleDataLoad(
      () => administracionService.getAcometidasData(),
      setData,
      setError,
      setLoading
    );
  }, []);

  const refreshData = async (): Promise<void> => {
    await handleDataLoad(
      () => administracionService.getAcometidasData(),
      setData,
      setError,
      setLoading
    );
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
    clientes: ClientesRow[];
    giros: NombreGiro[];
    comunas: NombreComuna[];
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    handleDataLoad(
      () => administracionService.getClientesData(),
      setData,
      setError,
      setLoading
    );
  }, []);

  return {
    data,
    loading,
    error
  };
}

export function useContratosData() {
  const [data, setData] = useState<{
    contratos: ContratosRow[];
    regiones: unknown[];
    contratosClientes: unknown[];
    limiteInvierno: unknown[];
    fechaActual: unknown[];
    tipoContrato: TipoContrato[];
    tarifas: Tarifa[];
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    handleDataLoad(
      () => administracionService.getContratosData(),
      setData,
      setError,
      setLoading
    );
  }, []);

  return {
    data,
    loading,
    error
  };
}

export function useMedidoresData() {
  const [data, setData] = useState<{
    medidores: MedidoresRow[];
    marcas: Marca[];
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    handleDataLoad(
      () => administracionService.getMedidoresData(),
      setData,
      setError,
      setLoading
    );
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
    handleDataLoad(
      () => administracionService.getUsuarios(),
      result => setData(result || []),
      setError,
      setLoading
    );
  }, []);

  return {
    data,
    loading,
    error
  };
}

export function useCargoTipoContrato() {
  const [data, setData] = useState<CargoTipoContrato[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    handleDataLoad(
      () => administracionService.getCargosTiposContrato(),
      result => setData(result || []),
      setError,
      setLoading
    );
  }, []);

  return {
    data,
    loading,
    error
  };
}

export function useCondicionesContrato() {
  const [data, setData] = useState<{
    condicionesContrato: CondicionesContratoRow[];
    conceptos: Concepto[];
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    handleDataLoad(
      () => administracionService.getCondicionesContratoData(),
      setData,
      setError,
      setLoading
    );
  }, []);

  return {
    data,
    loading,
    error
  };
}

export function useCargoFacturable() {
  const [data, setData] = useState<{
    cargos: CargoFacturableRow[];
    conceptos: CargoFacturableConceptos[];
    tarifas: CargoFacturableTarifas[];
    tiposMedidor: CargoFacturableTiposMedidor[];
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    handleDataLoad(
      () => administracionService.getCargoFacturableData(),
      setData,
      setError,
      setLoading
    );
  }, []);

  return {
    data,
    loading,
    error
  };
}

interface LoadingState {
  createUsuario: { isLoading: boolean };
  updateUsuario: { isLoading: boolean };
  deleteUsuario: { isLoading: boolean };
  fetchUsuarios: { isLoading: boolean };
}

export function useAdministracion() {
  const [loadingState, setLoadingState] = useState<LoadingState>({
    createUsuario: { isLoading: false },
    updateUsuario: { isLoading: false },
    deleteUsuario: { isLoading: false },
    fetchUsuarios: { isLoading: false }
  });

  const createUsuario = async (
    userData: Partial<Usuarios>
  ): Promise<unknown> => {
    setLoadingState(prev => ({
      ...prev,
      createUsuario: { isLoading: true }
    }));

    try {
      const response = await api.post('/register', userData);
      return response.data;
    } finally {
      setLoadingState(prev => ({
        ...prev,
        createUsuario: { isLoading: false }
      }));
    }
  };

  const updateUsuario = async (
    id: string | number,
    userData: Partial<Usuarios>
  ): Promise<unknown> => {
    setLoadingState(prev => ({
      ...prev,
      updateUsuario: { isLoading: true }
    }));

    try {
      const response = await api.put(`/actualizar/${id}`, userData);
      return response.data;
    } finally {
      setLoadingState(prev => ({
        ...prev,
        updateUsuario: { isLoading: false }
      }));
    }
  };

  const deleteUsuario = async (id: string): Promise<unknown> => {
    setLoadingState(prev => ({
      ...prev,
      deleteUsuario: { isLoading: true }
    }));

    try {
      const response = await api.delete(`/eliminar/${id}`);
      return response.data;
    } finally {
      setLoadingState(prev => ({
        ...prev,
        deleteUsuario: { isLoading: false }
      }));
    }
  };

  const fetchUsuarios = async (): Promise<unknown> => {
    setLoadingState(prev => ({
      ...prev,
      fetchUsuarios: { isLoading: true }
    }));

    try {
      const response = await api.get('/GetAllUsers');
      return response.data;
    } finally {
      setLoadingState(prev => ({
        ...prev,
        fetchUsuarios: { isLoading: false }
      }));
    }
  };

  const getUsuarioById = async (id: number): Promise<Usuarios> => {
    try {
      const response = await api.get(`/GetUserById/${id}`);
      return response.data as Usuarios;
    } catch (error) {
      console.error('Error al obtener el usuario:', error);
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
  const getClienteByRut = async (rut: string): Promise<Cliente> => {
    const response = await api.get(`/clientes/${rut}`);
    return response.data as Cliente;
  };

  return {
    getClienteByRut
  };
}
