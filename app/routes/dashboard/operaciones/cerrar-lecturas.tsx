import { BreadcrumbSetter } from "~/components/breadcrumb-setter";
import CerrarLecturasComponent from "~/components/operaciones/cerrar-lecturas/cerrar-lecturas-component";
import React, { useEffect } from "react";

export default function CerrarLecturas() {
  const pageBreadcrumbs = [
    { label: "Operaciones" },
    { label: "Cerrar Lecturas" },
  ];

  useEffect(() => {
    document.title = "Cerrar Lecturas";
  }, []);

  return (
    <div className="container mx-auto p-3 md:p-6 space-y-6">
      <BreadcrumbSetter items={pageBreadcrumbs} />
      <CerrarLecturasComponent />
    </div>
  );
}
