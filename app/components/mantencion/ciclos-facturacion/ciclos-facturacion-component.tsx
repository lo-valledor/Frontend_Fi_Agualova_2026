import { Plus } from 'lucide-react';
import React from 'react';
import { DataTable } from '~/components/data-table/data-table';
import { Button } from '~/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
  CardHeader,
} from '~/components/ui/card';
import type { CiclosFacturacion } from '~/types/mantencion';
import { columns } from './columns';

export default function CiclosFacturacionComponent({
  ciclosFacturacion,
}: {
  ciclosFacturacion: CiclosFacturacion[];
}) {
  return (
    <div className="container mx-auto p-3 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-sky-900 dark:text-sky-100">
              Gestión de Ciclos de Facturacion
            </h1>
          </div>
          <p className="text-muted-foreground">
            Administra los ciclos del sistema de manera eficiente
          </p>
        </div>
        <Button
          /* onClick={handleAddCicloFacturacion} */
          className="bg-sky-600 hover:bg-sky-700 text-white"
        >
          <Plus className="mr-2 h-4 w-4" />
          Agregar Ciclo de Facturación
        </Button>
      </div>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Ciclos</CardTitle>
          <CardDescription>
            Visualiza y gestiona todas las zonas registradas en el sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable columns={columns} data={ciclosFacturacion} />
        </CardContent>
      </Card>
    </div>
  );
}
