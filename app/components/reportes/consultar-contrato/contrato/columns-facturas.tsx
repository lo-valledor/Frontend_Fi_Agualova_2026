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
      const periodo = row.getValue('periodo') as string;
      return <div className='font-medium'>{periodo}</div>;
    },
    enableSorting: true,
    enableHiding: false,
  },
  {
    accessorKey: 'nroFactura',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Nro. Factura' />
    ),
    cell: ({ row }) => {
      const nroFactura = row.getValue('nroFactura') as string;
      return <Badge variant='outline'>{nroFactura}</Badge>;
    },
    enableSorting: true,
  },
  {
    accessorKey: 'tarifa',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Tarifa' />
    ),
    cell: ({ row }) => {
      const tarifa = row.getValue('tarifa') as string;
      return <div className='text-center'>{tarifa}</div>;
    },
    enableSorting: true,
  },
  {
    accessorKey: 'fechaEmision',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='F. Emisión' />
    ),
    cell: ({ row }) => {
      const fecha = row.getValue('fechaEmision') as string;
      return (
        <div className='text-sm'>{new Date(fecha).toLocaleDateString('es-CL')}</div>
      );
    },
    enableSorting: true,
  },
  {
    accessorKey: 'fechaVencimiento',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='F. Vencimiento' />
    ),
    cell: ({ row }) => {
      const fecha = row.getValue('fechaVencimiento') as string;
      const fechaVenc = new Date(fecha);
      const hoy = new Date();
      const isVencida = fechaVenc < hoy;
      
      return (
        <div className={`text-sm ${isVencida ? 'text-red-600 font-medium' : ''}`}>
          {fechaVenc.toLocaleDateString('es-CL')}
          {isVencida && <div className='text-xs text-red-500'>Vencida</div>}
        </div>
      );
    },
    enableSorting: true,
  },
  {
    accessorKey: 'valorNeto',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Valor Neto' />
    ),
    cell: ({ row }) => {
      const valor = row.getValue('valorNeto') as number;
      return <div className='text-right'>${valor?.toLocaleString('es-CL')}</div>;
    },
    enableSorting: true,
  },
  {
    accessorKey: 'iva',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='IVA' />
    ),
    cell: ({ row }) => {
      const iva = row.getValue('iva') as number;
      return <div className='text-right'>${iva?.toLocaleString('es-CL')}</div>;
    },
    enableSorting: true,
  },
  {
    accessorKey: 'valorTotal',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Total' />
    ),
    cell: ({ row }) => {
      const total = row.getValue('valorTotal') as number;
      return (
        <div className='text-right font-bold text-slate-900 dark:text-slate-100'>
          ${total?.toLocaleString('es-CL')}
        </div>
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
      const consumo = row.getValue('consumoPeriodo') as number;
      return <div className='text-right text-sm'>{consumo} kWh</div>;
    },
    enableSorting: true,
  },
];