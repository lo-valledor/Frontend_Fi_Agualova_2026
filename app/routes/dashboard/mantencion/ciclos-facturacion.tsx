import React from 'react';
import { BreadcrumbSetter } from '~/components/breadcrumb-setter';
import CiclosFacturacionComponent from '~/components/mantencion/ciclos-facturacion/ciclos-facturacion-component';
import type { Route } from './+types/ciclos-facturacion';
import api from '~/lib/api';
import type { CiclosFacturacion } from '~/types/mantencion';

export function meta({}: Route.MetaArgs) {
  return [
    { title: 'Enerlova | Ciclos de Facturación' },
    { name: 'description', content: 'Ciclos de Facturación' },
  ];
}

export async function clientLoader() {
  const res = await api.get('/buscarCiclo');
  return {
    ciclosFacturacion: res.data as CiclosFacturacion[],
  };
}

export default function CiclosFacturacion({
  loaderData,
}: Route.ComponentProps) {
  const { ciclosFacturacion } = loaderData;
  const pageBreadcrumbs = [
    { label: 'Mantencion' },
    { label: 'Ciclos Facturacion' },
  ];
  return (
    <div>
      <BreadcrumbSetter items={pageBreadcrumbs} />
      <CiclosFacturacionComponent ciclosFacturacion={ciclosFacturacion} />
    </div>
  );
}
