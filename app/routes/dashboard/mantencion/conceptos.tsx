import { BreadcrumbSetter } from "~/components/breadcrumb-setter";
import ConceptosComponent from "~/components/mantencion/conceptos/conceptos-component";
import { MantencionHydrateFallback } from "~/components/mantencion/mantencion-hydrate-fallback";
import { mantencionService } from "~/services/mantencionService";

import type { Route } from "./+types/conceptos";

export function hydrateFallback() {
  return <MantencionHydrateFallback />;
}

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Agualova | Conceptos" },
    { name: "description", content: " Conceptos del sistema" },
  ];
}

export async function clientLoader() {
  const result = await mantencionService.getConceptosData();

  if (result.error || !result.data) {
    return {
      conceptos: [],
      conceptoAsociables: [],
    };
  }

  return result.data;
}

export default function Conceptos({
  loaderData,
}: Readonly<Route.ComponentProps>) {
  const { conceptos, conceptoAsociables } = loaderData;

  const pageBreadcrumbs = [{ label: "Mantención" }, { label: "Conceptos" }];

  return (
    <div>
      <BreadcrumbSetter items={pageBreadcrumbs} />
      <ConceptosComponent
        conceptos={conceptos}
        conceptoAsociables={conceptoAsociables}
      />
    </div>
  );
}
