import api from "~/lib/api";
import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router";
import type {
  Periodo,
  Sector,
  Clave,
  Lectura,
  MedidorNicho,
} from "../types/monitor";

export type { Periodo, Sector, Clave, Lectura, MedidorNicho };

export function useMonitor() {
  const [sectores, setSectores] = useState<Sector[]>([]);
  const [periodos, setPeriodos] = useState<Periodo[]>([]);
  const [claves, setClaves] = useState<Clave[]>([]);
  const [lecturas, setLecturas] = useState<Lectura[]>([]);
  const [medidores, setMedidores] = useState<MedidorNicho[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [activePeriodoId, setActivePeriodoId] = useState<number | null>(null);

  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

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

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);

        // Verificar si el usuario está autenticado antes de hacer las peticiones
        if (!isAuthenticated) {
          navigate("/auth/login", { replace: true });
          return;
        }

        // Usamos los endpoints genéricos de nuestro api.ts
        const [periodosRes, clavesRes, sectoresRes] = await Promise.all([
          api.get<Periodo[]>("/Periodos"),
          api.get<Clave[]>("/Claves"),
          api.get<Sector[]>("/Sectores"),
        ]);

        // Extraemos los datos directamente de data, añadiendo verificación de array
        const periodosData = Array.isArray(periodosRes.data)
          ? periodosRes.data
          : [];
        const clavesData = Array.isArray(clavesRes.data) ? clavesRes.data : [];
        const sectoresData = Array.isArray(sectoresRes.data)
          ? sectoresRes.data
          : [];

        if (periodosData && periodosData.length > 0) {
          const activePeriodo = periodosData.find(
            (periodo: Periodo) => periodo.EstadoPeriodo === 2
          );
          if (activePeriodo) {
            setActivePeriodoId(Number(activePeriodo.IdPeriodo));
          }
        }

        setPeriodos(periodosData);
        setClaves(clavesData);
        setSectores(sectoresData);
      } catch (error: any) {
        console.error("Error al cargar datos del monitor:", error);
        setError(error instanceof Error ? error : new Error(String(error)));

        // Si el error es de autenticación (401 o 403), redirigir a login
        if (
          error.response &&
          (error.response.status === 401 || error.response.status === 403)
        ) {
          logout(); // Usamos el método logout del AuthContext
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [isAuthenticated, logout, navigate]);

  return {
    periodos,
    sectores,
    claves,
    lecturas,
    medidores,
    isLoading,
    error,
    activePeriodoId,
    fetchLecturas,
    fetchMedidores,
  };
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
