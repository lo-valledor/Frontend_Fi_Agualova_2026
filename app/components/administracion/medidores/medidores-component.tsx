import { Plus } from 'lucide-react';
import { toast } from 'sonner';

import { useCallback, useEffect, useState } from 'react';

import { useAuth } from '~/context/AuthContext';
import { VirtualDataTable } from '~/components/data-table/virtual-data-table';
import { LoadingSpinner } from '~/components/loading-spinner';
import { ExportButton } from '~/components/shared/export-button';
import { Button } from '~/components/ui/button';
import { Card, CardContent } from '~/components/ui/card';
import { useExportMedidores } from '~/hooks/administracion/use-export-medidores';
import { useMedidorFilters } from '~/hooks/administracion/use-medidor-filters';
import api from '~/lib/api';
import type { GetMedidores } from '~/types/administracion';
import type { Marca } from '~/types/mantencion';

import { AsociarSubempalmeModal } from './asociar-subempalme-modal';
import { columns } from './columns';
import { DeleteConfirmationDialog } from './delete-confirm-dialog';
import { FilterSummary } from './filter-summary';
import {
  type MedidorFilters,
  MedidorFiltersComponent
} from './medidor-filters';
import { ModernHeader } from '~/components/shared/modern-header';
import { useNavigate } from 'react-router';

export default function MedidoresComponent({
  medidores: initialMedidores
}: Readonly<{
  medidores: GetMedidores[];
  marcas: Marca[];
}>) {
  const [medidores, setMedidores] = useState<GetMedidores[]>(initialMedidores);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isAsociarModalOpen, setIsAsociarModalOpen] = useState(false);
  const [selectedMedidor, setSelectedMedidor] = useState<GetMedidores | null>(
    null
  );
  const [, setIsLoading] = useState(false);
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
    tieneAcometida: ''
  });

  const { medidorColumns } = useExportMedidores();
  const { filteredMedidores, filterStats, filterOptions } = useMedidorFilters(
    medidores,
    filters
  );

  const navigate = useNavigate();

  // Permisos
  const { canCreate, canEdit } = useAuth();
  const route = '/dashboard/administracion/medidores';
  const hasCreatePermission = canCreate(route);
  const hasEditPermission = canEdit(route);

  useEffect(() => {
    setMedidores(initialMedidores);
  }, [initialMedidores]);

  const handleFiltersChange = useCallback((newFilters: MedidorFilters) => {
    setFilters(newFilters);
  }, []);

  // A
  const handleClearFilters = useCallback(() => {
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
      tieneAcometida: ''
    });
  }, []);

  const refetchMedidores = useCallback(async () => {
    setIsFetching(true);
    try {
      const response = await api.get('buscarMedidor');
      const data = response.data as GetMedidores[];
      setMedidores(data);
    } catch (_error) {
      console.error('Error al recargar los medidores', _error);
      toast.error('Error al recargar los medidores.');
    } finally {
      setIsFetching(false);
    }
  }, []);

  const handleAdd = useCallback(() => {
    navigate('/dashboard/administracion/medidores/crear');
  }, [navigate]);

  const handleEdit = useCallback(
    (medidor: GetMedidores) => {
      navigate(`/dashboard/administracion/medidores/${medidor.codigo}`);
    },
    [navigate]
  );

  const handleAsociarSubempalme = useCallback((medidor: GetMedidores) => {
    setSelectedMedidor(medidor);
    setIsAsociarModalOpen(true);
  }, []);

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
      toast.error('Error al eliminar el medidor.', error as any);
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching && medidores.length === 0) {
    return (
      <div className='min-h-screen bg-background'>
        <div className='container mx-auto p-3'>
          <div className='flex items-center justify-center py-12 sm:py-20'>
            <LoadingSpinner />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-background'>
      <div className='container mx-auto p-3 space-y-4'>
        {/* Header */}
        <ModernHeader
          title='Medidores'
          description='Gestiona los medidores del sistema'
          actions={
            <div className='flex gap-2'>
              <ExportButton
                data={filteredMedidores}
                columns={medidorColumns}
                filename='clientes'
                size='sm'
              />
              <Button
                onClick={handleAdd}
                variant='default'
                size='sm'
                disabled={!hasCreatePermission}
                title={
                  hasCreatePermission
                    ? ''
                    : 'No tiene permisos para crear medidores'
                }
              >
                <Plus className='mr-2 h-4 w-4' />
                Agregar Medidor
              </Button>
            </div>
          }
        />

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
        <Card className='border border-border shadow-sm'>
          <CardContent className='relative p-2 sm:p-4 lg:p-6'>
            {isFetching && (
              <div className='absolute inset-0 bg-background flex items-center justify-center rounded-xl z-10'>
                <LoadingSpinner />
              </div>
            )}
            <div className='overflow-x-auto'>
              <VirtualDataTable
                columns={columns({
                  onEdit: handleEdit,
                  onAsociarSubempalme: handleAsociarSubempalme,
                  canEdit: hasEditPermission
                })}
                data={filteredMedidores}
                searchPlaceholder='Buscar por número de serie, local o acometida...'
                estimateRowHeight={55}
                maxHeight='650px'
              />
            </div>
          </CardContent>
        </Card>

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
