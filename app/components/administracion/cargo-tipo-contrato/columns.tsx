import type { ColumnDef } from '@tanstack/react-table';

import { DataTableColumnHeader } from '~/components/data-table/data-table-column-header';
import {
  EstadoBadge,
  TableActions
} from '~/components/data-table/table-helpers';
import type { CargoTipoContrato } from '~/types/administracion';

export const columns = ({
  onEdit
}: {
  onEdit: (data: CargoTipoContrato) => void;
}): ColumnDef<CargoTipoContrato>[] => [
  {
    accessorKey: 'tipoContrato',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Tipo de Contrato" />
    )
  },
  {
    accessorKey: 'cargoFacturable',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Cargo Facturable" />
    )
  },
  {
    accessorKey: 'condicionContrato',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Condición" />
    )
  },
  {
    accessorKey: 'descripcion',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Descripción" />
    )
  },
  {
    accessorKey: 'estado',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Estado" />
    ),
    cell: ({ row }) => <EstadoBadge estado={row.getValue('estado')} />
  },
  {
    id: 'actions',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Acciones" />
    ),
    cell: ({ row }) => (
      <div className="flex justify-center">
        <TableActions
          onEdit={() => onEdit(row.original)}
          showView={false}
          item={row.original}
        />
      </div>
    )
  }
];
