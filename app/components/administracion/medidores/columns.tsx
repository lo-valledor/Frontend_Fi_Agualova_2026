import type { ColumnDef } from '@tanstack/react-table';

import type { MedidorListItem } from '~/components/administracion/medidores/medidores-types';
import { DataTableColumnHeader } from '~/components/data-table/data-table-column-header';
import {
  EstadoBadge,
  TableActions
} from '~/components/data-table/table-helpers';
import { Badge } from '~/components/ui/badge';

interface MedidoresColumnsProps {
  onEdit: (medidor: MedidorListItem) => void;
  onDelete: (medidor: MedidorListItem) => void;
}

const getTipoBadgeProps = (tipo: string) => {
  const tipoLower = tipo.toLowerCase();
  switch (tipoLower) {
    case 'trifásico':
    case 'trifasico':
      return {
        variant: 'outline' as const,
        className: 'border-blue-500 text-xs sm:text-sm px-1 sm:px-2',
        shortText: 'Tri',
        fullText: 'Trifásico'
      };
    case 'monofásico':
    case 'monofasico':
      return {
        variant: 'outline' as const,
        className:
          'border-emerald-500 text-emerald-600 dark:text-emerald-400 text-xs sm:text-sm px-1 sm:px-2',
        shortText: 'Mono',
        fullText: 'Monofásico'
      };
    case 'ambos':
      return {
        variant: 'outline' as const,
        className:
          'border-purple-500 text-purple-600 dark:text-purple-400 text-xs sm:text-sm px-1 sm:px-2',
        shortText: 'Ambos',
        fullText: 'Ambos'
      };
    default:
      return {
        variant: 'outline' as const,
        className:
          'border-gray-500 text-gray-600 dark:text-gray-400 text-xs sm:text-sm px-1 sm:px-2',
        shortText: 'N/A',
        fullText: tipo
      };
  }
};

export const columns = ({
  onEdit,
  onDelete
}: MedidoresColumnsProps): ColumnDef<MedidorListItem>[] => [
  {
    accessorKey: 'serie',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Serie" />
    ),
    minSize: 120,
    maxSize: 150
  },
  {
    accessorKey: 'idMedidor',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Código" />
    ),
    cell: ({ row }) => {
      const medidor = row.original;
      return (
        <span className="font-mono text-sm font-medium">
          {medidor.idMedidor}
        </span>
      );
    },
    minSize: 100,
    maxSize: 130
  },
  {
    accessorKey: 'marca',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Marca" />
    ),
    minSize: 100,
    maxSize: 130
  },
  {
    accessorKey: 'modelo',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Modelo" />
    ),
    minSize: 100,
    maxSize: 130
  },
  {
    accessorKey: 'digitos',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Dígitos" />
    ),
    minSize: 70,
    maxSize: 90
  },
  {
    accessorKey: 'multiplicador',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Mult." />
    ),
    minSize: 60,
    maxSize: 90
  },
  {
    accessorKey: 'tipo',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Tipo" />
    ),
    cell: ({ row }) => {
      const tipo = row.getValue('tipo') as string;
      const { variant, className, shortText, fullText } =
        getTipoBadgeProps(tipo);
      return (
        <Badge variant={variant} className={className} title={fullText}>
          <span className="hidden sm:inline">{tipo}</span>
          <span className="sm:hidden">{shortText}</span>
        </Badge>
      );
    },
    minSize: 90,
    maxSize: 120
  },
  {
    accessorKey: 'codigoAcometida',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Acometida" />
    ),
    cell: ({ row }) => {
      const value = row.original.codigoAcometida;
      return (
        <Badge
          variant="outline"
          className="bg-sky-100 text-sky-800 border-sky-200 dark:bg-sky-900/20 dark:text-sky-300 dark:border-sky-800 text-sm font-mono"
          title={value}
        >
          <span className="truncate max-w-[100px]">
            {value || 'Sin asociar'}
          </span>
        </Badge>
      );
    },
    minSize: 130,
    maxSize: 180
  },
  {
    accessorKey: 'ubicacion',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Ubicación" />
    ),
    minSize: 120,
    maxSize: 170
  },
  {
    accessorKey: 'fechaInicio',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="F. Inicio" />
    ),
    minSize: 100,
    maxSize: 130
  },
  {
    accessorKey: 'estado',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Estado" />
    ),
    cell: ({ row }) => <EstadoBadge estado={row.getValue('estado')} />,
    minSize: 80,
    maxSize: 100
  },
  {
    id: 'actions',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Acciones" />
    ),
    cell: ({ row }) => {
      const medidor = row.original;
      return (
        <div className="flex items-center justify-center gap-1">
          <TableActions onEdit={onEdit} item={medidor} showView={false} />
        </div>
      );
    },
    minSize: 100,
    maxSize: 120
  }
];
