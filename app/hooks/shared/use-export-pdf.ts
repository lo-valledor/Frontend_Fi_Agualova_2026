import { useState } from 'react';
import { toast } from 'sonner';
import {
  renderCompanyInfo,
  renderHeader,
  renderSection,
  addPageFooters
} from './utils/pdf-rendering';

export interface PDFExportOptions {
  title?: string;
  subtitle?: string;
  filename?: string;
  orientation?: 'portrait' | 'landscape';
  includeDate?: boolean;
  companyInfo?: {
    name?: string;
    address?: string;
    phone?: string;
  };
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
  type: 'table' | 'kpis' | 'text' | 'chart';
  data?: any;
  columns?: PDFTableColumn[];
  kpis?: Array<{ label: string; value: string | number }>;
  text?: string;
}

/**
 * Hook para exportar datos a PDF con múltiples secciones
 *
 * Soporta tablas, KPIs, texto y placeholders de gráficos.
 * Maneja automáticamente saltos de página y estilos consistentes.
 *
 * @returns Objeto con estado de exportación y función exportToPDF
 *
 * @example
 * ```tsx
 * const { isExporting, exportToPDF } = useExportPDF();
 *
 * const handleExport = async () => {
 *   await exportToPDF([
 *     { type: 'text', text: 'Resumen Mensual' },
 *     {
 *       type: 'table',
 *       title: 'Datos',
 *       data: records,
 *       columns: [{ key: 'name', header: 'Nombre' }]
 *     }
 *   ], {
 *     title: 'Reporte Mensual',
 *     filename: 'reporte'
 *   });
 * };
 * ```
 */
export function useExportPDF() {
  const [isExporting, setIsExporting] = useState(false);

  const exportToPDF = async (
    sections: PDFSection[],
    options: PDFExportOptions = {}
  ): Promise<void> => {
    // Validate input
    if (!sections || sections.length === 0) {
      toast.error('No hay secciones para exportar');
      return;
    }

    setIsExporting(true);

    try {
      const { default: jsPDF } = await import('jspdf');
      await import('jspdf-autotable');

      const {
        title = 'Reporte',
        subtitle,
        filename = 'reporte',
        orientation = 'portrait',
        includeDate = true,
        companyInfo
      } = options;

      const doc = new jsPDF({ orientation, unit: 'mm', format: 'a4' });

      let yPosition = 15;
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 15;
      const contentWidth = pageWidth - 2 * margin;

      // Page break handler
      const checkNewPage = (requiredSpace: number = 20): boolean => {
        if (yPosition + requiredSpace > pageHeight - margin) {
          doc.addPage();
          yPosition = margin;
          return true;
        }
        return false;
      };

      // Render company info if provided
      if (companyInfo) {
        yPosition = renderCompanyInfo(doc, companyInfo, margin, yPosition);
      }

      // Render header
      yPosition = renderHeader(doc, { title, subtitle, includeDate }, pageWidth, yPosition);

      // Draw separator line
      doc.setDrawColor(200, 200, 200);
      doc.line(margin, yPosition, pageWidth - margin, yPosition);
      yPosition += 8;

      // Render all sections
      const config = { margin, contentWidth, pageWidth, checkNewPage };
      for (const section of sections) {
        yPosition = renderSection(doc, section, config, yPosition);
      }

      // Add page numbers
      addPageFooters(doc, pageWidth, pageHeight);

      // Save PDF with timestamp
      const timestamp = new Date().toISOString().split('T')[0];
      doc.save(`${filename}_${timestamp}.pdf`);

      toast.success('PDF generado exitosamente', {
        description: `Archivo: ${filename}_${timestamp}.pdf`,
        duration: 4000
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      toast.error('Error al generar el PDF', {
        description: errorMessage
      });
    } finally {
      setIsExporting(false);
    }
  };

  return {
    isExporting,
    exportToPDF
  };
}
