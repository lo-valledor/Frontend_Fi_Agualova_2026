import { Plus } from 'lucide-react';
import { toast } from 'sonner';

import React, { useState } from 'react';

import { useRevalidator } from 'react-router';

import { DataTable } from '~/components/data-table/data-table';
import { Button } from '~/components/ui/button';
import { Card, CardContent } from '~/components/ui/card';
import type { Zonas } from '~/types/mantencion';

import { columns } from './columns';
import ZonaFormModal from './zona-form-modal';

interface ZonasComponentProps {
  zonas: Zonas[];
}

export default function ZonasComponent({ zonas }: ZonasComponentProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedZona, setSelectedZona] = useState<Zonas | null>(null);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const revalidator = useRevalidator();

  const handleAddZona = () => {
    setSelectedZona(null);
    setModalMode('add');
    setIsModalOpen(true);
  };

  const handleEditZona = (zona: Zonas) => {
    setSelectedZona(zona);
    setModalMode('edit');
    setIsModalOpen(true);
  };

  const handleDeleteZona = (zona: Zonas) => {
    setSelectedZona(zona);
    // TODO: Implementar diálogo de confirmación de eliminación
    setIsModalOpen(true);
  };

  const handleZonaSuccess = () => {
    // Usar revalidation de React Router v7 en lugar de fetch manual
    revalidator.revalidate();
    setIsModalOpen(false);
    toast.success(
      modalMode === 'add'
        ? 'Zona creada exitosamente'
        : 'Zona actualizada exitosamente'
    );
  };

  return (
    <div className='container mx-auto p-3 md:p-6 space-y-6'>
      {/* Header */}
      <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4'>
        <div className='space-y-1'>
          <div className='flex items-center gap-3'>
            <h1 className='text-2xl md:text-3xl font-bold tracking-tight text-sky-900 dark:text-sky-100'>
              Zonas
            </h1>
          </div>
        </div>
        <Button
          onClick={handleAddZona}
          className='bg-sky-600 hover:bg-sky-700 text-white'
        >
          <Plus className='mr-2 h-4 w-4' />
          Agregar Zona
        </Button>
      </div>

      {/* Table */}
      <Card className='border-0 shadow-lg bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm'>
        <CardContent className='relative'>
          <DataTable
            columns={columns({
              onEdit: handleEditZona,
              onDelete: handleDeleteZona,
            })}
            data={zonas}
          />
        </CardContent>
      </Card>

      {/* Modal */}
      <ZonaFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleZonaSuccess}
        zona={selectedZona}
        mode={modalMode}
      />
    </div>
  );
}
