/* eslint-disable unused-imports/no-unused-vars */
import { Plus } from 'lucide-react';
import { toast } from 'sonner';

import { useEffect, useState } from 'react';

import { useNavigate } from 'react-router';

import { DataTable } from '~/components/data-table/data-table';
import { LoadingSpinner } from '~/components/loading-spinner';
import { Button } from '~/components/ui/button';
import { Card, CardContent } from '~/components/ui/card';
import api from '~/lib/api';
import type { GetCargoTipoContrato } from '~/types/administracion';

import { columns } from './columns';
import { DeleteDialog } from './delete-dialog';

export default function CargoTipoContratoComponent({
  cargoTipoContrato: initialData,
}: {
  cargoTipoContrato: GetCargoTipoContrato[];
}) {
  const [data, setData] = useState<GetCargoTipoContrato[]>(initialData);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<GetCargoTipoContrato | null>(
    null
  );
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [isLoading, setIsLoading] = useState(false);
  const router = useNavigate();

  useEffect(() => {
    setData(initialData);
  }, [initialData]);

  const refetchData = async () => {
    setIsLoading(true);
    try {
      const response = await api.get('cargoTipoContrato-buscar');
      setData(response.data as GetCargoTipoContrato[]);
    } catch (_error) {
      toast.error('Error al recargar los datos.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdd = () => {
    toast.info('Funcionalidad deshabilitada temporalmente');
    // setSelectedItem(null);
    // setEditorData(null);
    // setModalMode('add');
    // setIsModalOpen(true);
  };

  const handleEdit = async (item: GetCargoTipoContrato) => {
    router(
      `/dashboard/administracion/cargo-tipo-contrato/edit/${item.tipoContratoId}`
    );
    // setSelectedItem(item);
    // setModalMode('edit');
    // setIsModalOpen(true);
    // try {
    //   const response = await api.get(`cargoTipoContrato-editar/${item.tipoContratoId}`);
    //   setEditorData(response.data as CargoTipoContratoEditor);
    // } catch (_error) {
    //   toast.error('Error al cargar la configuración para editar.');
    //   setIsModalOpen(false);
    // }
  };

  const handleDelete = (item: GetCargoTipoContrato) => {
    setSelectedItem(item);
    setIsDeleteDialogOpen(true);
  };

  const handleSubmit = async (formData: any) => {
    await api.post('cargoTipoContrato-guardarConfiguracion', formData);
    await refetchData();
  };

  const handleConfirmDelete = async () => {
    if (!selectedItem) return;
    setIsLoading(true);
    try {
      await api.delete(
        `/cargoTipoContrato-eliminar/${selectedItem.tipoContratoId}`
      );
      toast.success('Relación eliminada exitosamente');
      await refetchData();
    } catch (_error) {
      toast.error('Error al eliminar la relación.');
    } finally {
      setIsLoading(false);
      setIsDeleteDialogOpen(false);
      setSelectedItem(null);
    }
  };

  return (
    <div className='container mx-auto p-2 sm:p-4 lg:p-6 space-y-4 sm:space-y-6'>
      <div className='flex flex-col space-y-4 lg:flex-row lg:items-center lg:justify-between lg:space-y-0'>
        <div className='space-y-2'>
          <div className='flex items-center gap-3'>
            <h1 className='text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight text-sky-900 dark:text-sky-100'>
              Cargo Tipo Contrato
            </h1>
          </div>
          <p className='text-xs sm:text-sm text-muted-foreground max-w-2xl'>
            Gestiona las relaciones entre cargos y tipos de contrato del sistema
          </p>
        </div>
        <Button
          onClick={handleAdd}
          className='bg-sky-600 hover:bg-sky-700 text-white w-full sm:w-auto'
          size='sm'
        >
          <Plus className='mr-2 h-3 w-3 sm:h-4 sm:w-4' />
          <span className='text-xs sm:text-sm'>
            Agregar Cargo Tipo Contrato
          </span>
        </Button>
      </div>
      <Card className='border-0 shadow-lg bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm'>
        <CardContent className='relative p-2 sm:p-4 lg:p-6'>
          {isLoading && (
            <div className='absolute inset-0 bg-white/50 dark:bg-black/50 flex items-center justify-center rounded-lg z-10'>
              <LoadingSpinner />
            </div>
          )}
          <div className='overflow-x-auto'>
            <DataTable
              columns={columns({ onEdit: handleEdit, onDelete: handleDelete })}
              data={data}
              searchPlaceholder='Buscar por tipo de contrato, condición o descripción...'
              defaultPageSize={10}
            />
          </div>
        </CardContent>
      </Card>

      <DeleteDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleConfirmDelete}
        data={selectedItem}
      />
    </div>
  );
}
