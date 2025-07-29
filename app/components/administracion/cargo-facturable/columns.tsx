import type { ColumnDef } from '@tanstack/react-table';
import {
  Box,
  Calendar,
  DollarSign,
  FileText,
  Hash,
  Settings,
  Tag,
  Zap,
} from 'lucide-react';

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
      <div className='flex items-center gap-2'>
        <div className='p-1 bg-sky-100 dark:bg-sky-900/30 rounded-md'>
          <Hash className='h-3 w-3 text-sky-600 dark:text-sky-400' />
        </div>
        <span className='font-mono text-sm font-medium text-slate-900 dark:text-slate-100'>
          {row.original.cuenta}
        </span>
      </div>
    ),
  },
  {
    accessorKey: 'codigoEnerlova',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Código' />
    ),
    cell: ({ row }) => (
      <Badge variant='outline' className='text-xs font-mono'>
        {row.original.codigoEnerlova}
      </Badge>
    ),
  },
  {
    accessorKey: 'descripcion',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Descripción' />
    ),
    cell: ({ row }) => (
      <div className='flex items-center gap-2'>
        <div className='p-1 bg-blue-100 dark:bg-blue-900/30 rounded-md'>
          <FileText className='h-3 w-3 text-blue-600 dark:text-blue-400' />
        </div>
        <div className='font-medium text-slate-900 dark:text-slate-100 max-w-[200px] truncate'>
          {row.original.descripcion}
        </div>
      </div>
    ),
  },
  {
    accessorKey: 'tipo',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Tipo' />
    ),
    cell: ({ row }) => (
      <Badge
        variant='outline'
        className='flex items-center gap-1.5 bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/20 dark:text-purple-300 dark:border-purple-800'
      >
        <Settings className='w-3 h-3' />
        {row.original.tipo}
      </Badge>
    ),
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
          className={`flex items-center gap-1.5 ${
            esFijo
              ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200'
              : 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-200'
          }`}
        >
          <Box className='w-3 h-3' />
          {esFijo ? 'Fijo' : 'Variable'}
        </Badge>
      );
    },
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
          className={`flex items-center gap-1.5 ${
            esPeriodico
              ? 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-300 dark:border-emerald-800'
              : 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/20 dark:text-amber-300 dark:border-amber-800'
          }`}
        >
          <Calendar className='w-3 h-3' />
          {esPeriodico ? 'Periódico' : 'Eventual'}
        </Badge>
      );
    },
  },
  {
    accessorKey: 'concepto',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Concepto' />
    ),
    cell: ({ row }) => (
      <Badge
        variant='outline'
        className='flex items-center gap-1.5 bg-violet-100 text-violet-800 border-violet-200 dark:bg-violet-900/20 dark:text-violet-300 dark:border-violet-800'
      >
        <DollarSign className='w-3 h-3' />
        {row.original.concepto}
      </Badge>
    ),
  },
  {
    accessorKey: 'tarifa',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Tarifa' />
    ),
    cell: ({ row }) => (
      <Badge
        variant='outline'
        className='flex items-center gap-1.5 bg-indigo-100 text-indigo-800 border-indigo-200 dark:bg-indigo-900/20 dark:text-indigo-300 dark:border-indigo-800'
      >
        <Tag className='w-3 h-3' />
        {row.original.tarifa}
      </Badge>
    ),
  },
  {
    accessorKey: 'tipoMedidor',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Tipo Medidor' />
    ),
    cell: ({ row }) => (
      <Badge
        variant='outline'
        className='flex items-center gap-1.5 bg-teal-100 text-teal-800 border-teal-200 dark:bg-teal-900/20 dark:text-teal-300 dark:border-teal-800'
      >
        <Zap className='w-3 h-3' />
        {row.original.tipoMedidor}
      </Badge>
    ),
  },
  {
    id: 'actions',
    header: 'Acciones',
    cell: ({ row }) => {
      const isEditing = editingCargoId === row.original.id;
      return (
        <TableActions
          onEdit={() => onEdit(row.original)}
          item={row.original}
          showView={false}
          showDelete={false}
          loadingEdit={isEditing}
        />
      );
    },
  },
];
