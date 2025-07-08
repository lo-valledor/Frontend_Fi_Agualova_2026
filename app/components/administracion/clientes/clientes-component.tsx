import { Plus, Users, Building2, UserCheck, Mail } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { useRevalidator } from 'react-router';
import { toast } from 'sonner';
import { useActivityEvent } from '~/components/activity-tracker-hoc';
import { DataTable } from '~/components/data-table/data-table';
import { Button } from '~/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
  CardHeader,
} from '~/components/ui/card';
import type {
  GetClientes,
  GetClientesByRut,
  GetGiros,
  GetRegiones,
} from '~/types/administracion';
import { useClientes } from '~/hooks/use-administracion';
import { useClientFilters, type ClientFilters } from '~/hooks/administracion/use-client-filters';
import { columns } from './columns';
import { ClienteDetailsModal } from './detalles-cliente';
import ClienteFormModal from './cliente-form-modal';
import { ClientFiltersComponent } from './client-filters';
import { FilterSummary } from './filter-summary';

interface ClientesComponentProps {
  clientes: GetClientes[];
  giros: GetGiros[];
  regiones: GetRegiones[];
}

export default function ClientesComponent({
  clientes,
  giros,
  regiones,
}: ClientesComponentProps) {
  const [clients, setClients] = useState<GetClientes[]>(clientes);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCliente, setSelectedCliente] = useState<GetClientesByRut>();
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [detailedCliente, setDetailedCliente] = useState<GetClientesByRut>();
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [editingClienteRut, setEditingClienteRut] = useState<string | null>(
    null,
  );
  const [detailingClienteRut, setDetailingClienteRut] = useState<
    string | null
  >(null);
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
    filters,
  );
  const { trackPageView, trackDataAction } = useActivityEvent();

  // Rastrear vista de página
  useEffect(() => {
    trackPageView('Gestión de Clientes');
  }, [trackPageView]);

  const handleAddCliente = () => {
    trackDataAction('Abrir formulario', 'Clientes', 'Crear nuevo cliente');
    setSelectedCliente(undefined);
    setModalMode('add');
    setIsModalOpen(true);
  };

  const handleEditCliente = async (cliente: GetClientes) => {
    try {
      trackDataAction('Abrir formulario', 'Clientes', `Editar cliente: ${cliente.rut}`);
      setEditingClienteRut(cliente.rut);
      const clienteDetallado = await getClienteByRut(cliente.rut);
      setSelectedCliente(clienteDetallado);
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
      setDetailedCliente(clienteDetallado);
      setIsDetailsOpen(true);
    } catch (error) {
      console.error('Error al cargar detalles del cliente:', error);
      toast.error('Error al cargar los detalles del cliente');
      setIsDetailsOpen(false);
    } finally {
      setDetailingClienteRut(null);
    }
  };

  const handleClienteSuccess = () => {
    trackDataAction(
      modalMode === 'add' ? 'Crear' : 'Actualizar',
      'Clientes',
      modalMode === 'add' ? 'Cliente creado exitosamente' : 'Cliente actualizado exitosamente'
    );
    revalidator.revalidate();
    setIsModalOpen(false);
    setSelectedCliente(undefined); // Limpiar cliente seleccionado
    toast.success(
      modalMode === 'add'
        ? 'Cliente creado exitosamente'
        : 'Cliente actualizado exitosamente',
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
    <div className="container mx-auto p-3 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-sky-900 dark:text-sky-100">
              Gestión de Clientes
            </h1>
          </div>
          <p className="text-muted-foreground">
            Administra los clientes del sistema de manera eficiente
          </p>
        </div>
        <Button
          onClick={handleAddCliente}
          className="bg-sky-600 hover:bg-sky-700 text-white"
        >
          <Plus className="mr-2 h-4 w-4" />
          Agregar Cliente
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Clientes
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {filterStats.isFiltered
                ? filteredClients.length
                : clients.length}
            </div>
            {filterStats.isFiltered && (
              <p className="text-xs text-muted-foreground">
                de {clients.length} total
              </p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Personas Naturales
            </CardTitle>
            <UserCheck className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {filteredClients.filter((c) => !c.esEmpresa).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Empresas</CardTitle>
            <Building2 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {filteredClients.filter((c) => c.esEmpresa).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Con Email
            </CardTitle>
            <Mail className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {filteredClients.filter((c) => c.email).length}
            </div>
          </CardContent>
        </Card>
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
      <Card>
        <CardHeader>
          <CardTitle>Lista de Clientes</CardTitle>
          <CardDescription>
            Visualiza y gestiona todos los clientes registrados en el sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns({
              onDetails: handleDetailsCliente,
              onEdit: handleEditCliente,
              editingClienteRut,
              detailingClienteRut,
            })}
            data={filteredClients}
          />
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
        regiones={regiones}
      />
    </div>
  );
}
