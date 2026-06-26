import { useExportData } from '~/hooks/shared/use-export-data';
import type { ContratosRow } from '~/types/administracion';
import { ExportColumnBuilder, getExportConfig } from './utils/export-utilities';

export function useExportContratos() {
  const { isExporting, exportData } = useExportData<ContratosRow>();

  const contractColumns = new ExportColumnBuilder()
    .addString('id', 'ID')
    .addString('codigo', 'Código')
    .addString('descripcion', 'Descripción')
    .addString('estado', 'Estado')
    .build();

  const exportAllContratos = async (
    allData: ContratosRow[],
    format: 'csv' | 'xlsx' = 'xlsx'
  ): Promise<void> => {
    // Early return si no hay datos
    if (!allData || allData.length === 0) {
      return;
    }

    const config = getExportConfig({
      format,
      filename: 'contratos_completos'
    });

    await exportData(allData, contractColumns, config);
  };

  const exportFilteredContratos = async (
    filteredData: ContratosRow[],
    format: 'csv' | 'xlsx' = 'xlsx'
  ): Promise<void> => {
    // Early return si no hay datos
    if (!filteredData || filteredData.length === 0) {
      return;
    }

    const config = getExportConfig({
      format,
      filename: 'contratos_filtrados'
    });

    await exportData(filteredData, contractColumns, config);
  };

  return {
    isExporting,
    exportAllContratos,
    exportFilteredContratos,
    contractColumns
  };
}
