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
  Zonas,
} from '~/types/mantencion';

export function useCiclosFacturacion() {
  const [data, setData] = useState<CiclosFacturacion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        const result = await mantencionService.getCiclosFacturacion();

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
    error,
  };
}

export function useClaves() {
  const [data, setData] = useState<Claves[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        const result = await mantencionService.getClaves();

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
    error,
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
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        const result = await mantencionService.getConceptosData();

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
    error,
  };
}

export function useEmpalmes() {
  const [data, setData] = useState<Empalme[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        const result = await mantencionService.getEmpalmes();

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
    error,
  };
}

export function useMarcas() {
  const [data, setData] = useState<Marca[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        const result = await mantencionService.getMarcas();

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
    error,
  };
}

export function useNichos() {
  const [data, setData] = useState<Nicho[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        const result = await mantencionService.getNichos();

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
    error,
  };
}

export function useParametros() {
  const [data, setData] = useState<Parametro[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        const result = await mantencionService.getParametros();

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
    error,
  };
}

export function useSectores() {
  const [data, setData] = useState<Sectores[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        const result = await mantencionService.getSectores();

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
    error,
  };
}

export function useTarifas() {
  const [data, setData] = useState<Tarifas[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        const result = await mantencionService.getTarifas();

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
    error,
  };
}

export function useTiposContratos() {
  const [data, setData] = useState<TiposContrato[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        const result = await mantencionService.getTiposContratos();

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
    error,
  };
}

export function useZonas() {
  const [data, setData] = useState<Zonas[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        const result = await mantencionService.getZonas();

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
    error,
  };
}
