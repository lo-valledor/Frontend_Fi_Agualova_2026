/**
 * PDF Rendering Utilities
 *
 * Helper functions for rendering different section types in PDF documents.
 * Provides consistent styling and layout for company info, headers, KPIs, tables, text, and charts.
 */

import type { PDFSection, PDFTableColumn } from '../use-export-pdf';

/**
 * Renders company information at the top of the PDF
 *
 * @param doc - jsPDF document instance
 * @param companyInfo - Company details (name, address, phone)
 * @param margin - Left/right margin in mm
 * @param yPosition - Current Y position
 * @returns Updated Y position after rendering
 */
export function renderCompanyInfo(
  doc: any,
  companyInfo: { name?: string; address?: string; phone?: string },
  margin: number,
  yPosition: number
): number {
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
}

/**
 * Renders PDF title, subtitle, and optional date
 *
 * @param doc - jsPDF document instance
 * @param options - Header configuration
 * @param pageWidth - PDF page width
 * @param yPosition - Current Y position
 * @returns Updated Y position after rendering
 */
export function renderHeader(
  doc: any,
  options: { title?: string; subtitle?: string; includeDate?: boolean },
  pageWidth: number,
  yPosition: number
): number {
  let currentY = yPosition;
  const { title, subtitle, includeDate } = options;

  doc.setFontSize(18);
  doc.setTextColor(0, 0, 0);
  doc.text(title || 'Reporte', pageWidth / 2, currentY, { align: 'center' });
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
}

/**
 * Renders KPI section with grid layout
 *
 * @param doc - jsPDF document instance
 * @param kpis - Array of KPI objects with label and value
 * @param margin - Left/right margin in mm
 * @param contentWidth - Available content width
 * @param yPosition - Current Y position
 * @param checkNewPage - Callback to handle page breaks
 * @returns Updated Y position after rendering
 */
export function renderKPISection(
  doc: any,
  kpis: Array<{ label: string; value: string | number }>,
  margin: number,
  contentWidth: number,
  yPosition: number,
  checkNewPage: (requiredSpace: number) => boolean
): number {
  let currentY = yPosition;
  const kpisPerRow = Math.min(4, kpis.length);
  const kpiWidth = contentWidth / kpisPerRow;
  let xPosition = margin;

  for (let index = 0; index < kpis.length; index++) {
    const kpi = kpis[index];

    if (index > 0 && index % kpisPerRow === 0) {
      currentY += 20;
      xPosition = margin;
      checkNewPage(20);
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
}

/**
 * Renders table section with autoTable styling
 *
 * @param doc - jsPDF document instance
 * @param section - PDF section with table data and columns
 * @param margin - Left/right margin in mm
 * @param yPosition - Current Y position
 * @returns Updated Y position after rendering
 */
export function renderTableSection(
  doc: any,
  section: PDFSection,
  margin: number,
  yPosition: number
): number {
  if (!section.data || !section.columns) return yPosition;

  const tableData = section.data.map((row: any) => {
    return section.columns!.map(col => {
      const value = row[col.key];
      return col.formatter ? col.formatter(value) : String(value || '');
    });
  });

  const headers = section.columns.map(col => col.header);
  const columnStyles: Record<number, any> = {};

  for (const [index, col] of section.columns.entries()) {
    columnStyles[index] = {
      halign: col.align || 'left',
      cellWidth: col.width || 'auto'
    };
  }

  doc.autoTable({
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

  return doc.lastAutoTable.finalY + 8;
}

/**
 * Renders text section with word wrapping
 *
 * @param doc - jsPDF document instance
 * @param text - Text content to render
 * @param margin - Left/right margin in mm
 * @param contentWidth - Available content width
 * @param yPosition - Current Y position
 * @returns Updated Y position after rendering
 */
export function renderTextSection(
  doc: any,
  text: string,
  margin: number,
  contentWidth: number,
  yPosition: number
): number {
  if (!text) return yPosition;

  doc.setFontSize(10);
  doc.setTextColor(60, 60, 60);
  const lines = doc.splitTextToSize(text, contentWidth);
  doc.text(lines, margin, yPosition);

  return yPosition + lines.length * 5 + 5;
}

/**
 * Renders placeholder for chart section
 * Actual chart visualization requires digital version
 *
 * @param doc - jsPDF document instance
 * @param pageWidth - PDF page width
 * @param margin - Left/right margin in mm
 * @param contentWidth - Available content width
 * @param yPosition - Current Y position
 * @param checkNewPage - Callback to handle page breaks
 * @returns Updated Y position after rendering
 */
export function renderChartSection(
  doc: any,
  pageWidth: number,
  margin: number,
  contentWidth: number,
  yPosition: number,
  checkNewPage: (requiredSpace: number) => boolean
): number {
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
}

/**
 * Dispatcher function to render appropriate section type
 *
 * @param doc - jsPDF document instance
 * @param section - PDF section to render
 * @param config - Rendering configuration (margins, widths, callbacks)
 * @param yPosition - Current Y position
 * @returns Updated Y position after rendering
 */
export function renderSection(
  doc: any,
  section: PDFSection,
  config: {
    margin: number;
    contentWidth: number;
    pageWidth: number;
    checkNewPage: (requiredSpace: number) => boolean;
  },
  yPosition: number
): number {
  let currentY = yPosition;
  const { margin, contentWidth, pageWidth, checkNewPage } = config;

  // Check if space is needed for section title
  if (section.title) {
    checkNewPage(30);
  }

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
}

/**
 * Adds page numbers to all pages in the PDF
 *
 * @param doc - jsPDF document instance
 * @param pageWidth - PDF page width
 * @param pageHeight - PDF page height
 */
export function addPageFooters(doc: any, pageWidth: number, pageHeight: number): void {
  const pageCount = doc.internal.getNumberOfPages();

  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(`Página ${i} de ${pageCount}`, pageWidth / 2, pageHeight - 10, { align: 'center' });
  }
}
