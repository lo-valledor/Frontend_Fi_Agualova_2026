import { Plus } from 'lucide-react';
import { toast } from 'sonner';

import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router';

import { useAuth } from '~/context/AuthContext';

import { VirtualDataTable } from '~/components/data-table/virtual-data-table';
import { ExportButton } from '~/components/shared/export-button';
import { ModernHeader } from '~/components/shared/modern-header';
import { Button } from '~/components/ui/button';
import { Card, CardContent } from '~/components/ui/card';
import {
  type ClientFilters,
  useClientFilters
} from '~/hooks/administracion/use-client-filters';
import { useExportClientes } from '~/hooks/administracion/use-export-clientes';
import { useClientes } from '~/hooks/use-administracion';
import type {
  ClienteModalState,
  ClienteLoadingState,
  GetClientes,
  GetClientesByRut,
  GetComunas,
  GetGiros
} from '~/types/administracion';
import {
  createInitialClienteModalState,
  createInitialLoadingState,
  extractClienteErrorMessage,
  getClientePermissions,
  getClienteEditUrl,
  normalizeClienteDetallado,
  isValidDetailedCliente,
  CLIENTES_CREAR_ROUTE,
  CLIENTES_ROUTE
} from '~/utils/administracion';

import { ClientFiltersComponent } from './client-filters';
import { columns } from './columns';
import { ClienteDetailsModal } from './detalles-cliente';
import { FilterSummary } from './filter-summary';

interface ClientesComponentProps {
  readonly clientes: GetClientes[];
  readonly giros: GetGiros[];
  readonly comunas: GetComunas[];
}

export default function ClientesComponent({
  clientes
}: ClientesComponentProps) {
  // Estado de datos
  const [clients] = useState<GetClientes[]>(clientes);
  const [detailedCliente, setDetailedCliente] =
    useState<GetClientesByRut | null>(null);

  // Estado unificado de modales
  const [modalsState, setModalsState] = useState<ClienteModalState>(
    createInitialClienteModalState()
  );

  // Estado de carga
  const [loadingState, setLoadingState] = useState<ClienteLoadingState>(
    createInitialLoadingState()
  );

  // Estado de filtros
  const [filters, setFilters] = useState<ClientFilters>({
    esEmpresa: 'all',
    comuna: 'all',
    codigoComuna: 'all',
    tieneContacto: 'all',
    tieneTelefono: 'all',
    tieneEmail: 'all'
  });

  // Dependencias
  const navigate = useNavigate();
  const { getClienteByRut } = useClientes();
  const { canCreate, canEdit } = useAuth();

  // Permisos del usuario actual
  const permissions = getClientePermissions(canCreate, canEdit, CLIENTES_ROUTE);

  const { filteredClients, filterStats, filterOptions } = useClientFilters(
    clients,
    filters
  );
  const { clientColumns } = useExportClientes();

  /**
   * Navega a la página de crear cliente
   */
  const handleAddCliente = useCallback(() => {
    navigate(CLIENTES_CREAR_ROUTE);
  }, [navigate]);

  /**
   * Navega a la página de editar cliente
   */
  const handleEditCliente = useCallback(
    (cliente: GetClientes) => {
      navigate(getClienteEditUrl(cliente.rut));
    },
    [navigate]
  );

  /**
   * Carga y muestra los detalles de un cliente
   * Elimina IIFE anidado por un useCallback adecuado
   * Implementa early returns para validaciones
   */
  const handleDetailsCliente = useCallback(
    async (cliente: GetClientes) => {
      // Early return: validar cliente
      if (!cliente?.rut) {
        toast.error('Cliente inválido');
        return;
      }

      // Comenzar carga
      setLoadingState({
        isLoading: true,
        rutLoading: cliente.rut
      });

      try {
        const clienteDetallado = await getClienteByRut(cliente.rut);
        console.log(clienteDetallado);
        // Early return: validar respuesta
        if (!isValidDetailedCliente(clienteDetallado)) {
          toast.error('Los detalles del cliente no son válidos');
          return;
        }

        // Normalizar y mostrar
        const clienteNormalizado = normalizeClienteDetallado(clienteDetallado);
        setDetailedCliente(clienteNormalizado);
        setModalsState(prev => ({
          ...prev,
          details: { isOpen: true }
        }));
      } catch (error) {
        const errorInfo = extractClienteErrorMessage(
          error,
          'Error al cargar los detalles del cliente'
        );
        toast.error(errorInfo.message);
      } finally {
        // Finalizar carga
        setLoadingState({
          isLoading: false,
          rutLoading: null
        });
      }
    },
    [getClienteByRut]
  );

  /**
   * Actualiza los filtros aplicados
   */
  const handleFiltersChange = useCallback((newFilters: ClientFilters) => {
    setFilters(newFilters);
  }, []);

  /**
   * Limpia todos los filtros aplicados
   */
  const handleClearFilters = useCallback(() => {
    setFilters({
      esEmpresa: 'all',
      comuna: 'all',
      codigoComuna: 'all',
      tieneContacto: 'all',
      tieneTelefono: 'all',
      tieneEmail: 'all'
    });
  }, []);

  return (
    <div className='min-h-screen bg-background'>
      <div className='container mx-auto p-3 space-y-4'>
        {/* Header con acciones */}
        <ModernHeader
          title='Clientes'
          description='Gestiona los clientes del sistema'
          actions={
            <div className='flex gap-2'>
              <ExportButton
                data={filteredClients}
                columns={clientColumns}
                filename='clientes'
                size='sm'
              />
              <Button
                onClick={handleAddCliente}
                variant='default'
                size='sm'
                disabled={!permissions.hasCreatePermission}
                title={
                  !permissions.hasCreatePermission
                    ? 'No tiene permisos para crear clientes'
                    : ''
                }
              >
                <Plus className='mr-2 h-4 w-4' />
                Agregar Cliente
              </Button>
            </div>
          }
        />

        {/* Componente de filtros */}
        <ClientFiltersComponent
          filters={filters}
          onFiltersChange={handleFiltersChange}
          onClearFilters={handleClearFilters}
          filterOptions={filterOptions}
        />

        {/* Resumen de filtros aplicados */}
        <FilterSummary
          totalClients={clients.length}
          filteredClients={filteredClients.length}
          activeFilters={filterStats.activeFilters}
          isFiltered={filterStats.isFiltered}
        />

        {/* Tabla de clientes */}
        <Card className='border border-border shadow-sm'>
          <CardContent className='p-4'>
            <div className='overflow-x-auto'>
              <VirtualDataTable
                columns={columns({
                  onDetails: handleDetailsCliente,
                  onEdit: handleEditCliente,
                  editingClienteRut: null,
                  detailingClienteRut: loadingState.rutLoading,
                  canEdit: permissions.hasEditPermission
                })}
                data={filteredClients}
                searchPlaceholder='Buscar por RUT, nombre o email...'
                estimateRowHeight={55}
                maxHeight='650px'
              />
            </div>
          </CardContent>
        </Card>

        {/* Modal de detalles de cliente */}
        <ClienteDetailsModal
          isOpen={modalsState.details.isOpen}
          onClose={() =>
            setModalsState(prev => ({
              ...prev,
              details: { isOpen: false }
            }))
          }
          cliente={detailedCliente}
        />
      </div>
    </div>
  );
}
