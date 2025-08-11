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
      const periodo = row.getValue('periodo');
      return <div className='font-medium'>{periodo as string}</div>;
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
      const fecha = row.getValue('fechaLectura');
      return <div>{fecha as string}</div>;
    },
    enableSorting: true,
  },
  {
    accessorKey: 'lecturaAnterior',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Lectura Anterior' />
    ),
    cell: ({ row }) => {
      const lectura = row.getValue('lecturaAnterior');
      return <div className='text-left'>{lectura?.toLocaleString()}</div>;
    },
    enableSorting: true,
  },
  {
    accessorKey: 'lecturaActual',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Lectura Actual' />
    ),
    cell: ({ row }) => {
      const lectura = row.getValue('lecturaActual');
      return (
        <div className='text-left font-medium'>{lectura?.toLocaleString()}</div>
      );
    },
    enableSorting: true,
  },
  {
    accessorKey: 'consumoPeriodo',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Consumo' />
    ),
    cell: ({ row }) => {
      const consumo = row.getValue('consumoPeriodo');
      return <div className='text-left'>{consumo?.toLocaleString()} kWh</div>;
    },
    enableSorting: true,
  },
  {
    accessorKey: 'energiaBase',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Energía Base' />
    ),
    cell: ({ row }) => {
      const energia = row.getValue('energiaBase');
      return <div className='text-left'>{energia?.toLocaleString()} kWh</div>;
    },
    enableSorting: true,
  },
  {
    accessorKey: 'sobreconsumo',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Sobreconsumo' />
    ),
    cell: ({ row }) => {
      const sobreconsumo = row.getValue('sobreconsumo');
      return (
        <div
          className={`text-left ${(sobreconsumo as number) > 0 ? 'text-amber-600 font-medium' : ''}`}
        >
          {sobreconsumo?.toLocaleString()} kWh
        </div>
      );
    },
    enableSorting: true,
  },
];
