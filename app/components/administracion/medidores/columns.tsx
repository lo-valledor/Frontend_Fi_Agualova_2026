import type { ColumnDef } from "@tanstack/react-table";
import { DataTableColumnHeader } from "~/components/data-table/data-table-column-header";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import type { BuscarMedidores } from "~/types/administracion";
import {
  Hash,
  Building,
  Tag,
  Barcode,
  Calendar,
  Hash as Digits,
  X,
  MapPin,
  Activity,
  Gauge,
  Pencil,
  Trash2,
  Zap,
} from "lucide-react";

interface ColumnsProps {
  onEdit: (medidor: BuscarMedidores) => void;
  onDelete: (codigo: number) => void;
}

export const createColumns = ({
  onEdit,
  onDelete,
}: ColumnsProps): ColumnDef<BuscarMedidores>[] => [
  {
    accessorKey: "codigo",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Código" />
    ),
    cell: ({ row }) => {
      const codigo = row.getValue("codigo") as number;
      return (
        <div className="flex items-center gap-2">
          <span className="font-mono text-sm font-medium">{codigo}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "marca",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Marca" />
    ),
    cell: ({ row }) => {
      const marca = row.getValue("marca") as string;
      return (
        <div className="flex items-center gap-2">
          <span className="font-medium text-slate-900 dark:text-slate-100">
            {marca}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "tipo",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Tipo" />
    ),
    cell: ({ row }) => {
      const tipo = row.getValue("tipo") as string;
      const getColorByType = (tipo: string) => {
        const lower = tipo.toLowerCase();
        if (lower.includes("monofasico"))
          return "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800";
        if (lower.includes("trifasico"))
          return "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800";
        if (lower.includes("ambos"))
          return "bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/20 dark:text-purple-300 dark:border-purple-800";
        return "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900/20 dark:text-gray-300 dark:border-gray-800";
      };

      return (
        <div className="flex items-center gap-2">
          <Badge
            variant="outline"
            className={`text-xs font-medium ${getColorByType(tipo)}`}
          >
            {tipo}
          </Badge>
        </div>
      );
    },
  },
  {
    accessorKey: "modelo",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Modelo" />
    ),
    cell: ({ row }) => {
      const modelo = row.getValue("modelo") as string;
      return (
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
            {modelo}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "serie",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Serie" />
    ),
    cell: ({ row }) => {
      const serie = row.getValue("serie") as string;
      return (
        <div className="flex items-center gap-2">
          <span className="font-mono text-sm font-medium text-slate-700 dark:text-slate-300">
            {serie}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "fechaInicio",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Fecha Inicio" />
    ),
    cell: ({ row }) => {
      const fechaInicio = row.getValue("fechaInicio") as string;
      return (
        <div className="flex items-center gap-2">
          <div className="text-xs font-medium text-slate-700 dark:text-slate-300">
            {new Date(fechaInicio).toLocaleDateString("es-CL")}
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "digitos",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Dígitos" />
    ),
    cell: ({ row }) => {
      const digitos = row.getValue("digitos") as number;
      return (
        <div className="flex items-center gap-2">
          <Badge
            variant="outline"
            className="bg-indigo-100 text-indigo-800 border-indigo-200 dark:bg-indigo-900/20 dark:text-indigo-300 dark:border-indigo-800 text-xs font-medium"
          >
            {digitos} dígitos
          </Badge>
        </div>
      );
    },
  },
  {
    accessorKey: "multiplicar",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Multiplicador" />
    ),
    cell: ({ row }) => {
      const multiplicar = row.getValue("multiplicar") as number;
      return (
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-teal-100 dark:bg-teal-900/30 rounded-md">
            <X className="h-3 w-3 text-teal-600 dark:text-teal-400" />
          </div>
          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
            {multiplicar}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "ubicacion",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Ubicación" />
    ),
    cell: ({ row }) => {
      const ubicacion = row.getValue("ubicacion") as string;
      return (
        <div className="flex items-center gap-2 max-w-[150px]">
          <span
            className="text-sm text-slate-700 dark:text-slate-300 truncate"
            title={ubicacion}
          >
            {ubicacion || "Sin ubicación"}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "estado",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Estado" />
    ),
    cell: ({ row }) => {
      const estado = row.getValue("estado") as string;
      const isActive = estado.toLowerCase().includes("activo");

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
          {estado}
        </Badge>
      );
    },
  },
  {
    accessorKey: "codigoAcometida",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Acometida" />
    ),
    cell: ({ row }) => {
      const codigoAcometida = row.getValue("codigoAcometida") as string;
      return (
        <div className="flex items-center gap-2">
          <Badge
            variant="outline"
            className="bg-cyan-100 text-cyan-800 border-cyan-200 dark:bg-cyan-900/20 dark:text-cyan-300 dark:border-cyan-800 text-xs font-mono"
          >
            {codigoAcometida || "Sin asignar"}
          </Badge>
        </div>
      );
    },
  },
  {
    id: "actions",
    header: "Acciones",
    cell: ({ row }) => {
      const medidor = row.original;

      return (
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEdit(medidor)}
            className="h-8 px-3 text-sky-600 hover:text-sky-700 hover:bg-sky-50 border-sky-200 dark:text-sky-400 dark:hover:text-sky-300 dark:hover:bg-sky-950/50 dark:border-sky-800"
          >
            <Pencil className="h-3 w-3 mr-1.5" />
            Editar
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onDelete(medidor.codigo)}
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
