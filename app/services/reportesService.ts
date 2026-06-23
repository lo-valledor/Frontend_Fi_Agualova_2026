import api from '~/lib/api';
import type {
  BuscarContrato,
  ConsolidadoConsultaContrato,
  ExportarExcelProps
} from '~/types/reportes';

export interface ReportesServiceResponse<T> {
  data: T | null;
  error: string | null;
}
class ReportesService {
  private processApiResponse<T>(response: any): T[] {
    // Si ya es un array, devolverlo directamente
    if (Array.isArray(response.data)) {
      return response.data;
    }

    // Si la respuesta tiene una propiedad 'data' que es array
    if (
      response.data &&
      typeof response.data === 'object' &&
      'data' in response.data &&
      Array.isArray((response.data as { data: T[] }).data)
    ) {
      return (response.data as { data: T[] }).data;
    }

    // Si la respuesta es un objeto único, convertirlo a array
    if (
      response.data &&
      typeof response.data === 'object' &&
      !Array.isArray(response.data)
    ) {
      return [response.data as T];
    }

    return [];
  }

  async getBuscarContrato(
    nroLocal?: string,
    rutCliente?: string,
    nombreCliente?: string,
    rutPropietario?: string,
    nombrePropietario?: string,
    nroMedidor?: string,
    codigoContrato?: string,
    acometida?: string
  ): Promise<
    ReportesServiceResponse<{
      buscarContratos: BuscarContrato[];
    }>
  > {
    try {
      const params = new URLSearchParams();
      if (nroLocal) params.append('nroLocal', nroLocal);
      if (rutCliente) params.append('rutCliente', rutCliente);
      if (nombreCliente) params.append('nombreCliente', nombreCliente);
      if (rutPropietario) params.append('rutPropietario', rutPropietario);
      if (nombrePropietario)
        params.append('nombrePropietario', nombrePropietario);
      if (nroMedidor) params.append('nroMedidor', nroMedidor);
      if (codigoContrato) params.append('codigoContrato', codigoContrato);
      if (acometida) params.append('acometida', acometida);
      const resBuscarContrato = await api.get(
        `consultar-contrato/buscar?${params}`
      );
      return {
        data: {
          buscarContratos:
            this.processApiResponse<BuscarContrato>(resBuscarContrato)
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

  // Exportar a Excel, se envía un JSON
  async exportaExcel(
    request: ExportarExcelProps
  ): Promise<ReportesServiceResponse<void>> {
    try {
      await api.post('consultar-contrato/exportar-excel', request, {
        responseType: 'blob'
      });
      return {
        data: undefined,
        error: null
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  async getConsultaContratoById(
    id: number
  ): Promise<ReportesServiceResponse<ConsolidadoConsultaContrato>> {
    try {
      const res = await api.get(`consultar-contrato/${id}`);
      return {
        data: res.data as ConsolidadoConsultaContrato,
        error: null
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  //Generar PDF de factura
  async GeneraPDF(
    numeroFactura: string,
    periodo: string
  ): Promise<ReportesServiceResponse<void>> {
    try {
      const params = new URLSearchParams();
      params.append('numeroFactura', numeroFactura);
      params.append('periodo', periodo);
      await api.get(
        `consultar-contrato/factura/${numeroFactura}/${periodo}/pdf`,
        {
          responseType: 'blob'
        }
      );
      return {
        data: undefined,
        error: null
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  async generaPDFHistorico(id: number): Promise<ReportesServiceResponse<void>> {
    try {
      await api.get(`consultar-contrato/${id}/historico-lecturas/pdf`, {
        responseType: 'blob'
      });
      return {
        data: undefined,
        error: null
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }
}

export const reportesService = new ReportesService();
