import type { ColumnDef } from '@tanstack/react-table';
import { DataTableColumnHeader } from '~/components/data-table/data-table-column-header';
import { Badge } from '~/components/ui/badge';
import type { Empalme } from '~/types/mantencion';
import { TableActions } from '~/components/data-table/table-helpers';

interface TableColumnsProps {
  onEdit: (empalme: Empalme) => void;
  onDelete: (empalme: Empalme) => void;
}

export const columns = ({
  onEdit,
  onDelete,
}: TableColumnsProps): ColumnDef<Empalme>[] => [
  {
    accessorKey: 'codigo',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Código" />
    ),
    cell: ({ row }) => {
      const codigo = row.getValue('codigo') as string;
      return (
        <div className="flex items-center">
          <Badge variant="outline" className="font-mono">
            {codigo}
          </Badge>
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
    accessorKey: 'codigoCliente',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Código Cliente" />
    ),
    cell: ({ row }) => {
      const codigoCliente = row.getValue('codigoCliente') as string;
      return <div className="font-mono text-sm">{codigoCliente}</div>;
    },
    enableSorting: true,
  },
  {
    accessorKey: 'potenciaContratada',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Potencia Contratada" />
    ),
    cell: ({ row }) => {
      const potencia = row.getValue('potenciaContratada') as number;
      return (
        <div className="text-right">
          <span className="font-medium">{potencia.toFixed(2)}</span>
          <span className="text-xs text-muted-foreground ml-1">kW</span>
        </div>
      );
    },
    enableSorting: true,
  },
  {
    accessorKey: 'tarifa',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Tarifa" />
    ),
    cell: ({ row }) => {
      const tarifa = row.getValue('tarifa') as string;
      return <Badge variant="secondary">{tarifa}</Badge>;
    },
    enableSorting: true,
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
