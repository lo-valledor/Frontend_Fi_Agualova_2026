import { BaseApiService } from '~/services/core/base-service';
import type { ServiceResponse } from '~/services/core/api-response';
import type { MedidorNichoItem } from '~/types/monitor';
import { validationService, type ValidationResult } from './validation.service';
import { consumptionCalculationService } from './consumption-calculation.service';


export interface ReadingForInsertion {
  meter: MedidorNichoItem;
  validation: ValidationResult;
  currentReading: number;
  previousReading: number;
  calculatedConsumption: number;
}


export interface AutoInsertionResult {
  successful: number;
  failed: number;
  skipped: number;
  details: {
    id: number;
    serialNumber: string;
    status: 'successful' | 'failed' | 'skipped';
    message: string;
  }[];
}


export interface MeterAnalysisResult {
  autoInsertable: ReadingForInsertion[];
  requiresReview: ReadingForInsertion[];
  summary: {
    total: number;
    autoInsertable: number;
    requiresReview: number;
  };
}


export class AutoInsertionService extends BaseApiService {
  
  constructor(httpClient?: any) {
    super(httpClient);
  }

  
  async analyzeMeterQualification(
    meters: MedidorNichoItem[]
  ): Promise<ServiceResponse<MeterAnalysisResult>> {
    try {
      const autoInsertable: ReadingForInsertion[] = [];
      const requiresReview: ReadingForInsertion[] = [];

      for (const meter of meters) {
        const validation = validationService.validateForAutoInsertion(meter);
        const currentReading = meter.LMC_EnergiaActiva || 0;
        const previousReading = meter.LM_ValorUltimaLectura || 0;
        const digits = meter.ME_Digitos || 5;
        const multiplierConstant = meter.ME_ConstanteMultiplicar || 1;

        // Calcular consumo real
        const { consumptionKwh } =
          consumptionCalculationService.calculateRealConsumption(
            currentReading,
            previousReading,
            digits,
            multiplierConstant
          );

        const readingForInsertion: ReadingForInsertion = {
          meter,
          validation,
          currentReading,
          previousReading,
          calculatedConsumption: consumptionKwh
        };

        if (validation.valid) {
          autoInsertable.push(readingForInsertion);
        } else {
          requiresReview.push(readingForInsertion);
        }
      }

      return {
        data: {
          autoInsertable,
          requiresReview,
          summary: {
            total: meters.length,
            autoInsertable: autoInsertable.length,
            requiresReview: requiresReview.length
          }
        },
        error: null
      };
    } catch (error) {
      return this.handleError(
        error instanceof Error ? error : new Error('Unknown error'),
        'Error analyzing meters for auto insertion'
      );
    }
  }

  
  async processBatch(
    readings: ReadingForInsertion[],
    _period: string
  ): Promise<ServiceResponse<AutoInsertionResult>> {
    if (!readings || readings.length === 0) {
      return this.handleError(
        new Error('Empty readings'),
        'No readings provided for insertion'
      );
    }

    const result: AutoInsertionResult = {
      successful: 0,
      failed: 0,
      skipped: 0,
      details: []
    };

    // ID de clave LEOK (Lectura OK) - usado para lecturas válidas
    const LEOK_KEY_ID = '23';

    return this.executeDataOperation(async () => {
      // Procesar cada lectura
      for (const reading of readings) {
        try {
          const { meter } = reading;

          // Validación final antes de insertar
          if (!reading.validation.valid) {
            result.skipped++;
            result.details.push({
              id: meter.LM_ID,
              serialNumber: meter.ME_NSerie || 'N/A',
              status: 'skipped',
              message: `Skipped: ${reading.validation.reasons.join(', ')}`
            });
            continue;
          }

          // Preparar datos en el mismo formato que el formulario manual
          const insertionData = {
            lmid: meter.LM_ID.toString(),
            vactual: reading.currentReading.toString(),
            consumo: reading.calculatedConsumption.toString(),
            claid: LEOK_KEY_ID // Usar clave LEOK para lecturas válidas
          };

          // Llamar al endpoint de actualización de lectura
          await this.httpClient.put(
            '/actualizar-lectura-bt-1-bt-2',
            insertionData
          );

          result.successful++;
          result.details.push({
            id: meter.LM_ID,
            serialNumber: meter.ME_NSerie || 'N/A',
            status: 'successful',
            message: `Successfully saved (${reading.calculatedConsumption.toFixed(2)} kWh)`
          });
        } catch (error: any) {
          result.failed++;
          result.details.push({
            id: reading.meter.LM_ID,
            serialNumber: reading.meter.ME_NSerie || 'N/A',
            status: 'failed',
            message:
              error.response?.data?.message || error.message || 'Save error'
          });
        }
      }

      return result;
    }, 'Error processing automatic insertion batch');
  }

  
  async processSingle(
    reading: ReadingForInsertion
  ): Promise<ServiceResponse<AutoInsertionResult>> {
    return this.processBatch([reading], '');
  }

  
  getStatistics(analysis: MeterAnalysisResult): {
    successRate: number;
    estimatedAutoInsertions: number;
    requiresManualReview: number;
    performanceImpact: string;
  } {
    const { autoInsertable, requiresReview, summary } = analysis;

    const successRate =
      summary.total > 0 ? (autoInsertable.length / summary.total) * 100 : 0;

    let performanceImpact = 'Low';
    if (successRate > 80) {
      performanceImpact = 'Optimal';
    } else if (successRate > 50) {
      performanceImpact = 'Medium';
    } else if (successRate > 20) {
      performanceImpact = 'Limited';
    }

    return {
      successRate: Math.round(successRate),
      estimatedAutoInsertions: autoInsertable.length,
      requiresManualReview: requiresReview.length,
      performanceImpact
    };
  }
}

export const autoInsertionService = new AutoInsertionService();
