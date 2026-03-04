import { Filter, LayoutList, Plus, X } from 'lucide-react';
import { motion } from 'motion/react';
import { toast } from 'sonner';

import { useEffect, useMemo, useState } from 'react';

import { useNavigate } from 'react-router';

import { useAuth } from '~/context/AuthContext';
import { VirtualDataTable } from '~/components/data-table/virtual-data-table';
import { LoadingSpinner } from '~/components/loading-spinner';
import { ModernHeader } from '~/components/shared/modern-header';
import { Button } from '~/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '~/components/ui/card';
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
      <div className='container mx-auto p-4 sm:p-6 space-y-6'>
        <header>
          <ModernHeader
            title='Cargo Tipo Contrato'
            description='Gestiona las relaciones entre cargos y tipos de contrato'
            actions={
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
            }
          />
          <div className='industrial-divider mt-4' />
        </header>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
        >
          <Card className='overflow-hidden border border-border bg-card shadow-sm'>
            <CardHeader className='p-4 pb-3'>
              <div className='flex items-center gap-3'>
                <div className='flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-accent text-accent-foreground border border-border'>
                  <LayoutList className='h-4 w-4' />
                </div>
                <div>
                  <CardTitle className='text-xs font-bold uppercase tracking-wide text-foreground'>
                    Listado de Cargos Tipo Contrato
                  </CardTitle>
                  <CardDescription className='text-xs mt-0.5 text-muted-foreground'>
                    {filteredData.length} registro
                    {filteredData.length !== 1 ? 's' : ''}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <div className='industrial-divider' />
            <CardContent className='relative p-4'>
              {isLoading && (
                <div className='absolute inset-0 bg-background flex items-center justify-center rounded-xl z-10'>
                  <LoadingSpinner />
                </div>
              )}
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
        </motion.div>

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
