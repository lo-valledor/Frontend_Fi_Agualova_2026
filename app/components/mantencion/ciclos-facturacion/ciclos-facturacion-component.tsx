import { Plus } from 'lucide-react';
import { toast } from 'sonner';

import React, { useState } from 'react';

import { useRevalidator } from 'react-router';

import { DataTable } from '~/components/data-table/data-table';
import { Button } from '~/components/ui/button';
import { Card, CardContent } from '~/components/ui/card';
import type { CiclosFacturacion } from '~/types/mantencion';

import CiclosFacturacionModalForm from './ciclos-facturacion-modal-form';
import { columns } from './columns';

interface CiclosFacturacionComponentProps {
  ciclosFacturacion: CiclosFacturacion[];
}

export default function CiclosFacturacionComponent({
  ciclosFacturacion,
}: CiclosFacturacionComponentProps) {
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
    <div className='min-h-screen bg-slate-50/30 dark:bg-slate-950/30'>
      <div className='container mx-auto p-3 space-y-4'>
        {/* Header */}
        <div className='flex items-center justify-between pb-3 border-b border-slate-200/60 dark:border-slate-700/60'>
          <div>
            <h1 className='text-xl font-semibold text-slate-900 dark:text-slate-100'>
              Ciclos de Facturación
            </h1>
            <p className='text-sm text-slate-600 dark:text-slate-400'>
              Gestiona los ciclos de facturación del sistema
            </p>
          </div>
          <Button
            onClick={handleAddCiclo}
            className='bg-sky-600 hover:bg-sky-700 text-white'
          >
            <Plus className='mr-2 h-4 w-4' />
            Agregar Ciclo de Facturación
          </Button>
        </div>

        {/* Table */}
        <Card className='border-0 shadow-lg bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm'>
          <CardContent className='relative'>
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
    </div>
  );
}
