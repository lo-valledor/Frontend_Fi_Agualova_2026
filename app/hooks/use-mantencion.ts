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

export function useCiclosFacturacion() {
  const [data, setData] = useState<CiclosFacturacion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    handleDataLoad(
      () => mantencionService.getCiclosFacturacion(),
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

export function useClaves() {
  const [data, setData] = useState<Claves[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    handleDataLoad(
      () => mantencionService.getClaves(),
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

export function useEmpalmes() {
  const [data, setData] = useState<Empalme[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    handleDataLoad(
      () => mantencionService.getEmpalmes(),
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

export function useMarcas() {
  const [data, setData] = useState<Marca[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    handleDataLoad(
      () => mantencionService.getMarcas(),
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

export function useNichos() {
  const [data, setData] = useState<Nicho[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    handleDataLoad(
      () => mantencionService.getNichos(),
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

export function useParametros() {
  const [data, setData] = useState<Parametro[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    handleDataLoad(
      () => mantencionService.getParametros(),
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

export function useSectores() {
  const [data, setData] = useState<Sectores[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    handleDataLoad(
      () => mantencionService.getSectores(),
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

export function useTarifas() {
  const [data, setData] = useState<Tarifas[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    handleDataLoad(
      () => mantencionService.getTarifas(),
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

export function useTiposContratos() {
  const [data, setData] = useState<TiposContrato[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    handleDataLoad(
      () => mantencionService.getTiposContratos(),
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

export function useZonas() {
  const [data, setData] = useState<Zonas[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    handleDataLoad(
      () => mantencionService.getZonas(),
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
