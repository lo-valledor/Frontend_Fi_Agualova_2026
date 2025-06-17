// eslint-disable no-empty-pattern
import React from 'react';
import ContratosComponent from '~/components/administracion/contratos/contratos-component';
import type { Route } from './+types/contratos';
import type {
  GetContratos,
  GetRegiones,
  GetContratosClientes,
  GetLimiteInvierno,
  GetFechaActual,
} from '~/types/administracion';
import api from '~/lib/api';
import { BreadcrumbSetter } from '~/components/breadcrumb-setter';

export function meta({}: Route.MetaArgs) {
  return [
    { title: 'Enerlova | Contratos' },
    { name: 'description', content: 'Contratos' },
  ];
}

export async function clientLoader({}: Route.ClientActionArgs) {
  const resContratos = await api.get('contrato/buscar');
  const resRegiones = await api.get('region/listar');
  const resContratosClientes = await api.get('contrato/buscar');
  const resLimiteInvierno = await api.get('parametro/limite-invierno');
  const resFechaActual = await api.get('util/fecha-actual');
  return {
    contratos: resContratos.data as GetContratos[],
    regiones: resRegiones.data as GetRegiones[],
    contratosClientes: resContratosClientes.data as GetContratosClientes[],
    limiteInvierno: resLimiteInvierno.data as GetLimiteInvierno[],
    fechaActual: resFechaActual.data as GetFechaActual[],
  };
}

export default function Contratos({ loaderData }: Route.ComponentProps) {
  const {
    contratos,
    regiones,
    contratosClientes,
    limiteInvierno,
    fechaActual,
  } = loaderData;
  const pageBreadcrumbs = [{ label: 'Administracion' }, { label: 'Contratos' }];
  return (
    <div>
      <BreadcrumbSetter items={pageBreadcrumbs} />
      <ContratosComponent
        contratos={contratos}
        regiones={regiones}
        contratosClientes={contratosClientes}
        limiteInvierno={limiteInvierno}
        fechaActual={fechaActual}
      />
    </div>
  );
}
