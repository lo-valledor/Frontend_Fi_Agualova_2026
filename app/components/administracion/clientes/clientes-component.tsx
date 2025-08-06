import { Plus } from 'lucide-react';
import { toast } from 'sonner';

import { useEffect, useState } from 'react';

import { useRevalidator } from 'react-router';

import { useActivityEvent } from '~/components/activity-tracker-hoc';
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
}: ClientesComponentProps) {
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
  const { trackPageView, trackDataAction } = useActivityEvent();
  const { clientColumns } = useExportClientes();

  // Rastrear vista de página
  useEffect(() => {
    trackPageView(' Clientes');
  }, [trackPageView]);

  const handleAddCliente = () => {
    trackDataAction('Abrir formulario', 'Clientes', 'Crear nuevo cliente');
    setSelectedCliente(undefined);
    setModalMode('add');
    setIsModalOpen(true);
  };

  const handleEditCliente = async (cliente: GetClientes) => {
    try {
      trackDataAction(
        'Abrir formulario',
        'Clientes',
        `Editar cliente: ${cliente.rut}`
      );
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
  };

  const handleDetailsCliente = async (cliente: GetClientes) => {
    try {
      trackDataAction('Ver detalles', 'Clientes', `Cliente: ${cliente.rut}`);
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
  };

  const handleClienteSuccess = (clienteData: any, mode: 'add' | 'edit') => {
    trackDataAction(
      mode === 'add' ? 'Crear' : 'Actualizar',
      'Clientes',
      mode === 'add'
        ? 'Cliente creado exitosamente'
        : 'Cliente actualizado exitosamente'
    );

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
    <div className='container mx-auto p-2 sm:p-4 lg:p-6 space-y-4 sm:space-y-6'>
      {/* Header */}
      <div className='flex flex-col space-y-4 lg:flex-row lg:items-center lg:justify-between lg:space-y-0'>
        <div className='space-y-2'>
          <div className='flex items-center gap-3'>
            <h1 className='text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight text-sky-900 dark:text-sky-100'>
              Clientes
            </h1>
          </div>
          <p className='text-xs sm:text-sm text-muted-foreground max-w-2xl'>
            Gestiona los clientes del sistema y exporta los datos
          </p>
        </div>
        <div className='flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2 lg:flex-row'>
          <ExportButton
            data={filteredClients}
            columns={clientColumns}
            filename="clientes"
            variant="default"
            size="sm"
            className="gap-1.5 bg-green-600 hover:bg-green-700 text-white disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto order-2 sm:order-1"
          />
          <Button
            onClick={handleAddCliente}
            className='bg-sky-600 hover:bg-sky-700 text-white w-full sm:w-auto order-1 sm:order-2'
            size='sm'
          >
            <Plus className='mr-2 h-3 w-3 sm:h-4 sm:w-4' />
            <span className='text-xs sm:text-sm'>Agregar Cliente</span>
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
      <Card className='border-0 shadow-lg bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm'>
        <CardContent className='relative p-2 sm:p-4 lg:p-6'>
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
  );
}
