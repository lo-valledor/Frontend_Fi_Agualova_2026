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
      return <div className='font-medium'>{row.original.id}</div>;
    },
    minSize: 80,
    maxSize: 100
  },
  {
    id: 'nombre',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Nombre' />
    ),
    cell: ({ row }) => {
      return <div className='font-medium'>{row.original.nombre}</div>;
    },
    minSize: 250,
    maxSize: 400
  },
  {
    id: 'concepto',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Concepto' />
    ),
    cell: ({ row }) => {
      return <div className='font-medium'>{row.original.concepto}</div>;
    },
    minSize: 200,
    maxSize: 300
  },
  {
    id: 'factorPorcentual',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Factor Porcentual' />
    ),
    cell: ({ row }) => {
      return <div className='font-medium'>{row.original.factorPorcentual}</div>;
    },
    minSize: 150,
    maxSize: 180
  },
  {
    id: 'valorFijo',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Valor Fijo' />
    ),
    cell: ({ row }) => {
      return <div className='font-medium'>{row.original.valorFijo}</div>;
    },
    minSize: 150,
    maxSize: 180
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
    minSize: 120,
    maxSize: 150
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
    minSize: 120,
    maxSize: 150
  }
];
