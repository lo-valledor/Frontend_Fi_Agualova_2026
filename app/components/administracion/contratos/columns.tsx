import type { ColumnDef } from "@tanstack/react-table";
import { Building, Shield, MapPin, Calendar, User, FileText } from "lucide-react";
import { DataTableColumnHeader } from "~/components/data-table/data-table-column-header";
import { Badge } from "~/components/ui/badge";
import type { GetContratos } from "~/types/administracion";
import DetallesContrato from "./detalles-contrato";

export const columns: ColumnDef<GetContratos>[] = [
  {
    header: "Detalles",
    cell: ({ row }) => {
      const codigoContrato = row.getValue("codigoContrato") as string;
      return (
       <DetallesContrato codigoContrato={codigoContrato} />
      );
    },
  },
  {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Código Contrato" />
    ),
    accessorKey: "codigoContrato",
    cell: ({ row }) => {
      const codigoContrato = row.getValue("codigoContrato") as string;
      return (
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-sky-100 dark:bg-sky-900/30 rounded-md">
            <FileText className="h-3 w-3 text-sky-600 dark:text-sky-400" />
          </div>
          <span className="font-mono text-sm font-medium text-sky-800 dark:text-sky-200">{codigoContrato}</span>
        </div>
      );
    },
  },
  {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Acometida" />
    ),
    accessorKey: "acometida",
    cell: ({ row }) => {
      const acometida = row.getValue("acometida") as string;
      return (
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-amber-100 dark:bg-amber-900/30 rounded-md">
            <Building className="h-3 w-3 text-amber-600 dark:text-amber-400" />
          </div>
          <span className="font-mono text-sm font-medium text-slate-700 dark:text-slate-300">{acometida}</span>
        </div>
      );
    },
  },
  {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Tipo Contrato" />
    ),
    accessorKey: "tipoContrato",
    cell: ({ row }) => {
      const tipoContrato = row.getValue("tipoContrato") as string;
      return (
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs font-medium bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800">
            <Building className="h-3 w-3 mr-1" />
            {tipoContrato}
          </Badge>
        </div>
      );
    },
  },
  {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Tarifa" />
    ),
    accessorKey: "tarifa",
    cell: ({ row }) => {
      const tarifa = row.getValue("tarifa") as string;

      const getTarifaColor = (tarifa: string) => {
        switch (tarifa) {
          case "BT-1":
            return "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800";
          case "BT-2":
            return "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800";
          case "BT-3":
            return "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800";
          default:
            return "bg-slate-100 dark:bg-slate-900/30 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800";
        }
      };

      return (
        <div className="flex items-center gap-2">
          <Badge variant="outline" className={`text-xs font-medium ${getTarifaColor(tarifa)}`}>
            <Shield className="h-3 w-3 mr-1" />
            {tarifa}
          </Badge>
        </div>
      );
    },
  },
  {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Propietario" />
    ),
    accessorKey: "nombrePropietario",
    cell: ({ row }) => {
      const nombrePropietario = row.getValue("nombrePropietario") as string;
      return (
        <div className="flex items-center gap-2 max-w-[200px]">
          <div className="p-1.5 bg-emerald-100 dark:bg-emerald-900/30 rounded-md">
            <User className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
          </div>
          <span
            className="text-sm font-medium text-slate-700 dark:text-slate-300 truncate"
            title={nombrePropietario}
          >
            {nombrePropietario}
          </span>
        </div>
      );
    },
  },
  {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Cliente" />
    ),
    accessorKey: "nombreCliente",
    cell: ({ row }) => {
      const nombreCliente = row.getValue("nombreCliente") as string;
      return (
        <div className="flex items-center gap-2 max-w-[200px]">
          <div className="p-1.5 bg-blue-100 dark:bg-blue-900/30 rounded-md">
            <User className="h-3 w-3 text-blue-600 dark:text-blue-400" />
          </div>
          <span
            className="text-sm font-medium text-slate-700 dark:text-slate-300 truncate"
            title={nombreCliente}
          >
            {nombreCliente}
          </span>
        </div>
      );
    },
  },
  {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Local" />
    ),
    accessorKey: "local",
    cell: ({ row }) => {
      const local = row.getValue("local") as string;
      return (
        <div className="flex items-center gap-2 max-w-[150px]">
          <div className="p-1.5 bg-teal-100 dark:bg-teal-900/30 rounded-md">
            <Building className="h-3 w-3 text-teal-600 dark:text-teal-400" />
          </div>
          <span
            className="text-sm font-medium text-slate-700 dark:text-slate-300 truncate"
            title={local}
          >
            {local}
          </span>
        </div>
      );
    },
  },
  {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Fecha Inicio" />
    ),
    accessorKey: "fechaInicio",
    cell: ({ row }) => {
      const fechaInicio = row.getValue("fechaInicio") as string;
      const fecha = new Date(fechaInicio);
      const fechaFormateada = fecha.toLocaleDateString("es-CL", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric"
      });

      return (
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-cyan-100 dark:bg-cyan-900/30 rounded-md">
            <Calendar className="h-3 w-3 text-cyan-600 dark:text-cyan-400" />
          </div>
          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
            {fechaFormateada}
          </span>
        </div>
      );
    },
  },
  {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Estado" />
    ),
    accessorKey: "activo",
    cell: ({ row }) => {
      const activo = row.getValue("activo") as boolean;
      return (
        <div className="flex items-center gap-2">
          <Badge
            variant={activo ? "default" : "secondary"}
            className={`text-xs font-medium ${
              activo
                ? "bg-emerald-100 text-emerald-800 border-emerald-200 hover:bg-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-300 dark:border-emerald-800"
                : "bg-rose-100 text-rose-800 border-rose-200 hover:bg-rose-200 dark:bg-rose-900/20 dark:text-rose-300 dark:border-rose-800"
            }`}
          >
            <div
              className={`w-2 h-2 rounded-full mr-1.5 ${
                activo ? "bg-emerald-500" : "bg-rose-500"
              }`}
            />
            {activo ? "Activo" : "Inactivo"}
          </Badge>
        </div>
      );
    },
  },
  {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Fecha Término" />
    ),
    accessorKey: "fechaTermino",
    cell: ({ row }) => {
      const fechaTermino = row.getValue("fechaTermino") as string;

      if (!fechaTermino) {
        return (
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-slate-100 dark:bg-slate-900/30 rounded-md">
              <Calendar className="h-3 w-3 text-slate-400" />
            </div>
            <span className="text-sm text-slate-500 dark:text-slate-400 italic">Sin fecha</span>
          </div>
        );
      }

      const fecha = new Date(fechaTermino);
      const fechaFormateada = fecha.toLocaleDateString("es-CL", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric"
      });

      return (
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-orange-100 dark:bg-orange-900/30 rounded-md">
            <Calendar className="h-3 w-3 text-orange-600 dark:text-orange-400" />
          </div>
          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
            {fechaFormateada}
          </span>
        </div>
      );
    },
  },
  {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Comuna Envío" />
    ),
    accessorKey: "comunaEnvio",
    cell: ({ row }) => {
      const comunaEnvio = row.getValue("comunaEnvio") as string;
      return (
        <div className="flex items-center gap-2 max-w-[150px]">
          <div className="p-1.5 bg-violet-100 dark:bg-violet-900/30 rounded-md">
            <MapPin className="h-3 w-3 text-violet-600 dark:text-violet-400" />
          </div>
          <span
            className="text-sm font-medium text-slate-700 dark:text-slate-300 truncate"
            title={comunaEnvio}
          >
            {comunaEnvio}
          </span>
        </div>
      );
    },
  },
  {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Dirección Envío" />
    ),
    accessorKey: "direccionEnvio",
    cell: ({ row }) => {
      const direccionEnvio = row.getValue("direccionEnvio") as string;
      return (
        <div className="flex items-center gap-2 max-w-[200px]">
          <div className="p-1.5 bg-pink-100 dark:bg-pink-900/30 rounded-md">
            <MapPin className="h-3 w-3 text-pink-600 dark:text-pink-400" />
          </div>
          <span
            className="text-sm text-slate-600 dark:text-slate-400 truncate"
            title={direccionEnvio}
          >
            {direccionEnvio}
          </span>
        </div>
      );
    },
  },
  {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Límite Invierno" />
    ),
    accessorKey: "limiteInvierno",
    cell: ({ row }) => {
      const limiteInvierno = row.getValue("limiteInvierno") as number;
      return (
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-ice-100 dark:bg-slate-900/30 rounded-md">
            <Shield className="h-3 w-3 text-blue-600 dark:text-blue-400" />
          </div>
          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
            {limiteInvierno.toLocaleString("es-CL")} kWh
          </span>
        </div>
      );
    },
  },
  {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Promedio Anual" />
    ),
    accessorKey: "promedioAnual",
    cell: ({ row }) => {
      const promedioAnual = row.getValue("promedioAnual") as string;
      return (
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-yellow-100 dark:bg-yellow-900/30 rounded-md">
            <Shield className="h-3 w-3 text-yellow-600 dark:text-yellow-400" />
          </div>
          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
            {promedioAnual}
          </span>
        </div>
      );
    },
  },
  {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Ciclo Facturación" />
    ),
    accessorKey: "cicloFacturacion",
    cell: ({ row }) => {
      const cicloFacturacion = row.getValue("cicloFacturacion") as string;
      return (
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800">
            <Calendar className="h-3 w-3 mr-1" />
            {cicloFacturacion}
          </Badge>
        </div>
      );
    },
  },
  {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Potencia Contratada" />
    ),
    accessorKey: "potenciaContratada",
    cell: ({ row }) => {
      const potenciaContratada = row.getValue("potenciaContratada") as string;
      return (
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-red-100 dark:bg-red-900/30 rounded-md">
            <Shield className="h-3 w-3 text-red-600 dark:text-red-400" />
          </div>
          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
            {potenciaContratada}
          </span>
        </div>
      );
    },
  },
  {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Liberado Corte" />
    ),
    accessorKey: "liberadoCorte",
    cell: ({ row }) => {
      const liberadoCorte = row.getValue("liberadoCorte") as boolean;
      return (
        <div className="flex items-center gap-2">
          <Badge
            variant={liberadoCorte ? "default" : "secondary"}
            className={`text-xs font-medium ${
              liberadoCorte
                ? "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800"
                : "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900/20 dark:text-gray-300 dark:border-gray-800"
            }`}
          >
            <Shield className="h-3 w-3 mr-1" />
            {liberadoCorte ? "Liberado" : "No Liberado"}
          </Badge>
        </div>
      );
    },
  },
];
