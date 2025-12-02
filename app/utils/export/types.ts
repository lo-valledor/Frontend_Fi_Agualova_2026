/**
 * Export Utilities - Type Definitions
 *
 * Shared types for export functionality across the application.
 */

/**
 * Column definition for export operations
 * Specifies how data should be mapped and formatted during export
 */
export interface ExportColumn {
  key: string;
  header: string;
  formatter?: (value: any) => string;
}

/**
 * Export configuration options
 */
export interface ExportConfig {
  format: 'csv' | 'xlsx' | 'pdf';
  filename: string;
  includeHeaders: boolean;
}

/**
 * PDF Table column definition
 */
export interface PDFTableColumn {
  key: string;
  header: string;
  width?: number;
  align?: 'left' | 'center' | 'right';
  formatter?: (value: any) => string;
}

/**
 * PDF Section configuration
 */
export interface PDFSection {
  title?: string;
  type: 'text' | 'table' | 'chart' | 'kpis';
  data?: any;
  columns?: PDFTableColumn[];
  kpis?: Array<{ label: string; value: string | number }>;
  text?: string;
  content?: any;
  options?: Record<string, any>;
}

/**
 * Company information for PDF header
 */
export interface CompanyInfo {
  name?: string;
  address?: string;
  phone?: string;
}
