import { Edit, Trash2 } from 'lucide-react';

import { Badge } from '~/components/ui/badge';
import { Button } from '~/components/ui/button';
import type { Menus } from '~/types/roles-permisos';

export const createMenusColumns = (
  onEdit: (menu: Menus) => void,
  onDelete: (menu: Menus) => void
) => [
  {
    accessorKey: 'idMenu',
    header: 'ID',
    cell: ({ row }: any) => (
      <Badge
        variant='secondary'
        className='font-mono text-xs bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
      >
        #{row.getValue('idMenu')}
      </Badge>
    )
  },
  {
    accessorKey: 'nombreMenu',
    header: 'Nombre',
    cell: ({ row }: any) => (
      <div className='max-w-[200px] truncate font-medium text-slate-900 dark:text-slate-100'>
        {row.getValue('nombreMenu')}
      </div>
    )
  },
  {
    accessorKey: 'ruta',
    header: 'Ruta',
    cell: ({ row }: any) => (
      <div className='max-w-[250px] truncate text-slate-600 dark:text-slate-400 font-mono text-xs'>
        {row.getValue('ruta') || 'Sin ruta'}
      </div>
    )
  },
  {
    accessorKey: 'orden',
    header: 'Orden',
    cell: ({ row }: any) => (
      <div className='text-center font-mono text-sm'>
        {row.getValue('orden')}
      </div>
    )
  },
  {
    accessorKey: 'icono',
    header: 'Icono',
    cell: ({ row }: any) => (
      <div className='max-w-[150px] truncate text-slate-600 dark:text-slate-400 font-mono text-xs'>
        {row.getValue('icono') || 'Sin icono'}
      </div>
    )
  },
  {
    accessorKey: 'esVisible',
    header: 'Visible',
    cell: ({ row }: any) => (
      <Badge
        className={
          row.getValue('esVisible')
            ? 'bg-green-500 hover:bg-green-600 text-white dark:bg-green-600 dark:hover:bg-green-700'
            : 'bg-gray-500 hover:bg-gray-600 text-white dark:bg-gray-600 dark:hover:bg-gray-700'
        }
      >
        {row.getValue('esVisible') ? 'Sí' : 'No'}
      </Badge>
    )
  },
  {
    id: 'acciones',
    header: 'Acciones',
    cell: ({ row }: any) => {
      const menu = row.original;
      return (
        <div className='flex gap-1'>
          <Button
            size='sm'
            variant='ghost'
            onClick={() => onEdit(menu)}
            className='h-8 w-8 p-0 hover:bg-blue-100 dark:hover:bg-blue-900/50 text-slate-600 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400'
          >
            <Edit className='h-3 w-3' />
          </Button>
          <Button
            size='sm'
            variant='ghost'
            onClick={() => onDelete(menu)}
            className='h-8 w-8 p-0 hover:bg-red-100 dark:hover:bg-red-900/50 text-slate-600 hover:text-red-600 dark:text-slate-400 dark:hover:text-red-400'
          >
            <Trash2 className='h-3 w-3' />
          </Button>
        </div>
      );
    }
  }
];
