/**
 * Mantencion (Maintenance) Module Hooks
 *
 * Provides hooks for managing maintenance data including:
 * - Ciclos de facturacion (billing cycles)
 * - Claves (keys/codes)
 * - Conceptos (concepts)
 * - Empalmes (connections)
 * - Marcas (brands)
 * - Nichos (niches)
 * - Parametros (parameters)
 * - Sectores (sectors)
 * - Tarifas (rates)
 * - Tipos de contratos (contract types)
 * - Zonas (zones)
 *
 * All hooks use the generic handleDataLoad utility to avoid code duplication
 * and ensure consistent error handling across the module.
 */

import { useEffect, useState } from 'react';

import { mantencionService } from '~/services/mantencionService';
import type {
  CiclosFacturacion,
  Claves,
  ComboAsociadoConceptos,
  Conceptos,
  Empalme,
  Marca,
  Nicho,
  Parametro,
  Sectores,
  Tarifas,
  TiposContrato,
  Zonas
} from '~/types/mantencion';
import { handleDataLoad } from './utils/data-loader';

/**
 * Hook for loading ciclos de facturacion (billing cycles)
 *
 * @returns {Object} Hook state
 * @returns {CiclosFacturacion[]} data - Array of billing cycles
 * @returns {boolean} loading - Loading state
 * @returns {string|null} error - Error message or null
 *
 * @example
 * ```tsx
 * const { data, loading, error } = useCiclosFacturacion();
 *
 * if (loading) return <Loading />;
 * if (error) return <Error message={error} />;
 *
 * return <CiclosTable ciclos={data} />;
 * ```
 */
export function useCiclosFacturacion() {
  const [data, setData] = useState<CiclosFacturacion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    handleDataLoad(
      () => mantencionService.getCiclosFacturacion(),
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
 * Hook for loading claves (keys/codes)
 *
 * @returns {Object} Hook state
 * @returns {Claves[]} data - Array of claves
 * @returns {boolean} loading - Loading state
 * @returns {string|null} error - Error message or null
 *
 * @example
 * ```tsx
 * const { data, loading, error } = useClaves();
 *
 * return <ClavesSelect claves={data} />;
 * ```
 */
export function useClaves() {
  const [data, setData] = useState<Claves[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    handleDataLoad(
      () => mantencionService.getClaves(),
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
 * Hook for loading conceptos (concepts) data
 *
 * Provides complete data for managing conceptos including:
 * - Conceptos list
 * - Associated concepts combos
 *
 * @returns {Object} Hook state
 * @returns {Object|null} data - Conceptos data object or null
 * @returns {boolean} loading - Loading state
 * @returns {string|null} error - Error message or null
 *
 * @example
 * ```tsx
 * const { data, loading, error } = useConceptos();
 *
 * return (
 *   <ConceptosForm
 *     conceptos={data?.conceptos}
 *     comboAsociado={data?.comboAsociadoConceptos}
 *   />
 * );
 * ```
 */
export function useConceptos() {
  const [data, setData] = useState<{
    conceptos: Conceptos[];
    comboAsociadoConceptos: ComboAsociadoConceptos[];
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    handleDataLoad(
      () => mantencionService.getConceptosData(),
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
 * Hook for loading empalmes (connections)
 *
 * @returns {Object} Hook state
 * @returns {Empalme[]} data - Array of empalmes
 * @returns {boolean} loading - Loading state
 * @returns {string|null} error - Error message or null
 *
 * @example
 * ```tsx
 * const { data, loading, error } = useEmpalmes();
 *
 * return <EmpalmesSelect empalmes={data} />;
 * ```
 */
export function useEmpalmes() {
  const [data, setData] = useState<Empalme[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    handleDataLoad(
      () => mantencionService.getEmpalmes(),
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
 * Hook for loading marcas (brands)
 *
 * @returns {Object} Hook state
 * @returns {Marca[]} data - Array of marcas
 * @returns {boolean} loading - Loading state
 * @returns {string|null} error - Error message or null
 *
 * @example
 * ```tsx
 * const { data, loading, error } = useMarcas();
 *
 * return <MarcasSelect marcas={data} />;
 * ```
 */
export function useMarcas() {
  const [data, setData] = useState<Marca[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    handleDataLoad(
      () => mantencionService.getMarcas(),
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
 * Hook for loading nichos (niches)
 *
 * @returns {Object} Hook state
 * @returns {Nicho[]} data - Array of nichos
 * @returns {boolean} loading - Loading state
 * @returns {string|null} error - Error message or null
 *
 * @example
 * ```tsx
 * const { data, loading, error } = useNichos();
 *
 * return <NichosTable nichos={data} />;
 * ```
 */
export function useNichos() {
  const [data, setData] = useState<Nicho[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    handleDataLoad(
      () => mantencionService.getNichos(),
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
 * Hook for loading parametros (parameters)
 *
 * @returns {Object} Hook state
 * @returns {Parametro[]} data - Array of parametros
 * @returns {boolean} loading - Loading state
 * @returns {string|null} error - Error message or null
 *
 * @example
 * ```tsx
 * const { data, loading, error } = useParametros();
 *
 * return <ParametrosTable parametros={data} />;
 * ```
 */
export function useParametros() {
  const [data, setData] = useState<Parametro[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    handleDataLoad(
      () => mantencionService.getParametros(),
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
 * Hook for loading sectores (sectors)
 *
 * @returns {Object} Hook state
 * @returns {Sectores[]} data - Array of sectores
 * @returns {boolean} loading - Loading state
 * @returns {string|null} error - Error message or null
 *
 * @example
 * ```tsx
 * const { data, loading, error } = useSectores();
 *
 * return <SectoresSelect sectores={data} />;
 * ```
 */
export function useSectores() {
  const [data, setData] = useState<Sectores[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    handleDataLoad(
      () => mantencionService.getSectores(),
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
 * Hook for loading tarifas (rates)
 *
 * @returns {Object} Hook state
 * @returns {Tarifas[]} data - Array of tarifas
 * @returns {boolean} loading - Loading state
 * @returns {string|null} error - Error message or null
 *
 * @example
 * ```tsx
 * const { data, loading, error } = useTarifas();
 *
 * return <TarifasTable tarifas={data} />;
 * ```
 */
export function useTarifas() {
  const [data, setData] = useState<Tarifas[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    handleDataLoad(
      () => mantencionService.getTarifas(),
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
 * Hook for loading tipos de contratos (contract types)
 *
 * @returns {Object} Hook state
 * @returns {TiposContrato[]} data - Array of contract types
 * @returns {boolean} loading - Loading state
 * @returns {string|null} error - Error message or null
 *
 * @example
 * ```tsx
 * const { data, loading, error } = useTiposContratos();
 *
 * return <TiposContratoSelect tipos={data} />;
 * ```
 */
export function useTiposContratos() {
  const [data, setData] = useState<TiposContrato[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    handleDataLoad(
      () => mantencionService.getTiposContratos(),
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
 * Hook for loading zonas (zones)
 *
 * @returns {Object} Hook state
 * @returns {Zonas[]} data - Array of zonas
 * @returns {boolean} loading - Loading state
 * @returns {string|null} error - Error message or null
 *
 * @example
 * ```tsx
 * const { data, loading, error } = useZonas();
 *
 * return <ZonasSelect zonas={data} />;
 * ```
 */
export function useZonas() {
  const [data, setData] = useState<Zonas[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    handleDataLoad(
      () => mantencionService.getZonas(),
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
