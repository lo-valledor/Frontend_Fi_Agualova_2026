import type { ExportColumn } from '~/hooks/shared/use-export-data';
import { useExportData } from '~/hooks/shared/use-export-data';
import type { GetMedidores } from '~/types/administracion';

export function useExportMedidores() {
  const { isExporting, exportData } = useExportData<GetMedidores>();

  // Definir las columnas para exportación de medidores
  const medidorColumns: ExportColumn[] = [
    {
      key: 'numeroMedidor',
      header: 'Número Medidor'
    },
    {
      key: 'marca',
      header: 'Marca'
    },
    {
      key: 'modelo',
      header: 'Modelo'
    },
    {
      key: 'tipoMedidor',
      header: 'Tipo Medidor'
    },
    {
      key: 'fechaInstalacion',
      header: 'Fecha Instalación',
      formatter: (value: string) => {
        if (!value) return '';
        return new Date(value).toLocaleDateString('es-CL');
      }
    },
    {
      key: 'estado',
      header: 'Estado'
    },
    {
      key: 'ubicacion',
      header: 'Ubicación'
    },
    {
      key: 'lecturaInicial',
      header: 'Lectura Inicial'
    },
    {
      key: 'observaciones',
      header: 'Observaciones'
    }
  ];

  // Función para exportar medidores
  const exportMedidores = async (
    data: GetMedidores[],
    format: 'csv' | 'xlsx' = 'xlsx',
    filename: string = 'medidores'
  ) => {
    await exportData(data, medidorColumns, {
      format,
      filename,
      includeHeaders: true
    });
  };

  return {
    isExporting,
    exportMedidores,
    medidorColumns
  };
}
