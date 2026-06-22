import api from "~/lib/api";
import type {
  MonitorAceptarMasivoLecturas,
  MonitorClaves,
  MonitorGrillaProps,
  MonitorHabilitarEdicionProps,
  MonitorHistorialLectura,
  MonitorNichosGet,
  MonitorPeriodos,
  MonitorProps,
  MonitorReabrirPeriodoProps,
  MonitorSectores,
} from "~/types/monitor";

export interface MonitorServiceResponse<T> {
  data: T | null;
  error: string | null;
}

export interface MonitorBasicData {
  periodos: MonitorPeriodos[];
  claves: MonitorClaves[];
  activePeriodoId: string | null;
}
class MonitorService {
  private buildEndpointWithQuery(
    basePath: string,
    queryParams: Record<string, string | undefined>,
  ): string {
    const searchParams = new URLSearchParams();

    Object.entries(queryParams).forEach(([key, value]) => {
      if (value) {
        searchParams.append(key, value);
      }
    });

    const queryString = searchParams.toString();
    return queryString ? `${basePath}?${queryString}` : basePath;
  }

  async getBasicData(): Promise<
    MonitorServiceResponse<MonitorBasicData | null>
  > {
    try {
      // Verificar si hay token antes de hacer peticiones
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token found");
      }

      // Carga paralela de datos básicos
      const [periodosRes, clavesRes] = await Promise.all([
        api.get<MonitorPeriodos[]>("/monitor-lecturas/filtros/periodos"),
        api.get<MonitorClaves[]>("/monitor-lecturas/filtros/claves"),
      ]);

      const periodosData = Array.isArray(periodosRes.data)
        ? periodosRes.data
        : [];
      const clavesData = Array.isArray(clavesRes.data) ? clavesRes.data : [];

      // Encontrar el período activo
      let activePeriodoId: string | null = null;
      if (periodosData && periodosData.length > 0) {
        // Solo existe un periodo en el array, se asume que es el activo
        activePeriodoId = periodosData[0].value;
        return {
          data: {
            periodos: periodosData,
            claves: clavesData,
            activePeriodoId,
          },
          error: null,
        };
      }
      return {
        data: null,
        error: "No active period found",
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : "Error desconocido",
      };
    }
  }

  // Sectores se obtienen agregando el periodo a la url
  async getSectoresByPeriodo(
    periodo: string,
  ): Promise<MonitorServiceResponse<MonitorSectores[]>> {
    try {
      const params = new URLSearchParams({ periodo });
      const response = await api.get<MonitorSectores[]>(
        `/monitor-lecturas/sectores?${params}`,
      );
      const sectoresData = Array.isArray(response.data) ? response.data : [];
      return {
        data: sectoresData,
        error: null,
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : "Error desconocido",
      };
    }
  }

  async getPeriodos(): Promise<MonitorServiceResponse<MonitorPeriodos[]>> {
    try {
      const response = await api.get<MonitorPeriodos[]>(
        "/monitor-lecturas/filtros/periodos",
      );
      const periodosData = Array.isArray(response.data) ? response.data : [];

      return {
        data: periodosData,
        error: null,
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : "Error desconocido",
      };
    }
  }

  async getSectores(): Promise<MonitorServiceResponse<MonitorSectores[]>> {
    try {
      const response = await api.get<MonitorSectores[]>(
        "/monitor-lecturas/filtros/sectores",
      );
      const sectoresData = Array.isArray(response.data) ? response.data : [];

      return {
        data: sectoresData,
        error: null,
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : "Error desconocido",
      };
    }
  }

  async getClaves(): Promise<MonitorServiceResponse<MonitorClaves[]>> {
    try {
      const response = await api.get<MonitorClaves[]>(
        "/monitor-lecturas/filtros/claves",
      );
      const clavesData = Array.isArray(response.data) ? response.data : [];

      return {
        data: clavesData,
        error: null,
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : "Error desconocido",
      };
    }
  }

  // Muestra la grilla de lecturas según los filtros seleccionados
  async postBuscarLecturas(
    request: MonitorGrillaProps,
  ): Promise<MonitorServiceResponse<MonitorNichosGet[]>> {
    const params = new URLSearchParams({
      periodo: request.periodo,
      sector: request.sector,
      medidor: request.medidor,
      fechaIni: request.fechaIni,
      fechaFin: request.fechaFin,
      clave: request.clave,
      criterio: request.criterio,
    });
    if (request.periodo) {
      params.append("periodo", request.periodo);
    }
    if (request.sector) {
      params.append("sector", request.sector);
    }
    if (request.medidor) {
      params.append("medidor", request.medidor);
    }
    if (request.fechaIni) {
      params.append("fechaIni", request.fechaIni);
    }
    if (request.fechaFin) {
      params.append("fechaFin", request.fechaFin);
    }
    if (request.clave) {
      params.append("clave", request.clave);
    }
    if (request.criterio) {
      params.append("criterio", request.criterio);
    }
    try {
      const response = await api.post("/monitor-lecturas/grilla", request);
      return {
        data: response.data as MonitorNichosGet[],
        error: null,
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : "Error desconocido",
      };
    }
  }

  // Historial de lecturas para un medidor específico
  async getHistorialLectura(
    id: number,
  ): Promise<MonitorServiceResponse<MonitorHistorialLectura>> {
    try {
      const response = await api.get(
        `/monitor-lecturas/historial-lectura/${id}`,
      );
      return {
        data: response.data as MonitorHistorialLectura,
        error: null,
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : "Error desconocido",
      };
    }
  }

  async getDetalleRegistro(
    id: number,
  ): Promise<MonitorServiceResponse<unknown>> {
    try {
      const response = await api.get(
        `/monitor-lecturas/detalle-registro/${id}`,
      );
      return {
        data: response.data,
        error: null,
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : "Error desconocido",
      };
    }
  }

  // Registro de lectura manual
  async postRegistroLectura(
    request: MonitorProps,
  ): Promise<MonitorServiceResponse<unknown>> {
    try {
      const response = await api.post(
        "/monitor-lecturas/registro-lectura",
        request,
      );
      return {
        data: response.data,
        error: null,
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : "Error desconocido",
      };
    }
  }

  // Aceptar lectura para facturación
  async postAceptarLectura(
    id: number,
  ): Promise<MonitorServiceResponse<unknown>> {
    try {
      const response = await api.post(`/monitor-lecturas/aceptar/${id}`);
      return {
        data: response.data,
        error: null,
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : "Error desconocido",
      };
    }
  }

  async postCopiarUltimaLectura(
    id: number,
  ): Promise<MonitorServiceResponse<unknown>> {
    try {
      const response = await api.post(`/monitor-lecturas/copiar-ultima/${id}`);
      return {
        data: response.data,
        error: null,
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : "Error desconocido",
      };
    }
  }

  //Exportar a Excel
  async getExportarExcel(
    periodos: string,
    sectores?: string,
    nichos?: string,
    medidores?: string,
  ): Promise<MonitorServiceResponse<Blob>> {
    try {
      const endpoint = this.buildEndpointWithQuery(
        "/monitor-lecturas/exportar-excel",
        {
          periodos,
          sectores,
          nichos,
          medidores,
        },
      );

      const response = await api.get(endpoint, {
        responseType: "blob",
      });
      return {
        data: response.data as Blob,
        error: null,
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : "Error desconocido",
      };
    }
  }

  async getComparaConsumoAnual(
    numeroSerie: string,
    periodoactual: string,
  ): Promise<MonitorServiceResponse<unknown>> {
    try {
      const endpoint = this.buildEndpointWithQuery(
        "/monitor-lecturas/compara-consumo-anual",
        {
          numeroSerie,
          periodoactual,
        },
      );

      const response = await api.get(endpoint);
      return {
        data: response.data,
        error: null,
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : "Error desconocido",
      };
    }
  }

  async postReabrirPeriodo(
    request: MonitorReabrirPeriodoProps,
  ): Promise<MonitorServiceResponse<unknown>> {
    try {
      const response = await api.post(
        "/monitor-lecturas/reabrir-periodo",
        request,
      );
      return {
        data: response.data,
        error: null,
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : "Error desconocido",
      };
    }
  }

  async postHabilitarEdicionLectura(
    request: MonitorHabilitarEdicionProps,
  ): Promise<MonitorServiceResponse<unknown>> {
    try {
      const response = await api.post(
        "/monitor-lecturas/habilitar-edicion-lectura",
        request,
      );
      return {
        data: response.data,
        error: null,
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : "Error desconocido",
      };
    }
  }

  async postAceptarMasivoLecturas(
    request: MonitorAceptarMasivoLecturas,
  ): Promise<MonitorServiceResponse<unknown>> {
    try {
      const response = await api.post(
        "/monitor-lecturas/aceptar-masivo",
        request,
      );
      return {
        data: response.data,
        error: null,
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : "Error desconocido",
      };
    }
  }

  async getAlertasAnomalias(periodo: string, sector?: string) {
    try {
      const endpoint = this.buildEndpointWithQuery(
        "/monitor-lecturas/alertas-anomalias",
        {
          periodo,
          sector,
        },
      );

      const response = await api.get(endpoint);
      return {
        data: response.data,
        error: null,
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : "Error desconocido",
      };
    }
  }
}
export const monitorService = new MonitorService();
