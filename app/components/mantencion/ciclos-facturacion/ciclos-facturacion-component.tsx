import { Plus } from 'lucide-react';
import React, { useState } from 'react';
import { DataTable } from '~/components/data-table/data-table';
import { Button } from '~/components/ui/button';
import { useRevalidator } from 'react-router';
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
  CardHeader,
} from '~/components/ui/card';
import type { CiclosFacturacion } from '~/types/mantencion';
import { columns } from './columns';
import { toast } from 'sonner';
import CiclosFacturacionModalForm from './ciclos-facturacion-modal-form';

interface CiclosFacturacionComponentProps {
  ciclosFacturacion: CiclosFacturacion[];
}

export default function CiclosFacturacionComponent({
  ciclosFacturacion,
}: CiclosFacturacionComponentProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCiclo, setSelectedCiclo] = useState<CiclosFacturacion | null>(
    null,
  );
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const revalidator = useRevalidator();

  const handleAddCiclo = () => {
    setSelectedCiclo(null);
    setModalMode('add');
    setIsModalOpen(true);
  };

  const handleEditCiclo = (ciclo: CiclosFacturacion) => {
    setSelectedCiclo(ciclo);
    setModalMode('edit');
    setIsModalOpen(true);
  };

  const handleDeleteCiclo = (ciclo: CiclosFacturacion) => {
    setSelectedCiclo(ciclo);
    // TODO: Implementar diálogo de confirmación de eliminación
    setIsModalOpen(true);
  };

  const handleCicloSuccess = () => {
    // Usar revalidation de React Router v7 en lugar de fetch manual
    revalidator.revalidate();
    setIsModalOpen(false);
    toast.success(
      modalMode === 'add'
        ? 'Ciclo de facturación creado exitosamente'
        : 'Ciclo de facturación actualizado exitosamente',
    );
  };

  return (
    <div className="container mx-auto p-3 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-sky-900 dark:text-sky-100">
              Gestión de Ciclos de Facturación
            </h1>
          </div>
          <p className="text-muted-foreground">
            Administra los ciclos de facturación del sistema de manera eficiente
          </p>
        </div>
        <Button
          onClick={handleAddCiclo}
          className="bg-sky-600 hover:bg-sky-700 text-white"
        >
          <Plus className="mr-2 h-4 w-4" />
          Agregar Ciclo de Facturación
        </Button>
      </div>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Ciclos de Facturación</CardTitle>
          <CardDescription>
            Visualiza y gestiona todos los ciclos de facturación registrados en
            el sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns({
              onEdit: handleEditCiclo,
              onDelete: handleDeleteCiclo,
            })}
            data={ciclosFacturacion}
          />
        </CardContent>
      </Card>

      {/* Modal */}
      <CiclosFacturacionModalForm
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleCicloSuccess}
        ciclo={selectedCiclo}
        mode={modalMode}
      />
    </div>
  );
}
