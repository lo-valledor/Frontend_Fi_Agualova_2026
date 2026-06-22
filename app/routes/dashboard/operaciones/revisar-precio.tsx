/** biome-ignore-all lint/correctness/noEmptyPattern: <explanation> */
import { lazy, Suspense } from "react";

import { BreadcrumbSetter } from "~/components/breadcrumb-setter";
import { DataTableSkeleton } from "~/components/skeletons";
import { operacionesService } from "~/services/operacionesService";
import type { RevisionPreciosBuscarRequest } from "~/types/operaciones";

import type { Route } from "./+types/revisar-precio";

const RevisarPrecioComponent = lazy(
  () =>
    import("~/components/operaciones/revisar-precio/revisar-precio-component"),
);

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Agualova | Revisar Precios" },
    { name: "description", content: "Revisar Precios" },
  ];
}

const currentDate = new Date();
const currentMonth = (currentDate.getMonth() + 1).toString().padStart(2, "0");
const currentYear = currentDate.getFullYear().toString();

interface RevisarPrecioLoaderData {
  precios: RevisionPreciosBuscarRequest[];
  initialMes: string;
  initialAnio: string;
  error: string | null;
}

export async function clientLoader({ request }: Route.ClientLoaderArgs) {
  const url = new URL(request.url);
  const mes = url.searchParams.get("mes") || currentMonth;
  const anio = url.searchParams.get("anio") || currentYear;

  const result = await operacionesService.getRevisarPreciosData(mes, anio);

  if (result.error || !result.data) {
    return {
      precios: [],
      initialMes: currentMonth,
      initialAnio: currentYear,
      error: "Error al cargar los precios de revisión",
    } satisfies RevisarPrecioLoaderData;
  }

  const precios = Array.isArray(result.data)
    ? (result.data as RevisionPreciosBuscarRequest[])
    : [];

  return {
    precios,
    initialMes: mes,
    initialAnio: anio,
    error: null,
  } satisfies RevisarPrecioLoaderData;
}

export default function RevisarPrecio({ loaderData }: Route.ComponentProps) {
  const pageBreadcrumbs = [
    { label: "Operaciones" },
    { label: "Revisar Precios" },
  ];

  return (
    <div className="min-h-screen">
      <BreadcrumbSetter items={pageBreadcrumbs} />
      <Suspense fallback={<DataTableSkeleton columns={7} rows={12} />}>
        <RevisarPrecioComponent {...loaderData} />
      </Suspense>
    </div>
  );
}

export function hydrateFallback() {
  return <DataTableSkeleton columns={7} rows={12} />;
}
