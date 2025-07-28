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
    <div className='container mx-auto p-3 md:p-6 space-y-6'>
      {/* Header */}
      <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4'>
        <div className='space-y-1'>
          <div className='flex items-center gap-3'>
            <h1 className='text-2xl md:text-3xl font-bold tracking-tight text-sky-900 dark:text-sky-100'>
              Sectores
            </h1>
          </div>
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
      <Card className='border-0 shadow-lg bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm'>
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
  );
}
