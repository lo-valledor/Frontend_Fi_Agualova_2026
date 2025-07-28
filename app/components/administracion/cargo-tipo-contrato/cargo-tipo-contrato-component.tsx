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
    <div className='container mx-auto p-3 md:p-6 space-y-6'>
      <div className='flex items-center justify-between'>
        <div className='space-y-1'>
          <div className='flex items-center gap-3'>
            <h1 className='text-2xl md:text-3xl font-bold tracking-tight text-sky-900 dark:text-sky-100'>
              Cargo Tipo Contrato
            </h1>
          </div>
        </div>
        <Button
          onClick={handleAdd}
          className='bg-sky-600 hover:bg-sky-700 text-white'
        >
          <Plus className='mr-2 h-4 w-4' />
          Agregar Cargo Tipo Contrato
        </Button>
      </div>
      <Card className='border-0 shadow-lg bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm'>
        <CardContent className='relative'>
          {isLoading && (
            <div className='absolute inset-0 bg-white/50 dark:bg-black/50 flex items-center justify-center rounded-lg z-10'>
              <LoadingSpinner />
            </div>
          )}
          <DataTable
            columns={columns({ onEdit: handleEdit, onDelete: handleDelete })}
            data={data}
          />
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
