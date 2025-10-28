import type { ColumnDef } from '@tanstack/react-table';
import { Pencil, Shield, Trash2 } from 'lucide-react';

import { EstadoBadge } from '~/components/data-table/table-helpers';
import { Badge } from '~/components/ui/badge';
import { Button } from '~/components/ui/button';
import type { Usuarios } from '~/types/administracion';

interface TableColumnsProps {
  onEdit: (user: Usuarios) => void;
  onDelete: (user: Usuarios) => void;
  onViewPermissions: (user: Usuarios) => void;
  canEdit?: boolean;
}

export const columns = ({
  onEdit,
  onDelete,
  onViewPermissions,
  canEdit = true
}: TableColumnsProps): ColumnDef<Usuarios>[] => [
  {
    accessorKey: 'nombres',
    header: 'Usuario',
    cell: ({ row }) => {
      const user = row.original;
      return (
        <div className='flex items-center space-x-3'>
          <div>
            <div className='font-medium '>
              {user.nombres} {user.apellidos}
            </div>
            <div className='text-sm text-muted-foreground'>
              @{user.nombreDeUsuario}
            </div>
          </div>
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
        <div className='text-sm text-gray-600 dark:text-gray-300'>
          {email || (
            <span className='text-muted-foreground italic'>Sin email</span>
          )}
        </div>
      );
    }
  },
  {
    accessorKey: 'departamento',
    header: 'Departamento',
    cell: ({ row }) => {
      const departamento = row.getValue('departamento') as number;
      const departamentos = {
        1: 'Gerencia',
        2: 'Tecnología',
        3: 'Recaudación',
        4: 'Seguridad',
        5: 'RR.HH',
        6: 'Enerlova'
      };
      return (
        <div className='text-sm text-gray-600 dark:text-gray-300'>
          {departamentos[departamento as keyof typeof departamentos] ||
            `Departamento ${departamento}`}
        </div>
      );
    }
  },
  {
    accessorKey: 'perfilId',
    header: 'Perfil',
    cell: ({ row }) => {
      const perfilId = row.getValue('perfilId') as number;
      const perfiles = {
        1: {
          name: 'Administrador',
          color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
        },
        2: {
          name: 'Lectura',
          color: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
        },
        3: {
          name: 'Supervisor Operativo',
          color:
            'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
        },
        4: {
          name: 'Administrativo Facturación',
          color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
        },
        7: {
          name: 'Supervisor Facturación',
          color:
            'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
        },
        8: {
          name: 'Usuario Consulta',
          color: 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200'
        },
        10: {
          name: 'Autorizador Límite Invierno',
          color: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200'
        }
      };

      const perfil = perfiles[perfilId as keyof typeof perfiles] || {
        name: `Perfil ${perfilId}`,
        color: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
      };

      return <Badge className={perfil.color}>{perfil.name}</Badge>;
    }
  },
  {
    accessorKey: 'activo',
    header: 'Estado',
    cell: ({ row }) => {
      return <EstadoBadge estado={row.getValue('activo')} />;
    },
    enableSorting: true,
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    }
  },
  {
    accessorKey: 'fechaCreacion',
    header: 'Fecha de Creación',
    cell: ({ row }) => {
      const fecha = new Date(row.getValue('fechaCreacion'));
      return (
        <div className='text-sm text-gray-600 dark:text-gray-300'>
          {fecha.toLocaleDateString('es-ES')}
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
        <div className='flex items-center gap-2'>
          <Button
            variant='ghost'
            size='sm'
            onClick={() => onViewPermissions(user)}
            title='Ver permisos'
            className='h-8 w-8 p-0'
          >
            <Shield className='h-4 w-4 text-blue-600 dark:text-blue-400' />
          </Button>
          <Button
            variant='ghost'
            size='sm'
            onClick={() => onEdit(user)}
            disabled={!canEdit}
            title={!canEdit ? 'No tiene permisos para editar' : 'Editar'}
            className='h-8 w-8 p-0'
          >
            <Pencil className='h-4 w-4 text-amber-600 dark:text-amber-400' />
          </Button>
          <Button
            variant='ghost'
            size='sm'
            onClick={() => onDelete(user)}
            disabled={!canEdit}
            title={!canEdit ? 'No tiene permisos para eliminar' : 'Eliminar'}
            className='h-8 w-8 p-0'
          >
            <Trash2 className='h-4 w-4 text-red-600 dark:text-red-400' />
          </Button>
        </div>
      );
    }
  }
];
