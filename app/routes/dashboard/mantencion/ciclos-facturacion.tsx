import React from "react";
import { BreadcrumbSetter } from "~/components/breadcrumb-setter";
import CiclosFacturacionComponent from "~/components/mantencion/ciclos-facturacion-component";

export default function CiclosFacturacion() {
  const pageBreadcrumbs = [
    { label: "Mantencion" },
    { label: "Ciclos Facturacion" },
  ];
  return (
    <div>
      <BreadcrumbSetter items={pageBreadcrumbs} />
      <CiclosFacturacionComponent />
    </div>
  );
}
