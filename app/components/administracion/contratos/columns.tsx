import type { ColumnDef } from '@tanstack/react-table';

import { DataTableColumnHeader } from '~/components/data-table/data-table-column-header';
import { TableActions } from '~/components/data-table/table-helpers';
import { Badge } from '~/components/ui/badge';
import { type ContratosRow } from '~/types/administracion';

interface TableColumnsProps {
  onEdit: (contract: ContratosRow) => void;
  onDelete: (contract: ContratosRow) => void;
  onViewDetails: (contract: ContratosRow) => void;
}

// Función para convertir string de fecha a objeto Date (para ordenamiento)
const _parseDateString = (
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
const _formatDateToSpanish = (
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
}: TableColumnsProps): ColumnDef<ContratosRow>[] => [
  {
    accessorKey: 'codigo',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Código" />
    ),
    cell: ({ row }) => {
      return (
        <span className="font-mono text-xs sm:text-sm">
          {row.original.codigo}
        </span>
      );
    },
    size: 120
  },
  {
    accessorKey: 'descripcion',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Descripción" />
    ),
    cell: ({ row }) => {
      return (
        <span className="text-xs sm:text-sm">{row.original.descripcion}</span>
      );
    }
  },
  {
    accessorKey: 'estado',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Estado" />
    ),
    cell: ({ row }) => {
      return (
        <Badge variant="secondary" className="text-xs">
          {row.original.estado}
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
