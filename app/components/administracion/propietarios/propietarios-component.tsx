import { RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

import { useCallback, useMemo, useState } from 'react';

import { useAuth } from '~/context/AuthContext';
import { VirtualDataTable } from '~/components/data-table/virtual-data-table';
import { ExportButton } from '~/components/shared/export-button';
import { ModernHeader } from '~/components/shared/modern-header';
import { Button } from '~/components/ui/button';
import { Card, CardContent } from '~/components/ui/card';
import { administracionService } from '~/services/administracionService';
import type {
  GetContratante,
  GetPropietario,
  PropietarioModalState
} from '~/types/administracion';
import {
  createInitialPropietarioModalState,
  extractPropietarioErrorMessage,
  getPropietarioPermissions,
  getSyncStatusMessage
} from '~/utils/administracion';

import { columns } from './columns';
import { PropietarioDetailsModal } from './detalles-propietario';
import { FilterSummary } from './filter-summary';
import {
  PropietarioFiltersComponent,
  type PropietarioFilters
} from './propietario-filters';

interface PropietariosComponentProps {
  propietarios: GetPropietario[];
  contratantes: GetContratante[];
}

interface FilterOptions {
  comunas: string[];
}

const PROPIETARIOS_ROUTE = '/dashboard/administracion/propietarios';

/**
 * Componente principal para la gestión de propietarios
 * Implementa estado unificado de modales y manejo de errores centralizado
 * @param root0
 * @param root0.propietarios
 */
export default function PropietariosComponent({
  propietarios
}: Readonly<PropietariosComponentProps>) {
  // Estado de datos
  const [propietariosList] = useState<GetPropietario[]>(propietarios);
  const [detailedPropietario, setDetailedPropietario] =
    useState<GetPropietario | null>(null);

  // Estado unificado de modales
  const [modalsState, setModalsState] = useState<PropietarioModalState>(
    createInitialPropietarioModalState()
  );

  // Estado de sincronización
  const [isSyncing, setIsSyncing] = useState(false);

  // Estado de filtros
  const [filters, setFilters] = useState<PropietarioFilters>({
    comuna: 'all',
    tieneTelefono: 'all',
    tieneCelular: 'all',
    tieneEmail: 'all'
  });

  // Dependencias
  const { canEdit } = useAuth();

  // Permisos del usuario actual
  const permissions = getPropietarioPermissions(canEdit, PROPIETARIOS_ROUTE);

  // Filter options from data
  const filterOptions = useMemo((): FilterOptions => {
    const comunas = [
      ...new Set(propietariosList.map(p => p.comuna).filter(Boolean))
    ].sort();

    return {
      comunas
    };
  }, [propietariosList]);

  // Filtered propietarios
  const filteredPropietarios = useMemo(() => {
    return propietariosList.filter(propietario => {
      // Filtro por comuna
      if (
        filters.comuna &&
        filters.comuna !== 'all' &&
        propietario.comuna !== filters.comuna
      ) {
        return false;
      }

      // Filtro por teléfono
      if (
        filters.tieneTelefono &&
        filters.tieneTelefono !== 'all' &&
        ((filters.tieneTelefono === 'true' && !propietario.telefono) ||
          (filters.tieneTelefono === 'false' && propietario.telefono))
      ) {
        return false;
      }

      // Filtro por celular
      if (
        filters.tieneCelular &&
        filters.tieneCelular !== 'all' &&
        ((filters.tieneCelular === 'true' && !propietario.celular) ||
          (filters.tieneCelular === 'false' && propietario.celular))
      ) {
        return false;
      }

      // Filtro por email
      if (
        filters.tieneEmail &&
        filters.tieneEmail !== 'all' &&
        ((filters.tieneEmail === 'true' && !propietario.email) ||
          (filters.tieneEmail === 'false' && propietario.email))
      ) {
        return false;
      }

      return true;
    });
  }, [propietariosList, filters]);

  // Filter stats
  const filterStats = useMemo(() => {
    const total = propietariosList.length;
    const filtered = filteredPropietarios.length;
    const activeFilters = Object.values(filters).filter(
      value => value !== '' && value !== 'all'
    ).length;

    return {
      total,
      filtered,
      activeFilters,
      isFiltered: activeFilters > 0
    };
  }, [propietariosList.length, filteredPropietarios.length, filters]);

  // Export columns
  const propietarioColumns = [
    { header: 'RUT', key: 'rut' },
    { header: 'Nombre', key: 'nombre' },
    { header: 'Comuna', key: 'comuna' },
    { header: 'Teléfono', key: 'telefono' },
    { header: 'Celular', key: 'celular' },
    { header: 'Email', key: 'email' }
  ];

  /**
   * Abre el modal de detalles del propietario
   */
  const handleDetailsPropietario = useCallback(
    (propietario: GetPropietario) => {
      setDetailedPropietario(propietario);
      setModalsState(prev => ({
        ...prev,
        details: { isOpen: true }
      }));
    },
    []
  );

  /**
   * Sincroniza propietarios con locales
   * Implementa manejo de errores centralizado
   */
  const handleSyncPropietarios = useCallback(async () => {
    // Early return: validar que el usuario tenga permisos
    if (!permissions.hasEditPermission) {
      toast.error('No tiene permisos para sincronizar propietarios');
      return;
    }

    setIsSyncing(true);
    try {
      const result = await administracionService.sincronizarPropietarios();

      // Early return: validar respuesta con error
      if (result.error) {
        toast.error(result.error);
        return;
      }

      // Mostrar éxito y recargar
      if (result.data) {
        toast.success(
          `${result.data.mensaje} (${result.data.registrosAfectados} registros afectados)`
        );
        globalThis.location.reload();
      }
    } catch (error) {
      const errorInfo = extractPropietarioErrorMessage(
        error,
        'Error al sincronizar propietarios'
      );
      toast.error(errorInfo.message);
    } finally {
      setIsSyncing(false);
    }
  }, [permissions.hasEditPermission]);

  /**
   * Actualiza los filtros aplicados
   */
  const handleFiltersChange = useCallback((newFilters: PropietarioFilters) => {
    setFilters(newFilters);
  }, []);

  /**
   * Limpia todos los filtros aplicados
   */
  const handleClearFilters = useCallback(() => {
    setFilters({
      comuna: 'all',
      tieneTelefono: 'all',
      tieneCelular: 'all',
      tieneEmail: 'all'
    });
  }, []);

  return (
    <div className='min-h-screen bg-background'>
      <div className='container mx-auto p-3 space-y-4'>
        {/* Header con acciones */}
        <ModernHeader
          title='Propietarios'
          description='Gestiona los propietarios del sistema'
          actions={
            <div className='flex gap-2'>
              <ExportButton
                data={filteredPropietarios}
                columns={propietarioColumns}
                filename='propietarios'
                size='sm'
              />
              <Button
                onClick={handleSyncPropietarios}
                className='bg-emerald-600 hover:bg-emerald-700'
                size='sm'
                disabled={isSyncing || !permissions.hasEditPermission}
                title={
                  !permissions.hasEditPermission
                    ? 'No tiene permisos para sincronizar'
                    : ''
                }
              >
                <RefreshCw
                  className={`mr-2 h-4 w-4 ${isSyncing ? 'animate-spin' : ''}`}
                />
                {getSyncStatusMessage(isSyncing)}
              </Button>
            </div>
          }
        />

        {/* Filters */}
        <PropietarioFiltersComponent
          filters={filters}
          onFiltersChange={handleFiltersChange}
          onClearFilters={handleClearFilters}
          filterOptions={filterOptions}
        />

        {/* Filter Summary */}
        <FilterSummary
          totalPropietarios={propietariosList.length}
          filteredPropietarios={filteredPropietarios.length}
          activeFilters={filterStats.activeFilters}
          isFiltered={filterStats.isFiltered}
        />

        {/* Tabla */}
        <Card className='border border-border shadow-sm'>
          <CardContent className='p-4'>
            <VirtualDataTable
              columns={columns({
                onDetails: handleDetailsPropietario
              })}
              data={filteredPropietarios}
              searchPlaceholder='Buscar por RUT, nombre o email...'
              estimateRowHeight={60}
              maxHeight='600px'
            />
          </CardContent>
        </Card>

        {/* Modal de detalles del propietario */}
        <PropietarioDetailsModal
          isOpen={modalsState.details.isOpen}
          onClose={() =>
            setModalsState(prev => ({
              ...prev,
              details: { isOpen: false }
            }))
          }
          propietario={detailedPropietario}
        />
      </div>
    </div>
  );
}
