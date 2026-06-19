/* eslint-disable no-empty-pattern */
import { AdministracionHydrateFallback } from '~/components/administracion/administracion-hydrate-fallback';
import CargoTipoContratoComponent from '~/components/administracion/cargo-tipo-contrato/cargo-tipo-contrato-component';
import { BreadcrumbSetter } from '~/components/breadcrumb-setter';
import { administracionService } from '~/services/administracionService';

import type { Route } from './+types/cargo-tipo-contrato';

export function meta({}: Route.MetaArgs) {
  return [
    { title: 'Agualova | Cargo Tipo Contrato' },
    { name: 'description', content: 'Cargo Tipo Contrato' }
  ];
}

export async function clientLoader({}: Route.ClientActionArgs) {
  const result = await administracionService.getCargoTipoContrato();

  if (result.error || !result.data) {
    return {
      cargoTipoContrato: []
    };
  }

  return {
    cargoTipoContrato: result.data
  };
}

export default function CargoTipoContrato({
  loaderData
}: Route.ComponentProps) {
  const { cargoTipoContrato } = loaderData;
  const pageBreadcrumbs = [
    { label: 'Administracion' },
    { label: 'Cargo Tipo Contrato' }
  ];
  return (
    <div>
      <BreadcrumbSetter items={pageBreadcrumbs} />
      <CargoTipoContratoComponent cargoTipoContrato={cargoTipoContrato} />
    </div>
  );
}

export function hydrateFallback() {
  return <AdministracionHydrateFallback />;
}
