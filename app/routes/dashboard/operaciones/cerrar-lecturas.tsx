/* eslint-disable no-empty-pattern */
import { BreadcrumbSetter } from '~/components/breadcrumb-setter';
import CerrarLecturasComponent from '~/components/operaciones/cerrar-lecturas/cerrar-lecturas-component';
import React from 'react';
import type { Route } from './+types/cerrar-lecturas';
import { operacionesService } from '~/services/operacionesService';

export function meta({}: Route.MetaArgs) {
  return [
    { title: 'Enerlova | Cerrar Lecturas' },
    { name: 'description', content: 'Cerrar Lecturas' },
  ];
}

export async function clientLoader() {
  const result = await operacionesService.getCerrarLecturasData();

  if (result.error || !result.data) {
    return {
      periodoAbierto: [],
      ciclosFacturacion: [],
    };
  }

  return result.data;
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
