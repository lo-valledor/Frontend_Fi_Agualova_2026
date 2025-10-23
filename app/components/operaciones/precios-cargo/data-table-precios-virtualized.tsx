import {
  type ColumnDef,
  type ColumnFiltersState,
  type RowSelectionState,
  type SortingState,
  type VisibilityState,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable
} from '@tanstack/react-table';
import { useVirtualizer } from '@tanstack/react-virtual';
import { Search } from 'lucide-react';

import { useEffect, useRef, useState } from 'react';

import { Input } from '~/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '~/components/ui/table';

interface ColumnGroup {
  id: string;
  title: string;
  columns: string[];
  className?: string;
}

interface DataTablePreciosVirtualizedProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  searchPlaceholder?: string;
  showSearch?: boolean;
  columnGroups?: ColumnGroup[];
}

export function DataTablePreciosVirtualized<TData, TValue>({
  columns,
  data,
  searchPlaceholder = 'Buscar...',
  showSearch = true,
  columnGroups = []
}: DataTablePreciosVirtualizedProps<TData, TValue>) {
  const [globalFilter, setGlobalFilter] = useState('');
  const [rowSelection] = useState<RowSelectionState>({});
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [sorting, setSorting] = useState<SortingState>([]);

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
      globalFilter
    },
    enableRowSelection: false,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues()
  });

  // Referencia al contenedor de la tabla para virtualización
  const tableContainerRef = useRef<HTMLDivElement>(null);

  const { rows } = table.getRowModel();

  // Configuración del virtualizador
  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => tableContainerRef.current,
    estimateSize: () => 36, // Altura estimada de cada fila en px
    overscan: 10 // Número de filas adicionales a renderizar fuera del viewport
  });

  // Scroll al inicio cuando cambian los datos o filtros
  useEffect(() => {
    rowVirtualizer.scrollToIndex(0);
  }, [globalFilter, sorting, columnFilters, rowVirtualizer]);

  // Función para obtener el span de una columna
  const getColumnSpan = (groupId: string): number => {
    const group = columnGroups.find(g => g.id === groupId);
    return group?.columns.length || 1;
  };

  // Función para verificar si una columna pertenece a un grupo
  const getColumnGroup = (columnId: string): ColumnGroup | undefined => {
    return columnGroups.find(group => group.columns.includes(columnId));
  };

  const virtualItems = rowVirtualizer.getVirtualItems();

  return (
    <div className='space-y-1'>
      {/* Search */}
      {showSearch && (
        <div className='flex justify-end'>
          <div className='relative w-full max-w-xs sm:max-w-sm'>
            <Search className='absolute left-2 sm:left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-3 w-3 sm:h-4 sm:w-4' />
            <Input
              placeholder={searchPlaceholder}
              value={globalFilter ?? ''}
              onChange={e => table.setGlobalFilter(e.target.value)}
              className='pl-8 sm:pl-10 w-full bg-background h-8 sm:h-10 text-xs sm:text-sm'
            />
          </div>
        </div>
      )}

      {/* Información de resultados */}
      <div className='text-xs text-muted-foreground px-1'>
        Mostrando {rows.length} registro{rows.length !== 1 ? 's' : ''}
        {globalFilter && ` (filtrado${rows.length !== 1 ? 's' : ''})`}
      </div>

      {/* Table con virtualización */}
      <div
        ref={tableContainerRef}
        className='rounded border border-border bg-card overflow-auto shadow'
        style={{ height: '600px' }}
      >
        <Table className='min-w-full text-xs align-middle'>
          <TableHeader className='text-xs sticky top-0 z-10 bg-card'>
            {/* Headers agrupados */}
            {columnGroups.length > 0 && (
              <TableRow className='border-b-0 h-8'>
                {columnGroups.map(group => (
                  <TableHead
                    key={group.id}
                    colSpan={getColumnSpan(group.id)}
                    className={`text-center font-bold text-xs py-2 px-2 border-r last:border-r-0 ${
                      group.className || 'bg-primary text-primary-foreground'
                    }`}
                  >
                    {group.title}
                  </TableHead>
                ))}
              </TableRow>
            )}

            {/* Headers de columnas individuales */}
            {table.getHeaderGroups().map(headerGroup => (
              <TableRow
                key={headerGroup.id}
                className='border-b bg-muted/50 h-8'
              >
                {headerGroup.headers.map(header => {
                  const group = getColumnGroup(header.column.id);
                  return (
                    <TableHead
                      key={header.id}
                      className={`font-semibold text-xs py-2 px-2 border-r last:border-r-0 ${
                        group ? 'bg-muted' : ''
                      }`}
                      style={{
                        width:
                          header.getSize() !== 150
                            ? header.getSize()
                            : undefined,
                        minWidth: '40px'
                      }}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody className='text-xs'>
            {rows.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className='h-12 text-center text-muted-foreground text-xs'
                >
                  No se encontraron resultados.
                </TableCell>
              </TableRow>
            ) : (
              <>
                {/* Espaciador superior */}
                {virtualItems.length > 0 && (
                  <tr
                    style={{
                      height: `${virtualItems[0]?.start ?? 0}px`
                    }}
                  />
                )}

                {/* Filas virtualizadas */}
                {virtualItems.map(virtualRow => {
                  const row = rows[virtualRow.index];
                  return (
                    <TableRow
                      key={row.id}
                      data-index={virtualRow.index}
                      className={`hover:bg-muted/50 transition-colors border-b h-9 ${
                        virtualRow.index % 2 === 0 ? 'bg-card' : 'bg-muted/20'
                      }`}
                    >
                      {row.getVisibleCells().map(cell => {
                        const group = getColumnGroup(cell.column.id);
                        return (
                          <TableCell
                            key={cell.id}
                            className={`py-2 px-2 text-xs border-r last:border-r-0 ${
                              group ? 'border-border' : ''
                            }`}
                          >
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext()
                            )}
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  );
                })}

                {/* Espaciador inferior */}
                {virtualItems.length > 0 && (
                  <tr
                    style={{
                      height: `${
                        rowVirtualizer.getTotalSize() -
                        (virtualItems[virtualItems.length - 1]?.end ?? 0)
                      }px`
                    }}
                  />
                )}
              </>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
