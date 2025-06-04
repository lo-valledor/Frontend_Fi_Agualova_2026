// eslint-disable no-empty-pattern
import { BreadcrumbSetter } from "~/components/breadcrumb-setter";
import PrepararLecturasComponent from "~/components/operaciones/preparar-lecturas/preparar-lecturas-component";
import type { Route } from "./+types/preparar-lecturas";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Enerlova | Preparar Lecturas" },
    { name: "description", content: "Preparar Lecturas" },
  ];
}

export default function PrepararLecturas() {
  const pageBreadcrumbs = [
    { label: "Operaciones" },
    { label: "Preparar Lecturas" },
  ];

  return (
    <div>
      <BreadcrumbSetter items={pageBreadcrumbs} />
      <PrepararLecturasComponent />
    </div>
  );
}
