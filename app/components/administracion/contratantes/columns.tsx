import type { ColumnDef } from '@tanstack/react-table';
import { format } from 'rut.js';

import { Badge } from '~/components/ui/badge';
import { DataTableColumnHeader } from '~/components/data-table/data-table-column-header';
import { TableActions } from '~/components/data-table/table-helpers';
import type { GetContratante } from '~/types/administracion';

interface ContratantesColumnsProps {
  onEdit: (contratante: GetContratante) => void;
  onDetails: (contratante: GetContratante) => void;
  editingContratanteRut: string | null;
  detailingContratanteRut: string | null;
}

export const columns = ({
  onEdit,
  onDetails,
  editingContratanteRut,
  detailingContratanteRut
}: ContratantesColumnsProps): ColumnDef<GetContratante>[] => [
  {
    accessorKey: 'rut',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='RUT' />
    ),
    cell: ({ row }) => {
      return (
        <div className='flex items-center gap-2 sm:gap-3 min-w-0'>
          <div className='min-w-0 flex-1'>
            <div
              className='font-medium text-slate-900 dark:text-slate-100 truncate text-xs sm:text-sm max-w-[120px] lg:max-w-[160px]'
              title={row.original.rut}
            >
              {row.original.rut}
            </div>
            <div className='text-xs text-slate-500 dark:text-slate-400 font-mono truncate'>
              {format(row.getValue('rut'))}
            </div>
          </div>
        </div>
      );
    },
    minSize: 150,
    maxSize: 220
  },
  {
    accessorKey: 'nombre',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Nombre' />
    ),
    cell: ({ row }) => {
      const nombreCompleto = row.original.esEmpresa 
        ? row.original.nombre
        : `${row.original.nombre} ${row.original.apellido || ''}`.trim();

      return (
        <div className='flex items-center gap-2 sm:gap-3 min-w-0'>
          <div className='min-w-0 flex-1'>
            <div
              className='font-medium text-slate-900 dark:text-slate-100 truncate text-xs sm:text-sm max-w-[120px] lg:max-w-[160px]'
              title={nombreCompleto}
            >
              {nombreCompleto}
            </div>
            <div className='flex items-center gap-1 mt-1'>
              <Badge
                variant={row.original.esEmpresa ? 'default' : 'secondary'}
                className='text-xs'
              >
                {row.original.esEmpresa ? 'Empresa' : 'Persona'}
              </Badge>
            </div>
          </div>
        </div>
      );
    },
    minSize: 200,
    maxSize: 280
  },
  {
    accessorKey: 'direccion',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Dirección' />
    ),
    cell: ({ row }) => {
      return (
        <div className='flex items-center gap-2 sm:gap-3 min-w-0'>
          <div className='min-w-0 flex-1'>
            <div
              className='font-medium text-slate-900 dark:text-slate-100 truncate text-xs sm:text-sm max-w-[120px] lg:max-w-[160px]'
              title={row.original.direccion || 'No especificada'}
            >
              {row.original.direccion || 'No especificada'}
            </div>
            <div className='text-xs text-slate-500 dark:text-slate-400 truncate'>
              {row.original.comuna}
            </div>
          </div>
        </div>
      );
    },
    minSize: 200,
    maxSize: 250
  },
  {
    accessorKey: 'contacto',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Contacto' />
    ),
    cell: ({ row }) => {
      return (
        <div className='flex items-center gap-2 sm:gap-3 min-w-0'>
          <div className='min-w-0 flex-1'>
            <div
              className='font-medium text-slate-900 dark:text-slate-100 truncate text-xs sm:text-sm max-w-[120px] lg:max-w-[160px]'
              title={row.original.contacto || 'No especificado'}
            >
              {row.original.contacto || 'No especificado'}
            </div>
            <div className='text-xs text-slate-500 dark:text-slate-400 truncate'>
              {row.original.telefono || 'Sin teléfono'}
            </div>
          </div>
        </div>
      );
    },
    minSize: 180,
    maxSize: 220
  },
  {
    accessorKey: 'email',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Email' />
    ),
    cell: ({ row }) => {
      return (
        <div className='flex items-center gap-2 sm:gap-3 min-w-0'>
          <div className='min-w-0 flex-1'>
            <div
              className='font-medium text-slate-900 dark:text-slate-100 truncate text-xs sm:text-sm max-w-[120px] lg:max-w-[160px]'
              title={row.original.email || 'No especificado'}
            >
              {row.original.email || 'No especificado'}
            </div>
          </div>
        </div>
      );
    },
    minSize: 200,
    maxSize: 250
  },
  {
    id: 'actions',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Acciones' />
    ),
    cell: ({ row }) => {
      return (
        <div className='flex items-center justify-center'>
          <TableActions
            onView={onDetails}
            onEdit={onEdit}
            item={row.original}
            showView={true}
            showDelete={false}
            loadingEdit={editingContratanteRut === row.original.rut}
            loadingView={detailingContratanteRut === row.original.rut}
          />
        </div>
      );
    },
    minSize: 80,
    maxSize: 100,
    enableSorting: false
  }
];