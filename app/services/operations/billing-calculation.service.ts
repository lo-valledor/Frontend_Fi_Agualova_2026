import { BaseApiService } from '~/services/core/base-service';
import type { ServiceResponse } from '~/services/core/api-response';
import type {
  IdentificadorProceso,
  EstadoProceso,
  CalculoPrefacturaDetalle,
  CalculoPrefacturaCargoResponse
} from '~/types/operaciones';
import api from '~/lib/api';

/**
 * Interface para resultado de lanzar cálculo
 */
export interface BillingCalculationRequest {
  cicloFacturacion: number;
  periodoFacturable: string;
}

/**
 * Servicio especializado para cálculo y verificación de facturación
 * Aplica SOLID: Single Responsibility = solo cálculo de facturación
 */
export class BillingCalculationService extends BaseApiService {
  /**
   * Lanza el proceso de cálculo de facturación
   *
   * @param request - Datos del ciclo y período
   */
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

  /**
   * Obtiene el identificador del proceso de facturación
   *
   * @param cicloId - ID del ciclo
   * @param periodoId - ID del período
   * @param modo - Modo de búsqueda (default: 1)
   */
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

  /**
   * Obtiene el identificador actual del proceso
   *
   * @param cicloId - ID del ciclo
   * @param periodoId - ID del período
   * @param modo - Modo de búsqueda (default: 1)
   */
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

  /**
   * Verifica el estado de un proceso de facturación
   *
   * @param procesoId - ID del proceso a verificar
   */
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

  /**
   * Consulta el encabezado de la prefactura
   *
   * @param cicloId - ID del ciclo
   * @param periodo - Período
   */
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

  /**
   * Consulta los cargos de la prefactura
   *
   * @param cicloId - ID del ciclo
   * @param periodo - Período
   */
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

  /**
   * Genera el detalle de factura
   *
   * @param lecturaId - ID de la lectura
   * @param periodoId - ID del período
   */
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

  /**
   * Verifica el estado de cierre de lecturas
   *
   * @param cicloFacturable - Ciclo facturable
   * @param periodo - Período
   */
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
