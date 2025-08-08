import type { ColumnDef } from '@tanstack/react-table';

import { DataTableColumnHeader } from '~/components/data-table/data-table-column-header';
import type { DetalleLecturas } from '~/types/reportes';

export const lecturasTableColumns: ColumnDef<DetalleLecturas>[] = [
  {
    accessorKey: 'periodo',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Período' />
    ),
    cell: ({ row }) => {
      const periodo = row.getValue('periodo') as string;
      return <div className='font-medium'>{periodo}</div>;
    },
    enableSorting: true,
    enableHiding: false,
  },
  {
    accessorKey: 'fechaLectura',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Fecha Lectura' />
    ),
    cell: ({ row }) => {
      const fecha = row.getValue('fechaLectura') as string;
      return (
        <div>{new Date(fecha).toLocaleDateString('es-CL')}</div>
      );
    },
    enableSorting: true,
  },
  {
    accessorKey: 'lecturaAnterior',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Lectura Anterior' />
    ),
    cell: ({ row }) => {
      const lectura = row.getValue('lecturaAnterior') as number;
      return <div className='text-right'>{lectura?.toLocaleString('es-CL')}</div>;
    },
    enableSorting: true,
  },
  {
    accessorKey: 'lecturaActual',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Lectura Actual' />
    ),
    cell: ({ row }) => {
      const lectura = row.getValue('lecturaActual') as number;
      return <div className='text-right font-medium'>{lectura?.toLocaleString('es-CL')}</div>;
    },
    enableSorting: true,
  },
  {
    accessorKey: 'consumoPeriodo',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Consumo' />
    ),
    cell: ({ row }) => {
      const consumo = row.getValue('consumoPeriodo') as number;
      return <div className='text-right'>{consumo?.toLocaleString('es-CL')} kWh</div>;
    },
    enableSorting: true,
  },
  {
    accessorKey: 'energiaBase',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Energía Base' />
    ),
    cell: ({ row }) => {
      const energia = row.getValue('energiaBase') as number;
      return <div className='text-right'>{energia?.toLocaleString('es-CL')} kWh</div>;
    },
    enableSorting: true,
  },
  {
    accessorKey: 'sobreconsumo',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Sobreconsumo' />
    ),
    cell: ({ row }) => {
      const sobreconsumo = row.getValue('sobreconsumo') as number;
      return (
        <div className={`text-right ${sobreconsumo > 0 ? 'text-amber-600 font-medium' : ''}`}>
          {sobreconsumo?.toLocaleString('es-CL')} kWh
        </div>
      );
    },
    enableSorting: true,
  },
];