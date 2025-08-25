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
      return <div className='font-medium'>{periodo as string}</div>;
    },
    enableSorting: true,
    enableHiding: false
  },
  {
    accessorKey: 'nroFactura',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Nro. Factura' />
    ),
    cell: ({ row }) => {
      const nroFactura = row.getValue('nroFactura');
      return <Badge variant='outline'>{nroFactura as string}</Badge>;
    },
    enableSorting: true
  },
  {
    accessorKey: 'tarifa',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Tarifa' />
    ),
    cell: ({ row }) => {
      const tarifa = row.getValue('tarifa');
      return <div className='text-left'>{tarifa as string}</div>;
    },
    enableSorting: true
  },
  {
    accessorKey: 'fechaEmision',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='F. Emisión' />
    ),
    cell: ({ row }) => {
      const fecha = row.getValue('fechaEmision');
      return <div className='text-sm'>{fecha as string}</div>;
    },
    enableSorting: true
  },
  {
    accessorKey: 'fechaVencimiento',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='F. Vencimiento' />
    ),
    cell: ({ row }) => {
      const fecha = row.getValue('fechaVencimiento');

      return <div className='text-sm'>{fecha as string}</div>;
    },
    enableSorting: true
  },
  {
    accessorKey: 'valorNeto',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Valor Neto' />
    ),
    cell: ({ row }) => {
      const valor = row.getValue('valorNeto');
      return <div className='text-left'>${valor?.toLocaleString()}</div>;
    },
    enableSorting: true
  },
  {
    accessorKey: 'iva',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='IVA' />
    ),
    cell: ({ row }) => {
      const iva = row.getValue('iva');
      return <div className='text-left'>${iva?.toLocaleString()}</div>;
    },
    enableSorting: true
  },
  {
    accessorKey: 'valorTotal',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Total' />
    ),
    cell: ({ row }) => {
      const total = row.getValue('valorTotal');
      return (
        <div className='text-left font-bold text-slate-900 dark:text-slate-100'>
          ${total?.toLocaleString()}
        </div>
      );
    },
    enableSorting: true
  },
  {
    accessorKey: 'consumoPeriodo',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Consumo' />
    ),
    cell: ({ row }) => {
      const consumo = row.getValue('consumoPeriodo');
      return (
        <div className='text-left text-sm'>
          {(consumo as number).toLocaleString()} kWh
        </div>
      );
    },
    enableSorting: true
  }
];
