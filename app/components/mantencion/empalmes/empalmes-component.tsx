import { Plus } from 'lucide-react';
import { toast } from 'sonner';

import { useCallback, useState } from 'react';

import { useRevalidator } from 'react-router';

import { useAuth } from '~/context/AuthContext';
import { DataTable } from '~/components/data-table/data-table';
import { ModernHeader } from '~/components/shared/modern-header';
import { Button } from '~/components/ui/button';
import { Card, CardContent } from '~/components/ui/card';
import type { Empalme } from '~/types/mantencion';

import { columns } from './columns';
import EmpalmesModalForm from './empalmes-modal-form';

interface EmpalmesComponentProps {
  empalmes: Empalme[];
}

export default function EmpalmesComponent({
  empalmes
}: Readonly<EmpalmesComponentProps>) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEmpalme, setSelectedEmpalme] = useState<Empalme | null>(null);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const revalidator = useRevalidator();

  // Permisos
  const { canCreate, canEdit } = useAuth();
  const route = '/dashboard/mantencion/empalmes';
  const hasCreatePermission = canCreate(route);
  const hasEditPermission = canEdit(route);

  const handleAddEmpalme = useCallback(() => {
    setSelectedEmpalme(null);
    setModalMode('add');
    setIsModalOpen(true);
  }, []);

  const handleEditEmpalme = useCallback(
    (empalme: Empalme) => {
      if (!hasEditPermission) {
        toast.error('No tiene permisos para editar empalmes');
        return;
      }
      setSelectedEmpalme(empalme);
      setModalMode('edit');
      setIsModalOpen(true);
    },
    [hasEditPermission]
  );

  const handleDeleteEmpalme = useCallback((empalme: Empalme) => {
    setSelectedEmpalme(empalme);
    toast.warning('Empalme eliminado exitosamente');
    setIsModalOpen(true);
  }, []);

  const handleEmpalmeSuccess = useCallback(() => {
    // Usar revalidation de React Router v7 en lugar de fetch manual
    revalidator.revalidate();
    setIsModalOpen(false);
    toast.success(
      modalMode === 'add'
        ? 'Empalme creado exitosamente'
        : 'Empalme actualizado exitosamente'
    );
  }, [modalMode, revalidator]);

  return (
    <div className='min-h-screen bg-background'>
      <div className='container mx-auto p-3 space-y-4'>
        {/* Header */}
        <ModernHeader
          title='Empalmes'
          description='Gestiona los empalmes del sistema'
          actions={
            <div className='flex gap-2'>
              <Button
                onClick={handleAddEmpalme}
                variant='default'
                size='sm'
                disabled={!hasCreatePermission}
                title={
                  !hasCreatePermission
                    ? 'No tiene permisos para crear empalmes'
                    : ''
                }
              >
                <Plus className='mr-2 h-4 w-4' />
                Agregar Empalme
              </Button>
            </div>
          }
        />

        {/* Table */}
        <Card className='border border-border shadow-sm'>
          <CardContent className='relative'>
            <DataTable
              columns={columns({
                onEdit: handleEditEmpalme,
                onDelete: handleDeleteEmpalme,
                canEdit: hasEditPermission
              })}
              data={empalmes}
            />
          </CardContent>
        </Card>

        {/* Modal */}
        <EmpalmesModalForm
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSuccess={handleEmpalmeSuccess}
          empalme={selectedEmpalme}
          mode={modalMode}
          existingCodes={empalmes.map(emp => emp.codigo)}
        />
      </div>
    </div>
  );
}
