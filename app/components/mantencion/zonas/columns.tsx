import type { ColumnDef } from '@tanstack/react-table';

import { DataTableColumnHeader } from '~/components/data-table/data-table-column-header';
import { TableActions } from '~/components/data-table/table-helpers';
import { Badge } from '~/components/ui/badge';
import type { Zonas } from '~/types/mantencion';

interface TableColumnsProps {
  onEdit: (zona: Zonas) => void;
  onDelete: (zona: Zonas) => void;
}

export const columns = ({
  onEdit,
  onDelete
}: TableColumnsProps): ColumnDef<Zonas>[] => [
  {
    accessorKey: 'nombre',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Nombre' />
    ),
    cell: ({ row }) => {
      const zona = row.original;
      return (
        <div className='flex items-center space-x-3'>
          <div>
            <div className='font-medium text-gray-900 dark:text-gray-100'>
              {zona.nombre}
            </div>
          </div>
        </div>
      );
    },
    enableSorting: true,
    enableHiding: false
  },
  {
    accessorKey: 'referencia',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Referencia' />
    ),
    cell: ({ row }) => {
      const referencia = row.getValue('referencia') as string;
      return (
        <div className='font-mono text-sm text-muted-foreground'>
          {referencia}
        </div>
      );
    },
    enableSorting: true
  },
  {
    accessorKey: 'estado',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Estado' />
    ),
    cell: ({ row }) => {
      const estado = row.getValue('estado') as boolean;
      return (
        <Badge
          variant={estado ? 'default' : 'destructive'}
          className={
            estado
              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
              : ''
          }
        >
          {estado ? 'Activo' : 'Inactivo'}
        </Badge>
      );
    },
    enableSorting: true,
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    }
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
