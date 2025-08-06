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
    <div className='min-h-screen bg-slate-50/30 dark:bg-slate-950/30'>
      <div className='container mx-auto p-3 space-y-4'>
        <div className='flex items-center justify-between pb-3 border-b border-slate-200/60 dark:border-slate-700/60'>
          <div>
            <h1 className='text-xl font-semibold text-slate-900 dark:text-slate-100'>
              Cargo Tipo Contrato
            </h1>
            <p className='text-sm text-slate-600 dark:text-slate-400'>
              Gestiona las relaciones entre cargos y tipos de contrato
            </p>
          </div>
          <Button
            onClick={handleAdd}
            className='bg-sky-600 hover:bg-sky-700 text-white'
            size='sm'
          >
            <Plus className='mr-2 h-4 w-4' />
            Agregar Cargo Tipo Contrato
          </Button>
        </div>
        <Card className='border border-slate-200/60 dark:border-slate-700/60 shadow-sm'>
          <CardContent className='relative p-4'>
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
    </div>
  );
}
