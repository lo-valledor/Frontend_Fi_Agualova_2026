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
import { useAcometidaFilters } from '~/hooks/administracion/use-acometida-filters';
import { useExportAcometidas } from '~/hooks/administracion/use-export-acometidas';
import api from '~/lib/api';
import type {
  Acometida,
  ActualizarAcometidaProps,
  ComboEmpalmes,
  ComboNichos,
  ComboSectores,
  ContratosDisponibles,
  CrearAcometidaProps
} from '~/types/administracion';

import {
  type AcometidaFilters,
  AcometidaFiltersComponent
} from './acometida-filters';
import { AcometidaForm } from './acometida-form';
import { columns } from './columns';
import { FilterSummary } from './filter-summary';

interface AcometidaComponentProps {
  acometidas: Acometida[];
  comboEmpalmes: ComboEmpalmes[];
  comboNichos: ComboNichos[];
  comboSectores: ComboSectores[];
  contratosDisponibles: ContratosDisponibles[];
}

export default function AcometidaComponent({
  acometidas,
  comboEmpalmes,
  comboNichos,
  comboSectores,
  contratosDisponibles
}: Readonly<AcometidaComponentProps>) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAcometida, setSelectedAcometida] = useState<Acometida | null>(
    null
  );
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [, setEditingAcometidaId] = useState<number | null>(null);
  const [globalFilter, setGlobalFilter] = useState('');
  const [sorting, setSorting] = useState<SortingState>([]);
  const tableContainerRef = useRef<HTMLDivElement>(null);

  // Estados para filtros
  const [filters, setFilters] = useState<AcometidaFilters>({
    empalmeDescripcion: '',
    nichoDescripcion: '',
    sectorDescripcion: '',
    limitePotenciaMin: '',
    limitePotenciaMax: '',
    tieneUbicacion: '',
    tieneMedidor: '',
    tieneLimitePotencia: ''
  });

  const revalidator = useRevalidator();

  // Permisos
  const { canCreate, canEdit } = useAuth();
  const route = '/dashboard/administracion/acometida';
  const hasCreatePermission = canCreate(route);
  const hasEditPermission = canEdit(route);

  const { acometidaColumns } = useExportAcometidas();
  const { filteredAcometidas, filterStats, filterOptions } =
    useAcometidaFilters(acometidas, filters);

  const handleFiltersChange = (newFilters: AcometidaFilters) => {
    setFilters(newFilters);
  };

  const handleClearFilters = () => {
    setFilters({
      empalmeDescripcion: '',
      nichoDescripcion: '',
      sectorDescripcion: '',
      limitePotenciaMin: '',
      limitePotenciaMax: '',
      tieneUbicacion: '',
      tieneMedidor: '',
      tieneLimitePotencia: ''
    });
  };

  const handleAddAcometida = () => {
    setSelectedAcometida(null);
    setModalMode('add');
    setIsModalOpen(true);
  };

  const handleEditAcometida = async (acometida: Acometida) => {
    if (!hasEditPermission) {
      toast.error('No tiene permisos para editar acometidas');
      return;
    }
    setEditingAcometidaId(acometida.acometidaId);
    setSelectedAcometida(acometida);
    setModalMode('edit');
    setIsModalOpen(true);
  };

  const handleSuccess = () => {
    setIsModalOpen(false);
    setSelectedAcometida(null);
    setModalMode('add');
    setEditingAcometidaId(null);
    revalidator.revalidate();
    toast.success(
      modalMode === 'add'
        ? 'Acometida creada exitosamente'
        : 'Acometida actualizada exitosamente'
    );
  };

  const handleSubmitForm = async (
    data: CrearAcometidaProps | ActualizarAcometidaProps
  ) => {
    try {
      if (modalMode === 'add') {
        await api.post('/crear-Nueva-Acometida', data as CrearAcometidaProps);
      } else {
        await api.put(`/modificar-Acometida-Existen`, {
          acometidaId: selectedAcometida?.acometidaId,
          ...data
        });
      }
      handleSuccess();
    } catch {
      toast.error('Ha ocurrido un error al guardar la acometida');
    }
  };

  // Table setup with react-table
  const table = useReactTable({
    data: filteredAcometidas,
    columns: columns({
      onEdit: handleEditAcometida,
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
          title='Acometidas'
          description='Gestiona las acometidas eléctricas del sistema'
          actions={
            <div className='flex gap-2'>
              <ExportButton
                data={filteredAcometidas}
                columns={acometidaColumns}
                filename='acometidas'
                size='sm'
              />
              <Button
                onClick={handleAddAcometida}
                variant='default'
                size='sm'
                disabled={!hasCreatePermission}
                title={
                  hasCreatePermission
                    ? ''
                    : 'No tiene permisos para crear acometidas'
                }
              >
                <Plus className='mr-2 h-4 w-4' />
                Agregar Acometida
              </Button>
            </div>
          }
        />

        {/* Filtros */}
        <AcometidaFiltersComponent
          filters={filters}
          onFiltersChange={handleFiltersChange}
          onClearFilters={handleClearFilters}
          filterOptions={filterOptions}
        />

        {/* Resumen de filtros */}
        <FilterSummary
          totalAcometidas={filterStats.total}
          filteredAcometidas={filterStats.filtered}
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
                  placeholder='Buscar por código, ubicación o contrato...'
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
        <AcometidaForm
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setEditingAcometidaId(null);
          }}
          onSubmit={handleSubmitForm}
          acometida={selectedAcometida}
          isLoading={false}
          comboEmpalmes={comboEmpalmes}
          comboNichos={comboNichos}
          contratosDisponibles={contratosDisponibles}
          comboSectores={comboSectores}
        />
      </div>
    </div>
  );
}
