import type { ColumnDef } from '@tanstack/react-table';

import { DataTableColumnHeader } from '~/components/data-table/data-table-column-header';
import {
  EstadoBadge,
  TableActions
} from '~/components/data-table/table-helpers';
import { Badge } from '~/components/ui/badge';
import { type GetContratos } from '~/types/administracion';

interface TableColumnsProps {
  onEdit: (contract: GetContratos) => void;
  onDelete: (contract: GetContratos) => void;
  onViewDetails: (contract: GetContratos) => void;
}

// Función para convertir string de fecha a objeto Date (para ordenamiento)
const parseDateString = (
  dateValue: string | Date | null | undefined
): Date | null => {
  if (!dateValue) return null;

  if (dateValue instanceof Date) {
    return dateValue;
  }

  if (typeof dateValue === 'string') {
    const dateString = dateValue.trim();

    // Formato DD-MM-YYYY HH:mm:ss (del backend)
    if (/^\d{2}-\d{2}-\d{4}(\s+\d{2}:\d{2}:\d{2})?$/.test(dateString)) {
      const [fechaParte] = dateString.split(' ');
      const [dia, mes, año] = fechaParte.split('-');
      const date = new Date(`${año}-${mes}-${dia}`);
      return Number.isNaN(date.getTime()) ? null : date;
    }

    // Formato DD/MM/YYYY (con barra)
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateString)) {
      const [dia, mes, año] = dateString.split('/');
      const date = new Date(`${año}-${mes}-${dia}`);
      return Number.isNaN(date.getTime()) ? null : date;
    }

    // Formato ISO (YYYY-MM-DD)
    if (/^\d{4}-\d{2}-\d{2}/.test(dateString)) {
      const date = new Date(dateString);
      return Number.isNaN(date.getTime()) ? null : date;
    }
  }

  return null;
};

// Función robusta para formatear fechas en formato español
const formatDateToSpanish = (
  dateValue: string | Date | null | undefined
): string => {
  if (!dateValue) return 'N/A';

  let date: Date;

  // Si es un string, intentar parsearlo
  if (typeof dateValue === 'string') {
    const dateString = dateValue.trim();

    // Formato DD-MM-YYYY HH:mm:ss (del backend)
    // Ejemplo: "31-01-2014 00:00:00" o "24-10-2025"
    if (/^\d{2}-\d{2}-\d{4}(\s+\d{2}:\d{2}:\d{2})?$/.test(dateString)) {
      const [fechaParte] = dateString.split(' '); // Separar fecha de hora
      const [dia, mes, año] = fechaParte.split('-');

      // Crear fecha en formato ISO para evitar ambigüedad
      date = new Date(`${año}-${mes}-${dia}`);

      // Verificar si la fecha es válida
      if (Number.isNaN(date.getTime())) {
        return 'Fecha inválida';
      }

      // Retornar en formato DD/MM/YYYY
      return `${dia}/${mes}/${año}`;
    }

    // Formato DD/MM/YYYY (con barra)
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateString)) {
      const [dia, mes, año] = dateString.split('/');

      // Crear fecha en formato ISO
      date = new Date(`${año}-${mes}-${dia}`);

      if (Number.isNaN(date.getTime())) {
        return 'Fecha inválida';
      }

      return `${dia}/${mes}/${año}`;
    }

    // Formato ISO (YYYY-MM-DD)
    if (/^\d{4}-\d{2}-\d{2}/.test(dateString)) {
      date = new Date(dateString);

      if (Number.isNaN(date.getTime())) {
        return 'Fecha inválida';
      }

      return date.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    }

    // Si no coincide con ningún formato conocido
    return 'Fecha inválida';
  } else {
    date = dateValue;
  }

  // Verificar si la fecha es válida
  if (Number.isNaN(date.getTime())) {
    return 'Fecha inválida';
  }

  // Formatear en español
  return date.toLocaleDateString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

export const columns = ({
  onEdit,
  onDelete,
  onViewDetails
}: TableColumnsProps): ColumnDef<GetContratos>[] => [
  {
    accessorKey: 'codigoContrato',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Contrato" />
    ),
    cell: ({ row }) => {
      return (
        <div className="flex items-center gap-1 sm:gap-2 min-w-0">
          <span className="font-mono text-xs sm:text-sm truncate">
            {row.original.codigoContrato}
          </span>
        </div>
      );
    },
    size: 80
  },
  {
    accessorKey: 'nombreCliente',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Cliente / Propietario" />
    ),
    cell: ({ row }) => (
      <div className="space-y-1 min-w-0">
        <div className="flex items-center gap-1 sm:gap-2">
          <span
            className="text-xs sm:text-sm font-medium"
            title={row.original.nombreCliente}
          >
            {row.original.nombreCliente}
          </span>
        </div>
        <div className="flex items-center gap-1 sm:gap-2">
          <span
            className="text-xs sm:text-sm text-muted-foreground"
            title={row.original.nombrePropietario}
          >
            {row.original.nombrePropietario}
          </span>
        </div>
      </div>
    ),
    size: 250
  },
  {
    accessorKey: 'tipoContrato',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Tipo" />
    ),
    cell: ({ row }) => {
      return (
        <Badge
          variant="outline"
          className="text-xs px-1 sm:px-2"
          title={row.original.tipoContrato}
        >
          <span className="truncate sm:max-w-none">
            {row.original.tipoContrato}
          </span>
        </Badge>
      );
    },
    size: 150
  },
  {
    accessorKey: 'tarifa',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Tarifa" />
    ),
    cell: ({ row }) => {
      return (
        <Badge
          variant="secondary"
          className="text-xs px-1 sm:px-2"
          title={row.original.tarifa}
        >
          <span className="truncate max-w-[150px] sm:max-w-none">
            {row.original.tarifa}
          </span>
        </Badge>
      );
    },
    size: 150
  },

  {
    accessorKey: 'local',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Local" />
    ),
    cell: ({ row }) => {
      return (
        <div className="flex items-center gap-1 sm:gap-2 min-w-0">
          <span
            className="text-xs sm:text-sm truncate max-w-[150px]"
            title={row.original.local}
          >
            {row.original.local}
          </span>
        </div>
      );
    },
    size: 100
  },
  {
    accessorKey: 'fechaInicio',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="F. Inicio" />
    ),
    cell: ({ row }) => {
      return (
        <div className="flex items-center gap-1 sm:gap-2">
          <span className="text-xs sm:text-sm ">
            {formatDateToSpanish(row.original.fechaInicio)}
          </span>
        </div>
      );
    },
    sortingFn: (rowA, rowB, columnId) => {
      const dateA = parseDateString(rowA.getValue(columnId));
      const dateB = parseDateString(rowB.getValue(columnId));

      // Manejar casos donde alguna fecha es null o inválida
      if (!dateA && !dateB) return 0;
      if (!dateA) return 1; // Fechas inválidas van al final
      if (!dateB) return -1;

      // Comparar timestamps
      return dateA.getTime() - dateB.getTime();
    },
    size: 120
  },
  {
    accessorKey: 'activo',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Estado" />
    ),
    cell: ({ row }) => {
      return <EstadoBadge estado={row.original.activo} />;
    },
    size: 80
  },
  {
    accessorKey: 'fechaTermino',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="F. Término" />
    ),
    cell: ({ row }) => {
      const fechaTermino = formatDateToSpanish(row.original.fechaTermino);
      if (fechaTermino === 'N/A' || fechaTermino === 'Fecha inválida') {
        return (
          <Badge variant="outline" className="text-xs px-1 sm:px-2">
            Indefinido
          </Badge>
        );
      }
      return (
        <div className="flex items-center gap-1 sm:gap-2">
          <span className="text-xs sm:text-sm ">{fechaTermino}</span>
        </div>
      );
    },
    sortingFn: (rowA, rowB, columnId) => {
      const dateA = parseDateString(rowA.getValue(columnId));
      const dateB = parseDateString(rowB.getValue(columnId));

      // Manejar casos donde alguna fecha es null o inválida
      if (!dateA && !dateB) return 0;
      if (!dateA) return 1; // Fechas inválidas/indefinidas van al final
      if (!dateB) return -1;

      // Comparar timestamps
      return dateA.getTime() - dateB.getTime();
    },
    size: 120
  },
  {
    accessorKey: 'cicloFacturacion',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Ciclo" />
    ),
    cell: ({ row }) => {
      return (
        <Badge
          variant="outline"
          className="bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/20 dark:text-purple-300 dark:border-purple-800 text-xs px-1 sm:px-2"
          title={row.original.cicloFacturacion}
        >
          <span className="truncate max-w-[60px] sm:max-w-none">
            {row.original.cicloFacturacion}
          </span>
        </Badge>
      );
    },
    size: 130
  },
  {
    accessorKey: 'potenciaContratada',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Potencia" />
    ),
    cell: ({ row }) => {
      return (
        <div className="flex items-center gap-1 sm:gap-2">
          <span className="text-xs sm:text-sm font-semibold ">
            {row.original.potenciaContratada}
          </span>
        </div>
      );
    },
    size: 110
  },
  {
    accessorKey: 'liberadoCorte',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Lib. Corte" />
    ),
    cell: ({ row }) => {
      return row.original.liberadoCorte ? (
        <Badge
          variant="default"
          className="bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800 text-xs px-1 sm:px-2"
        >
          <span className="hidden sm:inline">Sí</span>
        </Badge>
      ) : (
        <Badge
          variant="destructive"
          className="bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800 text-xs px-1 sm:px-2"
        >
          <span className="hidden sm:inline">No</span>
        </Badge>
      );
    },
    size: 120
  },
  {
    id: 'actions',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Acciones" />
    ),
    cell: ({ row }) => {
      return (
        <div className="flex justify-center">
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
    size: 90
  }
];
