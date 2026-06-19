import { LayoutList, Plus } from 'lucide-react';
import { motion } from 'motion/react';
import { toast } from 'sonner';

import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router';

import { VirtualDataTable } from '~/components/data-table/virtual-data-table';
import { LoadingSpinner } from '~/components/loading-spinner';
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
import { useExportMedidores } from '~/hooks/administracion/use-export-medidores';
import { useMedidorFilters } from '~/hooks/administracion/use-medidor-filters';
import api from '~/lib/api';
import type { GetMedidores, MedidorModalState } from '~/types/administracion';
import type { Marca } from '~/types/mantencion';
import {
  createInitialMedidorModalState,
  extractMedidorErrorMessage,
  getMedidorEditUrl,
  isValidMedidorForOperation,
  MEDIDORES_CREAR_ROUTE
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

  
  const handleAdd = useCallback(() => {
    navigate(MEDIDORES_CREAR_ROUTE);
  }, [navigate]);

  
  const handleEdit = useCallback(
    (medidor: GetMedidores) => {
      navigate(getMedidorEditUrl(medidor.codigo));
    },
    [navigate]
  );

  
  const handleAsociarSubempalme = useCallback((medidor: GetMedidores) => {
    setSelectedMedidor(medidor);
    setModalsState((prev) => ({
      ...prev,
      asociarSubempalme: { isOpen: true }
    }));
  }, []);

  
  const handleDeleteMedidor = useCallback((medidor: GetMedidores) => {
    setSelectedMedidor(medidor);
    setModalsState((prev) => ({
      ...prev,
      delete: { isOpen: true }
    }));
  }, []);

  
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

  const mechanicalEase = [0.25, 0.1, 0.25, 1] as const;

  if (isFetching && medidores.length === 0) {
    return (
      <div className='min-h-screen bg-background'>
        <div className='container mx-auto p-4 sm:p-6'>
          <div className='flex items-center justify-center py-12 sm:py-20'>
            <LoadingSpinner />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-background'>
      <div className='container mx-auto p-4 sm:p-6 space-y-6'>
        <header>
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
                >
                  <Plus className='mr-2 h-4 w-4' />
                  Agregar Medidor
                </Button>
              </div>
            }
          />
          <div className='industrial-divider mt-4' />
        </header>

        <MedidorFiltersComponent
          filters={filters}
          onFiltersChange={handleFiltersChange}
          onClearFilters={handleClearFilters}
          filterOptions={filterOptions}
        />

        <FilterSummary
          totalMedidores={filterStats.total}
          filteredMedidores={filterStats.filtered}
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
                    Listado de Medidores
                  </CardTitle>
                  <CardDescription className='text-xs mt-0.5 text-muted-foreground'>
                    {filteredMedidores.length} medidor
                    {filteredMedidores.length !== 1 ? 'es' : ''}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <div className='industrial-divider' />
            <CardContent className='relative p-4'>
              {isFetching && (
                <div className='absolute inset-0 bg-background flex items-center justify-center rounded-xl z-10'>
                  <LoadingSpinner />
                </div>
              )}
              <div className='overflow-x-auto -mx-1'>
                <VirtualDataTable
                columns={columns({
                  onEdit: handleEdit,
                  onAsociarSubempalme: handleAsociarSubempalme,
                  onDelete: handleDeleteMedidor
                })}
                data={filteredMedidores}
                searchPlaceholder='Buscar por número de serie, local o acometida...'
                estimateRowHeight={55}
                maxHeight='650px'
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>

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
