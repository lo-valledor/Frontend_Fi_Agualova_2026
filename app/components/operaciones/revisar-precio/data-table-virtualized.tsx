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
import { Loader2 } from 'lucide-react';

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
  onRowSelectionChange?: (selectedRowIds: string[]) => void;
  selectedRowIds?: string[];
  rowId?: keyof TData;
  enableSelection?: boolean;
  isLoading?: boolean;
}

export function DataTableVirtualized<TData, TValue>({
  columns,
  data,
  onRowSelectionChange,
  selectedRowIds = [],
  rowId = 'codigo' as keyof TData,
  enableSelection = false,
  isLoading = false
}: Readonly<DataTableVirtualizedProps<TData, TValue>>) {
  // Estado interno para la selección de filas
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [sorting, setSorting] = useState<SortingState>([]);

  // Sincronizar el estado interno con los IDs seleccionados externos
  useEffect(() => {
    if (!enableSelection || !selectedRowIds || !rowId) return;

    const newRowSelection: RowSelectionState = {};
    for (const id of selectedRowIds) {
      newRowSelection[id] = true;
    }
    setRowSelection(newRowSelection);
  }, [selectedRowIds, enableSelection, rowId]);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onRowSelectionChange: updater => {
      if (!enableSelection) return;

      // Aplicar la actualización al estado interno
      const newRowSelection =
        typeof updater === 'function' ? updater(rowSelection) : updater;

      setRowSelection(newRowSelection);

      // Notificar al componente padre
      if (onRowSelectionChange) {
        const selectedRowIds = Object.entries(newRowSelection)
          .filter(([_, selected]) => selected)
          .map(([rowId, _]) => rowId);
        onRowSelectionChange(selectedRowIds);
      }
    },
    onSortingChange: setSorting,
    state: {
      rowSelection,
      sorting
    },
    enableRowSelection: enableSelection,
    enableMultiRowSelection: enableSelection,
    getRowId: row => String(row[rowId])
  });

  // Referencia al contenedor de la tabla para virtualización
  const tableContainerRef = useRef<HTMLDivElement>(null);

  const { rows } = table.getRowModel();

  // Configuración del virtualizador
  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => tableContainerRef.current,
    estimateSize: () => 40, // Altura estimada de cada fila en px
    overscan: 10 // Número de filas adicionales a renderizar fuera del viewport
  });

  // Scroll al inicio cuando cambian los datos o filtros
  useEffect(() => {
    rowVirtualizer.scrollToIndex(0);
  }, [sorting, rowVirtualizer]);

  const virtualItems = rowVirtualizer.getVirtualItems();

  return (
    <div className='space-y-2'>
      {/* Información de resultados */}
      <div className='text-xs text-muted-foreground px-1'>
        Mostrando {rows.length} registro{rows.length === 1 ? '' : 's'}
        {enableSelection &&
          Object.keys(rowSelection).length > 0 &&
          ` (${Object.keys(rowSelection).length} seleccionado${Object.keys(rowSelection).length === 1 ? '' : 's'})`}
      </div>

      {/* Table con virtualización */}
      <div
        ref={tableContainerRef}
        className='rounded-md border overflow-auto'
        style={{ height: '600px' }}
      >
        <Table className='text-sm'>
          <TableHeader className='sticky top-0 z-10 bg-card'>
            {table.getHeaderGroups().map(headerGroup => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map(header => {
                  return (
                    <TableHead key={header.id} className='py-2'>
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
            {isLoading ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className='h-16 text-center'
                >
                  <div className='flex justify-center items-center'>
                    <Loader2 className='h-5 w-5 animate-spin' />
                    <span className='ml-2 text-muted-foreground text-sm'>
                      Actualizando datos...
                    </span>
                  </div>
                </TableCell>
              </TableRow>
            ) : rows.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className='h-16 text-center'
                >
                  <span className='text-sm text-muted-foreground'>
                    No results.
                  </span>
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
                    >
                      {row.getVisibleCells().map(cell => (
                        <TableCell key={cell.id} className='py-2'>
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
    </div>
  );
}
