import type { ColumnDef } from '@tanstack/react-table';

import { DataTableColumnHeader } from '~/components/data-table/data-table-column-header';
import { Badge } from '~/components/ui/badge';
import { cn } from '~/lib/utils';
import type { ConsultarMantenedorRevisionCorte } from '~/types/operaciones';

import { CorteRegistradoDialog } from './corte-registrado-dialog';
import { MarcarLiberarDialog } from './marcar-liberar-dialog';
import { ReposicionSolicitadaDialog } from './reposicion-solicitada-dialog';

export const columns: ColumnDef<ConsultarMantenedorRevisionCorte>[] = [
  {
    accessorKey: 'ctId',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='ID' />
    ),
    cell: ({ row }) => {
      const id = row.getValue('ctId');
      return (
        <div className='flex items-center'>
          <Badge variant='outline' className='font-mono text-xs sm:text-xs'>
            {id as string}
          </Badge>
        </div>
      );
    },
    size: 80
  },
  {
    accessorKey: 'seCodigo',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Código' />
    ),
    cell: ({ row }) => {
      const codigo = row.getValue('seCodigo');
      return (
        <div className='font-mono text-xs sm:text-sm font-medium'>
          {codigo as string}
        </div>
      );
    },
    size: 120
  },
  {
    accessorKey: 'meNSerie',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='N° Serie' />
    ),
    cell: ({ row }) => {
      const serie = row.getValue('meNSerie');
      return (
        <div className='font-mono text-xs sm:text-sm'>{serie as string}</div>
      );
    },
    size: 140
  },
  {
    accessorKey: 'clRut',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='RUT' />
    ),
    cell: ({ row }) => {
      const rut = row.getValue('clRut');
      return (
        <div className='font-mono text-xs sm:text-sm font-medium'>
          {rut as string}
        </div>
      );
    },
    size: 120
  },
  {
    accessorKey: 'clRazonSocialCompleto',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Razón Social' />
    ),
    cell: ({ row }) => {
      const razonSocial = row.getValue('clRazonSocialCompleto');
      return (
        <div className='max-w-[120px] sm:max-w-[200px] truncate font-medium text-xs sm:text-sm'>
          {razonSocial as string}
        </div>
      );
    },
    size: 200
  },
  {
    accessorKey: 'niDescripcion',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Descripción' />
    ),
    cell: ({ row }) => {
      const descripcion = row.getValue('niDescripcion');
      return (
        <div className='max-w-[100px] sm:max-w-[150px] truncate text-xs sm:text-sm'>
          {descripcion as string}
        </div>
      );
    },
    size: 150
  },
  {
    accessorKey: 'secDescripcion',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Sección' />
    ),
    cell: ({ row }) => {
      const seccion = row.getValue('secDescripcion');
      return <div className='text-xs sm:text-sm'>{seccion as string}</div>;
    },
    size: 120
  },
  {
    accessorKey: 'reEstado',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Estado' />
    ),
    cell: ({ row }) => {
      const estado = row.getValue('reEstado');

      const getEstadoConfig = (estado: string) => {
        switch (estado) {
          case 'NULL':
            return {
              label: 'Pendiente',
              variant: 'outline' as const,
              className:
                'border-amber-200 text-amber-700 bg-amber-50 dark:border-amber-700 dark:text-amber-300 dark:bg-amber-900/20'
            };
          case '1':
            return {
              label: 'Liberado',
              variant: 'default' as const,
              className:
                'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-300 dark:border-emerald-700'
            };
          case '2':
            return {
              label: 'Cortado',
              variant: 'destructive' as const,
              className:
                'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-700'
            };
          case '3':
            return {
              label: 'Reposición Solicitada',
              variant: 'outline' as const,
              className:
                'border-sky-200 text-sky-700 bg-sky-50 dark:border-sky-700 dark:text-sky-300 dark:bg-sky-900/20'
            };
          default:
            return {
              label: estado,
              variant: 'outline' as const,
              className:
                'border-slate-200 text-slate-700 dark:border-slate-700 dark:text-slate-300'
            };
        }
      };

      const config = getEstadoConfig(estado as string);

      const getShortLabel = (estado: string) => {
        if (estado === 'NULL') return 'Pend.';
        if (estado === '1') return 'Lib.';
        if (estado === '2') return 'Cort.';
        if (estado === '3') return 'Rep.';
        return config.label;
      };

      return (
        <Badge
          variant={config.variant}
          className={cn('text-xs font-medium px-1 sm:px-2', config.className)}
        >
          <span className='hidden sm:inline'>{config.label}</span>
          <span className='sm:hidden'>{getShortLabel(estado as string)}</span>
        </Badge>
      );
    },
    size: 140
  },
  {
    accessorKey: 'reCantDocumentos',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Documentos' />
    ),
    cell: ({ row }) => {
      const documentos = row.getValue('reCantDocumentos');
      return (
        <div className='text-center'>
          <Badge
            variant='outline'
            className='font-mono text-xs bg-background px-1 sm:px-2'
          >
            {documentos as number}
          </Badge>
        </div>
      );
    },
    size: 100
  },
  {
    accessorKey: 'reDeudaTotal',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Deuda Total' />
    ),
    cell: ({ row }) => {
      const deuda = row.getValue('reDeudaTotal');
      const formattedDeuda = new Intl.NumberFormat('es-CL', {
        style: 'currency',
        currency: 'CLP',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }).format(deuda as number);

      return (
        <div className='text-right'>
          <span className='font-mono text-xs sm:text-sm font-medium'>
            {formattedDeuda}
          </span>
        </div>
      );
    },
    size: 140
  },
  {
    header: 'Acciones',
    id: 'acciones',
    cell: ({ row, table }) => {
      const acometida = row.original.seCodigo;

      const handleSuccess = () => {
        (
          table.options.meta as { handleBuscar: () => void } | undefined
        )?.handleBuscar();
      };

      return (
        <div className='flex items-center justify-center gap-0.5 sm:gap-1'>
          <ReposicionSolicitadaDialog
            acometida={acometida}
            onSuccess={handleSuccess}
          />
          <CorteRegistradoDialog
            acometida={acometida}
            onSuccess={handleSuccess}
          />
          <MarcarLiberarDialog
            acometida={acometida}
            onSuccess={handleSuccess}
          />
        </div>
      );
    },
    size: 120,
    enableSorting: false
  }
];
