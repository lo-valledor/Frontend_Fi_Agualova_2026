import { type ColumnDef } from '@tanstack/react-table';
import { Calendar, Clock, Hash } from 'lucide-react';

import { DataTableColumnHeader } from '~/components/data-table/data-table-column-header';
import { Badge } from '~/components/ui/badge';
import { cn } from '~/lib/utils';
import { type Periodos } from '~/types/operaciones';

import CerrarPeriodo from './cerrar-periodo';

const parseFecha = (fecha: string): Date | null => {
  const [day, month, year] = fecha.split('-').map(Number);

  if (Number.isNaN(day) || Number.isNaN(month) || Number.isNaN(year)) {
    return null;
  }

  const parsedDate = new Date(year, month - 1, day);

  if (
    parsedDate.getDate() !== day ||
    parsedDate.getMonth() !== month - 1 ||
    parsedDate.getFullYear() !== year
  ) {
    return null;
  }

  return parsedDate;
};

// Función para formatear la fecha en formato ISO para ordenamiento
const formatDateForSorting = (fecha: string): string => {
  const parsedDate = parseFecha(fecha);
  if (!parsedDate) return '0000-00-00';
  return parsedDate.toISOString().split('T')[0];
};

const isPeriodoAbierto = (estado: string) =>
  estado.trim().toLowerCase() === 'abierto';

const canClosePeriodo = (periodo: Periodos, activePeriodoId?: string | null) =>
  isPeriodoAbierto(periodo.estado) &&
  (periodo.puedeCerrar || periodo.codigo === activePeriodoId);

interface GetColumnsOptions {
  activePeriodoId?: string | null;
  onCloseSuccess?: () => void;
}

export const getColumns = ({
  activePeriodoId,
  onCloseSuccess
}: GetColumnsOptions = {}): ColumnDef<Periodos>[] => [
  {
    accessorKey: 'codigo',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="ID" />
    ),
    cell: ({ row }) => {
      const periodo = row.original;
      return (
        <Badge variant="outline" className="text-xs font-mono px-1 py-0">
          {periodo.codigo}
        </Badge>
      );
    },
    size: 60
  },
  {
    accessorKey: 'descripcion',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Descripción" />
    ),
    cell: ({ row }) => {
      const descripcion = row.getValue('descripcion') as string;
      return (
        <div className="max-w-30 sm:max-w-50 truncate font-medium text-xs sm:text-sm">
          {descripcion}
        </div>
      );
    },
    size: 150
  },
  {
    accessorKey: 'fechaInicio',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Fecha Inicio" />
    ),
    cell: ({ row }) => {
      const periodo = row.original;
      const fechaInicio = parseFecha(periodo.fechaInicio);
      return (
        <div className="flex items-center gap-1">
          <Calendar className="h-3 w-3 text-slate-400 hidden sm:block" />
          <span className="text-xs sm:text-sm">
            {fechaInicio
              ? fechaInicio.toLocaleDateString('es-CL', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric'
                })
              : 'Fecha inválida'}
          </span>
        </div>
      );
    },
    sortingFn: (rowA, rowB) => {
      const fechaA = formatDateForSorting(rowA.original.fechaInicio);
      const fechaB = formatDateForSorting(rowB.original.fechaInicio);
      return fechaA.localeCompare(fechaB);
    },
    size: 140
  },
  {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Fecha Fin" />
    ),
    accessorKey: 'fechaFin',
    cell: ({ row }) => {
      const periodo = row.original;
      const fechaFin = parseFecha(periodo.fechaFin);
      return (
        <div className="flex items-center gap-1">
          <Clock className="h-3 w-3 text-slate-400 hidden sm:block" />
          <span className="text-xs sm:text-sm">
            {fechaFin
              ? fechaFin.toLocaleDateString('es-CL', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric'
                })
              : 'Fecha inválida'}
          </span>
        </div>
      );
    },
    sortingFn: (rowA, rowB) => {
      const fechaA = formatDateForSorting(rowA.original.fechaFin);
      const fechaB = formatDateForSorting(rowB.original.fechaFin);
      return fechaA.localeCompare(fechaB);
    },
    size: 140
  },
  {
    accessorKey: 'estado',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Estado" />
    ),
    cell: ({ row }) => {
      const periodo = row.original;

      const getEstadoConfig = (estado: string) => {
        switch (estado) {
          case 'Abierto':
            return {
              variant: 'default' as const,
              className:
                'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-300 dark:border-emerald-700'
            };
          case 'Cerrado':
            return {
              variant: 'destructive' as const,
              className:
                'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-700'
            };
          default:
            return {
              variant: 'outline' as const,
              className:
                'border-slate-200 text-slate-700 dark:border-slate-700 dark:text-slate-300'
            };
        }
      };

      const config = getEstadoConfig(periodo.estado);

      return (
        <div className="flex items-center gap-1">
          <Hash className="h-3 w-3 text-slate-400 hidden sm:block" />
          <Badge
            variant={config.variant}
            className={cn('text-xs font-medium px-1 py-0', config.className)}
          >
            {periodo.estado}
          </Badge>
        </div>
      );
    },
    size: 100
  },
  {
    id: 'acciones',
    header: () => <div className="text-right">Acciones</div>,
    cell: ({ row }) => {
      const periodo = row.original;
      const isClosable = canClosePeriodo(periodo, activePeriodoId);

      if (!isClosable) {
        return (
          <div className="flex justify-end">
            <Badge variant="outline" className="text-xs">
              No activo
            </Badge>
          </div>
        );
      }

      return (
        <div className="flex justify-end">
          <CerrarPeriodo
            periodoId={periodo.codigo}
            onSuccess={onCloseSuccess}
            className="w-auto min-w-24"
          />
        </div>
      );
    },
    enableSorting: false,
    size: 140
  }
];
