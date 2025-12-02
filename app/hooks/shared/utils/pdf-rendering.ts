/**
 * @deprecated Use ~/utils/export/pdf-rendering instead
 *
 * This file is kept for backward compatibility only.
 * All functionality has been moved to the centralized export utilities.
 * Please update your imports to use ~/utils/export instead.
 *
 * Migration example:
 * - Old: import { renderHeader } from '~/hooks/shared/utils/pdf-rendering'
 * - New: import { renderHeader } from '~/utils/export'
 */

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
