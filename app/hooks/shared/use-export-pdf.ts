import { useState } from 'react';
import { toast } from 'sonner';

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

export function useExportPDF() {
  const [isExporting, setIsExporting] = useState(false);

  const exportToPDF = async (
    sections: PDFSection[],
    options: PDFExportOptions = {}
  ) => {
    setIsExporting(true);

    try {
      // Lazy load jsPDF and jspdf-autotable
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

      // Crear documento PDF
      const doc = new jsPDF({
        orientation,
        unit: 'mm',
        format: 'a4'
      });

      let yPosition = 15;
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 15;
      const contentWidth = pageWidth - 2 * margin;

      // Función para verificar si necesitamos una nueva página
      const checkNewPage = (requiredSpace: number = 20) => {
        if (yPosition + requiredSpace > pageHeight - margin) {
          doc.addPage();
          yPosition = margin;
          return true;
        }
        return false;
      };

      // Header con información de la empresa (si se proporciona)
      if (companyInfo) {
        doc.setFontSize(10);
        doc.setTextColor(100, 100, 100);
        if (companyInfo.name) {
          doc.text(companyInfo.name, margin, yPosition);
          yPosition += 5;
        }
        if (companyInfo.address) {
          doc.text(companyInfo.address, margin, yPosition);
          yPosition += 5;
        }
        if (companyInfo.phone) {
          doc.text(companyInfo.phone, margin, yPosition);
          yPosition += 5;
        }
        yPosition += 5;
      }

      // Título principal
      doc.setFontSize(18);
      doc.setTextColor(0, 0, 0);
      doc.text(title, pageWidth / 2, yPosition, { align: 'center' });
      yPosition += 8;

      // Subtítulo
      if (subtitle) {
        doc.setFontSize(12);
        doc.setTextColor(100, 100, 100);
        doc.text(subtitle, pageWidth / 2, yPosition, { align: 'center' });
        yPosition += 6;
      }

      // Fecha
      if (includeDate) {
        doc.setFontSize(10);
        doc.setTextColor(150, 150, 150);
        doc.text(
          `Generado: ${new Date().toLocaleString('es-CL')}`,
          pageWidth / 2,
          yPosition,
          { align: 'center' }
        );
        yPosition += 10;
      }

      // Línea separadora
      doc.setDrawColor(200, 200, 200);
      doc.line(margin, yPosition, pageWidth - margin, yPosition);
      yPosition += 8;

      // Procesar cada sección
      for (const section of sections) {
        checkNewPage(30);

        // Título de sección
        if (section.title) {
          doc.setFontSize(14);
          doc.setTextColor(0, 0, 0);
          doc.text(section.title, margin, yPosition);
          yPosition += 8;
        }

        // Procesar según tipo de sección
        switch (section.type) {
          case 'kpis':
            if (section.kpis && section.kpis.length > 0) {
              const kpisPerRow = Math.min(4, section.kpis.length);
              const kpiWidth = contentWidth / kpisPerRow;
              let xPosition = margin;

              section.kpis.forEach((kpi, index) => {
                if (index > 0 && index % kpisPerRow === 0) {
                  yPosition += 20;
                  xPosition = margin;
                  checkNewPage();
                }

                // Box para KPI
                doc.setFillColor(245, 247, 250);
                doc.rect(xPosition + 2, yPosition, kpiWidth - 4, 15, 'F');

                // Label
                doc.setFontSize(9);
                doc.setTextColor(100, 100, 100);
                doc.text(kpi.label, xPosition + kpiWidth / 2, yPosition + 5, {
                  align: 'center'
                });

                // Value
                doc.setFontSize(12);
                doc.setTextColor(0, 0, 0);
                doc.text(
                  String(kpi.value),
                  xPosition + kpiWidth / 2,
                  yPosition + 12,
                  { align: 'center' }
                );

                xPosition += kpiWidth;
              });

              yPosition += 20;
            }
            break;

          case 'table':
            if (section.data && section.columns) {
              const tableData = section.data.map((row: any) => {
                return section.columns!.map(col => {
                  const value = row[col.key];
                  return col.formatter ? col.formatter(value) : String(value || '');
                });
              });

              const headers = section.columns.map(col => col.header);
              const columnStyles: any = {};

              section.columns.forEach((col, index) => {
                columnStyles[index] = {
                  halign: col.align || 'left',
                  cellWidth: col.width || 'auto'
                };
              });

              (doc as any).autoTable({
                head: [headers],
                body: tableData,
                startY: yPosition,
                margin: { left: margin, right: margin },
                styles: {
                  fontSize: 8,
                  cellPadding: 2
                },
                headStyles: {
                  fillColor: [59, 130, 246],
                  textColor: 255,
                  fontSize: 9,
                  fontStyle: 'bold'
                },
                alternateRowStyles: {
                  fillColor: [248, 250, 252]
                },
                columnStyles,
                didDrawPage: (data: any) => {
                  yPosition = data.cursor.y;
                }
              });

              yPosition = (doc as any).lastAutoTable.finalY + 8;
            }
            break;

          case 'text':
            if (section.text) {
              doc.setFontSize(10);
              doc.setTextColor(60, 60, 60);
              const lines = doc.splitTextToSize(section.text, contentWidth);
              doc.text(lines, margin, yPosition);
              yPosition += lines.length * 5 + 5;
            }
            break;

          case 'chart':
            // Para gráficos, dejar espacio y un placeholder
            checkNewPage(50);
            doc.setFillColor(240, 240, 240);
            doc.rect(margin, yPosition, contentWidth, 40, 'F');
            doc.setFontSize(10);
            doc.setTextColor(150, 150, 150);
            doc.text(
              'Gráfico: Ver versión digital para visualización interactiva',
              pageWidth / 2,
              yPosition + 20,
              { align: 'center' }
            );
            yPosition += 45;
            break;
        }

        yPosition += 5;
      }

      // Footer en todas las páginas
      const pageCount = (doc as any).internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.text(
          `Página ${i} de ${pageCount}`,
          pageWidth / 2,
          pageHeight - 10,
          { align: 'center' }
        );
      }

      // Guardar PDF
      const timestamp = new Date().toISOString().split('T')[0];
      doc.save(`${filename}_${timestamp}.pdf`);

      toast.success('PDF generado exitosamente', {
        description: `Archivo: ${filename}_${timestamp}.pdf`,
        duration: 4000
      });
    } catch (error) {
      console.error('Error al generar PDF:', error);
      toast.error('Error al generar el PDF', {
        description: 'Inténtalo de nuevo en unos momentos'
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

