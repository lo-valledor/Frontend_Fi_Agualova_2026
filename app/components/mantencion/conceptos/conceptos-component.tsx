import { Plus } from 'lucide-react';
import { toast } from 'sonner';

import React, { useMemo, useState } from 'react';

import { useRevalidator } from 'react-router';

import { DataTable } from '~/components/data-table/data-table';
import { ModernHeader } from '~/components/shared/modern-header';
import { Button } from '~/components/ui/button';
import { Card, CardContent } from '~/components/ui/card';
import type { ComboAsociadoConceptos, Conceptos } from '~/types/mantencion';

import { createColumns } from './columns';
import ConceptoFormModal from './concepto-form-modal';

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

  const handleAdd = () => {
    setSelectedConcepto(undefined);
    setModalMode('add');
    setIsModalOpen(true);
  };

  const handleEdit = (concepto: Conceptos) => {
    setSelectedConcepto(concepto);
    setModalMode('edit');
    setIsModalOpen(true);
  };

  const handleDelete = async (concepto: Conceptos) => {
    if (
      window.confirm(
        `¿Está seguro de que desea eliminar el concepto "${concepto.denominacion}"?`
      )
    ) {
      try {
        const { default: api } = await import('~/lib/api');
        await api.delete(`/eliminarConceptos/${concepto.id}`);

        toast.success('Concepto eliminado exitosamente');
        revalidator.revalidate();
      } catch (error) {
        console.error('Error al eliminar concepto:', error);
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
        onDelete: handleDelete
      }),
    [handleEdit, handleDelete]
  );

  return (
    <div className='min-h-screen bg-background'>
      <div className='container mx-auto p-3 space-y-4'>
        {/* Header */}
        <ModernHeader
          title='Conceptos'
          description='Gestiona los conceptos del sistema'
          actions={
            <div className='flex gap-2'>
              <Button
                onClick={handleAdd}
                variant="default"
                size='sm'
              >
                <Plus className='mr-2 h-4 w-4' />
                Agregar Concepto
              </Button>
            </div>
          }
        />

        {/* Data Table */}
        <Card className='border border-border shadow-sm'>
          <CardContent className='relative'>
            <DataTable columns={columns} data={conceptos} />
          </CardContent>
        </Card>

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
