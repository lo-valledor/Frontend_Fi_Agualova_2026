/**
 * Export Column Builder - Builder Pattern for Export Configuration
 *
 * Provides utilities for constructing export configurations and validating columns.
 */

import type { ExportColumn, ExportConfig } from './types';

/**
 * Builder for creating columns of export in a fluent manner
 * Implements builder pattern for better readability and maintainability
 *
 * @example
 * ```typescript
 * const columns = new ExportColumnBuilder()
 *   .addString('numeroMedidor', 'Número Medidor')
 *   .addString('marca', 'Marca')
 *   .addDate('fechaInstalacion', 'Fecha Instalación')
 *   .build();
 * ```
 */
export class ExportColumnBuilder {
  private columns: ExportColumn[] = [];

  /**
   * Adds a simple string column
   *
   * @param key - Object property key
   * @param header - Column header text
   * @returns Builder instance for chaining
   */
  addString(key: string, header: string): this {
    this.columns.push({ key, header });
    return this;
  }

  /**
   * Adds a date column with localized formatting
   *
   * @param key - Object property key
   * @param header - Column header text
   * @param locale - Locale for date formatting (default: 'es-CL')
   * @returns Builder instance for chaining
   */
  addDate(key: string, header: string, locale: string = 'es-CL'): this {
    this.columns.push({
      key,
      header,
      formatter: (value: string | null | undefined) => {
        if (!value) return '';

        // Si la fecha ya está en formato DD-MM o DD-MM-YYYY, devolverla tal cual
        if (/^\d{2}-\d{2}(-\d{4})?$/.test(value)) {
          return value;
        }

        // Si es una fecha ISO u otro formato, intentar parsearla
        try {
          const date = new Date(value);
          if (!isNaN(date.getTime())) {
            return date.toLocaleDateString(locale);
          }
        } catch {
          // Si falla el parseo, devolver el valor original
        }

        return value;
      }
    });
    return this;
  }

  /**
   * Adds a boolean column with customizable text
   *
   * @param key - Object property key
   * @param header - Column header text
   * @param trueText - Text for true values (default: 'Sí')
   * @param falseText - Text for false values (default: 'No')
   * @returns Builder instance for chaining
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
   * Adds a column with custom formatter function
   *
   * @param key - Object property key
   * @param header - Column header text
   * @param formatter - Custom formatting function
   * @returns Builder instance for chaining
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
   * Adds a column with nested property selector
   *
   * @param key - Object property key
   * @param header - Column header text
   * @param extractor - Function to extract nested value
   * @returns Builder instance for chaining
   *
   * @example
   * ```typescript
   * .addNested('cliente.nombre', 'Cliente', item => item.cliente?.nombre)
   * ```
   */
  addNested(key: string, header: string, extractor: (item: any) => any): this {
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
   * Builds and returns the configured columns array
   *
   * @returns Array of ExportColumn definitions
   */
  build(): ExportColumn[] {
    return this.columns;
  }
}

/**
 * Default export configuration
 */
export const DEFAULT_EXPORT_CONFIG: ExportConfig = {
  format: 'xlsx',
  filename: 'export',
  includeHeaders: true
};

/**
 * Gets export configuration merged with defaults
 * Allows overriding only the necessary values
 *
 * @param partial - Partial export configuration
 * @returns Complete export configuration
 *
 * @example
 * ```typescript
 * const config = getExportConfig({ filename: 'medidores' });
 * // Returns { format: 'xlsx', filename: 'medidores', includeHeaders: true }
 * ```
 */
export function getExportConfig(partial?: Partial<ExportConfig>): ExportConfig {
  return {
    ...DEFAULT_EXPORT_CONFIG,
    ...partial
  };
}

/**
 * Validates that columns are valid for export
 * Useful for early error detection
 *
 * @param columns - Columns to validate
 * @throws Error if columns are invalid
 *
 * @example
 * ```typescript
 * validateExportColumns(columns); // Throws if invalid
 * ```
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
