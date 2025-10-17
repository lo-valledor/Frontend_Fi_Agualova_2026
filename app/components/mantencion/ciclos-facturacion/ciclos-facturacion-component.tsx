import { Plus } from 'lucide-react';
import { toast } from 'sonner';

import React, { useState } from 'react';

import { useRevalidator } from 'react-router';

import { DataTable } from '~/components/data-table/data-table';
import { ModernHeader } from '~/components/shared/modern-header';
import { Button } from '~/components/ui/button';
import { Card, CardContent } from '~/components/ui/card';
import type { CiclosFacturacion } from '~/types/mantencion';

import CiclosFacturacionModalForm from './ciclos-facturacion-modal-form';
import { columns } from './columns';

interface CiclosFacturacionComponentProps {
  ciclosFacturacion: CiclosFacturacion[];
}

export default function CiclosFacturacionComponent({
  ciclosFacturacion
}: Readonly<CiclosFacturacionComponentProps>) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCiclo, setSelectedCiclo] = useState<CiclosFacturacion | null>(
    null
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
        : 'Ciclo de facturación actualizado exitosamente'
    );
  };

  return (
    <div className='min-h-screen bg-background'>
      <div className='container mx-auto p-3 space-y-4'>
        {/* Header */}
        <ModernHeader
          title='Ciclos de Facturación'
          description='Gestiona los ciclos de facturación del sistema'
          actions={
            <div className='flex gap-2'>
              <Button onClick={handleAddCiclo} variant='default' size='sm'>
                <Plus className='mr-2 h-4 w-4' />
                Agregar Ciclo
              </Button>
            </div>
          }
        />

        {/* Table */}
        <Card className='border-0 shadow-lg bg-background backdrop-blur-sm'>
          <CardContent className='relative'>
            <DataTable
              columns={columns({
                onEdit: handleEditCiclo,
                onDelete: handleDeleteCiclo
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
    </div>
  );
}
