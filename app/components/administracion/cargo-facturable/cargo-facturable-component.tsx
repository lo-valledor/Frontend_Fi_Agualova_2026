import { LayoutList, Plus } from 'lucide-react';
import { motion } from 'motion/react';
import { toast } from 'sonner';

import { useState } from 'react';

import { useRevalidator } from 'react-router';

import { VirtualDataTable } from '~/components/data-table/virtual-data-table';
import { ExportButton } from '~/components/shared/export-button';
import { ModernHeader } from '~/components/shared/modern-header';
import { Button } from '~/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '~/components/ui/card';
import { useCargoFilters } from '~/hooks/administracion/use-cargo-filters';
import api from '~/lib/api';
import type {
  CargoFacturableProps,
  CargoFacturableRow,
  CargoFacturableConceptos,
  CargoFacturableTarifas,
  CargoFacturableTiposMedidor
} from '~/types/administracion';

import CargoFacturableModalForm from './cargo-facturable-modal-form';
import { type CargoFilters, CargoFiltersComponent } from './cargo-filters';
import { columns } from './columns';
import { FilterSummary } from './filter-summary';

interface CargoFacturableComponentProps {
  cargos: CargoFacturableRow[];
  conceptos: CargoFacturableConceptos[];
  tarifas: CargoFacturableTarifas[];
  tiposMedidor: CargoFacturableTiposMedidor[];
}

export default function CargoFacturableComponent({
  cargos,
  conceptos,
  tarifas,
  tiposMedidor
}: Readonly<CargoFacturableComponentProps>) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCargo, setSelectedCargo] = useState<
    CargoFacturableRow | undefined
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

  const revalidator = useRevalidator();

  const { filteredCargos, filterStats } = useCargoFilters(cargos, filters);

  const handleAddCargo = () => {
    setSelectedCargo(undefined);
    setModalMode('add');
    setIsModalOpen(true);
  };

  const handleEditCargo = (cargo: CargoFacturableRow) => {
    setEditingCargoId(cargo.id);
    setSelectedCargo(cargo);
    setModalMode('edit');
    setIsModalOpen(true);
  };

  const handleSubmit = async (data: CargoFacturableProps) => {
    try {
      if (modalMode === 'add') {
        await api.post('cargos-facturables/crear', data);
      } else {
        await api.put('cargos-facturables/editar', data);
      }
      handleSuccess();
    } catch (error) {
      toast.error('Error al guardar el cargo facturable.', error as any);
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
    { key: 'id', header: 'ID' },
    { key: 'cuenta', header: 'Cuenta' },
    { key: 'codigoAgualova', header: 'Código' },
    { key: 'descripcion', header: 'Descripción' },
    { key: 'tipo', header: 'Tipo' },
    { key: 'fijoVariable', header: 'Modalidad' },
    { key: 'periodicoEventual', header: 'Frecuencia' },
    { key: 'idConcepto', header: 'Concepto' },
    { key: 'idTarifa', header: 'Tarifa' },
    { key: 'idTipoMedidor', header: 'Tipo Medidor' },
    { key: 'muestraValorCero', header: 'Mostrar Valor Cero' }
  ];

  const mechanicalEase = [0.25, 0.1, 0.25, 1] as const;

  return (
    <div className='min-h-screen bg-background'>
      <div className='container mx-auto p-4 sm:p-6 space-y-6'>
        <header>
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
                <Button onClick={handleAddCargo} variant='default' size='sm'>
                  <Plus className='mr-2 h-4 w-4' />
                  Agregar Cargo Facturable
                </Button>
              </div>
            }
          />
          <div className='industrial-divider mt-4' />
        </header>

        <CargoFiltersComponent
          filters={filters}
          onFiltersChange={handleFiltersChange}
          onClearFilters={handleClearFilters}
          conceptos={conceptos}
          tarifas={tarifas}
          tiposMedidor={tiposMedidor}
        />

        <FilterSummary
          totalCargos={cargos.length}
          filteredCargos={filteredCargos.length}
          activeFilters={filterStats.activeFilters}
          isFiltered={filterStats.isFiltered}
        />

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, ease: mechanicalEase }}
        >
          <Card className='overflow-hidden border border-border bg-card shadow-sm'>
            <CardHeader className='p-4 pb-3'>
              <div className='flex items-center gap-3'>
                <div className='flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-accent text-accent-foreground border border-border'>
                  <LayoutList className='h-4 w-4' />
                </div>
                <div>
                  <CardTitle className='text-xs font-bold uppercase tracking-wide text-foreground'>
                    Listado de Cargos Facturables
                  </CardTitle>
                  <CardDescription className='text-xs mt-0.5 text-muted-foreground'>
                    {filteredCargos.length} cargo
                    {filteredCargos.length !== 1 ? 's' : ''}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <div className='industrial-divider' />
            <CardContent className='p-4'>
              <div className='overflow-x-auto -mx-1'>
                <VirtualDataTable
                  columns={columns({
                    onEdit: handleEditCargo,
                    editingCargoId
                  })}
                  data={filteredCargos}
                  searchPlaceholder='Buscar por cuenta, código, descripción...'
                  estimateRowHeight={60}
                  maxHeight='600px'
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>

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
