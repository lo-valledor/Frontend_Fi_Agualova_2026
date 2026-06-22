/** biome-ignore-all lint/correctness/noEmptyPattern: <explanation> */
import { BreadcrumbSetter } from "~/components/breadcrumb-setter";
import CrearArchivosSapComponent from "~/components/operaciones/crear-archivos-sap/crear-archivos-sap-component";

import type { Route } from "./+types/crear-archivos-sap";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Agualova | Crear Archivos SAP" },
    { name: "description", content: "Crear Archivos SAP" },
  ];
}

export default function CrearArchivosSAP() {
  const pageBreadcrumbs = [
    { label: "Operaciones" },
    { label: "Crear Archivos SAP" },
  ];

  return (
    <div>
      <BreadcrumbSetter items={pageBreadcrumbs} />
      <CrearArchivosSapComponent />
    </div>
  );
}
