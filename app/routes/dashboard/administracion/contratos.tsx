/* eslint-disable no-empty-pattern */
import ContratosComponent from '~/components/administracion/contratos/contratos-component';
import type { Route } from './+types/contratos';
import { administracionService } from '~/services/administracionService';
import { BreadcrumbSetter } from '~/components/breadcrumb-setter';

export function meta({}: Route.MetaArgs) {
  return [
    { title: 'Enerlova | Contratos' },
    { name: 'description', content: 'Contratos' },
  ];
}

export async function clientLoader({}: Route.ClientActionArgs) {
  const result = await administracionService.getContratosData();

  if (result.error || !result.data) {
    return {
      contratos: [],
      regiones: [],
      contratosClientes: [],
      limiteInvierno: [],
      fechaActual: [],
      tipoContrato: [],
      tarifas: [],
    };
  }

  return result.data;
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
