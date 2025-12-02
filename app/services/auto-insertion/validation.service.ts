import { BaseApiService } from '~/services/core/base-service';
import type { MedidorNichoItem } from '~/types/monitor';

/**
 * Interface para resultado de validación
 */
export interface ValidationResult {
  valid: boolean;
  reasons: string[];
  severity: 'ok' | 'warning' | 'error';
}

/**
 * Interface para detección de consumo anómalo
 */
export interface AnomalyDetection {
  anomalous: boolean;
  type?: string;
  reason?: string;
}

/**
 * Servicio especializado para validación de lecturas de medidores
 * Aplica SOLID: Single Responsibility = solo validación
 */
export class ValidationService extends BaseApiService {
  /**
   * Constructor
   * @param httpClient Axios HTTP client instance
   */
  constructor(httpClient?: any) {
    super(httpClient);
  }

  /**
   * Detecta anomalías en el consumo calculado
   * @param currentReading - Lectura actual del medidor
   * @param previousReading - Lectura anterior del medidor
   * @param previousConsumption - Consumo del periodo anterior (puede ser null)
   * @param meterCapacity - Capacidad máxima del medidor (default: 99999)
   * @returns Objeto con detección de anomalía si existe
   */
  private detectAnomalousConsumption(
    currentReading: number,
    previousReading: number,
    previousConsumption: number | null,
    meterCapacity: number = 99999
  ): AnomalyDetection {
    const consumption = currentReading - previousReading;

    // 1. Detectar patrón de 9s (decimal truncado)
    const consumptionStr = Math.abs(consumption).toString();
    if (/9{4,}/.test(consumptionStr)) {
      return {
        anomalous: true,
        type: 'decimal_truncated',
        reason: `Suspicious consumption (${consumption} kWh) - possible truncated decimal`
      };
    }

    // 2. Consumo negativo (sin considerar rollover)
    if (consumption < 0) {
      const rolloverConsumption =
        meterCapacity + 1 - previousReading + currentReading;
      if (rolloverConsumption > meterCapacity * 0.8) {
        return {
          anomalous: true,
          type: 'incorrect_rollover',
          reason: `Suspicious rollover (${rolloverConsumption} kWh)`
        };
      }
    }

    // 3. Consumo excesivo comparado con el anterior
    if (previousConsumption !== null && previousConsumption > 0) {
      const ratio = consumption / previousConsumption;
      if (ratio > 3) {
        return {
          anomalous: true,
          type: 'excessive',
          reason: `Consumption ${ratio.toFixed(1)}x higher than previous (${consumption} vs ${previousConsumption} kWh)`
        };
      }
      if (ratio < 0.3 && consumption > 100) {
        return {
          anomalous: true,
          type: 'too_low',
          reason: `Consumption ${ratio.toFixed(1)}x lower than previous (${consumption} vs ${previousConsumption} kWh)`
        };
      }
    }

    // 4. Consumo absoluto muy alto
    if (consumption > 2000) {
      return {
        anomalous: true,
        type: 'excessive_absolute',
        reason: `Very high consumption (${consumption} kWh)`
      };
    }

    return { anomalous: false };
  }

  /**
   * Valida si una lectura califica para inserción automática
   * @param meter - Datos del medidor con lecturas importadas
   * @returns Objeto con resultado de validación
   */
  validateForAutoInsertion(meter: MedidorNichoItem): ValidationResult {
    const reasons: string[] = [];

    // 1. Validar que sea BT1 o BT2
    const rate = meter.tarifa?.toUpperCase();
    if (!rate || (!rate.includes('BT-1') && !rate.includes('BT-2'))) {
      reasons.push('Only BT1 and BT2 qualify for automatic insertion');
      return { valid: false, reasons, severity: 'error' };
    }

    // 2. Validar que tenga datos importados
    const activeEnergy = meter.LMC_EnergiaActiva;
    if (
      activeEnergy === undefined ||
      activeEnergy === null ||
      activeEnergy < 0
    ) {
      reasons.push('No active energy data imported');
      return { valid: false, reasons, severity: 'error' };
    }

    // 2.1 Validar que no sea 0
    if (activeEnergy === 0) {
      reasons.push('Current reading is 0 - requires manual review');
      return { valid: false, reasons, severity: 'error' };
    }

    // 3. Validar que tenga lectura anterior válida
    const previousReading = meter.LM_ValorUltimaLectura;
    if (
      previousReading === undefined ||
      previousReading === null ||
      previousReading < 0
    ) {
      reasons.push('No valid previous reading');
      return { valid: false, reasons, severity: 'error' };
    }

    // 4. Validar que las lecturas sean diferentes
    if (activeEnergy === previousReading) {
      reasons.push('Current reading equals previous reading (0 consumption)');
      return { valid: false, reasons, severity: 'warning' };
    }

    // 4.1 Validar consistencia de consumo importado
    const importedConsumption = meter.LMC_ConsumoEnergiaActiva;
    const simpleDifference = activeEnergy - previousReading;

    if (
      importedConsumption !== undefined &&
      importedConsumption !== null &&
      Math.abs(importedConsumption - simpleDifference) > 0.01
    ) {
      reasons.push(
        `Inconsistency detected: C8 (${importedConsumption}) ≠ 8-Previous (${simpleDifference}) - requires manual validation`
      );
      return { valid: false, reasons, severity: 'error' };
    }

    // 5. Calcular consumo y detectar anomalías
    const consumption = activeEnergy - previousReading;
    const previousConsumption =
      Number.parseFloat(meter.LM_ConsumoMesAnterior) || null;
    const anomaly = this.detectAnomalousConsumption(
      activeEnergy,
      previousReading,
      previousConsumption
    );

    if (anomaly.anomalous) {
      reasons.push(anomaly.reason || 'Anomalous consumption detected');
      return { valid: false, reasons, severity: 'error' };
    }

    // 6. Validar consumo en rango razonable
    if (consumption < 0) {
      const rolloverConsumption = 99999 + 1 - previousReading + activeEnergy;
      if (rolloverConsumption > 0 && rolloverConsumption <= 99999) {
        reasons.push(
          `Rollover detected (consumption: ${rolloverConsumption} kWh)`
        );
      } else {
        reasons.push('Invalid negative consumption');
        return { valid: false, reasons, severity: 'error' };
      }
    }

    // 7. Validar que no haya sido guardado previamente
    if (meter.LM_FechaLectura) {
      reasons.push('Reading already saved previously');
      return { valid: false, reasons, severity: 'error' };
    }

    reasons.push(`Valid consumption: ${consumption} kWh`);
    return { valid: true, reasons, severity: 'ok' };
  }
}

export const validationService = new ValidationService();
