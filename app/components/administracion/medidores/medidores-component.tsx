import { LayoutList, Plus } from 'lucide-react';
import { motion } from 'motion/react';
import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';

import type {
  MedidorListItem,
  MedidorModalState
} from '~/components/administracion/medidores/medidores-types';
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
import { administracionService } from '~/services/administracionService';
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
  readonly medidores: MedidorListItem[];
}

export default function MedidoresComponent({
  medidores: initialMedidores
}: MedidoresComponentProps) {
  const [medidores, setMedidores] =
    useState<MedidorListItem[]>(initialMedidores);
  const [selectedMedidor, setSelectedMedidor] =
    useState<MedidorListItem | null>(null);
  const [modalsState, setModalsState] = useState<MedidorModalState>(
    createInitialMedidorModalState()
  );
  const [isFetching, setIsFetching] = useState(false);
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
      const result = await administracionService.getMedidoresData();
      if (result.data?.medidores) {
        setMedidores(result.data.medidores);
      }
    } catch (error) {
      console.error('Error al recargar los medidores', error);
      toast.error('Error al recargar los medidores.');
    } finally {
      setIsFetching(false);
    }
  }, []);

  const handleAdd = useCallback(() => {
    navigate(MEDIDORES_CREAR_ROUTE);
  }, [navigate]);

  const handleEdit = useCallback(
    (medidor: MedidorListItem) => {
      navigate(getMedidorEditUrl(medidor.idMedidor));
    },
    [navigate]
  );

  const handleAsociarSubempalme = useCallback((medidor: MedidorListItem) => {
    setSelectedMedidor(medidor);
    setModalsState(prev => ({
      ...prev,
      asociarSubempalme: { isOpen: true }
    }));
  }, []);

  const handleDeleteMedidor = useCallback((medidor: MedidorListItem) => {
    setSelectedMedidor(medidor);
    setModalsState(prev => ({
      ...prev,
      delete: { isOpen: true }
    }));
  }, []);

  const handleConfirmDelete = useCallback(async () => {
    if (!isValidMedidorForOperation(selectedMedidor)) {
      setModalsState(prev => ({
        ...prev,
        delete: { isOpen: false }
      }));
      return;
    }

    try {
      await fetch(`/MedidorEliminar/${selectedMedidor.idMedidor}`, {
        method: 'DELETE'
      });
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
      setModalsState(prev => ({
        ...prev,
        delete: { isOpen: false }
      }));
    }
  }, [selectedMedidor, refetchMedidores]);

  const mechanicalEase = [0.25, 0.1, 0.25, 1] as const;

  if (isFetching && medidores.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto p-4 sm:p-6">
          <div className="flex items-center justify-center py-12 sm:py-20">
            <LoadingSpinner />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-4 sm:p-6 space-y-6">
        <header>
          <ModernHeader
            title="Medidores"
            description="Gestiona los medidores del sistema"
            actions={
              <div className="flex gap-2">
                <ExportButton
                  data={filteredMedidores}
                  columns={medidorColumns}
                  filename="medidores"
                  size="sm"
                />
                <Button onClick={handleAdd} variant="default" size="sm">
                  <Plus className="mr-2 h-4 w-4" />
                  Agregar Medidor
                </Button>
              </div>
            }
          />
          <div className="industrial-divider mt-4" />
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
          <Card className="overflow-hidden border border-border bg-card shadow-sm">
            <CardHeader className="p-4 pb-3">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-accent text-accent-foreground border border-border">
                  <LayoutList className="h-4 w-4" />
                </div>
                <div>
                  <CardTitle className="text-xs font-bold uppercase tracking-wide text-foreground">
                    Listado de Medidores
                  </CardTitle>
                  <CardDescription className="text-xs mt-0.5 text-muted-foreground">
                    {filteredMedidores.length} medidor
                    {filteredMedidores.length !== 1 ? 'es' : ''}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <div className="industrial-divider" />
            <CardContent className="relative p-4">
              {isFetching && (
                <div className="absolute inset-0 bg-background flex items-center justify-center rounded-xl z-10">
                  <LoadingSpinner />
                </div>
              )}
              <div className="overflow-x-auto -mx-1">
                <VirtualDataTable
                  columns={columns({
                    onEdit: handleEdit,
                    onAsociarSubempalme: handleAsociarSubempalme,
                    onDelete: handleDeleteMedidor
                  })}
                  data={filteredMedidores}
                  searchPlaceholder="Buscar por serie, modelo o acometida..."
                  estimateRowHeight={55}
                  maxHeight="650px"
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <DeleteConfirmationDialog
          isOpen={modalsState.delete.isOpen}
          onClose={() =>
            setModalsState(prev => ({
              ...prev,
              delete: { isOpen: false }
            }))
          }
          onConfirm={handleConfirmDelete}
          medidor={selectedMedidor}
        />

        <AsociarSubempalmeModal
          isOpen={modalsState.asociarSubempalme.isOpen}
          onClose={() =>
            setModalsState(prev => ({
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
