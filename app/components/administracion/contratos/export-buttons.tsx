import { Download, FileSpreadsheet, FileText } from 'lucide-react';

import { Button } from '~/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu';
import { useExportContratos } from '~/hooks/administracion/use-export-contratos';
import type { GetContratos } from '~/types/administracion';

interface ExportButtonsProps {
  allContratos: GetContratos[];
  filteredContratos: GetContratos[];
  isFiltered: boolean;
}

export function ExportButtons({
  allContratos,
  filteredContratos,
  isFiltered,
}: ExportButtonsProps) {
  const { isExporting, exportAllContratos, exportFilteredContratos } =
    useExportContratos();

  return (
    <div className='flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2'>
      {/* Exportar Todos los Contratos */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant='outline'
            size='sm'
            className='border-emerald-200 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-700 dark:text-emerald-400 dark:hover:bg-emerald-900/20 w-full sm:w-auto'
            disabled={isExporting || allContratos.length === 0}
          >
            {isExporting ? (
              <>
                <div className='h-3 w-3 sm:h-4 sm:w-4 animate-spin rounded-full border-2 border-emerald-600 border-t-transparent mr-2' />
                <span className='text-xs sm:text-sm'>Exportando...</span>
              </>
            ) : (
              <>
                <Download className='mr-2 h-3 w-3 sm:h-4 sm:w-4' />
                <span className='text-xs sm:text-sm'>
                  <span className='hidden sm:inline'>Exportar Todos</span>
                  <span className='sm:hidden'>Todos</span>
                  <span className='ml-1'>({allContratos.length})</span>
                </span>
              </>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align='end' className='w-56'>
          <DropdownMenuLabel className='text-emerald-700 dark:text-emerald-400'>
            📊 Exportar Todos los Contratos
          </DropdownMenuLabel>
          <DropdownMenuSeparator />

          <DropdownMenuItem
            onClick={() => exportAllContratos(allContratos, 'csv')}
            disabled={isExporting}
            className='cursor-pointer'
          >
            <FileText className='mr-2 h-4 w-4 text-blue-600' />
            <div>
              <div className='font-medium'>CSV</div>
              <div className='text-xs text-muted-foreground'>
                Compatible con Excel, Google Sheets
              </div>
            </div>
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={() => exportAllContratos(allContratos, 'xlsx')}
            disabled={isExporting}
            className='cursor-pointer'
          >
            <FileSpreadsheet className='mr-2 h-4 w-4 text-green-600' />
            <div>
              <div className='font-medium'>Excel</div>
              <div className='text-xs text-muted-foreground'>
                Formato Microsoft Excel
              </div>
            </div>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Exportar Contratos Filtrados (solo si hay filtros activos) */}
      {isFiltered && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant='outline'
              size='sm'
              className='border-blue-200 text-blue-700 hover:bg-blue-50 dark:border-blue-700 dark:text-blue-400 dark:hover:bg-blue-900/20 w-full sm:w-auto'
              disabled={isExporting || filteredContratos.length === 0}
            >
              {isExporting ? (
                <>
                  <div className='h-3 w-3 sm:h-4 sm:w-4 animate-spin rounded-full border-2 border-blue-600 border-t-transparent mr-2' />
                  <span className='text-xs sm:text-sm'>Exportando...</span>
                </>
              ) : (
                <>
                  <Download className='mr-2 h-3 w-3 sm:h-4 sm:w-4' />
                  <span className='text-xs sm:text-sm'>
                    <span className='hidden sm:inline'>Exportar Filtrados</span>
                    <span className='sm:hidden'>Filtrados</span>
                    <span className='ml-1'>({filteredContratos.length})</span>
                  </span>
                </>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align='end' className='w-56'>
            <DropdownMenuLabel className='text-blue-700 dark:text-blue-400'>
              🔍 Exportar Resultados Filtrados
            </DropdownMenuLabel>
            <DropdownMenuSeparator />

            <DropdownMenuItem
              onClick={() => exportFilteredContratos(filteredContratos, 'csv')}
              disabled={isExporting}
              className='cursor-pointer'
            >
              <FileText className='mr-2 h-4 w-4 text-blue-600' />
              <div>
                <div className='font-medium'>CSV</div>
                <div className='text-xs text-muted-foreground'>
                  Solo {filteredContratos.length} contratos filtrados
                </div>
              </div>
            </DropdownMenuItem>

            <DropdownMenuItem
              onClick={() => exportFilteredContratos(filteredContratos, 'xlsx')}
              disabled={isExporting}
              className='cursor-pointer'
            >
              <FileSpreadsheet className='mr-2 h-4 w-4 text-green-600' />
              <div>
                <div className='font-medium'>Excel</div>
                <div className='text-xs text-muted-foreground'>
                  Solo {filteredContratos.length} contratos filtrados
                </div>
              </div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
}
