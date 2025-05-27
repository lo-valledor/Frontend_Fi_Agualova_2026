import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type SortingState,
  useReactTable,
} from '@tanstack/react-table'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '~/components/ui/table'
import { useState } from 'react'
import { DataTablePagination } from '~/components/data-table-pagination'
import { cn } from '~/lib/utils'

interface DataTableNichosProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  columnGroups: {
    id: string
    title: string
    columns: string[]
    className?: string
  }[]
  onRowClick?: (row: TData) => void
}

export function DataTableNichos<TData, TValue>({
  columns,
  data,
  columnGroups,
  onRowClick,
}: DataTableNichosProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([])

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    state: {
      sorting,
    },
  })

  // Función para renderizar encabezados agrupados
  const renderGroupedHeaders = () => {
    if (!columnGroups || columnGroups.length === 0) {
      return null
    }

    const headerGroup = table.getHeaderGroups()[0]
    const groupedRow: Record<
      string,
      { span: number; title: string; className?: string }
    > = {}

    // Preparar grupos y contar spans
    columnGroups.forEach((group) => {
      groupedRow[group.id] = {
        span: 0,
        title: group.title,
        className: group.className,
      }

      // Contar columnas en cada grupo
      headerGroup.headers.forEach((header) => {
        const columnId = header.column.id
        if (group.columns.includes(columnId)) {
          groupedRow[group.id].span++
        }
      })
    })

    return (
      <TableRow>
        {headerGroup.headers.map((header) => {
          // Buscar si esta columna es la primera de algún grupo
          const group = columnGroups.find(
            (g) =>
              g.columns.includes(header.column.id) &&
              g.columns[0] === header.column.id,
          )

          if (group) {
            return (
              <TableHead
                key={`group-${group.id}`}
                colSpan={groupedRow[group.id].span}
                className={cn('text-center', groupedRow[group.id].className)}
              >
                {groupedRow[group.id].title}
              </TableHead>
            )
          }

          // Si no es la primera columna de ningún grupo, verificar si pertenece a algún grupo
          const belongsToGroup = columnGroups.some(
            (g) =>
              g.columns.includes(header.column.id) &&
              g.columns[0] !== header.column.id,
          )

          // Si pertenece a un grupo, no renderizar nada (ya está cubierto por el colSpan)
          return belongsToGroup ? null : (
            <TableHead key={`single-${header.id}`}>
              {header.column.columnDef.header?.toString()}
            </TableHead>
          )
        })}
      </TableRow>
    )
  }

  return (
    <div>
      <div className="overflow-auto">
        <Table>
          <TableHeader>
            {renderGroupedHeaders()}
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  const meta = header.column.columnDef.meta as
                    | { className?: string }
                    | undefined
                  return (
                    <TableHead
                      key={header.id}
                      className={cn('text-center text-xs', meta?.className)}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                  className="text-center hover:bg-muted/30"
                  onClick={() => onRowClick?.(row.original)}
                >
                  {row.getVisibleCells().map((cell) => {
                    const meta = cell.column.columnDef.meta as
                      | { className?: string }
                      | undefined
                    return (
                      <TableCell key={cell.id} className={meta?.className}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </TableCell>
                    )
                  })}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No se encontraron resultados.
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
  )
}
