/**
 * Componente principal para Gestión de Cargos Facturables
 *
 * Funcionalidades principales:
 * - Visualización de cargos facturables en tabla
 * - Creación de nuevos cargos con selección de concepto, tarifa y tipo medidor
 * - Edición de cargos existentes
 * - Filtros avanzados por tipo, fijo/variable, periódico/eventual, concepto, tarifa y tipo medidor
 * - Exportación de datos a Excel
 * - Resumen de estadísticas de filtrado
 *
 * Flujo de trabajo:
 * 1. Usuario visualiza tabla de cargos facturables
 * 2. Puede aplicar filtros combinados para buscar cargos específicos
 * 3. Acciones disponibles:
 *    - Crear nuevo cargo (modal)
 *    - Editar cargo existente (modal)
 * 4. Sistema valida datos antes de guardar
 * 5. Recarga automática después de operaciones
 *
 * Arquitectura:
 * - DataTable con columnas personalizadas
 * - Hook useCargoFilters para filtrado
 * - Modal CargoFacturableModalForm para CRUD
 * - FilterSummary para estadísticas
 * - API endpoints:
 *   * POST /crear-cargo-facturable
 *   * PUT /actualizar-cargo-facturable/:id
 *
 * Filtros disponibles:
 * - Tipo (todos/1/2/3)
 * - Fijo/Variable (todos/F/V)
 * - Periódico/Eventual (todos/P/E)
 * - Concepto (select de conceptos disponibles)
 * - Tarifa (select de tarifas)
 * - Tipo de medidor (select de tipos)
 *
 * @param {Object} props - Props del componente
 * @param {BuscarCargoFacturable[]} props.cargos - Lista de cargos facturables
 * @param {GeCombosConceptos[]} props.conceptos - Conceptos disponibles
 * @param {GetCombosTarifas[]} props.tarifas - Tarifas disponibles
 * @param {GetCombosTiposMedidor[]} props.tiposMedidor - Tipos de medidor disponibles
 *
 * @example
 * ```tsx
 * export default function CargoFacturableRoute({ loaderData }) {
 *   return (
 *     <CargoFacturableComponent
 *       cargos={loaderData.cargos}
 *       conceptos={loaderData.conceptos}
 *       tarifas={loaderData.tarifas}
 *       tiposMedidor={loaderData.tiposMedidor}
 *     />
 *   );
 * }
 * ```
 */
import { Plus, Search } from 'lucide-react';
import { toast } from 'sonner';

import { useState, useRef } from 'react';

import { useRevalidator } from 'react-router';

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
import { useCargoFilters } from '~/hooks/administracion/use-cargo-filters';
import api from '~/lib/api';
import type {
  ActualizarCargoFacturableProps,
  BuscarCargoFacturable,
  CrearCargoFacturableProps,
  GeCombosConceptos,
  GetCombosTarifas,
  GetCombosTiposMedidor
} from '~/types/administracion';

import CargoFacturableModalForm from './cargo-facturable-modal-form';
import { type CargoFilters, CargoFiltersComponent } from './cargo-filters';
import { columns } from './columns';
import { FilterSummary } from './filter-summary';

interface CargoFacturableComponentProps {
  cargos: BuscarCargoFacturable[];
  conceptos: GeCombosConceptos[];
  tarifas: GetCombosTarifas[];
  tiposMedidor: GetCombosTiposMedidor[];
}

export default function CargoFacturableComponent({
  cargos,
  conceptos,
  tarifas,
  tiposMedidor
}: Readonly<CargoFacturableComponentProps>) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCargo, setSelectedCargo] = useState<
    BuscarCargoFacturable | undefined
  >(undefined);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [editingCargoId, setEditingCargoId] = useState<number | null>(null);
  const [filters, setFilters] = useState<CargoFilters>({
    tipo: 'all',
    fijoVariable: 'all',
    periodicoEventual: 'all',
    concepto: 'all',
    tarifa: 'all',
    tipoMedidor: 'all'
  });
  const [globalFilter, setGlobalFilter] = useState('');
  const [sorting, setSorting] = useState<SortingState>([]);
  const tableContainerRef = useRef<HTMLDivElement>(null);

  const revalidator = useRevalidator();

  // Permisos
  const { canCreate, canEdit } = useAuth();
  const route = '/dashboard/administracion/cargo-facturable';
  const hasCreatePermission = canCreate(route);
  const hasEditPermission = canEdit(route);

  const { filteredCargos, filterStats } = useCargoFilters(cargos, filters);

  const handleAddCargo = () => {
    setSelectedCargo(undefined);
    setModalMode('add');
    setIsModalOpen(true);
  };

  const handleEditCargo = async (cargo: BuscarCargoFacturable) => {
    if (!hasEditPermission) {
      toast.error('No tiene permisos para editar cargos facturables');
      return;
    }
    setEditingCargoId(cargo.id);
    setSelectedCargo(cargo);
    setModalMode('edit');
    setIsModalOpen(true);
  };

  const handleSubmit = async (
    data: CrearCargoFacturableProps | ActualizarCargoFacturableProps
  ) => {
    try {
      if (modalMode === 'add') {
        await api.post('cargoFacturable/crearCargoFacturableNuevo', data);
      } else {
        await api.put('cargoFacturable/modificarCargoFacturable', data);
      }
      handleSuccess();
    } catch (error) {
      console.error('Error al guardar el cargo facturable:', error);
      toast.error('Error al guardar el cargo facturable.');
    }
  };

  const handleSuccess = () => {
    setIsModalOpen(false);
    setSelectedCargo(undefined);
    setModalMode('add');
    setEditingCargoId(null);
    revalidator.revalidate();
    toast.success(
      modalMode === 'add'
        ? 'Cargo facturable creado exitosamente'
        : 'Cargo facturable actualizado exitosamente'
    );
  };

  const handleFiltersChange = (newFilters: CargoFilters) => {
    setFilters(newFilters);
  };

  const handleClearFilters = () => {
    setFilters({
      tipo: 'all',
      fijoVariable: 'all',
      periodicoEventual: 'all',
      concepto: 'all',
      tarifa: 'all',
      tipoMedidor: 'all'
    });
  };

  const cargoColumns = [
    { key: 'cuenta', header: 'Cuenta' },
    { key: 'codigoEnerlova', header: 'Código' },
    { key: 'descripcion', header: 'Descripción' },
    { key: 'tipo', header: 'Tipo' },
    { key: 'fijoVariable', header: 'Modalidad' },
    { key: 'periodicoEventual', header: 'Frecuencia' },
    { key: 'concepto', header: 'Concepto' },
    { key: 'tarifa', header: 'Tarifa' },
    { key: 'tipoMedidor', header: 'Tipo Medidor' }
  ];

  // Table setup with react-table
  const table = useReactTable({
    data: filteredCargos,
    columns: columns({
      onEdit: handleEditCargo,
      editingCargoId,
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
    estimateSize: () => 60,
    overscan: 10
  });

  return (
    <div className='min-h-screen bg-background'>
      <div className='container mx-auto p-3 space-y-4'>
        {/* Header */}
        <ModernHeader
          title='Cargos Facturables'
          description='Gestiona los cargos facturables del sistema'
          actions={
            <div className='flex gap-2'>
              <ExportButton
                data={filteredCargos}
                columns={cargoColumns}
                filename='cargos'
                size='sm'
              />
              <Button
                onClick={handleAddCargo}
                variant='default'
                size='sm'
                disabled={!hasCreatePermission}
                title={
                  !hasCreatePermission
                    ? 'No tiene permisos para crear cargos facturables'
                    : ''
                }
              >
                <Plus className='mr-2 h-4 w-4' />
                Agregar Cargo Facturable
              </Button>
            </div>
          }
        />

        {/* Filters */}
        <CargoFiltersComponent
          filters={filters}
          onFiltersChange={handleFiltersChange}
          onClearFilters={handleClearFilters}
          conceptos={conceptos}
          tarifas={tarifas}
          tiposMedidor={tiposMedidor}
        />

        {/* Filter Summary */}
        <FilterSummary
          totalCargos={cargos.length}
          filteredCargos={filteredCargos.length}
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
                  placeholder='Buscar por cuenta, código, descripción...'
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

        {/* Modal Form */}
        <CargoFacturableModalForm
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setEditingCargoId(null);
          }}
          onSubmit={handleSubmit}
          onSuccess={handleSuccess}
          cargo={selectedCargo}
          mode={modalMode}
          conceptos={conceptos}
          tarifas={tarifas}
          tiposMedidor={tiposMedidor}
        />
      </div>
    </div>
  );
}
