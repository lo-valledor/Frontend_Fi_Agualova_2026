import { validationService } from './validation.service';
import { consumptionCalculationService } from './consumption-calculation.service';
import { autoInsertionService } from './auto-insertion.service';

// Servicios
export { validationService, ValidationService } from './validation.service';
export type { ValidationResult, AnomalyDetection } from './validation.service';

export {
  consumptionCalculationService,
  ConsumptionCalculationService
} from './consumption-calculation.service';
export type { ConsumptionCalculationResult } from './consumption-calculation.service';

export {
  autoInsertionService,
  AutoInsertionService
} from './auto-insertion.service';
export type {
  ReadingForInsertion,
  AutoInsertionResult,
  MeterAnalysisResult
} from './auto-insertion.service';

// Tipos compartidos
export * from './types';


export const autoInsertionServices = {
  validation: validationService,
  consumptionCalculation: consumptionCalculationService,
  autoInsertion: autoInsertionService
};
