/**
 * @deprecated Use ~/utils/export/csv-excel instead
 *
 * This file is kept for backward compatibility only.
 * All functionality has been moved to the centralized export utilities.
 * Please update your imports to use ~/utils/export instead.
 *
 * Migration example:
 * - Old: import { downloadCSVFile } from '~/hooks/shared/utils/csv-excel-utils'
 * - New: import { downloadCSVFile } from '~/utils/export'
 */

// Re-export from new location for backward compatibility
export {
  convertToCSV,
  downloadCSVFile,
  downloadExcelFile,
  validateExportData
} from '~/utils/export/csv-excel';

// Re-export types for backward compatibility
export type { ExportColumn } from '~/utils/export/types';
