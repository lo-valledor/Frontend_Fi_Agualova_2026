import type { ExportColumn, ExportConfig } from './types';

export class ExportColumnBuilder {
  private columns: ExportColumn[] = [];

  addString(key: string, header: string): this {
    this.columns.push({ key, header });
    return this;
  }

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

  build(): ExportColumn[] {
    return this.columns;
  }
}

export const DEFAULT_EXPORT_CONFIG: ExportConfig = {
  format: 'xlsx',
  filename: 'export',
  includeHeaders: true
};

export function getExportConfig(partial?: Partial<ExportConfig>): ExportConfig {
  return {
    ...DEFAULT_EXPORT_CONFIG,
    ...partial
  };
}

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
