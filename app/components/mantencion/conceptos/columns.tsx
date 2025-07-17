import type { ColumnDef } from '@tanstack/react-table';
import { Badge } from '~/components/ui/badge';
import { DataTableColumnHeader } from '~/components/data-table/data-table-column-header';
import type { Conceptos } from '~/types/mantencion';
import { TableActions } from '~/components/data-table/table-helpers';

interface ConceptosColumnsProps {
  onEdit: (concepto: Conceptos) => void;
  onDelete: (concepto: Conceptos) => void;
}

export const createColumns = ({
  onEdit,
  onDelete,
}: ConceptosColumnsProps): ColumnDef<Conceptos>[] => [
  {
    accessorKey: 'denominacion',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Denominación" />
    ),
    cell: ({ row }) => (
      <div
        className="max-w-[150px] truncate font-medium"
        title={row.getValue('denominacion')}
      >
        {row.getValue('denominacion')}
      </div>
    ),
  },
  {
    accessorKey: 'descripcion',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Descripción" />
    ),
    cell: ({ row }) => (
      <div
        className="max-w-[200px] truncate"
        title={row.getValue('descripcion')}
      >
        {row.getValue('descripcion')}
      </div>
    ),
  },
  {
    accessorKey: 'unidad',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Unidad" />
    ),
    cell: ({ row }) => (
      <Badge variant="outline" className="font-mono">
        {row.getValue('unidad')}
      </Badge>
    ),
  },
  {
    accessorKey: 'fijoVariable',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Fijo/Variable" />
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
    },
  },
  {
    accessorKey: 'asociadoDescripcion',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Asociado" />
    ),
    cell: ({ row }) => (
      <div
        className="max-w-[150px] truncate"
        title={row.getValue('asociadoDescripcion')}
      >
        {row.getValue('asociadoDescripcion') || 'N/A'}
      </div>
    ),
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
