import { LayoutList, Plus } from 'lucide-react';
import { motion } from 'motion/react';
import { useCallback, useState } from 'react';
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
import type { Sector } from '~/types/mantencion';

import { columns } from './columns';
import SectorFormModal from './sector-form-modal';

const mechanicalEase = [0.25, 0.1, 0.25, 1] as const;

interface SectorComponentProps {
  sectores: Sector[];
}

export default function SectorComponent({ sectores }: SectorComponentProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSector, setSelectedSector] = useState<Sector | null>(null);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const revalidator = useRevalidator();

  const handleAddSector = useCallback(() => {
    setSelectedSector(null);
    setModalMode('add');
    setIsModalOpen(true);
  }, []);

  const handleEditSector = useCallback((sector: Sector) => {
    setSelectedSector(sector);
    setModalMode('edit');
    setIsModalOpen(true);
  }, []);

  const handleDeleteSector = useCallback((sector: Sector) => {
    setSelectedSector(sector);
    toast.warning('Sector eliminado exitosamente');
    setIsModalOpen(true);
  }, []);

  const handleSectorSuccess = useCallback(() => {
    // Usar revalidation de React Router v7 en lugar de fetch manual
    revalidator.revalidate();
    setIsModalOpen(false);
    toast.success(
      modalMode === 'add'
        ? 'Sector creado exitosamente'
        : 'Sector actualizado exitosamente'
    );
  }, [modalMode, revalidator]);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-4 sm:p-6 space-y-6">
        <header>
          <ModernHeader
            title="Sector"
            description="Gestiona los sectores del sistema"
            actions={
              <Button onClick={handleAddSector} variant="default" size="sm">
                <Plus className="mr-2 h-4 w-4" />
                Agregar Sector
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
                    Listado de Sectores
                  </CardTitle>
                  <CardDescription className="text-xs mt-0.5 text-muted-foreground">
                    {sectores.length} sector{sectores.length !== 1 ? 'es' : ''}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <div className="industrial-divider" />
            <CardContent className="relative p-4">
              <div className="overflow-x-auto -mx-1">
                <DataTable
                  columns={columns({
                    onEdit: handleEditSector,
                    onDelete: handleDeleteSector
                  })}
                  data={sectores}
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Modal */}
        <SectorFormModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSuccess={handleSectorSuccess}
          sector={selectedSector}
          mode={modalMode}
        />
      </div>
    </div>
  );
}
