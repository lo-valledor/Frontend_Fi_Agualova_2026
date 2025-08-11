import { Plus } from 'lucide-react';
import { toast } from 'sonner';

import { useState } from 'react';

import { useRevalidator } from 'react-router';

import { DataTable } from '~/components/data-table/data-table';
import { ExportButton } from '~/components/shared/export-button';
import { Button } from '~/components/ui/button';
import { Card, CardContent } from '~/components/ui/card';
import {
  type ClientFilters,
  useClientFilters,
} from '~/hooks/administracion/use-client-filters';
import { useExportClientes } from '~/hooks/administracion/use-export-clientes';
import { useClientes } from '~/hooks/use-administracion';
import type {
  GetClientes,
  GetClientesByRut,
  GetComunas,
  GetGiros,
} from '~/types/administracion';

import { ClientFiltersComponent } from './client-filters';
import ClienteFormModal from './cliente-form-modal';
import { columns } from './columns';
import { ClienteDetailsModal } from './detalles-cliente';
import { FilterSummary } from './filter-summary';

interface ClientesComponentProps {
  clientes: GetClientes[];
  giros: GetGiros[];
  comunas: GetComunas[];
}

export default function ClientesComponent({
  clientes,
  giros,
  comunas,
}: Readonly<ClientesComponentProps>) {
  const [clients, setClients] = useState<GetClientes[]>(clientes);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCliente, setSelectedCliente] = useState<GetClientesByRut>();
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [detailedCliente, setDetailedCliente] = useState<GetClientesByRut>();
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [editingClienteRut, setEditingClienteRut] = useState<string | null>(
    null
  );
  const [detailingClienteRut, setDetailingClienteRut] = useState<string | null>(
    null
  );
  const [filters, setFilters] = useState<ClientFilters>({
    esEmpresa: 'all',
    comuna: 'all',
    codigoComuna: 'all',
    tieneContacto: 'all',
    tieneTelefono: 'all',
    tieneEmail: 'all',
  });

  const revalidator = useRevalidator();
  const { getClienteByRut } = useClientes();
  const { filteredClients, filterStats, filterOptions } = useClientFilters(
    clients,
    filters
  );
  const { clientColumns } = useExportClientes();

  const handleAddCliente = () => {
    setSelectedCliente(undefined);
    setModalMode('add');
    setIsModalOpen(true);
  };

  const handleEditCliente = (cliente: GetClientes) => {
    (async () => {
      try {
        setEditingClienteRut(cliente.rut);
        const clienteDetallado = await getClienteByRut(cliente.rut);
        // Convertir GetClienteById a GetClientesByRut mapeando email a correo
        const clienteConvertido: GetClientesByRut = {
          ...(clienteDetallado as unknown as GetClientesByRut),
          correo: clienteDetallado.email,
        };
        setSelectedCliente(clienteConvertido);
        setModalMode('edit');
        setIsModalOpen(true);
      } catch (error) {
        console.error('Error al cargar detalles del cliente:', error);
        toast.error('Error al cargar los detalles del cliente');
      } finally {
        setEditingClienteRut(null);
      }
    })();
  };

  const handleDetailsCliente = (cliente: GetClientes) => {
    (async () => {
      try {
        setDetailingClienteRut(cliente.rut);
        const clienteDetallado = await getClienteByRut(cliente.rut);
        // Convertir GetClienteById a GetClientesByRut mapeando email a correo
        const clienteConvertido: GetClientesByRut = {
          ...(clienteDetallado as unknown as GetClientesByRut),
          correo: clienteDetallado.email,
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

  const handleClienteSuccess = (clienteData: any, mode: 'add' | 'edit') => {
    // Actualizar el estado local
    if (mode === 'add') {
      // Crear nuevo cliente para la lista
      const newCliente: GetClientes = {
        rut: clienteData.rut,
        nombreCompleto: clienteData.esEmpresa
          ? clienteData.nombre
          : `${clienteData.nombre} ${clienteData.apellido}`.trim(),
        esEmpresa: clienteData.esEmpresa,
        direccion: clienteData.direccion,
        comuna: '', // Se llenará cuando se recargue desde el servidor
        contacto: clienteData.contacto,
        telefono: clienteData.telefono || '',
        email: clienteData.correo || '',
        codigoComuna: clienteData.codComuna,
      };
      setClients(prev => [...prev, newCliente]);
    } else if (mode === 'edit' && selectedCliente) {
      // Actualizar cliente existente
      setClients(prev =>
        prev.map(cliente =>
          cliente.rut === selectedCliente.rut
            ? {
                ...cliente,
                nombreCompleto: clienteData.esEmpresa
                  ? clienteData.nombre
                  : `${clienteData.nombre} ${clienteData.apellido}`.trim(),
                esEmpresa: clienteData.esEmpresa,
                direccion: clienteData.direccion,
                contacto: clienteData.contacto,
                telefono: clienteData.telefono || '',
                email: clienteData.correo || '',
                codigoComuna: clienteData.codComuna,
              }
            : cliente
        )
      );
    }

    revalidator.revalidate();
    setIsModalOpen(false);
    setSelectedCliente(undefined); // Limpiar cliente seleccionado
    toast.success(
      mode === 'add'
        ? 'Cliente creado exitosamente'
        : 'Cliente actualizado exitosamente'
    );
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedCliente(undefined); // Limpiar cliente seleccionado
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
      tieneEmail: 'all',
    });
  };

  return (
    <div className='min-h-screen bg-slate-50/30 dark:bg-slate-950/30'>
      <div className='container mx-auto p-3 space-y-4'>
        {/* Header */}
        <div className='flex items-center justify-between pb-3 border-b border-slate-200/60 dark:border-slate-700/60'>
          <div>
            <h1 className='text-xl font-semibold text-slate-900 dark:text-slate-100'>
              Clientes
            </h1>
            <p className='text-sm text-slate-600 dark:text-slate-400'>
              Gestiona los clientes del sistema
            </p>
          </div>
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
        </div>

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
                  detailingClienteRut,
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

        {/* Modal de Formulario */}
        <ClienteFormModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onSuccess={handleClienteSuccess}
          cliente={selectedCliente}
          mode={modalMode}
          giros={giros}
          comunas={comunas}
          existingClients={clients.map(client => client.rut)}
        />
      </div>
    </div>
  );
}
