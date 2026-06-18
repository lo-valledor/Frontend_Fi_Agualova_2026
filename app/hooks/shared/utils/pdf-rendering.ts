// Re-export from new location for backward compatibility
export {
  renderCompanyInfo,
  renderHeader,
  renderKPISection,
  renderTableSection,
  renderTextSection,
  renderChartSection,
  renderSection,
  addPageFooters
} from '~/utils/export/pdf-rendering';

// Re-export types for backward compatibility
export type { PDFSection, PDFTableColumn, CompanyInfo } from '~/utils/export/types';
