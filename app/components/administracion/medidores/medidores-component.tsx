import { Plus } from 'lucide-react';
import { toast } from 'sonner';

import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router';

import { useAuth } from '~/context/AuthContext';
import { VirtualDataTable } from '~/components/data-table/virtual-data-table';
import { LoadingSpinner } from '~/components/loading-spinner';
import { ExportButton } from '~/components/shared/export-button';
import { ModernHeader } from '~/components/shared/modern-header';
import { Button } from '~/components/ui/button';
import { Card, CardContent } from '~/components/ui/card';
import { useExportMedidores } from '~/hooks/administracion/use-export-medidores';
import { useMedidorFilters } from '~/hooks/administracion/use-medidor-filters';
import api from '~/lib/api';
import type { GetMedidores, MedidorModalState } from '~/types/administracion';
import type { Marca } from '~/types/mantencion';
import {
  createInitialMedidorModalState,
  extractMedidorErrorMessage,
  getMedidorEditUrl,
  getMedidorPermissions,
  isValidMedidorForOperation,
  MEDIDORES_CREAR_ROUTE,
  MEDIDORES_ROUTE
} from '~/utils/administracion';

import { AsociarSubempalmeModal } from './asociar-subempalme-modal';
import { columns } from './columns';
import { DeleteConfirmationDialog } from './delete-confirm-dialog';
import { FilterSummary } from './filter-summary';
import {
  type MedidorFilters,
  MedidorFiltersComponent
} from './medidor-filters';

interface MedidoresComponentProps {
  readonly medidores: GetMedidores[];
  readonly marcas: Marca[];
}

export default function MedidoresComponent({
  medidores: initialMedidores
}: MedidoresComponentProps) {
  // Estado de datos
  const [medidores, setMedidores] = useState<GetMedidores[]>(initialMedidores);
  const [selectedMedidor, setSelectedMedidor] = useState<GetMedidores | null>(null);

  // Estado unificado de modales
  const [modalsState, setModalsState] = useState<MedidorModalState>(
    createInitialMedidorModalState()
  );

  // Estado de carga (sin estado muerto)
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

  // Dependencias
  const navigate = useNavigate();
  const { canCreate, canEdit } = useAuth();

  // Permisos del usuario actual
  const permissions = getMedidorPermissions(canCreate, canEdit, MEDIDORES_ROUTE);

  /**
   * Sincronizar medidores cuando los datos del loader cambian
   */
  useEffect(() => {
    setMedidores(initialMedidores);
  }, [initialMedidores]);

  const handleFiltersChange = useCallback((newFilters: MedidorFilters) => {
    setFilters(newFilters);
  }, []);

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

  /**
   * Navega a la página de crear medidor
   */
  const handleAdd = useCallback(() => {
    navigate(MEDIDORES_CREAR_ROUTE);
  }, [navigate]);

  /**
   * Navega a la página de editar medidor
   */
  const handleEdit = useCallback(
    (medidor: GetMedidores) => {
      navigate(getMedidorEditUrl(medidor.codigo));
    },
    [navigate]
  );

  /**
   * Abre el modal para asociar subempalme a un medidor
   */
  const handleAsociarSubempalme = useCallback((medidor: GetMedidores) => {
    setSelectedMedidor(medidor);
    setModalsState((prev) => ({
      ...prev,
      asociarSubempalme: { isOpen: true }
    }));
  }, []);

  /**
   * Abre el diálogo de confirmación de eliminación
   */
  const handleDeleteMedidor = useCallback((medidor: GetMedidores) => {
    setSelectedMedidor(medidor);
    setModalsState((prev) => ({
      ...prev,
      delete: { isOpen: true }
    }));
  }, []);

  /**
   * Confirma y ejecuta la eliminación del medidor
   * Implementa early returns y manejo de errores centralizado
   */
  const handleConfirmDelete = useCallback(async () => {
    // Early return: validar que exista medidor seleccionado
    if (!isValidMedidorForOperation(selectedMedidor)) {
      setModalsState((prev) => ({
        ...prev,
        delete: { isOpen: false }
      }));
      return;
    }

    try {
      await api.delete(`/MedidorEliminar/${selectedMedidor.codigo}`);
      toast.success('Medidor eliminado exitosamente');
      await refetchMedidores();
      setSelectedMedidor(null);
    } catch (error) {
      const errorInfo = extractMedidorErrorMessage(
        error,
        'Error al eliminar el medidor'
      );
      toast.error(errorInfo.message);
    } finally {
      // Cerrar diálogo sin importar el resultado
      setModalsState((prev) => ({
        ...prev,
        delete: { isOpen: false }
      }));
    }
  }, [selectedMedidor, refetchMedidores]);

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
        {/* Header con acciones */}
        <ModernHeader
          title='Medidores'
          description='Gestiona los medidores del sistema'
          actions={
            <div className='flex gap-2'>
              <ExportButton
                data={filteredMedidores}
                columns={medidorColumns}
                filename='medidores'
                size='sm'
              />
              <Button
                onClick={handleAdd}
                variant='default'
                size='sm'
                disabled={!permissions.hasCreatePermission}
                title={
                  !permissions.hasCreatePermission
                    ? 'No tiene permisos para crear medidores'
                    : ''
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
                  onDelete: handleDeleteMedidor,
                  canEdit: permissions.hasEditPermission
                })}
                data={filteredMedidores}
                searchPlaceholder='Buscar por número de serie, local o acometida...'
                estimateRowHeight={55}
                maxHeight='650px'
              />
            </div>
          </CardContent>
        </Card>

        {/* Diálogo de confirmación de eliminación */}
        <DeleteConfirmationDialog
          isOpen={modalsState.delete.isOpen}
          onClose={() =>
            setModalsState((prev) => ({
              ...prev,
              delete: { isOpen: false }
            }))
          }
          onConfirm={handleConfirmDelete}
          medidor={selectedMedidor}
        />

        {/* Modal para asociar subempalme */}
        <AsociarSubempalmeModal
          isOpen={modalsState.asociarSubempalme.isOpen}
          onClose={() =>
            setModalsState((prev) => ({
              ...prev,
              asociarSubempalme: { isOpen: false }
            }))
          }
          medidor={selectedMedidor}
          onSuccess={refetchMedidores}
        />
      </div>
    </div>
  );
}
