import type { ColumnDef } from "@tanstack/react-table";
import type { Nichos } from "~/types/mantencion";

export const columns: ColumnDef<Nichos>[] = [
  {
    header: "Código",
    accessorKey: "codigo",
  },
  {
    header: "Nombre",
    accessorKey: "nombre",
  },
  {
    header: "Ubicación",
    accessorKey: "ubicacion",
  },
  {
    header: "Estado",
    accessorKey: "estado",
  },
];
