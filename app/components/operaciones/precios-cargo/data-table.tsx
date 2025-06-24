import {
  type ColumnDef,
  type ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type SortingState,
  useReactTable,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { useState } from "react";
import { DataTablePagination } from "~/components/data-table/data-table-pagination";
import { cn } from "~/lib/utils";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  columnGroups?: {
    id: string;
    title: string;
    columns: string[];
    className?: string;
  }[];
}

export function DataTable<TData, TValue>({
  columns,
  data,
  columnGroups,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
      columnFilters,
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
    columnGroups.forEach((group) => {
      groupedRow[group.id] = {
        span: 0,
        title: group.title,
        className: group.className,
      };

      // Contar columnas en cada grupo
      headerGroup.headers.forEach((header) => {
        const columnId = header.column.id;
        if (group.columns.includes(columnId)) {
          groupedRow[group.id].span++;
        }
      });
    });

    return (
      <TableRow>
        {headerGroup.headers.map((header) => {
          const group = columnGroups.find(
            (g) =>
              g.columns.includes(header.column.id) &&
              g.columns[0] === header.column.id
          );

          if (group) {
            return (
              <TableHead
                key={`group-${group.id}`}
                colSpan={groupedRow[group.id].span}
                className={cn(
                  "text-center font-medium",
                  groupedRow[group.id].className
                )}
              >
                {groupedRow[group.id].title}
              </TableHead>
            );
          }

          const belongsToGroup = columnGroups.some(
            (g) =>
              g.columns.includes(header.column.id) &&
              g.columns[0] !== header.column.id
          );

          return belongsToGroup ? null : (
            <TableHead key={`single-${header.id}`} className="text-center">
              {header.column.columnDef.header?.toString()}
            </TableHead>
          );
        })}
      </TableRow>
    );
  };

  return (
    <div>
      <div className="mb-3">
        {/* <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Filtrar por descripción..."
            value={
              (table.getColumn('descripcion')?.getFilterValue() as string) ?? ''
            }
            onChange={(event) =>
              table.getColumn('descripcion')?.setFilterValue(event.target.value)
            }
            className="w-full pl-8"
          />
        </div> */}
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {columnGroups && columnGroups.length > 0 && renderGroupedHeaders()}
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
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
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="text-center">
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
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <DataTablePagination table={table} />
      </div>
    </div>
  );
}
