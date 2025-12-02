/**
 * @deprecated Use ~/utils/export/column-builder instead
 *
 * This file is kept for backward compatibility only.
 * All functionality has been moved to the centralized export utilities.
 * Please update your imports to use ~/utils/export instead.
 *
 * Migration example:
 * - Old: import { ExportColumnBuilder } from '~/hooks/administracion/utils/export-utilities'
 * - New: import { ExportColumnBuilder } from '~/utils/export'
 */

// Re-export from new location for backward compatibility
export {
  ExportColumnBuilder,
  DEFAULT_EXPORT_CONFIG,
  getExportConfig,
  validateExportColumns
} from '~/utils/export/column-builder';

// Re-export types for backward compatibility
export type { ExportConfig } from '~/utils/export/types';

