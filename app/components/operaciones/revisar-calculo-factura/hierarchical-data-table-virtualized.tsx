import {
  type ColumnDef,
  type ExpandedState,
  type RowSelectionState,
  flexRender,
  getCoreRowModel,
  getExpandedRowModel,
  useReactTable
} from '@tanstack/react-table';
import { useVirtualizer } from '@tanstack/react-virtual';

import { useRef, useState, useMemo } from 'react';

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

interface HierarchicalDataTableVirtualizedProps {
  columns: ColumnDef<CalculoPrefacturaCompleto>[];
  data: CalculoPrefacturaCompleto[];
  onSelectionChange?: (selectedContratos: CalculoPrefacturaCompleto[]) => void;
}

// Tipo para representar una fila virtual (puede ser principal o cargo)
type VirtualRow =
  | {
      type: 'main';
      index: number;
      data: CalculoPrefacturaCompleto;
    }
  | {
      type: 'cargo-header';
      parentIndex: number;
    }
  | {
      type: 'cargo';
      parentIndex: number;
      cargoIndex: number;
      cargo: CalculoPrefacturaCargo;
    }
  | {
      type: 'cargo-separator';
      parentIndex: number;
    };

export function HierarchicalDataTableVirtualized({
  columns,
  data,
  onSelectionChange
}: Readonly<HierarchicalDataTableVirtualizedProps>) {
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
    getSubRows: row => (row.cargos ? [] : undefined)
  });

  // Calcular las filas virtuales (incluyendo filas principales + cargos expandidos)
  const virtualRows = useMemo<VirtualRow[]>(() => {
    const rows = table.getRowModel().rows;
    const result: VirtualRow[] = [];

    rows.forEach((row, index) => {
      // Agregar fila principal
      result.push({
        type: 'main',
        index,
        data: row.original
      });

      // Si está expandida, agregar filas de cargos
      if (
        row.getIsExpanded() &&
        row.original.cargos &&
        row.original.cargos.length > 0
      ) {
        // Encabezado de cargos
        result.push({
          type: 'cargo-header',
          parentIndex: index
        });

        // Cada cargo
        row.original.cargos.forEach((cargo, cargoIndex) => {
          result.push({
            type: 'cargo',
            parentIndex: index,
            cargoIndex,
            cargo
          });
        });

        // Separador
        result.push({
          type: 'cargo-separator',
          parentIndex: index
        });
      }
    });

    return result;
  }, [table.getRowModel().rows, expanded]);

  // Referencia al contenedor de la tabla
  const tableContainerRef = useRef<HTMLDivElement>(null);

  // Configuración del virtualizador
  const rowVirtualizer = useVirtualizer({
    count: virtualRows.length,
    getScrollElement: () => tableContainerRef.current,
    estimateSize: index => {
      const vRow = virtualRows[index];
      if (!vRow) return 24; // 24px por defecto (h-6)

      if (vRow.type === 'main') return 24; // h-6
      if (vRow.type === 'cargo-header') return 20; // h-5
      if (vRow.type === 'cargo') return 24; // h-6
      if (vRow.type === 'cargo-separator') return 4; // h-1

      return 24;
    },
    overscan: 10
  });

  const virtualItems = rowVirtualizer.getVirtualItems();
  const tableRows = table.getRowModel().rows;

  // Renderizar una fila de cargo
  const renderCargoRow = (cargo: CalculoPrefacturaCargo) => (
    <>
      <TableCell colSpan={9} className='py-0 px-0.5'></TableCell>
      <TableCell className='py-0 px-0.5'>
        <span className='font-medium col-span-2'>{cargo.codigoEnerlova}</span>
      </TableCell>
      <TableCell colSpan={2} className='pl-2 py-0 px-0.5'>
        <span className='font-medium col-span-2'>{cargo.descripcion}</span>
      </TableCell>
      <TableCell className='text-[12px] text-right py-0 px-0.5'>
        <span className='text-slate-700 dark:text-slate-300'>
          {cargo.cantidad?.toLocaleString('es-CL')}
        </span>
      </TableCell>
      <TableCell className='text-[12px] text-right font-medium text-emerald-700 dark:text-emerald-300 py-0 px-0.5'>
        ${(cargo.precioUnitario || 0).toLocaleString('es-CL')}
      </TableCell>
      <TableCell className='text-[12px] text-right font-semibold text-sky-700 dark:text-sky-300 py-0 px-0.5'>
        ${(cargo.subtotal || 0).toLocaleString('es-CL')}
      </TableCell>
    </>
  );

  // Renderizar encabezado de cargos
  const renderCargoHeader = () => (
    <>
      <TableCell colSpan={9} className='py-0 px-0.5'></TableCell>
      <TableCell className='font-semibold text-[12px] text-sky-700 dark:text-sky-300 uppercase tracking-wide py-0 px-0.5'>
        Código
      </TableCell>
      <TableCell
        colSpan={2}
        className='text-center font-semibold text-[12px] text-sky-700 dark:text-sky-300 uppercase tracking-wide py-0 px-0.5'
      >
        Descripción Cargo
      </TableCell>
      <TableCell className='font-semibold text-[12px] text-sky-700 dark:text-sky-300 text-right uppercase tracking-wide py-0 px-0.5'>
        Cantidad
      </TableCell>
      <TableCell className='font-semibold text-[12px] text-sky-700 dark:text-sky-300 text-right uppercase tracking-wide py-0 px-0.5'>
        Precio Unit.
      </TableCell>
      <TableCell className='font-semibold text-[12px] text-sky-700 dark:text-sky-300 text-right uppercase tracking-wide py-0 px-0.5'>
        Subtotal
      </TableCell>
      <TableCell className='py-0 px-0.5'></TableCell>
    </>
  );

  return (
    <div className='w-full overflow-x-auto'>
      <div
        ref={tableContainerRef}
        className='rounded-xl border border-border/60 shadow-sm overflow-auto'
        style={{ height: '600px' }}
      >
        <Table className='w-full text-[12px] min-w-[1600px]'>
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
            {tableRows.length === 0 ? (
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
                {virtualItems.map(virtualItem => {
                  const vRow = virtualRows[virtualItem.index];
                  if (!vRow) return null;

                  // Fila principal (contrato)
                  if (vRow.type === 'main') {
                    const row = tableRows[vRow.index];
                    if (!row) return null;

                    return (
                      <TableRow
                        key={`main-${vRow.index}`}
                        data-state={row.getIsSelected() && 'selected'}
                        className='hover:bg-muted transition-colors border-b border-border/40 h-6'
                        data-index={virtualItem.index}
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
                    );
                  }

                  // Encabezado de cargos
                  if (vRow.type === 'cargo-header') {
                    return (
                      <TableRow
                        key={`cargo-header-${vRow.parentIndex}`}
                        className='bg-sky-100/50 dark:bg-sky-900/20 border-l-2 border-l-sky-500 dark:border-l-sky-400 hover:bg-sky-100/50 dark:hover:bg-sky-900/20 h-5'
                        data-index={virtualItem.index}
                      >
                        {renderCargoHeader()}
                      </TableRow>
                    );
                  }

                  // Fila de cargo
                  if (vRow.type === 'cargo') {
                    return (
                      <TableRow
                        key={`cargo-${vRow.parentIndex}-${vRow.cargoIndex}`}
                        className='bg-sky-50/30 dark:bg-sky-900/10 border-l-2 border-l-sky-300 dark:border-l-sky-700 hover:bg-sky-50/50 dark:hover:bg-sky-900/20 transition-colors h-6'
                        data-index={virtualItem.index}
                      >
                        {renderCargoRow(vRow.cargo)}
                      </TableRow>
                    );
                  }

                  // Separador
                  if (vRow.type === 'cargo-separator') {
                    return (
                      <TableRow
                        key={`separator-${vRow.parentIndex}`}
                        className='h-1'
                        data-index={virtualItem.index}
                      >
                        <TableCell
                          colSpan={columns.length}
                          className='p-0 bg-slate-50/30 dark:bg-slate-900/30 border-b border-border/60'
                        ></TableCell>
                      </TableRow>
                    );
                  }

                  return null;
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
