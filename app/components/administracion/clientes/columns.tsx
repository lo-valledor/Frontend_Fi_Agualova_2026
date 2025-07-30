import type { ColumnDef } from '@tanstack/react-table';
import { Building2, Mail, MapPin, Phone, User } from 'lucide-react';
import { format } from 'rut.js';

import { DataTableColumnHeader } from '~/components/data-table/data-table-column-header';
import { TableActions } from '~/components/data-table/table-helpers';
import { Badge } from '~/components/ui/badge';
import type { GetClientes } from '~/types/administracion';

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
      <DataTableColumnHeader column={column} title='Cliente' />
    ),
    cell: ({ row }) => {
      return (
        <div className='flex items-center gap-2 sm:gap-3 min-w-0'>
          <div className='p-1 sm:p-1.5 bg-sky-100 dark:bg-sky-900/30 rounded-md flex-shrink-0'>
            {row.original.esEmpresa ? (
              <Building2 className='h-3 w-3 sm:h-4 sm:w-4 text-sky-600 dark:text-sky-400' />
            ) : (
              <User className='h-3 w-3 sm:h-4 sm:w-4 text-sky-600 dark:text-sky-400' />
            )}
          </div>
          <div className='min-w-0 flex-1'>
            <div
              className='font-medium text-slate-900 dark:text-slate-100 truncate text-xs sm:text-sm max-w-[120px] lg:max-w-[160px]'
              title={row.original.nombreCompleto}
            >
              {row.original.nombreCompleto}
            </div>
            <div className='text-xs text-slate-500 dark:text-slate-400 font-mono truncate'>
              {format(row.getValue('rut'))}
            </div>
          </div>
        </div>
      );
    },
    minSize: 150,
    maxSize: 220,
  },
  {
    accessorKey: 'esEmpresa',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Tipo' />
    ),
    cell: ({ row }) => (
      <Badge
        variant='outline'
        className={
          row.getValue('esEmpresa')
            ? 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-300 dark:border-emerald-800 text-xs font-medium px-1 sm:px-2'
            : 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800 text-xs font-medium px-1 sm:px-2'
        }
        title={row.getValue('esEmpresa') ? 'Empresa' : 'Persona Natural'}
      >
        <span className='hidden sm:inline'>
          {row.getValue('esEmpresa') ? 'Empresa' : 'Persona'}
        </span>
        <span className='sm:hidden'>
          {row.getValue('esEmpresa') ? 'Emp' : 'Per'}
        </span>
      </Badge>
    ),
    minSize: 80,
    maxSize: 120,
  },
  {
    accessorKey: 'direccion',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Dirección' />
    ),
    cell: ({ row }) => (
      <div className='flex items-center gap-1 sm:gap-2 min-w-0'>
        <div className='p-1 sm:p-1.5 bg-violet-100 dark:bg-violet-900/30 rounded-md flex-shrink-0'>
          <MapPin className='h-3 w-3 sm:h-4 sm:w-4 text-violet-600 dark:text-violet-400' />
        </div>
        <span
          className='font-medium text-slate-900 dark:text-slate-100 truncate text-xs sm:text-sm max-w-[100px] lg:max-w-[160px]'
          title={row.getValue('direccion') || 'Sin dirección'}
        >
          {row.getValue('direccion') || 'N/A'}
        </span>
      </div>
    ),
    minSize: 120,
    maxSize: 200,
  },
  {
    accessorKey: 'comuna',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Comuna' />
    ),
    cell: ({ row }) => (
      <div className='flex items-center gap-1 sm:gap-2 min-w-0'>
        <div className='p-1 sm:p-1.5 bg-cyan-100 dark:bg-cyan-900/30 rounded-md flex-shrink-0'>
          <Building2 className='h-3 w-3 sm:h-4 sm:w-4 text-cyan-600 dark:text-cyan-400' />
        </div>
        <span
          className='font-medium text-slate-900 dark:text-slate-100 truncate text-xs sm:text-sm max-w-[80px] lg:max-w-[100px]'
          title={row.getValue('comuna') || 'Sin comuna'}
        >
          {row.getValue('comuna') || 'N/A'}
        </span>
      </div>
    ),
    minSize: 100,
    maxSize: 140,
  },
  {
    accessorKey: 'telefono',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Teléfono' />
    ),
    cell: ({ row }) => (
      <div className='flex items-center gap-1 sm:gap-2 min-w-0'>
        <div className='p-1 sm:p-1.5 bg-amber-100 dark:bg-amber-900/30 rounded-md flex-shrink-0'>
          <Phone className='h-3 w-3 sm:h-4 sm:w-4 text-amber-600 dark:text-amber-400' />
        </div>
        <span
          className='font-medium text-slate-900 dark:text-slate-100 truncate text-xs sm:text-sm whitespace-nowrap'
          title={row.getValue('telefono') || 'Sin teléfono'}
        >
          {row.getValue('telefono') || 'N/A'}
        </span>
      </div>
    ),
    minSize: 120,
    maxSize: 160,
  },
  {
    accessorKey: 'contacto',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Contacto' />
    ),
    cell: ({ row }) => (
      <div className='flex items-center gap-1 sm:gap-2 min-w-0'>
        <div className='p-1 sm:p-1.5 bg-blue-100 dark:bg-blue-900/30 rounded-md flex-shrink-0'>
          <User className='h-3 w-3 sm:h-4 sm:w-4 text-blue-600 dark:text-blue-400' />
        </div>
        <span
          className='font-medium text-slate-900 dark:text-slate-100 truncate text-xs sm:text-sm max-w-[100px] lg:max-w-[120px]'
          title={row.getValue('contacto') || 'Sin contacto'}
        >
          {row.getValue('contacto') || 'N/A'}
        </span>
      </div>
    ),
    minSize: 120,
    maxSize: 160,
  },
  {
    accessorKey: 'email',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Email' />
    ),
    cell: ({ row }) => (
      <div className='flex items-center gap-1 sm:gap-2 min-w-0'>
        <div className='p-1 sm:p-1.5 bg-purple-100 dark:bg-purple-900/30 rounded-md flex-shrink-0'>
          <Mail className='h-3 w-3 sm:h-4 sm:w-4 text-purple-600 dark:text-purple-400' />
        </div>
        <span
          className='font-medium text-slate-900 dark:text-slate-100 truncate text-xs sm:text-sm max-w-[120px] lg:max-w-[160px]'
          title={row.getValue('email') || 'Sin email'}
        >
          {row.getValue('email') || 'N/A'}
        </span>
      </div>
    ),
    minSize: 140,
    maxSize: 200,
  },
  {
    id: 'actions',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Acciones' />
    ),
    cell: ({ row }) => {
      return (
        <div className='flex items-center justify-center'>
          <TableActions
            onView={onDetails}
            onEdit={onEdit}
            item={row.original}
            showView={true}
            showDelete={false}
            loadingEdit={editingClienteRut === row.original.rut}
            loadingView={detailingClienteRut === row.original.rut}
          />
        </div>
      );
    },
    minSize: 80,
    maxSize: 100,
    enableSorting: false,
  },
];
