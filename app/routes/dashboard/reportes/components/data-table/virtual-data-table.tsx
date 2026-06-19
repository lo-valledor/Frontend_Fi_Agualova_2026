import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable
} from '@tanstack/react-table';
import { useVirtualizer } from '@tanstack/react-virtual';
import { Search } from 'lucide-react';

import { useRef, useState } from 'react';

import { Input } from '../ui/input';
import {
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '../ui/table';

interface VirtualDataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  searchPlaceholder?: string;
  estimateRowHeight?: number;
  maxHeight?: string;
}

export function VirtualDataTable<TData, TValue>({
  columns,
  data,
  searchPlaceholder = 'Buscar...',
  estimateRowHeight = 50,
  maxHeight = '600px'
}: VirtualDataTableProps<TData, TValue>) {
  const [globalFilter, setGlobalFilter] = useState('');

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    state: {
      globalFilter
    },
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: (row, columnId, filterValue) => {
      const searchValue = String(filterValue).toLowerCase().trim();
      const searchNoDots = searchValue.replace(/\./g, '');

      if (!searchValue) return true;

      // Buscar en todos los valores de la fila
      const rowValues = Object.values(row.original as Record<string, any>);

      return rowValues.some(value => {
        if (value === null || value === undefined) return false;
        const valueStr = String(value).toLowerCase();
        const valueNoDots = valueStr.replace(/\./g, '');

        // Coincide normal o sin puntos (útil para RUT formateados 77.497.420-2)
        return (
          valueStr.includes(searchValue) || valueNoDots.includes(searchNoDots)
        );
      });
    },
    // Cambiar a 'onEnd' para evitar cambios de ancho durante la virtualización
    columnResizeMode: 'onEnd',
    defaultColumn: {
      minSize: 60,
      maxSize: 999
    }
  });

  const rows = table.getRowModel().rows;

  const parentRef = useRef<HTMLDivElement>(null);

  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => estimateRowHeight,
    overscan: 5
  });

  const virtualRows = rowVirtualizer.getVirtualItems();
  const totalSize = rowVirtualizer.getTotalSize();

  const paddingTop = virtualRows.length > 0 ? virtualRows[0]?.start || 0 : 0;
  const paddingBottom =
    virtualRows.length > 0
      ? totalSize - (virtualRows[virtualRows.length - 1]?.end || 0)
      : 0;

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="flex justify-between items-center">
        <div className="relative w-64">
          <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={searchPlaceholder}
            value={globalFilter ?? ''}
            onChange={event => setGlobalFilter(event.target.value)}
            className="pl-8 h-8 text-sm"
          />
        </div>
      </div>

      {/* Virtual Table */}
      <div
        ref={parentRef}
        className="rounded-md border"
        style={{
          height: maxHeight,
          overflow: 'auto'
        }}
      >
        <table
          className="w-full caption-bottom text-sm"
          style={{ width: '100%' }}
        >
          <TableHeader className="sticky top-0 bg-background z-10">
            {table.getHeaderGroups().map(headerGroup => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map(header => (
                  <TableHead
                    key={header.id}
                    className="bg-background"
                    style={{
                      width: `${header.getSize()}px`,
                      minWidth: `${header.column.columnDef.minSize ?? 60}px`,
                      maxWidth: `${header.column.columnDef.maxSize ?? 999}px`
                    }}
                  >
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
            {rows.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No se encontraron resultados.
                </TableCell>
              </TableRow>
            )}
            {rows.length > 0 && (
              <>
                {/* Spacer superior */}
                {paddingTop > 0 && (
                  <tr>
                    <td style={{ height: `${paddingTop}px` }} />
                  </tr>
                )}

                {/* Filas visibles */}
                {virtualRows.map(virtualRow => {
                  const row = rows[virtualRow.index];
                  return (
                    <TableRow
                      key={row.id}
                      data-state={row.getIsSelected() && 'selected'}
                      style={{ height: `${virtualRow.size}px` }}
                    >
                      {row.getVisibleCells().map(cell => (
                        <TableCell
                          key={cell.id}
                          style={{
                            width: `${cell.column.getSize()}px`,
                            minWidth: `${cell.column.columnDef.minSize ?? 60}px`,
                            maxWidth: `${cell.column.columnDef.maxSize ?? 999}px`
                          }}
                        >
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  );
                })}

                {/* Spacer inferior */}
                {paddingBottom > 0 && (
                  <tr>
                    <td style={{ height: `${paddingBottom}px` }} />
                  </tr>
                )}
              </>
            )}
          </TableBody>
        </table>
      </div>
    </div>
  );
}
