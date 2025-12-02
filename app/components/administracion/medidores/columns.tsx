import type { ColumnDef } from '@tanstack/react-table';

import { DataTableColumnHeader } from '~/components/data-table/data-table-column-header';
import {
  EstadoBadge,
  TableActions
} from '~/components/data-table/table-helpers';
import { Badge } from '~/components/ui/badge';
import { Button } from '~/components/ui/button';
import type { GetMedidores } from '~/types/administracion';

interface MedidoresColumnsProps {
  onEdit: (medidor: GetMedidores) => void;
  onAsociarSubempalme: (medidor: GetMedidores) => void;
  onDelete: (medidor: GetMedidores) => void;
  canEdit?: boolean;
}

const getTipoBadgeProps = (tipo: string) => {
  const tipoLower = tipo.toLowerCase();
  switch (tipoLower) {
    case 'trifásico':
    case 'trifasico':
      return {
        variant: 'outline' as const,
        className: 'border-blue-500  text-xs sm:text-sm px-1 sm:px-2',
        shortText: 'Tri',
        fullText: 'Trifásico'
      };
    case 'monofásico':
    case 'monofasico':
      return {
        variant: 'outline' as const,
        className:
          'border-emerald-500 text-emerald-600 dark:text-emerald-400 text-xs sm:text-sm px-1 sm:px-2',
        shortText: 'Mono',
        fullText: 'Monofásico'
      };
    case 'ambos':
      return {
        variant: 'outline' as const,
        className:
          'border-purple-500 text-purple-600 dark:text-purple-400 text-xs sm:text-sm px-1 sm:px-2',
        shortText: 'Ambos',
        fullText: 'Ambos'
      };
    default:
      return {
        variant: 'outline' as const,
        className:
          'border-gray-500 text-gray-600 dark:text-gray-400 text-xs sm:text-sm px-1 sm:px-2',
        shortText: 'N/A',
        fullText: tipo
      };
  }
};

export const columns = ({
  onEdit,
  onAsociarSubempalme,
  canEdit = true
}: MedidoresColumnsProps): ColumnDef<GetMedidores>[] => [
  {
    accessorKey: 'serie',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Serie' />
    ),
    cell: ({ row }) => {
      const medidor = row.original;
      return (
        <div className='flex items-center gap-2'>
          <span className='font-medium text-sm truncate' title={medidor.serie}>
            {medidor.serie}
          </span>
        </div>
      );
    },
    minSize: 120,
    maxSize: 150
  },
  {
    accessorKey: 'codigo',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Código' />
    ),
    cell: ({ row }) => {
      const medidor = row.original;
      return (
        <div className='flex items-center gap-2'>
          <span className='font-mono text-sm font-medium truncate'>
            {medidor.codigo}
          </span>
        </div>
      );
    },
    minSize: 100,
    maxSize: 130
  },
  {
    accessorKey: 'marca',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Marca' />
    ),
    cell: ({ row }) => {
      const medidor = row.original;
      return (
        <div className='flex items-center gap-2'>
          <span className='text-sm truncate' title={medidor.marca}>
            {medidor.marca}
          </span>
        </div>
      );
    },
    minSize: 100,
    maxSize: 130
  },
  {
    accessorKey: 'modelo',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Modelo' />
    ),
    cell: ({ row }) => {
      const medidor = row.original;
      return (
        <div className='flex items-center gap-2'>
          <span className='text-sm truncate' title={medidor.modelo}>
            {medidor.modelo}
          </span>
        </div>
      );
    },
    minSize: 100,
    maxSize: 130
  },
  {
    accessorKey: 'digitos',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Dígitos' />
    ),
    cell: ({ row }) => {
      const medidor = row.original;
      return (
        <div className='flex items-center gap-2'>
          <span className='text-sm font-medium'>{medidor.digitos}</span>
        </div>
      );
    },
    minSize: 70,
    maxSize: 90
  },
  {
    accessorKey: 'multiplicar',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Mult.' />
    ),
    cell: ({ row }) => {
      const medidor = row.original;
      return (
        <div className='flex items-center gap-2'>
          <span className='text-sm font-medium'>{medidor.multiplicar}</span>
        </div>
      );
    },
    minSize: 60,
    maxSize: 80
  },
  {
    accessorKey: 'tipo',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Tipo' />
    ),
    cell: ({ row }) => {
      const tipo = row.getValue('tipo') as string;
      const { variant, className, shortText, fullText } =
        getTipoBadgeProps(tipo);
      return (
        <div className='flex items-center gap-2'>
          <Badge variant={variant} className={className} title={fullText}>
            <span className='hidden sm:inline'>{tipo}</span>
            <span className='sm:hidden'>{shortText}</span>
          </Badge>
        </div>
      );
    },
    minSize: 90,
    maxSize: 120
  },
  {
    accessorKey: 'codigoAcometida',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Acometida' />
    ),
    cell: ({ row }) => {
      const medidor = row.original;
      return (
        <div className='flex items-center gap-2'>
          <Badge
            variant='outline'
            className='bg-sky-100 text-sky-800 border-sky-200 dark:bg-sky-900/20 dark:text-sky-300 dark:border-sky-800 text-sm font-mono'
            title={medidor.codigoAcometida}
          >
            <span className='truncate max-w-[100px]'>
              {medidor.codigoAcometida}
            </span>
          </Badge>
        </div>
      );
    },
    minSize: 130,
    maxSize: 160
  },
  {
    accessorKey: 'ubicacion',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Ubicación' />
    ),
    cell: ({ row }) => {
      const medidor = row.original;
      return (
        <div className='flex items-center gap-2'>
          <span
            className='text-sm truncate max-w-[120px]'
            title={medidor.ubicacion}
          >
            {medidor.ubicacion}
          </span>
        </div>
      );
    },
    minSize: 120,
    maxSize: 150
  },
  {
    accessorKey: 'fechaInicio',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='F. Inicio' />
    ),
    cell: ({ row }) => {
      const medidor = row.original;
      return (
        <div className='flex items-center gap-2'>
          <span className='text-sm font-medium '>{medidor.fechaInicio}</span>
        </div>
      );
    },
    minSize: 100,
    maxSize: 130
  },
  {
    accessorKey: 'estado',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Estado' />
    ),
    cell: ({ row }) => {
      return <EstadoBadge estado={row.getValue('estado')} />;
    },
    minSize: 80,
    maxSize: 100
  },
  {
    id: 'actions',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Acciones' />
    ),
    cell: ({ row }) => {
      const medidor = row.original;
      return (
        <div className='flex items-center justify-center gap-1'>
          <TableActions
            onEdit={onEdit}
            item={medidor}
            showView={false}
            showDelete={false}
            disableEdit={!canEdit}
          />
          <Button
            size='sm'
            variant='ghost'
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
    minSize: 80,
    maxSize: 100
  }
];
