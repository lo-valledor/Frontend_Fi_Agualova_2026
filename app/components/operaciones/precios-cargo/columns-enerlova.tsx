import type { ColumnDef } from '@tanstack/react-table';

import { DataTableColumnHeader } from '~/components/data-table/data-table-column-header';
import type { PreciosCargoAgualova } from '~/types/operaciones';

import DetallePreciosAgualova from './detalle-precios-agualova';

export const columns = (
  onDataUpdate?: () => void
): ColumnDef<PreciosCargoAgualova>[] => [
  {
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title='ID'
        className='text-emerald-700 dark:text-emerald-300 font-semibold justify-end'
      />
    ),
    accessorKey: 'CD_ID',
    cell: ({ row }) => (
      <div className='font-mono text-xs sm:text-sm font-medium text-emerald-600 dark:text-emerald-400 text-right pr-1'>
        {row.getValue('CD_ID')}
      </div>
    ),
    size: 60
  },
  {
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title='Código'
        className='text-blue-700 dark:text-blue-300 font-semibold'
      />
    ),
    accessorKey: 'cd_codigoagualova',
    cell: ({ row }) => (
      <div className='font-mono text-xs sm:text-sm '>
        {row.getValue('cd_codigoagualova')}
      </div>
    ),
    size: 100
  },
  {
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title='Descripción'
        className='text-slate-700 dark:text-slate-300 font-semibold'
      />
    ),
    accessorKey: 'CD_Descripcion',
    cell: ({ row }) => (
      <div className='text-xs sm:text-sm max-w-[150px] sm:max-w-lg truncate'>
        {row.getValue('CD_Descripcion')}
      </div>
    ),
    size: 200
  },
  {
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title='Valor'
        className='text-green-700 dark:text-green-300 font-semibold justify-end'
      />
    ),
    accessorKey: 'valor',
    cell: ({ row }) => (
      <div className='text-xs sm:text-sm font-mono font-medium text-green-600 dark:text-green-400 text-right pr-1'>
        {row.getValue('valor')}
      </div>
    ),
    size: 90
  },
  {
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title='Días'
        className='text-orange-700 dark:text-orange-300 font-semibold justify-end'
      />
    ),
    accessorKey: 'dias',
    cell: ({ row }) => {
      const dias = row.getValue('dias') as number;
      const isUrgent = dias <= 7;
      const isWarning = dias <= 30 && dias > 7;

      return (
        <div
          className={`text-xs sm:text-sm font-medium text-right pr-1 ${
            isUrgent
              ? 'text-red-600 dark:text-red-400'
              : isWarning
                ? 'text-orange-600 dark:text-orange-400'
                : 'text-green-600 dark:text-green-400'
          }`}
        >
          <span className='hidden sm:inline'>{dias} días</span>
          <span className='sm:hidden'>{dias}d</span>
        </div>
      );
    },
    size: 80
  },
  {
    id: 'actions',
    header: () => (
      <div className='text-center font-semibold text-xs sm:text-sm'>
        <span className='hidden sm:inline'>Detalles</span>
        <span className='sm:hidden'>Det.</span>
      </div>
    ),
    cell: ({ row }) => {
      const data = row.original;
      return (
        <div className='flex justify-center'>
          <DetallePreciosAgualova
            codigo={data.CD_ID}
            onDataUpdate={onDataUpdate}
          />
        </div>
      );
    },
    size: 80,
    enableSorting: false
  }
];
