import { BreadcrumbSetter } from "~/components/breadcrumb-setter";
import CerrarLecturasComponent from "~/components/operaciones/cerrar-lecturas/cerrar-lecturas-component";
import { operacionesService } from "~/services/operacionesService";
import type {
  CerrarLecturasFiltrosCiclosResponse,
  CerrarLecturasFiltrosPeriodosResponse,
} from "~/types/operaciones";

import type { Route } from "./+types/cerrar-lecturas";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Agualova | Cerrar Lecturas" },
    { name: "description", content: "Cerrar Lecturas" },
  ];
}

interface CerrarLecturasLoaderData {
  periodos: CerrarLecturasFiltrosPeriodosResponse;
  ciclos: CerrarLecturasFiltrosCiclosResponse;
  error: string | null;
}

export async function clientLoader() {
  const [periodosResult, ciclosResult] = await Promise.all([
    operacionesService.getPeriodoAbierto(),
    operacionesService.getObtenerCiclos(),
  ]);

  if (
    periodosResult.error ||
    !periodosResult.data ||
    ciclosResult.error ||
    !ciclosResult.data
  ) {
    return {
      periodos: [],
      ciclos: [],
      error: "Error al cargar los datos de cierre de lecturas",
    } satisfies CerrarLecturasLoaderData;
  }

  return {
    periodos: periodosResult.data,
    ciclos: ciclosResult.data,
    error: null,
  } satisfies CerrarLecturasLoaderData;
}

export default function CerrarLecturas({ loaderData }: Route.ComponentProps) {
  const { periodos, ciclos, error } = loaderData;
  const pageBreadcrumbs = [
    { label: "Operaciones" },
    { label: "Cerrar Lecturas" },
  ];

  return (
    <div>
      <BreadcrumbSetter items={pageBreadcrumbs} />
      <CerrarLecturasComponent
        periodos={periodos}
        ciclos={ciclos}
        error={error}
      />
    </div>
  );
}
