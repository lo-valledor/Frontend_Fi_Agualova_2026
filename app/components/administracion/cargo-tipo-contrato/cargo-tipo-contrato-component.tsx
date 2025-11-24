import { Plus, Filter, X } from 'lucide-react';
import { toast } from 'sonner';

import { useEffect, useState, useMemo } from 'react';

import { useNavigate } from 'react-router';

import { useAuth } from '~/context/AuthContext';
import { VirtualDataTable } from '~/components/data-table/virtual-data-table';
import { LoadingSpinner } from '~/components/loading-spinner';
import { ModernHeader } from '~/components/shared/modern-header';
import { Button } from '~/components/ui/button';
import { Card, CardContent } from '~/components/ui/card';
import { Label } from '~/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '~/components/ui/select';
import api from '~/lib/api';
import type { GetCargoTipoContrato } from '~/types/administracion';

import { columns } from './columns';
import { DeleteDialog } from './delete-dialog';

export default function CargoTipoContratoComponent({
  cargoTipoContrato: initialData
}: Readonly<{
  cargoTipoContrato: GetCargoTipoContrato[];
}>) {
  const [data, setData] = useState<GetCargoTipoContrato[]>(initialData);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<GetCargoTipoContrato | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);
  const [tipoContratoFilter, setTipoContratoFilter] = useState<string>('all');
  const router = useNavigate();

  // Permisos
  const { canCreate, canEdit } = useAuth();
  const route = '/dashboard/administracion/cargo-tipo-contrato';
  const hasCreatePermission = canCreate(route);
  const hasEditPermission = canEdit(route);

  useEffect(() => {
    setData(initialData);
  }, [initialData]);

  // Obtener tipos de contrato únicos para el filtro
  const tiposContratoUnicos = useMemo(() => {
    const tipos = new Set(
      data.map(item => item.tipoContratoDescripcion).filter(Boolean)
    );
    return Array.from(tipos).sort((a, b) => a.localeCompare(b));
  }, [data]);

  // Filtrar datos basado en el filtro de tipo de contrato
  const filteredData = useMemo(() => {
    if (tipoContratoFilter === 'all') {
      return data;
    }
    return data.filter(
      item => item.tipoContratoDescripcion === tipoContratoFilter
    );
  }, [data, tipoContratoFilter]);

  const refetchData = async () => {
    setIsLoading(true);
    try {
      const response = await api.get('cargoTipoContrato-buscar');
      setData(response.data as GetCargoTipoContrato[]);
    } catch (_error) {
      console.error(_error);
      toast.error('Error al recargar los datos.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdd = () => {
    router('/dashboard/administracion/cargo-tipo-contrato/crear');
  };

  const handleEdit = (item: GetCargoTipoContrato) => {
    router(
      `/dashboard/administracion/cargo-tipo-contrato/edit/${item.tipoContratoId}`
    );
  };

  const handleDelete = (item: GetCargoTipoContrato) => {
    setSelectedItem(item);
    setIsDeleteDialogOpen(true);
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
      console.error(_error);
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
                variant='default'
                size='sm'
                disabled={!hasCreatePermission}
                title={
                  hasCreatePermission
                    ? ''
                    : 'No tiene permisos para crear cargos tipo contrato'
                }
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
            {/* Filtros */}
            <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4'>
              <div className='text-sm text-muted-foreground'>
                Mostrando {filteredData.length} de {data.length} registros
              </div>

              <div className='flex items-center gap-3 w-full sm:w-auto'>
                {/* Filtro por Tipo de Contrato */}
                <div className='flex items-center gap-2 flex-1 sm:flex-initial'>
                  <Label htmlFor='tipo-contrato-filter' className='text-xs '>
                    <Filter className='h-3 w-3 inline mr-1' />
                    Tipo de Contrato:
                  </Label>
                  <Select
                    value={tipoContratoFilter}
                    onValueChange={setTipoContratoFilter}
                  >
                    <SelectTrigger
                      id='tipo-contrato-filter'
                      className='h-8 text-sm w-[200px]'
                    >
                      <SelectValue placeholder='Todos' />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='all'>Todos</SelectItem>
                      {tiposContratoUnicos.map(tipo => (
                        <SelectItem key={tipo} value={tipo}>
                          {tipo}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {tipoContratoFilter !== 'all' && (
                    <Button
                      variant='ghost'
                      size='sm'
                      className='h-8 px-2'
                      onClick={() => setTipoContratoFilter('all')}
                      title='Limpiar filtro'
                    >
                      <X className='h-4 w-4' />
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {/* Virtualized Table */}
            <VirtualDataTable
              columns={columns({
                onEdit: handleEdit,
                onDelete: handleDelete,
                canEdit: hasEditPermission
              })}
              data={filteredData}
              searchPlaceholder='Buscar cargo tipo contrato...'
              estimateRowHeight={60}
              maxHeight='600px'
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
    </div>
  );
}
