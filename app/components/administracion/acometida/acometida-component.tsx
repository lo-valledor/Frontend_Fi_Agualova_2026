import { Plus } from 'lucide-react';
import { toast } from 'sonner';

import { useState } from 'react';

import { useRevalidator } from 'react-router';

import { DataTable } from '~/components/data-table/data-table';
import { ExportButton } from '~/components/shared/export-button';
import { Button } from '~/components/ui/button';
import { Card, CardContent } from '~/components/ui/card';
import { useExportAcometidas } from '~/hooks/administracion/use-export-acometidas';
import api from '~/lib/api';
import type {
  Acometida,
  ActualizarAcometidaProps,
  ComboEmpalmes,
  ComboNichos,
  ComboSectores,
  ContratosDisponibles,
  CrearAcometidaProps,
} from '~/types/administracion';

import { AcometidaForm } from './acometida-form';
import { columns } from './columns';

interface AcometidaComponentProps {
  acometidas: Acometida[];
  comboEmpalmes: ComboEmpalmes[];
  comboNichos: ComboNichos[];
  comboSectores: ComboSectores[];
  contratosDisponibles: ContratosDisponibles[];
}

export default function AcometidaComponent({
  acometidas,
  comboEmpalmes,
  comboNichos,
  comboSectores,
  contratosDisponibles,
}: AcometidaComponentProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAcometida, setSelectedAcometida] = useState<Acometida | null>(
    null
  );
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [, setEditingAcometidaId] = useState<number | null>(null);

  const revalidator = useRevalidator();
  const { acometidaColumns } = useExportAcometidas();

  const handleAddAcometida = () => {
    setSelectedAcometida(null);
    setModalMode('add');
    setIsModalOpen(true);
  };

  const handleEditAcometida = async (acometida: Acometida) => {
    setEditingAcometidaId(acometida.acometidaId);
    setSelectedAcometida(acometida);
    setModalMode('edit');
    setIsModalOpen(true);
  };

  const handleSuccess = () => {
    setIsModalOpen(false);
    setSelectedAcometida(null);
    setModalMode('add');
    setEditingAcometidaId(null);
    revalidator.revalidate();
    toast.success(
      modalMode === 'add'
        ? 'Acometida creada exitosamente'
        : 'Acometida actualizada exitosamente'
    );
  };



  const handleSubmitForm = async (
    data: CrearAcometidaProps | ActualizarAcometidaProps
  ) => {
    try {
      if (modalMode === 'add') {
        await api.post('/crear-Nueva-Acometida', data as CrearAcometidaProps);
      } else {
        await api.put(`/modificar-Acometida-Existen`, {
          acometidaId: selectedAcometida?.acometidaId,
          ...data,
        });
      }
      handleSuccess();
    } catch (_error: any) {
      toast.error('Ha ocurrido un error al guardar la acometida');
    }
  };

  return (
    <div className='container mx-auto p-2 sm:p-4 lg:p-6 space-y-4 sm:space-y-6'>
      {/* Header */}
      <div className='flex flex-col space-y-4 lg:flex-row lg:items-center lg:justify-between lg:space-y-0'>
        <div className='space-y-2'>
          <div className='flex items-center gap-3'>
            <h1 className='text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight text-sky-900 dark:text-sky-100'>
              Acometidas
            </h1>
          </div>
          <p className='text-xs sm:text-sm text-muted-foreground max-w-2xl'>
            Gestiona las acometidas eléctricas del sistema y exporta los datos
          </p>
        </div>
        <div className='flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2 lg:flex-row'>
          <ExportButton
             data={acometidas}
             columns={acometidaColumns}
             filename="acometidas"
             variant="default"
             size="sm"
             className="bg-green-600 hover:bg-green-700 text-white disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto order-2 sm:order-1"
           />
          <Button
            onClick={handleAddAcometida}
            className='bg-sky-600 hover:bg-sky-700 text-white w-full sm:w-auto order-1 sm:order-2'
            size='sm'
          >
            <Plus className='mr-2 h-3 w-3 sm:h-4 sm:w-4' />
            <span className='text-xs sm:text-sm'>Agregar Acometida</span>
          </Button>
        </div>
      </div>

      {/* Table */}
      <Card className='border-0 shadow-lg bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm'>
        <CardContent className='relative p-2 sm:p-4 lg:p-6'>
          <div className='overflow-x-auto'>
            <DataTable
              columns={columns({
                onEdit: handleEditAcometida,
              })}
              data={acometidas}
              searchPlaceholder='Buscar por código, ubicación o contrato...'
              defaultPageSize={10}
            />
          </div>
        </CardContent>
      </Card>

      {/* Modal Form */}
      <AcometidaForm
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingAcometidaId(null);
        }}
        onSubmit={handleSubmitForm}
        acometida={selectedAcometida}
        isLoading={false}
        comboEmpalmes={comboEmpalmes}
        comboNichos={comboNichos}
        contratosDisponibles={contratosDisponibles}
        comboSectores={comboSectores}
      />
    </div>
  );
}
