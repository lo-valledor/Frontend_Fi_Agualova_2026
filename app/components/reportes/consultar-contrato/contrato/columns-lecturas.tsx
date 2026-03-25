import { AlertTriangle } from 'lucide-react';

import type { ColumnDef } from '@tanstack/react-table';

import { DataTableColumnHeader } from '~/components/data-table/data-table-column-header';
import { Badge } from '~/components/ui/badge';
import type { DetalleLecturas } from '~/types/reportes';

export const lecturasTableColumns: ColumnDef<DetalleLecturas>[] = [
  {
    accessorKey: 'periodo',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Período' />
    ),
    cell: ({ row }) => {
      const periodo = row.getValue('periodo');
      return (
        <div className='font-medium text-slate-900 dark:text-slate-100'>
          {periodo as string}
        </div>
      );
    },
    enableSorting: true,
    enableHiding: false,
    minSize: 100
  },
  {
    accessorKey: 'fechaLectura',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Fecha Lectura' />
    ),
    cell: ({ row }) => {
      const fecha = row.getValue('fechaLectura') as string;
      const sinLectura = !fecha || fecha === '-';

      return (
        <div
          className={`text-sm ${sinLectura ? 'text-slate-400 dark:text-slate-600 italic' : 'text-slate-600 dark:text-slate-400'}`}
        >
          {sinLectura ? 'Sin lectura' : fecha}
        </div>
      );
    },
    enableSorting: true,
    minSize: 130
  },
  {
    accessorKey: 'lecturaAnterior',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Lectura Anterior' />
    ),
    cell: ({ row }) => {
      const lectura = row.getValue('lecturaAnterior') as number | null;

      if (lectura == null) {
        return (
          <div className='text-start text-slate-400 dark:text-slate-600 italic text-sm'>
            -
          </div>
        );
      }

      return (
        <div className='text-start text-slate-600 dark:text-slate-400 font-mono text-sm'>
          {lectura.toLocaleString('es-CL')}
        </div>
      );
    },
    enableSorting: true,
    minSize: 120
  },
  {
    accessorKey: 'lecturaActual',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Lectura Actual' />
    ),
    cell: ({ row }) => {
      const lectura = row.getValue('lecturaActual') as number | null;

      if (lectura == null) {
        return (
          <div className='text-start text-amber-600 dark:text-amber-500 italic text-sm font-medium'>
            Pendiente
          </div>
        );
      }

      return (
        <div className='text-start font-medium text-blue-700 dark:text-blue-400 font-mono'>
          {lectura.toLocaleString('es-CL')}
        </div>
      );
    },
    enableSorting: true,
    minSize: 120
  },
  {
    accessorKey: 'consumoPeriodo',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Consumo' />
    ),
    cell: ({ row }) => {
      const consumo = row.getValue('consumoPeriodo') as number | null;

      // Si no hay consumo registrado
      if (consumo == null || consumo === 0) {
        return (
          <div className='text-start text-slate-400 dark:text-slate-600 italic'>
            Sin consumo
          </div>
        );
      }

      return (
        <div className='text-start text-slate-700 dark:text-slate-300'>
          <span className='font-bold'>{consumo.toLocaleString('es-CL')}</span>{' '}
          kWh
        </div>
      );
    },
    enableSorting: true,
    minSize: 140
  },
  {
    accessorKey: 'energiaBase',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Energía Base' />
    ),
    cell: ({ row }) => {
      const energia = row.getValue('energiaBase') as number | null;

      if (energia == null) {
        return (
          <div className='text-start text-slate-400 dark:text-slate-600'>-</div>
        );
      }

      return (
        <div className='text-start text-emerald-600 dark:text-emerald-400'>
          {energia.toLocaleString('es-CL')} kWh
        </div>
      );
    },
    enableSorting: true,
    minSize: 120
  },
  {
    accessorKey: 'sobreconsumo',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Sobreconsumo' />
    ),
    cell: ({ row }) => {
      const sobreconsumo = row.getValue('sobreconsumo') as number | null;

      // Si es null o no definido
      if (sobreconsumo == null) {
        return (
          <div className='text-start text-slate-400 dark:text-slate-600'>-</div>
        );
      }

      const hasSobreconsumo = sobreconsumo > 0;

      if (!hasSobreconsumo) {
        return (
          <div className='text-start text-slate-400 dark:text-slate-600'>
            0 kWh
          </div>
        );
      }

      // Determinar severidad del sobreconsumo
      const consumoTotal = row.getValue('consumoPeriodo') as number;
      const porcentajeSobreconsumo = (sobreconsumo / consumoTotal) * 100;

      let badge = null;
      if (porcentajeSobreconsumo > 30) {
        badge = (
          <Badge variant='destructive' className='ml-1 text-xs'>
            <AlertTriangle className='h-2 w-2 mr-1' />
            Alto
          </Badge>
        );
      } else if (porcentajeSobreconsumo > 15) {
        badge = (
          <Badge
            variant='default'
            className='ml-1 text-xs bg-amber-500 hover:bg-amber-600'
          >
            Medio
          </Badge>
        );
      }

      return (
        <div className='text-start'>
          <span className='text-amber-700 dark:text-amber-400 font-bold'>
            {sobreconsumo.toLocaleString('es-CL')} kWh
          </span>
          {badge}
        </div>
      );
    },
    enableSorting: true,
    minSize: 150
  }
];
