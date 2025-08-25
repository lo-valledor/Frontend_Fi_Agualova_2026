import { type ColumnDef } from '@tanstack/react-table';
import {
  AlertCircle,
  AlertTriangle,
  Ban,
  CheckCircle,
  ClipboardList,
  Hash,
  MapPin,
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
      <div className='flex items-center justify-center'>
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && 'indeterminate')
          }
          onCheckedChange={value => table.toggleAllPageRowsSelected(!!value)}
          aria-label='Seleccionar todo'
          className='translate-y-[2px]'
          disabled={false}
        />
      </div>
    ),
    cell: ({ row }) => (
      <div className='flex items-center justify-center'>
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={value => row.toggleSelected(!!value)}
          aria-label='Seleccionar fila'
          className='translate-y-[2px]'
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
    id: 'sectorId',
    header: () => (
      <div className='flex items-center justify-center gap-1 sm:gap-2 font-semibold text-xs sm:text-sm'>
        <MapPin className='w-3 h-3 sm:w-4 sm:h-4 text-blue-500' />
        <span className='hidden sm:inline'>Sector</span>
        <span className='sm:hidden'>Sect</span>
      </div>
    ),
    accessorKey: 'sectorId',
    cell: ({ row }) => {
      const sectorId = row.original.sectorId;
      return (
        <div className='text-center'>
          <Badge
            variant='outline'
            className='bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800 font-mono'
          >
            {sectorId}
          </Badge>
        </div>
      );
    },
    size: 80
  },
  {
    id: 'nichoId',
    header: () => (
      <div className='flex items-center justify-center gap-1 sm:gap-2 font-semibold text-xs sm:text-sm'>
        <Hash className='w-3 h-3 sm:w-4 sm:h-4 text-slate-500' />
        <span>ID</span>
      </div>
    ),
    accessorKey: 'nichoId',
    cell: ({ row }) => {
      const nichoId = row.original.nichoId;
      return (
        <div className='text-center'>
          <Badge
            variant='outline'
            className='bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-900/20 dark:text-slate-400 dark:border-slate-800 font-mono text-xs'
          >
            {nichoId}
          </Badge>
        </div>
      );
    },
    size: 80
  },
  {
    id: 'nichoDescripcion',
    header: () => (
      <div className='flex items-center gap-1 sm:gap-2 font-semibold text-xs sm:text-sm'>
        <ClipboardList className='w-3 h-3 sm:w-4 sm:h-4 text-sky-500' />
        <span className='hidden md:inline'>Descripción del Nicho</span>
        <span className='md:hidden'>Descripción</span>
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
          <div className='flex items-center gap-2'>
            <div className='flex items-center gap-1'>
              <div
                className={cn(
                  'w-2 h-2 rounded-full flex-shrink-0',
                  hasCritical
                    ? 'bg-red-500 animate-pulse'
                    : hasWarning
                      ? 'bg-orange-500'
                      : 'bg-green-500'
                )}
              />
              {isBlocked && (
                <span title='Cierre bloqueado por claves críticas'>
                  <Ban className='w-3 h-3 text-red-500' />
                </span>
              )}
            </div>
            <span className='truncate'>{nicho}</span>
          </div>
          {isBlocked && (
            <div className='text-xs text-red-600 dark:text-red-400 mt-1'>
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
      <div className='flex items-center justify-center gap-1 sm:gap-2 font-semibold text-xs sm:text-sm'>
        <Ban className='w-3 h-3 sm:w-4 sm:h-4 text-gray-500' />
        <span className='hidden sm:inline'>Sin Lectura</span>
        <span className='sm:hidden'>Sin</span>
      </div>
    ),
    accessorKey: 'cantidadSinLectura',
    cell: ({ row }) => {
      const cantidadSinLectura = row.original.cantidadSinLectura;
      return (
        <div className='text-center'>
          <Badge
            variant='outline'
            className={cn(
              'font-bold border-2',
              cantidadSinLectura === 0
                ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800'
                : 'bg-amber-50 text-amber-700 border-amber-300 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800'
            )}
          >
            {cantidadSinLectura === 0 && (
              <CheckCircle className='w-3 h-3 mr-1' />
            )}
            {cantidadSinLectura > 0 && <Ban className='w-3 h-3 mr-1' />}
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
      <div className='flex items-center justify-center gap-1 sm:gap-2 font-semibold text-xs sm:text-sm'>
        <CheckCircle className='w-3 h-3 sm:w-4 sm:h-4 text-green-500' />
        <span className='hidden sm:inline'>Lecturas OK</span>
        <span className='sm:hidden'>OK</span>
      </div>
    ),
    accessorKey: 'cantidadLecturasOK',
    cell: ({ row }) => {
      const cantidadLecturasOK = row.original.cantidadLecturasOK;
      return (
        <div className='text-center'>
          <Badge
            variant='outline'
            className='font-bold bg-green-50 text-green-700 border-green-300 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800 border-2'
          >
            <TrendingUp className='w-3 h-3 mr-1' />
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
      <div className='flex items-center justify-center gap-1 sm:gap-2 font-semibold text-xs sm:text-sm'>
        <AlertCircle className='w-3 h-3 sm:w-4 sm:h-4 text-red-500' />
        <span className='hidden sm:inline'>Clave Crítica</span>
        <span className='sm:hidden'>Crítica</span>
      </div>
    ),
    accessorKey: 'cantidadClaveRoja',
    cell: ({ row }) => {
      const cantidadClaveRoja = row.original.cantidadClaveRoja;
      return (
        <div className='text-center'>
          <Badge
            variant='outline'
            className={cn(
              'font-bold border-2',
              cantidadClaveRoja === 0
                ? 'bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-900/20 dark:text-slate-400 dark:border-slate-800'
                : 'bg-red-50 text-red-700 border-red-300 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800 animate-pulse'
            )}
          >
            {cantidadClaveRoja > 0 && <AlertCircle className='w-3 h-3 mr-1' />}
            {cantidadClaveRoja === 0 && <Shield className='w-3 h-3 mr-1' />}
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
      <div className='flex items-center justify-center gap-1 sm:gap-2 font-semibold text-xs sm:text-sm'>
        <AlertTriangle className='w-3 h-3 sm:w-4 sm:h-4 text-orange-500' />
        <span className='hidden sm:inline'>Clave Alerta</span>
        <span className='sm:hidden'>Alerta</span>
      </div>
    ),
    accessorKey: 'cantidadClaveNaranja',
    cell: ({ row }) => {
      const cantidadClaveNaranja = row.original.cantidadClaveNaranja;
      return (
        <div className='text-center'>
          <Badge
            variant='outline'
            className={cn(
              'font-bold border-2',
              cantidadClaveNaranja === 0
                ? 'bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-900/20 dark:text-slate-400 dark:border-slate-800'
                : 'bg-orange-50 text-orange-700 border-orange-300 dark:bg-orange-900/20 dark:text-orange-400 dark:border-orange-800'
            )}
          >
            {cantidadClaveNaranja > 0 && (
              <AlertTriangle className='w-3 h-3 mr-1' />
            )}
            {cantidadClaveNaranja === 0 && <Shield className='w-3 h-3 mr-1' />}
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
      <div className='flex items-center justify-center gap-1 sm:gap-2 font-semibold text-xs sm:text-sm'>
        <Zap className='w-3 h-3 sm:w-4 sm:h-4 text-purple-500' />
        <span className='hidden sm:inline'>Corregidas</span>
        <span className='sm:hidden'>Correg</span>
      </div>
    ),
    accessorKey: 'cantidadCorregidas',
    cell: ({ row }) => {
      const cantidadCorregidas = row.original.cantidadCorregidas;
      return (
        <div className='text-center'>
          <Badge
            variant='outline'
            className={cn(
              'font-bold border-2',
              cantidadCorregidas === 0
                ? 'bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-900/20 dark:text-slate-400 dark:border-slate-800'
                : 'bg-purple-50 text-purple-700 border-purple-300 dark:bg-purple-900/20 dark:text-purple-400 dark:border-purple-800'
            )}
          >
            {cantidadCorregidas > 0 && <Zap className='w-3 h-3 mr-1' />}
            {cantidadCorregidas === 0 && <Shield className='w-3 h-3 mr-1' />}
            {cantidadCorregidas}
          </Badge>
        </div>
      );
    },
    size: 110
  }
];
