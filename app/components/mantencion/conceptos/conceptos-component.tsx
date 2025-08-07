import { Plus } from 'lucide-react';
import { toast } from 'sonner';

import React, { useState } from 'react';

import { useRevalidator } from 'react-router';

import { DataTable } from '~/components/data-table/data-table';
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
  comboAsociadoConceptos,
}: ConceptosComponentProps) {
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

  const columns = createColumns({
    onEdit: handleEdit,
    onDelete: handleDelete,
  });

  return (
    <div className='min-h-screen bg-slate-50/30 dark:bg-slate-950/30'>
      <div className='container mx-auto p-3 space-y-4'>
        {/* Header */}
        <div className='flex items-center justify-between pb-3 border-b border-slate-200/60 dark:border-slate-700/60'>
          <div>
            <h1 className='text-xl font-semibold text-slate-900 dark:text-slate-100'>
              Conceptos
            </h1>
            <p className='text-sm text-slate-600 dark:text-slate-400'>
              Gestiona los conceptos del sistema
            </p>
          </div>
          <Button
            onClick={handleAdd}
            className='bg-sky-600 hover:bg-sky-700 text-white'
          >
            <Plus className='mr-2 h-4 w-4' />
            Agregar Concepto
          </Button>
        </div>

        {/* Data Table */}
        <Card className='border border-slate-200/60 dark:border-slate-700/60 shadow-sm'>
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
