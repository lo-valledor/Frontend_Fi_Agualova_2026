import type { ColumnDef } from '@tanstack/react-table';
import type { GetCondicionesContrato } from '~/types/administracion';
import { Button } from '~/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu';
import { MoreHorizontal, Edit, Eye, Loader2 } from 'lucide-react';
import { Badge } from '~/components/ui/badge';
import { DataTableColumnHeader } from '~/components/data-table/data-table-column-header';

interface TableColumnsProps {
  onEdit: (condicionContrato: GetCondicionesContrato) => void;
  onView: (condicionContrato: GetCondicionesContrato) => void;
  editingCondicionContrato: number | null;
}

export const columns = ({
  onEdit,
  onView,
  editingCondicionContrato,
}: TableColumnsProps): ColumnDef<GetCondicionesContrato>[] => [
  {
    id: 'id',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="ID" />
    ),
    cell: ({ row }) => {
      return <div className="font-medium">{row.original.id}</div>;
    },
  },
  {
    id: 'descripcion',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Descripción" />
    ),
    cell: ({ row }) => {
      return <div className="font-medium">{row.original.descripcion}</div>;
    },
  },
  {
    id: 'concepto',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Concepto" />
    ),
    cell: ({ row }) => {
      return <div className="font-medium">{row.original.concepto}</div>;
    },
  },
  {
    id: 'factorPorcentual',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Factor Porcentual" />
    ),
    cell: ({ row }) => {
      return <div className="font-medium">{row.original.factorPorcentual}</div>;
    },
  },
  {
    id: 'valorFijo',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Valor Fijo" />
    ),
    cell: ({ row }) => {
      return <div className="font-medium">{row.original.valorFijo}</div>;
    },
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
    enableSorting: true,
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },
  {
    id: 'actions',
    header: 'Acciones',
    cell: ({ row }) => {
      const condicionContrato = row.original;
      const isEditing = editingCondicionContrato === condicionContrato.id;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Abrir menú</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Acciones</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => onView(condicionContrato)}>
              <Eye className="mr-2 h-4 w-4" />
              Ver
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onEdit(condicionContrato)}
              disabled={isEditing}
              className={isEditing ? 'opacity-50 cursor-not-allowed' : ''}
            >
              {isEditing ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Edit className="mr-2 h-4 w-4" />
              )}
              {isEditing ? 'Cargando...' : 'Editar'}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
