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
import { Plus, Search } from 'lucide-react';
import { toast } from 'sonner';

import { useEffect, useState, useRef } from 'react';

import { useNavigate } from 'react-router';

import { useAuth } from '~/context/AuthContext';
import { useVirtualizer } from '@tanstack/react-virtual';
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
  type SortingState
} from '@tanstack/react-table';

import { LoadingSpinner } from '~/components/loading-spinner';
import { ModernHeader } from '~/components/shared/modern-header';
import { Button } from '~/components/ui/button';
import { Card, CardContent } from '~/components/ui/card';
import { Input } from '~/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '~/components/ui/table';
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
  const [globalFilter, setGlobalFilter] = useState('');
  const [sorting, setSorting] = useState<SortingState>([]);
  const tableContainerRef = useRef<HTMLDivElement>(null);
  const router = useNavigate();

  // Permisos
  const { canCreate, canEdit } = useAuth();
  const route = '/dashboard/administracion/cargo-tipo-contrato';
  const hasCreatePermission = canCreate(route);
  const hasEditPermission = canEdit(route);

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
    router('/dashboard/administracion/cargo-tipo-contrato/crear');
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

  // Table setup with react-table
  const table = useReactTable({
    data,
    columns: columns({
      onEdit: handleEdit,
      onDelete: handleDelete,
      canEdit: hasEditPermission
    }),
    state: {
      sorting,
      globalFilter
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel()
  });

  // Virtualization setup
  const { rows } = table.getRowModel();
  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => tableContainerRef.current,
    estimateSize: () => 60,
    overscan: 10
  });

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
                  !hasCreatePermission
                    ? 'No tiene permisos para crear cargos tipo contrato'
                    : ''
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
            {/* Search */}
            <div className='flex justify-between items-center mb-3'>
              <div className='text-sm text-muted-foreground'>
                {rows.length} registros
              </div>
              <div className='relative w-64'>
                <Search className='absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
                <Input
                  placeholder='Buscar por tipo de contrato, condición o descripción...'
                  value={globalFilter ?? ''}
                  onChange={event => setGlobalFilter(event.target.value)}
                  className='pl-8 h-8 text-sm'
                />
              </div>
            </div>

            {/* Virtualized Table */}
            <div
              ref={tableContainerRef}
              className='rounded-md border overflow-auto'
              style={{ height: '600px' }}
            >
              <Table style={{ tableLayout: 'fixed', width: '100%' }}>
                <TableHeader className='sticky top-0 z-10 bg-background'>
                  {table.getHeaderGroups().map(headerGroup => (
                    <TableRow
                      key={headerGroup.id}
                      className='hover:bg-transparent'
                    >
                      {headerGroup.headers.map(header => {
                        const columnDef = header.column.columnDef;
                        const width = columnDef.minSize || 150;
                        return (
                          <TableHead
                            key={header.id}
                            className='h-10 px-3 text-xs font-medium'
                            style={{
                              width: `${width}px`,
                              minWidth: `${width}px`,
                              maxWidth: `${columnDef.maxSize || width}px`
                            }}
                          >
                            {header.isPlaceholder
                              ? null
                              : flexRender(
                                  header.column.columnDef.header,
                                  header.getContext()
                                )}
                          </TableHead>
                        );
                      })}
                    </TableRow>
                  ))}
                </TableHeader>
                <TableBody
                  style={{
                    height: `${rowVirtualizer.getTotalSize()}px`,
                    position: 'relative'
                  }}
                >
                  {rowVirtualizer.getVirtualItems().map(virtualRow => {
                    const row = rows[virtualRow.index];
                    return (
                      <TableRow
                        key={row.id}
                        data-index={virtualRow.index}
                        style={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          width: '100%',
                          height: '60px',
                          transform: `translateY(${virtualRow.start}px)`,
                          display: 'table',
                          tableLayout: 'fixed'
                        }}
                        className='border-b hover:bg-muted'
                      >
                        {row.getVisibleCells().map(cell => {
                          const columnDef = cell.column.columnDef;
                          const width = columnDef.minSize || 150;
                          return (
                            <TableCell
                              key={cell.id}
                              className='h-[60px] px-3 py-1 text-sm'
                              style={{
                                width: `${width}px`,
                                minWidth: `${width}px`,
                                maxWidth: `${columnDef.maxSize || width}px`
                              }}
                            >
                              {flexRender(
                                cell.column.columnDef.cell,
                                cell.getContext()
                              )}
                            </TableCell>
                          );
                        })}
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
              {rows.length === 0 && (
                <div className='h-20 flex items-center justify-center text-sm text-muted-foreground'>
                  No se encontraron resultados.
                </div>
              )}
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
