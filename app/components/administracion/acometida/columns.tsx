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
      const id: number = row.getValue('acometidaId');
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
      const codigo: string = row.getValue('codigo');
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
      const ubicacion: string = row.getValue('ubicacion');
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
      const contratoId: string = row.getValue('contratoId');
      return (
        <div className='flex items-center gap-2'>
          <Badge
            variant='outline'
            className='bg-sky-100 text-sky-800 border-sky-200 dark:bg-sky-900/20 dark:text-sky-300 dark:border-sky-800 text-xs font-mono px-1 sm:px-2'
            title={contratoId}
          >
            <span className='truncate max-w-20 sm:max-w-none'>
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
      const empalme: string = row.getValue('empalmeDescripcion');
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
      const nicho: string = row.getValue('nichoDescripcion');
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
      const sector: string = row.getValue('sectorDescripcion');
      return (
        <div className='flex items-center gap-2'>
          <Badge
            variant='outline'
            className='bg-indigo-100 text-indigo-800 border-indigo-200 dark:bg-indigo-900/20 dark:text-indigo-300 dark:border-indigo-800 text-xs font-medium px-1 sm:px-2'
            title={sector}
          >
            <span className='truncate max-w-20 sm:max-w-none'>{sector}</span>
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
      const limite: number | null = row.getValue('limitePotencia');

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
            <div className='text-xs sm:text-sm font-medium '>
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
      const numeroMedidor: string = row.getValue('numeroMedidor');
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
