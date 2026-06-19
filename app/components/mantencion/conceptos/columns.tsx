import type { ColumnDef } from '@tanstack/react-table';

import { DataTableColumnHeader } from '~/components/data-table/data-table-column-header';
import { TableActions } from '~/components/data-table/table-helpers';
import { Badge } from '~/components/ui/badge';
import type { Concepto } from '~/types/mantencion';

interface ConceptosColumnsProps {
  onEdit: (concepto: Concepto) => void;
  onDelete: (concepto: Concepto) => void;
}

export const createColumns = ({
  onEdit,
  onDelete
}: ConceptosColumnsProps): ColumnDef<Concepto>[] => [
  {
    accessorKey: 'denominacion',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Denominación' />
    ),
    cell: ({ row }) => (
      <div
        className='max-w-[150px] truncate font-medium'
        title={row.getValue('denominacion')}
      >
        {row.getValue('denominacion')}
      </div>
    )
  },
  {
    accessorKey: 'descripcion',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Descripción' />
    ),
    cell: ({ row }) => (
      <div
        className='max-w-[200px] truncate'
        title={row.getValue('descripcion')}
      >
        {row.getValue('descripcion')}
      </div>
    )
  },
  {
    accessorKey: 'unidad',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Unidad' />
    ),
    cell: ({ row }) => (
      <Badge variant='outline' className='font-mono'>
        {row.getValue('unidad')}
      </Badge>
    )
  },
  {
    accessorKey: 'fijoVariable',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Fijo/Variable' />
    ),
    cell: ({ row }) => {
      const valor = (row.getValue('fijoVariable') as string)?.toUpperCase();
      const esFijo = valor === 'F';
      return (
        <Badge
          variant={esFijo ? 'default' : 'secondary'}
          className={
            esFijo
              ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
              : 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200'
          }
        >
          {valor === 'V' ? 'Variable' : 'Fijo'}
        </Badge>
      );
    }
  },
  {
    accessorKey: 'conceptoAsociado',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Asociado' />
    ),
    cell: ({ row }) => (
      <div
        className='max-w-[150px] truncate'
        title={row.getValue('conceptoAsociado') || 'N/A'}
      >
        {row.getValue('conceptoAsociado') || 'N/A'}
      </div>
    )
  },
  {
    id: 'actions',
    header: 'Acciones',
    cell: ({ row }) => (
      <TableActions
        onEdit={() => onEdit(row.original)}
        onDelete={() => onDelete(row.original)}
        showView={false}
        item={row.original}
      />
    )
  }
];
