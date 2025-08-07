import { Plus } from 'lucide-react';
import { toast } from 'sonner';

import React, { useState } from 'react';

import { useRevalidator } from 'react-router';

import { DataTable } from '~/components/data-table/data-table';
import { Button } from '~/components/ui/button';
import { Card, CardContent } from '~/components/ui/card';
import type { Tarifas } from '~/types/mantencion';

import { createColumns } from './columns';
import TarifaFormModal from './tarifa-form-modal';

interface TarifasComponentProps {
  tarifas: Tarifas[];
}

export default function TarifasComponent({ tarifas }: TarifasComponentProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTarifa, setSelectedTarifa] = useState<Tarifas | undefined>(
    undefined
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
        `¿Está seguro de que desea eliminar la tarifa "${tarifa.nombre}"?`
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
        : 'Tarifa actualizada exitosamente'
    );
    revalidator.revalidate();
  };

  const columns = createColumns({
    onEdit: handleEdit,
    onDelete: handleDelete,
  });

  return (
    <div className='min-h-screen bg-slate-50/30 dark:bg-slate-950/30'>
      <div className='container mx-auto p-3 space-y-4'>
        {/* Header */}
        <div className='flex items-center justify-between pb-3 border-b border-slate-200/60 dark:border-slate-700/60'>
          <div>
            <h1 className='text-xl font-semibold text-slate-900 dark:text-slate-100'>
              Tarifas
            </h1>
            <p className='text-sm text-slate-600 dark:text-slate-400'>
              Gestiona las tarifas del sistema
            </p>
          </div>
          <Button
            onClick={handleAdd}
            className='bg-sky-600 hover:bg-sky-700 text-white'
          >
            <Plus className='mr-2 h-4 w-4' />
            Agregar Tarifa
          </Button>
        </div>

        {/* Data Table */}
        <Card className='border border-slate-200/60 dark:border-slate-700/60 shadow-sm'>
          <CardContent className='relative'>
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
    </div>
  );
}
