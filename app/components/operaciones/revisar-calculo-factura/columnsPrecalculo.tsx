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
          className='p-0 h-4 w-4 hover:bg-purple-50 dark:hover:bg-purple-900/20'
        >
          {row.getIsExpanded() ? (
            <ChevronDown className='h-2.5 w-2.5 text-purple-600 dark:text-purple-400' />
          ) : (
            <ChevronRight className='h-2.5 w-2.5 text-purple-600 dark:text-purple-400' />
          )}
        </Button>
      );
    },
    size: 25,
    minSize: 25,
    maxSize: 25
  },
  {
    id: 'facturar',
    header: ({ table }) => (
      <div className='flex items-center justify-center'>
        <Checkbox
          checked={table.getIsAllPageRowsSelected()}
          onCheckedChange={value => table.toggleAllPageRowsSelected(!!value)}
          aria-label='Seleccionar todo'
          className='border-purple-300 data-[state=checked]:bg-purple-600 h-2.5 w-2.5'
        />
      </div>
    ),
    cell: ({ row }) => (
      <div className='flex items-center justify-center'>
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={value => row.toggleSelected(!!value)}
          aria-label='Seleccionar fila'
          className='border-purple-300 data-[state=checked]:bg-purple-600 h-2.5 w-2.5'
        />
      </div>
    ),
    enableSorting: false,
    enableHiding: false,
    size: 25,
    minSize: 25,
    maxSize: 25
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
          <span className='text-[10px] font-mono bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-0.5 py-0.5 rounded'>
            {sector as string}
          </span>
        </div>
      );
    },
    size: 40,
    minSize: 35,
    maxSize: 45
  },
  {
    header: () => (
      <div className='text-center font-medium text-[10px]'>Contrato</div>
    ),
    accessorKey: 'contratoId',
    cell: ({ row }) => {
      const contrato = row.getValue('contratoId');
      return (
        <span className='font-mono text-[10px] text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-900/20 px-0.5 py-0.5 rounded'>
          {contrato as string}
        </span>
      );
    },
    size: 50,
    minSize: 45,
    maxSize: 55
  },
  {
    header: () => (
      <div className='text-center font-medium text-[10px]'>Tarifa</div>
    ),
    accessorKey: 'codigoTarifa',
    cell: ({ row }) => {
      const tarifa = row.getValue('codigoTarifa');
      return (
        <div className='text-center'>
          <span className='text-[10px] bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 px-0.5 py-0.5 rounded'>
            {tarifa as string}
          </span>
        </div>
      );
    },
    size: 35,
    minSize: 30,
    maxSize: 40
  },
  {
    header: () => (
      <div className='text-center font-medium text-[10px]'>RUT Cliente</div>
    ),
    accessorKey: 'rutCliente',
    cell: ({ row }) => {
      const rut = row.getValue('rutCliente');
      return <span className='font-mono text-[10px]'>{rut as string}</span>;
    },
    size: 65,
    minSize: 60,
    maxSize: 70
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
          className='text-[10px] text-slate-700 dark:text-slate-300 truncate block max-w-[100px]'
          title={nombre as string}
        >
          {nombre as string}
        </span>
      );
    },
    size: 100,
    minSize: 80,
    maxSize: 120
  },
  {
    header: () => (
      <div className='text-center font-medium text-[10px]'>Local</div>
    ),
    accessorKey: 'localId',
    cell: ({ row }) => {
      const local = row.getValue('localId');
      return (
        <div className='text-center'>
          <span className='text-[10px] bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-0.5 py-0.5 rounded'>
            {local as string}
          </span>
        </div>
      );
    },
    size: 35,
    minSize: 30,
    maxSize: 40
  },
  {
    header: () => <div className='font-medium text-[10px]'>Dirección</div>,
    accessorKey: 'direccion',
    cell: ({ row }) => {
      const direccion = row.getValue('direccion');
      return (
        <span
          className='text-[10px] text-slate-600 dark:text-slate-400 truncate block max-w-[85px]'
          title={direccion as string}
        >
          {direccion as string}
        </span>
      );
    },
    size: 85,
    minSize: 75,
    maxSize: 95
  },
  {
    header: () => <div className='font-medium text-[10px]'>Comuna</div>,
    accessorKey: 'comuna',
    cell: ({ row }) => {
      const comuna = row.getValue('comuna');
      return (
        <span
          className='text-[10px] text-slate-700 dark:text-slate-300 truncate block max-w-[60px]'
          title={comuna as string}
        >
          {comuna as string}
        </span>
      );
    },
    size: 60,
    minSize: 50,
    maxSize: 70
  },
  {
    header: () => (
      <div className='text-center font-medium text-[10px]'>N° Medidor</div>
    ),
    accessorKey: 'numeroSerie',
    cell: ({ row }) => {
      const serie = row.getValue('numeroSerie');
      return (
        <span className='font-mono text-[10px] bg-slate-100 dark:bg-slate-800 px-0.5 py-0.5 rounded'>
          {serie as string}
        </span>
      );
    },
    size: 55,
    minSize: 50,
    maxSize: 60
  },
  {
    header: () => (
      <div className='text-center font-medium text-[10px]'>Fecha Lectura</div>
    ),
    accessorKey: 'fechaLectura',
    cell: ({ row }) => {
      const fecha = row.getValue('fechaLectura');
      return fecha ? (
        <span className='text-[10px] text-slate-700 dark:text-slate-300'>
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
    size: 55,
    minSize: 50,
    maxSize: 60
  },
  {
    header: () => (
      <div className='text-center font-medium text-[10px]'>
        Consumo Cantidad
      </div>
    ),
    accessorKey: 'consumoPeriodo',
    cell: ({ row }) => {
      const consumo = row.getValue('consumoPeriodo');
      return (
        <div className='text-right'>
          <span className='text-[10px] text-slate-700 dark:text-slate-300'>
            {((consumo as number) || 0).toLocaleString('es-CL') || '0'}
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
      <div className='text-center font-medium text-[10px]'>
        Total Facturado Precio Unitario
      </div>
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
    size: 65,
    minSize: 60,
    maxSize: 70
  },
  {
    header: () => (
      <div className='text-center font-medium text-[10px]'>
        Total a Pagar Sub Total
      </div>
    ),
    accessorKey: 'totalAPagar',
    cell: ({ row }) => {
      const totalFacturado = row.getValue('totalFacturado');

      return (
        <div className='text-right'>
          <span className='text-[10px] font-medium text-indigo-700 dark:text-indigo-300'>
            ${((totalFacturado as number) || 0).toLocaleString('es-CL')}
          </span>
        </div>
      );
    },
    size: 65,
    minSize: 60,
    maxSize: 70
  },
  {
    header: () => (
      <div className='text-center font-medium text-[10px]'>Facturar</div>
    ),
    accessorKey: 'facturar',
    cell: () => {
      return (
        <div className='text-center'>
          <span className='text-[10px] bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 px-0.5 py-0.5 rounded'>
            Todos
          </span>
        </div>
      );
    },
    size: 45,
    minSize: 40,
    maxSize: 50
  }
];
