import React, { useState } from 'react';
import { useRevalidator } from 'react-router';
import { toast } from 'sonner';
import { Plus } from 'lucide-react';
import type { Tarifas } from '~/types/mantencion';
import { Button } from '~/components/ui/button';
import { Card, CardContent } from '~/components/ui/card';
import { DataTable } from '~/components/data-table/data-table';
import { createColumns } from './columns';
import TarifaFormModal from './tarifa-form-modal';

interface TarifasComponentProps {
  tarifas: Tarifas[];
}

export default function TarifasComponent({ tarifas }: TarifasComponentProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTarifa, setSelectedTarifa] = useState<Tarifas | undefined>(
    undefined,
  );
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');

  const revalidator = useRevalidator();

  const handleAdd = () => {
    setSelectedTarifa(undefined);
    setModalMode('add');
    setIsModalOpen(true);
  };

  const handleEdit = (tarifa: Tarifas) => {
    setSelectedTarifa(tarifa);
    setModalMode('edit');
    setIsModalOpen(true);
  };

  const handleDelete = async (tarifa: Tarifas) => {
    if (
      window.confirm(
        `¿Está seguro de que desea eliminar la tarifa "${tarifa.nombre}"?`,
      )
    ) {
      try {
        const { default: api } = await import('~/lib/api');
        await api.delete(`/eliminarTarifa/${tarifa.id}`);

        toast.success('Tarifa eliminada exitosamente');
        revalidator.revalidate();
      } catch (error) {
        console.error('Error al eliminar tarifa:', error);
        toast.error('Error al eliminar la tarifa');
      }
    }
  };

  const handleSuccess = () => {
    toast.success(
      modalMode === 'add'
        ? 'Tarifa creada exitosamente'
        : 'Tarifa actualizada exitosamente',
    );
    revalidator.revalidate();
  };

  const columns = createColumns({
    onEdit: handleEdit,
    onDelete: handleDelete,
  });

  return (
    <div className="container mx-auto p-3 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-sky-900 dark:text-sky-100">
              Gestión de Tarifas
            </h1>
          </div>
          <p className="text-muted-foreground">
            Administra las tarifas del sistema de manera eficiente
          </p>
        </div>
        <Button
          onClick={handleAdd}
          className="bg-sky-600 hover:bg-sky-700 text-white"
        >
          <Plus className="mr-2 h-4 w-4" />
          Agregar Tarifa
        </Button>
      </div>

      {/* Data Table */}
      <Card>
        <CardContent className="p-6">
          <DataTable columns={columns} data={tarifas} />
        </CardContent>
      </Card>

      {/* Modal */}
      <TarifaFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleSuccess}
        tarifa={selectedTarifa}
        mode={modalMode}
      />
    </div>
  );
}
