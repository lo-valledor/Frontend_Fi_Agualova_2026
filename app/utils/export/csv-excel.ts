/**
 * CSV and Excel Export Utilities
 *
 * Helper functions for converting data to CSV/Excel formats and downloading files.
 * Handles BOM encoding for UTF-8, lazy-loaded xlsx library, and blob creation.
 */

import type { ExportColumn } from './types';

/**
 * Converts array of records to CSV format
 *
 * @param data - Array of records to convert
 * @param columns - Column definitions with keys, headers, and optional formatters
 * @param includeHeaders - Whether to include header row (default: true)
 * @returns CSV string with rows separated by newlines
 *
 * @example
 * ```typescript
 * const csv = convertToCSV(
 *   [{ id: 1, name: 'John' }],
 *   [{ key: 'id', header: 'ID' }, { key: 'name', header: 'Name' }]
 * );
 * ```
 */
export function convertToCSV<T extends Record<string, any>>(
  data: T[],
  columns: ExportColumn[],
  includeHeaders: boolean = true
): string {
  const csvContent: string[] = [];

  if (includeHeaders) {
    csvContent.push(columns.map(col => col.header).join(','));
  }

  data.forEach(item => {
    const row = columns.map(col => {
      const value = item[col.key];
      const formattedValue = col.formatter ? col.formatter(value) : value;
      return `"${formattedValue || ''}"`;
    });
    csvContent.push(row.join(','));
  });

  return csvContent.join('\n');
}

/**
 * Triggers CSV file download with UTF-8 BOM encoding
 *
 * @param csvContent - CSV formatted string
 * @param filename - Base filename without extension or date
 *
 * @example
 * ```typescript
 * const csv = 'id,name\n1,"John"';
 * downloadCSVFile(csv, 'users');
 * // Downloads: users_2024-01-15.csv
 * ```
 */
export function downloadCSVFile(csvContent: string, filename: string): void {
  // Add UTF-8 BOM (\uFEFF) for proper Excel/Sheets character encoding
  const blob = new Blob(['\uFEFF' + csvContent], {
    type: 'text/csv;charset=utf-8;'
  });

  const link = document.createElement('a');

  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute(
      'download',
      `${filename}_${new Date().toISOString().split('T')[0]}.csv`
    );
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }
}

/**
 * Converts data to Excel format and triggers download
 * Dynamically imports xlsx library (lazy loading)
 *
 * @param data - Array of records to export
 * @param columns - Column definitions with formatting
 * @param filename - Base filename without extension or date
 * @param includeHeaders - Whether to include header row (default: true)
 *
 * @example
 * ```typescript
 * const data = [{ id: 1, amount: 100.50 }];
 * const columns = [
 *   { key: 'id', header: 'ID' },
 *   { key: 'amount', header: 'Amount', formatter: v => v.toFixed(2) }
 * ];
 * await downloadExcelFile(data, columns, 'sales');
 * // Downloads: sales_2024-01-15.xlsx
 * ```
 */
export async function downloadExcelFile<T extends Record<string, any>>(
  data: T[],
  columns: ExportColumn[],
  filename: string,
  includeHeaders: boolean = true
): Promise<void> {
  // Lazy load xlsx only when Excel export is needed
  const XLSX = await import('xlsx');

  // Transform data to Excel format
  const excelData = data.map(item => {
    const row: Record<string, any> = {};
    columns.forEach(col => {
      const value = item[col.key];
      row[col.header] = col.formatter ? col.formatter(value) : value;
    });
    return row;
  });

  // Create workbook and worksheet
  const workbook = XLSX.utils.book_new();
  const worksheet = XLSX.utils.json_to_sheet(excelData, {
    header: columns.map(col => col.header),
    skipHeader: !includeHeaders
  });

  // Auto-size columns based on content
  const columnWidths = columns.map(col => {
    const maxLength = Math.max(
      col.header.length,
      ...data.map(item => {
        const value = item[col.key];
        const formattedValue = col.formatter ? col.formatter(value) : value;
        return String(formattedValue || '').length;
      })
    );
    return { wch: Math.min(maxLength + 2, 50) }; // Max 50 characters
  });
  worksheet['!cols'] = columnWidths;

  // Append worksheet to workbook
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Datos');

  // Generate and download file
  const excelBuffer = XLSX.write(workbook, {
    bookType: 'xlsx',
    type: 'array'
  });

  const blob = new Blob([excelBuffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  });

  const link = document.createElement('a');
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute(
      'download',
      `${filename}_${new Date().toISOString().split('T')[0]}.xlsx`
    );
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }
}

/**
 * Validates that data is ready for export
 *
 * @param data - Array of records
 * @returns true if data is valid and non-empty
 */
export function validateExportData<T extends Record<string, any>>(data: T[]): boolean {
  return Array.isArray(data) && data.length > 0;
}
