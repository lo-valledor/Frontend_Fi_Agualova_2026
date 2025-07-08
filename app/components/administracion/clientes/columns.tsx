import type { ColumnDef } from '@tanstack/react-table';
import { MapPin, Phone, User, Building2, Mail } from 'lucide-react';
import { DataTableColumnHeader } from '~/components/data-table/data-table-column-header';
import { Badge } from '~/components/ui/badge';
import { TableActions } from '~/components/data-table/table-helpers';
import type { GetClientes } from '~/types/administracion';
import { format } from 'rut.js';

interface ClientesColumnsProps {
  onEdit: (cliente: GetClientes) => void;
  onDetails: (cliente: GetClientes) => void;
  editingClienteRut: string | null;
  detailingClienteRut: string | null;
}

export const columns = ({
  onEdit,
  onDetails,
  editingClienteRut,
  detailingClienteRut,
}: ClientesColumnsProps): ColumnDef<GetClientes>[] => [
  {
    accessorKey: 'rut',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Cliente" />
    ),
    cell: ({ row }) => {
      return (
        <div className="flex items-center gap-3">
          <div className="p-1.5 bg-sky-100 dark:bg-sky-900/30 rounded-md">
            {row.original.esEmpresa ? (
              <Building2 className="h-4 w-4 text-sky-600 dark:text-sky-400" />
            ) : (
              <User className="h-4 w-4 text-sky-600 dark:text-sky-400" />
            )}
          </div>
          <div>
            <div className="font-medium text-slate-900 dark:text-slate-100 truncate max-w-[160px]">
              {row.original.nombreCompleto}
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 font-mono">
              {format(row.getValue('rut'))}
            </div>
          </div>
        </div>
      );
    },
    size: 200,
  },
  {
    accessorKey: 'esEmpresa',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Tipo" />
    ),
    cell: ({ row }) => (
      <Badge
        variant="outline"
        className={
          row.getValue('esEmpresa')
            ? 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-300 dark:border-emerald-800 text-xs font-medium'
            : 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800 text-xs font-medium'
        }
      >
        {row.getValue('esEmpresa') ? 'Empresa' : 'Persona'}
      </Badge>
    ),
    size: 100,
  },
  {
    accessorKey: 'direccion',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Dirección" />
    ),
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <div className="p-1.5 bg-violet-100 dark:bg-violet-900/30 rounded-md">
          <MapPin className="h-4 w-4 text-violet-600 dark:text-violet-400" />
        </div>
        <span className="font-medium text-slate-900 dark:text-slate-100 truncate max-w-[160px]">
          {row.getValue('direccion') || 'N/A'}
        </span>
      </div>
    ),
    size: 180,
  },
  {
    accessorKey: 'comuna',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Comuna" />
    ),
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <div className="p-1.5 bg-cyan-100 dark:bg-cyan-900/30 rounded-md">
          <Building2 className="h-4 w-4 text-cyan-600 dark:text-cyan-400" />
        </div>
        <span className="font-medium text-slate-900 dark:text-slate-100 truncate max-w-[100px]">
          {row.getValue('comuna') || 'N/A'}
        </span>
      </div>
    ),
    size: 120,
  },
  {
    accessorKey: 'telefono',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Teléfono" />
    ),
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <div className="p-1.5 bg-amber-100 dark:bg-amber-900/30 rounded-md">
          <Phone className="h-4 w-4 text-amber-600 dark:text-amber-400" />
        </div>
        <span className="font-medium text-slate-900 dark:text-slate-100 truncate max-w-[120px]">
          {row.getValue('telefono') || 'N/A'}
        </span>
      </div>
    ),
    size: 140,
  },
  {
    accessorKey: 'contacto',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Contacto" />
    ),
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <div className="p-1.5 bg-blue-100 dark:bg-blue-900/30 rounded-md">
          <User className="h-4 w-4 text-blue-600 dark:text-blue-400" />
        </div>
        <span className="font-medium text-slate-900 dark:text-slate-100 truncate max-w-[120px]">
          {row.getValue('contacto') || 'N/A'}
        </span>
      </div>
    ),
    size: 140,
  },
  {
    accessorKey: 'email',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Email" />
    ),
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <div className="p-1.5 bg-purple-100 dark:bg-purple-900/30 rounded-md">
          <Mail className="h-4 w-4 text-purple-600 dark:text-purple-400" />
        </div>
        <span className="font-medium text-slate-900 dark:text-slate-100 truncate max-w-[160px]">
          {row.getValue('email') || 'N/A'}
        </span>
      </div>
    ),
    size: 180,
  },
  {
    id: 'actions',
    header: 'Acciones',
    cell: ({ row }) => {
      return (
        <div className="flex items-center justify-center gap-1">
          <TableActions
            onView={onDetails}
            onEdit={onEdit}
            item={row.original}
            showView={true}
            showDelete={false}
            loadingEdit={editingClienteRut === row.original.rut}
            loadingView={detailingClienteRut === row.original.rut}
          />
        </div>
      );
    },
    size: 100,
    enableSorting: false,
  },
];
