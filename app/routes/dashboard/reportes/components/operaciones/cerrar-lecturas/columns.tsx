import { type ColumnDef } from '@tanstack/react-table';
import {
  AlertCircle,
  AlertTriangle,
  Ban,
  CheckCircle,
  ClipboardList,
  Shield,
  TrendingUp,
  Zap
} from 'lucide-react';

import { Badge } from '~/components/ui/badge';
import { Checkbox } from '~/components/ui/checkbox';
import { cn } from '~/lib/utils';
import { type EstadoCierreLecturas } from '~/types/operaciones';

export const columns: ColumnDef<EstadoCierreLecturas>[] = [
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
          disabled={false}
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
          disabled={
            (row.original.cantidadLecturasOK === 0 &&
              row.original.cantidadClaveRoja === 0 &&
              row.original.cantidadClaveNaranja === 0 &&
              row.original.cantidadCorregidas === 0) ||
            row.original.cantidadClaveRoja > 0 // Bloquear filas con claves críticas
          }
        />
      </div>
    ),
    enableSorting: false,
    enableHiding: false,
    size: 50
  },
  {
    id: 'nichoDescripcion',
    header: () => (
      <div className="flex items-center gap-1 sm:gap-2 font-semibold text-xs sm:text-sm">
        <ClipboardList className="w-3 h-3 sm:w-4 sm:h-4 text-sky-500" />
        <span className="hidden md:inline">Descripción del Nicho</span>
        <span className="md:hidden">Descripción</span>
      </div>
    ),
    accessorKey: 'nichoDescripcion',
    cell: ({ row }) => {
      const nicho = row.original.nichoDescripcion;
      const hasCritical = row.original.cantidadClaveRoja > 0;
      const hasWarning = row.original.cantidadClaveNaranja > 0;
      const isBlocked = hasCritical;

      return (
        <div className={cn('font-medium', isBlocked && 'opacity-60')}>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <div
                className={cn(
                  'w-2 h-2 rounded-full shrink-0',
                  hasCritical
                    ? 'bg-red-500 animate-pulse'
                    : hasWarning
                      ? 'bg-orange-500'
                      : 'bg-green-500'
                )}
              />
              {isBlocked && (
                <span title="Cierre bloqueado por claves críticas">
                  <Ban className="w-3 h-3 text-red-500" />
                </span>
              )}
            </div>
            <span className="truncate">{nicho}</span>
          </div>
          {isBlocked && (
            <div className="text-xs text-red-600 dark:text-red-400 mt-1">
              Bloqueado - {row.original.cantidadClaveRoja} críticas
            </div>
          )}
        </div>
      );
    },
    size: 200
  },
  {
    id: 'cantidadSinLectura',
    header: () => (
      <div className="flex items-center justify-center gap-1 sm:gap-2 font-semibold text-xs sm:text-sm">
        <Ban className="w-3 h-3 sm:w-4 sm:h-4 text-gray-500" />
        <span className="hidden sm:inline">Sin Lectura</span>
        <span className="sm:hidden">Sin</span>
      </div>
    ),
    accessorKey: 'cantidadSinLectura',
    cell: ({ row }) => {
      const cantidadSinLectura = row.original.cantidadSinLectura;
      return (
        <div className="text-center">
          <Badge
            variant="outline"
            className={cn(
              'font-bold border-2 text-base px-3 py-1.5 min-w-[60px]',
              cantidadSinLectura === 0
                ? 'bg-green-50 text-green-800 border-green-300 dark:bg-green-900/30 dark:text-green-300 dark:border-green-700'
                : 'bg-amber-50 text-amber-800 border-amber-300 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-700'
            )}
          >
            {cantidadSinLectura === 0 && (
              <CheckCircle className="w-4 h-4 mr-1.5" />
            )}
            {cantidadSinLectura > 0 && <Ban className="w-4 h-4 mr-1.5" />}
            {cantidadSinLectura}
          </Badge>
        </div>
      );
    },
    size: 100
  },
  {
    id: 'cantidadLecturasOK',
    header: () => (
      <div className="flex items-center justify-center gap-1 sm:gap-2 font-semibold text-xs sm:text-sm">
        <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-green-500" />
        <span className="hidden sm:inline">Lecturas OK</span>
        <span className="sm:hidden">OK</span>
      </div>
    ),
    accessorKey: 'cantidadLecturasOK',
    cell: ({ row }) => {
      const cantidadLecturasOK = row.original.cantidadLecturasOK;
      return (
        <div className="text-center">
          <Badge
            variant="outline"
            className="font-bold bg-green-50 text-green-800 border-green-300 dark:bg-green-900/30 dark:text-green-300 dark:border-green-700 border-2 text-base px-3 py-1.5 min-w-[60px]"
          >
            <TrendingUp className="w-4 h-4 mr-1.5" />
            {cantidadLecturasOK}
          </Badge>
        </div>
      );
    },
    size: 100
  },
  {
    id: 'cantidadClaveRoja',
    header: () => (
      <div className="flex items-center justify-center gap-1 sm:gap-2 font-semibold text-xs sm:text-sm">
        <AlertCircle className="w-3 h-3 sm:w-4 sm:h-4 text-red-500" />
        <span className="hidden sm:inline">Clave Crítica</span>
        <span className="sm:hidden">Crítica</span>
      </div>
    ),
    accessorKey: 'cantidadClaveRoja',
    cell: ({ row }) => {
      const cantidadClaveRoja = row.original.cantidadClaveRoja;
      return (
        <div className="text-center">
          <Badge
            variant="outline"
            className={cn(
              'font-bold border-2 text-base px-3 py-1.5 min-w-[60px]',
              cantidadClaveRoja === 0
                ? 'bg-slate-50 text-slate-800 border-border dark:text-slate-300 dark:border-slate-700'
                : 'bg-red-50 text-red-800 border-red-300 dark:bg-red-900/30 dark:text-red-300 dark:border-red-700 animate-pulse'
            )}
          >
            {cantidadClaveRoja > 0 && (
              <AlertCircle className="w-4 h-4 mr-1.5" />
            )}
            {cantidadClaveRoja === 0 && <Shield className="w-4 h-4 mr-1.5" />}
            {cantidadClaveRoja}
          </Badge>
        </div>
      );
    },
    size: 120
  },
  {
    id: 'cantidadClaveNaranja',
    header: () => (
      <div className="flex items-center justify-center gap-1 sm:gap-2 font-semibold text-xs sm:text-sm">
        <AlertTriangle className="w-3 h-3 sm:w-4 sm:h-4 text-orange-500" />
        <span className="hidden sm:inline">Clave Alerta</span>
        <span className="sm:hidden">Alerta</span>
      </div>
    ),
    accessorKey: 'cantidadClaveNaranja',
    cell: ({ row }) => {
      const cantidadClaveNaranja = row.original.cantidadClaveNaranja;
      return (
        <div className="text-center">
          <Badge
            variant="outline"
            className={cn(
              'font-bold border-2 text-base px-3 py-1.5 min-w-[60px]',
              cantidadClaveNaranja === 0
                ? 'bg-slate-50 text-slate-800 border-border dark:text-slate-300 dark:border-slate-700'
                : 'bg-orange-50 text-orange-800 border-orange-300 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-700'
            )}
          >
            {cantidadClaveNaranja > 0 && (
              <AlertTriangle className="w-4 h-4 mr-1.5" />
            )}
            {cantidadClaveNaranja === 0 && (
              <Shield className="w-4 h-4 mr-1.5" />
            )}
            {cantidadClaveNaranja}
          </Badge>
        </div>
      );
    },
    size: 120
  },
  {
    id: 'cantidadCorregidas',
    header: () => (
      <div className="flex items-center justify-center gap-1 sm:gap-2 font-semibold text-xs sm:text-sm">
        <Zap className="w-3 h-3 sm:w-4 sm:h-4 text-purple-500" />
        <span className="hidden sm:inline">Corregidas</span>
        <span className="sm:hidden">Correg</span>
      </div>
    ),
    accessorKey: 'cantidadCorregidas',
    cell: ({ row }) => {
      const cantidadCorregidas = row.original.cantidadCorregidas;
      return (
        <div className="text-center">
          <Badge
            variant="outline"
            className={cn(
              'font-bold border-2 text-base px-3 py-1.5 min-w-[60px]',
              cantidadCorregidas === 0
                ? 'bg-slate-50 text-slate-800 border-border dark:text-slate-300 dark:border-slate-700'
                : 'bg-purple-50 text-purple-800 border-purple-300 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-700'
            )}
          >
            {cantidadCorregidas > 0 && <Zap className="w-4 h-4 mr-1.5" />}
            {cantidadCorregidas === 0 && <Shield className="w-4 h-4 mr-1.5" />}
            {cantidadCorregidas}
          </Badge>
        </div>
      );
    },
    size: 110
  }
];
