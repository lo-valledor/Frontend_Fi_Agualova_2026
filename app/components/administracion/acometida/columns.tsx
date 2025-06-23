import type { ColumnDef } from '@tanstack/react-table';
import { DataTableColumnHeader } from '~/components/data-table/data-table-column-header';
import { Badge } from '~/components/ui/badge';
import type { Acometida } from '~/types/administracion';
import { Button } from '~/components/ui/button';
import { Pencil } from 'lucide-react';

interface TableColumnsProps {
  onEdit: (acometida: Acometida) => void;
  editingAcometidaId: number | null;
}

export const columns = ({
  onEdit,
  editingAcometidaId,
}: TableColumnsProps): ColumnDef<Acometida>[] => [
  {
    accessorKey: 'acometidaId',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="ID" />
    ),
    cell: ({ row }) => {
      const id = row.getValue('acometidaId') as number;
      return (
        <div className="flex items-center gap-2">
          <span className="font-mono text-sm font-medium">{id}</span>
        </div>
      );
    },
  },
  {
    accessorKey: 'codigo',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Código" />
    ),
    cell: ({ row }) => {
      const codigo = row.getValue('codigo') as string;
      return (
        <div className="flex items-center gap-2">
          <span className="font-mono text-sm font-medium text-slate-900 dark:text-slate-100">
            {codigo}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: 'ubicacion',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Ubicación" />
    ),
    cell: ({ row }) => {
      const ubicacion = row.getValue('ubicacion') as string;
      return (
        <div className="flex items-center gap-2 max-w-[200px]">
          <span
            className="text-sm text-slate-700 dark:text-slate-300 truncate"
            title={ubicacion}
          >
            {ubicacion}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: 'contratoId',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Contrato" />
    ),
    cell: ({ row }) => {
      const contratoId = row.getValue('contratoId') as string;
      return (
        <div className="flex items-center gap-2">
          <Badge
            variant="outline"
            className="bg-sky-100 text-sky-800 border-sky-200 dark:bg-sky-900/20 dark:text-sky-300 dark:border-sky-800 text-xs font-mono"
          >
            {contratoId}
          </Badge>
        </div>
      );
    },
  },
  {
    accessorKey: 'empalmeDescripcion',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Empalme" />
    ),
    cell: ({ row }) => {
      const empalme = row.getValue('empalmeDescripcion') as string;
      return (
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
            {empalme}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: 'nichoDescripcion',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Nicho" />
    ),
    cell: ({ row }) => {
      const nicho = row.getValue('nichoDescripcion') as string;
      return (
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
            {nicho}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: 'sectorDescripcion',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Sector" />
    ),
    cell: ({ row }) => {
      const sector = row.getValue('sectorDescripcion') as string;
      return (
        <div className="flex items-center gap-2">
          <Badge
            variant="outline"
            className="bg-indigo-100 text-indigo-800 border-indigo-200 dark:bg-indigo-900/20 dark:text-indigo-300 dark:border-indigo-800 text-xs font-medium"
          >
            {sector}
          </Badge>
        </div>
      );
    },
  },
  {
    accessorKey: 'limitePotencia',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Límite Potencia" />
    ),
    cell: ({ row }) => {
      const limite = row.getValue('limitePotencia') as number | null;

      if (limite === null || limite === 0) {
        return (
          <div className="flex items-center gap-2">
            <Badge
              variant="outline"
              className="bg-gray-100 text-gray-600 border-gray-200 dark:bg-gray-900/20 dark:text-gray-400 dark:border-gray-700 text-xs"
            >
              Sin límite
            </Badge>
          </div>
        );
      }

      return (
        <div className="flex items-center gap-2">
          <div className="space-y-0.5">
            <div className="text-sm font-medium text-slate-900 dark:text-slate-100">
              {limite.toLocaleString('es-CL')} kW
            </div>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: 'numeroMedidor',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Número Medidor" />
    ),
    cell: ({ row }) => {
      const numeroMedidor = row.getValue('numeroMedidor') as string;
      return (
        <div className="flex items-center gap-2">
          <span className="font-mono text-sm font-medium text-slate-700 dark:text-slate-300">
            {numeroMedidor}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: 'actions',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Acciones" />
    ),
    cell: ({ row }) => {
      const acometida = row.original;
      const id = row.getValue('acometidaId') as number;
      const isEditing = editingAcometidaId === id;

      return (
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEdit(acometida)}
            disabled={isEditing}
          >
            <Pencil className="h-4 w-4" />
            {isEditing ? 'Editando...' : 'Editar'}
          </Button>
        </div>
      );
    },
  },
];
