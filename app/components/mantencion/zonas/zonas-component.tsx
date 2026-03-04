import { LayoutList, Plus } from 'lucide-react';
import { motion } from 'motion/react';
import { toast } from 'sonner';

import React, { useCallback, useState } from 'react';

import { useRevalidator } from 'react-router';

import { useAuth } from '~/context/AuthContext';
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
import type { Zonas } from '~/types/mantencion';

import { columns } from './columns';
import ZonaFormModal from './zona-form-modal';

const mechanicalEase = [0.25, 0.1, 0.25, 1] as const;

interface ZonasComponentProps {
  zonas: Zonas[];
}

export default function ZonasComponent({ zonas }: ZonasComponentProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedZona, setSelectedZona] = useState<Zonas | null>(null);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const revalidator = useRevalidator();

  // Permisos
  const { canCreate, canEdit } = useAuth();
  const route = '/dashboard/mantencion/zonas';
  const hasCreatePermission = canCreate(route);
  const hasEditPermission = canEdit(route);

  const handleAddZona = useCallback(() => {
    setSelectedZona(null);
    setModalMode('add');
    setIsModalOpen(true);
  }, []);

  const handleEditZona = useCallback(
    (zona: Zonas) => {
      if (!hasEditPermission) {
        toast.error('No tiene permisos para editar zonas');
        return;
      }
      setSelectedZona(zona);
      setModalMode('edit');
      setIsModalOpen(true);
    },
    [hasEditPermission]
  );

  const handleDeleteZona = useCallback((zona: Zonas) => {
    setSelectedZona(zona);
    toast.warning('Zona eliminada exitosamente');
    setIsModalOpen(true);
  }, []);

  const handleZonaSuccess = useCallback(() => {
    revalidator.revalidate();
    setIsModalOpen(false);
    toast.success(
      modalMode === 'add'
        ? 'Zona creada exitosamente'
        : 'Zona actualizada exitosamente'
    );
  }, [modalMode, revalidator]);

  return (
    <div className='min-h-screen bg-background'>
      <div className='container mx-auto p-4 sm:p-6 space-y-6'>
        <header>
          <ModernHeader
            title='Zonas'
            description='Gestiona las zonas del sistema'
            actions={
              <Button
                onClick={handleAddZona}
                variant='default'
                size='sm'
                disabled={!hasCreatePermission}
                title={
                  !hasCreatePermission
                    ? 'No tiene permisos para crear zonas'
                    : ''
                }
              >
                <Plus className='mr-2 h-4 w-4' />
                Agregar Zona
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
                    Listado de Zonas
                  </CardTitle>
                  <CardDescription className='text-xs mt-0.5 text-muted-foreground'>
                    {zonas.length} zona{zonas.length !== 1 ? 's' : ''}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <div className='industrial-divider' />
            <CardContent className='relative p-4'>
              <div className='overflow-x-auto -mx-1'>
                <DataTable
                  columns={columns({
                    onEdit: handleEditZona,
                    onDelete: handleDeleteZona,
                    canEdit: hasEditPermission
                  })}
                  data={zonas}
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Modal */}
        <ZonaFormModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSuccess={handleZonaSuccess}
          zona={selectedZona}
          mode={modalMode}
        />
      </div>
    </div>
  );
}
