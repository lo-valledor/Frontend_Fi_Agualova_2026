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

import { DataTablePagination } from '~/components/data-table/data-table-pagination';
import { Input } from '~/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '~/components/ui/table';

interface ColumnGroup {
  id: string;
  title: string;
  columns: string[];
  className?: string;
}

interface DataTablePreciosProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  searchPlaceholder?: string;
  defaultPageSize?: number;
  pageSizeOptions?: number[];
  showSearch?: boolean;
  columnGroups?: ColumnGroup[];
}

export function DataTablePrecios<TData, TValue>({
  columns,
  data,
  searchPlaceholder = 'Buscar...',
  defaultPageSize = 10,
  showSearch = true,
  columnGroups = [],
}: DataTablePreciosProps<TData, TValue>) {
  const [globalFilter, setGlobalFilter] = useState('');
  const [rowSelection] = useState<RowSelectionState>({});
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: defaultPageSize,
  });

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
      pagination,
      globalFilter,
    },
    enableRowSelection: false,
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

  // Función para obtener el span de una columna
  const getColumnSpan = (groupId: string): number => {
    const group = columnGroups.find(g => g.id === groupId);
    return group?.columns.length || 1;
  };

  // Función para verificar si una columna pertenece a un grupo
  const getColumnGroup = (columnId: string): ColumnGroup | undefined => {
    return columnGroups.find(group => group.columns.includes(columnId));
  };

  return (
    <div className='space-y-2'>
      {/* Search */}
      {showSearch && (
        <div className='flex justify-end'>
          <div className='relative w-full max-w-xs sm:max-w-sm'>
            <Search className='absolute left-2 sm:left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-3 w-3 sm:h-4 sm:w-4' />
            <Input
              placeholder={searchPlaceholder}
              value={globalFilter ?? ''}
              onChange={e => table.setGlobalFilter(e.target.value)}
              className='pl-8 sm:pl-10 w-full bg-white dark:bg-slate-800 h-8 sm:h-10 text-xs sm:text-sm'
            />
          </div>
        </div>
      )}

      {/* Table */}
      <div className='rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 overflow-x-auto shadow-lg'>
        <Table className='min-w-full'>
          <TableHeader>
            {/* Headers agrupados */}
            {columnGroups.length > 0 && (
              <TableRow className='border-b-0'>
                {columnGroups.map(group => (
                  <TableHead
                    key={group.id}
                    colSpan={getColumnSpan(group.id)}
                    className={`text-center font-bold text-xs sm:text-sm py-1 sm:py-2 border-r last:border-r-0 ${
                      group.className || 'bg-slate-600 text-white'
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
                className='border-b bg-slate-50 dark:bg-slate-800/50'
              >
                {headerGroup.headers.map(header => {
                  const group = getColumnGroup(header.column.id);
                  return (
                    <TableHead
                      key={header.id}
                      className={`font-semibold text-xs py-0.5 sm:py-1 px-1 sm:px-2 border-r last:border-r-0 ${
                        group ? 'bg-slate-100 dark:bg-slate-700/50' : ''
                      }`}
                      style={{
                        width:
                          header.getSize() !== 150
                            ? header.getSize()
                            : undefined,
                        minWidth: '60px',
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
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row, index) => (
                <TableRow
                  key={row.id}
                  className={`hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors border-b ${
                    index % 2 === 0
                      ? 'bg-white dark:bg-slate-900'
                      : 'bg-slate-25 dark:bg-slate-900/50'
                  }`}
                >
                  {row.getVisibleCells().map(cell => {
                    const group = getColumnGroup(cell.column.id);
                    return (
                      <TableCell
                        key={cell.id}
                        className={`py-1 sm:py-2 px-1 sm:px-2 text-xs sm:text-sm border-r last:border-r-0 ${
                          group ? 'border-slate-200 dark:border-slate-700' : ''
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
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className='h-12 sm:h-16 text-center text-slate-500 dark:text-slate-400 text-xs sm:text-sm'
                >
                  No se encontraron resultados.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <DataTablePagination table={table} />
    </div>
  );
}
