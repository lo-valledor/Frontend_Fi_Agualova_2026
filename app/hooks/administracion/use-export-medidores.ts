import { useExportData } from '~/hooks/shared/use-export-data';
import type { GetMedidores } from '~/types/administracion';
import { ExportColumnBuilder, getExportConfig } from './utils/export-utilities';

/**
 * Hook para exportar medidores a CSV o XLSX
 * Utiliza builder pattern para definir columnas de forma fluida
 *
 * @returns {Object} Hook con función de exportación y columnas
 *
 * @example
 * const { exportMedidores, isExporting } = useExportMedidores();
 *
 * // Exportar datos
 * await exportMedidores(medidores, 'xlsx', 'medidores-2024');
 */
export function useExportMedidores() {
  const { isExporting, exportData } = useExportData<GetMedidores>();

  /**
   * Columnas de exportación usando builder pattern
   * Reduce boilerplate y mejora legibilidad
   */
  const medidorColumns = new ExportColumnBuilder()
    .addString('numeroMedidor', 'Número Medidor')
    .addString('marca', 'Marca')
    .addString('modelo', 'Modelo')
    .addString('tipoMedidor', 'Tipo Medidor')
    .addDate('fechaInstalacion', 'Fecha Instalación')
    .addString('estado', 'Estado')
    .addString('ubicacion', 'Ubicación')
    .addString('lecturaInicial', 'Lectura Inicial')
    .addString('observaciones', 'Observaciones')
    .build();

  /**
   * Exporta medidores a archivo
   * Aplicar early return para validaciones futuras
   *
   * @param data - Array de medidores a exportar
   * @param format - Formato de exportación ('xlsx' o 'csv')
   * @param filename - Nombre del archivo (sin extensión)
   *
   * @example
   * await exportMedidores(medidores, 'xlsx', 'mis-medidores');
   */
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
