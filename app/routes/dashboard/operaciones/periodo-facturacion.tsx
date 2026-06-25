import { BreadcrumbSetter } from '~/components/breadcrumb-setter';
import AbrirPeriodoFacturacion from '~/components/operaciones/periodo-facturacion/periodo-facturacion-component';
import { operacionesService } from '~/services/operacionesService';
import type { Route } from './+types/periodo-facturacion';

export function meta({}: Route.MetaArgs) {
  return [
    { title: 'Agualova | Periodos de Facturación' },
    { name: 'description', content: 'Periodos de Facturación' }
  ];
}

export async function clientLoader() {
  const result = await operacionesService.getPeriodoFacturacionPageData();

  if (result.error || !result.data) {
    return {
      years: [],
      periodos: [],
      error: result.error || 'Error al cargar los datos'
    };
  }

  return {
    years: result.data.years,
    periodos: result.data.periodos,
    error: null
  };
}

export default function PeriodoFacturacion({
  loaderData
}: Route.ComponentProps) {
  const { years, periodos, error } = loaderData;
  const pageBreadcrumbs = [
    { label: 'Operaciones' },
    { label: 'Periodos de Facturación' }
  ];

  return (
    <div>
      <BreadcrumbSetter items={pageBreadcrumbs} />
      <AbrirPeriodoFacturacion
        years={years}
        periodos={periodos}
        error={error}
      />
    </div>
  );
}
