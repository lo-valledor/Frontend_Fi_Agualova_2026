import type { ColumnDef } from "@tanstack/react-table";
import type { Empalme } from "~/types/mantencion";

export const columns: ColumnDef<Empalme>[] = [
  {
    header: "Código",
    accessorKey: "codigo",
  },
  {
    header: "Nombre",
    accessorKey: "nombre",
  },

  {
    header: "Código Cliente",
    accessorKey: "codigoCliente",
  },
  {
    header: "Potencia Contratada",
    accessorKey: "potenciaContratada",
  },
  {
    header: "Tarifa",
    accessorKey: "tarifa",
  },
];
