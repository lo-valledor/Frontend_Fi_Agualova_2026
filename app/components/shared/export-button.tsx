import { Download, FileSpreadsheet, FileText } from 'lucide-react';

import { Button } from '~/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '~/components/ui/dropdown-menu';
import {
  type ExportColumn,
  type ExportFormat,
  useExportData
} from '~/hooks/shared/use-export-data';

interface ExportButtonProps<T extends Record<string, any>> {
  data: T[];
  columns: ExportColumn[];
  filename?: string;
  className?: string;
  size?: 'sm' | 'default' | 'lg';
  variant?: 'default' | 'outline' | 'secondary' | 'ghost' | 'link';
  showDropdown?: boolean;
  defaultFormat?: ExportFormat;
}

export function ExportButton<T extends Record<string, any>>({
  data,
  columns,
  filename = 'export',
  className = '',
  size = 'sm',
  variant = 'default',
  showDropdown = true,
  defaultFormat = 'xlsx'
}: Readonly<ExportButtonProps<T>>) {
  const { isExporting, exportData } = useExportData<T>();

  const handleExport = async (format: ExportFormat) => {
    await exportData(data, columns, {
      format,
      filename,
      includeHeaders: true
    });
  };

  const getFormatLabel = (format: ExportFormat) => {
    switch (format) {
      case 'csv':
        return 'CSV';
      case 'xlsx':
        return 'Excel';
      default:
        return 'Exportar';
    }
  };

  // Si no se muestra dropdown, usar botón simple
  if (!showDropdown) {
    return (
      <Button
        variant={variant}
        onClick={() => handleExport(defaultFormat)}
        disabled={isExporting || data.length === 0}
        size={size}
        className={`gap-1.5 bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      >
        <Download
          className={`h-3 w-3 sm:h-3.5 sm:w-3.5 ${
            isExporting ? 'animate-spin' : ''
          }`}
        />
        <span className='text-xs sm:text-sm'>
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
          className={`gap-1.5 bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
        >
          <Download
            className={`h-3 w-3 sm:h-3.5 sm:w-3.5 ${
              isExporting ? 'animate-spin' : ''
            }`}
          />
          <span className='text-xs sm:text-sm'>
            {isExporting ? 'Exportando...' : 'Exportar'}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end' className='w-40'>
        <DropdownMenuItem
          onClick={() => handleExport('xlsx')}
          disabled={isExporting}
          className='cursor-pointer'
        >
          <FileSpreadsheet className='mr-2 h-4 w-4 text-green-600' />
          <span>Excel (.xlsx)</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => handleExport('csv')}
          disabled={isExporting}
          className='cursor-pointer'
        >
          <FileText className='mr-2 h-4 w-4 text-blue-600' />
          <span>CSV (.csv)</span>
        </DropdownMenuItem>
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
