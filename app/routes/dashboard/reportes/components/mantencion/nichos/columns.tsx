import type { ColumnDef } from '@tanstack/react-table';

import { DataTableColumnHeader } from '~/components/data-table/data-table-column-header';
import { TableActions } from '~/components/data-table/table-helpers';
import { Badge } from '~/components/ui/badge';
import type { Nicho } from '~/types/mantencion';

interface TableColumnsProps {
  onEdit: (nicho: Nicho) => void;
  onDelete: (nicho: Nicho) => void;
}

export const columns = ({
  onEdit,
  onDelete
}: TableColumnsProps): ColumnDef<Nicho>[] => [
  {
    accessorKey: 'id',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="ID" />
    ),
    cell: ({ row }) => {
      const id = row.getValue('id');
      return (
        <div className="w-16 font-mono text-sm font-medium text-center">
          {id as number}
        </div>
      );
    },
    enableSorting: true,
    enableHiding: false,
    size: 80
  },
  {
    accessorKey: 'nombre',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Sector" />
    ),
    cell: ({ row }) => {
      const nicho = row.original;
      return (
        <div className="flex items-center space-x-3">
          <div>
            <div className="font-medium ">{nicho.nombre}</div>
          </div>
        </div>
      );
    },
    enableSorting: true,
    enableHiding: false
  },
  {
    accessorKey: 'ubicacion',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Ubicación" />
    ),
    cell: ({ row }) => {
      const ubicacion = row.getValue('ubicacion');
      return (
        <div className="max-w-[200px] truncate text-sm text-muted-foreground">
          {ubicacion as string}
        </div>
      );
    },
    enableSorting: true
  },
  {
    accessorKey: 'estado',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Estado" />
    ),
    cell: ({ row }) => {
      const estado = row.getValue('estado');
      return (
        <Badge
          variant={estado ? 'default' : 'destructive'}
          className={
            estado
              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
              : ''
          }
        >
          {(estado as string) ? 'Activo' : 'Inactivo'}
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
