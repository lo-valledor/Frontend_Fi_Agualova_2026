import type { ExportColumn } from '~/hooks/shared/use-export-data';
import { useExportData } from '~/hooks/shared/use-export-data';
import type { GetContratos } from '~/types/administracion';

export function useExportContratos() {
  const { isExporting, exportData, formatDateForExport } =
    useExportData<GetContratos>();

  // Definir las columnas para exportación de contratos
  const contractColumns: ExportColumn[] = [
    {
      key: 'codigoContrato',
      header: 'Código Contrato'
    },
    {
      key: 'acometida',
      header: 'Acometida'
    },
    {
      key: 'tipoContrato',
      header: 'Tipo Contrato'
    },
    {
      key: 'tarifa',
      header: 'Tarifa'
    },
    {
      key: 'nombrePropietario',
      header: 'Propietario'
    },
    {
      key: 'nombreCliente',
      header: 'Cliente'
    },
    {
      key: 'local',
      header: 'Local'
    },
    {
      key: 'fechaInicio',
      header: 'Fecha Inicio',
      formatter: (value: string | null | undefined) =>
        formatDateForExport(value)
    },
    {
      key: 'activo',
      header: 'Estado',
      formatter: (value: boolean) => (value ? 'Activo' : 'Inactivo')
    },
    {
      key: 'fechaTermino',
      header: 'Fecha Término',
      formatter: (value: string | null | undefined) =>
        formatDateForExport(value)
    },
    {
      key: 'comunaEnvio',
      header: 'Comuna Envío'
    },
    {
      key: 'direccionEnvio',
      header: 'Dirección Envío'
    },
    {
      key: 'limiteInvierno',
      header: 'Límite Invierno'
    },
    {
      key: 'promedioAnual',
      header: 'Promedio Anual'
    },
    {
      key: 'cicloFacturacion',
      header: 'Ciclo Facturación'
    },
    {
      key: 'potenciaContratada',
      header: 'Potencia Contratada'
    },
    {
      key: 'liberadoCorte',
      header: 'Liberado Corte',
      formatter: (value: boolean) => (value ? 'Sí' : 'No')
    }
  ];

  // Función para exportar todos los contratos
  const exportAllContratos = async (
    allData: GetContratos[],
    format: 'csv' | 'xlsx' = 'xlsx'
  ) => {
    await exportData(allData, contractColumns, {
      format,
      filename: 'contratos_completos',
      includeHeaders: true
    });
  };

  // Función para exportar contratos filtrados
  const exportFilteredContratos = async (
    filteredData: GetContratos[],
    format: 'csv' | 'xlsx' = 'xlsx'
  ) => {
    await exportData(filteredData, contractColumns, {
      format,
      filename: 'contratos_filtrados',
      includeHeaders: true
    });
  };

  return {
    isExporting,
    exportAllContratos,
    exportFilteredContratos,
    contractColumns
  };
}
