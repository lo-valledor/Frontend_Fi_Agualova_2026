import api from '~/lib/api';
import type { ServiceResponse } from '~/services/core/api-response';
import { BaseApiService } from '~/services/core/base-service';
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

export class ContractDetailsReportService extends BaseApiService {
  constructor(httpClient: any = api) {
    super(httpClient);
  }

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

  private async safeApiCall<T>(endpoint: string): Promise<T[]> {
    try {
      const response = await this.httpClient.get(endpoint);
      return this.processResponseArray<T>(response);
    } catch (error) {
      console.error('Error calling API endpoint:', endpoint, error);
      return [];
    }
  }

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
