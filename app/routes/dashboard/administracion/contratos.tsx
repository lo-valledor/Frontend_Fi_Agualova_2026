/* eslint-disable no-empty-pattern */
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
import type { Tarifas, TiposContrato } from '~/types/mantencion';

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
  const resTipoContrato = await api.get('buscarTipoContrato');
  const resTarifas = await api.get('buscarTarifa');
  return {
    contratos: resContratos.data as GetContratos[],
    regiones: resRegiones.data as GetRegiones[],
    contratosClientes: resContratosClientes.data as GetContratosClientes[],
    limiteInvierno: resLimiteInvierno.data as GetLimiteInvierno[],
    fechaActual: resFechaActual.data as GetFechaActual[],
    tipoContrato: resTipoContrato.data as TiposContrato[],
    tarifas: resTarifas.data as Tarifas[],
  };
}

export default function Contratos({ loaderData }: Route.ComponentProps) {
  const {
    contratos,
    regiones,
    contratosClientes,
    limiteInvierno,
    fechaActual,
    tipoContrato,
    tarifas,
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
        tipoContrato={tipoContrato}
        tarifas={tarifas}
      />
    </div>
  );
}
