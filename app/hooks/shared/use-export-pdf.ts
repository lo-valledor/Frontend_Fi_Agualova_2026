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

  const renderCompanyInfo = (doc: any, companyInfo: any, margin: number, yPosition: number) => {
    let currentY = yPosition;
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    if (companyInfo.name) {
      doc.text(companyInfo.name, margin, currentY);
      currentY += 5;
    }
    if (companyInfo.address) {
      doc.text(companyInfo.address, margin, currentY);
      currentY += 5;
    }
    if (companyInfo.phone) {
      doc.text(companyInfo.phone, margin, currentY);
      currentY += 5;
    }
    return currentY + 5;
  };

  const renderHeader = (doc: any, options: any, pageWidth: number, yPosition: number) => {
    let currentY = yPosition;
    const { title, subtitle, includeDate } = options;

    doc.setFontSize(18);
    doc.setTextColor(0, 0, 0);
    doc.text(title, pageWidth / 2, currentY, { align: 'center' });
    currentY += 8;

    if (subtitle) {
      doc.setFontSize(12);
      doc.setTextColor(100, 100, 100);
      doc.text(subtitle, pageWidth / 2, currentY, { align: 'center' });
      currentY += 6;
    }

    if (includeDate) {
      doc.setFontSize(10);
      doc.setTextColor(150, 150, 150);
      doc.text(
        `Generado: ${new Date().toLocaleString('es-CL')}`,
        pageWidth / 2,
        currentY,
        { align: 'center' }
      );
      currentY += 10;
    }

    return currentY;
  };

  const renderKPISection = (doc: any, kpis: any[], margin: number, contentWidth: number, yPosition: number, checkNewPage: any) => {
    let currentY = yPosition;
    const kpisPerRow = Math.min(4, kpis.length);
    const kpiWidth = contentWidth / kpisPerRow;
    let xPosition = margin;

    for (let index = 0; index < kpis.length; index++) {
      const kpi = kpis[index];
      if (index > 0 && index % kpisPerRow === 0) {
        currentY += 20;
        xPosition = margin;
        checkNewPage();
      }

      doc.setFillColor(245, 247, 250);
      doc.rect(xPosition + 2, currentY, kpiWidth - 4, 15, 'F');

      doc.setFontSize(9);
      doc.setTextColor(100, 100, 100);
      doc.text(kpi.label, xPosition + kpiWidth / 2, currentY + 5, { align: 'center' });

      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      doc.text(String(kpi.value), xPosition + kpiWidth / 2, currentY + 12, { align: 'center' });

      xPosition += kpiWidth;
    }

    return currentY + 20;
  };

  const renderTableSection = (doc: any, section: PDFSection, margin: number, yPosition: number) => {
    const tableData = section.data!.map((row: any) => {
      return section.columns!.map(col => {
        const value = row[col.key];
        return col.formatter ? col.formatter(value) : String(value || '');
      });
    });

    const headers = section.columns!.map(col => col.header);
    const columnStyles: any = {};

    for (const [index, col] of section.columns!.entries()) {
      columnStyles[index] = {
        halign: col.align || 'left',
        cellWidth: col.width || 'auto'
      };
    }

    (doc).autoTable({
      head: [headers],
      body: tableData,
      startY: yPosition,
      margin: { left: margin, right: margin },
      styles: { fontSize: 8, cellPadding: 2 },
      headStyles: {
        fillColor: [59, 130, 246],
        textColor: 255,
        fontSize: 9,
        fontStyle: 'bold'
      },
      alternateRowStyles: { fillColor: [248, 250, 252] },
      columnStyles
    });

    return (doc).lastAutoTable.finalY + 8;
  };

  const renderTextSection = (doc: any, text: string, margin: number, contentWidth: number, yPosition: number) => {
    doc.setFontSize(10);
    doc.setTextColor(60, 60, 60);
    const lines = doc.splitTextToSize(text, contentWidth);
    doc.text(lines, margin, yPosition);
    return yPosition + lines.length * 5 + 5;
  };

  const renderChartSection = (doc: any, pageWidth: number, margin: number, contentWidth: number, yPosition: number, checkNewPage: any) => {
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
    return yPosition + 45;
  };

  const renderSection = (doc: any, section: PDFSection, config: any, yPosition: number) => {
    let currentY = yPosition;
    const { margin, contentWidth, pageWidth, checkNewPage } = config;

    config.checkNewPage(30);

    if (section.title) {
      doc.setFontSize(14);
      doc.setTextColor(0, 0, 0);
      doc.text(section.title, margin, currentY);
      currentY += 8;
    }

    switch (section.type) {
      case 'kpis':
        if (section.kpis && section.kpis.length > 0) {
          currentY = renderKPISection(doc, section.kpis, margin, contentWidth, currentY, checkNewPage);
        }
        break;

      case 'table':
        if (section.data && section.columns) {
          currentY = renderTableSection(doc, section, margin, currentY);
        }
        break;

      case 'text':
        if (section.text) {
          currentY = renderTextSection(doc, section.text, margin, contentWidth, currentY);
        }
        break;

      case 'chart':
        currentY = renderChartSection(doc, pageWidth, margin, contentWidth, currentY, checkNewPage);
        break;
    }

    return currentY + 5;
  };

  const addPageFooters = (doc: any, pageWidth: number, pageHeight: number) => {
    const pageCount = (doc).internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text(`Página ${i} de ${pageCount}`, pageWidth / 2, pageHeight - 10, { align: 'center' });
    }
  };

  const exportToPDF = async (
    sections: PDFSection[],
    options: PDFExportOptions = {}
  ) => {
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

      const checkNewPage = (requiredSpace: number = 20) => {
        if (yPosition + requiredSpace > pageHeight - margin) {
          doc.addPage();
          yPosition = margin;
          return true;
        }
        return false;
      };

      if (companyInfo) {
        yPosition = renderCompanyInfo(doc, companyInfo, margin, yPosition);
      }

      yPosition = renderHeader(doc, { title, subtitle, includeDate }, pageWidth, yPosition);

      doc.setDrawColor(200, 200, 200);
      doc.line(margin, yPosition, pageWidth - margin, yPosition);
      yPosition += 8;

      const config = { margin, contentWidth, pageWidth, checkNewPage };

      for (const section of sections) {
        yPosition = renderSection(doc, section, config, yPosition);
      }

      addPageFooters(doc, pageWidth, pageHeight);

      const timestamp = new Date().toISOString().split('T')[0];
      doc.save(`${filename}_${timestamp}.pdf`);

      toast.success('PDF generado exitosamente', {
        description: `Archivo: ${filename}_${timestamp}.pdf`,
        duration: 4000
      });
    } catch (error) {
      toast.error('Error al generar el PDF. Inténtalo de nuevo más tarde', error as any);
    } finally {
      setIsExporting(false);
    }
  };

  return {
    isExporting,
    exportToPDF
  };
}
