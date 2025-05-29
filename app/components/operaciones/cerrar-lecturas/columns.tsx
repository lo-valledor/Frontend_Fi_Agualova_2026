import { type EstadoCierreLecturas } from "~/types/operaciones";
import { type ColumnDef } from "@tanstack/react-table";
import { Button } from "~/components/ui/button";
import {
  AlertCircle,
  CircleX,
  Pencil,
  FileText,
  AlertTriangle,
  CheckCircle,
  ClipboardList,
  Loader2,
} from "lucide-react";
import { Badge } from "~/components/ui/badge";
import { cn } from "~/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import AlertCerrarLecturas from "./alert-cerrar-lecturas";
// Interfaz para la función de callback después de cerrar lecturas
interface OnCerrarLecturaSuccess {
  (): void;
}

// Propiedades para la columna de acciones
interface AccionesColumnProps {
  onCerrarLecturaSuccess?: OnCerrarLecturaSuccess;
  cicloFact?: string;
  periodo?: string;
}

// Función de utilidad para formatear fechas desde string DD-MM-YYYY
const formatearFecha = (fechaString: string): string => {
  if (!fechaString) return "";

  // Verificar si la fecha tiene el formato esperado (DD-MM-YYYY)
  const regexFecha = /^(\d{2})-(\d{2})-(\d{4})$/;
  const match = fechaString.match(regexFecha);

  if (!match) return fechaString; // Devolver el original si no coincide con el formato

  try {
    // Extraer partes de la fecha
    const [, dia, mes, anio] = match;

    // Crear Date (el mes en JavaScript es 0-indexed)
    const fecha = new Date(`${anio}-${mes}-${dia}`);

    // Verificar si la fecha es válida
    if (isNaN(fecha.getTime())) return fechaString;

    // Opciones para formatear la fecha
    const opciones: Intl.DateTimeFormatOptions = {
      day: "2-digit",
      month: "long",
      year: "numeric",
    };

    // Formato en español
    return fecha.toLocaleDateString("es-ES", opciones);
  } catch (error) {
    console.error("Error al formatear fecha:", error);
    return fechaString;
  }
};

export const columns: (
  props?: AccionesColumnProps
) => ColumnDef<EstadoCierreLecturas>[] = (props) => [
  {
    header: "ID Sector",
    accessorKey: "sectorId",
    cell: ({ row }) => {
      const sectorId = row.original.sectorId;
      return (
        <div className="font-medium text-muted-foreground">{sectorId}</div>
      );
    },
  },
  {
    header: "ID Nicho",
    accessorKey: "nichoId",
    cell: ({ row }) => {
      const nichoId = row.original.nichoId;
      return <div className="font-medium text-muted-foreground">{nichoId}</div>;
    },
  },
  {
    header: "Nicho",
    accessorKey: "nichoDescripcion",
    cell: ({ row }) => {
      const nicho = row.original.nichoDescripcion;
      return (
        <div className="font-medium">
          <div className="flex items-center gap-2">
            <ClipboardList className="h-4 w-4 text-sky-500" />
            <span>{nicho}</span>
          </div>
        </div>
      );
    },
  },
  {
    header: "Sin Lectura",
    accessorKey: "cantidadSinLectura",
    cell: ({ row }) => {
      const cantidadSinLectura = row.original.cantidadSinLectura;
      return (
        <Badge
          variant="outline"
          className={cn(
            "bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-900/20 dark:text-slate-400 dark:border-slate-800",
            cantidadSinLectura > 0 &&
              "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800"
          )}
        >
          {cantidadSinLectura}
        </Badge>
      );
    },
  },
  {
    header: "Lecturas OK",
    accessorKey: "cantidadLecturasOK",
    cell: ({ row }) => {
      const cantidadLecturasOK = row.original.cantidadLecturasOK;
      return (
        <Badge
          variant="outline"
          className="bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800"
        >
          {cantidadLecturasOK}
        </Badge>
      );
    },
  },
  {
    header: "Clave Roja",
    accessorKey: "cantidadClaveRoja",
    cell: ({ row }) => {
      const cantidadClaveRoja = row.original.cantidadClaveRoja;
      return (
        <Badge
          variant="outline"
          className={cn(
            "bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-900/20 dark:text-slate-400 dark:border-slate-800",
            cantidadClaveRoja > 0 &&
              "bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800"
          )}
        >
          {cantidadClaveRoja > 0 && <AlertCircle className="mr-1 h-3 w-3" />}
          {cantidadClaveRoja}
        </Badge>
      );
    },
  },
  {
    header: "Clave Naranja",
    accessorKey: "cantidadClaveNaranja",
    cell: ({ row }) => {
      const cantidadClaveNaranja = row.original.cantidadClaveNaranja;
      return (
        <Badge
          variant="outline"
          className={cn(
            "bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-900/20 dark:text-slate-400 dark:border-slate-800",
            cantidadClaveNaranja > 0 &&
              "bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-900/20 dark:text-orange-400 dark:border-orange-800"
          )}
        >
          {cantidadClaveNaranja > 0 && (
            <AlertTriangle className="mr-1 h-3 w-3" />
          )}
          {cantidadClaveNaranja}
        </Badge>
      );
    },
  },
  {
    header: "Corregidas",
    accessorKey: "cantidadCorregidas",
    cell: ({ row }) => {
      const cantidadCorregidas = row.original.cantidadCorregidas;
      return (
        <Badge
          variant="outline"
          className={cn(
            "bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-900/20 dark:text-slate-400 dark:border-slate-800",
            cantidadCorregidas > 0 &&
              "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800"
          )}
        >
          {cantidadCorregidas > 0 && <CheckCircle className="mr-1 h-3 w-3" />}
          {cantidadCorregidas}
        </Badge>
      );
    },
  },

  {
    header: "Acciones",
    accessorKey: "acciones",
    cell: ({ row }) => {
      const { nichoId, cantidadLecturasOK } = row.original;

      return (
        <div className="items-center">
          {props && props.cicloFact && props.periodo ? (
            <AlertCerrarLecturas
              nichoId={nichoId}
              cantLecturas={cantidadLecturasOK}
              cicloFact={props.cicloFact}
              periodo={props.periodo}
              onSuccess={props?.onCerrarLecturaSuccess}
            />
          ) : (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    className="border-red-200 dark:border-red-800 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-700 dark:text-red-400"
                    disabled
                  >
                    <CircleX className="h-4 w-4 mr-1" /> Cerrar
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Faltan datos de ciclo o periodo</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
      );
    },
  },
];
