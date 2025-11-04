import { Plus } from 'lucide-react';
import { toast } from 'sonner';

import React, { useCallback, useMemo, useState } from 'react';

import { useRevalidator } from 'react-router';

import { useAuth } from '~/context/AuthContext';
import { DataTable } from '~/components/data-table/data-table';
import { ModernHeader } from '~/components/shared/modern-header';
import { Button } from '~/components/ui/button';
import { Card, CardContent } from '~/components/ui/card';
import type { Claves } from '~/types/mantencion';

import ClaveFormModal from './clave-form-modal';
import { createColumns } from './columns';

interface ClavesComponentProps {
  claves: Claves[];
}

export default function ClavesComponent({
  claves
}: Readonly<ClavesComponentProps>) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedClave, setSelectedClave] = useState<Claves | undefined>(
    undefined
  );
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');

  const revalidator = useRevalidator();

  // Permisos
  const { canCreate, canEdit } = useAuth();
  const route = '/dashboard/mantencion/claves';
  const hasCreatePermission = canCreate(route);
  const hasEditPermission = canEdit(route);

  const handleAdd = useCallback(() => {
    setSelectedClave(undefined);
    setModalMode('add');
    setIsModalOpen(true);
  }, []);

  const handleEdit = useCallback(
    (clave: Claves) => {
      if (!hasEditPermission) {
        toast.error('No tiene permisos para editar claves');
        return;
      }
      setSelectedClave(clave);
      setModalMode('edit');
      setIsModalOpen(true);
    },
    [hasEditPermission]
  );

  const handleDelete = useCallback(
    async (clave: Claves) => {
      if (
        window.confirm(
          `¿Está seguro de que desea eliminar la clave "${clave.codigo}"?`
        )
      ) {
        try {
          const { default: api } = await import('~/lib/api');
          await api.delete(`/eliminarClaves/${clave.id}`);

          toast.success('Clave eliminada exitosamente');
          revalidator.revalidate();
        } catch (error) {
          toast.error('Error al eliminar la clave');
        }
      }
    },
    [revalidator]
  );

  const handleSuccess = useCallback(() => {
    revalidator.revalidate();
    setIsModalOpen(false);
    toast.success(
      modalMode === 'add'
        ? 'Clave creada exitosamente'
        : 'Clave actualizada exitosamente'
    );
  }, [modalMode, revalidator]);

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
          title='Claves'
          description='Gestiona las claves del sistema'
          actions={
            <div className='flex gap-2'>
              <Button
                onClick={handleAdd}
                variant='default'
                size='sm'
                disabled={!hasCreatePermission}
                title={
                  !hasCreatePermission
                    ? 'No tiene permisos para crear claves'
                    : ''
                }
              >
                <Plus className='mr-2 h-4 w-4' />
                Agregar Clave
              </Button>
            </div>
          }
        />

        {/* Data Table */}
        <Card className='border border-border shadow-sm'>
          <CardContent className='relative'>
            <DataTable columns={columns} data={claves} />
          </CardContent>
        </Card>

        {/* Modal */}
        <ClaveFormModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSuccess={handleSuccess}
          clave={selectedClave}
          mode={modalMode}
          existingCodes={claves.map(c => c.codigo)}
        />
      </div>
    </div>
  );
}
