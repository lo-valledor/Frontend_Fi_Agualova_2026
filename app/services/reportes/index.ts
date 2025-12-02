/**
 * Reportes Services Module
 * Barrel export pattern for all reporting services
 */

import { summaryReportService } from './summary-report.service';
import { billingReportService } from './billing-report.service';
import { contractDetailsReportService } from './contract-details-report.service';

export { summaryReportService } from './summary-report.service';
export { billingReportService } from './billing-report.service';
export { contractDetailsReportService } from './contract-details-report.service';

export type { ResumenFacturacionData } from './summary-report.service';

export type { DetallesContrato } from './contract-details-report.service';

// Consolidated services object
export const reportesServices = {
  summary: summaryReportService,
  billing: billingReportService,
  contractDetails: contractDetailsReportService
};
