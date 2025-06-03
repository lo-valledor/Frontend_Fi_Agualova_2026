import type { ColumnDef } from "@tanstack/react-table";
import { DataTableColumnHeader } from "~/components/data-table/data-table-column-header";
import type { ConsultarMantenedorRevisionCorte } from "~/types/operaciones";

export const columns: ColumnDef<ConsultarMantenedorRevisionCorte>[] = [
  {
    accessorKey: "ctId",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="ID" />
    ),
  },
  {
    accessorKey: "seCodigo",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Código" />
    ),
  },
  {
    accessorKey: "meNSerie",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="N° Serie" />
    ),
  },
  {
    accessorKey: "clRut",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="RUT" />
    ),
  },
  {
    accessorKey: "clRazonSocialCompleto",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Razón Social" />
    ),
  },
  {
    accessorKey: "niDescripcion",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Descripción" />
    ),
  },
  {
    accessorKey: "secDescripcion",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Sección" />
    ),
  },
  {
    accessorKey: "reEstado",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Estado" />
    ),
  },
  {
    accessorKey: "reCantDocumentos",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Cantidad de Documentos" />
    ),
  },
  {
    accessorKey: "reDeudaTotal",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Deuda Total" />
    ),
  },
  {
    header: "Acciones",
    cell: ({ row }) => {
      const periodo = row.original;
      return (
        <div className="flex gap-2">
          {/* {periodo.epf_descripcion === "Abierto" ? (
            <CerrarPeriodo periodoId={periodo.pf_id} />
          ) : (
            <ConfirmarReapertura periodoId={periodo.pf_id} clave={30} />
          )} */}
        </div>
      );
    },
  },
];
