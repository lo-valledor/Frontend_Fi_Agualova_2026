import { Plus } from 'lucide-react';
import { toast } from 'sonner';

import { useEffect, useState } from 'react';

import { DataTable } from '~/components/data-table/data-table';
import { LoadingSpinner } from '~/components/loading-spinner';
import { ExportButton } from '~/components/shared/export-button';
import { Button } from '~/components/ui/button';
import { Card, CardContent } from '~/components/ui/card';
import { useExportMedidores } from '~/hooks/administracion/use-export-medidores';
import api from '~/lib/api';
import type {
  ActualizarMedidorProps,
  CrearMedidorProps,
  GetMedidores,
} from '~/types/administracion';
import type { Marca } from '~/types/mantencion';

import { AsociarSubempalmeModal } from './asociar-subempalme-modal';
import { columns } from './columns';
import { DeleteConfirmationDialog } from './delete-confirm-dialog';
import { MedidorFormModal } from './medidor-form';

export default function MedidoresComponent({
  medidores: initialMedidores,
  marcas,
}: {
  medidores: GetMedidores[];
  marcas: Marca[];
}) {
  const [medidores, setMedidores] = useState<GetMedidores[]>(initialMedidores);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isAsociarModalOpen, setIsAsociarModalOpen] = useState(false);
  const [selectedMedidor, setSelectedMedidor] = useState<GetMedidores | null>(
    null
  );
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  
  const { medidorColumns } = useExportMedidores();
  // Tipos de medidores hardcodeados como placeholder
  const [tipos] = useState([
    { id: 1, nombre: 'Monofásico' },
    { id: 2, nombre: 'Trifásico' },
  ]);

  useEffect(() => {
    setMedidores(initialMedidores);
  }, [initialMedidores]);

  const refetchMedidores = async () => {
    setIsFetching(true);
    try {
      const response = await api.get('buscarMedidor');
      const data = response.data as GetMedidores[];
      setMedidores(data);
    } catch (_error) {
      toast.error('Error al recargar los medidores.');
    } finally {
      setIsFetching(false);
    }
  };

  const handleAdd = () => {
    setSelectedMedidor(null);
    setModalMode('add');
    setIsModalOpen(true);
  };

  const handleEdit = (medidor: GetMedidores) => {
    setSelectedMedidor(medidor);
    setModalMode('edit');
    setIsModalOpen(true);
  };

  const handleAsociarSubempalme = (medidor: GetMedidores) => {
    setSelectedMedidor(medidor);
    setIsAsociarModalOpen(true);
  };

  const handleSubmit = async (
    data: CrearMedidorProps | ActualizarMedidorProps,
    mode: 'add' | 'edit'
  ) => {
    setIsLoading(true);
    try {
      if (mode === 'add') {
        await api.post('/MedidorCrear', data);
        toast.success('Medidor creado exitosamente');
      } else {
        await api.put(`/MedidorModificar`, data);
        toast.success('Medidor actualizado exitosamente');
      }
      await refetchMedidores();
      setIsModalOpen(false);
    } catch (error) {
      toast.error('Error al guardar el medidor.');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedMedidor) return;

    setIsLoading(true);
    try {
      await api.delete(`/MedidorEliminar/${selectedMedidor.codigo}`);
      toast.success('Medidor eliminado exitosamente');
      await refetchMedidores();
      setIsDeleteDialogOpen(false);
      setSelectedMedidor(null);
    } catch (error) {
      toast.error('Error al eliminar el medidor.');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };



  if (isFetching && medidores.length === 0) {
    return (
      <div className='container mx-auto p-2 sm:p-4 lg:p-6'>
        <div className='flex items-center justify-center py-12 sm:py-20'>
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  return (
    <div className='container mx-auto p-2 sm:p-4 lg:p-6 space-y-4 sm:space-y-6'>
      {/* Header mejorado con mejor responsividad */}
      <div className='flex flex-col space-y-4 lg:flex-row lg:items-center lg:justify-between lg:space-y-0'>
        <div className='space-y-2'>
          <div className='flex items-center gap-2 sm:gap-3'>
            <h1 className='text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight text-sky-900 dark:text-sky-100'>
              Medidores
            </h1>
          </div>
          <p className='text-xs sm:text-sm text-muted-foreground max-w-2xl'>
            Gestiona los medidores del sistema y exporta los datos
          </p>
        </div>
        <div className='flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2 lg:flex-row'>
          <ExportButton
             data={medidores}
             columns={medidorColumns}
             filename="medidores"
             variant="default"
             size="sm"
             className="gap-1.5 bg-green-600 hover:bg-green-700 text-white disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto order-2 sm:order-1"
           />
          <Button
            onClick={handleAdd}
            className='bg-sky-600 hover:bg-sky-700 text-white w-full sm:w-auto order-1 sm:order-2'
            size='sm'
          >
            <Plus className='mr-2 h-3 w-3 sm:h-4 sm:w-4' />
            <span className='text-xs sm:text-sm'>Agregar Medidor</span>
          </Button>
        </div>
      </div>

      {/* Tabla con mejor responsividad */}
      <Card className='border-0 shadow-lg bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm'>
        <CardContent className='relative p-2 sm:p-4 lg:p-6'>
          {isFetching && (
            <div className='absolute inset-0 bg-white/50 dark:bg-black/50 flex items-center justify-center rounded-lg z-10'>
              <LoadingSpinner />
            </div>
          )}
          <div className='overflow-x-auto'>
            <DataTable
              columns={columns({
                onEdit: handleEdit,
                onAsociarSubempalme: handleAsociarSubempalme,
              })}
              data={medidores}
              searchPlaceholder='Buscar por serie, marca o código...'
              defaultPageSize={10}
            />
          </div>
        </CardContent>
      </Card>

      {/* Modales */}
      {isModalOpen && (
        <MedidorFormModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleSubmit}
          medidor={selectedMedidor}
          mode={modalMode}
          isLoading={isLoading}
          marcas={marcas}
          tipos={tipos}
        />
      )}

      {isDeleteDialogOpen && (
        <DeleteConfirmationDialog
          isOpen={isDeleteDialogOpen}
          onClose={() => setIsDeleteDialogOpen(false)}
          onConfirm={handleConfirmDelete}
          medidor={selectedMedidor}
        />
      )}

      {isAsociarModalOpen && (
        <AsociarSubempalmeModal
          isOpen={isAsociarModalOpen}
          onClose={() => setIsAsociarModalOpen(false)}
          medidor={selectedMedidor}
          onSuccess={refetchMedidores}
        />
      )}
    </div>
  );
}
