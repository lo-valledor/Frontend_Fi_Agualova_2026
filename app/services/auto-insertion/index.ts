import { autoInsertionService } from './auto-insertion.service';
import { consumptionCalculationService } from './consumption-calculation.service';
import { validationService } from './validation.service';

export type {
  AutoInsertionResult,
  MeterAnalysisResult,
  ReadingForInsertion
} from './auto-insertion.service';
export {
  AutoInsertionService,
  autoInsertionService
} from './auto-insertion.service';
export type { ConsumptionCalculationResult } from './consumption-calculation.service';
export {
  ConsumptionCalculationService,
  consumptionCalculationService
} from './consumption-calculation.service';
// Tipos compartidos
export * from './types';
export type { AnomalyDetection, ValidationResult } from './validation.service';
// Servicios
export { ValidationService, validationService } from './validation.service';

export const autoInsertionServices = {
  validation: validationService,
  consumptionCalculation: consumptionCalculationService,
  autoInsertion: autoInsertionService
};
