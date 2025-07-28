import { Plus } from 'lucide-react';
import { toast } from 'sonner';

import React, { useState } from 'react';

import { useRevalidator } from 'react-router';

import { DataTable } from '~/components/data-table/data-table';
import { Button } from '~/components/ui/button';
import { Card, CardContent } from '~/components/ui/card';
import type { Marca } from '~/types/mantencion';

import { columns } from './columns';
import MarcaFormModal from './marca-form-modal';

interface MarcasComponentProps {
  marcas: Marca[];
}

export default function MarcasComponent({ marcas }: MarcasComponentProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMarca, setSelectedMarca] = useState<Marca | null>(null);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const revalidator = useRevalidator();

  const handleAddMarca = () => {
    setSelectedMarca(null);
    setModalMode('add');
    setIsModalOpen(true);
  };

  const handleEditMarca = (marca: Marca) => {
    setSelectedMarca(marca);
    setModalMode('edit');
    setIsModalOpen(true);
  };

  const handleDeleteMarca = (marca: Marca) => {
    setSelectedMarca(marca);
    // TODO: Implementar diálogo de confirmación de eliminación
    setIsModalOpen(true);
  };

  const handleMarcaSuccess = () => {
    // Usar revalidation de React Router v7 en lugar de fetch manual
    revalidator.revalidate();
    setIsModalOpen(false);
    toast.success(
      modalMode === 'add'
        ? 'Marca creada exitosamente'
        : 'Marca actualizada exitosamente'
    );
  };

  return (
    <div className='container mx-auto p-3 md:p-6 space-y-6'>
      {/* Header */}
      <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4'>
        <div className='space-y-1'>
          <div className='flex items-center gap-3'>
            <h1 className='text-2xl md:text-3xl font-bold tracking-tight text-sky-900 dark:text-sky-100'>
              Marcas
            </h1>
          </div>
        </div>
        <Button
          onClick={handleAddMarca}
          className='bg-sky-600 hover:bg-sky-700 text-white'
        >
          <Plus className='mr-2 h-4 w-4' />
          Agregar Marca
        </Button>
      </div>

      {/* Table */}
      <Card className='border-0 shadow-lg bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm'>
        <CardContent className='relative'>
          <DataTable
            columns={columns({
              onEdit: handleEditMarca,
              onDelete: handleDeleteMarca,
            })}
            data={marcas}
          />
        </CardContent>
      </Card>

      {/* Modal */}
      <MarcaFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleMarcaSuccess}
        marca={selectedMarca}
        mode={modalMode}
      />
    </div>
  );
}
