import type { ColumnDef } from '@tanstack/react-table';

import { DataTableColumnHeader } from '~/components/data-table/data-table-column-header';
import { TableActions } from '~/components/data-table/table-helpers';
import { Badge } from '~/components/ui/badge';
import type { CiclosFacturacion } from '~/types/mantencion';

interface TableColumnsProps {
  onEdit: (ciclo: CiclosFacturacion) => void;
  onDelete: (ciclo: CiclosFacturacion) => void;
}

export const columns = ({
  onEdit,
  onDelete,
}: TableColumnsProps): ColumnDef<CiclosFacturacion>[] => [
  {
    accessorKey: 'descripcion',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Descripción' />
    ),
    cell: ({ row }) => {
      const descripcion = row.getValue('descripcion') as string;
      return (
        <div className='max-w-[200px] truncate font-medium'>{descripcion}</div>
      );
    },
    enableSorting: true,
    enableHiding: false,
  },
  {
    accessorKey: 'diaFacturacion',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Día de Facturación' />
    ),
    cell: ({ row }) => {
      const dia = row.getValue('diaFacturacion') as number;
      return (
        <div className='text-center'>
          <Badge variant='outline' className='font-mono'>
            {dia}
          </Badge>
        </div>
      );
    },
    enableSorting: true,
  },
  {
    accessorKey: 'diaInicioLectura',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Día Inicio Lectura' />
    ),
    cell: ({ row }) => {
      const dia = row.getValue('diaInicioLectura') as number;
      return (
        <div className='text-center'>
          <Badge variant='outline' className='font-mono'>
            {dia}
          </Badge>
        </div>
      );
    },
    enableSorting: true,
  },
  {
    accessorKey: 'diasVencimientoFactura',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Días Vencimiento' />
    ),
    cell: ({ row }) => {
      const dias = row.getValue('diasVencimientoFactura') as number;
      return (
        <div className='text-center'>
          <span className='font-medium'>{dias}</span>
          <span className='text-xs text-muted-foreground ml-1'>días</span>
        </div>
      );
    },
    enableSorting: true,
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
