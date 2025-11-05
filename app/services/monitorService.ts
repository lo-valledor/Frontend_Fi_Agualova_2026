import api from '~/lib/api';
import type { Clave, Periodo, Sector } from '~/types/monitor';

export interface MonitorServiceResponse<T> {
  data: T | null;
  error: string | null;
}
export interface MonitorBasicData {
  periodos: Periodo[];
  sectores: Sector[];
  claves: Clave[];
  activePeriodoId: number | null;
}

class MonitorService {
  async getBasicData(): Promise<MonitorServiceResponse<MonitorBasicData>> {
    try {
      // Verificar si hay token antes de hacer peticiones
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      // Carga paralela de datos básicos
      const [periodosRes, sectoresRes, clavesRes] = await Promise.all([
        api.get<Periodo[]>('/Periodos'),
        api.get<Sector[]>('/Sectores'),
        api.get<Clave[]>('/Claves')
      ]);

      const periodosData = Array.isArray(periodosRes.data)
        ? periodosRes.data
        : [];
      const sectoresData = Array.isArray(sectoresRes.data)
        ? sectoresRes.data
        : [];
      const clavesData = Array.isArray(clavesRes.data) ? clavesRes.data : [];

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
        data: {
          periodos: periodosData,
          sectores: sectoresData,
          claves: clavesData,
          activePeriodoId
        },
        error: null
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  async getPeriodosAndSectores(): Promise<
    MonitorServiceResponse<{
      periodos: Periodo[];
      sectores: Sector[];
      activePeriodoId: number | null;
    }>
  > {
    try {
      // Verificar si hay token antes de hacer peticiones
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      // Carga paralela de datos necesarios
      const [periodosRes, sectoresRes] = await Promise.all([
        api.get<Periodo[]>('/Periodos'),
        api.get<Sector[]>('/Sectores')
      ]);

      const periodosData = Array.isArray(periodosRes.data)
        ? periodosRes.data
        : [];
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
        data: {
          periodos: periodosData,
          sectores: sectoresData,
          activePeriodoId
        },
        error: null
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  async getPeriodos(): Promise<MonitorServiceResponse<Periodo[]>> {
    try {
      const response = await api.get<Periodo[]>('/Periodos');
      const periodosData = Array.isArray(response.data) ? response.data : [];

      return {
        data: periodosData,
        error: null
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  async getSectores(): Promise<MonitorServiceResponse<Sector[]>> {
    try {
      const response = await api.get<Sector[]>('/Sectores');
      const sectoresData = Array.isArray(response.data) ? response.data : [];

      return {
        data: sectoresData,
        error: null
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  async getClaves(): Promise<MonitorServiceResponse<Clave[]>> {
    try {
      const response = await api.get<Clave[]>('/Claves');
      const clavesData = Array.isArray(response.data) ? response.data : [];

      return {
        data: clavesData,
        error: null
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  findActivePeriodo(periodos: Periodo[]): number | null {
    if (!periodos || periodos.length === 0) return null;

    const activePeriodo = periodos.find(
      (periodo: Periodo) => periodo.EstadoPeriodo === 2
    );

    return activePeriodo ? Number(activePeriodo.IdPeriodo) : null;
  }
}

export const monitorService = new MonitorService();
