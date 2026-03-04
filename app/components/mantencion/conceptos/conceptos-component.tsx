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
import type { ComboAsociadoConceptos, Conceptos } from '~/types/mantencion';

import { createColumns } from './columns';
import ConceptoFormModal from './concepto-form-modal';

const mechanicalEase = [0.25, 0.1, 0.25, 1] as const;

interface ConceptosComponentProps {
  conceptos: Conceptos[];
  comboAsociadoConceptos: ComboAsociadoConceptos[];
}

export default function ConceptosComponent({
  conceptos,
  comboAsociadoConceptos
}: Readonly<ConceptosComponentProps>) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedConcepto, setSelectedConcepto] = useState<
    Conceptos | undefined
  >(undefined);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');

  const revalidator = useRevalidator();

  // Permisos
  const { canCreate, canEdit } = useAuth();
  const route = '/dashboard/mantencion/conceptos';
  const hasCreatePermission = canCreate(route);
  const hasEditPermission = canEdit(route);

  const handleAdd = () => {
    setSelectedConcepto(undefined);
    setModalMode('add');
    setIsModalOpen(true);
  };

  const handleEdit = (concepto: Conceptos) => {
    if (!hasEditPermission) {
      toast.error('No tiene permisos para editar conceptos');
      return;
    }
    setSelectedConcepto(concepto);
    setModalMode('edit');
    setIsModalOpen(true);
  };

  const handleDelete = async (concepto: Conceptos) => {
    if (
      globalThis.confirm(
        `¿Está seguro de que desea eliminar el concepto "${concepto.denominacion}"?`
      )
    ) {
      try {
        const { default: api } = await import('~/lib/api');
        await api.delete(`/eliminarConceptos/${concepto.id}`);

        toast.success('Concepto eliminado exitosamente');
        revalidator.revalidate();
      } catch (error) {
        console.error('Error al eliminar el concepto:', error);
        toast.error('Error al eliminar el concepto');
      }
    }
  };

  const handleSuccess = () => {
    toast.success(
      modalMode === 'add'
        ? 'Concepto creado exitosamente'
        : 'Concepto actualizado exitosamente'
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
            title='Conceptos'
            description='Gestiona los conceptos del sistema'
            actions={
              <Button
                onClick={handleAdd}
                variant='default'
                size='sm'
                disabled={!hasCreatePermission}
                title={
                  !hasCreatePermission
                    ? 'No tiene permisos para crear conceptos'
                    : ''
                }
              >
                <Plus className='mr-2 h-4 w-4' />
                Agregar Concepto
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
                    Listado de Conceptos
                  </CardTitle>
                  <CardDescription className='text-xs mt-0.5 text-muted-foreground'>
                    {conceptos.length} concepto{conceptos.length !== 1 ? 's' : ''}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <div className='industrial-divider' />
            <CardContent className='relative p-4'>
              <div className='overflow-x-auto -mx-1'>
                <DataTable columns={columns} data={conceptos} />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Modal */}
        <ConceptoFormModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSuccess={handleSuccess}
          concepto={selectedConcepto}
          mode={modalMode}
          comboAsociadoConceptos={comboAsociadoConceptos}
        />
      </div>
    </div>
  );
}
