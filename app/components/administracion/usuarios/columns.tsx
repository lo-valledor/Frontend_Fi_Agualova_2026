'use client';

import type { ColumnDef } from '@tanstack/react-table';
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
import { MoreHorizontal, Edit, Trash2, UserIcon } from 'lucide-react';
import type { Usuarios } from '~/types/administracion';

interface TableColumnsProps {
  onEdit: (user: Usuarios) => void;
  onDelete: (user: Usuarios) => void;
}

export const columns = ({
  onEdit,
  onDelete,
}: TableColumnsProps): ColumnDef<Usuarios>[] => [
  {
    accessorKey: 'nombres',
    header: 'Usuario',
    cell: ({ row }) => {
      const user = row.original;
      return (
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 bg-gradient-to-br from-sky-400 to-sky-600 rounded-full flex items-center justify-center">
              <UserIcon className="w-5 h-5 text-white" />
            </div>
          </div>
          <div>
            <div className="font-medium text-gray-900 dark:text-gray-100">
              {user.nombres} {user.apellidos}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              @{user.nombreDeUsuario}
            </div>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: 'departamento',
    header: 'Departamento',
    cell: ({ row }) => {
      const departamento = row.getValue('departamento') as number;
      const departamentos = {
        1: 'Recursos Humanos',
        2: 'Tecnología',
        3: 'Ventas',
        4: 'Marketing',
        5: 'Finanzas',
        6: 'Operaciones',
      };
      return (
        <div className="text-sm text-gray-600 dark:text-gray-300">
          {departamentos[departamento as keyof typeof departamentos] ||
            `Departamento ${departamento}`}
        </div>
      );
    },
  },
  {
    accessorKey: 'perfilId',
    header: 'Perfil',
    cell: ({ row }) => {
      const perfilId = row.getValue('perfilId') as number;
      const perfiles = {
        1: {
          name: 'Administrador',
          color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
        },
        2: {
          name: 'Moderador',
          color:
            'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
        },
        3: {
          name: 'Usuario',
          color:
            'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
        },
        4: {
          name: 'Visualizador',
          color:
            'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
        },
      };

      const perfil = perfiles[perfilId as keyof typeof perfiles] || perfiles[3];

      return <Badge className={perfil.color}>{perfil.name}</Badge>;
    },
  },
  {
    accessorKey: 'activo',
    header: 'Estado',
    cell: ({ row }) => {
      const activo = row.getValue('activo') as boolean;
      return (
        <Badge variant={activo ? 'default' : 'secondary'}>
          {activo ? 'Activo' : 'Inactivo'}
        </Badge>
      );
    },
  },
  {
    accessorKey: 'fechaCreacion',
    header: 'Fecha de Creación',
    cell: ({ row }) => {
      const fecha = new Date(row.getValue('fechaCreacion'));
      return (
        <div className="text-sm text-gray-600 dark:text-gray-300">
          {fecha.toLocaleDateString('es-ES')}
        </div>
      );
    },
  },
  {
    id: 'actions',
    header: 'Acciones',
    cell: ({ row }) => {
      const user = row.original;

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
            <DropdownMenuItem onClick={() => onEdit(user)}>
              <Edit className="mr-2 h-4 w-4" />
              Editar
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onDelete(user)}
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

/**
 * export interface Usuarios {
  idUsuario: number;
  nombreDeUsuario: string;
  perfilId: number;
  nombres: string;
  apellidos: string;
  departamento: number;
  activo: boolean;
  fechaCreacion: string;
}
 */
