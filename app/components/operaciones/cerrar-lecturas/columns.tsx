import type { ColumnDef } from '@tanstack/react-table';
import { ServerIcon, UsersIcon } from 'lucide-react';

import { Badge } from '~/components/ui/badge';
import { Checkbox } from '~/components/ui/checkbox';
import type { CerrarLecturasBuscarEstadisticasRequest } from '~/types/operaciones';

interface StatBadgeProps {
  value: number;
  variant: 'ok' | 'corregida' | 'naranja' | 'roja' | 'sinLectura';
}

function StatBadge({ value, variant }: StatBadgeProps) {
  if (!value) return null;
  const styles: Record<StatBadgeProps['variant'], string> = {
    ok: 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300',
    corregida:
      'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300',
    naranja:
      'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/30 dark:text-orange-300',
    roja: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300',
    sinLectura:
      'bg-slate-100 text-slate-800 border-slate-200 dark:bg-slate-900/30 dark:text-slate-300'
  };
  const labels: Record<StatBadgeProps['variant'], string> = {
    ok: 'OK',
    corregida: 'Correg.',
    naranja: 'Clave Naranja',
    roja: 'Clave Roja',
    sinLectura: 'Sin lectura'
  };
  return (
    <Badge
      variant="outline"
      title={labels[variant]}
      className={`${styles[variant]} font-mono text-[10px] sm:text-xs`}
    >
      {value}
    </Badge>
  );
}

export const columns: ColumnDef<CerrarLecturasBuscarEstadisticasRequest>[] = [
  {
    id: 'select',
    enableSorting: false,
    enableHiding: false,
    header: ({ table }) => (
      <div className="flex justify-center">
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && 'indeterminate')
          }
          onCheckedChange={value => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Seleccionar todos"
        />
      </div>
    ),
    cell: ({ row }) => (
      <div className="flex justify-center">
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={value => row.toggleSelected(!!value)}
          aria-label={`Seleccionar nicho ${row.original.idNicho}`}
        />
      </div>
    ),
    minSize: 40,
    maxSize: 50
  },
  {
    id: 'idNicho',
    accessorKey: 'idNicho',
    header: 'Nicho',
    cell: ({ row }) => (
      <Badge variant="outline" className="font-mono text-xs">
        #{row.original.idNicho}
      </Badge>
    ),
    minSize: 90,
    maxSize: 110
  },
  {
    accessorKey: 'nombreSector',
    header: 'Sector',
    cell: ({ row }) => (
      <div className="flex items-center gap-2 min-w-0">
        <ServerIcon className="w-3 h-3 sm:w-4 sm:h-4 text-muted-foreground shrink-0" />
        <span className="truncate text-sm">{row.original.nombreSector}</span>
      </div>
    ),
    minSize: 140,
    maxSize: 220
  },
  {
    accessorKey: 'nombreNicho',
    header: 'Nicho',
    cell: ({ row }) => (
      <span className="text-sm truncate">{row.original.nombreNicho}</span>
    ),
    minSize: 140,
    maxSize: 220
  },
  {
    id: 'cantidadTotal',
    accessorKey: 'cantidadTotal',
    header: () => (
      <div className="flex items-center justify-center gap-1 sm:gap-2">
        <UsersIcon className="w-3 h-3 sm:w-4 sm:h-4 text-muted-foreground" />
        <span>Total</span>
      </div>
    ),
    cell: ({ row }) => (
      <span className="font-mono font-semibold text-sm text-center block">
        {row.original.cantidadTotal}
      </span>
    ),
    minSize: 70,
    maxSize: 90
  },
  {
    id: 'cantidadOk',
    accessorKey: 'cantidadOk',
    header: 'OK',
    cell: ({ row }) => (
      <div className="flex justify-center">
        <StatBadge value={row.original.cantidadOk} variant="ok" />
      </div>
    ),
    minSize: 60,
    maxSize: 80
  },
  {
    id: 'cantidadCorregidas',
    accessorKey: 'cantidadCorregidas',
    header: 'Correg.',
    cell: ({ row }) => (
      <div className="flex justify-center">
        <StatBadge
          value={row.original.cantidadCorregidas}
          variant="corregida"
        />
      </div>
    ),
    minSize: 80,
    maxSize: 100
  },
  {
    id: 'cantidadClaveNaranja',
    accessorKey: 'cantidadClaveNaranja',
    header: 'Naranja',
    cell: ({ row }) => (
      <div className="flex justify-center">
        <StatBadge
          value={row.original.cantidadClaveNaranja}
          variant="naranja"
        />
      </div>
    ),
    minSize: 80,
    maxSize: 100
  },
  {
    id: 'cantidadClaveRoja',
    accessorKey: 'cantidadClaveRoja',
    header: 'Roja',
    cell: ({ row }) => (
      <div className="flex justify-center">
        <StatBadge value={row.original.cantidadClaveRoja} variant="roja" />
      </div>
    ),
    minSize: 70,
    maxSize: 90
  },
  {
    id: 'cantidadSinLectura',
    accessorKey: 'cantidadSinLectura',
    header: 'S/Lec',
    cell: ({ row }) => (
      <div className="flex justify-center">
        <StatBadge
          value={row.original.cantidadSinLectura}
          variant="sinLectura"
        />
      </div>
    ),
    minSize: 70,
    maxSize: 90
  }
];
