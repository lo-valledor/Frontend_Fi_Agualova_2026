import { LayoutList, Plus } from 'lucide-react';
import { motion } from 'motion/react';
import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';

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
import {
  type ClientFilters,
  useClientFilters
} from '~/hooks/administracion/use-client-filters';
import { useExportClientes } from '~/hooks/administracion/use-export-clientes';
import { useClientes } from '~/hooks/use-administracion';
import type {
  ClienteLoadingState,
  ClienteModalState,
  GetClientes,
  GetClientesByRut,
  GetComunas,
  GetGiros
} from '~/types/administracion';
import {
  CLIENTES_CREAR_ROUTE,
  createInitialClienteModalState,
  createInitialLoadingState,
  extractClienteErrorMessage,
  getClienteEditUrl,
  isValidDetailedCliente,
  normalizeClienteDetallado
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

  const { filteredClients, filterStats, filterOptions } = useClientFilters(
    clients,
    filters
  );
  const { clientColumns } = useExportClientes();

  const handleAddCliente = useCallback(() => {
    navigate(CLIENTES_CREAR_ROUTE);
  }, [navigate]);

  const handleEditCliente = useCallback(
    (cliente: GetClientes) => {
      navigate(getClienteEditUrl(cliente.rut));
    },
    [navigate]
  );

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

  const handleFiltersChange = useCallback((newFilters: ClientFilters) => {
    setFilters(newFilters);
  }, []);

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

  const mechanicalEase = [0.25, 0.1, 0.25, 1] as const;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-4 sm:p-6 space-y-6">
        <header>
          <ModernHeader
            title="Clientes"
            description="Gestiona los clientes del sistema"
            actions={
              <div className="flex gap-2">
                <ExportButton
                  data={filteredClients}
                  columns={clientColumns}
                  filename="clientes"
                  size="sm"
                />
                <Button onClick={handleAddCliente} variant="default" size="sm">
                  <Plus className="mr-2 h-4 w-4" />
                  Agregar Cliente
                </Button>
              </div>
            }
          />
          <div className="industrial-divider mt-4" />
        </header>

        <ClientFiltersComponent
          filters={filters}
          onFiltersChange={handleFiltersChange}
          onClearFilters={handleClearFilters}
          filterOptions={filterOptions}
        />

        <FilterSummary
          totalClients={clients.length}
          filteredClients={filteredClients.length}
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
                    Listado de Clientes
                  </CardTitle>
                  <CardDescription className="text-xs mt-0.5 text-muted-foreground">
                    {filteredClients.length} cliente
                    {filteredClients.length !== 1 ? 's' : ''}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <div className="industrial-divider" />
            <CardContent className="p-4">
              <div className="overflow-x-auto -mx-1">
                <VirtualDataTable
                  columns={columns({
                    onDetails: handleDetailsCliente,
                    onEdit: handleEditCliente,
                    editingClienteRut: null,
                    detailingClienteRut: loadingState.rutLoading
                  })}
                  data={filteredClients}
                  searchPlaceholder="Buscar por RUT, nombre o email..."
                  estimateRowHeight={55}
                  maxHeight="650px"
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>

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
