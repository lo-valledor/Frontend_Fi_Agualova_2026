import {
  type ColumnDef,
  type ColumnFiltersState,
  type PaginationState,
  type RowSelectionState,
  type SortingState,
  type VisibilityState,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { Search } from 'lucide-react';

import { useState } from 'react';

import { Input } from '~/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '~/components/ui/table';

import { DataTablePagination } from './data-table-pagination';

interface DataTableAdvancedProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  searchPlaceholder?: string;
  defaultPageSize?: number;
  pageSizeOptions?: number[];
  showSearch?: boolean;
  showPageSizeSelector?: boolean;
  showPageNumbers?: boolean;
  onRowSelectionChange?: (selectedRows: TData[]) => void;
  rowIdKey?: keyof TData;
  initialSorting?: SortingState;
  meta?: any;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  searchPlaceholder = 'Buscar...',
  defaultPageSize = 10,
  showSearch = true,
  onRowSelectionChange,
  rowIdKey,
  initialSorting = [],
  meta,
}: DataTableAdvancedProps<TData, TValue>) {
  const [globalFilter, setGlobalFilter] = useState('');
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [sorting, setSorting] = useState<SortingState>(initialSorting);
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: defaultPageSize,
  });

  const table = useReactTable({
    data,
    columns,
    meta,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
      pagination,
      globalFilter,
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
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: setPagination,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  });

  return (
    <div className='space-y-4'>
      {/* Search */}
      {showSearch && (
        <div className='flex justify-end'>
          <div className='relative w-full max-w-xs sm:max-w-sm'>
            <Search className='absolute left-2 sm:left-3 top-1/2 h-3 w-3 sm:h-4 sm:w-4 -translate-y-1/2 text-muted-foreground' />
            <Input
              placeholder={searchPlaceholder}
              value={globalFilter ?? ''}
              onChange={event => setGlobalFilter(event.target.value)}
              className='w-full rounded-md border-border bg-background py-1.5 sm:py-2 pl-7 sm:pl-9 pr-3 sm:pr-4 text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-primary'
            />
          </div>
        </div>
      )}

      {/* Table */}
      <div className='rounded-lg border bg-card overflow-hidden'>
        <div className='overflow-x-auto'>
          <Table className='min-w-full'>
            <TableHeader>
              {table.getHeaderGroups().map(headerGroup => (
                <TableRow key={headerGroup.id} className='border-b bg-muted/50'>
                  {headerGroup.headers.map(header => (
                    <TableHead key={header.id} className='font-semibold text-xs sm:text-sm px-2 sm:px-4 py-2 sm:py-3 whitespace-nowrap'>
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
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map(row => (
                  <TableRow
                    key={row.id}
                    className='hover:bg-muted/50 transition-colors'
                    data-state={row.getIsSelected() && 'selected'}
                  >
                    {row.getVisibleCells().map(cell => (
                      <TableCell key={cell.id} className='px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm'>
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
                    className='h-16 sm:h-24 text-center text-xs sm:text-sm'
                  >
                    No se encontraron resultados.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Advanced Pagination */}
      <DataTablePagination table={table} />
    </div>
  );
}
