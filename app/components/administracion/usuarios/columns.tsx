import type { ColumnDef } from "@tanstack/react-table";
import { DataTableColumnHeader } from "~/components/data-table/data-table-column-header";
import { Button } from "~/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";
import type { Usuarios } from "~/types/administracion";

interface ColumnsProps {
  onEdit: (usuario: Usuarios) => void;
  onDelete: (id: number) => void;
}

export const createColumns = ({
  onEdit,
  onDelete,
}: ColumnsProps): ColumnDef<Usuarios>[] => [
  {
    accessorKey: "idUsuario",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="ID" />
    ),
  },
  {
    accessorKey: "nombreDeUsuario",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Nombre de Usuario" />
    ),
  },
  {
    accessorKey: "perfilId",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Perfil ID" />
    ),
  },
  {
    accessorKey: "nombres",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Nombres" />
    ),
  },
  {
    accessorKey: "apellidos",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Apellidos" />
    ),
  },
  {
    accessorKey: "departamento",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Departamento" />
    ),
  },
  {
    accessorKey: "activo",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Activo" />
    ),
    cell: ({ row }) => {
      const isActive = row.getValue("activo") as boolean;
      return (
        <span
          className={`px-2 py-1 rounded-full text-xs ${
            isActive
              ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
              : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100"
          }`}
        >
          {isActive ? "Activo" : "Inactivo"}
        </span>
      );
    },
  },
  {
    id: "actions",
    header: "Acciones",
    cell: ({ row }) => {
      const usuario = row.original;

      return (
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEdit(usuario)}
            className="h-8 px-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:text-blue-400 dark:hover:text-blue-300 dark:hover:bg-blue-950"
          >
            <Pencil className="h-3 w-3 mr-1" />
            Editar
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onDelete(usuario.idUsuario)}
            className="h-8 px-2 text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-950"
          >
            <Trash2 className="h-3 w-3 mr-1" />
            Eliminar
          </Button>
        </div>
      );
    },
  },
];
