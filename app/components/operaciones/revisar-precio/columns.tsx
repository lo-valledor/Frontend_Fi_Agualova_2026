import type { ColumnDef } from '@tanstack/react-table';
import { AlertTriangle, CheckCircle } from 'lucide-react';

import { DataTableColumnHeader } from '~/components/data-table/data-table-column-header';
import { Badge } from '~/components/ui/badge';
import { Checkbox } from '~/components/ui/checkbox';
import type { RevisionPreciosBuscarRequest } from '~/types/operaciones';

import DialogModificarPrecio from './dialog-modificar-precio';

type PrecioRevisado = RevisionPreciosBuscarRequest;

export const columns: ColumnDef<PrecioRevisado>[] = [
  {
    id: 'select',
    header: ({ table }) => (
      <div className="flex items-center justify-center">
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && 'indeterminate')
          }
          onCheckedChange={value => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Seleccionar todo"
          className="translate-y-[2px]"
        />
      </div>
    ),
    cell: ({ row }) => (
      <div className="flex items-center justify-center">
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={value => row.toggleSelected(!!value)}
          aria-label="Seleccionar fila"
          className="translate-y-[2px]"
          disabled={row.original.estaConfirmado || row.original.indice <= 0}
        />
      </div>
    ),
    enableSorting: false,
    enableHiding: false,
    size: 40
  },
  {
    accessorKey: 'codigoCargo',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Código"
        className="text-blue-700 dark:text-blue-300 font-semibold"
      />
    ),
    cell: ({ row }) => (
      <div className="font-mono text-xs font-medium">
        {row.getValue('codigoCargo')}
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
        className="text-purple-700 dark:text-purple-300 font-semibold"
      />
    ),
    cell: ({ row }) => (
      <div className="font-mono text-xs text-purple-600 dark:text-purple-400">
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
      <div className="text-xs max-w-xs truncate">
        {row.getValue('descripcion')}
      </div>
    ),
    size: 250
  },
  {
    accessorKey: 'valorActual',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Valor"
        className="text-green-700 dark:text-green-300 font-semibold"
      />
    ),
    cell: ({ row }) => {
      const raw = String(row.getValue('valorActual') ?? '');
      const limpio = raw.replace(/\./g, '').replace(',', '.');
      const numero = parseFloat(limpio);
      const formatted = Number.isNaN(numero)
        ? raw
        : numero.toLocaleString('es-CL', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
          });

      return (
        <div className="text-xs font-mono font-medium text-green-600 dark:text-green-400">
          {formatted}
        </div>
      );
    },
    size: 110
  },
  {
    accessorKey: 'estado',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Estado"
        className="text-slate-700 dark:text-slate-300 font-semibold"
      />
    ),
    cell: ({ row }) => (
      <div className="text-xs">{row.getValue('estado') || '-'}</div>
    ),
    size: 120
  },
  {
    id: 'confirmacion',
    header: () => (
      <div className="text-center text-xs font-semibold">Confirmación</div>
    ),
    cell: ({ row }) => {
      if (row.original.estaConfirmado) {
        return (
          <div className="flex items-center justify-center">
            <Badge className="bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border-border flex items-center gap-1 text-xs px-2 py-1">
              <CheckCircle className="w-3 h-3" />
              Confirmado
            </Badge>
          </div>
        );
      }

      if (row.original.indice <= 0) {
        return (
          <div className="flex items-center justify-center">
            <Badge className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800 flex items-center gap-1 text-xs px-2 py-1">
              <AlertTriangle className="w-3 h-3" />
              Inhabilitado
            </Badge>
          </div>
        );
      }

      return (
        <div className="flex items-center justify-center">
          <Badge
            variant="outline"
            className="bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800 flex items-center gap-1 text-xs px-2 py-1"
          >
            <AlertTriangle className="w-3 h-3" />
            Pendiente
          </Badge>
        </div>
      );
    },
    size: 140
  },
  {
    id: 'acciones',
    header: () => <div className="text-center font-semibold">Acciones</div>,
    cell: ({ row }) => {
      if (row.original.estaConfirmado) {
        return (
          <div className="flex items-center justify-center">
            <Badge className="bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border-border flex items-center gap-1">
              <CheckCircle className="w-3 h-3" />
              Confirmado
            </Badge>
          </div>
        );
      }

      if (row.original.indice <= 0) {
        return (
          <div className="flex items-center justify-center text-xs text-muted-foreground">
            N/D
          </div>
        );
      }

      return (
        <div className="flex items-center justify-center">
          <DialogModificarPrecio
            codigoCargo={row.original.codigoCargo}
            descripcion={row.original.descripcion}
            valorActual={String(row.original.valorActual ?? '')}
          />
        </div>
      );
    },
    enableSorting: false,
    size: 120
  }
];
