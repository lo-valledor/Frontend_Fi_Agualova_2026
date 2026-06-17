import type { ColumnDef } from '@tanstack/react-table';

import { DataTableColumnHeader } from '~/components/data-table/data-table-column-header';
import { Badge } from '~/components/ui/badge';
import type { PreciosCargoEnel } from '~/types/operaciones';

import DialogAgregarPrecios from './dialog-agregar-precios';

export const columns = (
  mes: string,
  anio: string,
  onSuccess: () => void
): ColumnDef<PreciosCargoEnel>[] => [
  {
    accessorKey: 'codigo',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title='Código'
        className='text-slate-700 dark:text-slate-300 font-semibold'
      />
    ),
    cell: ({ row }) => (
      <div className='font-mono text-xs sm:text-sm font-medium'>
        {row.getValue('codigo')}
      </div>
    ),
    size: 100
  },
  {
    accessorKey: 'codigoener',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title='Cód. Agualova'
        className='text-slate-700 dark:text-slate-300 font-semibold'
      />
    ),
    cell: ({ row }) => (
      <div className='font-mono text-xs sm:text-sm text-slate-700 dark:text-slate-400'>
        {row.getValue('codigoener')}
      </div>
    ),
    size: 120
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
      <div className='text-xs sm:text-sm max-w-[150px] sm:max-w-xs truncate'>
        {row.getValue('descripcion')}
      </div>
    ),
    size: 200
  },
  {
    accessorKey: 'valor',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title='Ant. 1'
        className='text-orange-700 dark:text-orange-300 font-semibold justify-end'
      />
    ),
    cell: ({ row }) => (
      <div className='text-xs sm:text-sm font-mono text-orange-600 dark:text-orange-400 text-right pr-1'>
        {row.getValue('valor')}
      </div>
    ),
    size: 80
  },
  {
    accessorKey: 'valor2',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title='Ant. 2'
        className='text-orange-700 dark:text-orange-300 font-semibold justify-end'
      />
    ),
    cell: ({ row }) => (
      <div className='text-xs sm:text-sm font-mono text-orange-600 dark:text-orange-400 text-right pr-1'>
        {row.getValue('valor2')}
      </div>
    ),
    size: 80
  },
  {
    accessorKey: 'valor3',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title='Ant. 3'
        className='text-orange-700 dark:text-orange-300 font-semibold justify-end'
      />
    ),
    cell: ({ row }) => (
      <div className='text-xs sm:text-sm font-mono text-orange-600 dark:text-orange-400 text-right pr-1'>
        {row.getValue('valor3')}
      </div>
    ),
    size: 80
  },
  {
    accessorKey: 'valoractual',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title='Act. 1'
        className='text-green-700 dark:text-green-300 font-semibold justify-end'
      />
    ),
    cell: ({ row }) => {
      const value = row.getValue('valoractual') as string;
      const isNoValue = value === 'Sin Valor';

      // Formatear número con separador de miles
      const formatValue = (val: string) => {
        if (isNoValue) return val;
        const number = parseFloat(val.replace(',', '.'));
        return Number.isNaN(number)
          ? val
          : number.toLocaleString('es-CL', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2
            });
      };

      return (
        <div
          className={`text-xs sm:text-sm font-mono text-right pr-1 ${
            isNoValue
              ? 'text-red-600 dark:text-red-400'
              : 'text-green-600 dark:text-green-400'
          }`}
        >
          {formatValue(value)}
        </div>
      );
    },
    size: 90
  },
  {
    accessorKey: 'valoractual2',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title='Act. 2'
        className='text-green-700 dark:text-green-300 font-semibold justify-end'
      />
    ),
    cell: ({ row }) => {
      const value = row.getValue('valoractual2') as string;
      const isNoValue = value === 'Sin Valor';

      // Formatear número con separador de miles
      const formatValue = (val: string) => {
        if (isNoValue) return val;
        const number = parseFloat(val.replace(',', '.'));
        return Number.isNaN(number)
          ? val
          : number.toLocaleString('es-CL', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2
            });
      };

      return (
        <div
          className={`text-xs sm:text-sm font-mono text-right pr-1 ${
            isNoValue
              ? 'text-red-600 dark:text-red-400'
              : 'text-green-600 dark:text-green-400'
          }`}
        >
          {formatValue(value)}
        </div>
      );
    },
    size: 90
  },
  {
    accessorKey: 'valoractual3',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title='Act. 3'
        className='text-green-700 dark:text-green-300 font-semibold justify-end'
      />
    ),
    cell: ({ row }) => {
      const value = row.getValue('valoractual3') as string;
      const isNoValue = value === 'Sin Valor';

      // Formatear número con separador de miles
      const formatValue = (val: string) => {
        if (isNoValue) return val;
        const number = parseFloat(val.replace(',', '.'));
        return Number.isNaN(number)
          ? val
          : number.toLocaleString('es-CL', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2
            });
      };

      return (
        <div
          className={`text-xs sm:text-sm font-mono text-right pr-1 ${
            isNoValue
              ? 'text-red-600 dark:text-red-400'
              : 'text-green-600 dark:text-green-400'
          }`}
        >
          {formatValue(value)}
        </div>
      );
    },
    size: 90
  },
  {
    id: 'actions',
    header: () => (
      <div className='text-center font-semibold text-xs sm:text-sm'>Estado</div>
    ),
    cell: ({ row }) => {
      const { valoractual, valoractual2, valoractual3, codigo } = row.original;
      const hasNoValues =
        valoractual === 'Sin Valor' ||
        valoractual2 === 'Sin Valor' ||
        valoractual3 === 'Sin Valor';

      return (
        <div className='flex justify-center'>
          {hasNoValues ? (
            <DialogAgregarPrecios
              valor1={Number(valoractual.replace(',', '.'))}
              valor2={Number(valoractual2.replace(',', '.'))}
              valor3={Number(valoractual3.replace(',', '.'))}
              codigo={codigo}
              mes={mes}
              anio={anio}
              onSuccess={onSuccess}
            />
          ) : (
            <Badge
              variant='outline'
              className='bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border-border text-xs px-1 py-0'
            >
              ✓ <span className='hidden sm:inline'>Actualizado</span>
            </Badge>
          )}
        </div>
      );
    },
    size: 100,
    enableSorting: false
  }
];
