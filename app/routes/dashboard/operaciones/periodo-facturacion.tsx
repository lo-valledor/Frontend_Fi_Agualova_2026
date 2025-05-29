import { BreadcrumbSetter } from "~/components/breadcrumb-setter";
import AbrirPeriodoFacturacion from "~/components/operaciones/periodo-facturacion/abrir-periodo-facturacion";
import React from "react";

const PeriodoFacturacion = () => {
  const pageBreadcrumbs = [
    { label: "Operaciones" },
    { label: "Periodos de Facturación" },
  ];

  return (
    <div className="container mx-auto p-3 md:p-6 space-y-6">
      <BreadcrumbSetter items={pageBreadcrumbs} />
      <AbrirPeriodoFacturacion />
    </div>
  );
};

export default PeriodoFacturacion;
