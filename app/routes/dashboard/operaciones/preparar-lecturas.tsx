// eslint-disable no-empty-pattern
import { BreadcrumbSetter } from "~/components/breadcrumb-setter";
import PrepararLecturasComponent from "~/components/operaciones/preparar-lecturas/preparar-lecturas-component";
import type { Route } from "./+types/preparar-lecturas";
import api from "~/lib/api";
import type {
  PeriodoAbierto,
  ValidarSectoresPendientes,
} from "~/types/operaciones";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Enerlova | Preparar Lecturas" },
    { name: "description", content: "Preparar Lecturas" },
  ];
}

export async function clientLoader() {
  try {
    const [periodoAbierto, lecturasPendientes] = await Promise.all([
      api.get("/ConsultarPeriodoAbierto"),
      api.get("/validar-lecturas-pendientes"),
    ]);

    return {
      periodoAbierto: periodoAbierto.data as PeriodoAbierto[],
      lecturasPendientes:
        lecturasPendientes.data as ValidarSectoresPendientes[],
    };
  } catch (error) {
    console.error("Error en clientLoader:", error);
    return {
      periodoAbierto: null,
      lecturasPendientes: null,
    };
  }
}

export default function PrepararLecturas({ loaderData }: Route.ComponentProps) {
  const { periodoAbierto, lecturasPendientes } = loaderData;
  const pageBreadcrumbs = [
    { label: "Operaciones" },
    { label: "Preparar Lecturas" },
  ];

  return (
    <div>
      <BreadcrumbSetter items={pageBreadcrumbs} />
      <PrepararLecturasComponent
        periodoAbierto={periodoAbierto ?? []}
        lecturasPendientes={lecturasPendientes ?? []}
      />
    </div>
  );
}
