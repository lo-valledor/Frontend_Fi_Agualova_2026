import { BaseApiService } from '~/services/core/base-service';

export interface ConsumptionCalculationResult {
  consumptionKwh: number;
  hasRollover: boolean;
  adjustedReading: number;
}

export class ConsumptionCalculationService extends BaseApiService {
  constructor(httpClient?: any) {
    super(httpClient);
  }

  calculateRealConsumption(
    currentReading: number,
    previousReading: number,
    digits: number = 5,
    multiplierConstant: number = 1
  ): ConsumptionCalculationResult {
    let adjustedReading = currentReading;
    const hasRollover = currentReading < previousReading;

    // Si hay rollover (lectura actual < anterior), ajustar según número de dígitos
    if (hasRollover) {
      const rolloverValues: Record<number, number> = {
        1: 0,
        4: 10000,
        5: 100000,
        6: 1000000,
        7: 10000000,
        8: 100000000,
        10: 10000000000
      };

      adjustedReading =
        currentReading + (rolloverValues[digits] || currentReading);
    }

    // Calcular consumo final
    const consumptionKwh =
      (adjustedReading - previousReading) * multiplierConstant;

    return {
      consumptionKwh,
      hasRollover,
      adjustedReading
    };
  }

  calculateSimpleConsumption(
    currentReading: number,
    previousReading: number
  ): ConsumptionCalculationResult {
    return this.calculateRealConsumption(currentReading, previousReading, 5, 1);
  }

  isValidConsumption(
    currentReading: number,
    previousReading: number,
    meterCapacity: number = 99999
  ): boolean {
    if (currentReading >= previousReading) {
      return true; // Consumo positivo válido
    }

    // Para consumo negativo, verificar si rollover es válido
    const rolloverConsumption =
      meterCapacity + 1 - previousReading + currentReading;

    return rolloverConsumption > 0 && rolloverConsumption <= meterCapacity;
  }

  getValidConsumptionRange(
    previousConsumption: number | null,
    multiplier: number = 3
  ): { min: number; max: number } | null {
    if (!previousConsumption || previousConsumption <= 0) {
      return null;
    }

    return {
      min: previousConsumption * 0.3,
      max: previousConsumption * multiplier
    };
  }
}

export const consumptionCalculationService =
  new ConsumptionCalculationService();
