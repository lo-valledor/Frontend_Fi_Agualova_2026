import type { ColumnDef } from '@tanstack/react-table';

import { DataTableColumnHeader } from '~/components/data-table/data-table-column-header';
import { TableActions } from '~/components/data-table/table-helpers';
import { Badge } from '~/components/ui/badge';
import type { Tarifas } from '~/types/mantencion';

interface TarifasColumnsProps {
  onEdit: (tarifa: Tarifas) => void;
  onDelete: (tarifa: Tarifas) => void;
}

export const createColumns = ({
  onEdit,
  onDelete
}: TarifasColumnsProps): ColumnDef<Tarifas>[] => [
  {
    accessorKey: 'codigo',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Código' />
    ),
    cell: ({ row }) => (
      <Badge variant='outline' className='font-mono'>
        {row.getValue('codigo')}
      </Badge>
    )
  },
  {
    accessorKey: 'nombre',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Nombre' />
    ),
    cell: ({ row }) => (
      <div
        className='max-w-[250px] truncate font-medium'
        title={row.getValue('nombre')}
      >
        {row.getValue('nombre')}
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
