import { LayoutList, Plus } from 'lucide-react';
import { motion } from 'motion/react';
import { toast } from 'sonner';

import React, { useMemo, useState } from 'react';

import { useRevalidator } from 'react-router';

import { useAuth } from '~/context/AuthContext';
import { DataTable } from '~/components/data-table/data-table';
import { ModernHeader } from '~/components/shared/modern-header';
import { Button } from '~/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '~/components/ui/card';
import type { Tarifas } from '~/types/mantencion';

import { createColumns } from './columns';
import TarifaFormModal from './tarifa-form-modal';

const mechanicalEase = [0.25, 0.1, 0.25, 1] as const;

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
      globalThis.confirm(
        `¿Está seguro de que desea eliminar la tarifa "${tarifa.nombre}"?`
      )
    ) {
      try {
        const { default: api } = await import('~/lib/api');
        await api.delete(`/eliminarTarifa/${tarifa.id}`);

        toast.success('Tarifa eliminada exitosamente');
        revalidator.revalidate();
      } catch (error) {
        console.error('Error al eliminar la tarifa:', error);
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
      <div className='container mx-auto p-4 sm:p-6 space-y-6'>
        <header>
          <ModernHeader
            title='Tarifas'
            description='Gestiona las tarifas del sistema'
            actions={
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
            }
          />
          <div className='industrial-divider mt-4' />
        </header>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, ease: mechanicalEase }}
        >
          <Card className='overflow-hidden border border-border bg-card shadow-sm'>
            <CardHeader className='p-4 pb-3'>
              <div className='flex items-center gap-3'>
                <div className='flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-accent text-accent-foreground border border-border'>
                  <LayoutList className='h-4 w-4' />
                </div>
                <div>
                  <CardTitle className='text-xs font-bold uppercase tracking-wide text-foreground'>
                    Listado de Tarifas
                  </CardTitle>
                  <CardDescription className='text-xs mt-0.5 text-muted-foreground'>
                    {tarifas.length} tarifa{tarifas.length !== 1 ? 's' : ''}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <div className='industrial-divider' />
            <CardContent className='relative p-4'>
              <div className='overflow-x-auto -mx-1'>
                <DataTable columns={columns} data={tarifas} />
              </div>
            </CardContent>
          </Card>
        </motion.div>

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
