import type { ColumnDef } from '@tanstack/react-table';
import type { GetMedidores } from '~/types/administracion';
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
import {
  MoreHorizontal,
  Edit,
  Trash2,
  Gauge,
  CircuitBoard,
  MapPin,
  Activity,
  Zap,
} from 'lucide-react';
import { DataTableColumnHeader } from '~/components/data-table/data-table-column-header';

interface MedidoresColumnsProps {
  onEdit: (medidor: GetMedidores) => void;
  onDelete: (medidor: GetMedidores) => void;
}

const getTipoBadgeProps = (tipo: string) => {
  const tipoLower = tipo.toLowerCase();
  switch (tipoLower) {
    case 'trifásico':
    case 'trifasico':
      return {
        icon: <Zap className="h-4 w-4 text-blue-500" />,
        variant: 'outline' as const,
        className: 'border-blue-500 text-blue-600 dark:text-blue-400',
      };
    case 'monofásico':
    case 'monofasico':
      return {
        icon: <Zap className="h-4 w-4 text-emerald-500" />,
        variant: 'outline' as const,
        className: 'border-emerald-500 text-emerald-600 dark:text-emerald-400',
      };
    case 'ambos':
      return {
        icon: <Zap className="h-4 w-4 text-purple-500" />,
        variant: 'outline' as const,
        className: 'border-purple-500 text-purple-600 dark:text-purple-400',
      };
    default:
      return {
        icon: <Zap className="h-4 w-4 text-gray-500" />,
        variant: 'outline' as const,
        className: 'border-gray-500 text-gray-600 dark:text-gray-400',
      };
  }
};

export const columns = ({
  onEdit,
  onDelete,
}: MedidoresColumnsProps): ColumnDef<GetMedidores>[] => [
  {
    accessorKey: 'codigo',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Medidor" />
    ),
    cell: ({ row }) => {
      const medidor = row.original;
      return (
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 bg-gradient-to-br from-sky-400 to-sky-600 rounded-full flex items-center justify-center">
              <Gauge className="w-5 h-5 text-white" />
            </div>
          </div>
          <div>
            <div className="font-medium text-gray-900 dark:text-gray-100">
              {medidor.serie}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Código: {medidor.codigo}
            </div>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: 'marca',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Marca y Modelo" />
    ),
    cell: ({ row }) => {
      const medidor = row.original;
      return (
        <div className="flex items-center space-x-2">
          <CircuitBoard className="h-4 w-4 text-gray-500" />
          <div>
            <div className="font-medium text-gray-900 dark:text-gray-100">
              {medidor.marca}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {medidor.modelo}
            </div>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: 'tipo',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Tipo" />
    ),
    cell: ({ row }) => {
      const tipo = row.getValue('tipo') as string;
      const { icon, variant, className } = getTipoBadgeProps(tipo);
      return (
        <div className="flex items-center space-x-2">
          {icon}
          <Badge variant={variant} className={className}>
            {tipo}
          </Badge>
        </div>
      );
    },
  },
  {
    accessorKey: 'ubicacion',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Ubicación" />
    ),
    cell: ({ row }) => (
      <div className="flex items-center space-x-2">
        <MapPin className="h-4 w-4 text-gray-500" />
        <span className="font-medium text-gray-900 dark:text-gray-100">
          {row.getValue('ubicacion')}
        </span>
      </div>
    ),
  },
  {
    accessorKey: 'estado',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Estado" />
    ),
    cell: ({ row }) => {
      const estado = row.getValue('estado') as string;
      const isActive = estado.toLowerCase() === 'activo';
      return (
        <div className="flex items-center space-x-2">
          <Activity
            className={`h-4 w-4 ${isActive ? 'text-green-500' : 'text-gray-500'}`}
          />
          <Badge variant={isActive ? 'default' : 'secondary'}>{estado}</Badge>
        </div>
      );
    },
  },
  {
    id: 'actions',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Acciones" />
    ),
    cell: ({ row }) => {
      const medidor = row.original;

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
            <DropdownMenuItem onClick={() => onEdit(medidor)}>
              <Edit className="mr-2 h-4 w-4" />
              Editar
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onDelete(medidor)}
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
