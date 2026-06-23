/* eslint-disable no-empty-pattern */
import { lazy, Suspense } from "react";
import { useRouteError } from "react-router";

import { BreadcrumbSetter } from "~/components/breadcrumb-setter";
import { ErrorBoundary as ErrorBoundaryComponent } from "~/components/error-boundary";
import { DataTableSkeleton } from "~/components/skeletons";
import { administracionService } from "~/services/administracionService";

import type { Route } from "./+types/contratos";

// Lazy load del componente pesado (38 KB)
const ContratosComponent = lazy(
  () => import("~/components/administracion/contratos/contratos-component"),
);

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Agualova | Contratos" },
    { name: "description", content: "Contratos" },
  ];
}

export async function clientLoader({}: Route.ClientActionArgs) {
  const result = await administracionService.getContratosData();

  if (result.error || !result.data) {
    return { contratos: [] };
  }

  return { contratos: result.data.contratos };
}

export default function Contratos({
  loaderData,
}: Readonly<Route.ComponentProps>) {
  const { contratos } = loaderData;
  const pageBreadcrumbs = [{ label: "Administracion" }, { label: "Contratos" }];
  return (
    <div>
      <BreadcrumbSetter items={pageBreadcrumbs} />
      <Suspense fallback={<DataTableSkeleton columns={7} />}>
        <ContratosComponent contratos={contratos} />
      </Suspense>
    </div>
  );
}

export function hydrateFallback() {
  return <DataTableSkeleton columns={7} />;
}

export function ErrorBoundary() {
  const error = useRouteError() as Error;
  return <ErrorBoundaryComponent error={error} />;
}
