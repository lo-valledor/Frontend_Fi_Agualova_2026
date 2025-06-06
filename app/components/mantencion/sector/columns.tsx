import type { ColumnDef } from "@tanstack/react-table";
import type { Sectores } from "~/types/mantencion";

export const columns: ColumnDef<Sectores>[] = [
  {
    header: "Nombre",
    accessorKey: "nombre",
  },
  {
    header: "Zona",
    accessorKey: "zona",
  },
  {
    header: "Estado",
    accessorKey: "estado",
  },
];
