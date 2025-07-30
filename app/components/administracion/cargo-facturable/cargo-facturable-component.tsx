import { Plus } from 'lucide-react';
import { toast } from 'sonner';

import { useState } from 'react';

import { useRevalidator } from 'react-router';

import { DataTable } from '~/components/data-table/data-table';
import { Button } from '~/components/ui/button';
import { Card, CardContent } from '~/components/ui/card';
import { useCargoFilters } from '~/hooks/administracion/use-cargo-filters';
import api from '~/lib/api';
import type {
  ActualizarCargoFacturableProps,
  BuscarCargoFacturable,
  CrearCargoFacturableProps,
  GeCombosConceptos,
  GetCombosTarifas,
  GetCombosTiposMedidor,
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
  tiposMedidor,
}: CargoFacturableComponentProps) {
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
    tipoMedidor: 'all',
  });

  const revalidator = useRevalidator();
  const { filteredCargos, filterStats } = useCargoFilters(cargos, filters);

  const handleAddCargo = () => {
    setSelectedCargo(undefined);
    setModalMode('add');
    setIsModalOpen(true);
  };

  const handleEditCargo = async (cargo: BuscarCargoFacturable) => {
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
      tipoMedidor: 'all',
    });
  };

  return (
    <div className='container mx-auto p-2 sm:p-4 lg:p-6 space-y-4 sm:space-y-6'>
      {/* Header */}
      <div className='flex flex-col space-y-4 lg:flex-row lg:items-center lg:justify-between lg:space-y-0'>
        <div className='space-y-2'>
          <div className='flex items-center gap-3'>
            <h1 className='text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight text-sky-900 dark:text-sky-100'>
              Cargos Facturables
            </h1>
          </div>
          <p className='text-xs sm:text-sm text-muted-foreground max-w-2xl'>
            Gestiona los cargos facturables del sistema y aplica filtros
            avanzados
          </p>
        </div>
        <Button
          onClick={handleAddCargo}
          className='bg-sky-600 hover:bg-sky-700 text-white w-full sm:w-auto'
          size='sm'
        >
          <Plus className='mr-2 h-3 w-3 sm:h-4 sm:w-4' />
          <span className='text-xs sm:text-sm'>Agregar Cargo Facturable</span>
        </Button>
      </div>

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
      <Card className='border-0 shadow-lg bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm'>
        <CardContent className='relative p-2 sm:p-4 lg:p-6'>
          <div className='overflow-x-auto'>
            <DataTable
              columns={columns({
                onEdit: handleEditCargo,
                editingCargoId,
              })}
              data={filteredCargos}
              searchPlaceholder='Buscar por cuenta, código, descripción...'
              defaultPageSize={10}
            />
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
  );
}
