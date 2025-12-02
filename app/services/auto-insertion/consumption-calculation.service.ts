import { BaseApiService } from '~/services/core/base-service';

/**
 * Interface para resultado de cálculo de consumo
 */
export interface ConsumptionCalculationResult {
  consumptionKwh: number;
  hasRollover: boolean;
  adjustedReading: number;
}

/**
 * Servicio especializado para cálculo de consumo con manejo de rollover
 * Aplica SOLID: Single Responsibility = solo cálculo de consumo
 */
export class ConsumptionCalculationService extends BaseApiService {
  /**
   * Constructor
   * @param httpClient Axios HTTP client instance
   */
  constructor(httpClient?: any) {
    super(httpClient);
  }

  /**
   * Calcula el consumo considerando rollovers y constante multiplicadora
   * Implementa la misma lógica que el formulario manual (bt1-bt2-form.tsx)
   *
   * @param currentReading - Valor actual del medidor
   * @param previousReading - Valor anterior del medidor
   * @param digits - Número de dígitos del medidor (1, 4, 5, 6, 7, 8, 10)
   * @param multiplierConstant - Constante multiplicadora del medidor
   * @returns Resultado con consumo calculado y detección de rollover
   */
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

  /**
   * Calcula consumo con valores por defecto comunes
   *
   * @param currentReading - Valor actual
   * @param previousReading - Valor anterior
   * @returns Resultado con consumo calculado
   */
  calculateSimpleConsumption(
    currentReading: number,
    previousReading: number
  ): ConsumptionCalculationResult {
    return this.calculateRealConsumption(currentReading, previousReading, 5, 1);
  }

  /**
   * Valida si un cálculo de consumo es válido (no negativo sin rollover válido)
   *
   * @param currentReading - Lectura actual
   * @param previousReading - Lectura anterior
   * @param meterCapacity - Capacidad del medidor (default: 99999)
   * @returns true si el cálculo es válido
   */
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

  /**
   * Obtiene el rango válido de consumo según histórico
   *
   * @param previousConsumption - Consumo del mes anterior
   * @param multiplier - Factor multiplicador (default: 3)
   * @returns Objeto con consumo mínimo y máximo permitidos
   */
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
