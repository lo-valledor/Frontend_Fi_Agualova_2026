import { Plus } from 'lucide-react';
import { toast } from 'sonner';

import { useState } from 'react';

import { useRevalidator } from 'react-router';

import { DataTable } from '~/components/data-table/data-table';
import { ModernHeader } from '~/components/shared/modern-header';
import { Button } from '~/components/ui/button';
import { Card, CardContent } from '~/components/ui/card';
import type { Empalme } from '~/types/mantencion';

import { columns } from './columns';
import EmpalmesModalForm from './empalmes-modal-form';

interface EmpalmesComponentProps {
  empalmes: Empalme[];
}

export default function EmpalmesComponent({
  empalmes
}: Readonly<EmpalmesComponentProps>) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEmpalme, setSelectedEmpalme] = useState<Empalme | null>(null);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const revalidator = useRevalidator();

  const handleAddEmpalme = () => {
    setSelectedEmpalme(null);
    setModalMode('add');
    setIsModalOpen(true);
  };

  const handleEditEmpalme = (empalme: Empalme) => {
    setSelectedEmpalme(empalme);
    setModalMode('edit');
    setIsModalOpen(true);
  };

  const handleDeleteEmpalme = (empalme: Empalme) => {
    setSelectedEmpalme(empalme);
    // TODO: Implementar diálogo de confirmación de eliminación
    setIsModalOpen(true);
  };

  const handleEmpalmeSuccess = () => {
    // Usar revalidation de React Router v7 en lugar de fetch manual
    revalidator.revalidate();
    setIsModalOpen(false);
    toast.success(
      modalMode === 'add'
        ? 'Empalme creado exitosamente'
        : 'Empalme actualizado exitosamente'
    );
  };

  return (
    <div className='min-h-screen bg-slate-50/30 dark:bg-slate-950/30'>
      <div className='container mx-auto p-3 space-y-4'>
        {/* Header */}
        <ModernHeader
          title='Empalmes'
          description='Gestiona los empalmes del sistema'
          actions={
            <div className='flex gap-2'>
              <Button
                onClick={handleAddEmpalme}
                className='bg-sky-600 hover:bg-sky-700 text-white'
                size='sm'
              >
                <Plus className='mr-2 h-4 w-4' />
                Agregar Empalme
              </Button>
            </div>
          }
        />

        {/* Table */}
        <Card className='border border-slate-200/60 dark:border-slate-700/60 shadow-sm'>
          <CardContent className='relative'>
            <DataTable
              columns={columns({
                onEdit: handleEditEmpalme,
                onDelete: handleDeleteEmpalme
              })}
              data={empalmes}
            />
          </CardContent>
        </Card>

        {/* Modal */}
        <EmpalmesModalForm
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSuccess={handleEmpalmeSuccess}
          empalme={selectedEmpalme}
          mode={modalMode}
          existingCodes={empalmes.map(emp => emp.codigo)}
        />
      </div>
    </div>
  );
}
