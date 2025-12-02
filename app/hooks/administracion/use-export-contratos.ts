import { useExportData } from '~/hooks/shared/use-export-data';
import type { GetContratos } from '~/types/administracion';
import { ExportColumnBuilder, getExportConfig } from './utils/export-utilities';

/**
 * Hook para exportar contratos a CSV o XLSX
 * Utiliza builder pattern para definir columnas de forma fluida
 *
 * @returns {Object} Hook con funciones de exportación y columnas
 *
 * @example
 * const { exportAllContratos, exportFilteredContratos, isExporting } = useExportContratos();
 *
 * // Exportar todos los contratos
 * await exportAllContratos(contratos, 'xlsx');
 *
 * // Exportar contratos filtrados
 * await exportFilteredContratos(filteredContratos, 'csv');
 */
export function useExportContratos() {
  const { isExporting, exportData } = useExportData<GetContratos>();

  /**
   * Columnas de exportación usando builder pattern
   * Reduce boilerplate y mejora legibilidad
   */
  const contractColumns = new ExportColumnBuilder()
    .addString('codigoContrato', 'Código Contrato')
    .addString('acometida', 'Acometida')
    .addString('tipoContrato', 'Tipo Contrato')
    .addString('tarifa', 'Tarifa')
    .addString('nombrePropietario', 'Propietario')
    .addString('nombreCliente', 'Cliente')
    .addString('local', 'Local')
    .addDate('fechaInicio', 'Fecha Inicio')
    .addBoolean('activo', 'Estado', 'Activo', 'Inactivo')
    .addDate('fechaTermino', 'Fecha Término')
    .addString('comunaEnvio', 'Comuna Envío')
    .addString('direccionEnvio', 'Dirección Envío')
    .addString('limiteInvierno', 'Límite Invierno')
    .addString('promedioAnual', 'Promedio Anual')
    .addString('cicloFacturacion', 'Ciclo Facturación')
    .addString('potenciaContratada', 'Potencia Contratada')
    .addBoolean('liberadoCorte', 'Liberado Corte', 'Sí', 'No')
    .build();

  /**
   * Exporta todos los contratos a archivo
   * Early return para validaciones futuras
   *
   * @param allData - Array de todos los contratos
   * @param format - Formato de exportación ('xlsx' o 'csv')
   *
   * @example
   * await exportAllContratos(contratos, 'xlsx');
   */
  const exportAllContratos = async (
    allData: GetContratos[],
    format: 'csv' | 'xlsx' = 'xlsx'
  ): Promise<void> => {
    // Early return si no hay datos
    if (!allData || allData.length === 0) {
      return;
    }

    const config = getExportConfig({
      format,
      filename: 'contratos_completos'
    });

    await exportData(allData, contractColumns, config);
  };

  /**
   * Exporta contratos filtrados a archivo
   * Early return para validaciones futuras
   *
   * @param filteredData - Array de contratos filtrados
   * @param format - Formato de exportación ('xlsx' o 'csv')
   *
   * @example
   * await exportFilteredContratos(filteredContratos, 'xlsx');
   */
  const exportFilteredContratos = async (
    filteredData: GetContratos[],
    format: 'csv' | 'xlsx' = 'xlsx'
  ): Promise<void> => {
    // Early return si no hay datos
    if (!filteredData || filteredData.length === 0) {
      return;
    }

    const config = getExportConfig({
      format,
      filename: 'contratos_filtrados'
    });

    await exportData(filteredData, contractColumns, config);
  };

  return {
    isExporting,
    exportAllContratos,
    exportFilteredContratos,
    contractColumns
  };
}
