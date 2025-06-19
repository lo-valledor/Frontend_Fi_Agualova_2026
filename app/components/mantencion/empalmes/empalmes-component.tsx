import type { Empalme } from '~/types/mantencion';
import { DataTable } from '~/components/data-table/data-table';
import { columns } from './columns';
import { Button } from '~/components/ui/button';
import { Plus } from 'lucide-react';
import { useState } from 'react';
import { useRevalidator } from 'react-router';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '~/components/ui/card';
import EmpalmesModalForm from './empalmes-modal-form';
import { toast } from 'sonner';

interface EmpalmesComponentProps {
  empalmes: Empalme[];
}

export default function EmpalmesComponent({
  empalmes,
}: EmpalmesComponentProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEmpalme, setSelectedEmpalme] = useState<Empalme | null>(null);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const revalidator = useRevalidator();

  const handleAddEmpalme = () => {
    setSelectedEmpalme(null);
    setModalMode('add');
    setIsModalOpen(true);
  };

  const handleEditEmpalme = (empalme: Empalme) => {
    setSelectedEmpalme(empalme);
    setModalMode('edit');
    setIsModalOpen(true);
  };

  const handleDeleteEmpalme = (empalme: Empalme) => {
    setSelectedEmpalme(empalme);
    // TODO: Implementar diálogo de confirmación de eliminación
    setIsModalOpen(true);
  };

  const handleEmpalmeSuccess = () => {
    // Usar revalidation de React Router v7 en lugar de fetch manual
    revalidator.revalidate();
    setIsModalOpen(false);
    toast.success(
      modalMode === 'add'
        ? 'Empalme creado exitosamente'
        : 'Empalme actualizado exitosamente',
    );
  };

  return (
    <div className="container mx-auto p-3 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-sky-900 dark:text-sky-100">
              Gestión de Empalmes
            </h1>
          </div>
          <p className="text-muted-foreground">
            Administra los empalmes del sistema de manera eficiente
          </p>
        </div>
        <Button
          onClick={handleAddEmpalme}
          className="bg-sky-600 hover:bg-sky-700 text-white"
        >
          <Plus className="mr-2 h-4 w-4" />
          Agregar Empalme
        </Button>
      </div>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Empalmes</CardTitle>
          <CardDescription>
            Visualiza y gestiona todos los empalmes registrados en el sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns({
              onEdit: handleEditEmpalme,
              onDelete: handleDeleteEmpalme,
            })}
            data={empalmes}
          />
        </CardContent>
      </Card>

      {/* Modal */}
      <EmpalmesModalForm
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleEmpalmeSuccess}
        empalme={selectedEmpalme}
        mode={modalMode}
      />
    </div>
  );
}
