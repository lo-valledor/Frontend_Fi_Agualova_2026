import { LayoutList, Plus } from 'lucide-react';
import { motion } from 'motion/react';
import { useCallback, useMemo, useState } from 'react';
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
import { mantencionService } from '~/services/mantencionService';
import type { Tarifa } from '~/types/mantencion';

import { createColumns } from './columns';
import TarifaFormModal from './tarifa-form-modal';

const mechanicalEase = [0.25, 0.1, 0.25, 1] as const;

interface TarifasComponentProps {
  tarifas: Tarifa[];
}

export default function TarifasComponent({
  tarifas
}: Readonly<TarifasComponentProps>) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTarifa, setSelectedTarifa] = useState<Tarifa | null>(null);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');

  const revalidator = useRevalidator();

  const handleAdd = useCallback(() => {
    setSelectedTarifa(null);
    setModalMode('add');
    setIsModalOpen(true);
  }, []);

  const handleEdit = useCallback((tarifa: Tarifa) => {
    setSelectedTarifa(tarifa);
    setModalMode('edit');
    setIsModalOpen(true);
  }, []);

  const handleDelete = useCallback(
    async (tarifa: Tarifa) => {
      if (
        globalThis.confirm(
          `¿Está seguro de que desea eliminar la tarifa "${tarifa.nombre}"?`
        )
      ) {
        try {
          const result = await mantencionService.deleteTarifa(tarifa.id);
          if (result.error) {
            throw new Error(result.error);
          }

          toast.success('Tarifa eliminada exitosamente');
          revalidator.revalidate();
        } catch (error) {
          console.error('Error al eliminar la tarifa:', error);
          toast.error('Error al eliminar la tarifa');
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
        ? 'Tarifa creada exitosamente'
        : 'Tarifa actualizada exitosamente'
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
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-4 sm:p-6 space-y-6">
        <header>
          <ModernHeader
            title="Tarifas"
            description="Gestiona las tarifas del sistema"
            actions={
              <Button onClick={handleAdd} variant="default" size="sm">
                <Plus className="mr-2 h-4 w-4" />
                Agregar Tarifa
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
                    Listado de Tarifas
                  </CardTitle>
                  <CardDescription className="text-xs mt-0.5 text-muted-foreground">
                    {tarifas.length} tarifa{tarifas.length !== 1 ? 's' : ''}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <div className="industrial-divider" />
            <CardContent className="relative p-4">
              <div className="overflow-x-auto -mx-1">
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
