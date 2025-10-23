import { TrendingDown, TrendingUp, Minus } from 'lucide-react';

import type { ColumnDef } from '@tanstack/react-table';

import { DataTableColumnHeader } from '~/components/data-table/data-table-column-header';
import { Badge } from '~/components/ui/badge';
import type { DetalleFacturas } from '~/types/reportes';

export const facturasTableColumns: ColumnDef<DetalleFacturas>[] = [
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
    accessorKey: 'nroFactura',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Nro. Factura' />
    ),
    cell: ({ row }) => {
      const nroFactura = row.getValue('nroFactura');
      return (
        <Badge variant='outline' className='font-mono text-xs'>
          {nroFactura as string}
        </Badge>
      );
    },
    enableSorting: true,
    minSize: 120
  },
  {
    accessorKey: 'tarifa',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Tarifa' />
    ),
    cell: ({ row }) => {
      const tarifa = row.getValue('tarifa');
      return (
        <Badge variant='secondary' className='text-xs'>
          {tarifa as string}
        </Badge>
      );
    },
    enableSorting: true,
    minSize: 100
  },
  {
    accessorKey: 'fechaEmision',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='F. Emisión' />
    ),
    cell: ({ row }) => {
      const fecha = row.getValue('fechaEmision');
      return (
        <div className='text-sm text-slate-600 dark:text-slate-400'>
          {fecha as string}
        </div>
      );
    },
    enableSorting: true,
    minSize: 110
  },
  {
    accessorKey: 'fechaVencimiento',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='F. Vencimiento' />
    ),
    cell: ({ row }) => {
      const fecha = row.getValue('fechaVencimiento') as string;
      const fechaVencimiento = new Date(fecha);
      const hoy = new Date();
      const diasDiferencia = Math.ceil(
        (fechaVencimiento.getTime() - hoy.getTime()) / (1000 * 3600 * 24)
      );

      let colorClass = 'text-slate-600 dark:text-slate-400';
      if (diasDiferencia < 0) {
        colorClass = 'text-red-600 dark:text-red-400 font-medium';
      } else if (diasDiferencia <= 7) {
        colorClass = 'text-amber-600 dark:text-amber-400 font-medium';
      }

      return <div className={`text-sm ${colorClass}`}>{fecha}</div>;
    },
    enableSorting: true,
    minSize: 120
  },
  {
    accessorKey: 'valorNeto',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Valor Neto' />
    ),
    cell: ({ row }) => {
      const valor = row.getValue('valorNeto') as number;
      return (
        <div className='text-right font-medium text-cyan-700 dark:text-cyan-400'>
          ${valor?.toLocaleString('es-CL')}
        </div>
      );
    },
    enableSorting: true,
    minSize: 110
  },
  {
    accessorKey: 'iva',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='IVA' />
    ),
    cell: ({ row }) => {
      const iva = row.getValue('iva') as number;
      return (
        <div className='text-right text-slate-600 dark:text-slate-400'>
          ${iva?.toLocaleString('es-CL')}
        </div>
      );
    },
    enableSorting: true,
    minSize: 100
  },
  {
    accessorKey: 'valorTotal',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Total' />
    ),
    cell: ({ row }) => {
      const total = row.getValue('valorTotal') as number;
      return (
        <div className='text-right font-bold text-emerald-700 dark:text-emerald-400 text-base'>
          ${total?.toLocaleString('es-CL')}
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
      const consumo = row.getValue('consumoPeriodo') as number;
      const index = row.index;

      // Calcular si el consumo aumentó o disminuyó respecto al período anterior
      let icon = null;
      let colorClass = 'text-slate-700 dark:text-slate-300';

      if (index > 0) {
        const table = row.getContext().table;
        const rows = table.getCoreRowModel().rows;
        const prevRow = rows[index - 1];
        if (prevRow) {
          const prevConsumo = prevRow.getValue('consumoPeriodo') as number;
          if (consumo > prevConsumo * 1.05) {
            icon = <TrendingUp className='h-3 w-3 inline ml-1 text-rose-500' />;
            colorClass = 'text-rose-600 dark:text-rose-400 font-medium';
          } else if (consumo < prevConsumo * 0.95) {
            icon = (
              <TrendingDown className='h-3 w-3 inline ml-1 text-emerald-500' />
            );
            colorClass = 'text-emerald-600 dark:text-emerald-400 font-medium';
          } else {
            icon = <Minus className='h-3 w-3 inline ml-1 text-slate-400' />;
          }
        }
      }

      return (
        <div className={`text-right ${colorClass}`}>
          {consumo.toLocaleString('es-CL')} kWh
          {icon}
        </div>
      );
    },
    enableSorting: true,
    minSize: 130
  }
];
