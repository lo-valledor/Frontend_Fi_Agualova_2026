import type { ColumnDef } from "@tanstack/react-table";
import { DataTableColumnHeader } from "~/components/data-table/data-table-column-header";
import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
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
    cell: ({ row }) => {
      const usuario = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Abrir menú</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onEdit(usuario)}>
              <Pencil className="mr-2 h-4 w-4" />
              Editar
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onDelete(usuario.idUsuario)}
              className="text-red-600 dark:text-red-400"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Eliminar
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
