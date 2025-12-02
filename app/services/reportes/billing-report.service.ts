import { BaseApiService } from '~/services/core/base-service';
import type { ServiceResponse } from '~/services/core/api-response';
import type { FacturacionPorCargo } from '~/types/reportes';
import api from '~/lib/api';

/**
 * BillingReportService
 * Manages billing-related reports
 * - Billing by charges
 * - Period-based billing queries
 */
export class BillingReportService extends BaseApiService {
  /**
   * Constructor
   * @param httpClient Axios HTTP client instance
   */
  constructor(httpClient: any = api) {
    super(httpClient);
  }

  /**
   * Get billing by charge for period and empalme
   * @param periodo Billing period
   * @param emId Empalme ID
   */
  async getFacturacionPorCargo(
    periodo: string,
    emId: number
  ): Promise<ServiceResponse<FacturacionPorCargo[]>> {
    if (!periodo || !emId) {
      return this.handleError(
        new Error('Missing required parameters'),
        'Period and empalme ID are required'
      );
    }

    return this.executeDataOperation(async () => {
      const response = await this.httpClient.get(
        `/facturacion-por-cargo?periodo=${periodo}&emId=${emId}`
      );
      return this.processResponseArray<FacturacionPorCargo>(response);
    }, 'Error getting billing by charges');
  }
}

export const billingReportService = new BillingReportService(api);
