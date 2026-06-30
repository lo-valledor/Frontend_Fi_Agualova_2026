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
import { administracionService } from '~/services/administracionService';
import type {
  CondicionContrato,
  CondicionContratoConcepto,
  CondicionesContratoRow
} from '~/types/administracion';
import { columns } from './columns';
import CondicionesContratoModalForm from './condiciones-contrato-modal-form';

interface CondicionesContratoComponentProps {
  condicionesContrato: CondicionesContratoRow[];
  conceptos: CondicionContratoConcepto[];
}

export default function CondicionesContratoComponent({
  condicionesContrato,
  conceptos
}: Readonly<CondicionesContratoComponentProps>) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCondicionContrato, setSelectedCondicionContrato] =
    useState<CondicionContrato | null>(null);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');

  const revalidator = useRevalidator();

  const handleAddCondicionContrato = useCallback(() => {
    setSelectedCondicionContrato(null);
    setModalMode('add');
    setIsModalOpen(true);
  }, []);

  const handleEditCondicionContrato = useCallback(
    async (condicionContrato: CondicionesContratoRow) => {
      const result = await administracionService.getCondicionContratoById(
        condicionContrato.id
      );

      if (result.error || !result.data) {
        toast.error(
          result.error || 'No se pudo cargar la condición de contrato'
        );
        return;
      }

      setSelectedCondicionContrato(result.data);
      setModalMode('edit');
      setIsModalOpen(true);
    },
    []
  );

  const handleSuccess = useCallback(() => {
    setIsModalOpen(false);
    setSelectedCondicionContrato(null);
    setModalMode('add');
    revalidator.revalidate();
    toast.success(
      modalMode === 'add'
        ? 'Condición de contrato creada exitosamente'
        : 'Condición de contrato actualizada exitosamente'
    );
  }, [modalMode, revalidator]);

  const mechanicalEase = [0.25, 0.1, 0.25, 1] as const;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-4 sm:p-6 space-y-6">
        <header>
          <ModernHeader
            title="Condiciones Contrato"
            description="Gestiona las condiciones de contrato del sistema"
            actions={
              <Button
                onClick={handleAddCondicionContrato}
                variant="default"
                size="sm"
              >
                <Plus className="mr-2 h-4 w-4" />
                Agregar Condición Contrato
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
                    Listado de Condiciones de Contrato
                  </CardTitle>
                  <CardDescription className="text-xs mt-0.5 text-muted-foreground">
                    {condicionesContrato.length} condición
                    {condicionesContrato.length !== 1 ? 'es' : ''}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <div className="industrial-divider" />
            <CardContent className="p-4">
              <div className="overflow-x-auto -mx-1">
                <DataTable
                  columns={columns({
                    onEdit: handleEditCondicionContrato
                  })}
                  data={condicionesContrato}
                  searchPlaceholder="Buscar condiciones..."
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Modal */}
        <CondicionesContratoModalForm
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSuccess={handleSuccess}
          condicionContrato={selectedCondicionContrato}
          mode={modalMode}
          conceptos={conceptos}
        />
      </div>
    </div>
  );
}
