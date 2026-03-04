/**
 * Componente principal para Gestión de Condiciones de Contrato
 *
 * Funcionalidades principales:
 * - Visualización de condiciones de contrato en tabla
 * - Creación de nuevas condiciones con selección de concepto
 * - Edición de condiciones existentes
 * - Visualización de detalles completos en modal
 * - Asociación de conceptos a condiciones
 *
 * Flujo de trabajo:
 * 1. Usuario visualiza tabla de condiciones de contrato
 * 2. Acciones disponibles:
 * - Crear nueva condición (modal)
 * - Editar condición existente (modal)
 * - Ver detalles completos (modal)
 * 3. Sistema valida datos antes de guardar
 * 4. Recarga automática después de operaciones
 *
 * Arquitectura:
 * - DataTable con columnas personalizadas
 * - Modal CondicionesContratoModalForm para CRUD
 * - Modal DetallesCondicionesContrato para visualización
 * - Dialog para detalles con ScrollArea
 * - Recarga con useRevalidator
 *
 * Conceptos asociables:
 * - Lista completa de conceptos disponibles
 * - Selección mediante react-select
 * - Asociación múltiple por condición
 *
 * @param {Object} props - Props del componente
 * @param {GetCondicionesContrato[]} props.condicionesContrato - Lista de condiciones
 * @param {Conceptos[]} props.conceptos - Conceptos disponibles para asociar
 *
 * @example
 * ```tsx
 * export default function CondicionesContratoRoute({ loaderData }) {
 *   return (
 *     <CondicionesContratoComponent
 *       condicionesContrato={loaderData.condiciones}
 *       conceptos={loaderData.conceptos}
 *     />
 *   );
 * }
 * ```
 */
import { LayoutList, Plus } from 'lucide-react';
import { motion } from 'motion/react';
import { toast } from 'sonner';

import React, { useState } from 'react';

import { useRevalidator } from 'react-router';

import { useAuth } from '~/context/AuthContext';
import { VirtualDataTable } from '~/components/data-table/virtual-data-table';
import { ModernHeader } from '~/components/shared/modern-header';
import { Button } from '~/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '~/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '~/components/ui/dialog';
import { ScrollArea } from '~/components/ui/scroll-area';
import { Separator } from '~/components/ui/separator';
import type { GetCondicionesContrato } from '~/types/administracion';
import type { Conceptos } from '~/types/mantencion';

import { columns } from './columns';
import CondicionesContratoModalForm from './condiciones-contrato-modal-form';
import DetallesCondicionesContrato from './detalles-condiciones-contrato';

interface CondicionesContratoComponentProps {
  condicionesContrato: GetCondicionesContrato[];
  conceptos: Conceptos[];
}

export default function CondicionesContratoComponent({
  condicionesContrato,
  conceptos
}: Readonly<CondicionesContratoComponentProps>) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCondicionContrato, setSelectedCondicionContrato] = useState<
    GetCondicionesContrato | undefined
  >(undefined);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [selectedCondicionId, setSelectedCondicionId] = useState<number | null>(
    null
  );

  const revalidator = useRevalidator();

  // Permisos
  const { canCreate, canEdit } = useAuth();
  const route = '/dashboard/administracion/condiciones-contrato';
  const hasCreatePermission = canCreate(route);
  const hasEditPermission = canEdit(route);

  const handleAddCondicionContrato = () => {
    setSelectedCondicionContrato(undefined);
    setModalMode('add');
    setIsModalOpen(true);
  };

  const handleEditCondicionContrato = (
    condicionContrato: GetCondicionesContrato
  ) => {
    setSelectedCondicionContrato(condicionContrato);
    setModalMode('edit');
    setIsModalOpen(true);
  };

  const handleViewCondicionContrato = (
    condicionContrato: GetCondicionesContrato
  ) => {
    setSelectedCondicionId(condicionContrato.id);
    setIsDetailsOpen(true);
  };

  const handleSuccess = () => {
    setIsModalOpen(false);
    setSelectedCondicionContrato(undefined);
    setModalMode('add');
    revalidator.revalidate();
    toast.success(
      modalMode === 'add'
        ? 'Condición de contrato creada exitosamente'
        : 'Condición de contrato actualizada exitosamente'
    );
  };

  const mechanicalEase = [0.25, 0.1, 0.25, 1] as const;

  return (
    <div className='min-h-screen bg-background'>
      <div className='container mx-auto p-4 sm:p-6 space-y-6'>
        <header>
          <ModernHeader
            title='Condiciones Contrato'
            description='Gestiona las condiciones de contrato del sistema'
            actions={
              <Button
                onClick={handleAddCondicionContrato}
                variant='default'
                size='sm'
                disabled={!hasCreatePermission}
                title={
                  hasCreatePermission
                    ? ''
                    : 'No tiene permisos para crear condiciones de contrato'
                }
              >
                <Plus className='mr-2 h-4 w-4' />
                Agregar Condición Contrato
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
                    Listado de Condiciones de Contrato
                  </CardTitle>
                  <CardDescription className='text-xs mt-0.5 text-muted-foreground'>
                    {condicionesContrato.length} condición
                    {condicionesContrato.length !== 1 ? 'es' : ''}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <div className='industrial-divider' />
            <CardContent className='p-4'>
              <div className='overflow-x-auto -mx-1'>
                <VirtualDataTable
                  columns={columns({
                    onEdit: handleEditCondicionContrato,
                    onView: handleViewCondicionContrato,
                    editingCondicionContrato: null,
                    canEdit: hasEditPermission
                  })}
                  data={condicionesContrato}
                  searchPlaceholder='Buscar condiciones...'
                  estimateRowHeight={60}
                  maxHeight='600px'
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

        {/* Details Dialog */}
        <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
          <DialogContent className='max-w-4xl max-h-[90vh] p-0'>
            <DialogHeader className='px-6 pt-6'>
              <DialogTitle>Detalles de la Condición de Contrato</DialogTitle>
              <DialogDescription>
                Información completa de la condición de contrato seleccionada.
              </DialogDescription>
            </DialogHeader>
            <Separator />
            <ScrollArea className='max-h-[calc(90vh-120px)] px-6'>
              {selectedCondicionId && (
                <DetallesCondicionesContrato
                  condicionId={selectedCondicionId}
                />
              )}
            </ScrollArea>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
