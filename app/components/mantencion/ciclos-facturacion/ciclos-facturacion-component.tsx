import { LayoutList, Plus } from 'lucide-react';
import { motion } from 'motion/react';
import { toast } from 'sonner';

import React, { useCallback, useState } from 'react';

import { useRevalidator } from 'react-router';

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
import type { CiclosFacturacion } from '~/types/mantencion';

import CiclosFacturacionModalForm from './ciclos-facturacion-modal-form';
import { columns } from './columns';

const mechanicalEase = [0.25, 0.1, 0.25, 1] as const;

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


  const handleAddCiclo = useCallback(() => {
    setSelectedCiclo(null);
    setModalMode('add');
    setIsModalOpen(true);
  }, []);

  const handleEditCiclo = useCallback(
    (ciclo: CiclosFacturacion) => {
      setSelectedCiclo(ciclo);
      setModalMode('edit');
      setIsModalOpen(true);
    },
    []
  );

  const handleDeleteCiclo = useCallback((ciclo: CiclosFacturacion) => {
    setSelectedCiclo(ciclo);
    toast.warning('Ciclo de facturación eliminado exitosamente');
    setIsModalOpen(true);
  }, []);

  const handleCicloSuccess = useCallback(() => {
    // Usar revalidation de React Router v7 en lugar de fetch manual
    revalidator.revalidate();
    setIsModalOpen(false);
    toast.success(
      modalMode === 'add'
        ? 'Ciclo de facturación creado exitosamente'
        : 'Ciclo de facturación actualizado exitosamente'
    );
  }, [modalMode, revalidator]);

  return (
    <div className='min-h-screen bg-background'>
      <div className='container mx-auto p-4 sm:p-6 space-y-6'>
        <header>
          <ModernHeader
            title='Ciclos de Facturación'
            description='Gestiona los ciclos de facturación del sistema'
            actions={
              <Button
                onClick={handleAddCiclo}
                variant='default'
                size='sm'
              >
                <Plus className='mr-2 h-4 w-4' />
                Agregar Ciclo
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
                    Listado de Ciclos
                  </CardTitle>
                  <CardDescription className='text-xs mt-0.5 text-muted-foreground'>
                    {ciclosFacturacion.length} ciclo
                    {ciclosFacturacion.length !== 1 ? 's' : ''}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <div className='industrial-divider' />
            <CardContent className='relative p-4'>
              <div className='overflow-x-auto -mx-1'>
                <DataTable
                  columns={columns({
                    onEdit: handleEditCiclo,
                    onDelete: handleDeleteCiclo,
                  })}
                  data={ciclosFacturacion}
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>

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
