import { Plus } from 'lucide-react';
import { toast } from 'sonner';

import { useEffect, useState } from 'react';

import { DataTable } from '~/components/data-table/data-table';
import { LoadingSpinner } from '~/components/loading-spinner';
import { ExportButton } from '~/components/shared/export-button';
import { Button } from '~/components/ui/button';
import { Card, CardContent } from '~/components/ui/card';
import { useExportMedidores } from '~/hooks/administracion/use-export-medidores';
import { useMedidorFilters } from '~/hooks/administracion/use-medidor-filters';
import api from '~/lib/api';
import type {
  ActualizarMedidorProps,
  CrearMedidorProps,
  GetMedidores,
} from '~/types/administracion';
import type { Marca } from '~/types/mantencion';

import { AsociarSubempalmeModal } from './asociar-subempalme-modal';
import { columns } from './columns';
import { DeleteConfirmationDialog } from './delete-confirm-dialog';
import { FilterSummary } from './filter-summary';
import {
  MedidorFiltersComponent,
  type MedidorFilters,
} from './medidor-filters';
import { MedidorFormModal } from './medidor-form';

export default function MedidoresComponent({
  medidores: initialMedidores,
  marcas,
}: Readonly<{
  medidores: GetMedidores[];
  marcas: Marca[];
}>) {
  const [medidores, setMedidores] = useState<GetMedidores[]>(initialMedidores);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isAsociarModalOpen, setIsAsociarModalOpen] = useState(false);
  const [selectedMedidor, setSelectedMedidor] = useState<GetMedidores | null>(
    null
  );
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);

  // Estados para filtros
  const [filters, setFilters] = useState<MedidorFilters>({
    marca: '',
    tipo: '',
    modelo: '',
    estado: '',
    digitosMin: '',
    digitosMax: '',
    multiplicarMin: '',
    multiplicarMax: '',
    fechaInicioDesde: '',
    fechaInicioHasta: '',
    tieneUbicacion: '',
    tieneAcometida: '',
  });

  const { medidorColumns } = useExportMedidores();
  const { filteredMedidores, filterStats, filterOptions } = useMedidorFilters(
    medidores,
    filters
  );
  // Tipos de medidores hardcodeados como placeholder
  const [tipos] = useState([
    { id: 1, nombre: 'Monofásico' },
    { id: 2, nombre: 'Trifásico' },
  ]);

  useEffect(() => {
    setMedidores(initialMedidores);
  }, [initialMedidores]);

  const handleFiltersChange = (newFilters: MedidorFilters) => {
    setFilters(newFilters);
  };

  const handleClearFilters = () => {
    setFilters({
      marca: '',
      tipo: '',
      modelo: '',
      estado: '',
      digitosMin: '',
      digitosMax: '',
      multiplicarMin: '',
      multiplicarMax: '',
      fechaInicioDesde: '',
      fechaInicioHasta: '',
      tieneUbicacion: '',
      tieneAcometida: '',
    });
  };

  const refetchMedidores = async () => {
    setIsFetching(true);
    try {
      const response = await api.get('buscarMedidor');
      const data = response.data as GetMedidores[];
      setMedidores(data);
    } catch (_error) {
      toast.error('Error al recargar los medidores.');
    } finally {
      setIsFetching(false);
    }
  };

  const handleAdd = () => {
    setSelectedMedidor(null);
    setModalMode('add');
    setIsModalOpen(true);
  };

  const handleEdit = (medidor: GetMedidores) => {
    setSelectedMedidor(medidor);
    setModalMode('edit');
    setIsModalOpen(true);
  };

  const handleAsociarSubempalme = (medidor: GetMedidores) => {
    setSelectedMedidor(medidor);
    setIsAsociarModalOpen(true);
  };

  const handleSubmit = async (
    data: CrearMedidorProps | ActualizarMedidorProps,
    mode: 'add' | 'edit'
  ) => {
    setIsLoading(true);
    try {
      if (mode === 'add') {
        await api.post('/MedidorCrear', data);
        toast.success('Medidor creado exitosamente');
      } else {
        await api.put(`/MedidorModificar`, data);
        toast.success('Medidor actualizado exitosamente');
      }
      await refetchMedidores();
      setIsModalOpen(false);
    } catch (error) {
      toast.error('Error al guardar el medidor.');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedMedidor) return;

    setIsLoading(true);
    try {
      await api.delete(`/MedidorEliminar/${selectedMedidor.codigo}`);
      toast.success('Medidor eliminado exitosamente');
      await refetchMedidores();
      setIsDeleteDialogOpen(false);
      setSelectedMedidor(null);
    } catch (error) {
      toast.error('Error al eliminar el medidor.');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };



  if (isFetching && medidores.length === 0) {
    return (
      <div className='min-h-screen bg-slate-50/30 dark:bg-slate-950/30'>
        <div className='container mx-auto p-3'>
          <div className='flex items-center justify-center py-12 sm:py-20'>
            <LoadingSpinner />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-slate-50/30 dark:bg-slate-950/30'>
      <div className='container mx-auto p-3 space-y-4'>
        {/* Header */}
        <div className='flex items-center justify-between pb-3 border-b border-slate-200/60 dark:border-slate-700/60'>
          <div>
            <h1 className='text-xl font-semibold text-slate-900 dark:text-slate-100'>
              Medidores
            </h1>
            <p className='text-sm text-slate-600 dark:text-slate-400'>
              Gestiona los medidores del sistema
            </p>
          </div>
          <div className='flex items-center gap-2'>
            <ExportButton
               data={filteredMedidores}
               columns={medidorColumns}
               filename="medidores"
               variant="default"
               size="sm"
               className="gap-1.5 bg-green-600 hover:bg-green-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
             />
            <Button
              onClick={handleAdd}
              className='bg-sky-600 hover:bg-sky-700 text-white'
              size='sm'
            >
              <Plus className='mr-2 h-4 w-4' />
              Agregar Medidor
            </Button>
          </div>
        </div>

        {/* Filtros */}
        <MedidorFiltersComponent
          filters={filters}
          onFiltersChange={handleFiltersChange}
          onClearFilters={handleClearFilters}
          filterOptions={filterOptions}
        />

        {/* Resumen de filtros */}
        <FilterSummary
          totalMedidores={filterStats.total}
          filteredMedidores={filterStats.filtered}
          activeFilters={filterStats.activeFilters}
          isFiltered={filterStats.isFiltered}
        />

        {/* Tabla */}
        <Card className='border border-slate-200/60 dark:border-slate-700/60 shadow-sm'>
        <CardContent className='relative p-2 sm:p-4 lg:p-6'>
          {isFetching && (
            <div className='absolute inset-0 bg-white/50 dark:bg-black/50 flex items-center justify-center rounded-lg z-10'>
              <LoadingSpinner />
            </div>
          )}
          <div className='overflow-x-auto'>
            <DataTable
              columns={columns({
                onEdit: handleEdit,
                onAsociarSubempalme: handleAsociarSubempalme,
              })}
              data={filteredMedidores}
              searchPlaceholder='Buscar por serie, marca o código...'
              defaultPageSize={10}
            />
          </div>
          </CardContent>
        </Card>

        {/* Modales */}
        {isModalOpen && (
          <MedidorFormModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onSubmit={handleSubmit}
            medidor={selectedMedidor}
            mode={modalMode}
            isLoading={isLoading}
            marcas={marcas}
            tipos={tipos}
          />
        )}

        {isDeleteDialogOpen && (
          <DeleteConfirmationDialog
            isOpen={isDeleteDialogOpen}
            onClose={() => setIsDeleteDialogOpen(false)}
            onConfirm={handleConfirmDelete}
            medidor={selectedMedidor}
          />
        )}

        {isAsociarModalOpen && (
          <AsociarSubempalmeModal
            isOpen={isAsociarModalOpen}
            onClose={() => setIsAsociarModalOpen(false)}
            medidor={selectedMedidor}
            onSuccess={refetchMedidores}
          />
        )}
      </div>
    </div>
  );
}
