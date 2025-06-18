'use client';
import React, { useState, useEffect } from 'react';
import { DataTable } from '~/components/data-table/data-table';
import type { GetCargoTipoContrato } from '~/types/administracion';
import { columns } from './columns';
import { Button } from '~/components/ui/button';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';
import api from '~/lib/api';
import { DeleteDialog } from './delete-dialog';
import { FormModal } from './form-modal';
import { LoadingSpinner } from '~/components/loading-spinner';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '~/components/ui/card';

export default function CargoTipoContratoComponent({
  cargoTipoContrato: initialData,
}: {
  cargoTipoContrato: GetCargoTipoContrato[];
}) {
  const [data, setData] = useState<GetCargoTipoContrato[]>(initialData);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<GetCargoTipoContrato | null>(
    null,
  );
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setData(initialData);
  }, [initialData]);

  const refetchData = async () => {
    setIsLoading(true);
    try {
      const response = await api.get('cargoTipoContrato-buscar');
      setData(response.data as GetCargoTipoContrato[]);
    } catch (error) {
      toast.error('Error al recargar los datos.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdd = () => {
    setModalMode('add');
    setIsModalOpen(true);
  };

  const handleEdit = (item: GetCargoTipoContrato) => {
    setSelectedItem(item);
    setModalMode('edit');
    setIsModalOpen(true);
  };

  const handleDelete = (item: GetCargoTipoContrato) => {
    setSelectedItem(item);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedItem) return;
    setIsLoading(true);
    try {
      // Asumo que el ID para eliminar es `tipoContratoId`
      await api.delete(
        `/cargoTipoContrato-eliminar/${selectedItem.tipoContratoId}`,
      );
      toast.success('Relación eliminada exitosamente');
      await refetchData();
    } catch (error) {
      toast.error('Error al eliminar la relación.');
    } finally {
      setIsLoading(false);
      setIsDeleteDialogOpen(false);
      setSelectedItem(null);
    }
  };

  return (
    <div className="container mx-auto p-3 md:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-indigo-900 dark:text-indigo-100">
            Cargo y Tipo de Contrato
          </h1>
          <p className="text-muted-foreground">
            Gestión de la relación entre cargos facturables y tipos de contrato
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={handleAdd}
            className="bg-indigo-600 hover:bg-indigo-700"
          >
            <Plus className="mr-2 h-4 w-4" />
            Añadir Relación
          </Button>
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="text-indigo-900 dark:text-indigo-100">
            Lista de Relaciones
          </CardTitle>
          <CardDescription>
            Visualiza y gestiona las relaciones existentes
          </CardDescription>
        </CardHeader>
        <CardContent className="relative">
          {isLoading && (
            <div className="absolute inset-0 bg-white/50 dark:bg-black/50 flex items-center justify-center rounded-lg z-10">
              <LoadingSpinner />
            </div>
          )}
          <DataTable
            columns={columns({ onEdit: handleEdit, onDelete: handleDelete })}
            data={data}
          />
        </CardContent>
      </Card>

      <FormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        mode={modalMode}
      />
      <DeleteDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleConfirmDelete}
        data={selectedItem}
      />
    </div>
  );
}
