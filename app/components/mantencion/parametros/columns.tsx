import type { ColumnDef } from '@tanstack/react-table';
import { Badge } from '~/components/ui/badge';
import { DataTableColumnHeader } from '~/components/data-table/data-table-column-header';
import type { Parametro } from '~/types/mantencion';
import { TableActions } from '~/components/data-table/table-helpers';

interface ParametrosColumnsProps {
  onEdit: (parametro: Parametro) => void;
  onDelete: (parametro: Parametro) => void;
}

export const createColumns = ({
  onEdit,
  onDelete,
}: ParametrosColumnsProps): ColumnDef<Parametro>[] => [
  {
    accessorKey: 'descripcion',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Descripción" />
    ),
    cell: ({ row }) => (
      <div
        className="max-w-[200px] truncate font-medium"
        title={row.getValue('descripcion')}
      >
        {row.getValue('descripcion')}
      </div>
    ),
  },
  {
    accessorKey: 'valor',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Valor" />
    ),
    cell: ({ row }) => (
      <div className="max-w-[150px] truncate" title={row.getValue('valor')}>
        {row.getValue('valor')}
      </div>
    ),
  },
  {
    accessorKey: 'sigla',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Sigla" />
    ),
    cell: ({ row }) => (
      <Badge variant="outline" className="font-mono">
        {row.getValue('sigla')}
      </Badge>
    ),
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
