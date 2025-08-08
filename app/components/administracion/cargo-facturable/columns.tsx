import type { ColumnDef } from '@tanstack/react-table';

import { DataTableColumnHeader } from '~/components/data-table/data-table-column-header';
import { TableActions } from '~/components/data-table/table-helpers';
import { Badge } from '~/components/ui/badge';
import type { BuscarCargoFacturable } from '~/types/administracion';

interface TableColumnsProps {
  onEdit: (cargo: BuscarCargoFacturable) => void;
  editingCargoId: number | null;
}

export const columns = ({
  onEdit,
  editingCargoId,
}: TableColumnsProps): ColumnDef<BuscarCargoFacturable>[] => [
  {
    accessorKey: 'cuenta',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Cuenta' />
    ),
    cell: ({ row }) => (
      <div className='flex items-center gap-2 min-w-0'>
        <span
          className='font-mono text-xs sm:text-sm font-medium text-slate-900 dark:text-slate-100 truncate max-w-[100px] lg:max-w-[140px]'
          title={row.original.cuenta}
        >
          {row.original.cuenta}
        </span>
      </div>
    ),
    minSize: 110,
    maxSize: 160,
  },
  {
    accessorKey: 'codigoEnerlova',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Código' />
    ),
    cell: ({ row }) => (
      <Badge
        variant='outline'
        className='text-xs font-mono px-1 sm:px-2'
        title={row.original.codigoEnerlova}
      >
        <span className='truncate max-w-[80px] sm:max-w-none'>
          {row.original.codigoEnerlova}
        </span>
      </Badge>
    ),
    minSize: 100,
    maxSize: 130,
  },
  {
    accessorKey: 'descripcion',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Descripción' />
    ),
    cell: ({ row }) => (
      <div className='flex items-center gap-2 min-w-0'>
        <div
          className='font-medium text-xs sm:text-sm text-slate-900 dark:text-slate-100 truncate max-w-[150px] lg:max-w-[200px]'
          title={row.original.descripcion}
        >
          {row.original.descripcion}
        </div>
      </div>
    ),
    minSize: 180,
    maxSize: 250,
  },
  {
    accessorKey: 'tipo',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Tipo' />
    ),
    cell: ({ row }) => (
      <Badge
        variant='outline'
        className='flex items-center gap-1.5 bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/20 dark:text-purple-300 dark:border-purple-800 text-xs px-1 sm:px-2'
        title={row.original.tipo}
      >
        <span className='truncate max-w-[60px] sm:max-w-none'>
          {row.original.tipo}
        </span>
      </Badge>
    ),
    minSize: 100,
    maxSize: 140,
  },
  {
    accessorKey: 'fijoVariable',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Modalidad' />
    ),
    cell: ({ row }) => {
      const esFijo =
        row.original.fijoVariable === 'F' ||
        row.original.fijoVariable === 'Fijo';

      return (
        <Badge
          variant='secondary'
          className={`flex items-center gap-1.5 text-xs px-1 sm:px-2 ${
            esFijo
              ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200'
              : 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-200'
          }`}
        >
          <span className='hidden sm:inline'>
            {esFijo ? 'Fijo' : 'Variable'}
          </span>
          <span className='sm:hidden'>{esFijo ? 'F' : 'V'}</span>
        </Badge>
      );
    },
    minSize: 100,
    maxSize: 130,
  },
  {
    accessorKey: 'periodicoEventual',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Frecuencia' />
    ),
    cell: ({ row }) => {
      const esPeriodico =
        row.original.periodicoEventual === 'P' ||
        row.original.periodicoEventual === 'Periodico' ||
        row.original.periodicoEventual === 'Periódico';

      return (
        <Badge
          variant='outline'
          className={`flex items-center gap-1.5 text-xs px-1 sm:px-2 ${
            esPeriodico
              ? 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-300 dark:border-emerald-800'
              : 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/20 dark:text-amber-300 dark:border-amber-800'
          }`}
        >
          <span className='hidden sm:inline'>
            {esPeriodico ? 'Periódico' : 'Eventual'}
          </span>
          <span className='sm:hidden'>{esPeriodico ? 'P' : 'E'}</span>
        </Badge>
      );
    },
    minSize: 110,
    maxSize: 140,
  },
  {
    accessorKey: 'concepto',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Concepto' />
    ),
    cell: ({ row }) => (
      <Badge
        variant='outline'
        className='flex items-center gap-1.5 bg-violet-100 text-violet-800 border-violet-200 dark:bg-violet-900/20 dark:text-violet-300 dark:border-violet-800 text-xs px-1 sm:px-2'
        title={row.original.concepto}
      >
        <span className='truncate max-w-[80px] sm:max-w-none'>
          {row.original.concepto}
        </span>
      </Badge>
    ),
    minSize: 120,
    maxSize: 160,
  },
  {
    accessorKey: 'tarifa',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Tarifa' />
    ),
    cell: ({ row }) => (
      <Badge
        variant='outline'
        className='flex items-center gap-1.5 bg-indigo-100 text-indigo-800 border-indigo-200 dark:bg-indigo-900/20 dark:text-indigo-300 dark:border-indigo-800 text-xs px-1 sm:px-2'
        title={row.original.tarifa}
      >
        <span className='truncate max-w-[80px] sm:max-w-none'>
          {row.original.tarifa}
        </span>
      </Badge>
    ),
    minSize: 110,
    maxSize: 150,
  },
  {
    accessorKey: 'tipoMedidor',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Tipo Medidor' />
    ),
    cell: ({ row }) => (
      <Badge
        variant='outline'
        className='flex items-center gap-1.5 bg-teal-100 text-teal-800 border-teal-200 dark:bg-teal-900/20 dark:text-teal-300 dark:border-teal-800 text-xs px-1 sm:px-2'
        title={row.original.tipoMedidor}
      >
        <span className='truncate max-w-[80px] sm:max-w-none'>
          {row.original.tipoMedidor}
        </span>
      </Badge>
    ),
    minSize: 130,
    maxSize: 170,
  },
  {
    id: 'actions',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Acciones' />
    ),
    cell: ({ row }) => {
      const isEditing = editingCargoId === row.original.id;
      return (
        <div className='flex justify-center'>
          <TableActions
            onEdit={() => onEdit(row.original)}
            item={row.original}
            showView={false}
            showDelete={false}
            loadingEdit={isEditing}
          />
        </div>
      );
    },
    minSize: 80,
    maxSize: 100,
  },
];
