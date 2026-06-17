import { BaseApiService } from '~/services/core/base-service';
import type { ServiceResponse } from '~/services/core/api-response';
import type {
  IdentificadorProceso,
  EstadoProceso,
  CalculoPrefacturaDetalle,
  CalculoPrefacturaCargoResponse
} from '~/types/operaciones';
import api from '~/lib/api';


export interface BillingCalculationRequest {
  cicloFacturacion: number;
  periodoFacturable: string;
}


export class BillingCalculationService extends BaseApiService {
  
  async launchBillingCalculation(
    request: BillingCalculationRequest
  ): Promise<ServiceResponse<any>> {
    if (!request.cicloFacturacion || !request.periodoFacturable) {
      return this.handleError(
        new Error('Parameters missing'),
        'Billing cycle and period are required'
      );
    }

    return this.executeDataOperation(async () => {
      const response = await this.httpClient.post(
        '/lanzar-calculo-facturacion',
        request
      );
      return this.processResponseSingle(response);
    }, 'Error al lanzar cálculo de facturación');
  }

  
  async getProcessIdentifier(
    cicloId: string,
    periodoId: string,
    modo: number = 1
  ): Promise<ServiceResponse<IdentificadorProceso[]>> {
    if (!cicloId || !periodoId) {
      return this.handleError(
        new Error('Parameters missing'),
        'Cycle and period IDs are required'
      );
    }

    return this.executeDataOperation(async () => {
      const response = await this.httpClient.get('/identificador-proceso', {
        params: { cicloId, periodoId, modo }
      });
      return this.processResponseArray<IdentificadorProceso>(response);
    }, 'Error al obtener identificador del proceso');
  }

  
  async getCurrentProcessIdentifier(
    cicloId: string,
    periodoId: string,
    modo: number = 1
  ): Promise<ServiceResponse<IdentificadorProceso | null>> {
    if (!cicloId || !periodoId) {
      return this.handleError(
        new Error('Parameters missing'),
        'Cycle and period IDs are required'
      );
    }

    return this.executeDataOperation(async () => {
      const response = await this.httpClient.get('/identificador-proceso', {
        params: { cicloId, periodoId, modo }
      });
      return this.processResponseSingle<IdentificadorProceso>(response);
    }, 'Error al obtener identificador actual del proceso');
  }

  
  async checkProcessStatus(
    procesoId: string
  ): Promise<ServiceResponse<EstadoProceso[]>> {
    if (!procesoId) {
      return this.handleError(
        new Error('Process ID missing'),
        'Process ID is required'
      );
    }

    return this.executeDataOperation(async () => {
      const response = await this.httpClient.get('/estado-proceso', {
        params: { procesoId }
      });
      return this.processResponseArray<EstadoProceso>(response);
    }, 'Error al verificar estado del proceso');
  }

  
  async getPrefacturaHeader(
    cicloId: string,
    periodo: string
  ): Promise<ServiceResponse<CalculoPrefacturaDetalle[]>> {
    if (!cicloId || !periodo) {
      return this.handleError(
        new Error('Parameters missing'),
        'Cycle and period are required'
      );
    }

    return this.executeDataOperation(async () => {
      const response = await this.httpClient.get(
        '/calculo-prefactura-encabezado',
        {
          params: { cicloId, periodo }
        }
      );
      return this.processResponseArray<CalculoPrefacturaDetalle>(response);
    }, 'Error al consultar encabezado de prefactura');
  }

  
  async getPrefacturaCharges(
    cicloId: string,
    periodo: string
  ): Promise<ServiceResponse<CalculoPrefacturaCargoResponse[]>> {
    if (!cicloId || !periodo) {
      return this.handleError(
        new Error('Parameters missing'),
        'Cycle and period are required'
      );
    }

    return this.executeDataOperation(async () => {
      const response = await this.httpClient.get('/calculo-prefactura-cargos', {
        params: { cicloId, periodo }
      });
      return this.processResponseArray<CalculoPrefacturaCargoResponse>(
        response
      );
    }, 'Error al consultar cargos de prefactura');
  }

  
  async generateBillingDetail(
    lecturaId: number,
    periodoId: string
  ): Promise<ServiceResponse<any>> {
    if (!lecturaId || !periodoId) {
      return this.handleError(
        new Error('Parameters missing'),
        'Reading and period IDs are required'
      );
    }

    return this.executeDataOperation(async () => {
      const response = await this.httpClient.post('/generar-detalle-factura', {
        lecturaId,
        periodoId
      });
      return this.processResponseSingle(response);
    }, 'Error al generar detalle de factura');
  }

  
  async checkReadingClosureStatus(
    cicloFacturable: string,
    periodo: string
  ): Promise<ServiceResponse<any[]>> {
    if (!cicloFacturable || !periodo) {
      return this.handleError(
        new Error('Parameters missing'),
        'Billing cycle and period are required'
      );
    }

    return this.executeDataOperation(async () => {
      const params = new URLSearchParams();
      params.append('cicloFacturable', cicloFacturable);
      params.append('periodo', periodo);

      const response = await this.httpClient.get('/estado-cierre-lecturas', {
        params
      });

      return this.processResponseArray(response);
    }, 'Error al verificar estado de cierre de lecturas');
  }
}

export const billingCalculationService = new BillingCalculationService(api);
