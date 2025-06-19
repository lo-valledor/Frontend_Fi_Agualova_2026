import type { ColumnDef } from '@tanstack/react-table';
import {
  Edit,
  Eye,
  MoreHorizontal,
  Loader2,
  Building2,
  User2,
  MapPin,
  Phone,
} from 'lucide-react';
import { DataTableColumnHeader } from '~/components/data-table/data-table-column-header';
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
import type { GetClientes } from '~/types/administracion';
import { format } from 'rut.js';

interface ClientesColumnsProps {
  onEdit: (cliente: GetClientes) => void;
  onDetails: (cliente: GetClientes) => void;
  editingClienteRut: string | null;
}

export const columns = ({
  onEdit,
  onDetails,
  editingClienteRut,
}: ClientesColumnsProps): ColumnDef<GetClientes>[] => [
  {
    accessorKey: 'rut',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Cliente" />
    ),
    cell: ({ row }) => {
      const cliente = row.original;
      return (
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center">
              {cliente.esEmpresa ? (
                <Building2 className="w-5 h-5 text-white" />
              ) : (
                <User2 className="w-5 h-5 text-white" />
              )}
            </div>
          </div>
          <div>
            <div className="font-medium text-gray-900 dark:text-gray-100">
              {row.original.nombreCompleto}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {format(row.getValue('rut'))}
            </div>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: 'esEmpresa',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Tipo" />
    ),
    cell: ({ row }) => (
      <Badge variant={row.getValue('esEmpresa') ? 'default' : 'secondary'}>
        {row.getValue('esEmpresa') ? 'Empresa' : 'Persona'}
      </Badge>
    ),
  },
  {
    accessorKey: 'direccion',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Dirección" />
    ),
    cell: ({ row }) => (
      <div className="font-medium text-gray-900 dark:text-gray-100">
        {row.getValue('direccion') || 'N/A'}
      </div>
    ),
  },
  {
    accessorKey: 'comuna',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Comuna" />
    ),
    cell: ({ row }) => (
      <div className="flex items-center space-x-2">
        <MapPin className="h-4 w-4 text-gray-500" />
        <span className="font-medium text-gray-900 dark:text-gray-100">
          {row.getValue('comuna') || 'N/A'}
        </span>
      </div>
    ),
  },
  {
    accessorKey: 'telefono',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Teléfono" />
    ),
    cell: ({ row }) => (
      <div className="flex items-center space-x-2">
        <Phone className="h-4 w-4 text-gray-500" />
        <span className="font-medium text-gray-900 dark:text-gray-100">
          {row.getValue('telefono') || 'N/A'}
        </span>
      </div>
    ),
  },
  {
    accessorKey: 'contacto',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Contacto" />
    ),
    cell: ({ row }) => (
      <div className="font-medium text-gray-900 dark:text-gray-100">
        {row.getValue('contacto') || 'N/A'}
      </div>
    ),
  },
  {
    accessorKey: 'email',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Email" />
    ),
    cell: ({ row }) => (
      <div className="font-medium text-gray-900 dark:text-gray-100">
        {row.getValue('email') || 'N/A'}
      </div>
    ),
  },
  {
    id: 'actions',
    header: 'Acciones',
    cell: ({ row }) => {
      const cliente = row.original;
      const isEditing = editingClienteRut === cliente.rut;

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
            <DropdownMenuItem onClick={() => onDetails(cliente)}>
              <Eye className="mr-2 h-4 w-4" />
              Ver Detalles
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onEdit(cliente)}
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
