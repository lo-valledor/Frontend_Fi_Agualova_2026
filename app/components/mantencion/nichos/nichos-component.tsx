import { Plus } from 'lucide-react';
import { toast } from 'sonner';

import React, { useState } from 'react';

import { useRevalidator } from 'react-router';

import { DataTable } from '~/components/data-table/data-table';
import { Button } from '~/components/ui/button';
import { Card, CardContent } from '~/components/ui/card';
import type { Nicho } from '~/types/mantencion';

import { columns } from './columns';
import NichoFormModal from './nichos-form-modal';
import { ModernHeader } from '~/components/shared/modern-header';

interface NichosComponentProps {
  nichos: Nicho[];
}

export default function NichosComponent({
  nichos
}: Readonly<NichosComponentProps>) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedNicho, setSelectedNicho] = useState<Nicho | null>(null);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const revalidator = useRevalidator();

  const handleAddNicho = () => {
    setSelectedNicho(null);
    setModalMode('add');
    setIsModalOpen(true);
  };

  const handleEditNicho = (nicho: Nicho) => {
    setSelectedNicho(nicho);
    setModalMode('edit');
    setIsModalOpen(true);
  };

  const handleDeleteNicho = (nicho: Nicho) => {
    setSelectedNicho(nicho);
    setIsModalOpen(true);
  };

  const handleNichoSuccess = () => {
    // Usar revalidation de React Router v7 en lugar de fetch manual
    revalidator.revalidate();
    setIsModalOpen(false);
    toast.success(
      modalMode === 'add'
        ? 'Nicho creado exitosamente'
        : 'Nicho actualizado exitosamente'
    );
  };

  return (
    <div className='min-h-screen bg-slate-50/30 dark:bg-slate-950/30'>
      <div className='container mx-auto p-3 space-y-4'>
        {/* Header */}
        <ModernHeader
          title='Nichos'
          description='Gestiona los nichos del sistema'
          actions={
            <div className='flex gap-2'>
              <Button
                onClick={handleAddNicho}
                className='bg-sky-600 hover:bg-sky-700 text-white'
                size='sm'
              >
                <Plus className='mr-2 h-4 w-4' />
                Agregar Nicho
              </Button>
            </div>
          }
        />

        {/* Table */}
        <Card className='border border-slate-200/60 dark:border-slate-700/60 shadow-sm'>
          <CardContent className='relative'>
            <DataTable
              columns={columns({
                onEdit: handleEditNicho,
                onDelete: handleDeleteNicho
              })}
              data={nichos}
            />
          </CardContent>
        </Card>

        {/* Modal */}
        <NichoFormModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSuccess={handleNichoSuccess}
          nicho={selectedNicho}
          mode={modalMode}
        />
      </div>
    </div>
  );
}
