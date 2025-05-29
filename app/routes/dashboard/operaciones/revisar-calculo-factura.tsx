import { BreadcrumbSetter } from "~/components/breadcrumb-setter";
import RevisarCalculoFacturaComponent from "~/components/operaciones/revisar-calculo-factura/revisar-calculo-factura-component";
import React, { useEffect } from "react";

export default function RevisarCalculoFactura() {
  const pageBreadcrumbs = [
    { label: "Operaciones" },
    { label: "Revisar Calculo de Factura" },
  ];

  useEffect(() => {
    document.title = "Revisar Calculo de Factura";
  }, []);

  return (
    <div className="container mx-auto p-3 md:p-6 space-y-6">
      <BreadcrumbSetter items={pageBreadcrumbs} />
      <RevisarCalculoFacturaComponent />
    </div>
  );
}
