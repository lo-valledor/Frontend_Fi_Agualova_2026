/**
 * Componente principal para Gestión de Condiciones de Contrato
 *
 * Funcionalidades principales:
 * - Visualización de condiciones de contrato en tabla
 * - Creación de nuevas condiciones con selección de concepto
 * - Edición de condiciones existentes
 * - Visualización de detalles completos en modal
 * - Asociación de conceptos a condiciones
 *
 * Flujo de trabajo:
 * 1. Usuario visualiza tabla de condiciones de contrato
 * 2. Acciones disponibles:
 *    - Crear nueva condición (modal)
 *    - Editar condición existente (modal)
 *    - Ver detalles completos (modal)
 * 3. Sistema valida datos antes de guardar
 * 4. Recarga automática después de operaciones
 *
 * Arquitectura:
 * - DataTable con columnas personalizadas
 * - Modal CondicionesContratoModalForm para CRUD
 * - Modal DetallesCondicionesContrato para visualización
 * - Dialog para detalles con ScrollArea
 * - Recarga con useRevalidator
 *
 * Conceptos asociables:
 * - Lista completa de conceptos disponibles
 * - Selección mediante react-select
 * - Asociación múltiple por condición
 *
 * @param {Object} props - Props del componente
 * @param {GetCondicionesContrato[]} props.condicionesContrato - Lista de condiciones
 * @param {Conceptos[]} props.conceptos - Conceptos disponibles para asociar
 *
 * @example
 * ```tsx
 * export default function CondicionesContratoRoute({ loaderData }) {
 *   return (
 *     <CondicionesContratoComponent
 *       condicionesContrato={loaderData.condiciones}
 *       conceptos={loaderData.conceptos}
 *     />
 *   );
 * }
 * ```
 */
import { Plus, Search } from 'lucide-react';
import { toast } from 'sonner';

import React, { useState, useRef } from 'react';

import { useRevalidator } from 'react-router';

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

import { ModernHeader } from '~/components/shared/modern-header';
import { Button } from '~/components/ui/button';
import { Card, CardContent } from '~/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '~/components/ui/dialog';
import { Input } from '~/components/ui/input';
import { ScrollArea } from '~/components/ui/scroll-area';
import { Separator } from '~/components/ui/separator';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '~/components/ui/table';
import type { GetCondicionesContrato } from '~/types/administracion';
import type { Conceptos } from '~/types/mantencion';

import { columns } from './columns';
import CondicionesContratoModalForm from './condiciones-contrato-modal-form';
import DetallesCondicionesContrato from './detalles-condiciones-contrato';

interface CondicionesContratoComponentProps {
  condicionesContrato: GetCondicionesContrato[];
  conceptos: Conceptos[];
}

export default function CondicionesContratoComponent({
  condicionesContrato,
  conceptos
}: Readonly<CondicionesContratoComponentProps>) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCondicionContrato, setSelectedCondicionContrato] = useState<
    GetCondicionesContrato | undefined
  >(undefined);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [selectedCondicionId, setSelectedCondicionId] = useState<number | null>(
    null
  );
  const [globalFilter, setGlobalFilter] = useState('');
  const [sorting, setSorting] = useState<SortingState>([]);
  const tableContainerRef = useRef<HTMLDivElement>(null);

  const revalidator = useRevalidator();

  // Permisos
  const { canCreate, canEdit } = useAuth();
  const route = '/dashboard/administracion/condiciones-contrato';
  const hasCreatePermission = canCreate(route);
  const hasEditPermission = canEdit(route);

  const handleAddCondicionContrato = () => {
    setSelectedCondicionContrato(undefined);
    setModalMode('add');
    setIsModalOpen(true);
  };

  const handleEditCondicionContrato = (
    condicionContrato: GetCondicionesContrato
  ) => {
    setSelectedCondicionContrato(condicionContrato);
    setModalMode('edit');
    setIsModalOpen(true);
  };

  const handleViewCondicionContrato = (
    condicionContrato: GetCondicionesContrato
  ) => {
    setSelectedCondicionId(condicionContrato.id);
    setIsDetailsOpen(true);
  };

  const handleSuccess = () => {
    setIsModalOpen(false);
    setSelectedCondicionContrato(undefined);
    setModalMode('add');
    revalidator.revalidate();
    toast.success(
      modalMode === 'add'
        ? 'Condición de contrato creada exitosamente'
        : 'Condición de contrato actualizada exitosamente'
    );
  };

  // Table setup with react-table
  const table = useReactTable({
    data: condicionesContrato,
    columns: columns({
      onEdit: handleEditCondicionContrato,
      onView: handleViewCondicionContrato,
      editingCondicionContrato: null,
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
        {/* Header */}
        <ModernHeader
          title='Condiciones Contrato'
          description='Gestiona las condiciones de contrato del sistema'
          actions={
            <div className='flex gap-2'>
              <Button
                onClick={handleAddCondicionContrato}
                variant='default'
                size='sm'
                disabled={!hasCreatePermission}
                title={
                  !hasCreatePermission
                    ? 'No tiene permisos para crear condiciones de contrato'
                    : ''
                }
              >
                <Plus className='mr-2 h-4 w-4' />
                Agregar Condición Contrato
              </Button>
            </div>
          }
        />

        {/* Table */}
        <Card className='border border-border shadow-sm'>
          <CardContent className='p-4'>
            {/* Search */}
            <div className='flex justify-between items-center mb-3'>
              <div className='text-sm text-muted-foreground'>
                {rows.length} registros
              </div>
              <div className='relative w-64'>
                <Search className='absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
                <Input
                  placeholder='Buscar condiciones...'
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
              <Table style={{ tableLayout: 'fixed', width: '1200px', minWidth: '100%' }}>
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
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap'
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
                              className='h-[60px] px-3 py-1 text-sm overflow-hidden'
                              style={{
                                width: `${width}px`,
                                minWidth: `${width}px`,
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap'
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

        {/* Modal */}
        <CondicionesContratoModalForm
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSuccess={handleSuccess}
          condicionContrato={selectedCondicionContrato}
          mode={modalMode}
          conceptos={conceptos}
        />

        {/* Details Dialog */}
        <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
          <DialogContent className='max-w-4xl max-h-[90vh] p-0'>
            <DialogHeader className='px-6 pt-6'>
              <DialogTitle>Detalles de la Condición de Contrato</DialogTitle>
              <DialogDescription>
                Información completa de la condición de contrato seleccionada.
              </DialogDescription>
            </DialogHeader>
            <Separator />
            <ScrollArea className='max-h-[calc(90vh-120px)] px-6'>
              {selectedCondicionId && (
                <DetallesCondicionesContrato
                  condicionId={selectedCondicionId}
                  onClose={() => setIsDetailsOpen(false)}
                />
              )}
            </ScrollArea>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
