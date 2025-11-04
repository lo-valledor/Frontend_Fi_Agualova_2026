import { toast } from 'sonner';

import { useState } from 'react';

import type { GetContratos } from '~/types/administracion';

interface ExportOptions {
  format: 'csv' | 'xlsx' | 'pdf';
  includeHeaders: boolean;
  filename?: string;
}

export function useExportContratos() {
  const [isExporting, setIsExporting] = useState(false);

  // Función para formatear fecha para CSV/Excel
  const formatDateForExport = (
    dateString: string | null | undefined
  ): string => {
    if (!dateString) return '';

    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return dateString || '';

      return date.toLocaleDateString('es-CL', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch {
      return dateString || '';
    }
  };

  // Función para convertir datos a formato CSV
  const convertToCSV = (
    data: GetContratos[],
    includeHeaders: boolean = true
  ): string => {
    const headers = [
      'Código Contrato',
      'Acometida',
      'Tipo Contrato',
      'Tarifa',
      'Propietario',
      'Cliente',
      'Local',
      'Fecha Inicio',
      'Estado',
      'Fecha Término',
      'Comuna Envío',
      'Dirección Envío',
      'Límite Invierno',
      'Promedio Anual',
      'Ciclo Facturación',
      'Potencia Contratada',
      'Liberado Corte'
    ];

    const csvContent = [];

    if (includeHeaders) {
      csvContent.push(headers.join(','));
    }

    data.forEach(contrato => {
      const row = [
        `"${contrato.codigoContrato || ''}"`,
        `"${contrato.acometida || ''}"`,
        `"${contrato.tipoContrato || ''}"`,
        `"${contrato.tarifa || ''}"`,
        `"${contrato.nombrePropietario || ''}"`,
        `"${contrato.nombreCliente || ''}"`,
        `"${contrato.local || ''}"`,
        `"${formatDateForExport(contrato.fechaInicio)}"`,
        `"${contrato.activo ? 'Activo' : 'Inactivo'}"`,
        `"${formatDateForExport(contrato.fechaTermino)}"`,
        `"${contrato.comunaEnvio || ''}"`,
        `"${contrato.direccionEnvio || ''}"`,
        `"${contrato.limiteInvierno || ''}"`,
        `"${contrato.promedioAnual || ''}"`,
        `"${contrato.cicloFacturacion || ''}"`,
        `"${contrato.potenciaContratada || ''}"`,
        `"${contrato.liberadoCorte ? 'Sí' : 'No'}"`
      ];
      csvContent.push(row.join(','));
    });

    return csvContent.join('\n');
  };

  // Función para descargar archivo CSV
  const downloadCSV = (
    data: GetContratos[],
    filename: string = 'contratos',
    includeHeaders: boolean = true
  ) => {
    const csvContent = convertToCSV(data, includeHeaders);
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

  // Función para exportar datos en formato Excel (usando CSV con UTF-8 BOM)
  const downloadExcel = (
    data: GetContratos[],
    filename: string = 'contratos',
    includeHeaders: boolean = true
  ) => {
    const csvContent = convertToCSV(data, includeHeaders);
    const blob = new Blob(['\uFEFF' + csvContent], {
      type: 'application/vnd.ms-excel;charset=utf-8;'
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
    data: GetContratos[],
    options: ExportOptions,
    isFiltered: boolean = false
  ) => {
    if (!data || data.length === 0) {
      toast.error('No hay datos para exportar');
      return;
    }

    setIsExporting(true);

    try {
      const baseFilename =
        options.filename ||
        (isFiltered ? 'contratos_filtrados' : 'contratos_completos');

      toast.info(`Preparando exportación de ${data.length} contratos...`);

      // Simular un pequeño delay para mostrar el estado de carga
      await new Promise(resolve => setTimeout(resolve, 500));

      switch (options.format) {
        case 'csv':
          downloadCSV(data, baseFilename, options.includeHeaders);
          break;
        case 'xlsx':
          downloadExcel(data, baseFilename, options.includeHeaders);
          break;
        case 'pdf':
          toast.error('Exportación a PDF no implementada aún', {
            description: 'Usa CSV o Excel por el momento'
          });
          return;
        default:
          downloadCSV(data, baseFilename, options.includeHeaders);
      }

      toast.success(`✅ ${data.length} contratos exportados exitosamente`, {
        description: `Archivo: ${baseFilename}_${new Date().toISOString().split('T')[0]}.${options.format}`,
        duration: 4000
      });
    } catch (error) {
      toast.error('Error al exportar los datos', {
        description: 'Inténtalo de nuevo en unos momentos'
      });
    } finally {
      setIsExporting(false);
    }
  };

  // Función para exportar todos los contratos
  const exportAllContratos = async (
    allData: GetContratos[],
    format: 'csv' | 'xlsx' = 'csv'
  ) => {
    await exportData(
      allData,
      {
        format,
        includeHeaders: true,
        filename: 'contratos_completos'
      },
      false
    );
  };

  // Función para exportar contratos filtrados
  const exportFilteredContratos = async (
    filteredData: GetContratos[],
    format: 'csv' | 'xlsx' = 'csv'
  ) => {
    await exportData(
      filteredData,
      {
        format,
        includeHeaders: true,
        filename: 'contratos_filtrados'
      },
      true
    );
  };

  return {
    isExporting,
    exportAllContratos,
    exportFilteredContratos,
    exportData
  };
}
