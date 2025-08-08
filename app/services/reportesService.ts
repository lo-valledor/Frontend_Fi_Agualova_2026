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
  PeriodosFacturacion,
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
    if (response.data && typeof response.data === 'object' && !Array.isArray(response.data)) {
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
          ),
        },
        error: null,
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Error desconocido',
      };
    }
  }

  /**
   * Obtiene la facturación por cargo para un período y empalme específicos
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
        error: null,
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Error desconocido',
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
            this.processApiResponse<BuscarContratos>(resBuscarContrato),
        },
        error: null,
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Error desconocido',
      };
    }
  }

  /**
   * Obtiene todos los detalles de un contrato específico
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
        resPropietario,
        resCliente,
        resLocal,
        resContrato,
        resMedidores,
        resUbicacion,
        resLecturas,
        resFacturas,
      ] = await Promise.all([
        api.get(`${contratoId}/propietario`), // Este endpoint puede no existir según tu lista
        api.get(`${contratoId}/cliente`),
        api.get(`${contratoId}/local`),
        api.get(`${contratoId}/contrato`),
        api.get(`${contratoId}/medidores`),
        api.get(`${contratoId}/ubicacion`),
        api.get(`${contratoId}/lecturas`),
        api.get(`${contratoId}/facturas`),
      ]);


      return {
        data: {
          detallePropietario:
            this.processApiResponse<DetallePropietario>(resPropietario),
          detalleCliente: this.processApiResponse<DetalleCliente>(resCliente),
          detalleLocal: this.processApiResponse<DetalleLocal>(resLocal),
          detalleContrato:
            this.processApiResponse<DetalleContrato>(resContrato),
          detalleMedidores:
            this.processApiResponse<DetalleMedidores>(resMedidores),
          detalleUbicacion:
            this.processApiResponse<DetalleUbicacion>(resUbicacion),
          detalleLecturas:
            this.processApiResponse<DetalleLecturas>(resLecturas),
          detalleFacturas:
            this.processApiResponse<DetalleFacturas>(resFacturas),
        },
        error: null,
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Error desconocido',
      };
    }
  }
}

export const reportesService = new ReportesService();
