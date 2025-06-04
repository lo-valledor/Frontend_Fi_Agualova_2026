import api from "~/lib/api";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import type {
  Periodo,
  Sector,
  Clave,
  Lectura,
  MedidorNicho,
} from "../types/monitor";

export type { Periodo, Sector, Clave, Lectura, MedidorNicho };

// Hook optimizado que solo provee funciones utilitarias
// La carga inicial de datos se debe hacer via clientLoader
export function useMonitor() {
  const [lecturas, setLecturas] = useState<Lectura[]>([]);
  const [medidores, setMedidores] = useState<MedidorNicho[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const { logout } = useAuth();

  const fetchLecturas = async (periodoId: string, sectorId: string) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await api.get<Lectura[]>(
        `/Lecturas?periodoId=${periodoId}&sectorId=${sectorId}`
      );
      const lecturasData = Array.isArray(response.data) ? response.data : [];
      setLecturas(lecturasData);

      return lecturasData;
    } catch (error: any) {
      console.error("Error al cargar lecturas:", error);
      setError(error instanceof Error ? error : new Error(String(error)));

      // Si el error es de autenticación, redirigir a login
      if (
        error.response &&
        (error.response.status === 401 || error.response.status === 403)
      ) {
        logout();
      }

      return [];
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMedidores = async (periodoId: string, sectorId: string) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await api.get<MedidorNicho[]>(
        `/Medidores?periodoId=${periodoId}&sectorId=${sectorId}`
      );
      const medidoresData = Array.isArray(response.data) ? response.data : [];
      setMedidores(medidoresData);

      return medidoresData;
    } catch (error: any) {
      console.error("Error al cargar medidores:", error);
      setError(error instanceof Error ? error : new Error(String(error)));

      if (
        error.response &&
        (error.response.status === 401 || error.response.status === 403)
      ) {
        logout();
      }

      return [];
    } finally {
      setIsLoading(false);
    }
  };

  return {
    lecturas,
    medidores,
    isLoading,
    error,
    fetchLecturas,
    fetchMedidores,
  };
}

// Función utilitaria para cargar datos básicos del monitor
// Úsala en clientLoaders cuando necesites los datos iniciales
export async function loadMonitorData() {
  try {
    const [periodosRes, clavesRes, sectoresRes] = await Promise.all([
      api.get<Periodo[]>("/Periodos"),
      api.get<Clave[]>("/Claves"),
      api.get<Sector[]>("/Sectores"),
    ]);

    const periodosData = Array.isArray(periodosRes.data)
      ? periodosRes.data
      : [];
    const clavesData = Array.isArray(clavesRes.data) ? clavesRes.data : [];
    const sectoresData = Array.isArray(sectoresRes.data)
      ? sectoresRes.data
      : [];

    // Encontrar el período activo
    let activePeriodoId: number | null = null;
    if (periodosData && periodosData.length > 0) {
      const activePeriodo = periodosData.find(
        (periodo: Periodo) => periodo.EstadoPeriodo === 2
      );
      if (activePeriodo) {
        activePeriodoId = Number(activePeriodo.IdPeriodo);
      }
    }

    return {
      periodos: periodosData,
      claves: clavesData,
      sectores: sectoresData,
      activePeriodoId,
    };
  } catch (error: any) {
    console.error("Error al cargar datos del monitor:", error);
    throw error instanceof Error ? error : new Error(String(error));
  }
}

export const formatDateToYYYYMMDD = (dateString: string): string => {
  if (!dateString) return "";

  // Dividir la fecha en partes
  const parts = dateString.split("-");
  if (parts.length !== 3) return "";

  let year, month, day;

  // Detectar el formato de la fecha
  if (parts[0].length === 4) {
    // Formato YYYY-MM-DD
    year = parts[0];
    month = parts[1];
    day = parts[2];
  } else {
    // Formato DD-MM-YYYY
    day = parts[0];
    month = parts[1];
    year = parts[2];
  }

  return `${year}${month}${day}`;
};
