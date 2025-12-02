import { useExportData } from '~/hooks/shared/use-export-data';
import type { GetClientes } from '~/types/administracion';
import { ExportColumnBuilder, getExportConfig } from './utils/export-utilities';

/**
 * Hook para exportar clientes a CSV o XLSX
 * Utiliza builder pattern para definir columnas de forma fluida
 *
 * @returns {Object} Hook con función de exportación y columnas
 *
 * @example
 * const { exportClientes, isExporting } = useExportClientes();
 *
 * // Exportar datos
 * await exportClientes(clientes, 'xlsx', 'clientes-2024');
 */
export function useExportClientes() {
  const { isExporting, exportData } = useExportData<GetClientes>();

  /**
   * Columnas de exportación usando builder pattern
   * Reduce boilerplate y mejora legibilidad
   */
  const clientColumns = new ExportColumnBuilder()
    .addString('rut', 'RUT')
    .addString('nombreCompleto', 'Nombre Completo')
    .addBoolean('esEmpresa', 'Tipo', 'Empresa', 'Persona')
    .addString('direccion', 'Dirección')
    .addString('comuna', 'Comuna')
    .addString('contacto', 'Contacto')
    .addString('telefono', 'Teléfono')
    .addString('email', 'Email')
    .addString('codigoComuna', 'Código Comuna')
    .build();

  /**
   * Exporta clientes a archivo
   * Aplicar early return para validaciones futuras
   *
   * @param data - Array de clientes a exportar
   * @param format - Formato de exportación ('xlsx' o 'csv')
   * @param filename - Nombre del archivo (sin extensión)
   *
   * @example
   * await exportClientes(clientes, 'xlsx', 'mis-clientes');
   */
  const exportClientes = async (
    data: GetClientes[],
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
