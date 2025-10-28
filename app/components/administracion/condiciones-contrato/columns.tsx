/* eslint-disable unused-imports/no-unused-vars */
import type { ColumnDef } from '@tanstack/react-table';

import { DataTableColumnHeader } from '~/components/data-table/data-table-column-header';
import { Badge } from '~/components/ui/badge';
import type { GetCondicionesContrato } from '~/types/administracion';

import { TableActions } from '../../data-table/table-helpers';

interface TableColumnsProps {
  onEdit: (condicionContrato: GetCondicionesContrato) => void;
  onView: (condicionContrato: GetCondicionesContrato) => void;
  editingCondicionContrato: number | null;
  canEdit?: boolean;
}

export const columns = ({
  onEdit,
  onView,
  editingCondicionContrato,
  canEdit = true
}: TableColumnsProps): ColumnDef<GetCondicionesContrato>[] => [
  {
    id: 'id',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='ID' />
    ),
    cell: ({ row }) => {
      return <div className='font-medium truncate'>{row.original.id}</div>;
    },
    size: 70,
    minSize: 60,
    maxSize: 80
  },
  {
    id: 'nombre',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Nombre' />
    ),
    cell: ({ row }) => {
      return (
        <div className='font-medium truncate' title={row.original.nombre}>
          {row.original.nombre}
        </div>
      );
    },
    size: 215,
    minSize: 180,
    maxSize: 250
  },
  {
    id: 'concepto',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Concepto' />
    ),
    cell: ({ row }) => {
      return (
        <div className='font-medium truncate' title={row.original.concepto}>
          {row.original.concepto}
        </div>
      );
    },
    size: 175,
    minSize: 150,
    maxSize: 200
  },
  {
    id: 'factorPorcentual',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Factor Porcentual' />
    ),
    cell: ({ row }) => {
      return (
        <div className='font-medium truncate'>
          {row.original.factorPorcentual}
        </div>
      );
    },
    size: 135,
    minSize: 120,
    maxSize: 150
  },
  {
    id: 'valorFijo',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Valor Fijo' />
    ),
    cell: ({ row }) => {
      return (
        <div className='font-medium truncate'>{row.original.valorFijo}</div>
      );
    },
    size: 115,
    minSize: 100,
    maxSize: 130
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
    },
    size: 105,
    minSize: 90,
    maxSize: 120
  },
  {
    id: 'actions',
    header: 'Acciones',
    cell: ({ row }) => (
      <TableActions
        onEdit={() => onEdit(row.original)}
        onView={() => onView(row.original)}
        showView={true}
        item={row.original}
        disableEdit={!canEdit}
      />
    ),
    size: 90,
    minSize: 80,
    maxSize: 100
  }
];
