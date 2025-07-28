import type { ColumnDef } from '@tanstack/react-table';
import {
  Building,
  Calendar,
  FileText,
  Repeat,
  ShieldCheck,
  Store,
  User,
  Zap,
} from 'lucide-react';

import { DataTableColumnHeader } from '~/components/data-table/data-table-column-header';
import {
  EstadoBadge,
  TableActions,
} from '~/components/data-table/table-helpers';
import { Badge } from '~/components/ui/badge';
import { type GetContratos } from '~/types/administracion';

interface TableColumnsProps {
  onEdit: (contract: GetContratos) => void;
  onDelete: (contract: GetContratos) => void;
  onViewDetails: (contract: GetContratos) => void;
}

// Función robusta para formatear fechas en formato español
const formatDateToSpanish = (
  dateValue: string | Date | null | undefined
): string => {
  if (!dateValue) return 'N/A';

  let date: Date;

  // Si es un string, intentar parsearlo
  if (typeof dateValue === 'string') {
    // Intentar diferentes formatos de fecha
    const dateFormats = [
      // Formato ISO (2023-12-31)
      /^\d{4}-\d{2}-\d{2}/,
      // Formato DD/MM/YYYY
      /^\d{2}\/\d{2}\/\d{4}/,
      // Formato MM/DD/YYYY (formato gringo)
      /^\d{1,2}\/\d{1,2}\/\d{4}/,
      // Formato DD-MM-YYYY
      /^\d{2}-\d{2}-\d{4}/,
      // Formato MM-DD-YYYY
      /^\d{1,2}-\d{1,2}-\d{4}/,
    ];

    // Verificar si la fecha tiene un formato reconocible
    const isValidFormat = dateFormats.some(format => format.test(dateValue));

    if (!isValidFormat) {
      return 'Fecha inválida';
    }

    // Intentar crear la fecha
    date = new Date(dateValue);
  } else {
    date = dateValue;
  }

  // Verificar si la fecha es válida
  if (isNaN(date.getTime())) {
    return 'Fecha inválida';
  }

  // Formatear en español
  return date.toLocaleDateString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

export const columns = ({
  onEdit,
  onDelete,
  onViewDetails,
}: TableColumnsProps): ColumnDef<GetContratos>[] => [
  {
    accessorKey: 'codigoContrato',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Contrato' />
    ),
    cell: ({ row }) => {
      return (
        <div className='flex items-center gap-2'>
          <div className='p-1.5 bg-sky-100 dark:bg-sky-900/30 rounded-md'>
            <FileText className='h-4 w-4 text-sky-600 dark:text-sky-400' />
          </div>
          <span className='font-mono text-sm'>
            {row.original.codigoContrato}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: 'nombreCliente',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Cliente / Propietario' />
    ),
    cell: ({ row }) => (
      <div className='space-y-1'>
        <div className='flex items-center gap-2'>
          <User className='h-4 w-4 text-slate-500' />
          <span className='text-sm font-medium'>
            {row.original.nombreCliente}
          </span>
        </div>
        <div className='flex items-center gap-2'>
          <Building className='h-4 w-4 text-slate-500' />
          <span className='text-sm text-muted-foreground'>
            {row.original.nombrePropietario}
          </span>
        </div>
      </div>
    ),
  },
  {
    accessorKey: 'tipoContrato',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Tipo' />
    ),
    cell: ({ row }) => {
      return <Badge variant='outline'>{row.original.tipoContrato}</Badge>;
    },
  },
  {
    accessorKey: 'tarifa',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Tarifa' />
    ),
    cell: ({ row }) => {
      return <Badge variant='secondary'>{row.original.tarifa}</Badge>;
    },
  },

  {
    accessorKey: 'local',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Local' />
    ),
    cell: ({ row }) => {
      return (
        <div className='flex items-center gap-2'>
          <Store className='h-4 w-4 text-slate-500' />
          <span className='text-sm'>{row.original.local}</span>
        </div>
      );
    },
  },
  {
    accessorKey: 'fechaInicio',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='F. Inicio' />
    ),
    cell: ({ row }) => {
      return (
        <div className='flex items-center gap-2'>
          <Calendar className='h-4 w-4 text-slate-500' />
          <span className='text-sm'>
            {formatDateToSpanish(row.original.fechaInicio)}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: 'activo',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Estado' />
    ),
    cell: ({ row }) => {
      return <EstadoBadge estado={row.original.activo} />;
    },
  },
  {
    accessorKey: 'fechaTermino',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='F. Término' />
    ),
    cell: ({ row }) => {
      const fechaTermino = formatDateToSpanish(row.original.fechaTermino);
      if (fechaTermino === 'N/A' || fechaTermino === 'Fecha inválida') {
        return <Badge variant='outline'>Indefinido</Badge>;
      }
      return (
        <div className='flex items-center gap-2'>
          <Calendar className='h-4 w-4 text-slate-500' />
          <span className='text-sm'>{fechaTermino}</span>
        </div>
      );
    },
  },
  {
    accessorKey: 'cicloFacturacion',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Ciclo' />
    ),
    cell: ({ row }) => {
      return (
        <Badge
          variant='outline'
          className='bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/20 dark:text-purple-300 dark:border-purple-800'
        >
          <Repeat className='mr-2 h-3.5 w-3.5' />
          {row.original.cicloFacturacion}
        </Badge>
      );
    },
  },
  {
    accessorKey: 'potenciaContratada',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Potencia' />
    ),
    cell: ({ row }) => {
      return (
        <div className='flex items-center gap-2'>
          <Zap className='h-4 w-4 text-amber-500' />
          <span className='text-sm font-semibold'>
            {row.original.potenciaContratada}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: 'liberadoCorte',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Liberado Corte' />
    ),
    cell: ({ row }) => {
      return row.original.liberadoCorte ? (
        <Badge
          variant='outline'
          className='bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800'
        >
          <ShieldCheck className='mr-2 h-3.5 w-3.5' />
          Liberado
        </Badge>
      ) : (
        <Badge variant='secondary'>No Liberado</Badge>
      );
    },
  },
  {
    id: 'actions',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Acciones' />
    ),
    cell: ({ row }) => {
      return (
        <TableActions
          onEdit={() => onEdit(row.original)}
          onDelete={() => onDelete(row.original)}
          onView={() => onViewDetails(row.original)}
          item={row.original}
          showView={true}
        />
      );
    },
  },
];

/**
 * export interface GetContratos {
  codigoContrato: string;
  acometida: string;
  tipoContrato: string;
  tarifa: string;
  nombrePropietario: string;
  nombreCliente: string;
  local: string;
  fechaInicio: string;
  activo: boolean;
  fechaTermino: string;
  comunaEnvio: string;
  direccionEnvio: string;
  limiteInvierno: number;
  promedioAnual: string;
  cicloFacturacion: string;
  potenciaContratada: string;
  liberadoCorte: boolean;
}
 */
