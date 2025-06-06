import type { ColumnDef } from "@tanstack/react-table";
import type { ContratosDisponiblesPorId } from "~/types/administracion";

export const detailsColumns: ColumnDef<ContratosDisponiblesPorId>[] = [
  {
    accessorKey: "tipoContrato",
    header: "Tipo Contrato",
    cell: ({ row }) => {
      const data = row.original;
      return <div>
        <p>{data.tipoContrato}</p>
      </div>
    }
  },
  {
    accessorKey: "tarifa",
    header: "Tarifa",
    cell: ({ row }) => {
      const data = row.original;
      return <div>
        <p>{data.tarifa}</p>
      </div>
    }
  },
  {
    accessorKey: "nombrePropietario",
    header: "Nombre Propietario",
    cell: ({ row }) => {
      const data = row.original;
      return <div>
        <p>{data.nombrePropietario}</p>
      </div>
    }
  },
  {
    accessorKey: "rutPropietario",
    header: "Rut Propietario",
    cell: ({ row }) => {
      const data = row.original;
      return <div>
        <p>{data.rutPropietario}</p>
      </div>
    }
  },

]
