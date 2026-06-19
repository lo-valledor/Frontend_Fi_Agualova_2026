import { Calendar, Download } from 'lucide-react';

import { memo, useMemo } from 'react';

import { Badge } from '~/components/ui/badge';
import { Button } from '~/components/ui/button';
import type { DetalleFacturas } from '~/types/reportes';

import { calcularEstadoFactura, formatCurrency } from './billing-dashboard';

interface PaymentTimelineProps {
  facturas: Array<
    DetalleFacturas & { consumoPeriodo: number; costoPorKwh: number }
  >;
}

// Extraer mes y año
const extraerAnoMes = (periodo: string) => {
  const mes = periodo.substring(0, 2);
  const ano = periodo.substring(2, 6);
  return { mes, ano };
};

const getNombreMes = (mes: string) => {
  const meses = [
    'Ene',
    'Feb',
    'Mar',
    'Abr',
    'May',
    'Jun',
    'Jul',
    'Ago',
    'Sep',
    'Oct',
    'Nov',
    'Dic'
  ];
  return meses[parseInt(mes, 10) - 1] || mes;
};

const PaymentTimeline = memo(function PaymentTimeline({
  facturas
}: PaymentTimelineProps) {
  const proximasFacturas = useMemo(() => {
    return facturas
      .map(f => ({
        ...f,
        estado: calcularEstadoFactura(f.fechaVencimiento)
      }))
      .filter(
        f => f.estado.estado === 'pendiente' || f.estado.estado === 'vencida'
      )
      .slice(-5)
      .reverse();
  }, [facturas]);

  if (proximasFacturas.length === 0) {
    return (
      <div className="text-center py-8 text-slate-500">
        <Calendar className="h-12 w-12 mx-auto mb-2 opacity-50" />
        <p>No hay facturas pendientes</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Calendar className="h-5 w-5 text-primary" />
        <h3 className="font-semibold">Facturas Pendientes de Pago</h3>
      </div>

      <div className="space-y-3">
        {proximasFacturas.map((factura, index) => {
          const { mes, ano } = extraerAnoMes(factura.periodo);
          const bgColor =
            factura.estado.color === 'red'
              ? 'bg-rose-50 border-rose-200 dark:bg-rose-950/20 dark:border-rose-900'
              : factura.estado.color === 'orange'
                ? 'bg-orange-50 border-orange-200 dark:bg-orange-950/20 dark:border-orange-900'
                : factura.estado.color === 'yellow'
                  ? 'bg-yellow-50 border-yellow-200 dark:bg-yellow-950/20 dark:border-yellow-900'
                  : 'bg-emerald-50 border-emerald-200 dark:bg-emerald-950/20 dark:border-emerald-900';

          return (
            <div
              key={index}
              className={`p-4 rounded-lg border ${bgColor} transition-all hover:shadow-md`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold">
                      {getNombreMes(mes)} {ano}
                    </span>
                    <Badge
                      variant={
                        factura.estado.estado === 'vencida'
                          ? 'destructive'
                          : 'default'
                      }
                      className="text-xs"
                    >
                      {factura.estado.estado === 'vencida'
                        ? `Vencida ${factura.estado.diasVencido} días`
                        : `${factura.estado.diasRestantes} días`}
                    </Badge>
                  </div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">
                    Factura: {factura.nroFactura}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-500 mt-1">
                    Vence:{' '}
                    {new Date(factura.fechaVencimiento).toLocaleDateString(
                      'es-CL'
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="text-xl font-bold">
                      {formatCurrency(factura.valorTotal!)}
                    </div>
                    <div className="text-xs text-slate-500">
                      {factura.consumoPeriodo.toLocaleString('es-CL')} kWh
                    </div>
                  </div>

                  <Button variant="outline" size="sm" title="Descargar factura">
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
});

export default PaymentTimeline;
