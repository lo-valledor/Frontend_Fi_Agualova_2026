import type { ColumnDef } from '@tanstack/react-table';
import { Badge } from '~/components/ui/badge';
import { DataTableColumnHeader } from '~/components/data-table/data-table-column-header';
import type { Nicho } from '~/types/mantencion';
import { TableActions } from '~/components/data-table/table-helpers';

interface TableColumnsProps {
  onEdit: (nicho: Nicho) => void;
  onDelete: (nicho: Nicho) => void;
}

export const columns = ({
  onEdit,
  onDelete,
}: TableColumnsProps): ColumnDef<Nicho>[] => [
  {
    accessorKey: 'sectorNombre',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Sector" />
    ),
    cell: ({ row }) => {
      const nicho = row.original;
      return (
        <div className="flex items-center space-x-3">
          <div>
            <div className="font-medium text-gray-900 dark:text-gray-100">
              {nicho.sectorNombre}
            </div>
          </div>
        </div>
      );
    },
    enableSorting: true,
    enableHiding: false,
  },
  {
    accessorKey: 'nombre',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Nombre" />
    ),
    cell: ({ row }) => {
      const nombre = row.getValue('nombre') as string;
      return <div className="max-w-[150px] truncate font-medium">{nombre}</div>;
    },
    enableSorting: true,
  },
  {
    accessorKey: 'ubicacion',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Ubicación" />
    ),
    cell: ({ row }) => {
      const ubicacion = row.getValue('ubicacion') as string;
      return (
        <div className="max-w-[200px] truncate text-sm text-muted-foreground">
          {ubicacion}
        </div>
      );
    },
    enableSorting: true,
  },
  {
    accessorKey: 'estado',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Estado" />
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
    },
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
    ),
  },
];
