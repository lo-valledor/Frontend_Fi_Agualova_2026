import type { ColumnDef } from '@tanstack/react-table';

import { DataTableColumnHeader } from '~/components/data-table/data-table-column-header';
import { TableActions } from '~/components/data-table/table-helpers';
import { Badge } from '~/components/ui/badge';
import type { TiposContrato } from '~/types/mantencion';

interface TiposContratoColumnsProps {
  onEdit: (tipoContrato: TiposContrato) => void;
  onDelete: (tipoContrato: TiposContrato) => void;
  canEdit?: boolean;
}

export const createColumns = ({
  onEdit,
  onDelete,
  canEdit = true
}: TiposContratoColumnsProps): ColumnDef<TiposContrato>[] => [
  {
    accessorKey: 'nombre',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Nombre' />
    ),
    cell: ({ row }) => (
      <div
        className='max-w-[200px] truncate font-medium'
        title={row.getValue('nombre')}
      >
        {row.getValue('nombre')}
      </div>
    )
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
        disableEdit={!canEdit}
      />
    )
  }
];
