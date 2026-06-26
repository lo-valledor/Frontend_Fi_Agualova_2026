// Re-export from new location for backward compatibility
export {
  addPageFooters,
  renderChartSection,
  renderCompanyInfo,
  renderHeader,
  renderKPISection,
  renderSection,
  renderTableSection,
  renderTextSection
} from '~/utils/export/pdf-rendering';

// Re-export types for backward compatibility
export type {
  CompanyInfo,
  PDFSection,
  PDFTableColumn
} from '~/utils/export/types';
