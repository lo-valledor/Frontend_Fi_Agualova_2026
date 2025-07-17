import { Download, Plus } from 'lucide-react';
import { useState, useEffect } from 'react';
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
import {
  useClientFilters,
  type ClientFilters,
} from '~/hooks/administracion/use-client-filters';
import { columns } from './columns';
import { ClienteDetailsModal } from './detalles-cliente';
import ClienteFormModal from './cliente-form-modal';
import { ClientFiltersComponent } from './client-filters';
import { FilterSummary } from './filter-summary';
import api from '~/lib/api';

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
  const [clients] = useState<GetClientes[]>(clientes);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCliente, setSelectedCliente] = useState<GetClientesByRut>();
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [detailedCliente, setDetailedCliente] = useState<GetClientesByRut>();
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [editingClienteRut, setEditingClienteRut] = useState<string | null>(
    null,
  );
  const [detailingClienteRut, setDetailingClienteRut] = useState<string | null>(
    null,
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
    filters,
  );
  const { trackPageView, trackDataAction } = useActivityEvent();
  const [isExporting, setIsExporting] = useState(false);

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
      trackDataAction(
        'Abrir formulario',
        'Clientes',
        `Editar cliente: ${cliente.rut}`,
      );
      setEditingClienteRut(cliente.rut);
      const clienteDetallado = await getClienteByRut(cliente.rut);
      setSelectedCliente(clienteDetallado as GetClientesByRut);
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
      setDetailedCliente(clienteDetallado as GetClientesByRut);
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
      modalMode === 'add'
        ? 'Cliente creado exitosamente'
        : 'Cliente actualizado exitosamente',
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

  const handleExportExcel = async () => {
    if (isExporting) return; // Prevenir múltiples clicks

    setIsExporting(true);
    try {
      toast.info('Generando archivo Excel...');

      const response = await api.get('cliente/exportar-excel', {
        responseType: 'blob', // Esto es crucial para archivos binarios
        timeout: 30000, // 30 segundos timeout
        headers: {
          Accept:
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        },
      });

      // Verificar que la respuesta es válida
      if (!response.data || (response.data as Blob).size === 0) {
        throw new Error('El archivo exportado está vacío');
      }

      const blob = new Blob([response.data as BlobPart], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });

      // Crear nombre de archivo con timestamp
      const now = new Date();
      const timestamp = now.toISOString().slice(0, 19).replace(/:/g, '-');
      const fileName = `clientes_${timestamp}.xlsx`;

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      a.style.display = 'none'; // Asegurar que no sea visible

      // Agregar al DOM, hacer click y remover
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      // Limpiar URL después de un tiempo
      setTimeout(() => {
        window.URL.revokeObjectURL(url);
      }, 100);

      toast.success(`Archivo exportado: ${fileName}`);
    } catch (error: any) {
      // Manejo más específico de errores
      if (error.code === 'ECONNABORTED') {
        toast.error('La exportación tardó demasiado. Intente nuevamente.');
      } else if (error.response?.status === 404) {
        toast.error('Endpoint de exportación no encontrado');
      } else if (error.response?.status === 500) {
        toast.error('Error interno del servidor al generar el archivo');
      } else if (error.message.includes('Network Error')) {
        toast.error('Error de conexión. Verifique su internet.');
      } else {
        toast.error('Error al exportar Excel. Intente nuevamente.');
      }
    } finally {
      setIsExporting(false);
    }
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
        <div className="flex gap-2">
          <Button
            variant="default"
            onClick={handleExportExcel}
            disabled={isExporting}
            className="gap-1.5 bg-green-600 hover:bg-green-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download
              className={`h-3.5 w-3.5 ${isExporting ? 'animate-spin' : ''}`}
            />
            {isExporting ? 'Exportando...' : 'Exportar Excel'}
          </Button>
          <Button
            onClick={handleAddCliente}
            className="bg-sky-600 hover:bg-sky-700 text-white"
          >
            <Plus className="mr-2 h-4 w-4" />
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
