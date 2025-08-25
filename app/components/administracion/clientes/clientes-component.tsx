import { Plus } from 'lucide-react';
import { toast } from 'sonner';

import { useState } from 'react';

import { useNavigate } from 'react-router';

import { DataTable } from '~/components/data-table/data-table';
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
  const { filteredClients, filterStats, filterOptions } = useClientFilters(
    clients,
    filters
  );
  const { clientColumns } = useExportClientes();

  const handleAddCliente = () => {
    router('/dashboard/administracion/clientes/crear');
  };

  const handleEditCliente = (cliente: GetClientes) => {
    router(`/dashboard/administracion/clientes/${cliente.rut}`);
  };

  const handleDetailsCliente = (cliente: GetClientes) => {
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
        console.error('Error al cargar detalles del cliente:', error);
        toast.error('Error al cargar los detalles del cliente');
        setIsDetailsOpen(false);
      } finally {
        setDetailingClienteRut(null);
      }
    })();
  };

  const handleFiltersChange = (newFilters: ClientFilters) => {
    setFilters(newFilters);
  };

  const handleClearFilters = () => {
    setFilters({
      esEmpresa: 'all',
      comuna: 'all',
      codigoComuna: 'all',
      tieneContacto: 'all',
      tieneTelefono: 'all',
      tieneEmail: 'all'
    });
  };

  return (
    <div className='min-h-screen bg-slate-50/30 dark:bg-slate-950/30'>
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
                variant='outline'
                size='sm'
                className=''
              />
              <Button
                onClick={handleAddCliente}
                className='bg-sky-600 hover:bg-sky-700 text-white'
                size='sm'
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
        <Card className='border border-slate-200/60 dark:border-slate-700/60 shadow-sm'>
          <CardContent className='p-4'>
            <div className='overflow-x-auto'>
              <DataTable
                columns={columns({
                  onDetails: handleDetailsCliente,
                  onEdit: handleEditCliente,
                  editingClienteRut,
                  detailingClienteRut
                })}
                data={filteredClients}
                searchPlaceholder='Buscar por RUT, nombre o email...'
                defaultPageSize={10}
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
