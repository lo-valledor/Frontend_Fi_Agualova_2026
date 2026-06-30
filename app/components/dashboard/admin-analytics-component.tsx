import {
  Activity,
  CheckCircle,
  FileText,
  Power,
  Settings,
  Users
} from 'lucide-react';
import { motion } from 'motion/react';
import type { ComponentType, ReactNode } from 'react';

import { Badge } from '~/components/ui/badge';
import { Card, CardContent } from '~/components/ui/card';
import { cn } from '~/lib/utils';

const MECHANICAL_EASE = [0.25, 0.1, 0.25, 1] as const;

function AnalyticsCard({
  icon: Icon,
  title,
  delay,
  children
}: {
  icon: ComponentType<{ className?: string }>;
  title: string;
  delay: number;
  children: ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: MECHANICAL_EASE }}
    >
      <Card className="overflow-hidden border-l-4 border-l-primary/20 hover:border-l-primary transition-colors h-full">
        <CardContent className="p-3 sm:p-4">
          <div className="flex items-center gap-2 mb-2.5">
            <div className="p-1 sm:p-1.5 rounded-md bg-primary/10 shrink-0">
              <Icon className="h-3.5 w-3.5 text-primary" />
            </div>
            <h3 className="text-xs sm:text-sm font-semibold truncate">
              {title}
            </h3>
          </div>
          <div className={cn('min-h-[140px] sm:min-h-[180px]')}>{children}</div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export function AdminAnalyticsComponent() {
  return (
    <div className="grid gap-3 sm:grid-cols-1 lg:grid-cols-2">
      <AnalyticsCard icon={FileText} title="Contratos por Tipo" delay={0.1}>
        <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4">
          <div className="mx-auto flex aspect-square max-h-[150px] sm:max-h-[190px] min-h-[120px] sm:min-h-[150px] w-full sm:w-auto items-center justify-center rounded-full border border-dashed border-border px-6 text-center">
            <div>
              <p className="text-xl sm:text-2xl font-bold font-mono">--</p>
              <p className="text-[0.6rem] sm:text-xs text-muted-foreground uppercase tracking-wide">
                Total
              </p>
            </div>
          </div>

          <div className="space-y-1.5 flex-1 min-w-0 w-full sm:w-auto">
            <div className="flex justify-between items-center py-1 px-2 rounded-sm hover:bg-accent/40 transition-colors">
              <span className="text-xs font-medium truncate">Tipo 01</span>
              <span className="text-sm font-bold font-mono tabular-nums">
                --
              </span>
            </div>
            <div className="flex justify-between items-center py-1 px-2 rounded-sm hover:bg-accent/40 transition-colors">
              <span className="text-xs font-medium truncate">Tipo 02</span>
              <span className="text-sm font-bold font-mono tabular-nums">
                --
              </span>
            </div>
            <div className="flex justify-between items-center py-1 px-2 rounded-sm hover:bg-accent/40 transition-colors">
              <span className="text-xs font-medium truncate">Tipo 03</span>
              <span className="text-sm font-bold font-mono tabular-nums">
                --
              </span>
            </div>
          </div>
        </div>
      </AnalyticsCard>

      <AnalyticsCard icon={Users} title="Clientes por Tipo" delay={0.15}>
        <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4">
          <div className="mx-auto flex aspect-square max-h-[150px] sm:max-h-[190px] min-h-[120px] sm:min-h-[150px] w-full sm:w-auto items-center justify-center rounded-full border border-dashed border-border px-6 text-center">
            <div>
              <p className="text-xl sm:text-2xl font-bold font-mono">--</p>
              <p className="text-[0.6rem] sm:text-xs text-muted-foreground uppercase tracking-wide">
                Total
              </p>
            </div>
          </div>

          <div className="space-y-2 flex-1 w-full sm:w-auto">
            <div className="flex justify-between items-center py-1.5 px-2 rounded-sm hover:bg-accent/40 transition-colors">
              <span className="text-xs font-medium">Empresas</span>
              <span className="text-sm font-bold font-mono tabular-nums">
                --
              </span>
            </div>
            <div className="flex justify-between items-center py-1.5 px-2 rounded-sm hover:bg-accent/40 transition-colors">
              <span className="text-xs font-medium">Personas</span>
              <span className="text-sm font-bold font-mono tabular-nums">
                --
              </span>
            </div>
          </div>
        </div>
      </AnalyticsCard>

      <AnalyticsCard icon={Activity} title="Medidores" delay={0.2}>
        <div className="space-y-4">
          <div>
            <div className="flex items-center gap-1.5 mb-2">
              <Settings className="h-3 w-3 text-muted-foreground" />
              <span className="text-[0.65rem] font-bold tracking-wider uppercase text-muted-foreground">
                Por Tipo
              </span>
            </div>
            <div className="space-y-1">
              <div className="flex justify-between items-center text-xs py-1 px-2 rounded-sm hover:bg-accent/40 transition-colors">
                <span className="truncate">Tipo 01</span>
                <span className="font-bold font-mono tabular-nums shrink-0">
                  --
                </span>
              </div>
              <div className="flex justify-between items-center text-xs py-1 px-2 rounded-sm hover:bg-accent/40 transition-colors">
                <span className="truncate">Tipo 02</span>
                <span className="font-bold font-mono tabular-nums shrink-0">
                  --
                </span>
              </div>
              <div className="flex justify-between items-center text-xs py-1 px-2 rounded-sm hover:bg-accent/40 transition-colors">
                <span className="truncate">Tipo 03</span>
                <span className="font-bold font-mono tabular-nums shrink-0">
                  --
                </span>
              </div>
            </div>
          </div>

          <div className="industrial-divider" />

          <div>
            <div className="flex items-center gap-1.5 mb-2">
              <CheckCircle className="h-3 w-3 text-muted-foreground" />
              <span className="text-[0.65rem] font-bold tracking-wider uppercase text-muted-foreground">
                Por Estado
              </span>
            </div>
            <div className="space-y-1">
              <div className="flex justify-between items-center text-xs py-1 px-2 rounded-sm hover:bg-accent/40 transition-colors">
                <Badge
                  variant="default"
                  className="text-[0.6rem] px-1.5 py-0 h-5 font-bold tracking-wide"
                >
                  Activo
                </Badge>
                <span className="font-bold font-mono tabular-nums shrink-0">
                  --
                </span>
              </div>
              <div className="flex justify-between items-center text-xs py-1 px-2 rounded-sm hover:bg-accent/40 transition-colors">
                <Badge
                  variant="secondary"
                  className="text-[0.6rem] px-1.5 py-0 h-5 font-bold tracking-wide"
                >
                  Mantenimiento
                </Badge>
                <span className="font-bold font-mono tabular-nums shrink-0">
                  --
                </span>
              </div>
              <div className="flex justify-between items-center text-xs py-1 px-2 rounded-sm hover:bg-accent/40 transition-colors">
                <Badge
                  variant="destructive"
                  className="text-[0.6rem] px-1.5 py-0 h-5 font-bold tracking-wide"
                >
                  Inactivo
                </Badge>
                <span className="font-bold font-mono tabular-nums shrink-0">
                  --
                </span>
              </div>
            </div>
          </div>
        </div>
      </AnalyticsCard>

      <AnalyticsCard icon={Power} title="Acometidas por Sector" delay={0.25}>
        <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4">
          <div className="mx-auto flex aspect-square max-h-[150px] sm:max-h-[190px] min-h-[120px] sm:min-h-[150px] w-full sm:w-auto items-center justify-center rounded-full border border-dashed border-border px-6 text-center">
            <div>
              <p className="text-xl sm:text-2xl font-bold font-mono">--</p>
              <p className="text-[0.6rem] sm:text-xs text-muted-foreground uppercase tracking-wide">
                Total
              </p>
            </div>
          </div>

          <div className="space-y-1.5 flex-1 min-w-0 w-full sm:w-auto">
            <div className="flex justify-between items-center py-1 px-2 rounded-sm hover:bg-accent/40 transition-colors">
              <span className="text-xs font-medium truncate">Sector 01</span>
              <span className="text-sm font-bold font-mono tabular-nums shrink-0">
                --
              </span>
            </div>
            <div className="flex justify-between items-center py-1 px-2 rounded-sm hover:bg-accent/40 transition-colors">
              <span className="text-xs font-medium truncate">Sector 02</span>
              <span className="text-sm font-bold font-mono tabular-nums shrink-0">
                --
              </span>
            </div>
            <div className="flex justify-between items-center py-1 px-2 rounded-sm hover:bg-accent/40 transition-colors">
              <span className="text-xs font-medium truncate">Sector 03</span>
              <span className="text-sm font-bold font-mono tabular-nums shrink-0">
                --
              </span>
            </div>
          </div>
        </div>
      </AnalyticsCard>
    </div>
  );
}
