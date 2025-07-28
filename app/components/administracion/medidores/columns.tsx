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
        icon: <Zap className='h-4 w-4 text-blue-500' />,
        variant: 'outline' as const,
        className: 'border-blue-500 text-blue-600 dark:text-blue-400',
      };
    case 'monofásico':
    case 'monofasico':
      return {
        icon: <Zap className='h-4 w-4 text-emerald-500' />,
        variant: 'outline' as const,
        className: 'border-emerald-500 text-emerald-600 dark:text-emerald-400',
      };
    case 'ambos':
      return {
        icon: <Zap className='h-4 w-4 text-purple-500' />,
        variant: 'outline' as const,
        className: 'border-purple-500 text-purple-600 dark:text-purple-400',
      };
    default:
      return {
        icon: <Zap className='h-4 w-4 text-gray-500' />,
        variant: 'outline' as const,
        className: 'border-gray-500 text-gray-600 dark:text-gray-400',
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
        <div className='flex items-center space-x-3'>
          <div>
            <div className='font-medium text-gray-900 dark:text-gray-100'>
              {medidor.serie}
            </div>
            <div className='text-sm text-gray-500 dark:text-gray-400'>
              Código: {medidor.codigo}
            </div>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: 'marca',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Marca y Modelo' />
    ),
    cell: ({ row }) => {
      const medidor = row.original;
      return (
        <div className='flex items-center space-x-2'>
          <CircuitBoard className='h-4 w-4 text-gray-500' />
          <div>
            <div className='font-medium text-gray-900 dark:text-gray-100'>
              {medidor.marca}
            </div>
            <div className='text-sm text-gray-500 dark:text-gray-400'>
              {medidor.modelo}
            </div>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: 'fechaInicio',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Fecha de Inicio' />
    ),
    cell: ({ row }) => {
      const medidor = row.original;
      return (
        <span className='font-medium text-gray-900 dark:text-gray-100'>
          {medidor.fechaInicio}
        </span>
      );
    },
  },
  {
    accessorKey: 'digitos',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Dígitos' />
    ),
    cell: ({ row }) => {
      const medidor = row.original;
      return (
        <span className='font-medium text-gray-900 dark:text-gray-100'>
          {medidor.digitos}
        </span>
      );
    },
  },
  {
    accessorKey: 'multiplicar',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Multiplicar' />
    ),
    cell: ({ row }) => {
      const medidor = row.original;
      return (
        <span className='font-medium text-gray-900 dark:text-gray-100'>
          {medidor.multiplicar}
        </span>
      );
    },
  },
  {
    accessorKey: 'tipo',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Tipo' />
    ),
    cell: ({ row }) => {
      const tipo = row.getValue('tipo') as string;
      const { icon, variant, className } = getTipoBadgeProps(tipo);
      return (
        <div className='flex items-center space-x-2'>
          {icon}
          <Badge variant={variant} className={className}>
            {tipo}
          </Badge>
        </div>
      );
    },
  },
  {
    accessorKey: 'codigoAcometida',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Acometida' />
    ),
    cell: ({ row }) => {
      const medidor = row.original;
      return (
        <div className='flex items-center space-x-2'>
          <CircuitBoard className='h-4 w-4 text-gray-500' />
          <div>
            <div className='font-medium text-gray-900 dark:text-gray-100'>
              {medidor.codigoAcometida}
            </div>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: 'ubicacion',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Ubicación' />
    ),
    cell: ({ row }) => (
      <div className='flex items-center space-x-2'>
        <MapPin className='h-4 w-4 text-gray-500' />
        <span className='font-medium text-gray-900 dark:text-gray-100'>
          {row.getValue('ubicacion')}
        </span>
      </div>
    ),
  },
  {
    accessorKey: 'estado',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Estado' />
    ),
    cell: ({ row }) => {
      return <EstadoBadge estado={row.getValue('estado')} />;
    },
  },
  {
    id: 'actions',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Acciones' />
    ),
    cell: ({ row }) => {
      const medidor = row.original;
      return (
        <div className='flex items-center gap-2'>
          <Button
            size='sm'
            variant='outline'
            onClick={() => onEdit(medidor)}
            className='h-8 w-8 p-0'
            title='Editar medidor'
          >
            <svg
              className='h-4 w-4'
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
            className='h-8 w-8 p-0'
            title='Asociar subempalme'
          >
            <svg
              className='h-4 w-4'
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
  },
];
