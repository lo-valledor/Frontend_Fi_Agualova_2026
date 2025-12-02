import { BaseApiService } from '~/services/core/base-service';
import type { ServiceResponse } from '~/services/core/api-response';
import type {
  DetalleCliente,
  DetalleContrato,
  DetalleFacturas,
  DetalleLecturas,
  DetalleLocal,
  DetalleMedidores,
  DetallePropietario,
  DetalleUbicacion
} from '~/types/reportes';
import api from '~/lib/api';

/**
 * Contract Details Response Interface
 */
export interface DetallesContrato {
  detallePropietario: DetallePropietario[];
  detalleCliente: DetalleCliente[];
  detalleLocal: DetalleLocal[];
  detalleContrato: DetalleContrato[];
  detalleMedidores: DetalleMedidores[];
  detalleUbicacion: DetalleUbicacion[];
  detalleLecturas: DetalleLecturas[];
  detalleFacturas: DetalleFacturas[];
}

/**
 * ContractDetailsReportService
 * Manages detailed contract information reports
 * - Owner details
 * - Client details
 * - Location details
 * - Meter details
 * - Reading details
 * - Invoice details
 * - Contract details
 * - Local details
 */
export class ContractDetailsReportService extends BaseApiService {
  /**
   * Constructor
   * @param httpClient Axios HTTP client instance
   */
  constructor(httpClient: any = api) {
    super(httpClient);
  }

  /**
   * Get all details for a contract
   * Executes 8 parallel requests for comprehensive contract information
   * @param contratoId Contract ID
   */
  async getDetallesPorContrato(
    contratoId: number
  ): Promise<ServiceResponse<DetallesContrato>> {
    if (!contratoId) {
      return this.handleError(
        new Error('Contract ID is required'),
        'Contract ID is required'
      );
    }

    return this.executeDataOperation(async () => {
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
          detalleMedidores.status === 'fulfilled' ? detalleMedidores.value : [],
        detalleUbicacion:
          detalleUbicacion.status === 'fulfilled' ? detalleUbicacion.value : [],
        detalleLecturas:
          detalleLecturas.status === 'fulfilled' ? detalleLecturas.value : [],
        detalleFacturas:
          detalleFacturas.status === 'fulfilled' ? detalleFacturas.value : []
      };
    }, 'Error getting contract details');
  }

  /**
   * Safe API call helper that returns empty array on error
   * @param endpoint API endpoint
   */
  private async safeApiCall<T>(endpoint: string): Promise<T[]> {
    try {
      const response = await this.httpClient.get(endpoint);
      return this.processResponseArray<T>(response);
    } catch (error) {
      console.error('Error calling API endpoint:', endpoint, error);
      return [];
    }
  }

  /**
   * Get owner details for a contract
   * @param contratoId Contract ID
   */
  async getDetallePropietario(
    contratoId: number
  ): Promise<ServiceResponse<DetallePropietario[]>> {
    if (!contratoId) {
      return this.handleError(
        new Error('Contract ID is required'),
        'Contract ID is required'
      );
    }

    return this.executeDataOperation(
      async () =>
        this.safeApiCall<DetallePropietario>(`${contratoId}/propietario`),
      'Error getting owner details'
    );
  }

  /**
   * Get client details for a contract
   * @param contratoId Contract ID
   */
  async getDetalleCliente(
    contratoId: number
  ): Promise<ServiceResponse<DetalleCliente[]>> {
    if (!contratoId) {
      return this.handleError(
        new Error('Contract ID is required'),
        'Contract ID is required'
      );
    }

    return this.executeDataOperation(
      async () => this.safeApiCall<DetalleCliente>(`${contratoId}/cliente`),
      'Error getting client details'
    );
  }

  /**
   * Get meter details for a contract
   * @param contratoId Contract ID
   */
  async getDetalleMedidores(
    contratoId: number
  ): Promise<ServiceResponse<DetalleMedidores[]>> {
    if (!contratoId) {
      return this.handleError(
        new Error('Contract ID is required'),
        'Contract ID is required'
      );
    }

    return this.executeDataOperation(
      async () => this.safeApiCall<DetalleMedidores>(`${contratoId}/medidores`),
      'Error getting meter details'
    );
  }

  /**
   * Get reading details for a contract
   * @param contratoId Contract ID
   */
  async getDetalleLecturas(
    contratoId: number
  ): Promise<ServiceResponse<DetalleLecturas[]>> {
    if (!contratoId) {
      return this.handleError(
        new Error('Contract ID is required'),
        'Contract ID is required'
      );
    }

    return this.executeDataOperation(
      async () => this.safeApiCall<DetalleLecturas>(`${contratoId}/lecturas`),
      'Error getting reading details'
    );
  }

  /**
   * Get invoice details for a contract
   * @param contratoId Contract ID
   */
  async getDetalleFacturas(
    contratoId: number
  ): Promise<ServiceResponse<DetalleFacturas[]>> {
    if (!contratoId) {
      return this.handleError(
        new Error('Contract ID is required'),
        'Contract ID is required'
      );
    }

    return this.executeDataOperation(
      async () => this.safeApiCall<DetalleFacturas>(`${contratoId}/facturas`),
      'Error getting invoice details'
    );
  }
}

export const contractDetailsReportService = new ContractDetailsReportService(
  api
);
