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
    <div className='min-h-screen bg-slate-50/30 dark:bg-slate-950/30'>
      <div className='container mx-auto p-3 space-y-4'>
        {/* Header */}
        <div className='flex items-center justify-between pb-3 border-b border-slate-200/60 dark:border-slate-700/60'>
          <div>
            <h1 className='text-xl font-semibold text-slate-900 dark:text-slate-100'>
              Zonas
            </h1>
            <p className='text-sm text-slate-600 dark:text-slate-400'>
              Gestiona las zonas del sistema
            </p>
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
        <Card className='border border-slate-200/60 dark:border-slate-700/60 shadow-sm'>
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
    </div>
  );
}
