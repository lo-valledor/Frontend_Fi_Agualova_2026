import {
  type ColumnDef,
  type SortingState,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable
} from '@tanstack/react-table';
import { useVirtualizer } from '@tanstack/react-virtual';

import { useEffect, useRef, useState } from 'react';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '~/components/ui/table';
import { cn } from '~/lib/utils';

interface DataTableNichosVirtualizedProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  columnGroups: {
    id: string;
    title: string;
    columns: string[];
    className?: string;
  }[];
  onRowClick?: (row: TData) => void;
}

// Configuración de visibilidad responsiva para columnas
const responsiveColumnVisibility = {
  // En mobile (< 640px) solo mostrar columnas esenciales
  mobile: [
    'numero',
    'numero_serie',
    'estado_guardado',
    'consumo_energia_activa',
    'acciones'
  ],
  // En tablet portrait (640px - 768px) agregar algunas columnas
  tabletPortrait: [
    'numero',
    'local',
    'numero_serie',
    'estado_guardado',
    'energia_activa',
    'consumo_energia_activa',
    'acciones'
  ],
  // En tablet landscape (768px - 1024px) agregar más columnas
  tablet: [
    'numero',
    'local',
    'numero_serie',
    'estado_guardado',
    'energia_activa_anterior',
    'energia_activa',
    'consumo_energia_activa',
    'energia_reactiva',
    'consumo_energia_reactiva',
    'demanda_punta',
    'acciones'
  ],
  // En desktop pequeño (1024px - 1440px) casi todas las columnas
  desktopSmall: [
    'numero',
    'local',
    'tarifa',
    'numero_serie',
    'estado_guardado',
    'constante',
    'anio_anterior',
    'mes_anterior',
    'energia_activa_anterior',
    'energia_activa',
    'consumo_energia_activa',
    'energia_reactiva_anterior',
    'energia_reactiva',
    'consumo_energia_reactiva',
    'demanda_punta',
    'fecha_demanda_punta',
    'demanda_suministrada',
    'fecha_demanda_suministrada',
    'acciones'
  ],
  // En desktop (> 1440px) mostrar todas las columnas
  desktop: [] // vacío significa mostrar todas
};

export function DataTableNichosVirtualized<TData, TValue>({
  columns,
  data,
  columnGroups,
  onRowClick
}: Readonly<DataTableNichosVirtualizedProps<TData, TValue>>) {
  const [sorting, setSorting] = useState<SortingState>([
    { id: 'numero', desc: false } // Ordenar por # ascendente por defecto
  ]);
  const [screenSize, setScreenSize] = useState<
    'mobile' | 'tabletPortrait' | 'tablet' | 'desktopSmall' | 'desktop'
  >('desktop');

  // Refs para virtualización
  const tableContainerRef = useRef<HTMLDivElement>(null);

  // Hook para detectar el tamaño de pantalla
  useEffect(() => {
    const checkScreenSize = () => {
      const width = globalThis.innerWidth;
      if (width < 640) {
        setScreenSize('mobile');
      } else if (width < 768) {
        setScreenSize('tabletPortrait');
      } else if (width < 1024) {
        setScreenSize('tablet');
      } else if (width < 1440) {
        setScreenSize('desktopSmall');
      } else {
        setScreenSize('desktop');
      }
    };

    checkScreenSize();
    globalThis.addEventListener('resize', checkScreenSize);
    return () => globalThis.removeEventListener('resize', checkScreenSize);
  }, []);

  // Filtrar columnas según el tamaño de pantalla
  const getVisibleColumns = () => {
    if (screenSize === 'desktop') {
      return columns;
    }

    const visibleColumnIds = responsiveColumnVisibility[screenSize] || [];
    return columns.filter(column =>
      visibleColumnIds.includes(column.id as string)
    );
  };

  const visibleColumns = getVisibleColumns();

  // Filtrar grupos de columnas según las columnas visibles
  const getVisibleColumnGroups = () => {
    if (screenSize === 'desktop') {
      return columnGroups;
    }

    const visibleColumnIds = responsiveColumnVisibility[screenSize] || [];
    return columnGroups
      .map(group => ({
        ...group,
        columns: group.columns.filter(colId => visibleColumnIds.includes(colId))
      }))
      .filter(group => group.columns.length > 0);
  };

  const visibleColumnGroups = getVisibleColumnGroups();

  const table = useReactTable({
    data,
    columns: visibleColumns,
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    state: {
      sorting
    }
  });

  const { rows } = table.getRowModel();

  // Configurar el virtualizador
  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => tableContainerRef.current,
    estimateSize: () => {
      // Altura estimada según el tamaño de pantalla
      if (screenSize === 'mobile' || screenSize === 'tabletPortrait') return 40;
      if (screenSize === 'tablet') return 36;
      return 32; // desktop
    },
    overscan: 10 // Renderizar 10 filas extra arriba/abajo para scroll suave
  });

  // Función para renderizar encabezados agrupados
  const renderGroupedHeaders = () => {
    if (!visibleColumnGroups || visibleColumnGroups.length === 0) {
      return null;
    }

    const headerGroup = table.getHeaderGroups()[0];
    const groupedRow: Record<
      string,
      { span: number; title: string; className?: string }
    > = {};

    // Preparar grupos y contar spans
    for (const group of visibleColumnGroups) {
      groupedRow[group.id] = {
        span: 0,
        title: group.title,
        className: group.className
      };

      // Contar columnas en cada grupo
      for (const header of headerGroup.headers) {
        const columnId = header.column.id;
        if (group.columns.includes(columnId)) {
          groupedRow[group.id].span++;
        }
      }
    }

    return (
      <TableRow
        className={cn(
          'border-b border-border/20',
          screenSize === 'mobile' && 'h-10',
          screenSize === 'tabletPortrait' && 'h-10',
          screenSize === 'tablet' && 'h-9',
          (screenSize === 'desktopSmall' || screenSize === 'desktop') && 'h-8'
        )}
      >
        {headerGroup.headers.map(header => {
          const group = visibleColumnGroups.find(
            g =>
              g.columns.includes(header.column.id) &&
              g.columns[0] === header.column.id
          );

          if (group) {
            return (
              <TableHead
                key={`group-${group.id}`}
                colSpan={groupedRow[group.id].span}
                className={cn(
                  'text-center font-semibold text-xs tracking-wide border-r border-border/30 last:border-r-0 py-1 px-2',
                  groupedRow[group.id].className
                )}
              >
                {groupedRow[group.id].title}
              </TableHead>
            );
          }

          const belongsToGroup = visibleColumnGroups.some(
            g =>
              g.columns.includes(header.column.id) &&
              g.columns[0] !== header.column.id
          );

          return belongsToGroup ? null : (
            <TableHead
              key={`single-${header.id}`}
              className='text-center font-semibold text-xs tracking-wide border-r border-border/30 last:border-r-0 py-1 px-2'
            >
              {header.column.columnDef.header?.toString()}
            </TableHead>
          );
        })}
      </TableRow>
    );
  };

  return (
    <div className='space-y-3'>
      <div className='rounded-xl border border-border/60 bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/80'>
        <div className='relative overflow-hidden'>
          {/* Contenedor con scroll virtual */}
          <div
            ref={tableContainerRef}
            className='overflow-auto scrollbar-thin scrollbar-thumb-muted-foreground/30 scrollbar-track-muted/10 hover:scrollbar-thumb-muted-foreground/50 transition-colors'
            style={{ height: '600px' }} // Altura fija para el scroll virtual
          >
            {/* Tabla con ancho mínimo adaptivo */}
            <div
              className={cn(
                'w-full relative',
                screenSize === 'mobile' && 'min-w-[450px]',
                screenSize === 'tabletPortrait' && 'min-w-[600px]',
                screenSize === 'tablet' && 'min-w-[800px]',
                screenSize === 'desktopSmall' && 'min-w-[1200px]',
                screenSize === 'desktop' && 'min-w-[1400px]'
              )}
            >
              <Table>
                <TableHeader className='bg-muted/40 sticky top-0 z-10'>
                  {renderGroupedHeaders()}
                  {table.getHeaderGroups().map(headerGroup => (
                    <TableRow
                      key={headerGroup.id}
                      className='border-b border-border/40 h-8'
                    >
                      {headerGroup.headers.map(header => {
                        const meta = header.column.columnDef.meta as
                          | { className?: string }
                          | undefined;
                        return (
                          <TableHead
                            key={header.id}
                            className={cn(
                              'text-center text-xs font-medium border-r border-border/20 last:border-r-0 ',
                              screenSize === 'mobile' && 'h-10 py-2 px-1',
                              screenSize === 'tabletPortrait' &&
                                'h-10 py-2 px-1.5',
                              screenSize === 'tablet' && 'h-9 py-1.5 px-2',
                              (screenSize === 'desktopSmall' ||
                                screenSize === 'desktop') &&
                                'h-8 py-1 px-2',
                              meta?.className
                            )}
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
                  {rows.length > 0 ? (
                    <>
                      {/* Spacer superior para mantener la altura total */}
                      {rowVirtualizer.getVirtualItems().length > 0 &&
                        rowVirtualizer.getVirtualItems()[0].index > 0 && (
                          <tr>
                            <td
                              style={{
                                height: `${rowVirtualizer.getVirtualItems()[0].start}px`
                              }}
                            />
                          </tr>
                        )}

                      {/* Filas virtualizadas */}
                      {rowVirtualizer.getVirtualItems().map(virtualRow => {
                        const row = rows[virtualRow.index];
                        return (
                          <TableRow
                            key={row.id}
                            data-state={row.getIsSelected() && 'selected'}
                            data-index={virtualRow.index}
                            className={cn(
                              'text-center text-xs transition-colors cursor-pointer',
                              'hover:bg-muted/50 active:bg-muted/70 tap-highlight-transparent',
                              'border-b border-border/20 last:border-b-0',
                              screenSize === 'mobile' && 'h-10',
                              screenSize === 'tabletPortrait' && 'h-10',
                              screenSize === 'tablet' && 'h-9',
                              (screenSize === 'desktopSmall' ||
                                screenSize === 'desktop') &&
                                'h-8'
                            )}
                            onClick={() => onRowClick?.(row.original)}
                          >
                            {row.getVisibleCells().map(cell => {
                              const meta = cell.column.columnDef.meta as
                                | { className?: string }
                                | undefined;
                              return (
                                <TableCell
                                  key={cell.id}
                                  className={cn(
                                    'border-r border-border/10 last:border-r-0  text-xs',
                                    screenSize === 'mobile' && 'py-2 px-1',
                                    screenSize === 'tabletPortrait' &&
                                      'py-2 px-1.5',
                                    screenSize === 'tablet' && 'py-1.5 px-2',
                                    (screenSize === 'desktopSmall' ||
                                      screenSize === 'desktop') &&
                                      'py-1 px-2',
                                    meta?.className
                                  )}
                                >
                                  {flexRender(
                                    cell.column.columnDef.cell,
                                    cell.getContext()
                                  )}
                                </TableCell>
                              );
                            })}
                          </TableRow>
                        );
                      })}

                      {/* Spacer inferior para mantener la altura total */}
                      {rowVirtualizer.getVirtualItems().length > 0 &&
                        rowVirtualizer.getVirtualItems()[
                          rowVirtualizer.getVirtualItems().length - 1
                        ].index <
                          rows.length - 1 && (
                          <tr>
                            <td
                              style={{
                                height: `${
                                  rowVirtualizer.getTotalSize() -
                                  rowVirtualizer.getVirtualItems()[
                                    rowVirtualizer.getVirtualItems().length - 1
                                  ].end
                                }px`
                              }}
                            />
                          </tr>
                        )}
                    </>
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={visibleColumns.length}
                        className='h-24 text-center text-muted-foreground'
                      >
                        <div className='flex flex-col items-center justify-center space-y-1'>
                          <div className='text-xl'>📊</div>
                          <p className='text-xs font-medium'>
                            No se encontraron resultados
                          </p>
                          <p className='text-xs text-muted-foreground/70'>
                            Intente ajustar los filtros de búsqueda
                          </p>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>

          {/* Indicadores de scroll horizontal */}
          {(screenSize === 'mobile' || screenSize === 'tabletPortrait') && (
            <>
              <div className='absolute inset-y-0 right-0 w-6 bg-linear-to-l from-background via-background/60 to-transparent pointer-events-none z-20 flex items-center justify-end pr-1'>
                <div className='text-muted-foreground/60 text-xs animate-pulse'>
                  →
                </div>
              </div>
              <div className='absolute inset-y-0 left-0 w-6 bg-linear-to-r from-background via-background/60 to-transparent pointer-events-none z-20 flex items-center justify-start pl-1 opacity-0 transition-opacity'>
                <div className='text-muted-foreground/60 text-xs'>←</div>
              </div>
            </>
          )}

          {/* Sombra de scroll para tablets */}
          {screenSize === 'tablet' && (
            <>
              <div className='absolute inset-y-0 right-0 w-4 bg-linear-to-l from-background/70 to-transparent pointer-events-none z-10' />
              <div className='absolute inset-y-0 left-0 w-4 bg-linear-to-r from-background/70 to-transparent pointer-events-none z-10 opacity-0 transition-opacity' />
            </>
          )}
        </div>
      </div>

      {/* Información de scroll */}
      <div className='flex items-center justify-between text-xs text-muted-foreground px-2'>
        <span>{rows.length} registros totales (virtualizados)</span>
        <span className='text-xs'>Scroll para ver más</span>
      </div>
    </div>
  );
}
