import type { ColumnDef } from '@tanstack/react-table';
import { AlertTriangle, CheckCircle } from 'lucide-react';

import { DataTableColumnHeader } from '~/components/data-table/data-table-column-header';
import { Badge } from '~/components/ui/badge';
import { Checkbox } from '~/components/ui/checkbox';
import type { RevisarPrecioDos } from '~/types/operaciones';

import DialogModificarPrecio from './dialog-modificar-precio';

export const columnsEnerlova: ColumnDef<RevisarPrecioDos>[] = [
  {
    id: 'select',
    header: ({ table }) => (
      <div className='flex items-center justify-center'>
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && 'indeterminate')
          }
          onCheckedChange={value => table.toggleAllPageRowsSelected(!!value)}
          aria-label='Seleccionar todo'
          className='translate-y-[2px]'
        />
      </div>
    ),
    cell: ({ row }) => {
      return (
        <div className='flex items-center justify-center'>
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={value => row.toggleSelected(!!value)}
            aria-label='Seleccionar fila'
            className='translate-y-[2px]'
            disabled={row.original.confirmacion === 'Confirmado'}
          />
        </div>
      );
    },
    enableSorting: false,
    enableHiding: false,
    size: 40
  },
  {
    accessorKey: 'codigo',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title='Código'
        className='text-emerald-700 dark:text-emerald-300 font-semibold'
      />
    ),
    cell: ({ row }) => (
      <div className='font-mono text-xs font-medium text-blue-600 dark:text-blue-400'>
        {row.getValue('codigo')}
      </div>
    ),
    size: 120
  },
  {
    accessorKey: 'codigoEner',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title='Código Energía'
        className='text-blue-700 dark:text-blue-300 font-semibold'
      />
    ),
    cell: ({ row }) => (
      <div className='font-mono text-xs text-purple-600 dark:text-purple-400'>
        {row.getValue('codigoEner')}
      </div>
    ),
    size: 100
  },
  {
    accessorKey: 'descripcion',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title='Descripción'
        className='text-slate-700 dark:text-slate-300 font-semibold'
      />
    ),
    cell: ({ row }) => (
      <div className='text-xs text-slate-900 dark:text-slate-100 max-w-xs truncate'>
        {row.getValue('descripcion')}
      </div>
    ),
    size: 250
  },
  {
    accessorKey: 'valor',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title='Valor'
        className='text-green-700 dark:text-green-300 font-semibold'
      />
    ),
    cell: ({ row }) => {
      const value = row.getValue('valor') as string;

      // Formatear número con separador de miles
      const formatValue = (val: string) => {
        const number = parseFloat(val.replace(',', '.'));
        return isNaN(number)
          ? val
          : number.toLocaleString('es-CL', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2
            });
      };

      return (
        <div className='text-xs font-mono font-medium text-green-600 dark:text-green-400'>
          {formatValue(value)}
        </div>
      );
    },
    size: 100
  },
  {
    accessorKey: 'confirmacion',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title='Estado'
        className='text-slate-700 dark:text-slate-300 font-semibold'
      />
    ),
    cell: ({ row }) => {
      const confirmacion = row.getValue('confirmacion') as string;

      return (
        <div className='flex items-center justify-center'>
          {confirmacion === 'Confirmado' ? (
            <Badge className='bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800 flex items-center gap-1 text-xs px-2 py-1'>
              <CheckCircle className='w-3 h-3' />
              Confirmado
            </Badge>
          ) : (
            <Badge
              variant='outline'
              className='bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800 flex items-center gap-1 text-xs px-2 py-1'
            >
              <AlertTriangle className='w-3 h-3' />
              Pendiente
            </Badge>
          )}
        </div>
      );
    },
    size: 130
  },
  {
    id: 'acciones',
    header: () => (
      <div className='text-center text-slate-700 dark:text-slate-300 font-semibold'>
        Acciones
      </div>
    ),
    cell: ({ row }) => {
      const confirmacion = row.getValue('confirmacion') as string;

      return (
        <div className='flex items-center justify-center'>
          {confirmacion === 'Confirmado' ? (
            <Badge className='bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800 flex items-center gap-1 text-xs px-2 py-1'>
              <CheckCircle className='w-3 h-3' />
              Confirmado
            </Badge>
          ) : (
            <DialogModificarPrecio
              isAuthorized={true}
              indice={row.index}
              descripcion={row.original.descripcion}
              valorActual={row.original.valor}
              onSuccess={() => {}}
            />
          )}
        </div>
      );
    },
    enableSorting: false,
    size: 120
  }
];
