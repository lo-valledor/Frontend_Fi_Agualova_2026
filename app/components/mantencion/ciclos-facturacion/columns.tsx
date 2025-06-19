import type { ColumnDef } from '@tanstack/react-table';
import { Edit, MoreHorizontal, Trash2 } from 'lucide-react';
import { Badge } from '~/components/ui/badge';
import { Button } from '~/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu';
import { DataTableColumnHeader } from '~/components/data-table/data-table-column-header';
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
      <DataTableColumnHeader column={column} title="Descripción" />
    ),
    cell: ({ row }) => {
      const descripcion = row.getValue('descripcion') as string;
      return (
        <div className="max-w-[200px] truncate font-medium">{descripcion}</div>
      );
    },
    enableSorting: true,
    enableHiding: false,
  },
  {
    accessorKey: 'diaFacturacion',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Día de Facturación" />
    ),
    cell: ({ row }) => {
      const dia = row.getValue('diaFacturacion') as number;
      return (
        <div className="text-center">
          <Badge variant="outline" className="font-mono">
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
      <DataTableColumnHeader column={column} title="Día Inicio Lectura" />
    ),
    cell: ({ row }) => {
      const dia = row.getValue('diaInicioLectura') as number;
      return (
        <div className="text-center">
          <Badge variant="outline" className="font-mono">
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
      <DataTableColumnHeader column={column} title="Días Vencimiento" />
    ),
    cell: ({ row }) => {
      const dias = row.getValue('diasVencimientoFactura') as number;
      return (
        <div className="text-center">
          <span className="font-medium">{dias}</span>
          <span className="text-xs text-muted-foreground ml-1">días</span>
        </div>
      );
    },
    enableSorting: true,
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
      const ciclo = row.original;
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="h-8 w-8 p-0 hover:bg-muted"
              aria-label={`Acciones para ciclo ${ciclo.descripcion}`}
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            <DropdownMenuLabel>Acciones</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => onEdit(ciclo)}
              className="cursor-pointer"
            >
              <Edit className="mr-2 h-4 w-4" />
              Editar
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onDelete(ciclo)}
              className="cursor-pointer text-destructive focus:text-destructive"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Eliminar
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
    enableSorting: false,
    enableHiding: false,
  },
];
