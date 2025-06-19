import { Plus } from 'lucide-react';
import React, { useState } from 'react';
import { DataTable } from '~/components/data-table/data-table';
import { Button } from '~/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
  CardHeader,
} from '~/components/ui/card';
import type { GetCondicionesContrato } from '~/types/administracion';
import type { Conceptos } from '~/types/mantencion';
import { columns } from './columns';
import CondicionesContratoModalForm from './condiciones-contrato-modal-form';
import { useRevalidator } from 'react-router';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
  SheetClose,
} from '~/components/ui/sheet';
import { Separator } from '~/components/ui/separator';
import DetallesCondicionesContrato from './detalles-condiciones-contrato';
import { toast } from 'sonner';

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
    null,
  );

  const revalidator = useRevalidator();

  const handleAddCondicionContrato = () => {
    setSelectedCondicionContrato(undefined);
    setModalMode('add');
    setIsModalOpen(true);
  };

  const handleEditCondicionContrato = (
    condicionContrato: GetCondicionesContrato,
  ) => {
    setSelectedCondicionContrato(condicionContrato);
    setModalMode('edit');
    setIsModalOpen(true);
  };

  const handleViewCondicionContrato = (
    condicionContrato: GetCondicionesContrato,
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
        : 'Condición de contrato actualizada exitosamente',
    );
  };

  return (
    <div className="container mx-auto p-3 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-sky-900 dark:text-sky-100">
              Gestión de Condiciones Contrato
            </h1>
          </div>
          <p className="text-muted-foreground">
            Administra las condiciones de contrato del sistema de manera
            eficiente
          </p>
        </div>
        <Button
          onClick={handleAddCondicionContrato}
          className="bg-sky-600 hover:bg-sky-700 text-white"
        >
          <Plus className="mr-2 h-4 w-4" />
          Agregar Condición Contrato
        </Button>
      </div>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Condiciones Contrato</CardTitle>
          <CardDescription>
            Visualiza y gestiona todas las condiciones de contrato registradas
            en el sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
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
        <SheetContent className="sm:max-w-2xl">
          <SheetHeader>
            <SheetTitle>Detalles de la Condición de Contrato</SheetTitle>
            <SheetDescription>
              Información completa de la condición de contrato seleccionada.
            </SheetDescription>
          </SheetHeader>
          <Separator className="my-4" />
          <div className="h-[calc(100vh-150px)] overflow-y-auto pr-4">
            {selectedCondicionId && (
              <DetallesCondicionesContrato
                condicionId={selectedCondicionId}
                onClose={() => setIsDetailsOpen(false)}
              />
            )}
          </div>
          <SheetFooter className="mt-4">
            <SheetClose asChild>
              <Button variant="outline">Cerrar</Button>
            </SheetClose>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
}
