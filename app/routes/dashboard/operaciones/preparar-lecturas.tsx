import { BreadcrumbSetter } from "~/components/breadcrumb-setter";
import PrepararLecturasComponent from "~/components/operaciones/preparar-lecturas/preparar-lecturas-component";
import React, { useEffect } from "react";

export default function PrepararLecturas() {
  const pageBreadcrumbs = [
    { label: "Operaciones" },
    { label: "Preparar Lecturas" },
  ];

  useEffect(() => {
    document.title = "Preparar Lecturas";
  }, []);

  return (
    <div className="container mx-auto p-3 md:p-6 space-y-6">
      <BreadcrumbSetter items={pageBreadcrumbs} />
      <PrepararLecturasComponent />
    </div>
  );
}
