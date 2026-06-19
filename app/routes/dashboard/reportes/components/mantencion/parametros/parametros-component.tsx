import { LayoutList, Plus } from 'lucide-react';
import { motion } from 'motion/react';
import { useMemo, useState } from 'react';
import { useRevalidator } from 'react-router';
import { toast } from 'sonner';

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

  const handleAdd = () => {
    setSelectedParametro(undefined);
    setModalMode('add');
    setIsModalOpen(true);
  };

  const handleEdit = (parametro: Parametro) => {
    setSelectedParametro(parametro);
    setModalMode('edit');
    setIsModalOpen(true);
  };

  const handleDelete = async (parametro: Parametro) => {
    if (
      globalThis.confirm(
        `¿Está seguro de que desea eliminar el parámetro "${parametro.nombre}"?`
      )
    ) {
      try {
        const { default: api } = await import('~/lib/api');
        await api.delete(`/parametros/eliminar/${parametro.id}`);

        toast.success('Parámetro eliminado exitosamente');
        revalidator.revalidate();
      } catch (error) {
        console.error('Error al eliminar el parámetro:', error);
        toast.error('Error al eliminar el parámetro');
      }
    }
  };

  const handleSuccess = () => {
    toast.success(
      modalMode === 'add'
        ? 'Parámetro creado exitosamente'
        : 'Parámetro actualizado exitosamente'
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
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-4 sm:p-6 space-y-6">
        <header>
          <ModernHeader
            title="Parámetros"
            description="Gestiona los parámetros del sistema"
            actions={
              <Button onClick={handleAdd} variant="default" size="sm">
                <Plus className="mr-2 h-4 w-4" />
                Agregar Parámetro
              </Button>
            }
          />
          <div className="industrial-divider mt-4" />
        </header>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, ease: mechanicalEase }}
        >
          <Card className="overflow-hidden border border-border bg-card shadow-sm">
            <CardHeader className="p-4 pb-3">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-accent text-accent-foreground border border-border">
                  <LayoutList className="h-4 w-4" />
                </div>
                <div>
                  <CardTitle className="text-xs font-bold uppercase tracking-wide text-foreground">
                    Listado de Parámetros
                  </CardTitle>
                  <CardDescription className="text-xs mt-0.5 text-muted-foreground">
                    {parametros.length} parámetro
                    {parametros.length !== 1 ? 's' : ''}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <div className="industrial-divider" />
            <CardContent className="relative p-4">
              <div className="overflow-x-auto -mx-1">
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
