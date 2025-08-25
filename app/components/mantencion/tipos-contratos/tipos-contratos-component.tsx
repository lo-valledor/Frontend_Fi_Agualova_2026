import { Plus } from 'lucide-react';
import { toast } from 'sonner';

import React, { useState } from 'react';

import { useRevalidator } from 'react-router';

import { DataTable } from '~/components/data-table/data-table';
import { ModernHeader } from '~/components/shared/modern-header';
import { Button } from '~/components/ui/button';
import { Card, CardContent } from '~/components/ui/card';
import type { TiposContrato } from '~/types/mantencion';

import { createColumns } from './columns';
import TipoContratoFormModal from './tipo-contrato-form-modal';

interface TiposContratosComponentProps {
  tiposContratos: TiposContrato[];
}

export default function TiposContratosComponent({
  tiposContratos
}: Readonly<TiposContratosComponentProps>) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTipoContrato, setSelectedTipoContrato] = useState<
    TiposContrato | undefined
  >(undefined);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');

  const revalidator = useRevalidator();

  const handleAdd = () => {
    setSelectedTipoContrato(undefined);
    setModalMode('add');
    setIsModalOpen(true);
  };

  const handleEdit = (tipoContrato: TiposContrato) => {
    setSelectedTipoContrato(tipoContrato);
    setModalMode('edit');
    setIsModalOpen(true);
  };

  const handleDelete = async (tipoContrato: TiposContrato) => {
    if (
      window.confirm(
        `¿Está seguro de que desea eliminar el tipo de contrato "${tipoContrato.nombre}"?`
      )
    ) {
      try {
        const { default: api } = await import('~/lib/api');
        await api.delete(`/eliminarTipoContrato/${tipoContrato.id}`);

        toast.success('Tipo de contrato eliminado exitosamente');
        revalidator.revalidate();
      } catch (error) {
        console.error('Error al eliminar tipo de contrato:', error);
        toast.error('Error al eliminar el tipo de contrato');
      }
    }
  };

  const handleSuccess = () => {
    toast.success(
      modalMode === 'add'
        ? 'Tipo de contrato creado exitosamente'
        : 'Tipo de contrato actualizado exitosamente'
    );
    revalidator.revalidate();
  };

  const columns = createColumns({
    onEdit: handleEdit,
    onDelete: handleDelete
  });

  return (
    <div className='min-h-screen bg-slate-50/30 dark:bg-slate-950/30'>
      <div className='container mx-auto p-3 space-y-4'>
        {/* Header */}
        <ModernHeader
          title='Tipos de Contrato'
          description='Gestiona los tipos de contrato del sistema'
          actions={
            <div className='flex gap-2'>
              <Button
                onClick={handleAdd}
                className='bg-sky-600 hover:bg-sky-700 text-white'
                size='sm'
              >
                <Plus className='mr-2 h-4 w-4' />
                Agregar Tipo de Contrato
              </Button>
            </div>
          }
        />

        {/* Data Table */}
        <Card className='border border-slate-200/60 dark:border-slate-700/60 shadow-sm'>
          <CardContent className='relative'>
            <DataTable columns={columns} data={tiposContratos} />
          </CardContent>
        </Card>

        {/* Modal */}
        <TipoContratoFormModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSuccess={handleSuccess}
          tipoContrato={selectedTipoContrato}
          mode={modalMode}
        />
      </div>
    </div>
  );
}
