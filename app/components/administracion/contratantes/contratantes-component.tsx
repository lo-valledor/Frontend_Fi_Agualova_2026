/**
 * Componente principal para Gestión de Contratantes
 *
 * Funcionalidades principales:
 * - Visualización de contratantes (personas y empresas) en tabla
 * - Creación de nuevos contratantes (navegación a /crear)
 * - Edición de contratantes existentes (navegación a /:rut)
 * - Visualización de detalles completos en modal
 * - Filtros avanzados por tipo, comuna, contacto, teléfono y email
 * - Exportación de datos a Excel
 * - Resumen de estadísticas de filtrado
 *
 * Flujo de trabajo:
 * 1. Usuario visualiza tabla de contratantes
 * 2. Puede aplicar filtros para buscar contratantes específicos
 * 3. Acciones disponibles:
 *    - Ver detalles completos (modal)
 *    - Editar (navegación a formulario)
 *    - Crear nuevo (navegación a formulario)
 * 4. Sistema muestra estadísticas de filtrado
 *
 * Arquitectura:
 * - DataTable con columnas personalizadas
 * - Filtros dinámicos con opciones extraídas de datos
 * - Modal ContratanteDetailsModal para visualización
 * - Navegación a rutas para crear/editar
 * - FilterSummary para estadísticas
 * - ExportButton para exportación
 *
 * Filtros disponibles:
 * - Es empresa (sí/no/todos)
 * - Comuna (select dinámico)
 * - Tiene contacto (sí/no/todos)
 * - Tiene teléfono (sí/no/todos)
 * - Tiene email (sí/no/todos)
 *
 * @param {Object} props - Props del componente
 * @param {GetContratante[]} props.contratantes - Lista de contratantes
 * @param {GetComunas[]} props.comunas - Comunas disponibles
 * @param {GetGiros[]} props.giros - Giros comerciales disponibles
 *
 * @example
 * ```tsx
 * export default function ContratantesRoute({ loaderData }) {
 *   return (
 *     <ContratantesComponent
 *       contratantes={loaderData.contratantes}
 *       comunas={loaderData.comunas}
 *       giros={loaderData.giros}
 *     />
 *   );
 * }
 * ```
 */
import { Plus, Search } from 'lucide-react';

import { useMemo, useState, useRef } from 'react';

import { useNavigate } from 'react-router';

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
import type {
  GetContratante,
  GetComunas,
  GetGiros
} from '~/types/administracion';

import { columns } from './columns';
import { ContratanteDetailsModal } from './detalles-contratante';
import { FilterSummary } from './filter-summary';
import {
  ContratanteFiltersComponent,
  type ContratanteFilters
} from './contratante-filters';

interface ContratantesComponentProps {
  contratantes: GetContratante[];
  comunas: GetComunas[];
  giros: GetGiros[];
}

interface FilterOptions {
  comunas: string[];
}

export default function ContratantesComponent({
  contratantes,
  comunas
}: Readonly<ContratantesComponentProps>) {
  const [contratantesList] = useState<GetContratante[]>(contratantes);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [detailedContratante, setDetailedContratante] =
    useState<GetContratante | null>(null);
  const [detailingContratanteRut] = useState<string | null>(null);
  const [filters, setFilters] = useState<ContratanteFilters>({
    esEmpresa: 'all',
    comuna: 'all',
    tieneContacto: 'all',
    tieneTelefono: 'all',
    tieneEmail: 'all'
  });
  const [globalFilter, setGlobalFilter] = useState('');
  const [sorting, setSorting] = useState<SortingState>([]);
  const tableContainerRef = useRef<HTMLDivElement>(null);

  const router = useNavigate();

  // Permisos
  const { canCreate, canEdit } = useAuth();
  const route = '/dashboard/administracion/contratantes';
  const hasCreatePermission = canCreate(route);
  const hasEditPermission = canEdit(route);

  // Filter options from data
  const filterOptions = useMemo((): FilterOptions => {
    const comunasNombres = [
      ...new Set(contratantesList.map(c => c.comuna).filter(Boolean))
    ].sort();

    return {
      comunas: comunasNombres
    };
  }, [contratantesList]);

  // Filtered contratantes
  const filteredContratantes = useMemo(() => {
    return contratantesList.filter(contratante => {
      // Filtro por tipo de contratante
      if (
        filters.esEmpresa &&
        filters.esEmpresa !== 'all' &&
        contratante.esEmpresa.toString() !== filters.esEmpresa
      ) {
        return false;
      }

      // Filtro por comuna
      if (
        filters.comuna &&
        filters.comuna !== 'all' &&
        contratante.comuna !== filters.comuna
      ) {
        return false;
      }

      // Filtro por contacto
      if (
        filters.tieneContacto &&
        filters.tieneContacto !== 'all' &&
        ((filters.tieneContacto === 'true' && !contratante.contacto) ||
          (filters.tieneContacto === 'false' && contratante.contacto))
      ) {
        return false;
      }

      // Filtro por teléfono
      if (
        filters.tieneTelefono &&
        filters.tieneTelefono !== 'all' &&
        ((filters.tieneTelefono === 'true' && !contratante.telefono) ||
          (filters.tieneTelefono === 'false' && contratante.telefono))
      ) {
        return false;
      }

      // Filtro por email
      if (
        filters.tieneEmail &&
        filters.tieneEmail !== 'all' &&
        ((filters.tieneEmail === 'true' && !contratante.email) ||
          (filters.tieneEmail === 'false' && contratante.email))
      ) {
        return false;
      }

      return true;
    });
  }, [contratantesList, filters]);

  // Filter stats
  const filterStats = useMemo(() => {
    const total = contratantesList.length;
    const filtered = filteredContratantes.length;
    const activeFilters = Object.values(filters).filter(
      value => value !== '' && value !== 'all'
    ).length;

    return {
      total,
      filtered,
      activeFilters,
      isFiltered: activeFilters > 0
    };
  }, [contratantesList.length, filteredContratantes.length, filters]);

  // Export columns
  const contratanteColumns = [
    { header: 'RUT', key: 'rut' },
    { header: 'Nombre', key: 'nombre' },
    { header: 'Apellido', key: 'apellido' },
    { header: 'Es Empresa', key: 'esEmpresa' },
    { header: 'Dirección', key: 'direccion' },
    { header: 'Comuna', key: 'comuna' },
    { header: 'Contacto', key: 'contacto' },
    { header: 'Teléfono', key: 'telefono' },
    { header: 'Email', key: 'email' }
  ];

  const handleAddContratante = () => {
    router('/dashboard/administracion/contratantes/crear');
  };

  const handleEditContratante = (contratante: GetContratante) => {
    router(`/dashboard/administracion/contratantes/editar/${contratante.rut}`);
  };

  const handleDetailsContratante = (contratante: GetContratante) => {
    setDetailedContratante(contratante);
    setIsDetailsOpen(true);
  };

  const handleFiltersChange = (newFilters: ContratanteFilters) => {
    setFilters(newFilters);
  };

  const handleClearFilters = () => {
    setFilters({
      esEmpresa: 'all',
      comuna: 'all',
      tieneContacto: 'all',
      tieneTelefono: 'all',
      tieneEmail: 'all'
    });
  };

  // Table setup with react-table
  const table = useReactTable({
    data: filteredContratantes,
    columns: columns({
      onDetails: handleDetailsContratante,
      detailingContratanteRut,
      comunas,
      canEdit: hasEditPermission
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
          title='Contratantes'
          description='Gestiona los contratantes del sistema'
          actions={
            <div className='flex gap-2'>
              <ExportButton
                data={filteredContratantes}
                columns={contratanteColumns}
                filename='contratantes'
                size='sm'
              />
              <Button
                onClick={handleAddContratante}
                variant='default'
                size='sm'
                disabled={!hasCreatePermission}
                title={
                  !hasCreatePermission
                    ? 'No tiene permisos para crear contratantes'
                    : ''
                }
              >
                <Plus className='mr-2 h-4 w-4' />
                Agregar Contratante
              </Button>
            </div>
          }
        />

        {/* Filters */}
        <ContratanteFiltersComponent
          filters={filters}
          onFiltersChange={handleFiltersChange}
          onClearFilters={handleClearFilters}
          filterOptions={filterOptions}
        />

        {/* Filter Summary */}
        <FilterSummary
          totalContratantes={contratantesList.length}
          filteredContratantes={filteredContratantes.length}
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
              <Table style={{ width: '100%' }}>
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
                          display: 'table'
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
        <ContratanteDetailsModal
          isOpen={isDetailsOpen}
          onClose={() => setIsDetailsOpen(false)}
          contratante={detailedContratante}
        />
      </div>
    </div>
  );
}
