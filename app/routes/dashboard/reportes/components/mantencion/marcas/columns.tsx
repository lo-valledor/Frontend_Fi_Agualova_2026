import type { ColumnDef } from '@tanstack/react-table';

import { DataTableColumnHeader } from '~/components/data-table/data-table-column-header';
import { TableActions } from '~/components/data-table/table-helpers';
import { Badge } from '~/components/ui/badge';
import type { Marca } from '~/types/mantencion';

interface TableColumnsProps {
  onEdit: (marca: Marca) => void;
  onDelete: (marca: Marca) => void;
}

export const columns = ({
  onEdit,
  onDelete
}: TableColumnsProps): ColumnDef<Marca>[] => [
  {
    accessorKey: 'id',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="ID" />
    ),
    cell: ({ row }) => {
      const id = row.getValue('id') as string;
      return (
        <div className="flex items-center">
          <Badge variant="outline" className="font-mono">
            {id}
          </Badge>
        </div>
      );
    },
    enableSorting: true,
    enableHiding: false
  },
  {
    accessorKey: 'nombre',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Nombre" />
    ),
    cell: ({ row }) => {
      const nombre = row.getValue('nombre') as string;
      return <div className="max-w-[200px] truncate font-medium">{nombre}</div>;
    },
    enableSorting: true
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
