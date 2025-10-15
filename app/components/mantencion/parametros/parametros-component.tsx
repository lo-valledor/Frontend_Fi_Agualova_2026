import { Plus } from 'lucide-react';
import { toast } from 'sonner';

import React, { useState } from 'react';

import { useRevalidator } from 'react-router';

import { DataTable } from '~/components/data-table/data-table';
import { ModernHeader } from '~/components/shared/modern-header';
import { Button } from '~/components/ui/button';
import { Card, CardContent } from '~/components/ui/card';
import type { Parametro } from '~/types/mantencion';

import { createColumns } from './columns';
import ParametroFormModal from './parametro-form-modal';

interface ParametrosComponentProps {
  parametros: Parametro[];
}

export default function ParametrosComponent({
  parametros
}: Readonly<ParametrosComponentProps>) {
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
        `¿Está seguro de que desea eliminar el parámetro "${parametro.descripcion}"?`
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
        : 'Parámetro actualizado exitosamente'
    );
    revalidator.revalidate();
  };

  const columns = createColumns({
    onEdit: handleEdit,
    onDelete: handleDelete
  });

  return (
    <div className='min-h-screen bg-background'>
      <div className='container mx-auto p-3 space-y-4'>
        {/* Header */}
        <ModernHeader
          title='Parámetros'
          description='Gestiona los parámetros del sistema'
          actions={
            <div className='flex gap-2'>
              <Button
                onClick={handleAdd}
                className='bg-sky-600 hover:bg-sky-700'
                size='sm'
              >
                <Plus className='mr-2 h-4 w-4' />
                Agregar Parámetro
              </Button>
            </div>
          }
        />

        {/* Data Table */}
        <Card className='border border-border shadow-sm'>
          <CardContent className='relative'>
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
    </div>
  );
}
