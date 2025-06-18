import type { ColumnDef } from '@tanstack/react-table';
import type { Zonas } from '~/types/mantencion';
import {
  Edit,
  MapPinIcon,
  MoreHorizontal,
  Trash2,
} from 'lucide-react';
import { Badge } from '~/components/ui/badge';
import { Button } from '~/components/ui/button';
import { TrashIcon } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu';

interface TableColumnsProps {
  onEdit: (zona: Zonas) => void;
  onDelete: (zona: Zonas) => void;
}

export const columns = ({
  onEdit,
  onDelete,
}: TableColumnsProps): ColumnDef<Zonas>[] => [
  {
    header: 'Nombre',
    accessorKey: 'nombre',
    cell: ({ row }) => {
      const zona = row.original;
      return (
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 bg-gradient-to-br from-sky-400 to-sky-600 rounded-full flex items-center justify-center">
              <MapPinIcon className="w-5 h-5 text-white" />
            </div>
          </div>
          <div>
            <div className="font-medium text-gray-900 dark:text-gray-100">
              {zona.nombre}
            </div>
          </div>
        </div>
      );
    },
  },
  {
    header: 'Referencia',
    accessorKey: 'referencia',
    cell: ({ row }) => {
      const zona = row.original;
      return (
        <div className="text-sm text-gray-600 dark:text-gray-300">
          {zona.referencia}
        </div>
      );
    },
  },
  {
    header: 'Estado',
    accessorKey: 'estado',
    cell: ({ row }) => {
      const estado = row.getValue('estado') as boolean;
      return (
        <Badge variant={estado ? 'default' : 'secondary'}>
          {estado ? 'Activo' : 'Inactivo'}
        </Badge>
      );
    },
  },
  {
    header: 'Acciones',
    cell: ({ row }) => {
      const zona = row.original;
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
            <DropdownMenuItem onClick={() => onEdit(zona)}>
              <Edit className="mr-2 h-4 w-4" />
              Editar
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onDelete(zona)}
              className="text-red-600 focus:text-red-600"
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
