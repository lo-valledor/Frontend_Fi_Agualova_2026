import { Plus } from 'lucide-react';
import { toast } from 'sonner';

import React, { useState } from 'react';

import { useRevalidator } from 'react-router';

import { DataTable } from '~/components/data-table/data-table';
import { ModernHeader } from '~/components/shared/modern-header';
import { Button } from '~/components/ui/button';
import { Card, CardContent } from '~/components/ui/card';
import type { Claves } from '~/types/mantencion';

import ClaveFormModal from './clave-form-modal';
import { createColumns } from './columns';

interface ClavesComponentProps {
  claves: Claves[];
}

export default function ClavesComponent({
  claves,
}: Readonly<ClavesComponentProps>) {
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
    <div className='min-h-screen bg-slate-50/30 dark:bg-slate-950/30'>
      <div className='container mx-auto p-3 space-y-4'>
        {/* Header */}
        <ModernHeader
          title='Claves'
          description='Gestiona las claves del sistema'
          actions={
            <div className='flex gap-2'>
              <Button
                onClick={handleAdd}
                className='bg-sky-600 hover:bg-sky-700 text-white'
                size='sm'
              >
                <Plus className='mr-2 h-4 w-4' />
                Agregar Clave
              </Button>
            </div>
          }
        />

        {/* Data Table */}
        <Card className='border border-slate-200/60 dark:border-slate-700/60 shadow-sm'>
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
          existingCodes={claves.map(c => c.codigo)}
        />
      </div>
    </div>
  );
}
