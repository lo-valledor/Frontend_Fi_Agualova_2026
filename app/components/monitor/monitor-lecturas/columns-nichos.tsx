import type { ColumnDef } from "@tanstack/react-table";
import type { MedidorNichoItem } from "~/types/monitor";
import { DataTableColumnHeader } from "~/components/data-table/data-table-column-header";
import { PencilIcon, RotateCcw, Check } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { cn } from "~/lib/utils";
import { Dialog, DialogTrigger } from "~/components/ui/dialog";

// Tipo para las props que se pasan a la función de columnas
interface ColumnsProps {
  handleOpenDialog: (id: number, isOpen: boolean) => void;
  openDialogs: Record<number, boolean>;
  lastEditedId: number | null;
  handleSuccess: (id: number) => void;
}

export const columnsNichos = ({
  handleOpenDialog,
  openDialogs,
  lastEditedId,
  handleSuccess,
}: ColumnsProps): ColumnDef<MedidorNichoItem>[] => [
  {
    id: "numero",
    accessorKey: "Nro",
    header: "#",
    cell: ({ row }) => (
      <div className="font-medium">{row.getValue("numero")}</div>
    ),
    meta: {
      className: "sticky left-0 z-10 bg-slate-50 dark:bg-slate-900/40",
    },
  },
  {
    id: "local",
    accessorKey: "local",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Local" />
    ),
    meta: {
      className: "bg-zinc-50/50 dark:bg-zinc-900/30",
    },
  },
  {
    id: "tarifa",
    accessorKey: "tarifa",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Tarifa" />
    ),
    meta: {
      className: "bg-zinc-50/50 dark:bg-zinc-900/30",
    },
  },
  {
    id: "numero_serie",
    accessorKey: "ME_NSerie",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Nro" />
    ),
    meta: {
      className: "bg-zinc-50/50 dark:bg-zinc-900/30",
    },
  },
  {
    id: "constante",
    accessorKey: "ME_ConstanteMultiplicar",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Constante" />
    ),
    meta: {
      className: "bg-zinc-50/50 dark:bg-zinc-900/30",
    },
  },
  {
    id: "anio_anterior",
    accessorKey: "LM_ConsumoAñoAnterior",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Año" />
    ),
    meta: {
      className: "bg-slate-50/50 dark:bg-slate-900/30",
    },
  },
  {
    id: "mes_anterior",
    accessorKey: "LM_ConsumoMesAnterior",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Mes" />
    ),
    meta: {
      className: "bg-slate-50/50 dark:bg-slate-900/30",
    },
  },
  {
    id: "energia_activa_anterior",
    accessorKey: "LM_ValorUltimaLectura",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Anterior" />
    ),
    meta: {
      className: "bg-red-50/50 dark:bg-red-900/10",
    },
  },
  {
    id: "energia_activa",
    accessorKey: "LMC_EnergiaActiva",
    header: ({ column }) => <DataTableColumnHeader column={column} title="8" />,
    meta: {
      className: "bg-red-50/50 dark:bg-red-900/10",
    },
  },
  {
    id: "consumo_energia_activa",
    accessorKey: "LMC_ConsumoEnergiaActiva",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="C8" />
    ),
    meta: {
      className: "bg-red-50/50 dark:bg-red-900/10 font-medium",
    },
  },
  {
    id: "energia_reactiva_anterior",
    accessorKey: "LMC_ValorUltimaLectEnergiaReactiva",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Anterior" />
    ),
    meta: {
      className: "bg-green-50/50 dark:bg-green-900/10",
    },
  },
  {
    id: "energia_reactiva",
    accessorKey: "LMC_EnergiaReactiva",
    header: ({ column }) => <DataTableColumnHeader column={column} title="9" />,
    meta: {
      className: "bg-green-50/50 dark:bg-green-900/10",
    },
  },
  {
    id: "consumo_energia_reactiva",
    accessorKey: "LMC_ConsumoEnergiaReactiva",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="C9" />
    ),
    meta: {
      className: "bg-green-50/50 dark:bg-green-900/10 font-medium",
    },
  },
  {
    id: "demanda_punta",
    accessorKey: "LMC_DemandaPunta",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="DP" />
    ),
    meta: {
      className: "bg-orange-50/50 dark:bg-orange-900/10 font-medium",
    },
  },
  {
    id: "fecha_demanda_punta",
    accessorKey: "LMC_FechaDemandaPunta",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Fecha" />
    ),
    meta: {
      className: "bg-orange-50/50 dark:bg-orange-900/10",
    },
  },
  {
    id: "hora_demanda_punta",
    accessorKey: "LMC_HoraDemandaPunta",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Hora" />
    ),
    meta: {
      className: "bg-orange-50/50 dark:bg-orange-900/10",
    },
  },
  {
    id: "demanda_suministrada",
    accessorKey: "LMC_DemandaSuministrada",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="DS" />
    ),
    meta: {
      className: "bg-blue-50/50 dark:bg-blue-900/10 font-medium",
    },
  },
  {
    id: "fecha_demanda_suministrada",
    accessorKey: "LMC_FechaDemandaSuminis",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Fecha" />
    ),
    meta: {
      className: "bg-blue-50/50 dark:bg-blue-900/10",
    },
  },
  {
    id: "hora_demanda_suministrada",
    accessorKey: "LMC_HoraDemandaSuminis",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Hora" />
    ),
    meta: {
      className: "bg-blue-50/50 dark:bg-blue-900/10",
    },
  },
  {
    id: "acciones",
    cell: ({ row }) => {
      const result = row.original;
      return (
        <div className=" sticky right-0 z-10">
          {result.Estado === 5 ? (
            <Badge className="bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800">
              En facturación
            </Badge>
          ) : lastEditedId === result.LM_ID ? (
            <Badge className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800 animate-pulse">
              <Check className="mr-1 h-3.5 w-3.5" />
              Actualizado
            </Badge>
          ) : result.Estado === 4 ? (
            <Dialog
              open={openDialogs[result.LM_ID]}
              onOpenChange={(isOpen) => handleOpenDialog(result.LM_ID, isOpen)}
            >
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800 hover:bg-blue-50 dark:hover:bg-blue-900/30"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  Reaperturar
                </Button>
              </DialogTrigger>
            </Dialog>
          ) : (
            <Dialog
              open={openDialogs[result.LM_ID]}
              onOpenChange={(isOpen) => handleOpenDialog(result.LM_ID, isOpen)}
            >
              <DialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-sky-600 dark:text-sky-400 hover:bg-sky-50 dark:hover:bg-sky-900/30"
                >
                  <PencilIcon className="h-4 w-4" />
                  <span className="sr-only">Editar medidor</span>
                </Button>
              </DialogTrigger>
            </Dialog>
          )}
        </div>
      );
    },
    header: "Acción",
    meta: {
      className:
        "sticky right-0 z-20 bg-purple-50/50 dark:bg-purple-900/20 dark:text-white",
    },
  },
];

// Grupos de columnas para el encabezado agrupado
export const columnGroups = [
  {
    id: "medidor",
    title: "Medidor",
    columns: ["numero", "local", "tarifa", "numero_serie", "constante"],
    className: "bg-zinc-700 text-white font-medium",
  },
  {
    id: "consumo_anterior",
    title: "Consumo Anterior",
    columns: ["anio_anterior", "mes_anterior"],
    className: "bg-sky-700 text-white font-medium",
  },
  {
    id: "energia_activa",
    title: "Energía Activa",
    columns: [
      "energia_activa_anterior",
      "energia_activa",
      "consumo_energia_activa",
    ],
    className: "bg-red-700 text-white font-medium",
  },
  {
    id: "energia_reactiva",
    title: "Energía Reactiva",
    columns: [
      "energia_reactiva_anterior",
      "energia_reactiva",
      "consumo_energia_reactiva",
    ],
    className: "bg-green-700 text-white font-medium",
  },
  {
    id: "demanda_punta",
    title: "Demanda Punta 6.1",
    columns: ["demanda_punta", "fecha_demanda_punta", "hora_demanda_punta"],
    className: "bg-orange-700 text-white font-medium",
  },
  {
    id: "demanda_suministrada",
    title: "Demanda Suministrada 6.2",
    columns: [
      "demanda_suministrada",
      "fecha_demanda_suministrada",
      "hora_demanda_suministrada",
    ],
    className: "bg-blue-700 text-white font-medium",
  },
  {
    id: "acciones",
    title: "Acción",
    columns: ["acciones"],
    className:
      "bg-purple-700 text-white font-medium sticky right-0 z-20 justify-center",
  },
];
