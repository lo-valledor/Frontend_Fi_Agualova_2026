import type { ColumnDef } from '@tanstack/react-table';

import { DataTableColumnHeader } from '~/components/data-table/data-table-column-header';
import { TableActions } from '~/components/data-table/table-helpers';
import { Badge } from '~/components/ui/badge';
import type { Acometida } from '~/types/administracion';

interface TableColumnsProps {
  onEdit: (acometida: Acometida) => void;
  canEdit?: boolean;
}

export const columns = ({
  onEdit,
  canEdit = true
}: TableColumnsProps): ColumnDef<Acometida>[] => [
  {
    accessorKey: 'acometidaId',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='ID' />
    ),
    cell: ({ row }) => {
      const id = row.getValue('acometidaId') as number;
      return (
        <div className='flex items-center gap-2'>
          <span className='font-mono text-xs sm:text-sm font-medium'>{id}</span>
        </div>
      );
    },
    minSize: 60,
    maxSize: 80
  },
  {
    accessorKey: 'codigo',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Código' />
    ),
    cell: ({ row }) => {
      const codigo = row.getValue('codigo') as string;
      return (
        <div className='flex items-center gap-2 min-w-0'>
          <span
            className='font-mono text-xs sm:text-sm font-medium truncate max-w-[100px] lg:max-w-[140px]'
            title={codigo}
          >
            {codigo}
          </span>
        </div>
      );
    },
    minSize: 110,
    maxSize: 150
  },
  {
    accessorKey: 'ubicacion',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Ubicación' />
    ),
    cell: ({ row }) => {
      const ubicacion = row.getValue('ubicacion') as string;
      return (
        <div className='flex items-center gap-2 min-w-0'>
          <span
            className='text-xs sm:text-sm truncate max-w-[120px] lg:max-w-[200px]'
            title={ubicacion}
          >
            {ubicacion}
          </span>
        </div>
      );
    },
    minSize: 140,
    maxSize: 220
  },
  {
    accessorKey: 'contratoId',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Contrato' />
    ),
    cell: ({ row }) => {
      const contratoId = row.getValue('contratoId') as string;
      return (
        <div className='flex items-center gap-2'>
          <Badge
            variant='outline'
            className='bg-sky-100 text-sky-800 border-sky-200 dark:bg-sky-900/20 dark:text-sky-300 dark:border-sky-800 text-xs font-mono px-1 sm:px-2'
            title={contratoId}
          >
            <span className='truncate max-w-[80px] sm:max-w-none'>
              {contratoId}
            </span>
          </Badge>
        </div>
      );
    },
    minSize: 100,
    maxSize: 130
  },
  {
    accessorKey: 'empalmeDescripcion',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Empalme' />
    ),
    cell: ({ row }) => {
      const empalme = row.getValue('empalmeDescripcion') as string;
      return (
        <div className='flex items-center gap-2 min-w-0'>
          <span
            className='text-xs sm:text-sm font-medium truncate max-w-[100px] lg:max-w-[140px]'
            title={empalme}
          >
            {empalme}
          </span>
        </div>
      );
    },
    minSize: 120,
    maxSize: 160
  },
  {
    accessorKey: 'nichoDescripcion',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Nicho' />
    ),
    cell: ({ row }) => {
      const nicho = row.getValue('nichoDescripcion') as string;
      return (
        <div className='flex items-center gap-2 min-w-0'>
          <span
            className='text-xs sm:text-sm font-medium truncate max-w-[100px] lg:max-w-[140px]'
            title={nicho}
          >
            {nicho}
          </span>
        </div>
      );
    },
    minSize: 110,
    maxSize: 150
  },
  {
    accessorKey: 'sectorDescripcion',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Sector' />
    ),
    cell: ({ row }) => {
      const sector = row.getValue('sectorDescripcion') as string;
      return (
        <div className='flex items-center gap-2'>
          <Badge
            variant='outline'
            className='bg-indigo-100 text-indigo-800 border-indigo-200 dark:bg-indigo-900/20 dark:text-indigo-300 dark:border-indigo-800 text-xs font-medium px-1 sm:px-2'
            title={sector}
          >
            <span className='truncate max-w-[80px] sm:max-w-none'>
              {sector}
            </span>
          </Badge>
        </div>
      );
    },
    minSize: 100,
    maxSize: 130
  },
  {
    accessorKey: 'limitePotencia',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Límite kW' />
    ),
    cell: ({ row }) => {
      const limite = row.getValue('limitePotencia') as number | null;

      if (limite === null || limite === 0) {
        return (
          <div className='flex items-center gap-2'>
            <Badge
              variant='outline'
              className='bg-gray-100 text-gray-600 border-gray-200 dark:bg-gray-900/20 dark:text-gray-400 dark:border-gray-700 text-xs px-1 sm:px-2'
            >
              <span className='hidden sm:inline'>Sin límite</span>
              <span className='sm:hidden'>N/A</span>
            </Badge>
          </div>
        );
      }

      return (
        <div className='flex items-center gap-2'>
          <div className='space-y-0.5'>
            <div className='text-xs sm:text-sm font-medium whitespace-nowrap'>
              {limite.toLocaleString('es-CL')} kW
            </div>
          </div>
        </div>
      );
    },
    minSize: 100,
    maxSize: 130
  },
  {
    accessorKey: 'numeroMedidor',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='N° Medidor' />
    ),
    cell: ({ row }) => {
      const numeroMedidor = row.getValue('numeroMedidor') as string;
      return (
        <div className='flex items-center gap-2 min-w-0'>
          <span
            className='font-mono text-xs sm:text-sm font-medium truncate max-w-[100px] lg:max-w-[120px]'
            title={numeroMedidor}
          >
            {numeroMedidor}
          </span>
        </div>
      );
    },
    minSize: 110,
    maxSize: 140
  },
  {
    id: 'actions',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Acciones' />
    ),
    cell: ({ row }) => {
      return (
        <div className='flex justify-center'>
          <TableActions
            onEdit={onEdit}
            item={row.original}
            showView={false}
            showDelete={false}
            disableEdit={!canEdit}
          />
        </div>
      );
    },
    minSize: 80,
    maxSize: 100
  }
];
