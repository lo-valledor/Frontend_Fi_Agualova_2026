import api from '~/lib/api';
import type { ServiceResponse } from '~/services/core/api-response';
import { BaseApiService } from '~/services/core/base-service';
import type { Facturas } from '~/types/reportes';

export class BillingReportService extends BaseApiService {
  constructor(httpClient: any = api) {
    super(httpClient);
  }

  async getFacturacionPorCargo(
    periodo: string,
    emId: number
  ): Promise<ServiceResponse<Facturas[]>> {
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
      return this.processResponseArray<Facturas>(response);
    }, 'Error getting billing by charges');
  }
}

export const billingReportService = new BillingReportService(api);
