import api from '~/lib/api';
import type {
  BuscarContratos,
  ComboEmpalmes,
  DetalleCliente,
  DetalleContrato,
  DetalleFacturas,
  DetalleLecturas,
  DetalleLocal,
  DetalleMedidores,
  DetallePropietario,
  DetalleUbicacion,
  FacturacionPorCargo,
  PeriodosFacturacion
} from '~/types/reportes';

export interface ReportesServiceResponse<T> {
  data: T | null;
  error: string | null;
}

class ReportesService {
  /**
   * Función helper para procesar respuestas de API
   */

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

  /**
   * Obtiene datos del combo empalmes y periodos facturables
   */
  async getResumenFacturacion(): Promise<
    ReportesServiceResponse<{
      comboEmpalmes: ComboEmpalmes[];
      periodosFacturacion: PeriodosFacturacion[];
    }>
  > {
    try {
      const resComboEmpalmes = await api.get('/combo-empalmes');
      const resPeriodosFacturacion = await api.get('/periodos-facturables');

      return {
        data: {
          comboEmpalmes:
            this.processApiResponse<ComboEmpalmes>(resComboEmpalmes),
          periodosFacturacion: this.processApiResponse<PeriodosFacturacion>(
            resPeriodosFacturacion
          )
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

  /**
   * Obtiene la facturación por cargo para un período y empalme específicos
   * @param periodo
   * @param emId
   */
  async getFacturacionPorCargo(
    periodo: string,
    emId: number
  ): Promise<ReportesServiceResponse<FacturacionPorCargo[]>> {
    try {
      const response = await api.get(
        `/facturacion-por-cargo?periodo=${periodo}&emId=${emId}`
      );

      return {
        data: this.processApiResponse<FacturacionPorCargo>(response),
        error: null
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  async getBuscarContrato(): Promise<
    ReportesServiceResponse<{
      buscarContratos: BuscarContratos[];
    }>
  > {
    try {
      const resBuscarContrato = await api.get('buscarContrato');
      return {
        data: {
          buscarContratos:
            this.processApiResponse<BuscarContratos>(resBuscarContrato)
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

  /**
   * Helper para hacer llamadas API individuales con manejo de errores
   * @param endpoint
   */
  private async safeApiCall<T>(endpoint: string): Promise<T[]> {
    try {
      const response = await api.get(endpoint);
      return this.processApiResponse<T>(response);
    } catch (error) {
      console.warn(`Error en endpoint ${endpoint}:`, error);
      return [];
    }
  }

  /**
   * Obtiene todos los detalles de un contrato específico
   * @param contratoId
   */
  async getDetallesPorContrato(contratoId: number): Promise<
    ReportesServiceResponse<{
      detallePropietario: DetallePropietario[];
      detalleCliente: DetalleCliente[];
      detalleLocal: DetalleLocal[];
      detalleContrato: DetalleContrato[];
      detalleMedidores: DetalleMedidores[];
      detalleUbicacion: DetalleUbicacion[];
      detalleLecturas: DetalleLecturas[];
      detalleFacturas: DetalleFacturas[];
    }>
  > {
    try {
      const [
        detallePropietario,
        detalleCliente,
        detalleLocal,
        detalleContrato,
        detalleMedidores,
        detalleUbicacion,
        detalleLecturas,
        detalleFacturas
      ] = await Promise.allSettled([
        this.safeApiCall<DetallePropietario>(`${contratoId}/propietario`),
        this.safeApiCall<DetalleCliente>(`${contratoId}/cliente`),
        this.safeApiCall<DetalleLocal>(`${contratoId}/local`),
        this.safeApiCall<DetalleContrato>(`${contratoId}/contrato`),
        this.safeApiCall<DetalleMedidores>(`${contratoId}/medidores`),
        this.safeApiCall<DetalleUbicacion>(`${contratoId}/ubicacion`),
        this.safeApiCall<DetalleLecturas>(`${contratoId}/lecturas`),
        this.safeApiCall<DetalleFacturas>(`${contratoId}/facturas`)
      ]);

      return {
        data: {
          detallePropietario:
            detallePropietario.status === 'fulfilled'
              ? detallePropietario.value
              : [],
          detalleCliente:
            detalleCliente.status === 'fulfilled' ? detalleCliente.value : [],
          detalleLocal:
            detalleLocal.status === 'fulfilled' ? detalleLocal.value : [],
          detalleContrato:
            detalleContrato.status === 'fulfilled' ? detalleContrato.value : [],
          detalleMedidores:
            detalleMedidores.status === 'fulfilled'
              ? detalleMedidores.value
              : [],
          detalleUbicacion:
            detalleUbicacion.status === 'fulfilled'
              ? detalleUbicacion.value
              : [],
          detalleLecturas:
            detalleLecturas.status === 'fulfilled' ? detalleLecturas.value : [],
          detalleFacturas:
            detalleFacturas.status === 'fulfilled' ? detalleFacturas.value : []
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
