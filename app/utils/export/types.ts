export interface ExportColumn {
  key: string;
  header: string;
  formatter?: (value: any) => string;
}

export interface ExportConfig {
  format: 'csv' | 'xlsx' | 'pdf';
  filename: string;
  includeHeaders: boolean;
}

export interface PDFTableColumn {
  key: string;
  header: string;
  width?: number;
  align?: 'left' | 'center' | 'right';
  formatter?: (value: any) => string;
}

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

export interface CompanyInfo {
  name?: string;
  address?: string;
  phone?: string;
}
