import { useExportData } from '~/hooks/shared/use-export-data';
import type { ClientesRow } from '~/types/administracion';
import { ExportColumnBuilder, getExportConfig } from './utils/export-utilities';

export function useExportClientes() {
  const { isExporting, exportData } = useExportData<ClientesRow>();

  const clientColumns = new ExportColumnBuilder()
    .addString('rut', 'RUT')
    .addString('razonSocialNombre', 'Nombre Completo')
    .addBoolean('esEmpresa', 'Tipo', 'Empresa', 'Persona')
    .addString('direccion', 'Dirección')
    .addString('comuna', 'Comuna')
    .addString('contacto', 'Contacto')
    .addString('telefono', 'Teléfono')
    .addString('email', 'Email')
    .addString('codigoComuna', 'Código Comuna')
    .build();

  const exportClientes = async (
    data: ClientesRow[],
    format: 'csv' | 'xlsx' = 'xlsx',
    filename: string = 'clientes'
  ): Promise<void> => {
    // Early return si no hay datos
    if (!data || data.length === 0) {
      return;
    }

    const config = getExportConfig({ format, filename });

    await exportData(data, clientColumns, config);
  };

  return {
    isExporting,
    exportClientes,
    clientColumns
  };
}
