import React from "react";
import { DataTable } from "~/components/data-table/data-table";
import { columns } from "./columns";

export default function CargoFacturableComponent({ cargos }: { cargos: any }) {
  console.log(cargos);
  return (
    <div className="container mx-auto p-3 md:p-6 space-y-6">
      <div className="flex items-center justify-between border-b border-border/40 pb-3.5">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-sky-900 dark:text-sky-100">
              Cargo Facturable
            </h1>
          </div>
          <p className="text-muted-foreground">
            Gestión de cargos facturables del sistema
          </p>
        </div>
      </div>
      <div className="flex flex-col gap-4">
        <DataTable columns={columns} data={cargos} />
      </div>
    </div>
  );
}
