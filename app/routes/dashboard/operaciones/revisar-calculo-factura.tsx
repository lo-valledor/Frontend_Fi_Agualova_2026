import { BreadcrumbSetter } from '~/components/breadcrumb-setter';
import RevisarCalculoFacturaComponent from '~/components/operaciones/revisar-calculo-factura/revisar-calculo-factura-component';
import { operacionesService } from '~/services/operacionesService';

import type { Route } from './+types/revisar-calculo-factura';

export function meta({}: Route.MetaArgs) {
  return [
    { title: 'Agualova | Revisar Calculo de Factura' },
    { name: 'description', content: 'Revisar Calculo de Factura' }
  ];
}

export async function clientLoader() {
  const [periodoResult, ciclosResult] = await Promise.all([
    operacionesService.getPeriodoAbierto(),
    operacionesService.getCiclosFacturacion()
  ]);

  return {
    periodoAbierto:
      periodoResult.error || !periodoResult.data ? [] : periodoResult.data,
    ciclosFacturacionActivos:
      ciclosResult.error || !ciclosResult.data ? [] : ciclosResult.data,
    estadoCierreLecturas: null
  };
}

export default function RevisarCalculoFactura({
  loaderData
}: Route.ComponentProps) {
  const { periodoAbierto, ciclosFacturacionActivos, estadoCierreLecturas } =
    loaderData;
  const pageBreadcrumbs = [
    { label: 'Operaciones' },
    { label: 'Revisar Calculo de Factura' }
  ];

  return (
    <div>
      <BreadcrumbSetter items={pageBreadcrumbs} />
      <RevisarCalculoFacturaComponent
        periodoAbierto={periodoAbierto ?? []}
        ciclosFacturacionActivos={ciclosFacturacionActivos ?? []}
        estadoCierreLecturas={estadoCierreLecturas}
      />
    </div>
  );
}
