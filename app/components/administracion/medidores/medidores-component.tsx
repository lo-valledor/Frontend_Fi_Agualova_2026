import React, { useState, useEffect } from 'react';
import { Button } from '~/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '~/components/ui/card';
import { DataTable } from '~/components/data-table/data-table';
import { columns } from './columns';
import type {
  GetMedidores,
  CrearMedidorProps,
  ActualizarMedidorProps,
} from '~/types/administracion';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';
import { LoadingSpinner } from '~/components/loading-spinner';
import { MedidorFormModal } from './medidor-form';
import { DeleteConfirmationDialog } from './delete-confirm-dialog';
import api from '~/lib/api';
import type { Marca } from '~/types/mantencion';

export default function MedidoresComponent({
  medidores: initialMedidores,
  marcas,
}: {
  medidores: GetMedidores[];
  marcas: Marca[];
}) {
  const [medidores, setMedidores] = useState<GetMedidores[]>(initialMedidores);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedMedidor, setSelectedMedidor] = useState<GetMedidores | null>(
    null,
  );
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);

  useEffect(() => {
    setMedidores(initialMedidores);
  }, [initialMedidores]);

  const refetchMedidores = async () => {
    setIsFetching(true);
    try {
      const response = await api.get('buscarMedidor');
      const data = response.data as GetMedidores[];
      setMedidores(data);
    } catch (_error) {
      toast.error('Error al recargar los medidores.');
    } finally {
      setIsFetching(false);
    }
  };

  const handleAdd = () => {
    setSelectedMedidor(null);
    setModalMode('add');
    setIsModalOpen(true);
  };

  const handleEdit = (medidor: GetMedidores) => {
    setSelectedMedidor(medidor);
    setModalMode('edit');
    setIsModalOpen(true);
  };

  const handleDelete = (medidor: GetMedidores) => {
    setSelectedMedidor(medidor);
    setIsDeleteDialogOpen(true);
  };

  const handleSubmit = async (
    data: CrearMedidorProps | ActualizarMedidorProps,
    mode: 'add' | 'edit',
  ) => {
    setIsLoading(true);
    try {
      if (mode === 'add') {
        await api.post('/crearMedidor', data);
        toast.success('Medidor creado exitosamente');
      } else {
        await api.put(`/actualizarMedidor/${selectedMedidor?.codigo}`, data);
        toast.success('Medidor actualizado exitosamente');
      }
      await refetchMedidores();
      setIsModalOpen(false);
    } catch (error) {
      toast.error('Error al guardar el medidor.');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedMedidor) return;
    setIsLoading(true);
    try {
      await api.delete(`/eliminarMedidor/${selectedMedidor.codigo}`);
      toast.success('Medidor eliminado exitosamente');
      await refetchMedidores();
    } catch (_error) {
      toast.error('Error al eliminar el medidor.');
    } finally {
      setIsLoading(false);
      setIsDeleteDialogOpen(false);
      setSelectedMedidor(null);
    }
  };

  if (isFetching && medidores.length === 0) {
    return (
      <div className="container mx-auto p-3 md:p-6">
        <div className="flex items-center justify-center py-20">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-3 md:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-sky-900 dark:text-sky-100">
            Gestión de Medidores
          </h1>
          <p className="text-muted-foreground">
            Administra los medidores del sistema de manera eficiente
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={handleAdd}
            className="bg-sky-600 hover:bg-sky-700 text-white"
          >
            <Plus className="mr-2 h-4 w-4 text-white" />
            Agregar Medidor
          </Button>
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="text-sky-900 dark:text-sky-100">
            Lista de Medidores
          </CardTitle>
          <CardDescription>
            Visualiza y gestiona todos los medidores registrados en el sistema
          </CardDescription>
        </CardHeader>
        <CardContent className="relative">
          {isFetching && (
            <div className="absolute inset-0 bg-white/50 dark:bg-black/50 flex items-center justify-center rounded-lg z-10">
              <LoadingSpinner />
            </div>
          )}
          <DataTable
            columns={columns({ onEdit: handleEdit, onDelete: handleDelete })}
            data={medidores}
          />
        </CardContent>
      </Card>

      {isModalOpen && (
        <MedidorFormModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleSubmit}
          medidor={selectedMedidor}
          mode={modalMode}
          isLoading={isLoading}
          marcas={marcas}
        />
      )}

      {isDeleteDialogOpen && (
        <DeleteConfirmationDialog
          isOpen={isDeleteDialogOpen}
          onClose={() => setIsDeleteDialogOpen(false)}
          onConfirm={handleConfirmDelete}
          medidor={selectedMedidor}
        />
      )}
    </div>
  );
}
