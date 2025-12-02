import { useState } from 'react';
import { toast } from 'sonner';
import {
  convertToCSV,
  downloadCSVFile,
  downloadExcelFile,
  validateExportData
} from './utils/csv-excel-utils';
import { formatDateForExport } from './utils/export-formatters';

export type ExportFormat = 'csv' | 'xlsx';

export interface ExportOptions {
  format: ExportFormat;
  filename?: string;
  includeHeaders?: boolean;
}

export interface ExportColumn {
  key: string;
  header: string;
  formatter?: (value: any) => string;
}

/**
 * Hook para exportar datos a CSV o Excel
 *
 * Proporciona funciones para exportar datos tabulares a CSV (con BOM UTF-8)
 * o Excel (XLSX con lazy loading). Incluye formatters comunes como fechas.
 *
 * @template T - Tipo de datos a exportar
 * @returns Objeto con estado de exportación y funciones
 *
 * @example
 * ```tsx
 * const { isExporting, exportData, formatDateForExport } = useExportData();
 *
 * const columns: ExportColumn[] = [
 *   { key: 'id', header: 'ID' },
 *   { key: 'date', header: 'Fecha', formatter: formatDateForExport },
 *   { key: 'amount', header: 'Monto' }
 * ];
 *
 * const handleExport = async () => {
 *   await exportData(records, columns, { format: 'xlsx', filename: 'ventas' });
 * };
 * ```
 */
export function useExportData<T extends Record<string, any>>() {
  const [isExporting, setIsExporting] = useState(false);

  /**
   * Exporta datos en el formato especificado
   *
   * @param data - Registros a exportar
   * @param columns - Definición de columnas con formatters opcionales
   * @param options - Opciones de exportación (formato, nombre de archivo, headers)
   */
  const exportData = async (
    data: T[],
    columns: ExportColumn[],
    options: ExportOptions
  ): Promise<void> => {
    // Early return: validate data
    if (!validateExportData(data)) {
      toast.error('No hay datos para exportar');
      return;
    }

    setIsExporting(true);

    try {
      const baseFilename = options.filename || 'export';
      const includeHeaders = options.includeHeaders ?? true;

      toast.info(`Preparando exportación de ${data.length} registros...`);

      // Brief delay to show loading state
      await new Promise(resolve => setTimeout(resolve, 500));

      // Dispatch to appropriate exporter
      switch (options.format) {
        case 'csv':
          const csvContent = convertToCSV(data, columns, includeHeaders);
          downloadCSVFile(csvContent, baseFilename);
          break;

        case 'xlsx':
          await downloadExcelFile(data, columns, baseFilename, includeHeaders);
          break;

        default:
          const defaultCsv = convertToCSV(data, columns, includeHeaders);
          downloadCSVFile(defaultCsv, baseFilename);
      }

      toast.success(`✅ ${data.length} registros exportados exitosamente`, {
        description: `Archivo: ${baseFilename}_${new Date().toISOString().split('T')[0]}.${options.format}`,
        duration: 4000
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      toast.error('Error al exportar los datos', {
        description: errorMessage
      });
    } finally {
      setIsExporting(false);
    }
  };

  return {
    isExporting,
    exportData,
    formatDateForExport
  };
}
