import React, { useState } from 'react';
import { DataTable } from '~/components/data-table/data-table';
import { columns } from './columns';
import type { Marca } from '~/types/mantencion';
import { Plus } from 'lucide-react';
import { Button } from '~/components/ui/button';
import { useRevalidator } from 'react-router';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '~/components/ui/card';
import { toast } from 'sonner';
import MarcaFormModal from './marca-form-modal';

interface MarcasComponentProps {
  marcas: Marca[];
}

export default function MarcasComponent({ marcas }: MarcasComponentProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMarca, setSelectedMarca] = useState<Marca | null>(null);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const revalidator = useRevalidator();

  const handleAddMarca = () => {
    setSelectedMarca(null);
    setModalMode('add');
    setIsModalOpen(true);
  };

  const handleEditMarca = (marca: Marca) => {
    setSelectedMarca(marca);
    setModalMode('edit');
    setIsModalOpen(true);
  };

  const handleDeleteMarca = (marca: Marca) => {
    setSelectedMarca(marca);
    // TODO: Implementar diálogo de confirmación de eliminación
    setIsModalOpen(true);
  };

  const handleMarcaSuccess = () => {
    // Usar revalidation de React Router v7 en lugar de fetch manual
    revalidator.revalidate();
    setIsModalOpen(false);
    toast.success(
      modalMode === 'add'
        ? 'Marca creada exitosamente'
        : 'Marca actualizada exitosamente',
    );
  };

  return (
    <div className="container mx-auto p-3 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-sky-900 dark:text-sky-100">
              Gestión de Marcas
            </h1>
          </div>
          <p className="text-muted-foreground">
            Administra las marcas del sistema de manera eficiente
          </p>
        </div>
        <Button
          onClick={handleAddMarca}
          className="bg-sky-600 hover:bg-sky-700 text-white"
        >
          <Plus className="mr-2 h-4 w-4" />
          Agregar Marca
        </Button>
      </div>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Marcas</CardTitle>
          <CardDescription>
            Visualiza y gestiona todas las marcas registradas en el sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns({
              onEdit: handleEditMarca,
              onDelete: handleDeleteMarca,
            })}
            data={marcas}
          />
        </CardContent>
      </Card>

      {/* Modal */}
      <MarcaFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleMarcaSuccess}
        marca={selectedMarca}
        mode={modalMode}
      />
    </div>
  );
}
