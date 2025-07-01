/* eslint-disable unused-imports/no-unused-vars */
import type { ColumnDef } from '@tanstack/react-table';
import type { BuscarCargoFacturable } from '~/types/administracion';
import { Button } from '~/components/ui/button';

import { Edit, Calendar, Settings, Box } from 'lucide-react';
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
      const item = row.original;
      return (
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => onEdit(item)}
            title="Editar"
          >
            <Edit className="h-4 w-4" />
          </Button>
        </div>
      );
    },
  },
];
