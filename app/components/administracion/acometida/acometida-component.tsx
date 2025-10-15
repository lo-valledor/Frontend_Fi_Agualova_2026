import { Plus } from 'lucide-react';
import { toast } from 'sonner';

import { useState } from 'react';

import { useRevalidator } from 'react-router';

import { DataTable } from '~/components/data-table/data-table';
import { ExportButton } from '~/components/shared/export-button';
import { ModernHeader } from '~/components/shared/modern-header';
import { Button } from '~/components/ui/button';
import { Card, CardContent } from '~/components/ui/card';
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
    } catch (_error: any) {
      toast.error('Ha ocurrido un error al guardar la acometida');
    }
  };

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
                variant='outline'
                size='sm'
                className=''
              />
              <Button
                onClick={handleAddAcometida}
                className='bg-sky-600 hover:bg-sky-700'
                size='sm'
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
            <div className='overflow-x-auto'>
              <DataTable
                columns={columns({
                  onEdit: handleEditAcometida
                })}
                data={filteredAcometidas}
                searchPlaceholder='Buscar por código, ubicación o contrato...'
                defaultPageSize={10}
              />
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
