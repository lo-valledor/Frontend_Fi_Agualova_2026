import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type PaginationState,
  type RowSelectionState,
  useReactTable
} from '@tanstack/react-table';
import { Loader2 } from 'lucide-react';

import { useEffect, useState } from 'react';

import { DataTablePagination } from '~/components/data-table/data-table-pagination';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '~/components/ui/table';

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  onRowSelectionChange?: (selectedRowIds: string[]) => void;
  selectedRowIds?: string[];
  rowId?: keyof TData;
  enableSelection?: boolean;
  isLoading?: boolean;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  onRowSelectionChange,
  selectedRowIds = [],
  rowId = 'codigo' as keyof TData,
  enableSelection = false,
  isLoading = false
}: DataTableProps<TData, TValue>) {
  // Configuración para la paginación
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10
  });

  // Estado interno para la selección de filas
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

  // Sincronizar el estado interno con los IDs seleccionados externos
  useEffect(() => {
    if (!enableSelection || !selectedRowIds || !rowId) return;

    const newRowSelection: RowSelectionState = {};
    selectedRowIds.forEach(id => {
      newRowSelection[id] = true;
    });
    setRowSelection(newRowSelection);
  }, [selectedRowIds, enableSelection, rowId]);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
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
    state: {
      pagination,
      rowSelection
    },
    onPaginationChange: setPagination,
    enableRowSelection: enableSelection,
    enableMultiRowSelection: enableSelection,
    getRowId: row => String(row[rowId])
  });

  return (
    <div className="space-y-2">
      <div className="rounded-md border overflow-hidden">
        <div className="overflow-auto max-h-[600px]">
          <Table className="text-sm">
            <TableHeader className="sticky top-0 z-10 bg-background">
              {table.getHeaderGroups().map(headerGroup => (
                <TableRow key={headerGroup.id} className="border-b">
                  {headerGroup.headers.map(header => {
                    return (
                      <TableHead key={header.id} className="py-2 bg-background">
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
                    className="h-16 text-center"
                  >
                    <div className="flex justify-center items-center">
                      <Loader2 className="h-5 w-5 animate-spin" />
                      <span className="ml-2 text-muted-foreground text-sm">
                        Actualizando datos...
                      </span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map(row => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && 'selected'}
                  >
                    {row.getVisibleCells().map(cell => (
                      <TableCell key={cell.id} className="py-2">
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-16 text-center"
                  >
                    <span className="text-sm text-muted-foreground">
                      No results.
                    </span>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
      <DataTablePagination table={table} />
    </div>
  );
}
