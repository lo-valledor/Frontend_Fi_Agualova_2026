import { type RevisarPrecioDos } from "~/types/operaciones";
import { type ColumnDef } from "@tanstack/react-table";
import { Badge } from "~/components/ui/badge";
import { Checkbox } from "~/components/ui/checkbox";
import DialogModificarPrecio from "./dialog-modificar-precio";

export const columnsEnerlova: ColumnDef<RevisarPrecioDos>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Seleccionar todo"
        className="translate-y-[2px]"
      />
    ),
    cell: ({ row }) => {
      return (
        <div className="text-center">
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label="Seleccionar fila"
            className="translate-y-[2px]"
            disabled={row.original.confirmacion === "Confirmado"}
          />
        </div>
      );
    },
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "codigo",
    header: "Código",
    cell: ({ row }) => {
      return <div className="text-center">{row.original.codigo}</div>;
    },
  },
  {
    accessorKey: "codigoEner",
    header: "Código Energía",
    cell: ({ row }) => {
      return <div className="text-center">{row.original.codigoEner}</div>;
    },
  },
  {
    accessorKey: "descripcion",
    header: "Descripción",
    cell: ({ row }) => {
      return <div className="text-center">{row.original.descripcion}</div>;
    },
  },
  {
    accessorKey: "valor",
    header: "Valor",
    cell: ({ row }) => {
      return (
        <div className="text-center font-medium text-sky-700 dark:text-sky-300">
          {row.original.valor}
        </div>
      );
    },
  },
  {
    accessorKey: "confirmacion",
    header: "Estado",
    cell: ({ row }) => {
      return (
        <div className="text-center">
          {row.original.confirmacion === "Confirmado" ? (
            <Badge className="bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800">
              Confirmado
            </Badge>
          ) : (
            <Badge
              variant="outline"
              className="bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800"
            >
              Pendiente
            </Badge>
          )}
        </div>
      );
    },
  },
  {
    id: "acciones",
    header: "Modificar",
    cell: ({ row }) => {
      return (
        <div className="text-center">
          {row.original.confirmacion === "Confirmado" ? (
            <Badge className="bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800">
              Confirmado
            </Badge>
          ) : (
            <DialogModificarPrecio
              isAuthorized={true}
              indice={row.index}
              descripcion={row.original.descripcion}
              valorActual={row.original.valor}
              onSuccess={() => {}}
            />
          )}
        </div>
      );
    },
  },
];
