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
import type { TiposContrato } from '~/types/mantencion';

import { createColumns } from './columns';
import TipoContratoFormModal from './tipo-contrato-form-modal';

const mechanicalEase = [0.25, 0.1, 0.25, 1] as const;

interface TiposContratosComponentProps {
  tiposContratos: TiposContrato[];
}

export default function TiposContratosComponent({
  tiposContratos
}: Readonly<TiposContratosComponentProps>) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTipoContrato, setSelectedTipoContrato] = useState<
    TiposContrato | undefined
  >(undefined);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');

  const revalidator = useRevalidator();

  // Permisos
  const { canCreate, canEdit } = useAuth();
  const route = '/dashboard/mantencion/tipos-contratos';
  const hasCreatePermission = canCreate(route);
  const hasEditPermission = canEdit(route);

  const handleAdd = () => {
    setSelectedTipoContrato(undefined);
    setModalMode('add');
    setIsModalOpen(true);
  };

  const handleEdit = (tipoContrato: TiposContrato) => {
    if (!hasEditPermission) {
      toast.error('No tiene permisos para editar tipos de contrato');
      return;
    }
    setSelectedTipoContrato(tipoContrato);
    setModalMode('edit');
    setIsModalOpen(true);
  };

  const handleDelete = async (tipoContrato: TiposContrato) => {
    if (
      globalThis.confirm(
        `¿Está seguro de que desea eliminar el tipo de contrato "${tipoContrato.nombre}"?`
      )
    ) {
      try {
        const { default: api } = await import('~/lib/api');
        await api.delete(`/eliminarTipoContrato/${tipoContrato.id}`);

        toast.success('Tipo de contrato eliminado exitosamente');
        revalidator.revalidate();
      } catch (error) {
        console.error('Error al eliminar el tipo de contrato:', error);
        toast.error('Error al eliminar el tipo de contrato');
      }
    }
  };

  const handleSuccess = () => {
    toast.success(
      modalMode === 'add'
        ? 'Tipo de contrato creado exitosamente'
        : 'Tipo de contrato actualizado exitosamente'
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
            title='Tipos de Contrato'
            description='Gestiona los tipos de contrato del sistema'
            actions={
              <Button
                onClick={handleAdd}
                variant='default'
                size='sm'
                disabled={!hasCreatePermission}
                title={
                  !hasCreatePermission
                    ? 'No tiene permisos para crear tipos de contrato'
                    : ''
                }
              >
                <Plus className='mr-2 h-4 w-4' />
                Agregar Tipo de Contrato
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
                    Listado de Tipos de Contrato
                  </CardTitle>
                  <CardDescription className='text-xs mt-0.5 text-muted-foreground'>
                    {tiposContratos.length} tipo
                    {tiposContratos.length !== 1 ? 's' : ''}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <div className='industrial-divider' />
            <CardContent className='relative p-4'>
              <div className='overflow-x-auto -mx-1'>
                <DataTable columns={columns} data={tiposContratos} />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Modal */}
        <TipoContratoFormModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSuccess={handleSuccess}
          tipoContrato={selectedTipoContrato}
          mode={modalMode}
        />
      </div>
    </div>
  );
}
