import type { ColumnDef } from "@tanstack/react-table";
import { DataTableColumnHeader } from "~/components/data-table/data-table-column-header";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { Pencil, Trash2, User, Building, Shield, Hash } from "lucide-react";
import type { Usuarios } from "~/types/administracion";

interface ColumnsProps {
  onEdit: (usuario: Usuarios) => void;
  onDelete: (id: number) => void;
}

// Mapeo de perfiles para mostrar nombres más amigables
const perfilNombres: Record<number, { nombre: string; color: string }> = {
  1: {
    nombre: "Administrador",
    color:
      "bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/20 dark:text-purple-300 dark:border-purple-800",
  },
  2: {
    nombre: "Usuario",
    color:
      "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800",
  },
  3: {
    nombre: "Operador",
    color:
      "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-300 dark:border-emerald-800",
  },
  4: {
    nombre: "Supervisor",
    color:
      "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/20 dark:text-amber-300 dark:border-amber-800",
  },
};

// Mapeo de departamentos
const departamentoNombres: Record<number, string> = {
  1: "Administración",
  2: "Operaciones",
  3: "Comercial",
  4: "Sistemas",
  5: "Contabilidad",
};

export const createColumns = ({
  onEdit,
  onDelete,
}: ColumnsProps): ColumnDef<Usuarios>[] => [
  {
    accessorKey: "idUsuario",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="ID" />
    ),
    cell: ({ row }) => {
      const id = row.getValue("idUsuario") as number;
      return (
        <div className="flex items-center gap-2">
          <span className="font-mono text-sm font-medium">{id}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "nombreDeUsuario",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Usuario" />
    ),
    cell: ({ row }) => {
      const username = row.getValue("nombreDeUsuario") as string;
      return (
        <div className="flex items-center gap-2">
          <span className="font-medium text-slate-900 dark:text-slate-100">
            {username}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "nombres",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Nombre Completo" />
    ),
    cell: ({ row }) => {
      const nombres = row.getValue("nombres") as string;
      const apellidos = row.getValue("apellidos") as string;
      return (
        <div className="space-y-1">
          <div className="font-medium text-slate-900 dark:text-slate-100">
            {nombres} {apellidos}
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "perfilId",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Perfil" />
    ),
    cell: ({ row }) => {
      const perfilId = row.getValue("perfilId") as number;
      const perfil = perfilNombres[perfilId] || {
        nombre: `Perfil ${perfilId}`,
        color:
          "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900/20 dark:text-gray-300 dark:border-gray-800",
      };

      return (
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-purple-100 dark:bg-purple-900/30 rounded-md">
            <Shield className="h-3 w-3 text-purple-600 dark:text-purple-400" />
          </div>
          <Badge
            variant="outline"
            className={`text-xs font-medium ${perfil.color}`}
          >
            {perfil.nombre}
          </Badge>
        </div>
      );
    },
  },
  {
    accessorKey: "departamento",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Departamento" />
    ),
    cell: ({ row }) => {
      const departamentoId = row.getValue("departamento") as number;
      const departamento =
        departamentoNombres[departamentoId] || `Departamento ${departamentoId}`;

      return (
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-emerald-100 dark:bg-emerald-900/30 rounded-md">
            <Building className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
          </div>
          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
            {departamento}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "activo",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Estado" />
    ),
    cell: ({ row }) => {
      const isActive = row.getValue("activo") as boolean;
      return (
        <Badge
          variant={isActive ? "default" : "secondary"}
          className={`text-xs font-medium ${
            isActive
              ? "bg-emerald-100 text-emerald-800 border-emerald-200 hover:bg-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-300 dark:border-emerald-800"
              : "bg-rose-100 text-rose-800 border-rose-200 hover:bg-rose-200 dark:bg-rose-900/20 dark:text-rose-300 dark:border-rose-800"
          }`}
        >
          <div
            className={`w-2 h-2 rounded-full mr-1.5 ${
              isActive ? "bg-emerald-500" : "bg-rose-500"
            }`}
          />
          {isActive ? "Activo" : "Inactivo"}
        </Badge>
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
            className="h-8 px-3 text-sky-600 hover:text-sky-700 hover:bg-sky-50 border-sky-200 dark:text-sky-400 dark:hover:text-sky-300 dark:hover:bg-sky-950/50 dark:border-sky-800"
          >
            <Pencil className="h-3 w-3 mr-1.5" />
            Editar
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onDelete(usuario.idUsuario)}
            className="h-8 px-3 text-rose-600 hover:text-rose-700 hover:bg-rose-50 border-rose-200 dark:text-rose-400 dark:hover:text-rose-300 dark:hover:bg-rose-950/50 dark:border-rose-800"
          >
            <Trash2 className="h-3 w-3 mr-1.5" />
            Eliminar
          </Button>
        </div>
      );
    },
  },
];
