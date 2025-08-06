import type { ExportColumn } from '~/hooks/shared/use-export-data';
import { useExportData } from '~/hooks/shared/use-export-data';
import type { Acometida } from '~/types/administracion';

export function useExportAcometidas() {
  const { isExporting, exportData } = useExportData<Acometida>();

  // Definir las columnas para exportación de acometidas
  const acometidaColumns: ExportColumn[] = [
    {
      key: 'numeroAcometida',
      header: 'Número Acometida',
    },
    {
      key: 'cliente',
      header: 'Cliente',
    },
    {
      key: 'direccion',
      header: 'Dirección',
    },
    {
      key: 'comuna',
      header: 'Comuna',
    },
    {
      key: 'tipoAcometida',
      header: 'Tipo Acometida',
    },
    {
      key: 'fechaInstalacion',
      header: 'Fecha Instalación',
      formatter: (value: string) => {
        if (!value) return '';
        return new Date(value).toLocaleDateString('es-CL');
      },
    },
    {
      key: 'estado',
      header: 'Estado',
    },
    {
      key: 'diametro',
      header: 'Diámetro',
    },
    {
      key: 'material',
      header: 'Material',
    },
    {
      key: 'presion',
      header: 'Presión',
    },
    {
      key: 'observaciones',
      header: 'Observaciones',
    },
  ];

  // Función para exportar acometidas
  const exportAcometidas = async (
    data: Acometida[],
    format: 'csv' | 'xlsx' = 'xlsx',
    filename: string = 'acometidas'
  ) => {
    await exportData(
      data,
      acometidaColumns,
      {
        format,
        filename,
        includeHeaders: true,
      }
    );
  };

  return {
    isExporting,
    exportAcometidas,
    acometidaColumns,
  };
}