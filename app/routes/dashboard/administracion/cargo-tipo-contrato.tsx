// eslint-disable no-empty-pattern
import React from 'react';
import CargoTipoContratoComponent from '~/components/administracion/cargo-tipo-contrato/cargo-tipo-contrato-component';
import type { Route } from './+types/cargo-tipo-contrato';
import { BreadcrumbSetter } from '~/components/breadcrumb-setter';
import api from '~/lib/api';
import type { GetCargoTipoContrato } from '~/types/administracion';

export function meta({}: Route.MetaArgs) {
  return [
    { title: 'Enerlova | Cargo Tipo Contrato' },
    { name: 'description', content: 'Cargo Tipo Contrato' },
  ];
}

export async function clientLoader({}: Route.ClientActionArgs) {
  const res = await api.get('cargoTipoContrato-buscar');
  return {
    cargoTipoContrato: res.data as GetCargoTipoContrato[],
  };
}

export default function CargoTipoContrato({ loaderData }: Route.ComponentProps) {
  const { cargoTipoContrato } = loaderData;
  const pageBreadcrumbs = [
    { label: 'Administracion' },
    { label: 'Cargo Tipo Contrato' },
  ];
  return (
    <div>
      <BreadcrumbSetter items={pageBreadcrumbs} />
      <CargoTipoContratoComponent cargoTipoContrato={cargoTipoContrato} />
    </div>
  );
}
