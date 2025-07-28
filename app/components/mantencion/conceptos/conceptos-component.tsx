import React, { useState } from 'react';
import { useRevalidator } from 'react-router';
import { toast } from 'sonner';
import { Plus } from 'lucide-react';
import { Button } from '~/components/ui/button';
import { Card, CardContent } from '~/components/ui/card';
import type { ComboAsociadoConceptos, Conceptos } from '~/types/mantencion';
import { DataTable } from '~/components/data-table/data-table';
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
        `¿Está seguro de que desea eliminar el concepto "${concepto.denominacion}"?`,
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
        : 'Concepto actualizado exitosamente',
    );
    revalidator.revalidate();
  };

  const columns = createColumns({
    onEdit: handleEdit,
    onDelete: handleDelete,
  });

  return (
    <div className="container mx-auto p-3 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-sky-900 dark:text-sky-100">
              Gestión de Conceptos
            </h1>
          </div>
          <p className="text-muted-foreground">
            Administra los conceptos del sistema de manera eficiente
          </p>
        </div>
        <Button
          onClick={handleAdd}
          className="bg-sky-600 hover:bg-sky-700 text-white"
        >
          <Plus className="mr-2 h-4 w-4" />
          Agregar Concepto
        </Button>
      </div>

      {/* Data Table */}
      <Card>
        <CardContent className="">
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
  );
}
