import { AlertCircle, Calendar, Gauge, StickyNote, Zap } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import { EmptyState } from '~/components/ui/empty-state';
import type { EtapaDos } from '~/types/monitor';
import { formatSafeDate } from '~/utils/monitor';

interface InformacionLecturaProps {
  data: EtapaDos[];
  error?: string;
}

// Extracted InfoCard component for DRY principle
interface InfoCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number | null | undefined;
  unit?: string;
}

const InfoCard = ({ icon, label, value, unit }: InfoCardProps) => (
  <div className="p-3 bg-muted/30 rounded-xl border border-border/20 hover:bg-muted/50 transition-colors">
    <div className="flex items-center gap-2 mb-1.5">
      {icon}
      <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
        {label}
      </span>
    </div>
    <p className="text-sm font-semibold text-foreground wrap-break-word">
      {value ?? '-'}
      {value && unit && (
        <span className="text-xs font-normal text-muted-foreground ml-1">
          {unit}
        </span>
      )}
    </p>
  </div>
);

export default function InformacionLectura({
  data,
  error
}: InformacionLecturaProps) {
  const lectura = data?.[0];

  // Format date using our utility function
  const formattedDate = lectura?.LM_FechaLectura
    ? formatSafeDate(lectura.LM_FechaLectura, "d 'de' MMMM, yyyy HH:mm")
    : '-';

  return (
    <Card className="border-0 shadow-none bg-transparent">
      <CardHeader className="px-0 pb-2">
        <CardTitle className="flex items-center gap-2 text-foreground text-sm font-medium">
          <div className="h-5 w-5 rounded bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
            <Zap className="h-3 w-3 text-green-600 dark:text-green-400" />
          </div>
          <span>Lectura del Periodo {lectura?.LM_Periodo || ''}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="px-0 space-y-3">
        {error ? (
          <div className="flex items-start gap-2 text-xs text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-950/20 px-3 py-2 rounded-xl border border-red-200 dark:border-red-800">
            <AlertCircle className="h-3 w-3 mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        ) : !lectura ? (
          <EmptyState
            icon={<Calendar className="w-12 h-12" />}
            title="No hay datos de lectura"
            description="No se encontraron datos para el período seleccionado"
            suggestions={[
              'Verifica que el período tenga lecturas registradas',
              'El medidor puede no tener información para este período',
              'Consulta con el administrador si el problema persiste'
            ]}
          />
        ) : (
          <div className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              <InfoCard
                icon={<Calendar className="h-3 w-3 text-primary" />}
                label="Fecha Lectura"
                value={formattedDate}
              />
              <InfoCard
                icon={
                  <Gauge className="h-3 w-3 text-purple-600 dark:text-purple-400" />
                }
                label="Lectura Actual"
                value={lectura.LM_ValorLecturaActual?.toLocaleString('es-CL')}
              />
              <InfoCard
                icon={
                  <Zap className="h-3 w-3 text-orange-600 dark:text-orange-400" />
                }
                label="Consumo del Período"
                value={lectura.LM_ConsumoPeriodo?.toLocaleString('es-CL')}
                unit="kWh"
              />
            </div>
            {lectura.LM_Observaciones && (
              <div className="p-3 bg-muted/30 rounded-xl border border-border/20">
                <div className="flex items-center gap-2 mb-1.5">
                  <StickyNote className="h-3 w-3 text-yellow-600 dark:text-yellow-400" />
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Observaciones
                  </span>
                </div>
                <p className="text-sm text-foreground italic wrap-break-word">
                  {lectura.LM_Observaciones}
                </p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
