import type { ColumnDef } from '@tanstack/react-table';
import DetallePreciosEnerlova from './detalle-precios-enerlova';
import type { PreciosCargoEnerlova } from '~/types/operaciones';
import { DataTableColumnHeader } from '~/components/data-table/data-table-column-header';
import { Hash, Code, FileText, DollarSign, Clock } from 'lucide-react';

export const columns: ColumnDef<PreciosCargoEnerlova>[] = [
  {
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title={
          <div className="flex items-center gap-2">
            <Hash className="w-4 h-4 text-emerald-500" />
            <span>ID</span>
          </div>
        }
        className="text-emerald-700 dark:text-emerald-300 font-semibold"
      />
    ),
    accessorKey: 'CD_ID',
    cell: ({ row }) => (
      <div className="font-mono text-sm font-medium text-emerald-600 dark:text-emerald-400">
        {row.getValue('CD_ID')}
      </div>
    ),
    size: 80,
  },
  {
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title={
          <div className="flex items-center gap-2">
            <Code className="w-4 h-4 text-blue-500" />
            <span>Código Enerlova</span>
          </div>
        }
        className="text-blue-700 dark:text-blue-300 font-semibold"
      />
    ),
    accessorKey: 'cd_codigoenerlova',
    cell: ({ row }) => (
      <div className="font-mono text-sm text-blue-600 dark:text-blue-400">
        {row.getValue('cd_codigoenerlova')}
      </div>
    ),
    size: 150,
  },
  {
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title={
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-slate-500" />
            <span>Descripción</span>
          </div>
        }
        className="text-slate-700 dark:text-slate-300 font-semibold"
      />
    ),
    accessorKey: 'CD_Descripcion',
    cell: ({ row }) => (
      <div className="text-sm text-slate-900 dark:text-slate-100 max-w-sm">
        {row.getValue('CD_Descripcion')}
      </div>
    ),
    size: 300,
  },
  {
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title={
          <div className="flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-green-500" />
            <span>Valor</span>
          </div>
        }
        className="text-green-700 dark:text-green-300 font-semibold"
      />
    ),
    accessorKey: 'valor',
    cell: ({ row }) => (
      <div className="text-sm font-mono font-medium text-green-600 dark:text-green-400">
        {row.getValue('valor')}
      </div>
    ),
    size: 120,
  },
  {
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title={
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-orange-500" />
            <span>Días Restantes</span>
          </div>
        }
        className="text-orange-700 dark:text-orange-300 font-semibold"
      />
    ),
    accessorKey: 'dias',
    cell: ({ row }) => {
      const dias = row.getValue('dias') as number;
      const isUrgent = dias <= 7;
      const isWarning = dias <= 30 && dias > 7;

      return (
        <div
          className={`text-sm font-medium ${
            isUrgent
              ? 'text-red-600 dark:text-red-400'
              : isWarning
                ? 'text-orange-600 dark:text-orange-400'
                : 'text-green-600 dark:text-green-400'
          }`}
        >
          {dias} días
        </div>
      );
    },
    size: 120,
  },
  {
    id: 'actions',
    header: () => (
      <div className="text-center text-slate-700 dark:text-slate-300 font-semibold">
        Detalles
      </div>
    ),
    cell: ({ row }) => {
      const data = row.original;
      return (
        <div className="flex justify-center">
          <DetallePreciosEnerlova codigo={data.CD_ID} />
        </div>
      );
    },
    size: 100,
    enableSorting: false,
  },
];
