import type { ColumnDef } from "@tanstack/react-table";
import DetallePreciosEnerlova from "./detalle-precios-enerlova";
import type { PreciosCargoEnerlova } from "~/types/operaciones";
import { DataTableColumnHeader } from "~/components/data-table-column-header";

export const columns: ColumnDef<PreciosCargoEnerlova>[] = [
  {
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="ID"
        className="justify-center"
      />
    ),
    accessorKey: "CD_ID",
  },
  {
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Código Enerlova"
        className="justify-center"
      />
    ),
    accessorKey: "cd_codigoenerlova",
  },
  {
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Descripción"
        className="justify-center"
      />
    ),
    accessorKey: "CD_Descripcion",
  },
  {
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Valor"
        className="justify-center"
      />
    ),
    accessorKey: "valor",
  },
  {
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Días para terminar"
        className="justify-center"
      />
    ),
    accessorKey: "dias",
  },
  {
    header: " ",
    cell: ({ row }) => {
      const data = row.original;
      return (
        <div className="">
          <DetallePreciosEnerlova codigo={data.CD_ID} />
        </div>
      );
    },
  },
];
