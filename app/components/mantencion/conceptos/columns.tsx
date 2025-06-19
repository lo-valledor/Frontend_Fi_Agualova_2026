import type { ColumnDef } from '@tanstack/react-table';
import { MoreHorizontal, Edit, Trash2 } from 'lucide-react';
import { Button } from '~/components/ui/button';
import { Badge } from '~/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu';
import { DataTableColumnHeader } from '~/components/data-table/data-table-column-header';
import type { Conceptos } from '~/types/mantencion';

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
      const valor = row.getValue('fijoVariable') as string;
      return (
        <Badge
          variant={valor?.toLowerCase() === 'fijo' ? 'default' : 'secondary'}
        >
          {valor}
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
    cell: ({ row }) => {
      const concepto = row.original;

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
            <DropdownMenuItem onClick={() => onEdit(concepto)}>
              <Edit className="mr-2 h-4 w-4" />
              Editar
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onDelete(concepto)}
              className="text-red-600"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Eliminar
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
