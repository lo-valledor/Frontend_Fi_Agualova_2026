import api from '~/lib/api';
import type {
  BuscarContrato,
  ConsolidadoConsultaContrato,
  EmpalmesDisponibles,
  ExportarExcelProps,
  PeriodosDisponibles,
  ResumenNotadeCobro,
  VerFacturasProps
} from '~/types/reportes';

export interface ReportesServiceResponse<T> {
  data: T | null;
  error: string | null;
}

export interface ReportesDownloadFile {
  blob: Blob;
  filename: string | null;
  contentType: string | null;
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

  private extractFilenameFromHeaders(headers: unknown): string | null {
    if (!headers || typeof headers !== 'object') {
      return null;
    }

    const contentDisposition =
      'content-disposition' in headers
        ? String(
            (headers as Record<string, unknown>)['content-disposition'] ?? ''
          )
        : '';

    if (!contentDisposition) {
      return null;
    }

    const utf8Match = contentDisposition.match(/filename\*=UTF-8''([^;]+)/i);
    if (utf8Match?.[1]) {
      return decodeURIComponent(utf8Match[1]);
    }

    const filenameMatch = contentDisposition.match(
      /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/
    );

    if (filenameMatch?.[1]) {
      return filenameMatch[1].replace(/['"]/g, '');
    }

    return null;
  }

  private async extractErrorMessageFromBlob(
    blob: Blob
  ): Promise<string | null> {
    try {
      const text = await blob.text();

      if (!text) {
        return null;
      }

      const parsed = JSON.parse(text) as { message?: unknown };

      if (typeof parsed.message === 'string' && parsed.message.trim()) {
        return parsed.message;
      }

      return null;
    } catch {
      return null;
    }
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

  /**
   * Nota de Cobro
   */
  async getListadoPeriodos(): Promise<
    ReportesServiceResponse<PeriodosDisponibles[]>
  > {
    try {
      const response = await api.get('resumen-nota-cobro/periodos');
      return {
        data: response.data as PeriodosDisponibles[],
        error: null
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  async getListadoEmpalmes(): Promise<
    ReportesServiceResponse<EmpalmesDisponibles[]>
  > {
    try {
      const response = await api.get('resumen-nota-cobro/empalmes');
      return {
        data: response.data as EmpalmesDisponibles[],
        error: null
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  async getGenerarNotaCobro(
    periodo: string,
    idEmpalme: number
  ): Promise<ReportesServiceResponse<ResumenNotadeCobro[]>> {
    try {
      const params = new URLSearchParams({
        periodo,
        idEmpalme: idEmpalme.toString()
      });
      const response = await api.get(
        `resumen-nota-cobro/generar?${params.toString()}`
      );
      return {
        data: response.data as ResumenNotadeCobro[],
        error: null
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  /**
   * Ver Facturas
   */
  // Descarga lote en PDF
  async getVerFacturas(
    request: VerFacturasProps
  ): Promise<ReportesServiceResponse<ReportesDownloadFile>> {
    try {
      const response = await api.post(
        'ver-facturas/descargar-lote-pdf',
        request,
        {
          responseType: 'blob'
        }
      );

      const contentType =
        typeof response.headers?.['content-type'] === 'string'
          ? response.headers['content-type']
          : null;

      const blob = response.data as Blob;
      const errorMessage =
        contentType?.includes('application/json') ||
        contentType?.includes('text/plain')
          ? await this.extractErrorMessageFromBlob(blob)
          : null;

      if (errorMessage) {
        return {
          data: null,
          error: errorMessage
        };
      }

      return {
        data: {
          blob,
          filename: this.extractFilenameFromHeaders(response.headers),
          contentType
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
}

export const reportesService = new ReportesService();
