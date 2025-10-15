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
          className='p-0 h-6 w-6 hover:muted '
        >
          {row.getIsExpanded() ? (
            <ChevronDown className='h-3 w-3 text-muted-foreground' />
          ) : (
            <ChevronRight className='h-3 w-3 text-muted-foreground' />
          )}
        </Button>
      );
    },
    size: 30,
    minSize: 30,
    maxSize: 30
  },
  {
    id: 'facturar',
    header: ({ table }) => (
      <div className='flex items-center justify-center'>
        <Checkbox
          checked={table.getIsAllPageRowsSelected()}
          onCheckedChange={value => table.toggleAllPageRowsSelected(!!value)}
          aria-label='Seleccionar todo'
          className='h-3 w-3'
        />
      </div>
    ),
    cell: ({ row }) => (
      <div className='flex items-center justify-center'>
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={value => row.toggleSelected(!!value)}
          aria-label='Seleccionar fila'
          className='h-3 w-3'
        />
      </div>
    ),
    enableSorting: false,
    enableHiding: false,
    size: 30,
    minSize: 30,
    maxSize: 30
  },
  {
    header: () => (
      <div className='text-center font-semibold text-xs'>Sector</div>
    ),
    accessorKey: 'sector',
    cell: ({ row }) => {
      const sector = row.getValue('sector');
      return (
        <div className='text-center'>
          <span className='text-xs font-mono bg-primary/10 text-primary px-1 py-0.5 rounded'>
            {sector as string}
          </span>
        </div>
      );
    },
    size: 50,
    minSize: 45,
    maxSize: 55
  },
  {
    header: () => (
      <div className='text-center font-semibold text-xs'>Contrato</div>
    ),
    accessorKey: 'contratoId',
    cell: ({ row }) => {
      const contrato = row.getValue('contratoId');
      return (
        <span className='font-mono text-xs text-primary bg-primary/10 px-1 py-0.5 rounded'>
          {contrato as string}
        </span>
      );
    },
    size: 70,
    minSize: 65,
    maxSize: 75
  },
  {
    header: () => (
      <div className='text-center font-semibold text-xs'>Tarifa</div>
    ),
    accessorKey: 'codigoTarifa',
    cell: ({ row }) => {
      const tarifa = row.getValue('codigoTarifa');
      return (
        <div className='text-center'>
          <span className='text-xs bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 px-1 py-0.5 rounded'>
            {tarifa as string}
          </span>
        </div>
      );
    },
    size: 45,
    minSize: 40,
    maxSize: 50
  },
  {
    header: () => (
      <div className='text-center font-semibold text-xs'>RUT Cliente</div>
    ),
    accessorKey: 'rutCliente',
    cell: ({ row }) => {
      const rut = row.getValue('rutCliente');
      return <span className='font-mono text-xs'>{rut as string}</span>;
    },
    size: 85,
    minSize: 80,
    maxSize: 90
  },
  {
    header: () => (
      <div className='font-semibold text-xs'>Razón Social/Nombre Completo</div>
    ),
    accessorKey: 'nombreCliente',
    cell: ({ row }) => {
      const nombre = row.getValue('nombreCliente');
      return (
        <span
          className='text-xs truncate block max-w-[140px]'
          title={nombre as string}
        >
          {nombre as string}
        </span>
      );
    },
    size: 140,
    minSize: 120,
    maxSize: 160
  },
  {
    header: () => (
      <div className='text-center font-semibold text-xs'>Local</div>
    ),
    accessorKey: 'localId',
    cell: ({ row }) => {
      const local = row.getValue('localId');
      return (
        <div className='text-center'>
          <span className='text-xs bg-primary/10 text-primary px-1 py-0.5 rounded'>
            {local as string}
          </span>
        </div>
      );
    },
    size: 50,
    minSize: 45,
    maxSize: 55
  },
  {
    header: () => <div className='font-semibold text-xs'>Dirección</div>,
    accessorKey: 'direccion',
    cell: ({ row }) => {
      const direccion = row.getValue('direccion');
      return (
        <span
          className='text-xs truncate block max-w-[120px]'
          title={direccion as string}
        >
          {direccion as string}
        </span>
      );
    },
    size: 120,
    minSize: 100,
    maxSize: 140
  },
  {
    header: () => <div className='font-semibold text-xs'>Comuna</div>,
    accessorKey: 'comuna',
    cell: ({ row }) => {
      const comuna = row.getValue('comuna');
      return (
        <span
          className='text-xs truncate block max-w-[80px]'
          title={comuna as string}
        >
          {comuna as string}
        </span>
      );
    },
    size: 80,
    minSize: 70,
    maxSize: 90
  },
  {
    header: () => (
      <div className='text-center font-semibold text-xs'>N° Medidor</div>
    ),
    accessorKey: 'numeroSerie',
    cell: ({ row }) => {
      const serie = row.getValue('numeroSerie');
      return (
        <span className='font-mono text-xs bg-background px-1 py-0.5 rounded'>
          {serie as string}
        </span>
      );
    },
    size: 70,
    minSize: 65,
    maxSize: 75
  },
  {
    header: () => (
      <div className='text-center font-semibold text-xs'>Fecha Lectura</div>
    ),
    accessorKey: 'fechaLectura',
    cell: ({ row }) => {
      const fecha = row.getValue('fechaLectura');
      return fecha ? (
        <span className='text-xs'>
          {new Date(fecha as string).toLocaleDateString('es-CL', {
            day: '2-digit',
            month: '2-digit',
            year: '2-digit'
          })}
        </span>
      ) : (
        <span className='text-xs text-muted-foreground'>-</span>
      );
    },
    size: 70,
    minSize: 65,
    maxSize: 75
  },
  {
    header: () => (
      <div className='text-center font-semibold text-xs'>Consumo</div>
    ),
    accessorKey: 'consumoPeriodo',
    cell: ({ row }) => {
      const consumo = row.getValue('consumoPeriodo');
      return (
        <div className='text-right'>
          <span className='text-xs'>
            {((consumo as number) || 0).toLocaleString('es-CL') || '0'}
          </span>
        </div>
      );
    },
    size: 60,
    minSize: 55,
    maxSize: 65
  },
  {
    header: () => (
      <div className='text-center font-semibold text-xs'>Total Facturado</div>
    ),
    accessorKey: 'totalFacturado',
    cell: ({ row }) => {
      const total = row.getValue('totalFacturado');
      return (
        <div className='text-right'>
          <span className='text-xs font-medium text-emerald-700 dark:text-emerald-300'>
            ${((total as number) || 0).toLocaleString('es-CL')}
          </span>
        </div>
      );
    },
    size: 85,
    minSize: 80,
    maxSize: 90
  },
  {
    header: () => (
      <div className='text-center font-semibold text-xs'>Total a Pagar</div>
    ),
    accessorKey: 'totalAPagar',
    cell: ({ row }) => {
      const totalFacturado = row.getValue('totalFacturado');

      return (
        <div className='text-right'>
          <span className='text-xs font-medium text-primary'>
            ${((totalFacturado as number) || 0).toLocaleString('es-CL')}
          </span>
        </div>
      );
    },
    size: 85,
    minSize: 80,
    maxSize: 90
  },
  {
    header: () => (
      <div className='text-center font-semibold text-xs'>Facturar</div>
    ),
    accessorKey: 'facturar',
    cell: () => {
      return (
        <div className='text-center'>
          <span className='text-xs bg-emerald-500 text-white px-1 py-0.5 rounded'>
            Todos
          </span>
        </div>
      );
    },
    size: 60,
    minSize: 55,
    maxSize: 65
  }
];
