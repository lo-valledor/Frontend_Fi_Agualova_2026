import { Plus } from 'lucide-react';
import { toast } from 'sonner';

import React, { useState } from 'react';

import { useRevalidator } from 'react-router';

import { DataTable } from '~/components/data-table/data-table';
import { Button } from '~/components/ui/button';
import { Card, CardContent } from '~/components/ui/card';
import type { Claves } from '~/types/mantencion';

import ClaveFormModal from './clave-form-modal';
import { createColumns } from './columns';

interface ClavesComponentProps {
  claves: Claves[];
}

export default function ClavesComponent({ claves }: ClavesComponentProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedClave, setSelectedClave] = useState<Claves | undefined>(
    undefined
  );
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');

  const revalidator = useRevalidator();

  const handleAdd = () => {
    setSelectedClave(undefined);
    setModalMode('add');
    setIsModalOpen(true);
  };

  const handleEdit = (clave: Claves) => {
    setSelectedClave(clave);
    setModalMode('edit');
    setIsModalOpen(true);
  };

  const handleDelete = async (clave: Claves) => {
    if (
      window.confirm(
        `¿Está seguro de que desea eliminar la clave "${clave.codigo}"?`
      )
    ) {
      try {
        const { default: api } = await import('~/lib/api');
        await api.delete(`/eliminarClaves/${clave.id}`);

        toast.success('Clave eliminada exitosamente');
        revalidator.revalidate();
      } catch (error) {
        console.error('Error al eliminar clave:', error);
        toast.error('Error al eliminar la clave');
      }
    }
  };

  const handleSuccess = () => {
    toast.success(
      modalMode === 'add'
        ? 'Clave creada exitosamente'
        : 'Clave actualizada exitosamente'
    );
    revalidator.revalidate();
  };

  const columns = createColumns({
    onEdit: handleEdit,
    onDelete: handleDelete,
  });

  return (
    <div className='container mx-auto p-3 md:p-6 space-y-6'>
      {/* Header */}
      <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4'>
        <div className='space-y'>
          <div className='flex items-center gap-3'>
            <h1 className='text-2xl md:text-3xl font-bold tracking-tight text-sky-900 dark:text-sky-100'>
              Claves
            </h1>
          </div>
        </div>
        <Button
          onClick={handleAdd}
          className='bg-sky-600 hover:bg-sky-700 text-white'
        >
          <Plus className='mr-2 h-4 w-4' />
          Agregar Clave
        </Button>
      </div>

      {/* Data Table */}
      <Card className='border-0 shadow-lg bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm'>
        <CardContent className='relative'>
          <DataTable columns={columns} data={claves} />
        </CardContent>
      </Card>

      {/* Modal */}
      <ClaveFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleSuccess}
        clave={selectedClave}
        mode={modalMode}
      />
    </div>
  );
}
