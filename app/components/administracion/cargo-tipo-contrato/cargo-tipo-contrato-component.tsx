/**
 * Componente principal para Gestión de Cargos por Tipo de Contrato
 *
 * Funcionalidades principales:
 * - Visualización de relación entre cargos y tipos de contrato
 * - Edición de cargos asociados a tipos de contrato (navegación a /edit/:id)
 * - Eliminación de asociaciones con confirmación
 * - Recarga automática de datos después de operaciones
 *
 * Flujo de trabajo:
 * 1. Usuario visualiza tabla de cargos por tipo de contrato
 * 2. Acciones disponibles:
 *    - Editar (navegación a formulario de edición)
 *    - Eliminar (con confirmación)
 * 3. Sistema recarga datos automáticamente
 *
 * Arquitectura:
 * - DataTable con columnas personalizadas
 * - Navegación a ruta para edición
 * - DeleteDialog para eliminación segura
 * - API endpoints:
 *   * GET /cargoTipoContrato-buscar (consulta)
 *   * DELETE /cargoTipoContrato-eliminar/:id (eliminación)
 *
 * Nota:
 * - Funcionalidad de agregar deshabilitada temporalmente
 * - Se recomienda implementar a futuro
 *
 * @param {Object} props - Props del componente
 * @param {GetCargoTipoContrato[]} props.cargoTipoContrato - Lista de asociaciones
 *
 * @example
 * ```tsx
 * export default function CargoTipoContratoRoute({ loaderData }) {
 *   return (
 *     <CargoTipoContratoComponent
 *       cargoTipoContrato={loaderData.cargoTipoContrato}
 *     />
 *   );
 * }
 * ```
 */
/* eslint-disable unused-imports/no-unused-vars */
import { Plus } from 'lucide-react';
import { toast } from 'sonner';

import { useEffect, useState } from 'react';

import { useNavigate } from 'react-router';

import { DataTable } from '~/components/data-table/data-table';
import { LoadingSpinner } from '~/components/loading-spinner';
import { ModernHeader } from '~/components/shared/modern-header';
import { Button } from '~/components/ui/button';
import { Card, CardContent } from '~/components/ui/card';
import api from '~/lib/api';
import type { GetCargoTipoContrato } from '~/types/administracion';

import { columns } from './columns';
import { DeleteDialog } from './delete-dialog';

export default function CargoTipoContratoComponent({
  cargoTipoContrato: initialData
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
  };

  const handleEdit = async (item: GetCargoTipoContrato) => {
    router(
      `/dashboard/administracion/cargo-tipo-contrato/edit/${item.tipoContratoId}`
    );
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
    <div className='min-h-screen bg-background'>
      <div className='container mx-auto p-3 space-y-4'>
        <ModernHeader
          title='Cargo Tipo Contrato'
          description='Gestiona las relaciones entre cargos y tipos de contrato'
          actions={
            <div className='flex gap-2'>
              <Button
                onClick={handleAdd}
                className='bg-sky-600 hover:bg-sky-700'
                size='sm'
              >
                <Plus className='mr-2 h-4 w-4' />
                Agregar Cargo Tipo Contrato
              </Button>
            </div>
          }
        />
        <Card className='border border-border shadow-sm'>
          <CardContent className='relative p-4'>
            {isLoading && (
              <div className='absolute inset-0 bg-background flex items-center justify-center rounded-xl z-10'>
                <LoadingSpinner />
              </div>
            )}
            <div className='overflow-x-auto'>
              <DataTable
                columns={columns({
                  onEdit: handleEdit,
                  onDelete: handleDelete
                })}
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
