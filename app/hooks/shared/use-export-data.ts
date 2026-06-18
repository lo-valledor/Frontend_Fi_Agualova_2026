import { useState } from 'react';
import { toast } from 'sonner';
import {
  convertToCSV,
  downloadCSVFile,
  downloadExcelFile,
  validateExportData
} from './utils/csv-excel-utils';
import { formatDateForExport } from './utils/export-formatters';

export type ExportFormat = 'csv' | 'xlsx' | 'pdf';

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


export function useExportData<T extends Record<string, any>>() {
  const [isExporting, setIsExporting] = useState(false);

  
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
        case 'csv': {
          const csvContent = convertToCSV(data, columns, includeHeaders);
          downloadCSVFile(csvContent, baseFilename);
          break;
        }

        case 'xlsx': {
          await downloadExcelFile(data, columns, baseFilename, includeHeaders);
          break;
        }

        default: {
          const defaultCsv = convertToCSV(data, columns, includeHeaders);
          downloadCSVFile(defaultCsv, baseFilename);
        }
      }

      toast.success(`✅ ${data.length} registros exportados exitosamente`, {
        description: `Archivo: ${baseFilename}_${new Date().toISOString().split('T')[0]}.${options.format}`,
        duration: 4000
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Error desconocido';
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
