/* eslint-disable no-empty-pattern */
import React from 'react';
import CargoFacturableComponent from '~/components/administracion/cargo-facturable/cargo-facturable-component';
import type { Route } from './+types/cargo-facturable';
import api from '~/lib/api';
import { BreadcrumbSetter } from '~/components/breadcrumb-setter';
import type {
  GeCombosConceptos,
  GetCombosTarifas,
  GetCombosTiposMedidor,
} from '~/types/administracion';
import type { BuscarCargoFacturable } from '~/types/administracion';
export function meta({}: Route.MetaArgs) {
  return [
    { title: 'Enerlova | Cargo Facturable' },
    { name: 'description', content: 'Cargo Facturable' },
  ];
}

export async function clientLoader() {
  const resCargoFacturable = await api.get('buscarCargoFacturable');
  const resConceptos = await api.get('combos/conceptos');
  const resTarifas = await api.get('combos/tarifas');
  const resTiposMedidor = await api.get('combos/tipos-medidor');
  return {
    cargos: resCargoFacturable.data,
    conceptos: resConceptos.data as GeCombosConceptos[],
    tarifas: resTarifas.data as GetCombosTarifas[],
    tiposMedidor: resTiposMedidor.data as GetCombosTiposMedidor[],
  };
}

export default function CargoFacturable({ loaderData }: Route.ComponentProps) {
  const pageBreadcrumbs = [
    { label: 'Administracion' },
    { label: 'Cargo Facturable' },
  ];
  return (
    <div>
      <BreadcrumbSetter items={pageBreadcrumbs} />
      <CargoFacturableComponent
        cargos={loaderData.cargos as BuscarCargoFacturable[]}
        conceptos={loaderData.conceptos as GeCombosConceptos[]}
        tarifas={loaderData.tarifas as GetCombosTarifas[]}
        tiposMedidor={loaderData.tiposMedidor as GetCombosTiposMedidor[]}
      />
    </div>
  );
}
