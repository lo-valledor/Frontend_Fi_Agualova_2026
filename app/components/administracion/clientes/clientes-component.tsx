import React, { useState } from 'react';
import { DataTable } from '~/components/data-table/data-table';
import { Button } from '~/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '~/components/ui/card';
import type {
  GetClientes,
  GetGiros,
  ClientesFormData,
  GetComunas,
  GetRegiones,
  GetClientesByRut,
} from '~/types/administracion';
import { columns } from './columns';
import { Plus, Users, Building, Download } from 'lucide-react';
import { ClientDetailsModal } from './clientes-details-modal';
import { DeleteConfirmationDialog } from './delete-confirmation-dialog';
import { useAdministracion } from '~/hooks/use-administracion';
import { toast } from 'sonner';
import { ClientFormModal } from './clientes-form-modal';

export default function ClientesComponent({
  clientes: initialClientes,
  giros,
  regiones,
}: {
  clientes: GetClientes[];
  giros: GetGiros[];
  regiones: GetRegiones[];
}) {
  const [clientes, setClientes] = useState<GetClientes[]>(initialClientes);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<GetClientes | null>(
    null,
  );
  const [formClientData, setFormClientData] = useState<GetClientesByRut | null>(
    null,
  );
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');

  const {
    fetchClientes,
    createCliente,
    updateCliente,
    deleteCliente,
    exportClientesToExcel,
    loadingState,
    fetchClienteByRut,
  } = useAdministracion();

  const handleClientSuccess = async () => {
    try {
      const updatedClientes = await fetchClientes();
      if (updatedClientes) {
        setClientes(updatedClientes as GetClientes[]);
      }
    } catch (error) {
      console.error('Error al recargar clientes:', error);
      toast.error('Error al recargar la lista de clientes');
    }
  };

  const handleAddClient = () => {
    setSelectedClient(null);
    setFormClientData(null);
    setModalMode('add');
    setIsFormModalOpen(true);
  };

  const handleEditClient = async (client: GetClientes) => {
    try {
      const fullClientData = await fetchClienteByRut(client.rut);
      if (fullClientData) {
        setFormClientData(fullClientData);
        setSelectedClient(client);
        setModalMode('edit');
        setIsFormModalOpen(true);
      }
    } catch (error) {
      console.error('Error al obtener los detalles del cliente:', error);
      toast.error('Error al obtener los detalles del cliente.');
    }
  };

  const handleSubmitClient = async (formData: ClientesFormData) => {
    try {
      if (modalMode === 'add') {
        await createCliente(formData);
        toast.success('Cliente creado exitosamente');
      } else {
        await updateCliente(formData);
        toast.success('Cliente actualizado exitosamente');
      }
      await handleClientSuccess();
    } catch (error) {
      console.error('Error al guardar el cliente:', error);
      toast.error('Error al guardar el cliente');
    } finally {
      setIsFormModalOpen(false);
    }
  };

  const handleViewDetails = (client: GetClientes) => {
    setSelectedClient(client);
    setIsDetailsModalOpen(true);
  };

  const handleDeleteClient = (client: GetClientes) => {
    setSelectedClient(client);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedClient) return;

    try {
      await deleteCliente(selectedClient.rut);
      toast.success('Cliente eliminado exitosamente');
      await handleClientSuccess();
    } catch (error) {
      console.error('Error al eliminar cliente:', error);
      toast.error('Error al eliminar el cliente');
    } finally {
      setSelectedClient(null);
      setIsDeleteDialogOpen(false);
    }
  };

  const handleExportToExcel = async () => {
    try {
      await exportClientesToExcel();
      toast.success('Archivo Excel descargado exitosamente');
    } catch (error) {
      console.error('Error al exportar a Excel:', error);
      toast.error('Error al exportar a Excel');
    }
  };

  const columnsData = columns({
    onViewDetails: handleViewDetails,
    onEdit: handleEditClient,
    onDelete: handleDeleteClient,
  });

  // Calcular estadísticas
  const totalClientes = clientes.length;
  const empresas = clientes.filter((c) => c.esEmpresa).length;
  const personasNaturales = totalClientes - empresas;
  const clientesConEmail = clientes.filter(
    (c) => c.email && c.email.trim() !== '',
  ).length;

  return (
    <div className="container mx-auto p-3 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-emerald-900 dark:text-emerald-100">
              Gestión de Clientes
            </h1>
          </div>
          <p className="text-muted-foreground">
            Administra los clientes del sistema de manera eficiente
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={handleExportToExcel}
            variant="outline"
            disabled={loadingState.exportClientesToExcel?.isLoading}
            className="border-emerald-200 text-white bg-emerald-500 hover:bg-emerald-600 dark:border-emerald-800"
          >
            <Download className="mr-2 h-4 w-4" />
            {loadingState.exportClientesToExcel?.isLoading
              ? 'Exportando...'
              : 'Exportar Excel'}
          </Button>
          <Button
            onClick={handleAddClient}
            className="bg-sky-600 hover:bg-sky-700 text-white"
          >
            <Plus className="mr-2 h-4 w-4" />
            Agregar Cliente
          </Button>
        </div>
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
            <div className="text-2xl font-bold text-emerald-700 dark:text-emerald-300">
              {totalClientes}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Empresas</CardTitle>
            <Building className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">
              {empresas}
            </div>
            <p className="text-xs text-muted-foreground">
              {totalClientes > 0
                ? Math.round((empresas / totalClientes) * 100)
                : 0}
              % del total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Personas Naturales
            </CardTitle>
            <div className="h-2 w-2 bg-green-500 rounded-full"></div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-700 dark:text-green-300">
              {personasNaturales}
            </div>
            <p className="text-xs text-muted-foreground">
              {totalClientes > 0
                ? Math.round((personasNaturales / totalClientes) * 100)
                : 0}
              % del total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Con Email</CardTitle>
            <div className="h-2 w-2 bg-purple-500 rounded-full"></div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-700 dark:text-purple-300">
              {clientesConEmail}
            </div>
            <p className="text-xs text-muted-foreground">
              {totalClientes > 0
                ? Math.round((clientesConEmail / totalClientes) * 100)
                : 0}
              % del total
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-emerald-800 dark:text-emerald-200">
            Lista de Clientes
          </CardTitle>
          <CardDescription>
            Visualiza y gestiona todos los clientes registrados en el sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable columns={columnsData} data={clientes} />
        </CardContent>
      </Card>

      {/* Modals */}
      <ClientDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => {
          setIsDetailsModalOpen(false);
          setSelectedClient(null);
        }}
        client={selectedClient}
      />

      <DeleteConfirmationDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => {
          setIsDeleteDialogOpen(false);
          setSelectedClient(null);
        }}
        onConfirm={handleConfirmDelete}
        client={selectedClient}
      />

      <ClientFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        onSubmit={handleSubmitClient}
        client={formClientData}
        mode={modalMode}
        giros={giros}
        regiones={regiones}
      />
    </div>
  );
}
