import type { ColumnDef } from '@tanstack/react-table';
import { AlertTriangle, Ban, CheckCircle } from 'lucide-react';

import { DataTableColumnHeader } from '~/components/data-table/data-table-column-header';
import { Badge } from '~/components/ui/badge';
import { Checkbox } from '~/components/ui/checkbox';
import type { RevisarPrecioUno } from '~/types/operaciones';

import DialogModificarPrecio from './dialog-modificar-precio';

export const columnsEnel: ColumnDef<RevisarPrecioUno>[] = [
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
            disabled={
              row.original.confirmacion === 'Confirmado' ||
              row.original.indice === ''
            }
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
        className='text-blue-700 dark:text-blue-300 font-semibold'
      />
    ),
    cell: ({ row }) => (
      <div className='font-mono text-xs font-medium '>
        {row.getValue('codigo')}
      </div>
    ),
    size: 100
  },
  {
    accessorKey: 'codigoEner',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title='Código Energía'
        className='text-purple-700 dark:text-purple-300 font-semibold'
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
      <div className='text-xs max-w-xs truncate'>
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
        // Remover separadores de miles (puntos) y reemplazar coma decimal por punto
        const cleanValue = val.replace(/\./g, '').replace(',', '.');
        const number = parseFloat(cleanValue);
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
      const indice = row.original.indice;

      if (confirmacion === 'Confirmado') {
        return (
          <div className='flex items-center justify-center'>
            <Badge className='bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border-border flex items-center gap-1 text-xs px-2 py-1'>
              <CheckCircle className='w-3 h-3' />
              Confirmado
            </Badge>
          </div>
        );
      } else if (indice === '') {
        return (
          <div className='flex items-center justify-center'>
            <Badge className='bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800 flex items-center gap-1 text-xs px-2 py-1'>
              <Ban className='w-3 h-3' />
              Inhabilitado
            </Badge>
          </div>
        );
      } else {
        return (
          <div className='flex items-center justify-center'>
            <Badge
              variant='outline'
              className='bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800 flex items-center gap-1 text-xs px-2 py-1'
            >
              <AlertTriangle className='w-3 h-3' />
              Pendiente
            </Badge>
          </div>
        );
      }
    },
    size: 130
  },
  {
    id: 'acciones',
    header: () => <div className='text-center font-semibold'>Acciones</div>,
    cell: ({ row }) => {
      const confirmacion = row.getValue('confirmacion') as string;
      const indice = row.original.indice;

      return (
        <div className='flex items-center justify-center'>
          {confirmacion === 'Confirmado' ? (
            <Badge className='bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border-border flex items-center gap-1'>
              <CheckCircle className='w-3 h-3' />
              Confirmado
            </Badge>
          ) : indice === '' ? (
            <Badge className='bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800 flex items-center gap-1'>
              <Ban className='w-3 h-3' />
              Inhabilitado
            </Badge>
          ) : (
            <DialogModificarPrecio
              isAuthorized={true}
              indice={Number(indice)}
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
