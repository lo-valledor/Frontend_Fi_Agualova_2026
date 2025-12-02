/**
 * Administration Module Hooks
 *
 * Provides hooks for managing administration data including:
 * - Acometidas (service connections)
 * - Clientes (clients)
 * - Contratos (contracts)
 * - Medidores (meters)
 * - Usuarios (users)
 * - Cargo tipo contrato (contract type charges)
 * - Condiciones contrato (contract conditions)
 * - Cargo facturable (billable charges)
 *
 * All hooks use the generic handleDataLoad utility to avoid code duplication
 * and ensure consistent error handling across the module.
 */

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
import { handleDataLoad } from './utils/data-loader';

/**
 * Hook for loading acometidas (service connections) data
 *
 * Provides complete data for managing acometidas including:
 * - Acometidas list
 * - Available empalmes (connections)
 * - Available nichos (niches)
 * - Available sectores (sectors)
 * - Available contracts
 *
 * @returns {Object} Hook state and actions
 * @returns {Object|null} data - Acometidas data object or null
 * @returns {boolean} loading - Loading state
 * @returns {string|null} error - Error message or null
 * @returns {Function} refreshData - Function to refresh data
 *
 * @example
 * ```tsx
 * const { data, loading, error, refreshData } = useAcometidasData();
 *
 * if (loading) return <Loading />;
 * if (error) return <Error message={error} />;
 * if (!data) return null;
 *
 * return <AcometidasTable data={data.acometidas} />;
 * ```
 */
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

/**
 * Hook for loading clientes (clients) data
 *
 * Provides complete data for managing clients including:
 * - Clientes list
 * - Available giros (business types)
 * - Available comunas (communes)
 *
 * @returns {Object} Hook state
 * @returns {Object|null} data - Clientes data object or null
 * @returns {boolean} loading - Loading state
 * @returns {string|null} error - Error message or null
 *
 * @example
 * ```tsx
 * const { data, loading, error } = useClientesData();
 *
 * if (loading) return <Loading />;
 * if (error) return <Error message={error} />;
 *
 * return <ClientesForm clientes={data?.clientes} giros={data?.giros} />;
 * ```
 */
export function useClientesData() {
  const [data, setData] = useState<{
    clientes: GetClientes[];
    giros: GetGiros[];
    comunas: GetComunas[];
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

/**
 * Hook for loading contratos (contracts) data
 *
 * Provides complete data for managing contracts including:
 * - Contratos list
 * - Available regiones (regions)
 * - Contratos clientes (client contracts)
 * - Limite invierno (winter limits)
 * - Fecha actual (current date)
 * - Tipos de contrato (contract types)
 * - Tarifas (rates)
 *
 * @returns {Object} Hook state
 * @returns {Object|null} data - Contratos data object or null
 * @returns {boolean} loading - Loading state
 * @returns {string|null} error - Error message or null
 *
 * @example
 * ```tsx
 * const { data, loading, error } = useContratosData();
 *
 * return (
 *   <ContratosForm
 *     contratos={data?.contratos}
 *     tiposContrato={data?.tipoContrato}
 *   />
 * );
 * ```
 */
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

/**
 * Hook for loading medidores (meters) data
 *
 * Provides complete data for managing meters including:
 * - Medidores list
 * - Available marcas (brands)
 *
 * @returns {Object} Hook state
 * @returns {Object|null} data - Medidores data object or null
 * @returns {boolean} loading - Loading state
 * @returns {string|null} error - Error message or null
 *
 * @example
 * ```tsx
 * const { data, loading, error } = useMedidoresData();
 *
 * return (
 *   <MedidoresTable
 *     medidores={data?.medidores}
 *     marcas={data?.marcas}
 *   />
 * );
 * ```
 */
export function useMedidoresData() {
  const [data, setData] = useState<{
    medidores: GetMedidores[];
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

/**
 * Hook for loading usuarios (users) list
 *
 * @returns {Object} Hook state
 * @returns {Usuarios[]} data - Array of users
 * @returns {boolean} loading - Loading state
 * @returns {string|null} error - Error message or null
 *
 * @example
 * ```tsx
 * const { data, loading, error } = useUsuarios();
 *
 * return <UsersTable users={data} />;
 * ```
 */
export function useUsuarios() {
  const [data, setData] = useState<Usuarios[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    handleDataLoad(
      () => administracionService.getUsuarios(),
      (result) => setData(result || []),
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

/**
 * Hook for loading cargo tipo contrato (contract type charges)
 *
 * @returns {Object} Hook state
 * @returns {GetCargoTipoContrato[]} data - Array of contract type charges
 * @returns {boolean} loading - Loading state
 * @returns {string|null} error - Error message or null
 *
 * @example
 * ```tsx
 * const { data, loading, error } = useCargoTipoContrato();
 *
 * return <CargoTipoContratoTable cargos={data} />;
 * ```
 */
export function useCargoTipoContrato() {
  const [data, setData] = useState<GetCargoTipoContrato[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    handleDataLoad(
      () => administracionService.getCargoTipoContrato(),
      (result) => setData(result || []),
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

/**
 * Hook for loading condiciones contrato (contract conditions)
 *
 * Provides complete data for managing contract conditions including:
 * - Condiciones contrato list
 * - Available conceptos (concepts)
 *
 * @returns {Object} Hook state
 * @returns {Object|null} data - Condiciones contrato data object or null
 * @returns {boolean} loading - Loading state
 * @returns {string|null} error - Error message or null
 *
 * @example
 * ```tsx
 * const { data, loading, error } = useCondicionesContrato();
 *
 * return (
 *   <CondicionesContratoForm
 *     condiciones={data?.condicionesContrato}
 *     conceptos={data?.conceptos}
 *   />
 * );
 * ```
 */
export function useCondicionesContrato() {
  const [data, setData] = useState<{
    condicionesContrato: GetCondicionesContrato[];
    conceptos: Conceptos[];
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

/**
 * Hook for loading cargo facturable (billable charges) data
 *
 * Provides complete data for managing billable charges including:
 * - Cargos list
 * - Available conceptos (concepts)
 * - Available tarifas (rates)
 * - Available tipos de medidor (meter types)
 *
 * @returns {Object} Hook state
 * @returns {Object|null} data - Cargo facturable data object or null
 * @returns {boolean} loading - Loading state
 * @returns {string|null} error - Error message or null
 *
 * @example
 * ```tsx
 * const { data, loading, error } = useCargoFacturable();
 *
 * return (
 *   <CargoFacturableForm
 *     cargos={data?.cargos}
 *     conceptos={data?.conceptos}
 *   />
 * );
 * ```
 */
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

/**
 * Loading state for user operations
 */
interface LoadingState {
  createUsuario: { isLoading: boolean };
  updateUsuario: { isLoading: boolean };
  deleteUsuario: { isLoading: boolean };
  fetchUsuarios: { isLoading: boolean };
}

/**
 * Hook for user CRUD operations
 *
 * Provides functions for creating, updating, deleting, and fetching users.
 * Each operation maintains its own loading state for granular UI control.
 *
 * @returns {Object} Hook state and operations
 * @returns {Function} createUsuario - Create new user
 * @returns {Function} updateUsuario - Update existing user
 * @returns {Function} deleteUsuario - Delete user by ID
 * @returns {Function} fetchUsuarios - Fetch all users
 * @returns {Function} getUsuarioById - Get user by ID
 * @returns {LoadingState} loadingState - Loading states for each operation
 *
 * @example
 * ```tsx
 * const { createUsuario, loadingState } = useAdministracion();
 *
 * const handleSubmit = async (data) => {
 *   try {
 *     const result = await createUsuario(data);
 *     console.log('User created:', result);
 *   } catch (error) {
 *     console.error('Error creating user:', error);
 *   }
 * };
 * ```
 */
export function useAdministracion() {
  const [loadingState, setLoadingState] = useState<LoadingState>({
    createUsuario: { isLoading: false },
    updateUsuario: { isLoading: false },
    deleteUsuario: { isLoading: false },
    fetchUsuarios: { isLoading: false }
  });

  /**
   * Creates a new user
   *
   * @param userData - User data to create
   * @returns Created user data
   * @throws Error if creation fails
   */
  const createUsuario = async (userData: Partial<Usuarios>): Promise<unknown> => {
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

  /**
   * Updates an existing user
   *
   * @param idUsuario - User ID to update
   * @param userData - Updated user data
   * @returns Updated user data
   * @throws Error if update fails
   */
  const updateUsuario = async (
    idUsuario: number,
    userData: Partial<Usuarios>
  ): Promise<unknown> => {
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

  /**
   * Deletes a user by ID
   *
   * @param idUsuario - User ID to delete
   * @returns Deletion result
   * @throws Error if deletion fails
   */
  const deleteUsuario = async (idUsuario: number): Promise<unknown> => {
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

  /**
   * Fetches all users
   *
   * @returns Array of users
   * @throws Error if fetch fails
   */
  const fetchUsuarios = async (): Promise<unknown> => {
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

  /**
   * Gets a user by ID
   *
   * @param idUsuario - User ID to fetch
   * @returns User data
   * @throws Error if fetch fails
   */
  const getUsuarioById = async (idUsuario: number): Promise<Usuarios> => {
    try {
      const response = await api.get(`/obtener/${idUsuario}`);
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

/**
 * Hook for client operations
 *
 * @returns {Object} Client operations
 * @returns {Function} getClienteByRut - Get client by RUT number
 *
 * @example
 * ```tsx
 * const { getClienteByRut } = useClientes();
 *
 * const cliente = await getClienteByRut('12345678-9');
 * ```
 */
export function useClientes() {
  /**
   * Gets a client by RUT number
   *
   * @param rut - Client RUT number
   * @returns Client data
   * @throws Error if fetch fails
   */
  const getClienteByRut = async (rut: string): Promise<GetClienteById> => {
    const response = await api.get(`/cliente/${rut}`);
    return response.data as GetClienteById;
  };

  return {
    getClienteByRut
  };
}
