import {
  type ColumnDef,
  type PaginationState,
  type SortingState,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';

import { useState } from 'react';

import { DataTablePagination } from '~/components/data-table/data-table-pagination';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '~/components/ui/table';
import { cn } from '~/lib/utils';

interface DataTableNichosProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  columnGroups: {
    id: string;
    title: string;
    columns: string[];
    className?: string;
  }[];
  onRowClick?: (row: TData) => void;
  pagination: PaginationState;
  onPaginationChange: React.Dispatch<React.SetStateAction<PaginationState>>;
}

export function DataTableNichos<TData, TValue>({
  columns,
  data,
  columnGroups,
  onRowClick,
  pagination,
  onPaginationChange,
}: DataTableNichosProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([]);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onPaginationChange: onPaginationChange,
    state: {
      sorting,
      pagination,
    },
  });

  // Función para renderizar encabezados agrupados
  const renderGroupedHeaders = () => {
    if (!columnGroups || columnGroups.length === 0) {
      return null;
    }

    const headerGroup = table.getHeaderGroups()[0];
    const groupedRow: Record<
      string,
      { span: number; title: string; className?: string }
    > = {};

    // Preparar grupos y contar spans
    columnGroups.forEach(group => {
      groupedRow[group.id] = {
        span: 0,
        title: group.title,
        className: group.className,
      };

      // Contar columnas en cada grupo
      headerGroup.headers.forEach(header => {
        const columnId = header.column.id;
        if (group.columns.includes(columnId)) {
          groupedRow[group.id].span++;
        }
      });
    });

    return (
      <TableRow className='border-b border-border/20 h-8'>
        {headerGroup.headers.map(header => {
          // Buscar si esta columna es la primera de algún grupo
          const group = columnGroups.find(
            g =>
              g.columns.includes(header.column.id) &&
              g.columns[0] === header.column.id
          );

          if (group) {
            return (
              <TableHead
                key={`group-${group.id}`}
                colSpan={groupedRow[group.id].span}
                className={cn(
                  'text-center font-semibold text-xs tracking-wide border-r border-border/30 last:border-r-0 py-1 px-2',
                  groupedRow[group.id].className
                )}
              >
                {groupedRow[group.id].title}
              </TableHead>
            );
          }

          // Si no es la primera columna de ningún grupo, verificar si pertenece a algún grupo
          const belongsToGroup = columnGroups.some(
            g =>
              g.columns.includes(header.column.id) &&
              g.columns[0] !== header.column.id
          );

          // Si pertenece a un grupo, no renderizar nada (ya está cubierto por el colSpan)
          return belongsToGroup ? null : (
            <TableHead
              key={`single-${header.id}`}
              className='text-center font-semibold text-xs tracking-wide border-r border-border/30 last:border-r-0 py-1 px-2'
            >
              {header.column.columnDef.header?.toString()}
            </TableHead>
          );
        })}
      </TableRow>
    );
  };

  return (
    <div className='space-y-3'>
      <div className='rounded-lg border border-border/60 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80'>
        <div className='relative overflow-hidden'>
          <div className='overflow-x-auto'>
            <Table>
              <TableHeader className='bg-muted/40'>
                {renderGroupedHeaders()}
                {table.getHeaderGroups().map(headerGroup => (
                  <TableRow
                    key={headerGroup.id}
                    className='border-b border-border/40 h-8'
                  >
                    {headerGroup.headers.map(header => {
                      const meta = header.column.columnDef.meta as
                        | { className?: string }
                        | undefined;
                      return (
                        <TableHead
                          key={header.id}
                          className={cn(
                            'text-center text-xs font-medium h-8 border-r border-border/20 last:border-r-0 py-1 px-2',
                            meta?.className
                          )}
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
              <TableBody>
                {table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map(row => (
                    <TableRow
                      key={row.id}
                      data-state={row.getIsSelected() && 'selected'}
                      className={cn(
                        'text-center text-xs transition-colors cursor-pointer h-9',
                        'hover:bg-muted/50 active:bg-muted/70',
                        'border-b border-border/20 last:border-b-0'
                      )}
                      onClick={() => onRowClick?.(row.original)}
                    >
                      {row.getVisibleCells().map(cell => {
                        const meta = cell.column.columnDef.meta as
                          | { className?: string }
                          | undefined;
                        return (
                          <TableCell
                            key={cell.id}
                            className={cn(
                              'py-1.5 px-2 border-r border-border/10 last:border-r-0',
                              meta?.className
                            )}
                          >
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext()
                            )}
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length}
                      className='h-24 text-center text-muted-foreground'
                    >
                      <div className='flex flex-col items-center justify-center space-y-1'>
                        <div className='text-xl'>📊</div>
                        <p className='text-xs font-medium'>
                          No se encontraron resultados
                        </p>
                        <p className='text-xs text-muted-foreground/70'>
                          Intente ajustar los filtros de búsqueda
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>

      {/* Paginación compacta */}
      <div className='flex items-center justify-between px-2'>
        <div className='flex items-center text-xs text-muted-foreground'>
          Mostrando {table.getRowModel().rows.length} de {data.length} registros
        </div>
        <DataTablePagination table={table} />
      </div>
    </div>
  );
}
