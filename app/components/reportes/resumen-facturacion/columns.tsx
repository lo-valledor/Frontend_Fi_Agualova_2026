import type { ColumnDef } from '@tanstack/react-table';

import { DataTableColumnHeader } from '~/components/data-table/data-table-column-header';
import type { FacturacionPorCargo } from '~/types/reportes';

export const columns: ColumnDef<FacturacionPorCargo>[] = [
  {
    accessorKey: 'cargoDescripcion',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Descripción' />
    ),
    cell: ({ row }) => {
      const descripcion = row.getValue('cargoDescripcion') as string;
      return (
        <div className='max-w-[200px] truncate font-medium'>{descripcion}</div>
      );
    },
    enableSorting: true,
    enableHiding: false,
  },
  {
    accessorKey: 'totalEnergiaPeriodoAnterior',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Energía Anterior' />
    ),
    cell: ({ row }) => {
      const valor = row.getValue('totalEnergiaPeriodoAnterior') as string;
      return <div className='text-right'>{valor}</div>;
    },
    enableSorting: true,
  },
  {
    accessorKey: 'totalFacturaPeriodoAnterior',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Factura Anterior' />
    ),
    cell: ({ row }) => {
      const valor = row.getValue('totalFacturaPeriodoAnterior') as string;
      return <div className='text-right'>{valor}</div>;
    },
    enableSorting: true,
  },
  {
    accessorKey: 'cantidadCargosPeriodoAnterior',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Cant. Anterior' />
    ),
    cell: ({ row }) => {
      const valor = row.getValue('cantidadCargosPeriodoAnterior') as string;
      return <div className='text-right'>{valor}</div>;
    },
    enableSorting: true,
  },
  {
    accessorKey: 'totalEnergiaPeriodoActual',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Energía Actual' />
    ),
    cell: ({ row }) => {
      const valor = row.getValue('totalEnergiaPeriodoActual') as string;
      return <div className='text-right'>{valor}</div>;
    },
    enableSorting: true,
  },
  {
    accessorKey: 'totalFacturaPeriodoActual',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Factura Actual' />
    ),
    cell: ({ row }) => {
      const valor = row.getValue('totalFacturaPeriodoActual') as string;
      return <div className='text-right'>{valor}</div>;
    },
    enableSorting: true,
  },
  {
    accessorKey: 'cantidadCargosPeriodoActual',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Cant. Actual' />
    ),
    cell: ({ row }) => {
      const valor = row.getValue('cantidadCargosPeriodoActual') as string;
      return <div className='text-right'>{valor}</div>;
    },
    enableSorting: true,
  },
  {
    accessorKey: 'diferenciaPeriodos',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Diferencia' />
    ),
    cell: ({ row }) => {
      const valor = row.getValue('diferenciaPeriodos') as string;
      return <div className='text-right font-medium'>{valor}</div>;
    },
    enableSorting: true,
  },
];
/**
 * cargoDescripcion: string;
  totalEnergiaPeriodoAnterior: string;
  totalFacturaPeriodoAnterior: string;
  cantidadCargosPeriodoAnterior: string;
  totalEnergiaPeriodoActual: string;
  totalFacturaPeriodoActual: string;
  cantidadCargosPeriodoActual: string;
  diferenciaPeriodos: string;
 */
