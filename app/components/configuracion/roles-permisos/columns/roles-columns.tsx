import { Edit, Trash2 } from 'lucide-react';

import { Badge } from '~/components/ui/badge';
import { Button } from '~/components/ui/button';
import type { Roles } from '~/types/roles-permisos';

export const createRolesColumns = (
onEdit: (rol: Roles) => void, onDelete: (rol: Roles) => void, handleViewPermissions: (rol: Roles) => void) => [
  {
    accessorKey: 'idRol',
    header: 'ID',
    cell: ({ row }: any) => (
      <Badge
        variant='secondary'
        className='font-mono text-xs bg-background  dark:text-slate-300'
      >
        #{row.getValue('idRol')}
      </Badge>
    )
  },
  {
    accessorKey: 'nombreRol',
    header: 'Rol',
    cell: ({ row }: any) => (
      <div className='flex items-center gap-2'>
        <div className='font-medium'>{row.getValue('nombreRol')}</div>
      </div>
    )
  },
  {
    accessorKey: 'descripcion',
    header: 'Descripción',
    cell: ({ row }: any) => (
      <div className='max-w-[300px] truncate'>
        {row.getValue('descripcion') || 'Sin descripción'}
      </div>
    )
  },
  {
    accessorKey: 'estadoRol',
    header: 'Estado',
    cell: ({ row }: any) => (
      <Badge
        className={
          row.getValue('estadoRol')
            ? 'bg-green-500 hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700'
            : 'bg-gray-500 hover:bg-gray-600 dark:bg-gray-600 dark:hover:bg-gray-700'
        }
      >
        {row.getValue('estadoRol') ? 'Activo' : 'Inactivo'}
      </Badge>
    )
  },
  {
    id: 'acciones',
    header: 'Acciones',
    cell: ({ row }: any) => {
      const rol = row.original;
      return (
        <div className='flex gap-1'>
          <Button
            size='sm'
            variant='ghost'
            onClick={() => onEdit(rol)}
            className='h-8 w-8 p-0 hover:bg-blue-100 dark:hover:bg-blue-900/50 text-slate-600 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400'
          >
            <Edit className='h-3 w-3' />
          </Button>
          <Button
            size='sm'
            variant='ghost'
            onClick={() => onDelete(rol)}
            className='h-8 w-8 p-0 hover:bg-red-100 dark:hover:bg-red-900/50 text-slate-600 hover:text-red-600 dark:text-slate-400 dark:hover:text-red-400'
          >
            <Trash2 className='h-3 w-3' />
          </Button>
        </div>
      );
    }
  }
];
