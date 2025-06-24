/* eslint-disable no-empty-pattern */
import { BreadcrumbSetter } from '~/components/breadcrumb-setter';
import CerrarLecturasComponent from '~/components/operaciones/cerrar-lecturas/cerrar-lecturas-component';
import React from 'react';
import type { Route } from './+types/cerrar-lecturas';
import api from '~/lib/api';
import type { PeriodoAbierto, Ciclo } from '~/types/operaciones';

export function meta({}: Route.MetaArgs) {
  return [
    { title: 'Enerlova | Cerrar Lecturas' },
    { name: 'description', content: 'Cerrar Lecturas' },
  ];
}

export async function clientLoader() {
  const [periodoAbierto, ciclosFacturacion] = await Promise.all([
    api.get('/ConsultarPeriodoAbierto'),
    api.get('/ciclos-facturacion-activos'),
  ]);

  return {
    periodoAbierto: periodoAbierto.data as PeriodoAbierto[],
    ciclosFacturacion: ciclosFacturacion.data as Ciclo[],
  };
}

export default function CerrarLecturas({ loaderData }: Route.ComponentProps) {
  const { periodoAbierto, ciclosFacturacion } = loaderData;
  const pageBreadcrumbs = [
    { label: 'Operaciones' },
    { label: 'Cerrar Lecturas' },
  ];

  return (
    <div>
      <BreadcrumbSetter items={pageBreadcrumbs} />
      <CerrarLecturasComponent
        periodoAbierto={periodoAbierto ?? []}
        ciclosFacturacion={ciclosFacturacion ?? []}
      />
    </div>
  );
}
