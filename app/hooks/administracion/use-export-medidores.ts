import { useExportData } from '~/hooks/shared/use-export-data';
import type { GetMedidores } from '~/types/administracion';
import { ExportColumnBuilder, getExportConfig } from './utils/export-utilities';


export function useExportMedidores() {
  const { isExporting, exportData } = useExportData<GetMedidores>();

  
  const medidorColumns = new ExportColumnBuilder()
    .addString('codigo', 'Código')
    .addString('serie', 'Número de Serie')
    .addString('marca', 'Marca')
    .addString('tipo', 'Tipo')
    .addString('modelo', 'Modelo')
    .addDate('fechaInicio', 'Fecha Inicio')
    .addString('digitos', 'Dígitos')
    .addString('multiplicar', 'Multiplicador')
    .addString('ubicacion', 'Ubicación')
    .addString('estado', 'Estado')
    .addString('codigoAcometida', 'Código Acometida')
    .build();

  
  const exportMedidores = async (
    data: GetMedidores[],
    format: 'csv' | 'xlsx' = 'xlsx',
    filename: string = 'medidores'
  ): Promise<void> => {
    // Early return si no hay datos
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
