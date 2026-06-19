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
import type { Nicho } from '~/types/mantencion';

import { columns } from './columns';
import NichoFormModal from './nichos-form-modal';

const mechanicalEase = [0.25, 0.1, 0.25, 1] as const;

interface NichosComponentProps {
  nichos: Nicho[];
}

export default function NichosComponent({
  nichos
}: Readonly<NichosComponentProps>) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedNicho, setSelectedNicho] = useState<Nicho | null>(null);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const revalidator = useRevalidator();

  const handleAddNicho = useCallback(() => {
    setSelectedNicho(null);
    setModalMode('add');
    setIsModalOpen(true);
  }, []);

  const handleEditNicho = useCallback((nicho: Nicho) => {
    setSelectedNicho(nicho);
    setModalMode('edit');
    setIsModalOpen(true);
  }, []);

  const handleDeleteNicho = useCallback((nicho: Nicho) => {
    setSelectedNicho(nicho);
    setIsModalOpen(true);
  }, []);

  const handleNichoSuccess = useCallback(() => {
    // Usar revalidation de React Router v7 en lugar de fetch manual
    revalidator.revalidate();
    setIsModalOpen(false);
    toast.success(
      modalMode === 'add'
        ? 'Nicho creado exitosamente'
        : 'Nicho actualizado exitosamente'
    );
  }, [modalMode, revalidator]);

  const memoizedColumns = useMemo(
    () =>
      columns({
        onEdit: handleEditNicho,
        onDelete: handleDeleteNicho
      }),
    [handleEditNicho, handleDeleteNicho]
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-4 sm:p-6 space-y-6">
        <header>
          <ModernHeader
            title="Nichos"
            description="Gestiona los nichos del sistema"
            actions={
              <Button onClick={handleAddNicho} variant="default" size="sm">
                <Plus className="mr-2 h-4 w-4" />
                Agregar Nicho
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
                    Listado de Nichos
                  </CardTitle>
                  <CardDescription className="text-xs mt-0.5 text-muted-foreground">
                    {nichos.length} nicho{nichos.length !== 1 ? 's' : ''}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <div className="industrial-divider" />
            <CardContent className="relative p-4">
              <div className="overflow-x-auto -mx-1">
                <DataTable columns={memoizedColumns} data={nichos} />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Modal */}
        <NichoFormModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSuccess={handleNichoSuccess}
          nicho={selectedNicho}
          mode={modalMode}
        />
      </div>
    </div>
  );
}
