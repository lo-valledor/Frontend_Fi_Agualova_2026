import type { ColumnDef } from '@tanstack/react-table';
import { format } from 'rut.js';

import { DataTableColumnHeader } from '~/components/data-table/data-table-column-header';
import { TableActions } from '~/components/data-table/table-helpers';
import type { GetPropietario } from '~/types/administracion';

interface PropietariosColumnsProps {
  onDetails: (propietario: GetPropietario) => void;
  detailingPropietarioRut: string | null;
}

export const columns = ({
  onDetails,
  detailingPropietarioRut
}: PropietariosColumnsProps): ColumnDef<GetPropietario>[] => [
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
              className='font-medium text-slate-900 dark:text-slate-100 truncate text-xs sm:text-sm '
              title={row.original.nombre}
            >
              {row.original.nombre}
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
    accessorKey: 'email',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Email' />
    ),
    cell: ({ row }) => {
      return (
        <div className='flex items-center gap-2 sm:gap-3 min-w-0'>
          <div className='min-w-0 flex-1'>
            <div
              className='font-medium text-slate-900 dark:text-slate-100 truncate text-xs sm:text-sm'
              title={row.original.email || 'No especificado'}
            >
              {row.original.email || 'No especificado'}
            </div>
          </div>
        </div>
      );
    },
    minSize: 150,
    maxSize: 220
  },
  {
    accessorKey: 'telefono',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Teléfono' />
    ),
    cell: ({ row }) => {
      return (
        <div className='flex items-center gap-2 sm:gap-3 min-w-0'>
          <div className='min-w-0 flex-1'>
            <div
              className='font-medium text-slate-900 dark:text-slate-100 truncate text-xs sm:text-sm'
              title={row.original.telefono || 'No especificado'}
            >
              {row.original.telefono || 'No especificado'}
            </div>
          </div>
        </div>
      );
    },
    minSize: 150,
    maxSize: 220
  },
  {
    accessorKey: 'celular',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Celular' />
    ),
    cell: ({ row }) => {
      return (
        <div className='flex items-center gap-2 sm:gap-3 min-w-0'>
          <div className='min-w-0 flex-1'>
            <div
              className='font-medium text-slate-900 dark:text-slate-100 truncate text-xs sm:text-sm'
              title={row.original.celular || 'No especificado'}
            >
              {row.original.celular || 'No especificado'}
            </div>
          </div>
        </div>
      );
    },
    minSize: 150,
    maxSize: 220
  },
  {
    accessorKey: 'comuna',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Comuna' />
    ),
    cell: ({ row }) => {
      return (
        <div className='flex items-center gap-2 sm:gap-3 min-w-0'>
          <div className='min-w-0 flex-1'>
            <div
              className='font-medium text-slate-900 dark:text-slate-100 truncate text-xs sm:text-sm'
              title={row.original.comuna}
            >
              {row.original.comuna}
            </div>
          </div>
        </div>
      );
    },
    minSize: 150,
    maxSize: 220
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
            item={row.original}
            showView={true}
            showEdit={false}
            showDelete={false}
            loadingView={detailingPropietarioRut === row.original.rut}
          />
        </div>
      );
    },
    minSize: 80,
    maxSize: 100,
    enableSorting: false
  }
];
