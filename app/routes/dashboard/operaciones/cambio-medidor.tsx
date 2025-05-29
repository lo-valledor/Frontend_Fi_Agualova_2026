import { BreadcrumbSetter } from "~/components/breadcrumb-setter";
import CambioMedidorComponent from "~/components/operaciones/cambio-medidor/cambio-medidor-component";
import React, { useEffect } from "react";

export default function CambioMedidor() {
  const pageBreadcrumbs = [
    { label: "Operaciones" },
    { label: "Cambio de Medidor" },
  ];

  useEffect(() => {
    document.title = "Cambio de Medidor";
  }, []);

  return (
    <div className="container mx-auto p-3 md:p-6 space-y-6">
      <BreadcrumbSetter items={pageBreadcrumbs} />
      <CambioMedidorComponent />
    </div>
  );
}
