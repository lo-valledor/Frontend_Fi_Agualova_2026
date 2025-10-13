import {
  type ColumnDef,
  type PaginationState,
  type SortingState,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable
} from '@tanstack/react-table';

import { useEffect, useState } from 'react';

import { DataTablePagination } from '~/components/data-table/data-table-pagination';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '~/components/ui/table';
import { cn } from '~/lib/utils';

interface DataTableNichosProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  columnGroups: {
    id: string;
    title: string;
    columns: string[];
    className?: string;
  }[];
  onRowClick?: (row: TData) => void;
  pagination: PaginationState;
  onPaginationChange: React.Dispatch<React.SetStateAction<PaginationState>>;
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

export function DataTableNichos<TData, TValue>({
  columns,
  data,
  columnGroups,
  onRowClick,
  pagination,
  onPaginationChange
}: DataTableNichosProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [screenSize, setScreenSize] = useState<
    'mobile' | 'tabletPortrait' | 'tablet' | 'desktopSmall' | 'desktop'
  >('desktop');

  // Hook para detectar el tamaño de pantalla con breakpoints mejorados
  useEffect(() => {
    const checkScreenSize = () => {
      const width = window.innerWidth;
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
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // Filtrar columnas según el tamaño de pantalla
  const getVisibleColumns = () => {
    if (screenSize === 'desktop') {
      return columns; // Mostrar todas las columnas
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
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onPaginationChange: onPaginationChange,
    state: {
      sorting,
      pagination
    }
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
    visibleColumnGroups.forEach(group => {
      groupedRow[group.id] = {
        span: 0,
        title: group.title,
        className: group.className
      };

      // Contar columnas en cada grupo
      headerGroup.headers.forEach(header => {
        const columnId = header.column.id;
        if (group.columns.includes(columnId)) {
          groupedRow[group.id].span++;
        }
      });
    });

    return (
      <TableRow
        className={cn(
          'border-b border-border/20',
          // Altura adaptativa para headers agrupados
          screenSize === 'mobile' && 'h-10',
          screenSize === 'tabletPortrait' && 'h-10',
          screenSize === 'tablet' && 'h-9',
          (screenSize === 'desktopSmall' || screenSize === 'desktop') && 'h-8'
        )}
      >
        {headerGroup.headers.map(header => {
          // Buscar si esta columna es la primera de algún grupo
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

          // Si no es la primera columna de ningún grupo, verificar si pertenece a algún grupo
          const belongsToGroup = visibleColumnGroups.some(
            g =>
              g.columns.includes(header.column.id) &&
              g.columns[0] !== header.column.id
          );

          // Si pertenece a un grupo, no renderizar nada (ya está cubierto por el colSpan)
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
      <div className='rounded-lg border border-border/60 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80'>
        <div className='relative overflow-hidden'>
          {/* Contenedor con scroll horizontal mejorado */}
          <div className='overflow-x-auto scrollbar-thin scrollbar-thumb-muted-foreground/30 scrollbar-track-muted/10 hover:scrollbar-thumb-muted-foreground/50 transition-colors'>
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
                              'text-center text-xs font-medium border-r border-border/20 last:border-r-0 whitespace-nowrap',
                              // Altura y padding adaptativo para headers
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
                  {table.getRowModel().rows?.length ? (
                    table.getRowModel().rows.map(row => (
                      <TableRow
                        key={row.id}
                        data-state={row.getIsSelected() && 'selected'}
                        className={cn(
                          'text-center text-xs transition-colors cursor-pointer',
                          'hover:bg-muted/50 active:bg-muted/70 tap-highlight-transparent',
                          'border-b border-border/20 last:border-b-0',
                          // Altura adaptativa según el dispositivo
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
                                'border-r border-border/10 last:border-r-0 whitespace-nowrap text-xs',
                                // Padding adaptativo para mejor experiencia táctil
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
                    ))
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
              {/* Indicador de scroll derecha */}
              <div className='absolute inset-y-0 right-0 w-6 bg-gradient-to-l from-background via-background/60 to-transparent pointer-events-none z-20 flex items-center justify-end pr-1'>
                <div className='text-muted-foreground/60 text-xs animate-pulse'>
                  →
                </div>
              </div>
              {/* Indicador de scroll izquierda (se muestra al hacer scroll) */}
              <div className='absolute inset-y-0 left-0 w-6 bg-gradient-to-r from-background via-background/60 to-transparent pointer-events-none z-20 flex items-center justify-start pl-1 opacity-0 transition-opacity'>
                <div className='text-muted-foreground/60 text-xs'>←</div>
              </div>
            </>
          )}

          {/* Sombra de scroll para tablets */}
          {screenSize === 'tablet' && (
            <>
              <div className='absolute inset-y-0 right-0 w-4 bg-gradient-to-l from-background/70 to-transparent pointer-events-none z-10' />
              <div className='absolute inset-y-0 left-0 w-4 bg-gradient-to-r from-background/70 to-transparent pointer-events-none z-10 opacity-0 transition-opacity' />
            </>
          )}
        </div>
      </div>

      {/* Paginación responsiva */}
      <div className='flex flex-col sm:flex-row items-center justify-between gap-2 px-2 py-1'>
        <div className='flex items-center text-xs text-muted-foreground order-2 sm:order-1'>
          <span className='hidden sm:inline'>Mostrando </span>
          {table.getRowModel().rows.length} de {data.length} registros
        </div>
        <div className='order-1 sm:order-2'>
          <DataTablePagination table={table} />
        </div>
      </div>
    </div>
  );
}
