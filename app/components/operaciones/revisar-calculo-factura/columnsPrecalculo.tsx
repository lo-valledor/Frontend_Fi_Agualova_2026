import { type CalculoPrefacturaDetalle } from "~/types/operaciones";
import { type ColumnDef } from "@tanstack/react-table";

export const columns: ColumnDef<CalculoPrefacturaDetalle>[] = [
  {
    header: "Sector",
    accessorKey: "sector",
  },
  {
    header: "Contrato",
    accessorKey: "contratoId",
  },
  {
    header: "Tarifa",
    accessorKey: "codigoTarifa",
  },
  {
    header: "Rut",
    accessorKey: "rutCliente",
  },
  {
    header: "Nombre",
    accessorKey: "nombreCliente",
  },
  {
    header: "Local",
    accessorKey: "localId",
  },
  {
    header: "Dirección",
    accessorKey: "direccion",
  },
  {
    header: "Comuna",
    accessorKey: "comuna",
  },
  {
    header: "Número de Serie",
    accessorKey: "numeroSerie",
  },
  {
    header: "Fecha de Lectura",
    accessorKey: "fechaLectura",
  },
  {
    header: "Consumo",
    accessorKey: "consumoPeriodo",
  },
  {
    header: "Lectura",
    accessorKey: "lecturaId",
  },
];
