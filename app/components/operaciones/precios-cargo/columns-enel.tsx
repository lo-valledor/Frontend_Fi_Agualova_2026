import type { ColumnDef } from '@tanstack/react-table';

import { DataTableColumnHeader } from '~/components/data-table/data-table-column-header';
import { Badge } from '~/components/ui/badge';
import type { PreciosConsultarRequest } from '~/types/operaciones';

import DialogAgregarPrecios from './dialog-agregar-precios';

const normalizarValorActual = (valor: string | number): number | null => {
  if (typeof valor === 'number') {
    return valor > 0 ? valor : null;
  }

  const valorNormalizado = valor.trim();
  if (!valorNormalizado || valorNormalizado.toLowerCase() === 'sin valor') {
    return null;
  }

  const numero = Number.parseFloat(valorNormalizado.replace(',', '.'));
  return Number.isFinite(numero) && numero > 0 ? numero : null;
};

const parsearValorMesAnterior = (valor: string): number | null => {
  if (!valor) return null;
  const trimmed = valor.trim();
  if (!trimmed || trimmed.toLowerCase() === 'sin valor') return null;

  const numero = Number.parseFloat(
    trimmed.replace(/\./g, '').replace(',', '.')
  );
  return Number.isFinite(numero) && numero > 0 ? numero : null;
};

export interface PrecioPendiente {
  codigo: number;
  valor: number;
  descripcion: string;
  codigoEnerlova: string;
}

interface ColumnsParams {
  onAgregarPendiente: (pendiente: PrecioPendiente) => void;
  onQuitarPendiente: (codigo: number) => void;
  pendientes: ReadonlyMap<number, PrecioPendiente>;
}

export const columns = ({
  onAgregarPendiente,
  onQuitarPendiente,
  pendientes
}: ColumnsParams): ColumnDef<PreciosConsultarRequest>[] => [
  {
    accessorKey: 'indice',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Índice"
        className="text-slate-700 dark:text-slate-300 font-semibold"
      />
    ),
    cell: ({ row }) => (
      <div className="font-mono text-xs sm:text-sm font-medium">
        {row.getValue('indice')}
      </div>
    )
  },
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
    )
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
    )
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
    )
  },
  {
    accessorKey: 'valorActual',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Valor Actual"
        className="text-green-700 dark:text-green-300 font-semibold justify-end"
      />
    ),
    cell: ({ row }) => {
      const rawValue = row.getValue('valorActual') as string | number;
      const value = normalizarValorActual(rawValue);
      const isNoValue = value === null;
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
    }
  },
  {
    accessorKey: 'confirmacion',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Confirmación"
        className="text-slate-700 dark:text-slate-300 font-semibold"
      />
    ),
    cell: ({ row }) => (
      <div className="font-mono text-xs sm:text-sm font-medium">
        {row.getValue('confirmacion')}
      </div>
    )
  },

  {
    id: 'actions',
    header: () => (
      <div className="text-center font-semibold text-xs sm:text-sm">Estado</div>
    ),
    cell: ({ row }) => {
      const { codigoInterno, valorActual, descripcion, codigoEnerlova } =
        row.original;
      const valorMesAnterior = row.original.valorMesAnterior;
      const hasNoValue = normalizarValorActual(valorActual) === null;
      const valorMesAnteriorNumero = parsearValorMesAnterior(valorMesAnterior);
      const pendiente = pendientes.get(codigoInterno);

      return (
        <div className="flex justify-center">
          {pendiente ? (
            <Badge
              variant="outline"
              className="bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800 text-xs px-1.5 py-0 gap-1"
            >
              <span className="font-mono">
                $
                {pendiente.valor.toLocaleString('es-CL', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2
                })}
              </span>
              <button
                type="button"
                onClick={() => onQuitarPendiente(codigoInterno)}
                className="ml-1 text-amber-700 dark:text-amber-300 hover:text-amber-900 dark:hover:text-amber-100"
                aria-label="Quitar de la cola"
                title="Quitar de la cola"
              >
                ×
              </button>
            </Badge>
          ) : hasNoValue ? (
            <DialogAgregarPrecios
              codigo={codigoInterno}
              descripcion={descripcion}
              valorAnterior={valorMesAnteriorNumero}
              onConfirm={valor =>
                onAgregarPendiente({
                  codigo: codigoInterno,
                  valor,
                  descripcion,
                  codigoEnerlova
                })
              }
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
    size: 140,
    enableSorting: false
  }
];
