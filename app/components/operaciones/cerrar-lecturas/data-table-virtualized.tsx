import {
  type ColumnDef,
  type RowSelectionState,
  type SortingState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable
} from '@tanstack/react-table';
import { useVirtualizer } from '@tanstack/react-virtual';

import { useEffect, useRef, useState } from 'react';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '~/components/ui/table';

interface DataTableVirtualizedProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  onRowSelectionChange?: (selectedRows: TData[]) => void;
  rowIdKey?: keyof TData;
  meta?: any;
}

export function DataTableVirtualized<TData, TValue>({
  columns,
  data,
  onRowSelectionChange,
  rowIdKey,
  meta
}: DataTableVirtualizedProps<TData, TValue>) {
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [sorting, setSorting] = useState<SortingState>([]);

  const table = useReactTable({
    data,
    columns,
    meta,
    state: {
      sorting,
      rowSelection
    },
    enableRowSelection: true,
    getRowId: rowIdKey ? row => String(row[rowIdKey]) : undefined,
    onRowSelectionChange: updater => {
      const newSelection =
        typeof updater === 'function' ? updater(rowSelection) : updater;
      setRowSelection(newSelection);

      if (onRowSelectionChange) {
        const selectedRows = Object.keys(newSelection)
          .filter(key => newSelection[key])
          .map(key => {
            if (rowIdKey) {
              return data.find(row => String(row[rowIdKey]) === key) as TData;
            }
            return data[parseInt(key)] as TData;
          })
          .filter(Boolean);
        onRowSelectionChange(selectedRows);
      }
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel()
  });

  // Referencia al contenedor de la tabla
  const tableContainerRef = useRef<HTMLDivElement>(null);

  const { rows } = table.getRowModel();

  // Configuración del virtualizador
  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => tableContainerRef.current,
    estimateSize: () => 45, // Altura estimada de cada fila
    overscan: 10
  });

  // Scroll al inicio cuando cambian los datos o filtros
  useEffect(() => {
    rowVirtualizer.scrollToIndex(0);
  }, [sorting, rowVirtualizer]);

  const virtualItems = rowVirtualizer.getVirtualItems();

  return (
    <div
      ref={tableContainerRef}
      className='rounded-md border border-border overflow-auto bg-card'
      style={{ height: '500px' }}
    >
      <Table className='text-sm'>
        <TableHeader className='sticky top-0 z-10 bg-card'>
          {table.getHeaderGroups().map(headerGroup => (
            <TableRow key={headerGroup.id} className='border-b'>
              {headerGroup.headers.map(header => (
                <TableHead key={header.id} className='py-2 px-3'>
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {rows.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={columns.length}
                className='h-16 text-center text-muted-foreground'
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
                    data-state={row.getIsSelected() && 'selected'}
                    className='border-b hover:bg-muted transition-colors'
                  >
                    {row.getVisibleCells().map(cell => (
                      <TableCell key={cell.id} className='py-2 px-3'>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
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
  );
}
