import type { ColumnDef } from "@tanstack/react-table";
import { Badge } from "~/components/ui/badge";
import DialogAgregarPrecios from "./dialog-agregar-precios";
import type { PreciosCargoEnel } from "~/types/operaciones";
import { DataTableColumnHeader } from "~/components/data-table/data-table-column-header";
export const columns = (
  mes: string,
  anio: string,
  onSuccess: () => void
): ColumnDef<PreciosCargoEnel>[] => [
  {
    accessorKey: "codigo",
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Código"
        className="justify-center"
      />
    ),
  },
  {
    accessorKey: "codigoener",
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Código Enerlova"
        className="justify-center"
      />
    ),
  },
  {
    accessorKey: "descripcion",
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Descripción"
        className="justify-center"
      />
    ),
  },
  {
    accessorKey: "valor",
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Valor 1"
        className="justify-center"
      />
    ),
  },
  {
    accessorKey: "valor2",
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Valor 2"
        className="justify-center"
      />
    ),
  },
  {
    accessorKey: "valor3",
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Valor 3"
        className="justify-center"
      />
    ),
  },

  {
    accessorKey: "valoractual",
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Valor Actual 1"
        className="justify-center"
      />
    ),
  },
  {
    accessorKey: "valoractual2",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Valor Actual 2" />
    ),
  },
  {
    accessorKey: "valoractual3",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Valor Actual 3" />
    ),
  },
  {
    header: " ",
    cell: ({ row }) => {
      const { valoractual, valoractual2, valoractual3, codigo } = row.original;
      return valoractual === "Sin Valor" ||
        valoractual2 === "Sin Valor" ||
        valoractual3 === "Sin Valor" ? (
        <DialogAgregarPrecios
          valor1={Number(valoractual.replace(",", "."))}
          valor2={Number(valoractual2.replace(",", "."))}
          valor3={Number(valoractual3.replace(",", "."))}
          codigo={codigo}
          mes={mes}
          anio={anio}
          onSuccess={onSuccess}
        />
      ) : (
        <Badge
          variant="outline"
          className="bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800"
        >
          Actualizado
        </Badge>
      );
    },
  },
];
