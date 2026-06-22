import type { ColumnDef } from '@tanstack/react-table';

import { DataTableColumnHeader } from '~/components/data-table/data-table-column-header';
import { Badge } from '~/components/ui/badge';
import type { PreciosConsultarRequest } from '~/types/operaciones';

import DialogAgregarPrecios from './dialog-agregar-precios';

export const columns = (
  mes: string,
  anio: string,
  onSuccess: () => void
): ColumnDef<PreciosConsultarRequest>[] => [
  {
    accessorKey: 'codigoInterno',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Código"
        className="text-slate-700 dark:text-slate-300 font-semibold"
      />
    ),
    cell: ({ row }) => (
      <div className="font-mono text-xs sm:text-sm font-medium">
        {row.getValue('codigoInterno')}
      </div>
    ),
    size: 100
  },
  {
    accessorKey: 'codigoEnerlova',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Cód. Agualova"
        className="text-slate-700 dark:text-slate-300 font-semibold"
      />
    ),
    cell: ({ row }) => (
      <div className="font-mono text-xs sm:text-sm text-slate-700 dark:text-slate-400">
        {row.getValue('codigoEnerlova')}
      </div>
    ),
    size: 120
  },
  {
    accessorKey: 'descripcion',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Descripción"
        className="text-slate-700 dark:text-slate-300 font-semibold"
      />
    ),
    cell: ({ row }) => (
      <div className="text-xs sm:text-sm max-w-37.5 sm:max-w-xs truncate">
        {row.getValue('descripcion')}
      </div>
    ),
    size: 200
  },
  {
    accessorKey: 'valorMesAnterior',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Ant. 1"
        className="text-orange-700 dark:text-orange-300 font-semibold justify-end"
      />
    ),
    cell: ({ row }) => (
      <div className="text-xs sm:text-sm font-mono text-orange-600 dark:text-orange-400 text-right pr-1">
        {row.getValue('valorMesAnterior')}
      </div>
    ),
    size: 80
  },
  {
    accessorKey: 'valorActual',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Act. 1"
        className="text-green-700 dark:text-green-300 font-semibold justify-end"
      />
    ),
    cell: ({ row }) => {
      const value = row.getValue('valorActual') as number;
      const isNoValue = !value || value <= 0;
      const formatted = isNoValue
        ? 'Sin Valor'
        : value.toLocaleString('es-CL', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
          });

      return (
        <div
          className={`text-xs sm:text-sm font-mono text-right pr-1 ${
            isNoValue
              ? 'text-red-600 dark:text-red-400'
              : 'text-green-600 dark:text-green-400'
          }`}
        >
          {formatted}
        </div>
      );
    },
    size: 90
  },
  {
    id: 'actions',
    header: () => (
      <div className="text-center font-semibold text-xs sm:text-sm">Estado</div>
    ),
    cell: ({ row }) => {
      const { codigoInterno, valorMesAnterior, valorActual } = row.original;
      const hasNoValues =
        valorMesAnterior === 'Sin Valor' || !valorActual || valorActual <= 0;

      return (
        <div className="flex justify-center">
          {hasNoValues ? (
            <DialogAgregarPrecios
              codigo={codigoInterno}
              mes={mes}
              anio={anio}
              onSuccess={onSuccess}
            />
          ) : (
            <Badge
              variant="outline"
              className="bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border-border text-xs px-1 py-0"
            >
              ✓ <span className="hidden sm:inline">Actualizado</span>
            </Badge>
          )}
        </div>
      );
    },
    size: 100,
    enableSorting: false
  }
];
