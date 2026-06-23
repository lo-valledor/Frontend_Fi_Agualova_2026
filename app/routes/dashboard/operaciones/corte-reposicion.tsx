import { BreadcrumbSetter } from "~/components/breadcrumb-setter";
import CorteReposicionComponent from "~/components/operaciones/corte-reposicion/corte-reposicion-component";
import { operacionesService } from "~/services/operacionesService";
import type {
  CorteReposicionBuscarRequest,
  CorteReposicionResumenResponse,
} from "~/types/operaciones";

import type { Route } from "./+types/corte-reposicion";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Agualova | Corte y Reposición" },
    { name: "description", content: "Corte y Reposición" },
  ];
}

interface CorteReposicionLoaderData {
  resumen: CorteReposicionResumenResponse | null;
  mantenedorCorteData: CorteReposicionBuscarRequest[];
  error: string | null;
}

export async function clientLoader({}: Route.ClientLoaderArgs) {
  const result = await operacionesService.getCorteReposicionData();

  if (result.error || !result.data) {
    return {
      resumen: null,
      mantenedorCorteData: [],
      error: "Error al cargar los datos de corte y reposición",
    } satisfies CorteReposicionLoaderData;
  }

  return {
    resumen: result.data.resumen,
    mantenedorCorteData: result.data.mantenedorCorteData,
    error: null,
  } satisfies CorteReposicionLoaderData;
}

export default function CorteReposicion({ loaderData }: Route.ComponentProps) {
  const { resumen, mantenedorCorteData, error } = loaderData;

  const pageBreadcrumbs = [
    { label: "Operaciones" },
    { label: "Corte y Reposición" },
  ];

  return (
    <div>
      <BreadcrumbSetter items={pageBreadcrumbs} />
      <CorteReposicionComponent
        resumen={resumen}
        mantenedorCorteData={mantenedorCorteData}
        error={error}
      />
    </div>
  );
}
