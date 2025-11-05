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
  GetClientes,
  GetClientesByRut,
  GetComunas,
  GetGiros
} from '~/types/administracion';

import { ClientFiltersComponent } from './client-filters';
import { columns } from './columns';
import { ClienteDetailsModal } from './detalles-cliente';
import { FilterSummary } from './filter-summary';

interface ClientesComponentProps {
  clientes: GetClientes[];
  giros: GetGiros[];
  comunas: GetComunas[];
}

export default function ClientesComponent({
  clientes
}: Readonly<ClientesComponentProps>) {
  const [clients] = useState<GetClientes[]>(clientes);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [detailedCliente, setDetailedCliente] = useState<GetClientesByRut>();
  const [editingClienteRut] = useState<string | null>(null);
  const [detailingClienteRut, setDetailingClienteRut] = useState<string | null>(
    null
  );
  const [filters, setFilters] = useState<ClientFilters>({
    esEmpresa: 'all',
    comuna: 'all',
    codigoComuna: 'all',
    tieneContacto: 'all',
    tieneTelefono: 'all',
    tieneEmail: 'all'
  });

  const router = useNavigate();
  const { getClienteByRut } = useClientes();

  // Permisos
  const { canCreate, canEdit } = useAuth();
  const route = '/dashboard/administracion/clientes';
  const hasCreatePermission = canCreate(route);
  const hasEditPermission = canEdit(route);

  const { filteredClients, filterStats, filterOptions } = useClientFilters(
    clients,
    filters
  );
  const { clientColumns } = useExportClientes();

  const handleAddCliente = useCallback(() => {
    router('/dashboard/administracion/clientes/crear');
  }, [router]);

  const handleEditCliente = useCallback(
    (cliente: GetClientes) => {
      router(`/dashboard/administracion/clientes/${cliente.rut}`);
    },
    [router]
  );

  const handleDetailsCliente = useCallback(
    (cliente: GetClientes) => {
      (async () => {
        try {
          setDetailingClienteRut(cliente.rut);
          const clienteDetallado = await getClienteByRut(cliente.rut);
          // Convertir GetClienteById a GetClientesByRut mapeando email a correo
          const clienteConvertido: GetClientesByRut = {
            ...(clienteDetallado as unknown as GetClientesByRut),
            correo: clienteDetallado.email
          };
          setDetailedCliente(clienteConvertido);
          setIsDetailsOpen(true);
        } catch (error) {
          toast.error('Error al cargar los detalles del cliente', error as any);
          setIsDetailsOpen(false);
        } finally {
          setDetailingClienteRut(null);
        }
      })();
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

  return (
    <div className='min-h-screen bg-background'>
      <div className='container mx-auto p-3 space-y-4'>
        {/* Header */}
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
                disabled={!hasCreatePermission}
                title={
                  !hasCreatePermission
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

        {/* Filters */}
        <ClientFiltersComponent
          filters={filters}
          onFiltersChange={handleFiltersChange}
          onClearFilters={handleClearFilters}
          filterOptions={filterOptions}
        />

        {/* Filter Summary */}
        <FilterSummary
          totalClients={clients.length}
          filteredClients={filteredClients.length}
          activeFilters={filterStats.activeFilters}
          isFiltered={filterStats.isFiltered}
        />

        {/* Table */}
        <Card className='border border-border shadow-sm'>
          <CardContent className='p-4'>
            <div className='overflow-x-auto'>
              <VirtualDataTable
                columns={columns({
                  onDetails: handleDetailsCliente,
                  onEdit: handleEditCliente,
                  editingClienteRut,
                  detailingClienteRut,
                  canEdit: hasEditPermission
                })}
                data={filteredClients}
                searchPlaceholder='Buscar por RUT, nombre o email...'
                estimateRowHeight={55}
                maxHeight='650px'
              />
            </div>
          </CardContent>
        </Card>

        {/* Modal de Detalles */}
        <ClienteDetailsModal
          isOpen={isDetailsOpen}
          onClose={() => setIsDetailsOpen(false)}
          cliente={detailedCliente ?? null}
        />
      </div>
    </div>
  );
}
