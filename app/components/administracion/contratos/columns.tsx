import type { ColumnDef } from "@tanstack/react-table";
import { DataTableColumnHeader } from "~/components/data-table/data-table-column-header";
import { Badge } from "~/components/ui/badge";
import type { ContratosDisponibles } from "~/types/administracion";
import {
  Hash,
  Building,
  FileText,
  DollarSign,
  Users,
  Calendar,
  MapPin,
  Activity,
  UserCheck,
  UserX,
  Truck,
} from "lucide-react";

export const columns: ColumnDef<ContratosDisponibles>[] = [
  {
    accessorKey: "contratoId",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="ID Contrato" />
    ),
    cell: ({ row }) => {
      const contratoId = row.getValue("contratoId") as string;
      return (
        <div className="flex items-center gap-2">
          <span className="font-mono text-sm font-medium">{contratoId}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "local",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Local" />
    ),
    cell: ({ row }) => {
      const local = row.getValue("local") as string;
      return (
        <div className="flex items-center gap-2">
          <span className="font-medium text-slate-900 dark:text-slate-100">
            {local}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "tipoContrato",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Tipo" />
    ),
    cell: ({ row }) => {
      const tipo = row.getValue("tipoContrato") as string;
      const getColorByType = (tipo: string) => {
        const lower = tipo.toLowerCase();
        if (lower.includes("residencial"))
          return "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800";
        if (lower.includes("comercial"))
          return "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800";
        if (lower.includes("industrial"))
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
    accessorKey: "tarifa",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Tarifa" />
    ),
    cell: ({ row }) => {
      const tarifa = row.getValue("tarifa") as string;
      return (
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
            {tarifa}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "clienteNombre",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Cliente" />
    ),
    cell: ({ row }) => {
      const nombre = row.getValue("clienteNombre") as string;
      const apellidos = row.getValue("clienteApellidos") as string;
      return (
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="font-medium text-slate-900 dark:text-slate-100">
              {nombre} {apellidos}
            </div>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "propietario",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Propietario" />
    ),
    cell: ({ row }) => {
      const propietario = row.getValue("propietario") as string;
      return (
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
            {propietario}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "empresa",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Empresa" />
    ),
    cell: ({ row }) => {
      const empresa = row.getValue("empresa") as string;
      return (
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
            {empresa}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "fechaInicio",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Vigencia" />
    ),
    cell: ({ row }) => {
      const fechaInicio = row.getValue("fechaInicio") as string;
      const fechaFin = row.getValue("fechaFin") as string;
      return (
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="text-xs font-medium text-slate-700 dark:text-slate-300">
              {new Date(fechaInicio).toLocaleDateString("es-CL")}
            </div>
          </div>
          {fechaFin && (
            <div className="text-xs text-muted-foreground ml-7">
              Hasta: {new Date(fechaFin).toLocaleDateString("es-CL")}
            </div>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "direccionEnvio",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Dirección" />
    ),
    cell: ({ row }) => {
      const direccion = row.getValue("direccionEnvio") as string;
      return (
        <div className="flex items-center gap-2 max-w-[200px]">
          <span
            className="text-sm text-slate-700 dark:text-slate-300 truncate"
            title={direccion}
          >
            {direccion}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "limiteInventario",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Límite" />
    ),
    cell: ({ row }) => {
      const limite = row.getValue("limiteInventario") as number;
      return (
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
            {limite.toLocaleString("es-CL")}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "cicloFacturacion",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Ciclo" />
    ),
    cell: ({ row }) => {
      const ciclo = row.getValue("cicloFacturacion") as string;
      return (
        <div className="flex items-center gap-2">
          <Badge
            variant="outline"
            className="bg-teal-100 text-teal-800 border-teal-200 dark:bg-teal-900/20 dark:text-teal-300 dark:border-teal-800 text-xs font-medium"
          >
            {ciclo}
          </Badge>
        </div>
      );
    },
  },
  {
    accessorKey: "estadoActivo",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Estado" />
    ),
    cell: ({ row }) => {
      const isActive = row.getValue("estadoActivo") as boolean;
      return (
        <Badge
          variant={isActive ? "default" : "secondary"}
          className={`text-xs font-medium ${
            isActive
              ? "bg-emerald-100 text-emerald-800 border-emerald-200 hover:bg-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-300 dark:border-emerald-800"
              : "bg-rose-100 text-rose-800 border-rose-200 hover:bg-rose-200 dark:bg-rose-900/20 dark:text-rose-300 dark:border-rose-800"
          }`}
        >
          {isActive ? (
            <>
              <UserCheck className="h-3 w-3 mr-1" />
              Activo
            </>
          ) : (
            <>
              <UserX className="h-3 w-3 mr-1" />
              Inactivo
            </>
          )}
        </Badge>
      );
    },
  },
];
