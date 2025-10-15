import {
  type ColumnDef,
  type ExpandedState,
  type RowSelectionState,
  flexRender,
  getCoreRowModel,
  getExpandedRowModel,
  useReactTable
} from '@tanstack/react-table';

import { useState } from 'react';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '~/components/ui/table';
import {
  type CalculoPrefacturaCargo,
  type CalculoPrefacturaCompleto
} from '~/types/operaciones';

interface HierarchicalDataTableProps {
  columns: ColumnDef<CalculoPrefacturaCompleto>[];
  data: CalculoPrefacturaCompleto[];
  onSelectionChange?: (selectedContratos: CalculoPrefacturaCompleto[]) => void;
}

export function HierarchicalDataTable({
  columns,
  data,
  onSelectionChange
}: Readonly<HierarchicalDataTableProps>) {
  const [expanded, setExpanded] = useState<ExpandedState>(true);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

  const table = useReactTable({
    data,
    columns,
    state: {
      expanded,
      rowSelection
    },
    onExpandedChange: setExpanded,
    onRowSelectionChange: updater => {
      const newSelection =
        typeof updater === 'function' ? updater(rowSelection) : updater;
      setRowSelection(newSelection);

      // Notificar los contratos seleccionados al componente padre
      if (onSelectionChange) {
        const selectedRows = Object.keys(newSelection)
          .filter(key => newSelection[key])
          .map(key => data[parseInt(key)])
          .filter(Boolean);
        onSelectionChange(selectedRows);
      }
    },
    getCoreRowModel: getCoreRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    getSubRows: row => (row.cargos ? [] : undefined) // Los cargos no tienen sub-filas
  });

  const renderCargoRow = (
    cargo: CalculoPrefacturaCargo,
    contratoIndex: number,
    cargoIndex: number
  ) => (
    <TableRow
      key={`${contratoIndex}-cargo-${cargoIndex}`}
      className='bg-background border-l-4 border-border hover:muted transition-colors'
    >
      <TableCell></TableCell>

      {/* Sector - vacío para cargos */}
      <TableCell></TableCell>

      {/* Contrato - vacío para cargos */}
      <TableCell></TableCell>

      {/* Tarifa - vacío para cargos */}
      <TableCell></TableCell>

      {/* RUT - vacío para cargos */}
      <TableCell></TableCell>

      {/* Nombre cliente - vacío para cargos */}
      <TableCell></TableCell>

      {/* Local - vacío para cargos */}
      <TableCell></TableCell>

      {/* Dirección - vacío para cargos */}
      <TableCell></TableCell>

      {/* Comuna - vacío para cargos */}
      <TableCell></TableCell>

      {/* N° Serie - vacío para cargos */}
      <TableCell></TableCell>

      {/* Fecha Lectura - vacío para cargos */}
      <TableCell></TableCell>

      {/* Descripción Cargo - esta es la primera columna con contenido */}
      <TableCell className='pl-8'>
        <span className='text-sm font-medium'>{cargo.descripcion}</span>
      </TableCell>

      {/* Cantidad - alineada con consumo */}
      <TableCell className='text-sm text-right'>
        <span className='font-medium'>
          {cargo.cantidad?.toLocaleString('es-CL')}
        </span>
      </TableCell>

      {/* Unidad - alineada con la columna de lectura ID */}
      <TableCell className='text-sm text-center'>
        <span className='text-xs text-muted-foreground bg-background px-2 py-1 rounded'>
          ud
        </span>
      </TableCell>

      {/* Precio Unitario - alineada con Total Facturado */}
      <TableCell className='text-sm text-right font-medium text-emerald-700 dark:text-emerald-300'>
        {new Intl.NumberFormat('es-CL', {
          style: 'currency',
          currency: 'CLP',
          minimumFractionDigits: 0,
          maximumFractionDigits: 0
        }).format(cargo.precioUnitario || 0)}
      </TableCell>

      {/* Subtotal - alineada con Total a Pagar */}
      <TableCell className='text-sm text-right font-semibold text-primary'>
        {new Intl.NumberFormat('es-CL', {
          style: 'currency',
          currency: 'CLP',
          minimumFractionDigits: 0,
          maximumFractionDigits: 0
        }).format(cargo.subtotal || 0)}
      </TableCell>
    </TableRow>
  );

  return (
    <div className='w-full'>
      <div className='rounded-xl border border-border/60 shadow-sm overflow-x-auto'>
        <Table className='min-w-full table-auto'>
          <TableHeader className='bg-background/50 sticky top-0 z-10'>
            {table.getHeaderGroups().map(headerGroup => (
              <TableRow
                key={headerGroup.id}
                className='border-b border-border/60'
              >
                {headerGroup.headers.map(header => {
                  return (
                    <TableHead
                      key={header.id}
                      className='font-semibold py-3 px-2 sm:px-3 whitespace-nowrap text-xs sm:text-sm'
                      style={{
                        width: header.getSize(),
                        minWidth:
                          header.column.columnDef.minSize || header.getSize(),
                        maxWidth: header.column.columnDef.maxSize || 'none'
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
                <>
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && 'selected'}
                    className='hover:bg-muted/30 transition-colors border-b border-border/40'
                  >
                    {row.getVisibleCells().map(cell => (
                      <TableCell
                        key={cell.id}
                        className='py-2 px-2 sm:px-3 text-xs sm:text-sm'
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                  {row.getIsExpanded() && row.original.cargos && (
                    <>
                      {/* Encabezado de cargos */}
                      <TableRow className='bg-muted/50 border-l-4 border-l-primary hover:bg-muted/50'>
                        <TableCell></TableCell>
                        {/* Sector - vacío */}
                        <TableCell></TableCell>
                        {/* Contrato - vacío */}
                        <TableCell></TableCell>
                        {/* Tarifa - vacío */}
                        <TableCell></TableCell>
                        {/* RUT - vacío */}
                        <TableCell></TableCell>
                        {/* Nombre cliente - vacío */}
                        <TableCell></TableCell>
                        {/* Local - vacío */}
                        <TableCell></TableCell>
                        {/* Dirección - vacío */}
                        <TableCell></TableCell>
                        {/* Comuna - vacío */}
                        <TableCell></TableCell>
                        {/* N° Serie - vacío */}
                        <TableCell></TableCell>
                        {/* Fecha Lectura - vacío */}
                        <TableCell></TableCell>

                        {/* Descripción Cargo - alineada con nombre cliente */}
                        <TableCell className='font-semibold text-xs text-primary uppercase tracking-wide'>
                          Descripción Cargo
                        </TableCell>
                        {/* Cantidad - alineada con consumo */}
                        <TableCell className='font-semibold text-xs text-primary text-right uppercase tracking-wide'>
                          Cantidad
                        </TableCell>
                        {/* Unidad - alineada con lectura ID */}
                        <TableCell className='font-semibold text-xs text-primary text-center uppercase tracking-wide'>
                          Unidad
                        </TableCell>
                        {/* Precio Unit. - alineada con Total Facturado */}
                        <TableCell className='font-semibold text-xs text-primary text-right uppercase tracking-wide'>
                          Precio Unit.
                        </TableCell>
                        {/* Subtotal - alineada con Total a Pagar */}
                        <TableCell className='font-semibold text-xs text-primary text-right uppercase tracking-wide'>
                          Subtotal
                        </TableCell>
                      </TableRow>
                      {/* Filas de cargos */}
                      {row.original.cargos.map((cargo, cargoIndex) =>
                        renderCargoRow(cargo, index, cargoIndex)
                      )}
                      {/* Separador después de los cargos */}
                      <TableRow className='h-2'>
                        <TableCell
                          colSpan={columns.length}
                          className='p-0 bg-muted/30 border-b-2 border-border/60'
                        ></TableCell>
                      </TableRow>
                    </>
                  )}
                </>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className='h-32 text-center'
                >
                  <div className='flex flex-col items-center gap-3 text-muted-foreground'>
                    <div className='p-3 bg-background rounded-full'>
                      <span className='text-2xl'>📊</span>
                    </div>
                    <p className='font-medium'>No se encontraron resultados</p>
                    <p className='text-sm'>
                      Ajusta los filtros de búsqueda para ver datos
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
