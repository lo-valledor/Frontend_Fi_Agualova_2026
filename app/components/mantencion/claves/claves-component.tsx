import { LayoutList, Plus } from 'lucide-react';
import { motion } from 'motion/react';
import { toast } from 'sonner';

import React, { useCallback, useMemo, useState } from 'react';

import { useRevalidator } from 'react-router';

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
import type { Clave } from '~/types/mantencion';

import ClaveFormModal from './clave-form-modal';
import { createColumns } from './columns';

const mechanicalEase = [0.25, 0.1, 0.25, 1] as const;

interface ClavesComponentProps {
  claves: Clave[];
}

export default function ClavesComponent({
  claves
}: Readonly<ClavesComponentProps>) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedClave, setSelectedClave] = useState<Clave | undefined>(
    undefined
  );
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');

  const revalidator = useRevalidator();

  const handleAdd = useCallback(() => {
    setSelectedClave(undefined);
    setModalMode('add');
    setIsModalOpen(true);
  }, []);

  const handleEdit = useCallback((clave: Clave) => {
    setSelectedClave(clave);
    setModalMode('edit');
    setIsModalOpen(true);
  }, []);

  const handleDelete = useCallback(
    async (clave: Clave) => {
      if (
        globalThis.confirm(
          `¿Está seguro de que desea eliminar la clave "${clave.codigo}"?`
        )
      ) {
        try {
          const { default: api } = await import('~/lib/api');
          await api.delete(`/eliminarClaves/${clave.id}`);

          toast.success('Clave eliminada exitosamente');
          revalidator.revalidate();
        } catch (error) {
          console.error('Error al eliminar la clave:', error);
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
        onDelete: handleDelete
      }),
    [handleEdit, handleDelete]
  );

  return (
    <div className='min-h-screen bg-background'>
      <div className='container mx-auto p-4 sm:p-6 space-y-6'>
        <header>
          <ModernHeader
            title='Claves'
            description='Gestiona las claves del sistema'
            actions={
              <Button onClick={handleAdd} variant='default' size='sm'>
                <Plus className='mr-2 h-4 w-4' />
                Agregar Clave
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
                    Listado de Claves
                  </CardTitle>
                  <CardDescription className='text-xs mt-0.5 text-muted-foreground'>
                    {claves.length} clave{claves.length !== 1 ? 's' : ''}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <div className='industrial-divider' />
            <CardContent className='relative p-4'>
              <div className='overflow-x-auto -mx-1'>
                <DataTable columns={columns} data={claves} />
              </div>
            </CardContent>
          </Card>
        </motion.div>

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
