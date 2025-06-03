import { type CalculoPrefacturaCompleto } from "~/types/operaciones";
import { type ColumnDef } from "@tanstack/react-table";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { ChevronDown, ChevronRight } from "lucide-react";
import { Checkbox } from "~/components/ui/checkbox";

export const columns: ColumnDef<CalculoPrefacturaCompleto>[] = [
  {
    id: "expander",
    header: () => null,
    cell: ({ row }) => {
      return (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => row.toggleExpanded()}
          className="p-0 h-8 w-8 hover:bg-sky-50 dark:hover:bg-sky-900/20"
        >
          {row.getIsExpanded() ? (
            <ChevronDown className="h-4 w-4 text-sky-600 dark:text-sky-400" />
          ) : (
            <ChevronRight className="h-4 w-4 text-sky-600 dark:text-sky-400" />
          )}
        </Button>
      );
    },
  },
  {
    id: "facturar",
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected()}
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Seleccionar todo"
        className="border-sky-300 data-[state=checked]:bg-sky-600"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Seleccionar fila"
        className="border-sky-300 data-[state=checked]:bg-sky-600"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    header: "Sector",
    accessorKey: "sector",
    cell: ({ row }) => {
      const sector = row.getValue("sector") as string;
      return (
        <Badge
          variant="outline"
          className="bg-slate-50 dark:bg-slate-900/30 border-slate-300 dark:border-slate-600"
        >
          {sector}
        </Badge>
      );
    },
  },
  {
    header: "Contrato",
    accessorKey: "contratoId",
    cell: ({ row }) => {
      const contrato = row.getValue("contratoId") as string;
      return (
        <span className="font-mono text-sm font-medium text-sky-700 dark:text-sky-300">
          {contrato}
        </span>
      );
    },
  },
  {
    header: "Tarifa",
    accessorKey: "codigoTarifa",
    cell: ({ row }) => {
      const tarifa = row.getValue("codigoTarifa") as string;
      return (
        <Badge
          variant="secondary"
          className="bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800"
        >
          {tarifa}
        </Badge>
      );
    },
  },
  {
    header: "RUT Cliente",
    accessorKey: "rutCliente",
    cell: ({ row }) => {
      const rut = row.getValue("rutCliente") as string;
      return <span className="font-mono text-sm">{rut}</span>;
    },
  },
  {
    header: "Nombre Cliente",
    accessorKey: "nombreCliente",
    cell: ({ row }) => {
      const nombre = row.getValue("nombreCliente") as string;
      return (
        <span
          className="font-medium text-slate-700 dark:text-slate-300 truncate max-w-48"
          title={nombre}
        >
          {nombre}
        </span>
      );
    },
  },
  {
    header: "Local",
    accessorKey: "localId",
    cell: ({ row }) => {
      const local = row.getValue("localId") as string;
      return (
        <Badge
          variant="outline"
          className="bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800"
        >
          {local}
        </Badge>
      );
    },
  },
  {
    header: "Dirección",
    accessorKey: "direccion",
    cell: ({ row }) => {
      const direccion = row.getValue("direccion") as string;
      return (
        <span
          className="text-sm text-slate-600 dark:text-slate-400 truncate max-w-48"
          title={direccion}
        >
          {direccion}
        </span>
      );
    },
  },
  {
    header: "Comuna",
    accessorKey: "comuna",
    cell: ({ row }) => {
      const comuna = row.getValue("comuna") as string;
      return (
        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
          {comuna}
        </span>
      );
    },
  },
  {
    header: "N° Serie",
    accessorKey: "numeroSerie",
    cell: ({ row }) => {
      const serie = row.getValue("numeroSerie") as string;
      return (
        <span className="font-mono text-xs bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded border">
          {serie}
        </span>
      );
    },
  },
  {
    header: "Fecha Lectura",
    accessorKey: "fechaLectura",
    cell: ({ row }) => {
      const fecha = row.getValue("fechaLectura") as string;
      return fecha ? (
        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
          {new Date(fecha).toLocaleDateString("es-CL")}
        </span>
      ) : (
        <span className="text-xs text-muted-foreground">Sin fecha</span>
      );
    },
  },
  {
    header: "Consumo",
    accessorKey: "consumoPeriodo",
    cell: ({ row }) => {
      const consumo = row.getValue("consumoPeriodo") as number;
      return (
        <div className="text-right">
          <span className="font-medium text-slate-700 dark:text-slate-300">
            {consumo?.toLocaleString("es-CL") || "0"}
          </span>
          <span className="text-xs text-muted-foreground ml-1">m³</span>
        </div>
      );
    },
  },
  {
    header: "Lectura ID",
    accessorKey: "lecturaId",
    cell: ({ row }) => {
      const lectura = row.getValue("lecturaId") as string;
      return (
        <span className="font-mono text-xs text-muted-foreground">
          {lectura}
        </span>
      );
    },
  },
  {
    header: "Total Facturado",
    accessorKey: "totalFacturado",
    cell: ({ row }) => {
      const total = row.getValue("totalFacturado") as number;
      return (
        <div className="text-right">
          <span className="font-semibold text-emerald-700 dark:text-emerald-300">
            {new Intl.NumberFormat("es-CL", {
              style: "currency",
              currency: "CLP",
            }).format(total || 0)}
          </span>
        </div>
      );
    },
  },
  {
    header: "Total a Pagar",
    accessorKey: "totalAPagar",
    cell: ({ row }) => {
      const total = row.getValue("totalAPagar") as number;
      const totalFacturado = row.getValue("totalFacturado") as number;
      /* const difference = (total || 0) - (totalFacturado || 0); */

      return (
        <div className="text-right">
          <span className="font-semibold text-sky-700 dark:text-sky-300">
            {new Intl.NumberFormat("es-CL", {
              style: "currency",
              currency: "CLP",
            }).format(totalFacturado || 0)}
          </span>
        </div>
      );
    },
  },
];
