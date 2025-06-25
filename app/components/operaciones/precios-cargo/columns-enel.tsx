import type { ColumnDef } from '@tanstack/react-table';
import { Badge } from '~/components/ui/badge';
import DialogAgregarPrecios from './dialog-agregar-precios';
import type { PreciosCargoEnel } from '~/types/operaciones';
import { DataTableColumnHeader } from '~/components/data-table/data-table-column-header';

export const columns = (
  mes: string,
  anio: string,
  onSuccess: () => void,
): ColumnDef<PreciosCargoEnel>[] => [
  {
    accessorKey: 'codigo',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Código"
        className="text-slate-700 dark:text-slate-300 font-semibold"
      />
    ),
    cell: ({ row }) => (
      <div className="font-mono text-sm font-medium text-slate-900 dark:text-slate-100">
        {row.getValue('codigo')}
      </div>
    ),
    size: 120,
  },
  {
    accessorKey: 'codigoener',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Código Enerlova"
        className="text-slate-700 dark:text-slate-300 font-semibold"
      />
    ),
    cell: ({ row }) => (
      <div className="font-mono text-sm text-slate-700 dark:text-slate-400">
        {row.getValue('codigoener')}
      </div>
    ),
    size: 140,
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
      <div className="text-sm text-slate-900 dark:text-slate-100 max-w-xs truncate">
        {row.getValue('descripcion')}
      </div>
    ),
    size: 250,
  },
  {
    accessorKey: 'valor',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Valor Anterior 1"
        className="text-orange-700 dark:text-orange-300 font-semibold"
      />
    ),
    cell: ({ row }) => (
      <div className="text-sm font-mono text-orange-600 dark:text-orange-400">
        {row.getValue('valor')}
      </div>
    ),
    size: 140,
  },
  {
    accessorKey: 'valor2',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Valor Anterior 2"
        className="text-orange-700 dark:text-orange-300 font-semibold"
      />
    ),
    cell: ({ row }) => (
      <div className="text-sm font-mono text-orange-600 dark:text-orange-400">
        {row.getValue('valor2')}
      </div>
    ),
    size: 140,
  },
  {
    accessorKey: 'valor3',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Valor Anterior 3"
        className="text-orange-700 dark:text-orange-300 font-semibold"
      />
    ),
    cell: ({ row }) => (
      <div className="text-sm font-mono text-orange-600 dark:text-orange-400">
        {row.getValue('valor3')}
      </div>
    ),
    size: 140,
  },
  {
    accessorKey: 'valoractual',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Valor Actual 1"
        className="text-green-700 dark:text-green-300 font-semibold"
      />
    ),
    cell: ({ row }) => {
      const value = row.getValue('valoractual') as string;
      const isNoValue = value === 'Sin Valor';
      return (
        <div
          className={`text-sm font-mono ${
            isNoValue
              ? 'text-red-600 dark:text-red-400'
              : 'text-green-600 dark:text-green-400'
          }`}
        >
          {value}
        </div>
      );
    },
    size: 140,
  },
  {
    accessorKey: 'valoractual2',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Valor Actual 2"
        className="text-green-700 dark:text-green-300 font-semibold"
      />
    ),
    cell: ({ row }) => {
      const value = row.getValue('valoractual2') as string;
      const isNoValue = value === 'Sin Valor';
      return (
        <div
          className={`text-sm font-mono ${
            isNoValue
              ? 'text-red-600 dark:text-red-400'
              : 'text-green-600 dark:text-green-400'
          }`}
        >
          {value}
        </div>
      );
    },
    size: 140,
  },
  {
    accessorKey: 'valoractual3',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Valor Actual 3"
        className="text-green-700 dark:text-green-300 font-semibold"
      />
    ),
    cell: ({ row }) => {
      const value = row.getValue('valoractual3') as string;
      const isNoValue = value === 'Sin Valor';
      return (
        <div
          className={`text-sm font-mono ${
            isNoValue
              ? 'text-red-600 dark:text-red-400'
              : 'text-green-600 dark:text-green-400'
          }`}
        >
          {value}
        </div>
      );
    },
    size: 140,
  },
  {
    id: 'actions',
    header: () => (
      <div className="text-center text-slate-700 dark:text-slate-300 font-semibold">
        Estado
      </div>
    ),
    cell: ({ row }) => {
      const { valoractual, valoractual2, valoractual3, codigo } = row.original;
      const hasNoValues =
        valoractual === 'Sin Valor' ||
        valoractual2 === 'Sin Valor' ||
        valoractual3 === 'Sin Valor';

      return (
        <div className="flex justify-center">
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
              variant="outline"
              className="bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800"
            >
              ✓ Actualizado
            </Badge>
          )}
        </div>
      );
    },
    size: 140,
    enableSorting: false,
  },
];
