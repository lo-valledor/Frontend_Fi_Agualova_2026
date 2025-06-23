import type { ColumnDef } from '@tanstack/react-table';
import type { BuscarCargoFacturable } from '~/types/administracion';
import { Button } from '~/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu';
import {
  MoreHorizontal,
  Edit,
  Loader2,
  FileText,
  Calendar,
  Settings,
  Box,
} from 'lucide-react';
import { Badge } from '~/components/ui/badge';
import { DataTableColumnHeader } from '~/components/data-table/data-table-column-header';

interface TableColumnsProps {
  onEdit: (cargo: BuscarCargoFacturable) => void;
  editingCargoId: number | null;
}

export const columns = ({
  onEdit,
  editingCargoId,
}: TableColumnsProps): ColumnDef<BuscarCargoFacturable>[] => [
  {
    id: 'cuenta',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Cuenta" />
    ),
    cell: ({ row }) => {
      return <div className="font-medium">{row.original.cuenta}</div>;
    },
  },
  {
    id: 'descripcion',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Descripción" />
    ),
    cell: ({ row }) => {
      return (
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 bg-gradient-to-br from-sky-400 to-sky-600 rounded-full flex items-center justify-center">
              <FileText className="w-5 h-5 text-white" />
            </div>
          </div>
          <div>
            <div className="font-medium text-gray-900 dark:text-gray-100">
              {row.original.descripcion}
            </div>
            <div className="text-sm text-muted-foreground">
              Código: {row.original.codigoEnerlova}
            </div>
          </div>
        </div>
      );
    },
  },
  {
    id: 'tipo',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Tipo" />
    ),
    cell: ({ row }) => {
      return (
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="flex items-center gap-1">
            <Settings className="w-3 h-3" />
            {row.original.tipo}
          </Badge>
        </div>
      );
    },
  },
  {
    id: 'fijoVariable',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Fijo/Variable" />
    ),
    cell: ({ row }) => {
      const valor = row.original.fijoVariable;
      const esF = valor === 'F' || valor === 'Fijo';

      return (
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="flex items-center gap-1">
            <Box className="w-3 h-3" />
            {esF ? 'Fijo' : 'Variable'}
          </Badge>
        </div>
      );
    },
  },
  {
    id: 'periodicoEventual',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Periódico/Eventual" />
    ),
    cell: ({ row }) => {
      const valor = row.original.periodicoEventual;
      const esPeriodico =
        valor === 'P' || valor === 'Periodico' || valor === 'Periódico';
      const textoMostrar = esPeriodico ? 'Periódico' : 'Eventual';

      return (
        <div className="flex items-center gap-2">
          <Badge
            variant="outline"
            className={
              esPeriodico
                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
            }
          >
            <Calendar className="w-3 h-3 mr-1" />
            {textoMostrar}
          </Badge>
        </div>
      );
    },
  },
  {
    id: 'concepto',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Concepto" />
    ),
    cell: ({ row }) => {
      return <div className="font-medium">{row.original.concepto}</div>;
    },
  },
  {
    id: 'tarifa',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Tarifa" />
    ),
    cell: ({ row }) => {
      return <div className="font-medium">{row.original.tarifa}</div>;
    },
  },
  {
    id: 'tipoMedidor',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Tipo Medidor" />
    ),
    cell: ({ row }) => {
      return <div className="font-medium">{row.original.tipoMedidor}</div>;
    },
  },
  {
    id: 'actions',
    header: 'Acciones',
    cell: ({ row }) => {
      const cargo = row.original;
      const isEditing = editingCargoId === cargo.id;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Abrir menú</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Acciones</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => onEdit(cargo)}
              disabled={isEditing}
              className={isEditing ? 'opacity-50 cursor-not-allowed' : ''}
            >
              {isEditing ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Edit className="mr-2 h-4 w-4" />
              )}
              {isEditing ? 'Cargando...' : 'Editar'}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
