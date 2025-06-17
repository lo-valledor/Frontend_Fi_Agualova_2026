import type { ColumnDef } from '@tanstack/react-table';
import {
  FileText,
  Building,
  Calculator,
  DollarSign,
  CheckCircle,
} from 'lucide-react';
import { DataTableColumnHeader } from '~/components/data-table/data-table-column-header';
import { Badge } from '~/components/ui/badge';
import type { GetCondicionesContrato } from '~/types/administracion';

export const columns: ColumnDef<GetCondicionesContrato>[] = [
  {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Descripción" />
    ),
    accessorKey: 'descripcion',
    cell: ({ row }) => {
      const descripcion = row.getValue('descripcion') as string;
      return (
        <div className="flex items-center gap-2 max-w-[250px]">
          <div className="p-1.5 bg-sky-100 dark:bg-sky-900/30 rounded-md">
            <FileText className="h-3 w-3 text-sky-600 dark:text-sky-400" />
          </div>
          <span
            className="text-sm font-medium text-slate-700 dark:text-slate-300 truncate"
            title={descripcion}
          >
            {descripcion}
          </span>
        </div>
      );
    },
  },
  {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Concepto" />
    ),
    accessorKey: 'concepto',
    cell: ({ row }) => {
      const concepto = row.getValue('concepto') as string;
      return (
        <div className="flex items-center gap-2 max-w-[200px]">
          <div className="p-1.5 bg-amber-100 dark:bg-amber-900/30 rounded-md">
            <Building className="h-3 w-3 text-amber-600 dark:text-amber-400" />
          </div>
          <span
            className="text-sm font-medium text-slate-700 dark:text-slate-300 truncate"
            title={concepto}
          >
            {concepto}
          </span>
        </div>
      );
    },
  },
  {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Factor Porcentual" />
    ),
    accessorKey: 'factorPorcentual',
    cell: ({ row }) => {
      const factorPorcentual = row.getValue('factorPorcentual') as string;
      return (
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-purple-100 dark:bg-purple-900/30 rounded-md">
            <Calculator className="h-3 w-3 text-purple-600 dark:text-purple-400" />
          </div>
          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
            {factorPorcentual}%
          </span>
        </div>
      );
    },
  },
  {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Valor Fijo" />
    ),
    accessorKey: 'valorFijo',
    cell: ({ row }) => {
      const valorFijo = row.getValue('valorFijo') as number | null;

      if (valorFijo === null) {
        return (
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-slate-100 dark:bg-slate-900/30 rounded-md">
              <DollarSign className="h-3 w-3 text-slate-400" />
            </div>
            <span className="text-sm text-slate-500 dark:text-slate-400 italic">
              Sin valor
            </span>
          </div>
        );
      }

      return (
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-emerald-100 dark:bg-emerald-900/30 rounded-md">
            <DollarSign className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
          </div>
          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
            ${valorFijo.toLocaleString('es-CL')}
          </span>
        </div>
      );
    },
  },
  {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Estado" />
    ),
    accessorKey: 'estado',
    cell: ({ row }) => {
      const estado = row.getValue('estado') as boolean;
      return (
        <div className="flex items-center gap-2">
          <Badge
            variant={estado ? 'default' : 'secondary'}
            className={`text-xs font-medium ${
              estado
                ? 'bg-emerald-100 text-emerald-800 border-emerald-200 hover:bg-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-300 dark:border-emerald-800'
                : 'bg-rose-100 text-rose-800 border-rose-200 hover:bg-rose-200 dark:bg-rose-900/20 dark:text-rose-300 dark:border-rose-800'
            }`}
          >
            <div
              className={`w-2 h-2 rounded-full mr-1.5 ${
                estado ? 'bg-emerald-500' : 'bg-rose-500'
              }`}
            />
            {estado ? 'Activo' : 'Inactivo'}
          </Badge>
        </div>
      );
    },
  },
];
