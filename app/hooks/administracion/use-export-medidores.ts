import type { MedidorListItem } from '~/components/administracion/medidores/medidores-types';
import { useExportData } from '~/hooks/shared/use-export-data';

import { ExportColumnBuilder, getExportConfig } from './utils/export-utilities';

export function useExportMedidores() {
  const { isExporting, exportData } = useExportData<MedidorListItem>();

  const medidorColumns = new ExportColumnBuilder()
    .addString('idMedidor', 'Código')
    .addString('serie', 'Número de Serie')
    .addString('marca', 'Marca')
    .addString('tipo', 'Tipo')
    .addString('modelo', 'Modelo')
    .addDate('fechaInicio', 'Fecha Inicio')
    .addString('digitos', 'Dígitos')
    .addString('multiplicador', 'Multiplicador')
    .addString('ubicacion', 'Ubicación')
    .addString('estado', 'Estado')
    .addString('codigoAcometida', 'Código Acometida')
    .build();

  const exportMedidores = async (
    data: MedidorListItem[],
    format: 'csv' | 'xlsx' = 'xlsx',
    filename: string = 'medidores'
  ): Promise<void> => {
    if (!data || data.length === 0) {
      return;
    }

    const config = getExportConfig({ format, filename });

    await exportData(data, medidorColumns, config);
  };

  return {
    isExporting,
    exportMedidores,
    medidorColumns
  };
}
