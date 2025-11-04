import { Plus } from 'lucide-react';
import { toast } from 'sonner';

import React, { useMemo, useState } from 'react';

import { useRevalidator } from 'react-router';

import { useAuth } from '~/context/AuthContext';
import { DataTable } from '~/components/data-table/data-table';
import { ModernHeader } from '~/components/shared/modern-header';
import { Button } from '~/components/ui/button';
import { Card, CardContent } from '~/components/ui/card';
import type { Tarifas } from '~/types/mantencion';

import { createColumns } from './columns';
import TarifaFormModal from './tarifa-form-modal';

interface TarifasComponentProps {
  tarifas: Tarifas[];
}

export default function TarifasComponent({
  tarifas
}: Readonly<TarifasComponentProps>) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTarifa, setSelectedTarifa] = useState<Tarifas | undefined>(
    undefined
  );
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');

  const revalidator = useRevalidator();

  // Permisos
  const { canCreate, canEdit } = useAuth();
  const route = '/dashboard/mantencion/tarifas';
  const hasCreatePermission = canCreate(route);
  const hasEditPermission = canEdit(route);

  const handleAdd = () => {
    setSelectedTarifa(undefined);
    setModalMode('add');
    setIsModalOpen(true);
  };

  const handleEdit = (tarifa: Tarifas) => {
    if (!hasEditPermission) {
      toast.error('No tiene permisos para editar tarifas');
      return;
    }
    setSelectedTarifa(tarifa);
    setModalMode('edit');
    setIsModalOpen(true);
  };

  const handleDelete = async (tarifa: Tarifas) => {
    if (
      window.confirm(
        `¿Está seguro de que desea eliminar la tarifa "${tarifa.nombre}"?`
      )
    ) {
      try {
        const { default: api } = await import('~/lib/api');
        await api.delete(`/eliminarTarifa/${tarifa.id}`);

        toast.success('Tarifa eliminada exitosamente');
        revalidator.revalidate();
      } catch (error) {
        toast.error('Error al eliminar la tarifa');
      }
    }
  };

  const handleSuccess = () => {
    toast.success(
      modalMode === 'add'
        ? 'Tarifa creada exitosamente'
        : 'Tarifa actualizada exitosamente'
    );
    revalidator.revalidate();
  };

  const columns = useMemo(
    () =>
      createColumns({
        onEdit: handleEdit,
        onDelete: handleDelete,
        canEdit: hasEditPermission
      }),
    [handleEdit, handleDelete, hasEditPermission]
  );

  return (
    <div className='min-h-screen bg-background'>
      <div className='container mx-auto p-3 space-y-4'>
        {/* Header */}
        <ModernHeader
          title='Tarifas'
          description='Gestiona las tarifas del sistema'
          actions={
            <div className='flex gap-2'>
              <Button
                onClick={handleAdd}
                variant='default'
                size='sm'
                disabled={!hasCreatePermission}
                title={
                  !hasCreatePermission
                    ? 'No tiene permisos para crear tarifas'
                    : ''
                }
              >
                <Plus className='mr-2 h-4 w-4' />
                Agregar Tarifa
              </Button>
            </div>
          }
        />

        {/* Data Table */}
        <Card className='border border-border shadow-sm'>
          <CardContent className='relative'>
            <DataTable columns={columns} data={tarifas} />
          </CardContent>
        </Card>

        {/* Modal */}
        <TarifaFormModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSuccess={handleSuccess}
          tarifa={selectedTarifa}
          mode={modalMode}
        />
      </div>
    </div>
  );
}
