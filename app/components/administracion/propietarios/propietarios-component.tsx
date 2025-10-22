/**
 * Componente principal para Gestión de Propietarios
 *
 * Funcionalidades principales:
 * - Visualización de propietarios en tabla
 * - Sincronización de datos con servicio externo
 * - Visualización de detalles completos en modal
 * - Filtros avanzados por comuna, teléfono, celular y email
 * - Exportación de datos a Excel
 * - Resumen de estadísticas de filtrado
 *
 * Flujo de trabajo:
 * 1. Usuario visualiza tabla de propietarios
 * 2. Puede aplicar filtros para buscar propietarios específicos
 * 3. Acciones disponibles:
 *    - Ver detalles completos (modal)
 *    - Sincronizar datos (botón de recarga)
 * 4. Sistema muestra estadísticas de filtrado
 *
 * Sincronización:
 * - Botón de sincronización manual con icono RefreshCw
 * - Llama a administracionService.sincronizarPropietarios()
 * - Feedback visual con estado de carga
 * - Toast notifications de éxito/error
 * - Recarga automática después de sincronizar
 *
 * Arquitectura:
 * - DataTable con columnas personalizadas
 * - Filtros dinámicos con opciones extraídas de datos
 * - Modal PropietarioDetailsModal para visualización
 * - FilterSummary para estadísticas
 * - ExportButton para exportación
 * - Hook useMemo para optimización de filtros
 *
 * Filtros disponibles:
 * - Comuna (select dinámico)
 * - Tiene teléfono (sí/no/todos)
 * - Tiene celular (sí/no/todos)
 * - Tiene email (sí/no/todos)
 *
 * @param {Object} props - Props del componente
 * @param {GetPropietario[]} props.propietarios - Lista de propietarios
 * @param {GetContratante[]} props.contratantes - Contratantes relacionados
 *
 * @example
 * ```tsx
 * export default function PropietariosRoute({ loaderData }) {
 *   return (
 *     <PropietariosComponent
 *       propietarios={loaderData.propietarios}
 *       contratantes={loaderData.contratantes}
 *     />
 *   );
 * }
 * ```
 */
import { RefreshCw, Search } from 'lucide-react';
import { toast } from 'sonner';

import React, { useMemo, useState, useRef } from 'react';

import { useAuth } from '~/context/AuthContext';
import { useVirtualizer } from '@tanstack/react-virtual';
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
  type SortingState
} from '@tanstack/react-table';

import { ExportButton } from '~/components/shared/export-button';
import { ModernHeader } from '~/components/shared/modern-header';
import { Button } from '~/components/ui/button';
import { Card, CardContent } from '~/components/ui/card';
import { Input } from '~/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '~/components/ui/table';
import { administracionService } from '~/services';
import type { GetContratante, GetPropietario } from '~/types/administracion';

import { columns } from './columns';
import { PropietarioDetailsModal } from './detalles-propietario';
import { FilterSummary } from './filter-summary';
import {
  PropietarioFiltersComponent,
  type PropietarioFilters
} from './propietario-filters';

interface PropietariosComponentProps {
  propietarios: GetPropietario[];
  contratantes: GetContratante[];
}

interface FilterOptions {
  comunas: string[];
}

export default function PropietariosComponent({
  propietarios
}: Readonly<PropietariosComponentProps>) {
  const [propietariosList] = useState<GetPropietario[]>(propietarios);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [detailedPropietario, setDetailedPropietario] =
    useState<GetPropietario | null>(null);
  const [detailingPropietarioRut] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [filters, setFilters] = useState<PropietarioFilters>({
    comuna: 'all',
    tieneTelefono: 'all',
    tieneCelular: 'all',
    tieneEmail: 'all'
  });
  const [globalFilter, setGlobalFilter] = useState('');
  const [sorting, setSorting] = useState<SortingState>([]);
  const tableContainerRef = useRef<HTMLDivElement>(null);

  // Permisos
  const { canEdit } = useAuth();
  const route = '/dashboard/administracion/propietarios';
  const hasEditPermission = canEdit(route);

  // Filter options from data
  const filterOptions = useMemo((): FilterOptions => {
    const comunas = [
      ...new Set(propietariosList.map(p => p.comuna).filter(Boolean))
    ].sort();

    return {
      comunas
    };
  }, [propietariosList]);

  // Filtered propietarios
  const filteredPropietarios = useMemo(() => {
    return propietariosList.filter(propietario => {
      // Filtro por comuna
      if (
        filters.comuna &&
        filters.comuna !== 'all' &&
        propietario.comuna !== filters.comuna
      ) {
        return false;
      }

      // Filtro por teléfono
      if (
        filters.tieneTelefono &&
        filters.tieneTelefono !== 'all' &&
        ((filters.tieneTelefono === 'true' && !propietario.telefono) ||
          (filters.tieneTelefono === 'false' && propietario.telefono))
      ) {
        return false;
      }

      // Filtro por celular
      if (
        filters.tieneCelular &&
        filters.tieneCelular !== 'all' &&
        ((filters.tieneCelular === 'true' && !propietario.celular) ||
          (filters.tieneCelular === 'false' && propietario.celular))
      ) {
        return false;
      }

      // Filtro por email
      if (
        filters.tieneEmail &&
        filters.tieneEmail !== 'all' &&
        ((filters.tieneEmail === 'true' && !propietario.email) ||
          (filters.tieneEmail === 'false' && propietario.email))
      ) {
        return false;
      }

      return true;
    });
  }, [propietariosList, filters]);

  // Filter stats
  const filterStats = useMemo(() => {
    const total = propietariosList.length;
    const filtered = filteredPropietarios.length;
    const activeFilters = Object.values(filters).filter(
      value => value !== '' && value !== 'all'
    ).length;

    return {
      total,
      filtered,
      activeFilters,
      isFiltered: activeFilters > 0
    };
  }, [propietariosList.length, filteredPropietarios.length, filters]);

  // Export columns
  const propietarioColumns = [
    { header: 'RUT', key: 'rut' },
    { header: 'Nombre', key: 'nombre' },
    { header: 'Comuna', key: 'comuna' },
    { header: 'Teléfono', key: 'telefono' },
    { header: 'Celular', key: 'celular' },
    { header: 'Email', key: 'email' }
  ];

  const handleDetailsPropietario = (propietario: GetPropietario) => {
    setDetailedPropietario(propietario);
    setIsDetailsOpen(true);
  };

  const handleSyncPropietarios = async () => {
    setIsSyncing(true);
    try {
      const result = await administracionService.sincronizarPropietarios();

      if (result.error) {
        toast.error(result.error);
        return;
      }

      if (result.data) {
        toast.success(
          `${result.data.mensaje} (${result.data.registrosAfectados} registros afectados)`
        );
        // Optionally reload the page or refresh data
        window.location.reload();
      }
    } catch (error) {
      console.error('Error al sincronizar propietarios:', error);
      toast.error('Error al sincronizar propietarios');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleFiltersChange = (newFilters: PropietarioFilters) => {
    setFilters(newFilters);
  };

  const handleClearFilters = () => {
    setFilters({
      comuna: 'all',
      tieneTelefono: 'all',
      tieneCelular: 'all',
      tieneEmail: 'all'
    });
  };

  // Table setup with react-table
  const table = useReactTable({
    data: filteredPropietarios,
    columns: columns({
      onDetails: handleDetailsPropietario,
      detailingPropietarioRut
    }),
    state: {
      sorting,
      globalFilter
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel()
  });

  // Virtualization setup
  const { rows } = table.getRowModel();
  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => tableContainerRef.current,
    estimateSize: () => 60, // Row height
    overscan: 10
  });

  return (
    <div className='min-h-screen bg-background'>
      <div className='container mx-auto p-3 space-y-4'>
        {/* Header */}
        <ModernHeader
          title='Propietarios'
          description='Gestiona los propietarios del sistema'
          actions={
            <div className='flex gap-2'>
              <ExportButton
                data={filteredPropietarios}
                columns={propietarioColumns}
                filename='propietarios'
                size='sm'
              />
              <Button
                onClick={handleSyncPropietarios}
                className='bg-emerald-600 hover:bg-emerald-700'
                size='sm'
                disabled={isSyncing || !hasEditPermission}
                title={
                  !hasEditPermission ? 'No tiene permisos para sincronizar' : ''
                }
              >
                <RefreshCw
                  className={`mr-2 h-4 w-4 ${isSyncing ? 'animate-spin' : ''}`}
                />
                {isSyncing ? 'Sincronizando...' : 'Sincronizar con Locales'}
              </Button>
            </div>
          }
        />

        {/* Filters */}
        <PropietarioFiltersComponent
          filters={filters}
          onFiltersChange={handleFiltersChange}
          onClearFilters={handleClearFilters}
          filterOptions={filterOptions}
        />

        {/* Filter Summary */}
        <FilterSummary
          totalPropietarios={propietariosList.length}
          filteredPropietarios={filteredPropietarios.length}
          activeFilters={filterStats.activeFilters}
          isFiltered={filterStats.isFiltered}
        />

        {/* Table */}
        <Card className='border border-border shadow-sm'>
          <CardContent className='p-4'>
            {/* Search */}
            <div className='flex justify-between items-center mb-3'>
              <div className='text-sm text-muted-foreground'>
                {rows.length} registros
              </div>
              <div className='relative w-64'>
                <Search className='absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
                <Input
                  placeholder='Buscar por RUT, nombre o email...'
                  value={globalFilter ?? ''}
                  onChange={event => setGlobalFilter(event.target.value)}
                  className='pl-8 h-8 text-sm'
                />
              </div>
            </div>

            {/* Virtualized Table */}
            <div
              ref={tableContainerRef}
              className='rounded-md border overflow-auto'
              style={{ height: '600px' }}
            >
              <Table style={{ tableLayout: 'fixed', width: '100%' }}>
                <TableHeader className='sticky top-0 z-10 bg-background'>
                  {table.getHeaderGroups().map(headerGroup => (
                    <TableRow
                      key={headerGroup.id}
                      className='hover:bg-transparent'
                    >
                      {headerGroup.headers.map(header => {
                        const columnDef = header.column.columnDef;
                        const width = columnDef.minSize || 150;
                        return (
                          <TableHead
                            key={header.id}
                            className='h-10 px-3 text-xs font-medium'
                            style={{
                              width: `${width}px`,
                              minWidth: `${width}px`,
                              maxWidth: `${columnDef.maxSize || width}px`
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
                <TableBody
                  style={{
                    height: `${rowVirtualizer.getTotalSize()}px`,
                    position: 'relative'
                  }}
                >
                  {rowVirtualizer.getVirtualItems().map(virtualRow => {
                    const row = rows[virtualRow.index];
                    return (
                      <TableRow
                        key={row.id}
                        data-index={virtualRow.index}
                        style={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          width: '100%',
                          height: '60px',
                          transform: `translateY(${virtualRow.start}px)`,
                          display: 'table',
                          tableLayout: 'fixed'
                        }}
                        className='border-b hover:bg-muted'
                      >
                        {row.getVisibleCells().map(cell => {
                          const columnDef = cell.column.columnDef;
                          const width = columnDef.minSize || 150;
                          return (
                            <TableCell
                              key={cell.id}
                              className='h-[60px] px-3 py-1 text-sm'
                              style={{
                                width: `${width}px`,
                                minWidth: `${width}px`,
                                maxWidth: `${columnDef.maxSize || width}px`
                              }}
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
                </TableBody>
              </Table>
              {rows.length === 0 && (
                <div className='h-20 flex items-center justify-center text-sm text-muted-foreground'>
                  No se encontraron resultados.
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Modal de Detalles */}
        <PropietarioDetailsModal
          isOpen={isDetailsOpen}
          onClose={() => setIsDetailsOpen(false)}
          propietario={detailedPropietario}
        />
      </div>
    </div>
  );
}
