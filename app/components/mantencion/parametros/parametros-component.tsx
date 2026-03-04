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
import type { Parametro } from '~/types/mantencion';

import { createColumns } from './columns';
import ParametroFormModal from './parametro-form-modal';

const mechanicalEase = [0.25, 0.1, 0.25, 1] as const;

interface ParametrosComponentProps {
  parametros: Parametro[];
}

export default function ParametrosComponent({
  parametros
}: Readonly<ParametrosComponentProps>) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedParametro, setSelectedParametro] = useState<
    Parametro | undefined
  >(undefined);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');

  const revalidator = useRevalidator();

  // Permisos
  const { canCreate, canEdit } = useAuth();
  const route = '/dashboard/mantencion/parametros';
  const hasCreatePermission = canCreate(route);
  const hasEditPermission = canEdit(route);

  const handleAdd = () => {
    setSelectedParametro(undefined);
    setModalMode('add');
    setIsModalOpen(true);
  };

  const handleEdit = (parametro: Parametro) => {
    if (!hasEditPermission) {
      toast.error('No tiene permisos para editar par?metros');
      return;
    }
    setSelectedParametro(parametro);
    setModalMode('edit');
    setIsModalOpen(true);
  };

  const handleDelete = async (parametro: Parametro) => {
    if (
      globalThis.confirm(
        `?Est? seguro de que desea eliminar el par?metro "${parametro.descripcion}"?`
      )
    ) {
      try {
        const { default: api } = await import('~/lib/api');
        await api.delete(`/eliminarParametro/${parametro.id}`);

        toast.success('Par?metro eliminado exitosamente');
        revalidator.revalidate();
      } catch (error) {
        console.error('Error al eliminar el par?metro:', error);
        toast.error('Error al eliminar el par?metro');
      }
    }
  };

  const handleSuccess = () => {
    toast.success(
      modalMode === 'add'
        ? 'Par?metro creado exitosamente'
        : 'Par?metro actualizado exitosamente'
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
            title='Par?metros'
            description='Gestiona los par?metros del sistema'
            actions={
              <Button
                onClick={handleAdd}
                variant='default'
                size='sm'
                disabled={!hasCreatePermission}
                title={
                  !hasCreatePermission
                    ? 'No tiene permisos para crear par?metros'
                    : ''
                }
              >
                <Plus className='mr-2 h-4 w-4' />
                Agregar Par?metro
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
                    Listado de Par?metros
                  </CardTitle>
                  <CardDescription className='text-xs mt-0.5 text-muted-foreground'>
                    {parametros.length} par?metro{parametros.length !== 1 ? 's' : ''}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <div className='industrial-divider' />
            <CardContent className='relative p-4'>
              <div className='overflow-x-auto -mx-1'>
                <DataTable columns={columns} data={parametros} />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Modal */}
        <ParametroFormModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSuccess={handleSuccess}
          parametro={selectedParametro}
          mode={modalMode}
        />
      </div>
    </div>
  );
}
