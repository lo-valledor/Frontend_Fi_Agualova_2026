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

// Hook optimizado que solo provee funciones utilitarias para operaciones específicas
// La carga inicial de datos se hace via clientLoader siguiendo las mejores prácticas de React Router v7
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

// Funciones utilitarias para formateo de fechas (sin dependencias de estado)
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

// Función utilitaria para encontrar el período activo
export const findActivePeriod = (periodos: Periodo[]): Periodo | null => {
  if (!periodos || periodos.length === 0) return null;
  
  const activePeriodo = periodos.find(
    (periodo) => periodo.EstadoPeriodo === 2
  );
  
  return activePeriodo || periodos[0]; // Fallback al primero si no hay activo
};

// Función utilitaria para validar parámetros de búsqueda
export const validateSearchParams = (
  sector: Sector | null,
  periodo: Periodo | null
): { isValid: boolean; error?: string } => {
  if (!sector) {
    return { isValid: false, error: "Por favor, seleccione un sector." };
  }
  
  if (!periodo) {
    return { isValid: false, error: "Por favor, seleccione un periodo." };
  }
  
  return { isValid: true };
};

// Función utilitaria para obtener fechas por defecto basadas en el período
export const getDefaultDates = (periodo: Periodo | null): { 
  fechaInicio: string; 
  fechaFin: string; 
} => {
  const today = new Date().toISOString().split("T")[0];
  
  return {
    fechaInicio: periodo?.FechaInicio || "",
    fechaFin: today,
  };
};
