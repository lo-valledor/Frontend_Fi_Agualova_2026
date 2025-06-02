import api from "~/lib/api";
import { useAuth } from "~/context/AuthContext";
import { useNavigate } from "react-router";
import { useEffect, useState, useCallback } from "react";
import type {
  Anio,
  Ciclo,
  PeriodoAbierto,
  PreciosCargoEnerlova,
  Periodos,
  ConsultarSectores,
  ValidarSectoresPendientes,
  ConsultaPeriodosFacturacion,
} from "~/types/operaciones";

// Interfaz para agrupar los estados relacionados con la carga de datos
interface LoadingState {
  isLoading: boolean;
  error: Error | null;
}

/**
 * Hook para gestionar datos y operaciones relacionadas con el módulo de operaciones
 * Permite cargar datos de forma individual o en conjunto según las necesidades
 */
export function useOperaciones() {
  // Estados para los diferentes datos
  const [consultaAnio, setConsultaAnio] = useState<Anio[]>([]);
  const [consultaPrecioPagoTabla, setConsultaPrecioPagoTabla] = useState<
    PreciosCargoEnerlova[]
  >([]);
  const [consultarPeriodoAbierto, setConsultarPeriodoAbierto] = useState<
    PeriodoAbierto[]
  >([]);
  const [ciclosFacturacionActivos, setCiclosFacturacionActivos] = useState<
    Ciclo[]
  >([]);
  const [periodosFacturacion, setPeriodosFacturacion] = useState<Periodos[]>(
    []
  );
  const [consultarSectores, setConsultarSectores] = useState<
    ConsultarSectores[]
  >([]);
  const [lecturasPendientes, setLecturasPendientes] =
    useState<ValidarSectoresPendientes | null>(null);
  const [consultaPeriodosFacturacion, setConsultaPeriodosFacturacion] =
    useState<ConsultaPeriodosFacturacion[]>([]);

  // Estado unificado para manejo de carga y errores
  const [loadingState, setLoadingState] = useState<
    Record<string, LoadingState>
  >({
    anio: { isLoading: false, error: null },
    preciosPago: { isLoading: false, error: null },
    periodoAbierto: { isLoading: false, error: null },
    ciclos: { isLoading: false, error: null },
    periodos: { isLoading: false, error: null },
    consultarSectores: { isLoading: false, error: null },
    global: { isLoading: false, error: null },
    lecturasPendientes: { isLoading: false, error: null },
    consultaPeriodosFacturacion: { isLoading: false, error: null },
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

  // Función para cargar los años disponibles
  const fetchAnios = useCallback(async () => {
    if (!checkAuth()) return;

    try {
      setLoading("anio", true);
      const response = await api.get("/consulta-año");
      setConsultaAnio(response.data as Anio[]);
      return response.data;
    } catch (error: any) {
      setError("anio", error);
      throw error;
    } finally {
      setLoading("anio", false);
    }
  }, [checkAuth, setLoading, setError]);

  // Función para cargar precios de pago
  const fetchPreciosPago = useCallback(async () => {
    if (!checkAuth()) return;

    try {
      setLoading("preciosPago", true);
      const response = await api.get("/consulta-precio-pago-tabla");
      setConsultaPrecioPagoTabla(response.data as PreciosCargoEnerlova[]);
      return response.data;
    } catch (error: any) {
      setError("preciosPago", error);
      throw error;
    } finally {
      setLoading("preciosPago", false);
    }
  }, [checkAuth, setLoading, setError]);

  // Función para cargar periodo abierto
  const fetchPeriodoAbierto = useCallback(async () => {
    if (!checkAuth()) return;

    try {
      setLoading("periodoAbierto", true);
      const response = await api.get("/ConsultarPeriodoAbierto");
      setConsultarPeriodoAbierto(response.data as PeriodoAbierto[]);
      return response.data;
    } catch (error: any) {
      setError("periodoAbierto", error);
      throw error;
    } finally {
      setLoading("periodoAbierto", false);
    }
  }, [checkAuth, setLoading, setError]);

  // Función para cargar ciclos de facturación
  const fetchCiclosFacturacion = useCallback(async () => {
    if (!checkAuth()) return;

    try {
      setLoading("ciclos", true);
      const response = await api.get("/ciclos-facturacion-activos");
      setCiclosFacturacionActivos(response.data as Ciclo[]);
      return response.data;
    } catch (error: any) {
      setError("ciclos", error);
      throw error;
    } finally {
      setLoading("ciclos", false);
    }
  }, [checkAuth, setLoading, setError]);

  // Función para cargar los periodos de facturación
  const fetchPeriodosFacturacion = useCallback(async () => {
    if (!checkAuth()) return;

    try {
      setLoading("periodos", true);
      const response = await api.get("/consulta-periodo");
      setPeriodosFacturacion(response.data as Periodos[]);
      return response.data;
    } catch (error: any) {
      setError("periodos", error);
      throw error;
    } finally {
      setLoading("periodos", false);
    }
  }, [checkAuth, setLoading, setError]);

  // Buscar precios de cargos por mes y año
  const fetchPreciosCargoPorFecha = useCallback(
    async (mes: string, anio: string) => {
      if (!checkAuth()) return;

      try {
        setLoading("preciosPago", true);
        const params = new URLSearchParams({
          mes,
          año: anio,
        });
        const response = await api.get("/consulta-precio-pago", {
          params,
        });
        return response.data;
      } catch (error: any) {
        setError("preciosPago", error);
        throw error;
      } finally {
        setLoading("preciosPago", false);
      }
    },
    [checkAuth, setLoading, setError]
  );

  const fetchConsultarSectores = useCallback(async () => {
    if (!checkAuth()) return;

    try {
      setLoading("consultarSectores", true);
      const response = await api.get("/consultar-sectores");
      setConsultarSectores(response.data as ConsultarSectores[]);
      return response.data;
    } catch (error: any) {
      setError("consultarSectores", error);
      throw error;
    } finally {
      setLoading("consultarSectores", false);
    }
  }, [checkAuth, setLoading, setError]);

  const fetchLecturasPendientes = useCallback(async () => {
    if (!checkAuth()) return;

    try {
      setLoading("lecturasPendientes", true);
      const response = await api.get("/validar-lecturas-pendientes");
      setLecturasPendientes(response.data as ValidarSectoresPendientes);
      return response.data;
    } catch (error: any) {
      console.error("Error en fetchLecturasPendientes:", error);
      setError("lecturasPendientes", error);
      throw error;
    } finally {
      setLoading("lecturasPendientes", false);
    }
  }, [checkAuth, setLoading, setError]);

  const fetchConsultaPeriodosFacturacion = useCallback(async () => {
    if (!checkAuth()) return;

    try {
      setLoading("consultaPeriodosFacturacion", true);
      const response = await api.get("/consulta-periodos-facturacion");
      setConsultaPeriodosFacturacion(
        response.data as ConsultaPeriodosFacturacion[]
      );
      return response.data;
    } catch (error: any) {
      setError("periodos", error);
      throw error;
    } finally {
      setLoading("periodos", false);
    }
  }, [checkAuth, setLoading, setError]);

  // Cargar todos los datos iniciales
  const fetchAllData = useCallback(async () => {
    if (!checkAuth()) return;

    try {
      setLoading("global", true);
      await Promise.all([
        fetchAnios(),
        fetchPreciosPago(),
        fetchPeriodoAbierto(),
        fetchCiclosFacturacion(),
        fetchPeriodosFacturacion(),
        fetchConsultarSectores(),
        fetchLecturasPendientes(),
        fetchConsultaPeriodosFacturacion(),
      ]);
    } catch (error: any) {
      setError("global", error);
    } finally {
      setLoading("global", false);
    }
  }, [
    checkAuth,
    fetchAnios,
    fetchPreciosPago,
    fetchPeriodoAbierto,
    fetchCiclosFacturacion,
    fetchPeriodosFacturacion,
    fetchConsultarSectores,
    fetchLecturasPendientes,
    fetchConsultaPeriodosFacturacion,
    setLoading,
    setError,
  ]);

  // Cargar datos al iniciar el hook
  useEffect(() => {
    // No cargamos todos los datos automáticamente para mejorar el rendimiento
    // Los componentes pueden llamar a fetchAllData() o a funciones específicas
  }, []);

  // Estado global de carga
  const isLoading =
    loadingState.anio.isLoading ||
    loadingState.preciosPago.isLoading ||
    loadingState.periodoAbierto.isLoading ||
    loadingState.ciclos.isLoading ||
    loadingState.periodos.isLoading ||
    loadingState.consultarSectores.isLoading ||
    loadingState.global.isLoading ||
    loadingState.lecturasPendientes.isLoading ||
    loadingState.consultaPeriodosFacturacion.isLoading;

  // Estado global de error
  const error =
    loadingState.global.error ||
    loadingState.anio.error ||
    loadingState.preciosPago.error ||
    loadingState.periodoAbierto.error ||
    loadingState.ciclos.error ||
    loadingState.periodos.error ||
    loadingState.consultarSectores.error ||
    loadingState.lecturasPendientes.error ||
    loadingState.consultaPeriodosFacturacion.error;

  return {
    // Datos
    consultaAnio,
    consultaPrecioPagoTabla,
    consultarPeriodoAbierto,
    ciclosFacturacionActivos,
    periodosFacturacion,
    consultarSectores,
    lecturasPendientes,
    consultaPeriodosFacturacion,
    // Estado de carga
    isLoading,
    error,
    loadingState,

    // Funciones para cargar datos individuales
    fetchAnios,
    fetchPreciosPago,
    fetchPeriodoAbierto,
    fetchCiclosFacturacion,
    fetchPeriodosFacturacion,
    fetchPreciosCargoPorFecha,
    fetchConsultarSectores,
    fetchLecturasPendientes,
    // Función para cargar todos los datos
    fetchAllData,
  };
}
