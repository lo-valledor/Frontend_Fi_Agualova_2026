/**
 * Export Utilities - Funciones reutilizables para exportación
 * Reduce duplicación en hooks de exportación
 */

import type { ExportColumn } from '~/hooks/shared/use-export-data';

/**
 * Configuración de exportación
 */
export interface ExportConfig {
  format: 'csv' | 'xlsx';
  filename: string;
  includeHeaders: boolean;
}

/**
 * Builder para crear columnas de exportación de forma fluida
 * Implementa builder pattern para mejor legibilidad
 *
 * @example
 * const columns = new ExportColumnBuilder()
 *   .addString('numeroMedidor', 'Número Medidor')
 *   .addString('marca', 'Marca')
 *   .addDate('fechaInstalacion', 'Fecha Instalación')
 *   .build();
 */
export class ExportColumnBuilder {
  private columns: ExportColumn[] = [];

  /**
   * Agrega una columna de string simple
   */
  addString(key: string, header: string): this {
    this.columns.push({ key, header });
    return this;
  }

  /**
   * Agrega una columna de fecha con formato localizado
   */
  addDate(
    key: string,
    header: string,
    locale: string = 'es-CL'
  ): this {
    this.columns.push({
      key,
      header,
      formatter: (value: string | null | undefined) => {
        if (!value) return '';
        return new Date(value).toLocaleDateString(locale);
      }
    });
    return this;
  }

  /**
   * Agrega una columna booleana con textos personalizados
   */
  addBoolean(
    key: string,
    header: string,
    trueText: string = 'Sí',
    falseText: string = 'No'
  ): this {
    this.columns.push({
      key,
      header,
      formatter: (value: boolean | null | undefined) => {
        if (value === null || value === undefined) return '';
        return value ? trueText : falseText;
      }
    });
    return this;
  }

  /**
   * Agrega una columna con formatter personalizado
   */
  addCustom(
    key: string,
    header: string,
    formatter: (value: any) => string
  ): this {
    this.columns.push({
      key,
      header,
      formatter
    });
    return this;
  }

  /**
   * Agrega una columna con selector de propiedad anidada
   * @example
   * addNested('cliente.nombre', 'Cliente', item => item.cliente?.nombre)
   */
  addNested(
    key: string,
    header: string,
    extractor: (item: any) => any
  ): this {
    this.columns.push({
      key,
      header,
      formatter: (value: any) => {
        return String(value || '');
      }
    });
    return this;
  }

  /**
   * Retorna las columnas construidas
   */
  build(): ExportColumn[] {
    return this.columns;
  }
}

/**
 * Configuración por defecto para exportaciones
 */
export const DEFAULT_EXPORT_CONFIG: ExportConfig = {
  format: 'xlsx',
  filename: 'export',
  includeHeaders: true
};

/**
 * Obtiene configuración de exportación merged con defaults
 * Permite sobrescribir solo los valores necesarios
 *
 * @param partial - Configuración parcial
 * @returns Configuración completa
 *
 * @example
 * const config = getExportConfig({ filename: 'medidores' });
 * // Returns { format: 'xlsx', filename: 'medidores', includeHeaders: true }
 */
export function getExportConfig(
  partial?: Partial<ExportConfig>
): ExportConfig {
  return {
    ...DEFAULT_EXPORT_CONFIG,
    ...partial
  };
}

/**
 * Valida que las columnas sean válidas para exportación
 * Útil para detección temprana de errores
 *
 * @param columns - Columnas a validar
 * @throws Error si las columnas son inválidas
 *
 * @example
 * validateExportColumns(columns); // Throws if invalid
 */
export function validateExportColumns(columns: ExportColumn[]): void {
  if (!Array.isArray(columns) || columns.length === 0) {
    throw new Error('Export columns must be a non-empty array');
  }

  columns.forEach((col, index) => {
    if (!col.key || !col.header) {
      throw new Error(
        `Column at index ${index} must have both 'key' and 'header'`
      );
    }
  });
}
