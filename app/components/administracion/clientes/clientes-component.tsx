import { Plus, Loader2 } from 'lucide-react';
import React, { useState } from 'react';
import { useRevalidator } from 'react-router';
import { toast } from 'sonner';
import { DataTable } from '~/components/data-table/data-table';
import { Button } from '~/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
  CardHeader,
} from '~/components/ui/card';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
  SheetClose,
} from '~/components/ui/sheet';
import { Separator } from '~/components/ui/separator';
import type {
  GetClientes,
  GetClientesByRut,
  GetGiros,
  GetRegiones,
} from '~/types/administracion';
import { useClientes } from '~/hooks/use-administracion';
import { columns } from './columns';
import DetallesCliente from './detalles-cliente';
import ClienteFormModal from './cliente-form-modal';
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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCliente, setSelectedCliente] = useState<GetClientesByRut>();
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [detailedCliente, setDetailedCliente] = useState<GetClientesByRut>();
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [editingClienteRut, setEditingClienteRut] = useState<string | null>(
    null,
  );
  const [isExporting, setIsExporting] = useState(false);

  const revalidator = useRevalidator();
  const { getClienteByRut } = useClientes();

  const handleAddCliente = () => {
    setSelectedCliente(undefined);
    setModalMode('add');
    setIsModalOpen(true);
  };

  const handleEditCliente = async (cliente: GetClientes) => {
    try {
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
      setIsLoadingDetails(true);
      setIsDetailsOpen(true);

      // Obtener los detalles completos del cliente
      const clienteDetallado = await getClienteByRut(cliente.rut);
      setDetailedCliente(clienteDetallado);
    } catch (error) {
      console.error('Error al cargar detalles del cliente:', error);
      toast.error('Error al cargar los detalles del cliente');
      setIsDetailsOpen(false);
    } finally {
      setIsLoadingDetails(false);
    }
  };

  const handleClienteSuccess = () => {
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
      const fileName = `acometidas_${timestamp}.xlsx`;

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
      console.error('Error al exportar Excel:', error);

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
            })}
            data={clientes}
          />
        </CardContent>
      </Card>

      {/* Modal de Detalles */}
      <Sheet open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <SheetContent className="sm:max-w-2xl">
          <SheetHeader>
            <SheetTitle>Detalles del Cliente</SheetTitle>
            <SheetDescription>
              Información completa del cliente seleccionado.
            </SheetDescription>
          </SheetHeader>
          <Separator className="my-4" />
          <div className="h-[calc(100vh-150px)] overflow-y-auto pr-4">
            {isLoadingDetails ? (
              <div className="flex items-center justify-center h-32">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-2 text-muted-foreground">
                  Cargando detalles...
                </span>
              </div>
            ) : detailedCliente ? (
              <DetallesCliente cliente={detailedCliente} />
            ) : (
              <div className="text-center text-muted-foreground py-8">
                No se pudieron cargar los detalles del cliente
              </div>
            )}
          </div>
          <SheetFooter className="mt-4">
            <SheetClose asChild>
              <Button variant="outline">Cerrar</Button>
            </SheetClose>
          </SheetFooter>
        </SheetContent>
      </Sheet>

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
