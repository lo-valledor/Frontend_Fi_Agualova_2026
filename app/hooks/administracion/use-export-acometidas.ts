import { useExportData } from '~/hooks/shared/use-export-data';
import type { AcometidaRow } from '~/types/administracion';
import { ExportColumnBuilder, getExportConfig } from './utils/export-utilities';

export function useExportAcometidas() {
  const { isExporting, exportData } = useExportData<AcometidaRow>();

  const acometidaColumns = new ExportColumnBuilder()
    .addString('idAcometida', 'ID')
    .addString('codigo', 'Código')
    .addString('ubicacion', 'Ubicación')
    .addString('contratoId', 'Contrato')
    .addString('sector', 'Sector')
    .addString('empalme', 'Empalme')
    .addString('nicho', 'Nicho')
    .addString('limitePotencia', 'Límite Potencia (kW)')
    .addString('medidor', 'Medidor Asignado')
    .build();

  const exportAcometidas = async (
    data: AcometidaRow[],
    format: 'csv' | 'xlsx' = 'xlsx',
    filename: string = 'acometidas'
  ): Promise<void> => {
    // Early return si no hay datos
    if (!data || data.length === 0) {
      return;
    }

    const config = getExportConfig({ format, filename });

    await exportData(data, acometidaColumns, config);
  };

  return {
    isExporting,
    exportAcometidas,
    acometidaColumns
  };
}
