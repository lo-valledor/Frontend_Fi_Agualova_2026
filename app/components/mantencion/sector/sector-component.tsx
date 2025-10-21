import { Plus } from 'lucide-react';
import { toast } from 'sonner';

import React, { useState, useCallback } from 'react';

import { useRevalidator } from 'react-router';

import { DataTable } from '~/components/data-table/data-table';
import { ModernHeader } from '~/components/shared/modern-header';
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

  const handleAddSector = useCallback(() => {
    setSelectedSector(null);
    setModalMode('add');
    setIsModalOpen(true);
  }, []);

  const handleEditSector = useCallback((sector: Sectores) => {
    setSelectedSector(sector);
    setModalMode('edit');
    setIsModalOpen(true);
  }, []);

  const handleDeleteSector = useCallback((sector: Sectores) => {
    setSelectedSector(sector);
    toast.warning('Sector eliminado exitosamente');
    setIsModalOpen(true);
  }, []);

  const handleSectorSuccess = useCallback(() => {
    // Usar revalidation de React Router v7 en lugar de fetch manual
    revalidator.revalidate();
    setIsModalOpen(false);
    toast.success(
      modalMode === 'add'
        ? 'Sector creado exitosamente'
        : 'Sector actualizado exitosamente'
    );
  }, [modalMode, revalidator]);

  return (
    <div className='min-h-screen bg-background'>
      <div className='container mx-auto p-3 space-y-4'>
        {/* Header */}
        <ModernHeader
          title='Sector'
          description='Gestiona los sectores del sistema'
          actions={
            <div className='flex gap-2'>
              <Button
                onClick={handleAddSector}
                variant="default"
                size='sm'
              >
                <Plus className='mr-2 h-4 w-4' />
                Agregar Sector
              </Button>
            </div>
          }
        />

        {/* Table */}
        <Card className='border border-border shadow-sm'>
          <CardContent className='relative'>
            <DataTable
              columns={columns({
                onEdit: handleEditSector,
                onDelete: handleDeleteSector
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
