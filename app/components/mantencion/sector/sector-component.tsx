import { Plus } from 'lucide-react';
import { toast } from 'sonner';

import React, { useState } from 'react';

import { useRevalidator } from 'react-router';

import { DataTable } from '~/components/data-table/data-table';
import { Button } from '~/components/ui/button';
import { Card, CardContent } from '~/components/ui/card';
import type { Sectores } from '~/types/mantencion';

import { columns } from './columns';
import SectorFormModal from './sector-form-modal';

interface SectorComponentProps {
  sectores: Sectores[];
}

export default function SectorComponent({ sectores }: SectorComponentProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSector, setSelectedSector] = useState<Sectores | null>(null);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const revalidator = useRevalidator();

  const handleAddSector = () => {
    setSelectedSector(null);
    setModalMode('add');
    setIsModalOpen(true);
  };

  const handleEditSector = (sector: Sectores) => {
    setSelectedSector(sector);
    setModalMode('edit');
    setIsModalOpen(true);
  };

  const handleDeleteSector = (sector: Sectores) => {
    setSelectedSector(sector);
    // TODO: Implementar diálogo de confirmación de eliminación
    setIsModalOpen(true);
  };

  const handleSectorSuccess = () => {
    // Usar revalidation de React Router v7 en lugar de fetch manual
    revalidator.revalidate();
    setIsModalOpen(false);
    toast.success(
      modalMode === 'add'
        ? 'Sector creado exitosamente'
        : 'Sector actualizado exitosamente'
    );
  };

  return (
    <div className='min-h-screen bg-slate-50/30 dark:bg-slate-950/30'>
      <div className='container mx-auto p-3 space-y-4'>
        {/* Header */}
        <div className='flex items-center justify-between pb-3 border-b border-slate-200/60 dark:border-slate-700/60'>
          <div>
            <h1 className='text-xl font-semibold text-slate-900 dark:text-slate-100'>
              Sectores
            </h1>
            <p className='text-sm text-slate-600 dark:text-slate-400'>
              Gestiona los sectores del sistema
            </p>
          </div>
          <Button
            onClick={handleAddSector}
            className='bg-sky-600 hover:bg-sky-700 text-white'
          >
            <Plus className='mr-2 h-4 w-4' />
            Agregar Sector
          </Button>
        </div>

        {/* Table */}
        <Card className='border border-slate-200/60 dark:border-slate-700/60 shadow-sm'>
          <CardContent className='relative'>
            <DataTable
              columns={columns({
                onEdit: handleEditSector,
                onDelete: handleDeleteSector,
              })}
              data={sectores}
            />
          </CardContent>
        </Card>

        {/* Modal */}
        <SectorFormModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSuccess={handleSectorSuccess}
          sector={selectedSector}
          mode={modalMode}
        />
      </div>
    </div>
  );
}
