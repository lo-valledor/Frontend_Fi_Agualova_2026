import type { ExportColumn } from '~/hooks/shared/use-export-data';
import { useExportData } from '~/hooks/shared/use-export-data';
import type { GetClientes } from '~/types/administracion';

export function useExportClientes() {
  const { isExporting, exportData } = useExportData<GetClientes>();

  // Definir las columnas para exportación de clientes
  const clientColumns: ExportColumn[] = [
    {
      key: 'rut',
      header: 'RUT'
    },
    {
      key: 'nombreCompleto',
      header: 'Nombre Completo'
    },
    {
      key: 'esEmpresa',
      header: 'Tipo',
      formatter: (value: boolean) => (value ? 'Empresa' : 'Persona')
    },
    {
      key: 'direccion',
      header: 'Dirección'
    },
    {
      key: 'comuna',
      header: 'Comuna'
    },
    {
      key: 'contacto',
      header: 'Contacto'
    },
    {
      key: 'telefono',
      header: 'Teléfono'
    },
    {
      key: 'email',
      header: 'Email'
    },
    {
      key: 'codigoComuna',
      header: 'Código Comuna'
    }
  ];

  // Función para exportar clientes
  const exportClientes = async (
    data: GetClientes[],
    format: 'csv' | 'xlsx' = 'xlsx',
    filename: string = 'clientes'
  ) => {
    await exportData(data, clientColumns, {
      format,
      filename,
      includeHeaders: true
    });
  };

  return {
    isExporting,
    exportClientes,
    clientColumns
  };
}
