import React, { useState } from 'react';
import { useRevalidator } from 'react-router';
import { toast } from 'sonner';
import { Plus } from 'lucide-react';
import { DataTable } from '~/components/data-table/data-table';
import { Button } from '~/components/ui/button';
import { Card, CardContent } from '~/components/ui/card';
import type { Parametro } from '~/types/mantencion';
import { createColumns } from './columns';
import ParametroFormModal from './parametro-form-modal';

interface ParametrosComponentProps {
  parametros: Parametro[];
}

export default function ParametrosComponent({
  parametros,
}: ParametrosComponentProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedParametro, setSelectedParametro] = useState<
    Parametro | undefined
  >(undefined);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');

  const revalidator = useRevalidator();

  const handleAdd = () => {
    setSelectedParametro(undefined);
    setModalMode('add');
    setIsModalOpen(true);
  };

  const handleEdit = (parametro: Parametro) => {
    setSelectedParametro(parametro);
    setModalMode('edit');
    setIsModalOpen(true);
  };

  const handleDelete = async (parametro: Parametro) => {
    if (
      window.confirm(
        `¿Está seguro de que desea eliminar el parámetro "${parametro.descripcion}"?`,
      )
    ) {
      try {
        const { default: api } = await import('~/lib/api');
        await api.delete(`/eliminarParametro/${parametro.id}`);

        toast.success('Parámetro eliminado exitosamente');
        revalidator.revalidate();
      } catch (error) {
        console.error('Error al eliminar parámetro:', error);
        toast.error('Error al eliminar el parámetro');
      }
    }
  };

  const handleSuccess = () => {
    toast.success(
      modalMode === 'add'
        ? 'Parámetro creado exitosamente'
        : 'Parámetro actualizado exitosamente',
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
              Gestión de Parámetros
            </h1>
          </div>
          <p className="text-muted-foreground">
            Administra los parámetros del sistema de manera eficiente
          </p>
        </div>
        <Button
          onClick={handleAdd}
          className="bg-sky-600 hover:bg-sky-700 text-white"
        >
          <Plus className="mr-2 h-4 w-4" />
          Agregar Parámetro
        </Button>
      </div>

      {/* Data Table */}
      <Card>
        <CardContent className="">
          <DataTable columns={columns} data={parametros} />
        </CardContent>
      </Card>

      {/* Modal */}
      <ParametroFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleSuccess}
        parametro={selectedParametro}
        mode={modalMode}
      />
    </div>
  );
}
