import { Plus } from 'lucide-react';
import { toast } from 'sonner';

import React, { useState } from 'react';

import { useRevalidator } from 'react-router';

import { DataTable } from '~/components/data-table/data-table';
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
}: CondicionesContratoComponentProps) {
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
    <div className='container mx-auto p-3 md:p-6 space-y-6'>
      {/* Header */}
      <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4'>
        <div className='space-y-1'>
          <div className='flex items-center gap-3'>
            <h1 className='text-2xl md:text-3xl font-bold tracking-tight text-sky-900 dark:text-sky-100'>
              Condiciones Contrato
            </h1>
          </div>
        </div>
        <Button
          onClick={handleAddCondicionContrato}
          className='bg-sky-600 hover:bg-sky-700 text-white'
        >
          <Plus className='mr-2 h-4 w-4' />
          Agregar Condición Contrato
        </Button>
      </div>

      {/* Table */}
      <Card className='border-0 shadow-lg bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm'>
        <CardContent className='relative'>
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
  );
}
