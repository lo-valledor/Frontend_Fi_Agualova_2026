import type { ColumnDef } from "@tanstack/react-table";
import type { Zonas } from "~/types/mantencion";

export const columns: ColumnDef<Zonas>[] = [
  {
    header: "Nombre",
    accessorKey: "nombre",
  },
  {
    header: "Referencia",
    accessorKey: "referencia",
  },
  {
    header: "Estado",
    accessorKey: "estado",
  },
];
