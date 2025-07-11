/* eslint-disable unused-imports/no-unused-vars */
import React, { useState, useEffect } from 'react';
import { DataTable } from '~/components/data-table/data-table';
import type {
  GetCargoTipoContrato,
  CargoTipoContratoEditor,
  BuscarCargoFacturable,
  GetCondicionesContrato,
} from '~/types/administracion';
import type { TiposContrato } from '~/types/mantencion';
import { columns } from './columns';
import { toast } from 'sonner';
import api from '~/lib/api';
import { DeleteDialog } from './delete-dialog';
import { FormModal } from './form-modal';
import { LoadingSpinner } from '~/components/loading-spinner';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '~/components/ui/card';

export default function CargoTipoContratoComponent({
  cargoTipoContrato: initialData,
}: {
  cargoTipoContrato: GetCargoTipoContrato[];
}) {
  const [data, setData] = useState<GetCargoTipoContrato[]>(initialData);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<GetCargoTipoContrato | null>(
    null,
  );
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [isLoading, setIsLoading] = useState(false);

  // State for combo/select data
  const [tiposContrato, setTiposContrato] = useState<TiposContrato[]>([]);
  const [cargos, setCargos] = useState<BuscarCargoFacturable[]>([]);
  const [condiciones, setCondiciones] = useState<GetCondicionesContrato[]>([]);
  const [editorData, setEditorData] = useState<CargoTipoContratoEditor | null>(
    null,
  );

  useEffect(() => {
    setData(initialData);
  }, [initialData]);

  // Fetch data for the form selects
  useEffect(() => {
    const fetchFormData = async () => {
      try {
        const [tiposContratoRes, cargosRes, condicionesRes] = await Promise.all(
          [
            api.get('tipoContrato/combo'),
            api.get('buscarCargoFacturable'),
            api.get('condicionesContrato/combo'),
          ],
        );
        setTiposContrato(tiposContratoRes.data as TiposContrato[]);
        setCargos(cargosRes.data as BuscarCargoFacturable[]);
        setCondiciones(condicionesRes.data as GetCondicionesContrato[]);
      } catch (_error) {
        toast.error('Error al cargar los datos para el formulario.');
      }
    };
    fetchFormData();
  }, []);

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
    toast.info('Funcionalidad deshabilitada temporalmente');
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
        `/cargoTipoContrato-eliminar/${selectedItem.tipoContratoId}`,
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
    <div className="container mx-auto p-3 md:p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            Cargo Tipo Contrato
          </h2>
          <p className="text-muted-foreground">
            Gestiona la relación entre cargos facturables y tipos de contrato
          </p>
        </div>
        {/* Botón de añadir deshabilitado temporalmente
        <Button onClick={handleAdd}>
          <Plus className="mr-2 h-4 w-4" />
          Añadir
        </Button>
        */}
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="text-indigo-900 dark:text-indigo-100">
            Lista de Relaciones
          </CardTitle>
          <CardDescription>
            Visualiza y gestiona las relaciones existentes
          </CardDescription>
        </CardHeader>
        <CardContent className="relative">
          {isLoading && (
            <div className="absolute inset-0 bg-white/50 dark:bg-black/50 flex items-center justify-center rounded-lg z-10">
              <LoadingSpinner />
            </div>
          )}
          <DataTable
            columns={columns({ onEdit: handleEdit, onDelete: handleDelete })}
            data={data}
          />
        </CardContent>
      </Card>

      <FormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmit}
        mode={modalMode}
        tiposContrato={tiposContrato}
        cargos={cargos}
        condiciones={condiciones}
        initialData={editorData}
        selectedItem={selectedItem}
      />
      <DeleteDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleConfirmDelete}
        data={selectedItem}
      />
    </div>
  );
}
