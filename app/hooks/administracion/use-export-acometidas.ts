import { useExportData } from '~/hooks/shared/use-export-data';
import type { Acometida } from '~/types/administracion';
import { ExportColumnBuilder, getExportConfig } from './utils/export-utilities';

/**
 * Hook para exportar acometidas a CSV o XLSX
 * Utiliza builder pattern para definir columnas de forma fluida
 *
 * @returns {Object} Hook con función de exportación y columnas
 *
 * @example
 * const { exportAcometidas, isExporting } = useExportAcometidas();
 *
 * // Exportar datos
 * await exportAcometidas(acometidas, 'xlsx', 'acometidas-2024');
 */
export function useExportAcometidas() {
  const { isExporting, exportData } = useExportData<Acometida>();

  /**
   * Columnas de exportación usando builder pattern
   * Reduce boilerplate y mejora legibilidad
   */
  const acometidaColumns = new ExportColumnBuilder()
    .addString('acometidaId', 'ID')
    .addString('codigo', 'Código')
    .addString('ubicacion', 'Ubicación')
    .addString('contratoId', 'Contrato')
    .addString('sectorDescripcion', 'Sector')
    .addString('empalmeDescripcion', 'Empalme')
    .addString('nichoDescripcion', 'Nicho')
    .addString('limitePotencia', 'Límite Potencia (kW)')
    .addString('numeroMedidor', 'Medidor Asignado')
    .build();

  /**
   * Exporta acometidas a archivo
   * Aplicar early return para validaciones futuras
   *
   * @param data - Array de acometidas a exportar
   * @param format - Formato de exportación ('xlsx' o 'csv')
   * @param filename - Nombre del archivo (sin extensión)
   *
   * @example
   * await exportAcometidas(acometidas, 'xlsx', 'mis-acometidas');
   */
  const exportAcometidas = async (
    data: Acometida[],
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
