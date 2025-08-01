import { type Table } from '@tanstack/react-table';
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react';

import { Button } from '~/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select';

interface DataTablePaginationProps<TData> {
  table: Table<TData>;
}

export function DataTablePagination<TData>({
  table,
}: DataTablePaginationProps<TData>) {
  return (
    <div className='flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-0 px-2 py-2'>
      <div className='flex-1 text-xs sm:text-sm text-muted-foreground order-2 sm:order-1'>
        <span className='hidden sm:inline'>
          {table.getFilteredSelectedRowModel().rows.length} de{' '}
          {table.getFilteredRowModel().rows.length} fila(s) seleccionada(s).
        </span>
        <span className='sm:hidden'>
          {table.getFilteredSelectedRowModel().rows.length}/{table.getFilteredRowModel().rows.length} seleccionadas
        </span>
      </div>
      <div className='flex items-center space-x-2 sm:space-x-6 lg:space-x-8 order-1 sm:order-2'>
        <div className='flex items-center space-x-1 sm:space-x-2'>
          <p className='text-xs sm:text-sm font-medium hidden sm:block' lang='es'>
            Filas por página
          </p>
          <p className='text-xs font-medium sm:hidden' lang='es'>
            Filas
          </p>
          <Select
            value={`${table.getState().pagination.pageSize}`}
            onValueChange={value => {
              table.setPageSize(Number(value));
            }}
          >
            <SelectTrigger className='h-7 sm:h-8 w-[60px] sm:w-[70px] text-xs sm:text-sm'>
              <SelectValue placeholder={table.getState().pagination.pageSize} />
            </SelectTrigger>
            <SelectContent side='top'>
              {[10, 20, 30, 40, 50].map(pageSize => (
                <SelectItem key={pageSize} value={`${pageSize}`} className='text-xs sm:text-sm'>
                  {pageSize}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className='flex w-[80px] sm:w-[100px] items-center justify-center text-xs sm:text-sm font-medium'>
          <span className='hidden sm:inline'>
            Página {table.getState().pagination.pageIndex + 1} de{' '}
            {table.getPageCount()}
          </span>
          <span className='sm:hidden'>
            {table.getState().pagination.pageIndex + 1}/{table.getPageCount()}
          </span>
        </div>
        <div className='flex items-center space-x-1 sm:space-x-2'>
          <Button
            variant='outline'
            className='hidden h-7 w-7 sm:h-8 sm:w-8 p-0 lg:flex'
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
          >
            <span className='sr-only'>Ir a la primera página</span>
            <ChevronsLeft className='h-3 w-3 sm:h-4 sm:w-4' />
          </Button>
          <Button
            variant='outline'
            className='h-7 w-7 sm:h-8 sm:w-8 p-0'
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <span className='sr-only'>Ir a la página anterior</span>
            <ChevronLeft className='h-3 w-3 sm:h-4 sm:w-4' />
          </Button>
          <Button
            variant='outline'
            className='h-7 w-7 sm:h-8 sm:w-8 p-0'
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            <span className='sr-only'>Ir a la página siguiente</span>
            <ChevronRight className='h-3 w-3 sm:h-4 sm:w-4' />
          </Button>
          <Button
            variant='outline'
            className='hidden h-7 w-7 sm:h-8 sm:w-8 p-0 lg:flex'
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            disabled={!table.getCanNextPage()}
          >
            <span className='sr-only'>Ir a la última página</span>
            <ChevronsRight className='h-3 w-3 sm:h-4 sm:w-4' />
          </Button>
        </div>
      </div>
    </div>
  );
}
