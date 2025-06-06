import type { ColumnDef } from "@tanstack/react-table";
import type { BuscarCargoFacturable } from "~/types/administracion";

export const columns: ColumnDef<BuscarCargoFacturable>[] = [
  {
    header: "ID",
    accessorKey: "id",
  },
  {
    header: "Cuenta",
    accessorKey: "cuenta",
  },
  {
    header: "Descripción",
    accessorKey: "descripcion",
  },
  {
    header: "Fijo/Variable",
    accessorKey: "fijoVariable",
  },
  {
    header: "Periodico/Eventual",
    accessorKey: "periodicoEventual",
  },
  {
    header: "Concepto",
    accessorKey: "concepto",
  },
  {
    header: "Tarifa",
    accessorKey: "tarifa",
  },
  {
    header: "Tipo Medidor",
    accessorKey: "tipoMedidor",
  },
  {
    header: "Tipo",
    accessorKey: "tipo",
  },
  {
    header: "Codigo Enerlova",
    accessorKey: "codigoEnerlova",
  },
];
