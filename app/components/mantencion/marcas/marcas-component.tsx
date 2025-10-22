import { Plus } from 'lucide-react';
import { toast } from 'sonner';

import React, { useCallback, useState } from 'react';

import { useRevalidator } from 'react-router';

import { useAuth } from '~/context/AuthContext';
import { DataTable } from '~/components/data-table/data-table';
import { ModernHeader } from '~/components/shared/modern-header';
import { Button } from '~/components/ui/button';
import { Card, CardContent } from '~/components/ui/card';
import type { Marca } from '~/types/mantencion';

import { columns } from './columns';
import MarcaFormModal from './marca-form-modal';

interface MarcasComponentProps {
  marcas: Marca[];
}

export default function MarcasComponent({
  marcas
}: Readonly<MarcasComponentProps>) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMarca, setSelectedMarca] = useState<Marca | null>(null);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const revalidator = useRevalidator();

  // Permisos
  const { canCreate, canEdit } = useAuth();
  const route = '/dashboard/mantencion/marcas';
  const hasCreatePermission = canCreate(route);
  const hasEditPermission = canEdit(route);

  const handleAddMarca = useCallback(() => {
    setSelectedMarca(null);
    setModalMode('add');
    setIsModalOpen(true);
  }, []);

  const handleEditMarca = useCallback(
    (marca: Marca) => {
      if (!hasEditPermission) {
        toast.error('No tiene permisos para editar marcas');
        return;
      }
      setSelectedMarca(marca);
      setModalMode('edit');
      setIsModalOpen(true);
    },
    [hasEditPermission]
  );

  const handleDeleteMarca = useCallback((marca: Marca) => {
    setSelectedMarca(marca);
    toast.warning('Marca eliminada exitosamente');
    setIsModalOpen(true);
  }, []);

  const handleMarcaSuccess = useCallback(() => {
    // Usar revalidation de React Router v7 en lugar de fetch manual
    revalidator.revalidate();
    setIsModalOpen(false);
    toast.success(
      modalMode === 'add'
        ? 'Marca creada exitosamente'
        : 'Marca actualizada exitosamente'
    );
  }, [modalMode, revalidator]);

  return (
    <div className='min-h-screen bg-background'>
      <div className='container mx-auto p-3 space-y-4'>
        {/* Header */}
        <ModernHeader
          title='Marcas'
          description='Gestiona las marcas del sistema'
          actions={
            <div className='flex gap-2'>
              <Button
                onClick={handleAddMarca}
                variant='default'
                size='sm'
                disabled={!hasCreatePermission}
                title={
                  !hasCreatePermission
                    ? 'No tiene permisos para crear marcas'
                    : ''
                }
              >
                <Plus className='mr-2 h-4 w-4' />
                Agregar Marca
              </Button>
            </div>
          }
        />

        {/* Table */}
        <Card className='border-0 shadow-lg bg-background backdrop-blur-sm'>
          <CardContent className='relative'>
            <DataTable
              columns={columns({
                onEdit: handleEditMarca,
                onDelete: handleDeleteMarca,
                canEdit: hasEditPermission
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
    </div>
  );
}
