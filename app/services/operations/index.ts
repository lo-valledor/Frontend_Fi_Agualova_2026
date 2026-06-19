import { periodosService } from './periodos.service';
import { pricingService } from './pricing.service';
import { preparationService } from './preparation.service';
import { billingCalculationService } from './billing-calculation.service';

// Servicios
export { periodosService, PeriodosService } from './periodos.service';

export { pricingService, PricingService } from './pricing.service';
export type { PricingData, CyclePrices } from './pricing.service';

export { preparationService, PreparationService } from './preparation.service';
export type {
  PrepareReadingsData,
  ReviewPriceData,
  CutRepositionData
} from './preparation.service';

export {
  billingCalculationService,
  BillingCalculationService
} from './billing-calculation.service';
export type { BillingCalculationRequest } from './billing-calculation.service';

// Tipos compartidos
export * from './types';


export const operacionesServices = {
  periodos: periodosService,
  pricing: pricingService,
  preparation: preparationService,
  billing: billingCalculationService
};
