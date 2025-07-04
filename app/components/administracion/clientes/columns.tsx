import type { ColumnDef } from '@tanstack/react-table';
import {
  Edit,
  Eye,
  Loader2,
  MapPin,
  Phone,
} from 'lucide-react';
import { DataTableColumnHeader } from '~/components/data-table/data-table-column-header';
import { Button } from '~/components/ui/button';
import { Badge } from '~/components/ui/badge';


import type { GetClientes } from '~/types/administracion';
import { format } from 'rut.js';

interface ClientesColumnsProps {
  onEdit: (cliente: GetClientes) => void;
  onDetails: (cliente: GetClientes) => void;
  editingClienteRut: string | null;
  detailingClienteRut: string | null;
}

export const columns = ({
  onEdit,
  onDetails,
  editingClienteRut,
  detailingClienteRut,
}: ClientesColumnsProps): ColumnDef<GetClientes>[] => [
  {
    accessorKey: 'rut',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Cliente" />
    ),
    cell: ({ row }) => {
      return (
        <div className="flex items-center space-x-3">
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
      const isDetailing = detailingClienteRut === cliente.rut;
      return (
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => onDetails(cliente)}
            title="Ver Detalles"
            disabled={isDetailing}
          >
            {isDetailing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => onEdit(cliente)}
            title="Editar"
            disabled={isEditing}
          >
            {isEditing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Edit className="h-4 w-4" />
            )}
          </Button>
        </div>
      );
    },
  },
];
