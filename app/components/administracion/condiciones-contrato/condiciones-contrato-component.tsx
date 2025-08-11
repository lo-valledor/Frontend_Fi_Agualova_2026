import { Plus } from 'lucide-react';
import { toast } from 'sonner';

import React, { useState } from 'react';

import { useRevalidator } from 'react-router';

import { DataTable } from '~/components/data-table/data-table';
import { ModernHeader } from '~/components/shared/modern-header';
import { Button } from '~/components/ui/button';
import { Card, CardContent } from '~/components/ui/card';
import { Separator } from '~/components/ui/separator';
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '~/components/ui/sheet';
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
  conceptos,
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

  return (
    <div className='min-h-screen bg-slate-50/30 dark:bg-slate-950/30'>
      <div className='container mx-auto p-3 space-y-4'>
        {/* Header */}
        <ModernHeader
          title='Condiciones Contrato'
          description='Gestiona las condiciones de contrato del sistema'
          actions={
            <div className='flex gap-2'>
              <Button
                onClick={handleAddCondicionContrato}
                className='bg-sky-600 hover:bg-sky-700 text-white'
                size='sm'
              >
                <Plus className='mr-2 h-4 w-4' />
                Agregar Condición Contrato
              </Button>
            </div>
          }
        />

        {/* Table */}
        <Card className='border border-slate-200/60 dark:border-slate-700/60 shadow-sm'>
          <CardContent className='p-4'>
            <DataTable
              columns={columns({
                onEdit: handleEditCondicionContrato,
                onView: handleViewCondicionContrato,
                editingCondicionContrato: null,
              })}
              data={condicionesContrato}
            />
          </CardContent>
        </Card>

        {/* Modal */}
        <CondicionesContratoModalForm
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSuccess={handleSuccess}
          condicionContrato={selectedCondicionContrato}
          mode={modalMode}
          conceptos={conceptos}
        />

        {/* Details Sheet */}
        <Sheet open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
          <SheetContent className='sm:max-w-2xl'>
            <SheetHeader>
              <SheetTitle>Detalles de la Condición de Contrato</SheetTitle>
              <SheetDescription>
                Información completa de la condición de contrato seleccionada.
              </SheetDescription>
            </SheetHeader>
            <Separator className='my-4' />
            <div className='h-[calc(100vh-150px)] overflow-y-auto pr-4'>
              {selectedCondicionId && (
                <DetallesCondicionesContrato
                  condicionId={selectedCondicionId}
                  onClose={() => setIsDetailsOpen(false)}
                />
              )}
            </div>
            <SheetFooter className='mt-4'>
              <SheetClose asChild>
                <Button variant='outline'>Cerrar</Button>
              </SheetClose>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
}
