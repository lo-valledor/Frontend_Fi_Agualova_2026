/* eslint-disable no-empty-pattern */
import React from 'react';

import CargoFacturableComponent from '~/components/administracion/cargo-facturable/cargo-facturable-component';
import { BreadcrumbSetter } from '~/components/breadcrumb-setter';
import { administracionService } from '~/services/administracionService';

import type { Route } from './+types/cargo-facturable';

export function meta({}: Route.MetaArgs) {
  return [
    { title: 'Enerlova | Cargo Facturable' },
    { name: 'description', content: 'Cargo Facturable' },
  ];
}

export async function clientLoader() {
  const result = await administracionService.getCargoFacturableData();

  if (result.error || !result.data) {
    return {
      cargos: [],
      conceptos: [],
      tarifas: [],
      tiposMedidor: [],
    };
  }

  return result.data;
}

export default function CargoFacturable({ loaderData }: Route.ComponentProps) {
  const { cargos, conceptos, tarifas, tiposMedidor } = loaderData;
  const pageBreadcrumbs = [
    { label: 'Administracion' },
    { label: 'Cargo Facturable' },
  ];
  return (
    <div>
      <BreadcrumbSetter items={pageBreadcrumbs} />
      <CargoFacturableComponent
        cargos={cargos}
        conceptos={conceptos}
        tarifas={tarifas}
        tiposMedidor={tiposMedidor}
      />
    </div>
  );
}
