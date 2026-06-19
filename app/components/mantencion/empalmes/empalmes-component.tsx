import { LayoutList, Plus } from 'lucide-react';
import { motion } from 'motion/react';
import { toast } from 'sonner';

import { useCallback, useState } from 'react';

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
import type { Empalme } from '~/types/mantencion';

import { columns } from './columns';
import EmpalmesModalForm from './empalmes-modal-form';

const mechanicalEase = [0.25, 0.1, 0.25, 1] as const;

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


  const handleAddEmpalme = useCallback(() => {
    setSelectedEmpalme(null);
    setModalMode('add');
    setIsModalOpen(true);
  }, []);

  const handleEditEmpalme = useCallback(
    (empalme: Empalme) => {
      setSelectedEmpalme(empalme);
      setModalMode('edit');
      setIsModalOpen(true);
    },
    []
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
      <div className='container mx-auto p-4 sm:p-6 space-y-6'>
        <header>
          <ModernHeader
            title='Empalmes'
            description='Gestiona los empalmes del sistema'
            actions={
              <Button
                onClick={handleAddEmpalme}
                variant='default'
                size='sm'
              >
                <Plus className='mr-2 h-4 w-4' />
                Agregar Empalme
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
                    Listado de Empalmes
                  </CardTitle>
                  <CardDescription className='text-xs mt-0.5 text-muted-foreground'>
                    {empalmes.length} empalme{empalmes.length !== 1 ? 's' : ''}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <div className='industrial-divider' />
            <CardContent className='relative p-4'>
              <div className='overflow-x-auto -mx-1'>
                <DataTable
                  columns={columns({
                    onEdit: handleEditEmpalme,
                    onDelete: handleDeleteEmpalme,
                  })}
                  data={empalmes}
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Modal */}
        <EmpalmesModalForm
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSuccess={handleEmpalmeSuccess}
          empalme={selectedEmpalme}
          mode={modalMode}
        />
      </div>
    </div>
  );
}
