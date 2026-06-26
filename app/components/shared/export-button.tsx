import { Download, FileSpreadsheet, FileText } from 'lucide-react';

import { Button } from '~/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '~/components/ui/dropdown-menu';
import {
  type ExportColumn,
  type ExportFormat,
  useExportData
} from '~/hooks/shared/use-export-data';

export type ExtendedExportFormat = ExportFormat | 'pdf';

interface ExportButtonProps<T extends Record<string, any>> {
  data: T[];
  columns: ExportColumn[];
  filename?: string;
  className?: string;
  size?: 'sm' | 'default' | 'lg';
  variant?: 'default' | 'outline' | 'secondary' | 'ghost' | 'link';
  showDropdown?: boolean;
  defaultFormat?: ExtendedExportFormat;
  enablePDF?: boolean;
  onPDFExport?: () => void;
}

export function ExportButton<T extends Record<string, any>>({
  data,
  columns,
  filename = 'export',
  className = '',
  size = 'sm',
  variant = 'default',
  showDropdown = true,
  defaultFormat = 'xlsx',
  enablePDF = false,
  onPDFExport
}: Readonly<ExportButtonProps<T>>) {
  const { isExporting, exportData } = useExportData<T>();

  const handleExport = async (format: ExtendedExportFormat) => {
    if (format === 'pdf') {
      if (onPDFExport) {
        onPDFExport();
      }
      return;
    }

    await exportData(data, columns, {
      format: format as ExportFormat,
      filename,
      includeHeaders: true
    });
  };

  const getFormatLabel = (format: ExtendedExportFormat) => {
    switch (format) {
      case 'csv':
        return 'CSV';
      case 'xlsx':
        return 'Excel';
      case 'pdf':
        return 'PDF';
      default:
        return 'Exportar';
    }
  };

  // Clases por defecto si no se proporciona className personalizado
  const defaultClasses = className
    ? ''
    : 'bg-emerald-600 hover:bg-emerald-700 text-white';
  const buttonClasses = `gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed ${defaultClasses} ${className}`;

  // Si no se muestra dropdown, usar botón simple
  if (!showDropdown) {
    return (
      <Button
        variant={variant}
        onClick={() => handleExport(defaultFormat)}
        disabled={isExporting || data.length === 0}
        size={size}
        className={buttonClasses}
      >
        <Download
          className={`h-3 w-3 sm:h-3.5 sm:w-3.5 ${
            isExporting ? 'animate-spin' : ''
          }`}
        />
        <span className="text-xs sm:text-sm">
          {isExporting
            ? 'Exportando...'
            : `Exportar ${getFormatLabel(defaultFormat)}`}
        </span>
      </Button>
    );
  }

  // Botón con dropdown
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant={variant}
          disabled={isExporting || data.length === 0}
          size={size}
          className={buttonClasses}
        >
          <Download
            className={`h-3 w-3 sm:h-3.5 sm:w-3.5 ${
              isExporting ? 'animate-spin' : ''
            }`}
          />
          <span className="text-xs sm:text-sm">
            {isExporting ? 'Exportando...' : 'Exportar'}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        <DropdownMenuItem
          onClick={() => handleExport('xlsx')}
          disabled={isExporting}
          className="cursor-pointer"
        >
          <FileSpreadsheet className="mr-2 h-4 w-4 text-green-600" />
          <span>Excel (.xlsx)</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => handleExport('csv')}
          disabled={isExporting}
          className="cursor-pointer"
        >
          <FileText className="mr-2 h-4 w-4 text-blue-600" />
          <span>CSV (.csv)</span>
        </DropdownMenuItem>
        {enablePDF && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => handleExport('pdf')}
              disabled={isExporting}
              className="cursor-pointer"
            >
              <FileText className="mr-2 h-4 w-4 text-red-600" />
              <span>PDF (.pdf)</span>
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// Componente de conveniencia para exportar todos los datos
export function ExportAllButton<T extends Record<string, any>>({
  data,
  columns,
  filename = 'export_completo',
  ...props
}: Omit<ExportButtonProps<T>, 'filename'> & { filename?: string }) {
  return (
    <ExportButton
      data={data}
      columns={columns}
      filename={filename}
      {...props}
    />
  );
}

// Componente de conveniencia para exportar datos filtrados
export function ExportFilteredButton<T extends Record<string, any>>({
  data,
  columns,
  filename = 'export_filtrado',
  ...props
}: Omit<ExportButtonProps<T>, 'filename'> & { filename?: string }) {
  return (
    <ExportButton
      data={data}
      columns={columns}
      filename={filename}
      {...props}
    />
  );
}
