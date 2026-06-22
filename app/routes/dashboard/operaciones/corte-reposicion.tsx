/* eslint-disable no-empty-pattern */
import { BreadcrumbSetter } from "~/components/breadcrumb-setter";
import CorteReposicionComponent from "~/components/operaciones/corte-reposicion/corte-reposicion-component";
import { operacionesService } from "~/services/operacionesService";

import type { Route } from "./+types/corte-reposicion";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Agualova | Corte y Reposición" },
    { name: "description", content: "Corte y Reposición" },
  ];
}

export async function clientLoader({}: Route.ClientActionArgs) {
  const result = await operacionesService.getCorteReposicionData();

  if (result.error || !result.data) {
    return {
      totalesData: [],
      mantenedorCorteData: [],
    };
  }

  return result.data;
}

export default function CorteReposicion({
  loaderData,
}: Readonly<Route.ComponentProps>) {
  const { mantenedorCorteData } = loaderData;

  const pageBreadcrumbs = [
    { label: "Operaciones" },
    { label: "Corte y Reposición" },
  ];

  return (
    <div>
      <BreadcrumbSetter items={pageBreadcrumbs} />
      <CorteReposicionComponent mantenedorCorteData={mantenedorCorteData} />
    </div>
  );
}
