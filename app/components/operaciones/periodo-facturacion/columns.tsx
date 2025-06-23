import { type Periodos } from '~/types/operaciones';
import { type ColumnDef } from '@tanstack/react-table';
import CerrarPeriodo from './cerrar-periodo';
import { DataTableColumnHeader } from '~/components/data-table/data-table-column-header';
import { Badge } from '~/components/ui/badge';
import { cn } from '~/lib/utils';

const parseFecha = (fecha: string): Date | null => {
  const [day, month, year] = fecha.split('-').map(Number);

  if (isNaN(day) || isNaN(month) || isNaN(year)) {
    return null;
  }

  const parsedDate = new Date(year, month - 1, day);

  if (
    parsedDate.getDate() !== day ||
    parsedDate.getMonth() !== month - 1 ||
    parsedDate.getFullYear() !== year
  ) {
    return null;
  }

  return parsedDate;
};

// Función para formatear la fecha en formato ISO para ordenamiento
const formatDateForSorting = (fecha: string): string => {
  const parsedDate = parseFecha(fecha);
  if (!parsedDate) return '0000-00-00'; // Valor por defecto para fechas inválidas
  return parsedDate.toISOString().split('T')[0]; // Formato YYYY-MM-DD para ordenamiento correcto
};

export const columns: ColumnDef<Periodos>[] = [
  {
    accessorKey: 'pf_id',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="ID" />
    ),
  },
  {
    accessorKey: 'pf_descripcion',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Descripción" />
    ),
  },
  {
    accessorKey: 'Column1', //Formato DD-MM-YYYY
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Fecha Inicio" />
    ),
    cell: ({ row }) => {
      const periodo = row.original;
      const fechaInicio = parseFecha(periodo.Column1);
      return (
        <div>
          {fechaInicio ? fechaInicio.toLocaleDateString() : 'Fecha inválida'}
        </div>
      );
    },
    sortingFn: (rowA, rowB) => {
      const fechaA = formatDateForSorting(rowA.original.Column1);
      const fechaB = formatDateForSorting(rowB.original.Column1);
      return fechaA.localeCompare(fechaB);
    },
  },
  {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Fecha Fin" />
    ),
    accessorKey: 'Column2', //Formato DD-MM-YYYY
    cell: ({ row }) => {
      const periodo = row.original;
      const fechaFin = parseFecha(periodo.Column2);
      return (
        <div>{fechaFin ? fechaFin.toLocaleDateString() : 'Fecha inválida'}</div>
      );
    },
    sortingFn: (rowA, rowB) => {
      const fechaA = formatDateForSorting(rowA.original.Column2);
      const fechaB = formatDateForSorting(rowB.original.Column2);
      return fechaA.localeCompare(fechaB);
    },
  },
  {
    accessorKey: 'epf_descripcion',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Estado" />
    ),
    cell: ({ row }) => {
      const periodo = row.original;
      const isOpen = periodo.epf_descripcion === 'Abierto';
      return (
        <Badge
          variant={isOpen ? 'default' : 'outline'}
          className={cn(
            isOpen
              ? 'bg-green-100 text-green-800 border-green-300 dark:bg-green-900/30 dark:text-green-300 dark:border-green-700'
              : 'border-red-300 dark:border-red-700',
          )}
        >
          {periodo.epf_descripcion}
        </Badge>
      );
    },
  },
];
