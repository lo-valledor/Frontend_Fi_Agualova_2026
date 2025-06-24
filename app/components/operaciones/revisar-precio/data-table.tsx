import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  type PaginationState,
} from '@tanstack/react-table';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '~/components/ui/table';
import { DataTablePagination } from '~/components/data-table/data-table-pagination';
import { useState } from 'react';
import { Loader2 } from 'lucide-react';

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
  isLoading = false,
}: DataTableProps<TData, TValue>) {
  // Configuración para la paginación
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  // Función para obtener las filas seleccionadas actualmente
  const getSelectedRows = () => {
    if (!enableSelection || !selectedRowIds || !rowId) return {};

    const selectedRows: Record<string, boolean> = {};
    selectedRowIds.forEach((id) => {
      selectedRows[id] = true;
    });
    return selectedRows;
  };

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onRowSelectionChange: enableSelection
      ? (_updater) => {
          if (onRowSelectionChange) {
            const selectedRowsState = table.getState().rowSelection;
            const selectedRowIds = Object.entries(selectedRowsState)
              .filter(([_, selected]) => selected)
              .map(([rowId, _]) => rowId);
            onRowSelectionChange(selectedRowIds);
          }
        }
      : undefined,
    state: {
      pagination,
      rowSelection: getSelectedRows(),
    },
    onPaginationChange: setPagination,
    enableRowSelection: enableSelection,
    enableMultiRowSelection: enableSelection,
    getRowId: (row) => String(row[rowId]),
  });

  return (
    <div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
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
                  className="h-24 text-center"
                >
                  <div className="flex justify-center items-center">
                    <Loader2 className="h-6 w-6 animate-spin text-sky-600 dark:text-sky-400" />
                    <span className="ml-2 text-muted-foreground">
                      Actualizando datos...
                    </span>
                  </div>
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <DataTablePagination table={table} />
    </div>
  );
}
