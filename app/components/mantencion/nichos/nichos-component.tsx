import { Plus } from 'lucide-react';
import { toast } from 'sonner';

import React, { useCallback, useMemo, useState } from 'react';

import { useRevalidator } from 'react-router';

import { useAuth } from '~/context/AuthContext';
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

  // Permisos
  const { canCreate, canEdit } = useAuth();
  const route = '/dashboard/mantencion/nichos';
  const hasCreatePermission = canCreate(route);
  const hasEditPermission = canEdit(route);

  const handleAddNicho = useCallback(() => {
    setSelectedNicho(null);
    setModalMode('add');
    setIsModalOpen(true);
  }, []);

  const handleEditNicho = useCallback(
    (nicho: Nicho) => {
      if (!hasEditPermission) {
        toast.error('No tiene permisos para editar nichos');
        return;
      }
      setSelectedNicho(nicho);
      setModalMode('edit');
      setIsModalOpen(true);
    },
    [hasEditPermission]
  );

  const handleDeleteNicho = useCallback((nicho: Nicho) => {
    setSelectedNicho(nicho);
    setIsModalOpen(true);
  }, []);

  const handleNichoSuccess = useCallback(() => {
    // Usar revalidation de React Router v7 en lugar de fetch manual
    revalidator.revalidate();
    setIsModalOpen(false);
    toast.success(
      modalMode === 'add'
        ? 'Nicho creado exitosamente'
        : 'Nicho actualizado exitosamente'
    );
  }, [modalMode, revalidator]);

  const memoizedColumns = useMemo(
    () =>
      columns({
        onEdit: handleEditNicho,
        onDelete: handleDeleteNicho,
        canEdit: hasEditPermission
      }),
    [handleEditNicho, handleDeleteNicho, hasEditPermission]
  );

  return (
    <div className='min-h-screen bg-background'>
      <div className='container mx-auto p-3 space-y-4'>
        {/* Header */}
        <ModernHeader
          title='Nichos'
          description='Gestiona los nichos del sistema'
          actions={
            <div className='flex gap-2'>
              <Button
                onClick={handleAddNicho}
                variant='default'
                size='sm'
                disabled={!hasCreatePermission}
                title={
                  !hasCreatePermission
                    ? 'No tiene permisos para crear nichos'
                    : ''
                }
              >
                <Plus className='mr-2 h-4 w-4' />
                Agregar Nicho
              </Button>
            </div>
          }
        />

        {/* Table */}
        <Card className='border border-border shadow-sm'>
          <CardContent className='relative'>
            <DataTable columns={memoizedColumns} data={nichos} />
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
