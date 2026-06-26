import type { ColumnDef } from '@tanstack/react-table';
import { Pencil, Shield, Trash2, UserCog } from 'lucide-react';

import { Button } from '~/components/ui/button';
import type { Usuarios } from '~/types/administracion';

interface TableColumnsProps {
  onEdit: (user: Usuarios) => void;
  onDelete: (user: Usuarios) => void;
  onViewPermissions: (user: Usuarios) => void;
  onManageRoles: (user: Usuarios) => void;
}

export const columns = ({
  onEdit,
  onDelete,
  onViewPermissions,
  onManageRoles
}: TableColumnsProps): ColumnDef<Usuarios>[] => [
  {
    accessorKey: 'userName',
    header: 'Username',
    cell: ({ getValue }) => {
      const id = getValue() as string;
      return (
        <div className="text-sm text-gray-600 dark:text-gray-300">@{id}</div>
      );
    }
  },
  {
    accessorKey: 'nombres',
    header: 'Usuario',
    cell: ({ row }) => {
      const user = row.original;
      return (
        <div className="flex items-center space-x-3">
          <div>
            <div className="font-medium ">
              {user.nombre_Usuario} {user.apellidos_Usuario}
            </div>
          </div>
        </div>
      );
    }
  },
  {
    accessorKey: 'phoneNumber',
    header: 'Teléfono',
    cell: ({ row }) => {
      const telefono = row.getValue('phoneNumber') as string | null;
      return (
        <div className="text-sm text-gray-600 dark:text-gray-300">
          {telefono || (
            <span className="text-muted-foreground italic">Sin teléfono</span>
          )}
        </div>
      );
    }
  },
  {
    accessorKey: 'email',
    header: 'Email',
    cell: ({ row }) => {
      const email = row.getValue('email') as string | null;
      return (
        <div className="text-sm text-gray-600 dark:text-gray-300">
          {email || (
            <span className="text-muted-foreground italic">Sin email</span>
          )}
        </div>
      );
    }
  },

  {
    id: 'actions',
    header: 'Acciones',
    cell: ({ row }) => {
      const user = row.original;
      return (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onManageRoles(user)}
            title="Gestionar roles"
            className="h-8 w-8 p-0"
          >
            <UserCog className="h-4 w-4 text-purple-600 dark:text-purple-400" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onViewPermissions(user)}
            title="Ver permisos"
            className="h-8 w-8 p-0"
          >
            <Shield className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(user)}
            title="Editar"
            className="h-8 w-8 p-0"
          >
            <Pencil className="h-4 w-4 text-amber-600 dark:text-amber-400" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(user)}
            title="Eliminar"
            className="h-8 w-8 p-0"
          >
            <Trash2 className="h-4 w-4 text-red-600 dark:text-red-400" />
          </Button>
        </div>
      );
    }
  }
];
