import type { ColumnDef } from '@tanstack/react-table';

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
        <div className='flex items-center gap-1 sm:gap-2 min-w-0'>
          <span className='font-mono text-xs sm:text-sm truncate'>
            {row.original.codigoContrato}
          </span>
        </div>
      );
    },
    minSize: 120,
    maxSize: 180,
  },
  {
    accessorKey: 'nombreCliente',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Cliente / Propietario' />
    ),
    cell: ({ row }) => (
      <div className='space-y-1 min-w-0 max-w-[200px] lg:max-w-none'>
        <div className='flex items-center gap-1 sm:gap-2'>
          <span
            className='text-xs sm:text-sm font-medium truncate'
            title={row.original.nombreCliente}
          >
            {row.original.nombreCliente}
          </span>
        </div>
        <div className='flex items-center gap-1 sm:gap-2'>
          <span
            className='text-xs sm:text-sm text-muted-foreground truncate'
            title={row.original.nombrePropietario}
          >
            {row.original.nombrePropietario}
          </span>
        </div>
      </div>
    ),
    minSize: 180,
    maxSize: 250,
  },
  {
    accessorKey: 'tipoContrato',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Tipo' />
    ),
    cell: ({ row }) => {
      return (
        <Badge
          variant='outline'
          className='text-xs px-1 sm:px-2'
          title={row.original.tipoContrato}
        >
          <span className='truncate max-w-[80px] sm:max-w-none'>
            {row.original.tipoContrato}
          </span>
        </Badge>
      );
    },
    minSize: 100,
    maxSize: 140,
  },
  {
    accessorKey: 'tarifa',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Tarifa' />
    ),
    cell: ({ row }) => {
      return (
        <Badge
          variant='secondary'
          className='text-xs px-1 sm:px-2'
          title={row.original.tarifa}
        >
          <span className='truncate max-w-[80px] sm:max-w-none'>
            {row.original.tarifa}
          </span>
        </Badge>
      );
    },
    minSize: 100,
    maxSize: 140,
  },

  {
    accessorKey: 'local',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Local' />
    ),
    cell: ({ row }) => {
      return (
        <div className='flex items-center gap-1 sm:gap-2 min-w-0'>
          <span
            className='text-xs sm:text-sm truncate max-w-[120px] lg:max-w-none'
            title={row.original.local}
          >
            {row.original.local}
          </span>
        </div>
      );
    },
    minSize: 120,
    maxSize: 180,
  },
  {
    accessorKey: 'fechaInicio',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='F. Inicio' />
    ),
    cell: ({ row }) => {
      return (
        <div className='flex items-center gap-1 sm:gap-2'>
          <span className='text-xs sm:text-sm whitespace-nowrap'>
            {formatDateToSpanish(row.original.fechaInicio)}
          </span>
        </div>
      );
    },
    minSize: 110,
    maxSize: 140,
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
        return (
          <Badge variant='outline' className='text-xs px-1 sm:px-2'>
            Indefinido
          </Badge>
        );
      }
      return (
        <div className='flex items-center gap-1 sm:gap-2'>
          <span className='text-xs sm:text-sm whitespace-nowrap'>
            {fechaTermino}
          </span>
        </div>
      );
    },
    minSize: 110,
    maxSize: 140,
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
          className='bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/20 dark:text-purple-300 dark:border-purple-800 text-xs px-1 sm:px-2'
          title={row.original.cicloFacturacion}
        >
          <span className='truncate max-w-[60px] sm:max-w-none'>
            {row.original.cicloFacturacion}
          </span>
        </Badge>
      );
    },
    minSize: 120,
    maxSize: 160,
  },
  {
    accessorKey: 'potenciaContratada',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Potencia' />
    ),
    cell: ({ row }) => {
      return (
        <div className='flex items-center gap-1 sm:gap-2'>
          <span className='text-xs sm:text-sm font-semibold whitespace-nowrap'>
            {row.original.potenciaContratada}
          </span>
        </div>
      );
    },
    minSize: 100,
    maxSize: 130,
  },
  {
    accessorKey: 'liberadoCorte',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Lib. Corte' />
    ),
    cell: ({ row }) => {
      return row.original.liberadoCorte ? (
        <Badge
          variant='outline'
          className='bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800 text-xs px-1 sm:px-2'
        >
          <span className='hidden sm:inline'>Liberado</span>
          <span className='sm:hidden'>Sí</span>
        </Badge>
      ) : (
        <Badge variant='secondary' className='text-xs px-1 sm:px-2'>
          <span className='hidden sm:inline'>No Liberado</span>
          <span className='sm:hidden'>No</span>
        </Badge>
      );
    },
    minSize: 100,
    maxSize: 140,
  },
  {
    id: 'actions',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Acciones' />
    ),
    cell: ({ row }) => {
      return (
        <div className='flex justify-center'>
          <TableActions
            onEdit={() => onEdit(row.original)}
            onDelete={() => onDelete(row.original)}
            onView={() => onViewDetails(row.original)}
            item={row.original}
            showView={true}
          />
        </div>
      );
    },
    minSize: 80,
    maxSize: 100,
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
