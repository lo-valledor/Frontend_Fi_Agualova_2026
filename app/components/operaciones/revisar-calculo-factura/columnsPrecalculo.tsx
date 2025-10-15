import { type ColumnDef } from '@tanstack/react-table';
import { ChevronDown, ChevronRight } from 'lucide-react';

import { Button } from '~/components/ui/button';
import { Checkbox } from '~/components/ui/checkbox';
import { type CalculoPrefacturaCompleto } from '~/types/operaciones';

export const columns: ColumnDef<CalculoPrefacturaCompleto>[] = [
  {
    id: 'expander',
    header: () => null,
    cell: ({ row }) => {
      return (
        <Button
          variant='ghost'
          size='sm'
          onClick={() => row.toggleExpanded()}
          className='p-0 h-4 w-4 hover:bg-muted'
        >
          {row.getIsExpanded() ? (
            <ChevronDown className='h-2.5 w-2.5 text-primary' />
          ) : (
            <ChevronRight className='h-2.5 w-2.5 text-primary' />
          )}
        </Button>
      );
    },
    size: 40,
    minSize: 40,
    maxSize: 40
  },
  {
    id: 'facturar',
    header: ({ table }) => (
      <div className='flex items-center justify-center'>
        <Checkbox
          checked={table.getIsAllPageRowsSelected()}
          onCheckedChange={value => table.toggleAllPageRowsSelected(!!value)}
          aria-label='Seleccionar todo'
          className='h-2.5 w-2.5'
        />
      </div>
    ),
    cell: ({ row }) => (
      <div className='flex items-center justify-center'>
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={value => row.toggleSelected(!!value)}
          aria-label='Seleccionar fila'
          className='h-2.5 w-2.5'
        />
      </div>
    ),
    enableSorting: false,
    enableHiding: false,
    size: 40,
    minSize: 40,
    maxSize: 40
  },
  {
    header: () => (
      <div className='text-center font-medium text-[10px]'>Sector</div>
    ),
    accessorKey: 'sector',
    cell: ({ row }) => {
      const sector = row.getValue('sector');
      return (
        <div className='text-center'>
          <span className='text-[10px] font-mono bg-primary/10 text-primary px-0.5 py-0.5 rounded'>
            {sector as string}
          </span>
        </div>
      );
    },
    size: 70,
    minSize: 65,
    maxSize: 75
  },
  {
    header: () => (
      <div className='text-left font-medium text-[10px]'>Contrato</div>
    ),
    accessorKey: 'contratoId',
    cell: ({ row }) => {
      const contrato = row.getValue('contratoId');
      return (
        <span className='font-mono text-[10px] text-primary bg-primary/10 px-0.5 py-0.5 rounded'>
          {contrato as string}
        </span>
      );
    },
    size: 10,
    minSize: 85,
    maxSize: 95
  },
  {
    header: () => (
      <div className='text-left font-medium text-[10px]'>Tarifa</div>
    ),
    accessorKey: 'codigoTarifa',
    cell: ({ row }) => {
      const tarifa = row.getValue('codigoTarifa');
      return (
        <div className='text-left'>
          <span className='text-[10px] bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 px-0.5 py-0.5 rounded'>
            {tarifa as string}
          </span>
        </div>
      );
    },
    size: 65,
    minSize: 60,
    maxSize: 70
  },
  {
    header: () => <div className='text-left font-medium text-[10px]'>RUT</div>,
    accessorKey: 'rutCliente',
    cell: ({ row }) => {
      const rut = row.getValue('rutCliente');
      return <span className='font-mono text-[10px]'>{rut as string}</span>;
    },
    size: 110,
    minSize: 105,
    maxSize: 115
  },
  {
    header: () => (
      <div className='font-medium text-[10px]'>
        Razón Social/Nombre Completo
      </div>
    ),
    accessorKey: 'nombreCliente',
    cell: ({ row }) => {
      const nombre = row.getValue('nombreCliente');
      return (
        <span
          className='text-[10px] truncate block max-w-[220px]'
          title={nombre as string}
        >
          {nombre as string}
        </span>
      );
    },
    size: 220,
    minSize: 200,
    maxSize: 240
  },
  {
    header: () => (
      <div className='text-left font-medium text-[10px]'>Local</div>
    ),
    accessorKey: 'localId',
    cell: ({ row }) => {
      const local = row.getValue('localId');
      return (
        <div className='text-left'>
          <span className='text-[10px] bg-primary/10 text-primary px-0.5 py-0.5 rounded'>
            {local as string}
          </span>
        </div>
      );
    },
    size: 65,
    minSize: 60,
    maxSize: 70
  },
  {
    header: () => <div className='font-medium text-[10px]'>Dirección</div>,
    accessorKey: 'direccion',
    cell: ({ row }) => {
      const direccion = row.getValue('direccion');
      return (
        <span
          className='text-left text-[10px] truncate block max-w-[170px]'
          title={direccion as string}
        >
          {direccion as string}
        </span>
      );
    },
    size: 170,
    minSize: 150,
    maxSize: 190
  },
  {
    header: () => <div className='font-medium text-[10px]'>Comuna</div>,
    accessorKey: 'comuna',
    cell: ({ row }) => {
      const comuna = row.getValue('comuna');
      return (
        <span
          className='text-[10px] truncate block max-w-[120px]'
          title={comuna as string}
        >
          {comuna as string}
        </span>
      );
    },
    size: 120,
    minSize: 110,
    maxSize: 130
  },
  {
    header: () => (
      <div className='text-center font-medium text-[10px]'>N° Medidor</div>
    ),
    accessorKey: 'numeroSerie',
    cell: ({ row }) => {
      const serie = row.getValue('numeroSerie');
      return (
        <span className='font-mono text-[10px] bg-background px-0.5 py-0.5 rounded'>
          {serie as string}
        </span>
      );
    },
    size: 95,
    minSize: 90,
    maxSize: 100
  },
  {
    header: () => (
      <div className='text-center font-medium text-[10px]'>Fecha Lectura</div>
    ),
    accessorKey: 'fechaLectura',
    cell: ({ row }) => {
      const fecha = row.getValue('fechaLectura');
      return fecha ? (
        <span className='text-[10px]'>
          {new Date(fecha as string).toLocaleDateString('es-CL', {
            day: '2-digit',
            month: '2-digit',
            year: '2-digit'
          })}
        </span>
      ) : (
        <span className='text-[10px] text-muted-foreground'>-</span>
      );
    },
    size: 95,
    minSize: 90,
    maxSize: 100
  },
  {
    header: () => (
      <div className='text-center font-medium text-[10px]'>Consumo</div>
    ),
    accessorKey: 'consumoPeriodo',
    cell: ({ row }) => {
      const consumo = row.getValue('consumoPeriodo');
      return (
        <div className='text-right'>
          <span className='text-[10px]'>
            {((consumo as number) || 0).toLocaleString('es-CL') || '0'}
          </span>
        </div>
      );
    },
    size: 90,
    minSize: 85,
    maxSize: 95
  },
  {
    header: () => (
      <div className='text-center font-medium text-[10px]'>Total Facturado</div>
    ),
    accessorKey: 'totalFacturado',
    cell: ({ row }) => {
      const total = row.getValue('totalFacturado');
      return (
        <div className='text-right'>
          <span className='text-[10px] font-medium text-emerald-700 dark:text-emerald-300'>
            ${((total as number) || 0).toLocaleString('es-CL')}
          </span>
        </div>
      );
    },
    size: 120,
    minSize: 115,
    maxSize: 125
  },
  {
    header: () => (
      <div className='text-center font-medium text-[10px]'>Total a Pagar</div>
    ),
    accessorKey: 'totalAPagar',
    cell: ({ row }) => {
      const totalFacturado = row.getValue('totalFacturado');

      return (
        <div className='text-right'>
          <span className='text-[10px] font-medium text-primary'>
            ${((totalFacturado as number) || 0).toLocaleString('es-CL')}
          </span>
        </div>
      );
    },
    size: 120,
    minSize: 115,
    maxSize: 125
  }
];
