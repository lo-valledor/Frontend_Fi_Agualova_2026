import { BaseApiService } from '~/services/core/base-service';
import type { ServiceResponse } from '~/services/core/api-response';
import type {
  PeriodoAbierto,
  Ciclo,
  Anio,
  Periodos
} from '~/types/operaciones';

/**
 * Servicio especializado para gestión de períodos y ciclos de facturación
 * Aplica SOLID: Single Responsibility = solo gestión de períodos
 */
export class PeriodosService extends BaseApiService {
  /**
   * Constructor
   * @param httpClient Axios HTTP client instance
   */
  constructor(httpClient?: any) {
    super(httpClient);
  }

  /**
   * Obtiene el período de facturación actualmente abierto
   * @returns Respuesta con datos del período abierto
   */
  async getOpenPeriod(): Promise<ServiceResponse<PeriodoAbierto[]>> {
    return this.executeDataOperation(async () => {
      const response = await this.httpClient.get('/ConsultarPeriodoAbierto');
      return this.processResponseArray<PeriodoAbierto>(response);
    }, 'Error al obtener período abierto');
  }

  /**
   * Obtiene los ciclos de facturación activos
   * @returns Respuesta con ciclos activos
   */
  async getActiveBillingCycles(): Promise<ServiceResponse<Ciclo[]>> {
    return this.executeDataOperation(async () => {
      const response = await this.httpClient.get('/ciclos-facturacion-activos');
      return this.processResponseArray<Ciclo>(response);
    }, 'Error al obtener ciclos de facturación');
  }

  /**
   * Obtiene los años disponibles para consulta
   * @returns Respuesta con años disponibles
   */
  async getAvailableYears(): Promise<ServiceResponse<Anio[]>> {
    return this.executeDataOperation(async () => {
      const response = await this.httpClient.get('/consulta-año');
      return this.processResponseArray<Anio>(response);
    }, 'Error al obtener años disponibles');
  }

  /**
   * Obtiene los períodos disponibles para consulta
   * @returns Respuesta con períodos disponibles
   */
  async getAvailablePeriods(): Promise<ServiceResponse<Periodos[]>> {
    return this.executeDataOperation(async () => {
      const response = await this.httpClient.get('/consulta-periodo');
      return this.processResponseArray<Periodos>(response);
    }, 'Error al obtener períodos disponibles');
  }

  /**
   * Obtiene período y ciclos juntos (carga paralela)
   * @returns Respuesta con período y ciclos
   */
  async getPeriodAndCyclesData(): Promise<
    ServiceResponse<{
      period: PeriodoAbierto[];
      cycles: Ciclo[];
    }>
  > {
    return this.executeDataOperation(async () => {
      const [periodRes, cyclesRes] = await this.executeParallelOperations([
        () => this.httpClient.get('/ConsultarPeriodoAbierto'),
        () => this.httpClient.get('/ciclos-facturacion-activos')
      ]);

      return {
        period: this.processResponseArray<PeriodoAbierto>(periodRes),
        cycles: this.processResponseArray<Ciclo>(cyclesRes)
      };
    }, 'Error al obtener período y ciclos');
  }

  /**
   * Obtiene años y períodos juntos (carga paralela)
   * @returns Respuesta con años y períodos
   */
  async getYearsAndPeriodsData(): Promise<
    ServiceResponse<{
      years: Anio[];
      periods: Periodos[];
    }>
  > {
    return this.executeDataOperation(async () => {
      const [yearsRes, periodsRes] = await this.executeParallelOperations([
        () => this.httpClient.get('/consulta-año'),
        () => this.httpClient.get('/consulta-periodo')
      ]);

      return {
        years: this.processResponseArray<Anio>(yearsRes),
        periods: this.processResponseArray<Periodos>(periodsRes)
      };
    }, 'Error al obtener años y períodos');
  }
}

export const periodosService = new PeriodosService();
