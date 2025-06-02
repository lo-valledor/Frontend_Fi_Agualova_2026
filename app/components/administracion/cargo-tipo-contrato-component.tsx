import React from "react";

export default function CargoTipoContratoComponent() {
  return (
    <div className="container mx-auto p-3 md:p-6 space-y-6">
      <div className="flex items-center justify-between border-b border-border/40 pb-3.5">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-sky-900 dark:text-sky-100">
              Cargo y Tipo de Contrato
            </h1>
          </div>
          <p className="text-muted-foreground">
            Gestión de cargos y tipos de contrato del sistema
          </p>
        </div>
      </div>
    </div>
  );
}
