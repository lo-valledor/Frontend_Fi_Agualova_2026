import { billingCalculationService } from './billing-calculation.service';
import { periodosService } from './periodos.service';
import { preparationService } from './preparation.service';
import { pricingService } from './pricing.service';

export type { BillingCalculationRequest } from './billing-calculation.service';
export {
  BillingCalculationService,
  billingCalculationService
} from './billing-calculation.service';
// Servicios
export { PeriodosService, periodosService } from './periodos.service';
export type {
  CutRepositionData,
  PrepareReadingsData,
  ReviewPriceData
} from './preparation.service';
export { PreparationService, preparationService } from './preparation.service';
export type { CyclePrices, PricingData } from './pricing.service';
export { PricingService, pricingService } from './pricing.service';

// Tipos compartidos
export * from './types';

export const operacionesServices = {
  periodos: periodosService,
  pricing: pricingService,
  preparation: preparationService,
  billing: billingCalculationService
};
