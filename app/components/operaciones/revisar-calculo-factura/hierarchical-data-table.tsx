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
      className='bg-sky-50/30 dark:bg-sky-900/10 border-l-2 border-l-sky-300 dark:border-l-sky-700 hover:bg-sky-50/50 dark:hover:bg-sky-900/20 transition-colors h-6'
    >
      <TableCell colSpan={9} className='py-0 px-0.5'></TableCell>

      {/* N° Serie - vacío para cargos */}
      <TableCell className='py-0 px-0.5'>
        <span className='font-medium col-span-2'>{cargo.codigoEnerlova}</span>
      </TableCell>

      {/* Descripción Cargo - esta es la primera columna con contenido */}
      <TableCell colSpan={2} className='pl-2 py-0 px-0.5'>
        <span className='font-medium col-span-2'>{cargo.descripcion}</span>
      </TableCell>

      {/* Cantidad - alineada con consumo */}
      <TableCell className='text-[12px] text-right py-0 px-0.5'>
        <span className='text-slate-700 dark:text-slate-300'>
          {cargo.cantidad?.toLocaleString('es-CL')}
        </span>
      </TableCell>

      {/* Precio Unitario - alineada con Total Facturado */}
      <TableCell className='text-[12px] text-right font-medium text-emerald-700 dark:text-emerald-300 py-0 px-0.5'>
        ${(cargo.precioUnitario || 0).toLocaleString('es-CL')}
      </TableCell>

      {/* Subtotal - alineada con Total a Pagar */}
      <TableCell className='text-[12px] text-right font-semibold text-sky-700 dark:text-sky-300 py-0 px-0.5'>
        ${(cargo.subtotal || 0).toLocaleString('es-CL')}
      </TableCell>

      {/* Facturar - vacío para cargos */}
      {/* <TableCell className='py-0 px-0.5'></TableCell> */}
    </TableRow>
  );

  return (
    <div className='w-full overflow-x-auto'>
      <div className='rounded-xl border border-border/60 shadow-sm min-w-[1600px]'>
        <Table className='w-full text-[12px]'>
          <TableHeader className='bg-background/50 sticky top-0 z-10'>
            {table.getHeaderGroups().map(headerGroup => (
              <TableRow
                key={headerGroup.id}
                className='border-b border-border/60 h-6'
              >
                {headerGroup.headers.map(header => {
                  return (
                    <TableHead
                      key={header.id}
                      className='font-semibold py-0.5 px-1  text-[12px] h-6 overflow-hidden'
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
                    className='hover:bg-muted transition-colors border-b border-border/40 h-6'
                  >
                    {row.getVisibleCells().map(cell => (
                      <TableCell
                        key={cell.id}
                        className='py-0 px-1 text-[12px] h-6 overflow-hidden'
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
                      <TableRow className='bg-sky-100/50 dark:bg-sky-900/20 border-l-2 border-l-sky-500 dark:border-l-sky-400 hover:bg-sky-100/50 dark:hover:bg-sky-900/20 h-5'>
                        {/* Columnas vacías hasta Descripción Cargo */}
                        <TableCell
                          colSpan={9}
                          className='py-0 px-0.5'
                        ></TableCell>
                        <TableCell className='font-semibold text-[12px] text-sky-700 dark:text-sky-300 uppercase tracking-wide py-0 px-0.5'>
                          Código
                        </TableCell>

                        {/* Descripción Cargo */}
                        <TableCell
                          colSpan={2}
                          className='text-center font-semibold text-[12px] text-sky-700 dark:text-sky-300 uppercase tracking-wide py-0 px-0.5'
                        >
                          Descripción Cargo
                        </TableCell>

                        {/* Cantidad */}
                        <TableCell className='font-semibold text-[12px] text-sky-700 dark:text-sky-300 text-right uppercase tracking-wide py-0 px-0.5'>
                          Cantidad
                        </TableCell>
                        {/* Precio Unit. */}
                        <TableCell className='font-semibold text-[12px] text-sky-700 dark:text-sky-300 text-right uppercase tracking-wide py-0 px-0.5'>
                          Precio Unit.
                        </TableCell>
                        {/* Subtotal */}
                        <TableCell className='font-semibold text-[12px] text-sky-700 dark:text-sky-300 text-right uppercase tracking-wide py-0 px-0.5'>
                          Subtotal
                        </TableCell>
                        {/* Facturar - vacío */}
                        <TableCell className='py-0 px-0.5'></TableCell>
                      </TableRow>
                      {/* Filas de cargos */}
                      {row.original.cargos.map((cargo, cargoIndex) =>
                        renderCargoRow(cargo, index, cargoIndex)
                      )}
                      {/* Separador después de los cargos */}
                      <TableRow className='h-1'>
                        <TableCell
                          colSpan={columns.length}
                          className='p-0 bg-slate-50/30 dark:bg-slate-900/30 border-b border-border/60'
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
