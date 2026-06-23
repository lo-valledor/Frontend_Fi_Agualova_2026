import type { ColumnDef } from "@tanstack/react-table";
import { format } from "rut.js";
import { DataTableColumnHeader } from "~/components/data-table/data-table-column-header";
import { TableActions } from "~/components/data-table/table-helpers";
import { Badge } from "~/components/ui/badge";
import type { GetContratante, NombreComuna } from "~/types/administracion";

interface ContratantesColumnsProps {
  onDetails: (contratante: GetContratante) => void;
  detailingContratanteRut: string | null;
  comunas: NombreComuna[];
}

export const columns = ({
  onDetails,
  detailingContratanteRut,
  comunas,
}: ContratantesColumnsProps): ColumnDef<GetContratante>[] => [
  {
    accessorKey: "rut",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="RUT" />
    ),
    cell: ({ row }) => {
      const nombreCompleto = row.original.esEmpresa
        ? row.original.nombre
        : `${row.original.nombre} ${row.original.apellido || ""}`.trim();

      return (
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <div className="min-w-0 flex-1">
            <div
              className="font-medium truncate text-xs sm:text-sm "
              title={nombreCompleto}
            >
              {nombreCompleto}
            </div>
            <div className="text-xs font-mono truncate">
              {format(row.getValue("rut"))}
            </div>
          </div>
        </div>
      );
    },
    size: 190,
    minSize: 160,
    maxSize: 220,
  },
  {
    accessorKey: "nombre",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Tipo" />
    ),
    cell: ({ row }) => {
      return (
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <div className="min-w-0 flex-1">
            <Badge
              variant={row.original.esEmpresa ? "default" : "secondary"}
              className="text-xs"
            >
              {row.original.esEmpresa ? "Empresa" : "Persona"}
            </Badge>
          </div>
        </div>
      );
    },
    size: 100,
    minSize: 90,
    maxSize: 110,
  },
  {
    accessorKey: "direccion",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Dirección" />
    ),
    cell: ({ row }) => {
      // Buscar el nombre de la comuna por su código
      const comunaNombre =
        comunas.find((c) => c.id === row.original.comuna)?.descripcion ||
        row.original.comuna;

      return (
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <div className="min-w-0 flex-1">
            <div
              className="font-medium truncate text-xs sm:text-sm"
              title={row.original.direccion || "No especificada"}
            >
              {row.original.direccion || "No especificada"}
            </div>
            <div className="text-xs truncate">{comunaNombre}</div>
          </div>
        </div>
      );
    },
    size: 175,
    minSize: 150,
    maxSize: 200,
  },
  {
    accessorKey: "contacto",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Contacto" />
    ),
    cell: ({ row }) => {
      return (
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <div className="min-w-0 flex-1">
            <div
              className="font-medium truncate text-xs sm:text-sm"
              title={row.original.contacto || "No especificado"}
            >
              {row.original.contacto || "No especificado"}
            </div>
            <div className="text-xs truncate">
              {row.original.telefono || "Sin teléfono"}
            </div>
          </div>
        </div>
      );
    },
    size: 150,
    minSize: 130,
    maxSize: 170,
  },
  {
    accessorKey: "email",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Email" />
    ),
    cell: ({ row }) => {
      return (
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <div className="min-w-0 flex-1">
            <div
              className="font-medium truncate text-xs sm:text-sm"
              title={row.original.email || "No especificado"}
            >
              {row.original.email || "No especificado"}
            </div>
          </div>
        </div>
      );
    },
    size: 165,
    minSize: 140,
    maxSize: 190,
  },
  {
    id: "actions",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Acciones" />
    ),
    cell: ({ row }) => {
      return (
        <div className="flex items-center justify-center">
          <TableActions
            onView={onDetails}
            item={row.original}
            showView={true}
            showEdit={false}
            showDelete={false}
            loadingView={detailingContratanteRut === row.original.rut}
          />
        </div>
      );
    },
    size: 90,
    minSize: 80,
    maxSize: 100,
    enableSorting: false,
  },
];
