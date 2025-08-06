import type { ColumnDef } from '@tanstack/react-table';
import { CircuitBoard, MapPin, Zap } from 'lucide-react';

import { DataTableColumnHeader } from '~/components/data-table/data-table-column-header';
import { EstadoBadge } from '~/components/data-table/table-helpers';
import { Badge } from '~/components/ui/badge';
import { Button } from '~/components/ui/button';
import type { GetMedidores } from '~/types/administracion';

interface MedidoresColumnsProps {
  onEdit: (medidor: GetMedidores) => void;
  onAsociarSubempalme: (medidor: GetMedidores) => void;
}

const getTipoBadgeProps = (tipo: string) => {
  const tipoLower = tipo.toLowerCase();
  switch (tipoLower) {
    case 'trifásico':
    case 'trifasico':
      return {
        icon: (
          <Zap className='h-3 w-3 sm:h-4 sm:w-4 text-blue-500 flex-shrink-0' />
        ),
        variant: 'outline' as const,
        className:
          'border-blue-500 text-blue-600 dark:text-blue-400 text-xs sm:text-sm px-1 sm:px-2',
        shortText: 'Tri',
        fullText: 'Trifásico',
      };
    case 'monofásico':
    case 'monofasico':
      return {
        icon: (
          <Zap className='h-3 w-3 sm:h-4 sm:w-4 text-emerald-500 flex-shrink-0' />
        ),
        variant: 'outline' as const,
        className:
          'border-emerald-500 text-emerald-600 dark:text-emerald-400 text-xs sm:text-sm px-1 sm:px-2',
        shortText: 'Mono',
        fullText: 'Monofásico',
      };
    case 'ambos':
      return {
        icon: (
          <Zap className='h-3 w-3 sm:h-4 sm:w-4 text-purple-500 flex-shrink-0' />
        ),
        variant: 'outline' as const,
        className:
          'border-purple-500 text-purple-600 dark:text-purple-400 text-xs sm:text-sm px-1 sm:px-2',
        shortText: 'Ambos',
        fullText: 'Ambos',
      };
    default:
      return {
        icon: (
          <Zap className='h-3 w-3 sm:h-4 sm:w-4 text-gray-500 flex-shrink-0' />
        ),
        variant: 'outline' as const,
        className:
          'border-gray-500 text-gray-600 dark:text-gray-400 text-xs sm:text-sm px-1 sm:px-2',
        shortText: 'N/A',
        fullText: tipo,
      };
  }
};

export const columns = ({
  onEdit,
  onAsociarSubempalme,
}: MedidoresColumnsProps): ColumnDef<GetMedidores>[] => [
  {
    accessorKey: 'codigo',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Medidor' />
    ),
    cell: ({ row }) => {
      const medidor = row.original;
      return (
        <div className='flex items-center gap-2 sm:gap-3 min-w-0'>
          <div className='p-1 sm:p-1.5 bg-sky-100 dark:bg-sky-900/30 rounded-md flex-shrink-0'>
            <CircuitBoard className='h-3 w-3 sm:h-4 sm:w-4 text-sky-600 dark:text-sky-400' />
          </div>
          <div className='min-w-0 flex-1'>
            <div
              className='font-medium text-slate-900 dark:text-slate-100 text-xs sm:text-sm truncate max-w-[120px] lg:max-w-[180px]'
              title={medidor.serie}
            >
              {medidor.serie}
            </div>
            <div
              className='text-xs text-slate-500 dark:text-slate-400 font-mono truncate'
              title={`Código: ${medidor.codigo}`}
            >
              C: {medidor.codigo}
            </div>
          </div>
        </div>
      );
    },
    minSize: 140,
    maxSize: 200,
  },
  {
    accessorKey: 'marca',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Marca y Modelo' />
    ),
    cell: ({ row }) => {
      const medidor = row.original;
      return (
        <div className='flex items-center gap-1 sm:gap-2 min-w-0'>
          <div className='p-1 sm:p-1.5 bg-violet-100 dark:bg-violet-900/30 rounded-md flex-shrink-0'>
            <CircuitBoard className='h-3 w-3 sm:h-4 sm:w-4 text-violet-600 dark:text-violet-400' />
          </div>
          <div className='min-w-0 flex-1'>
            <div
              className='font-medium text-slate-900 dark:text-slate-100 text-xs sm:text-sm truncate max-w-[100px] lg:max-w-[140px]'
              title={medidor.marca}
            >
              {medidor.marca}
            </div>
            <div
              className='text-xs text-slate-500 dark:text-slate-400 truncate max-w-[100px] lg:max-w-[140px]'
              title={medidor.modelo}
            >
              {medidor.modelo}
            </div>
          </div>
        </div>
      );
    },
    minSize: 120,
    maxSize: 160,
  },
  {
    accessorKey: 'fechaInicio',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='F. Inicio' />
    ),
    cell: ({ row }) => {
      const medidor = row.original;
      return (
        <div className='flex items-center gap-1 sm:gap-2 min-w-0'>
          <div className='p-1 sm:p-1.5 bg-amber-100 dark:bg-amber-900/30 rounded-md flex-shrink-0'>
            <MapPin className='h-3 w-3 sm:h-4 sm:w-4 text-amber-600 dark:text-amber-400' />
          </div>
          <span className='font-medium text-slate-900 dark:text-slate-100 text-xs sm:text-sm whitespace-nowrap'>
            {medidor.fechaInicio}
          </span>
        </div>
      );
    },
    minSize: 100,
    maxSize: 130,
  },
  {
    accessorKey: 'digitos',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Dígitos' />
    ),
    cell: ({ row }) => {
      const medidor = row.original;
      return (
        <div className='flex items-center gap-1 sm:gap-2 min-w-0'>
          <div className='p-1 sm:p-1.5 bg-emerald-100 dark:bg-emerald-900/30 rounded-md flex-shrink-0'>
            <Zap className='h-3 w-3 sm:h-4 sm:w-4 text-emerald-600 dark:text-emerald-400' />
          </div>
          <span className='font-medium text-slate-900 dark:text-slate-100 text-xs sm:text-sm'>
            {medidor.digitos}
          </span>
        </div>
      );
    },
    minSize: 80,
    maxSize: 100,
  },
  {
    accessorKey: 'multiplicar',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Mult.' />
    ),
    cell: ({ row }) => {
      const medidor = row.original;
      return (
        <div className='flex items-center gap-1 sm:gap-2 min-w-0'>
          <div className='p-1 sm:p-1.5 bg-orange-100 dark:bg-orange-900/30 rounded-md flex-shrink-0'>
            <Zap className='h-3 w-3 sm:h-4 sm:w-4 text-orange-600 dark:text-orange-400' />
          </div>
          <span className='font-medium text-slate-900 dark:text-slate-100 text-xs sm:text-sm'>
            {medidor.multiplicar}
          </span>
        </div>
      );
    },
    minSize: 70,
    maxSize: 90,
  },
  {
    accessorKey: 'tipo',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Tipo' />
    ),
    cell: ({ row }) => {
      const tipo = row.getValue('tipo') as string;
      const { icon, variant, className, shortText, fullText } =
        getTipoBadgeProps(tipo);
      return (
        <div className='flex items-center gap-1 sm:gap-2'>
          {icon}
          <Badge variant={variant} className={className} title={fullText}>
            <span className='hidden sm:inline'>{tipo}</span>
            <span className='sm:hidden'>{shortText}</span>
          </Badge>
        </div>
      );
    },
    minSize: 100,
    maxSize: 130,
  },
  {
    accessorKey: 'codigoAcometida',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Acometida' />
    ),
    cell: ({ row }) => {
      const medidor = row.original;
      return (
        <div className='flex items-center gap-1 sm:gap-2 min-w-0'>
          <div className='p-1 sm:p-1.5 bg-cyan-100 dark:bg-cyan-900/30 rounded-md flex-shrink-0'>
            <CircuitBoard className='h-3 w-3 sm:h-4 sm:w-4 text-cyan-600 dark:text-cyan-400' />
          </div>
          <div className='min-w-0 flex-1'>
            <div
              className='font-medium text-slate-900 dark:text-slate-100 text-xs sm:text-sm truncate max-w-[100px] lg:max-w-[120px]'
              title={medidor.codigoAcometida}
            >
              {medidor.codigoAcometida}
            </div>
          </div>
        </div>
      );
    },
    minSize: 110,
    maxSize: 140,
  },
  {
    accessorKey: 'ubicacion',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Ubicación' />
    ),
    cell: ({ row }) => (
      <div className='flex items-center gap-1 sm:gap-2 min-w-0'>
        <div className='p-1 sm:p-1.5 bg-blue-100 dark:bg-blue-900/30 rounded-md flex-shrink-0'>
          <MapPin className='h-3 w-3 sm:h-4 sm:w-4 text-blue-600 dark:text-blue-400' />
        </div>
        <span
          className='font-medium text-slate-900 dark:text-slate-100 text-xs sm:text-sm truncate max-w-[100px] lg:max-w-[140px]'
          title={row.getValue('ubicacion')}
        >
          {row.getValue('ubicacion')}
        </span>
      </div>
    ),
    minSize: 120,
    maxSize: 160,
  },
  {
    accessorKey: 'estado',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Estado' />
    ),
    cell: ({ row }) => {
      return <EstadoBadge estado={row.getValue('estado')} />;
    },
    minSize: 100,
    maxSize: 120,
  },
  {
    id: 'actions',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Acciones' />
    ),
    cell: ({ row }) => {
      const medidor = row.original;
      return (
        <div className='flex items-center justify-center gap-1 sm:gap-2'>
          <Button
            size='sm'
            variant='outline'
            onClick={() => onEdit(medidor)}
            className='h-7 w-7 sm:h-8 sm:w-8 p-0'
            title='Editar medidor'
          >
            <svg
              className='h-3 w-3 sm:h-4 sm:w-4'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z'
              />
            </svg>
          </Button>
          <Button
            size='sm'
            variant='secondary'
            onClick={() => onAsociarSubempalme(medidor)}
            className='h-7 w-7 sm:h-8 sm:w-8 p-0'
            title='Asociar subempalme'
          >
            <svg
              className='h-3 w-3 sm:h-4 sm:w-4'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1'
              />
            </svg>
          </Button>
        </div>
      );
    },
    minSize: 100,
    maxSize: 120,
  },
];
