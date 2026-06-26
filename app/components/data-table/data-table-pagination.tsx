import { type Table } from '@tanstack/react-table';
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Loader2
} from 'lucide-react';

import { Button } from '~/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '~/components/ui/select';

interface DataTablePaginationProps<TData> {
  table: Table<TData>;
  pageSizeOptions?: number[];
  /**
   * Total real de filas del server. Opcional. Si no se provee y la tabla
   * está en modo manual, se mostrará "Mostrando X–Y" sin "de Z".
   */
  totalRows?: number;
  /**
   * Fuerza el modo "total desconocido". Si no se provee, se infiere de
   * `table.getPageCount() === -1` (convención de TanStack para manual
   * pagination sin pageCount).
   */
  unknownTotal?: boolean;
  /**
   * Server-side: indica si hay más páginas después de la actual.
   * Cuando es false, el botón "Siguiente" se desactiva.
   */
  hasMore?: boolean;
  isLoading?: boolean;
}

export function DataTablePagination<TData>({
  table,
  pageSizeOptions = [10, 20, 50],
  totalRows,
  unknownTotal,
  hasMore = true,
  isLoading = false
}: DataTablePaginationProps<TData>) {
  const pageIndex = table.getState().pagination.pageIndex;
  const pageSize = table.getState().pagination.pageSize;
  const pageCount = table.getPageCount();
  const isUnknownTotal = unknownTotal ?? pageCount === -1;

  const currentRows = table.getRowModel().rows.length;
  const selectedCount = table.getFilteredSelectedRowModel().rows.length;

  const startRow = currentRows > 0 ? pageIndex * pageSize + 1 : 0;
  const endRow = pageIndex * pageSize + currentRows;

  // Habilitar/deshabilitar navegación:
  // - server-side: depende de pageIndex (prev) y hasMore + página llena (next)
  // - client-side: delegamos en TanStack
  const canPrev = isUnknownTotal
    ? pageIndex > 0 && !isLoading
    : table.getCanPreviousPage();
  const canNext = isUnknownTotal
    ? hasMore && currentRows > 0 && !isLoading
    : table.getCanNextPage();

  return (
    <div className="flex items-center justify-between px-2 py-2">
      <div className="flex items-center gap-3 text-sm text-muted-foreground">
        {currentRows > 0 ? (
          isUnknownTotal ? (
            <span>
              Mostrando {startRow}–{endRow}
              {!hasMore && ' (última página)'}
            </span>
          ) : (
            <span>
              Mostrando {startRow}–{Math.min(endRow, totalRows ?? endRow)} de{' '}
              {totalRows ?? endRow}
            </span>
          )
        ) : (
          <span>Sin resultados</span>
        )}

        {selectedCount > 0 && <span>{selectedCount} seleccionados</span>}

        {isLoading && (
          <span className="flex items-center gap-1">
            <Loader2 className="h-3 w-3 animate-spin" />
            Cargando…
          </span>
        )}
      </div>

      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <span className="text-sm">Filas:</span>
          <Select
            value={`${pageSize}`}
            onValueChange={value => table.setPageSize(Number(value))}
            disabled={isLoading}
          >
            <SelectTrigger className="h-8 w-16 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent side="top">
              {pageSizeOptions.map(pageSize => (
                <SelectItem
                  key={pageSize}
                  value={`${pageSize}`}
                  className="text-sm"
                >
                  {pageSize}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="text-sm font-medium">
          {isUnknownTotal
            ? `Página ${pageIndex + 1}`
            : `Página ${pageIndex + 1} de ${Math.max(1, pageCount)}`}
        </div>

        <div className="flex items-center space-x-1">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.setPageIndex(0)}
            disabled={!canPrev}
            className="h-8 w-8 p-0"
            title="Primera página"
          >
            <ChevronsLeft className="h-4 w-4" />
            <span className="sr-only">Primera página</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!canPrev}
            className="h-8 w-8 p-0"
            title="Página anterior"
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="sr-only">Página anterior</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!canNext}
            className="h-8 w-8 p-0"
            title="Página siguiente"
          >
            <ChevronRight className="h-4 w-4" />
            <span className="sr-only">Página siguiente</span>
          </Button>
          {!isUnknownTotal && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.setPageIndex(Math.max(0, pageCount - 1))}
              disabled={!canNext}
              className="h-8 w-8 p-0"
              title="Última página"
            >
              <ChevronsRight className="h-4 w-4" />
              <span className="sr-only">Última página</span>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
