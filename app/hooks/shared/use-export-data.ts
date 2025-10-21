import { useState } from 'react';
import { toast } from 'sonner';
// Lazy load xlsx - solo se carga cuando se exporta a Excel
// import * as XLSX from 'xlsx';

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

export function useExportData<T extends Record<string, any>>() {
  const [isExporting, setIsExporting] = useState(false);

  // Función para formatear fecha para exportación
  const formatDateForExport = (date: string | null | undefined): string => {
    if (!date) return '';
    try {
      return new Date(date).toLocaleDateString('es-CL');
    } catch {
      return '';
    }
  };

  // Función para convertir datos a CSV
  const convertToCSV = (
    data: T[],
    columns: ExportColumn[],
    includeHeaders: boolean = true
  ): string => {
    const csvContent = [];

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
  };

  // Función para descargar archivo CSV
  const downloadCSV = (
    data: T[],
    columns: ExportColumn[],
    filename: string = 'export',
    includeHeaders: boolean = true
  ) => {
    const csvContent = convertToCSV(data, columns, includeHeaders);
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
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  };

  // Función para descargar archivo Excel usando la librería xlsx (lazy loaded)
  const downloadExcel = async (
    data: T[],
    columns: ExportColumn[],
    filename: string = 'export',
    includeHeaders: boolean = true
  ) => {
    // Lazy load xlsx solo cuando se necesita
    const XLSX = await import('xlsx');

    // Preparar los datos para Excel
    const excelData = data.map(item => {
      const row: Record<string, any> = {};
      columns.forEach(col => {
        const value = item[col.key];
        row[col.header] = col.formatter ? col.formatter(value) : value;
      });
      return row;
    });

    // Crear workbook y worksheet
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(excelData, {
      header: columns.map(col => col.header),
      skipHeader: !includeHeaders
    });

    // Configurar ancho de columnas automático
    const columnWidths = columns.map(col => {
      const maxLength = Math.max(
        col.header.length,
        ...data.map(item => {
          const value = item[col.key];
          const formattedValue = col.formatter ? col.formatter(value) : value;
          return String(formattedValue || '').length;
        })
      );
      return { wch: Math.min(maxLength + 2, 50) }; // Máximo 50 caracteres
    });
    worksheet['!cols'] = columnWidths;

    // Agregar worksheet al workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Datos');

    // Generar archivo y descargarlo
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
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  };

  // Función principal de exportación
  const exportData = async (
    data: T[],
    columns: ExportColumn[],
    options: ExportOptions
  ) => {
    if (!data || data.length === 0) {
      toast.error('No hay datos para exportar');
      return;
    }

    setIsExporting(true);

    try {
      const baseFilename = options.filename || 'export';
      const includeHeaders = options.includeHeaders ?? true;

      toast.info(`Preparando exportación de ${data.length} registros...`);

      // Simular un pequeño delay para mostrar el estado de carga
      await new Promise(resolve => setTimeout(resolve, 500));

      switch (options.format) {
        case 'csv':
          downloadCSV(data, columns, baseFilename, includeHeaders);
          break;
        case 'xlsx':
          await downloadExcel(data, columns, baseFilename, includeHeaders);
          break;
        default:
          downloadCSV(data, columns, baseFilename, includeHeaders);
      }

      toast.success(`✅ ${data.length} registros exportados exitosamente`, {
        description: `Archivo: ${baseFilename}_${new Date().toISOString().split('T')[0]}.${options.format}`,
        duration: 4000
      });
    } catch (error) {
      console.error('Error al exportar:', error);
      toast.error('Error al exportar los datos', {
        description: 'Inténtalo de nuevo en unos momentos'
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
