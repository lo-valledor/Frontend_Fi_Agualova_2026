import { billingReportService } from './billing-report.service';
import { contractDetailsReportService } from './contract-details-report.service';
import { summaryReportService } from './summary-report.service';

export { billingReportService } from './billing-report.service';
export type { DetallesContrato } from './contract-details-report.service';
export { contractDetailsReportService } from './contract-details-report.service';

export type { ResumenFacturacionData } from './summary-report.service';
export { summaryReportService } from './summary-report.service';

// Consolidated services object
export const reportesServices = {
  summary: summaryReportService,
  billing: billingReportService,
  contractDetails: contractDetailsReportService
};
