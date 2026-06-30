import {
  Activity,
  ArrowRight,
  FileText,
  Power,
  Settings,
  Snowflake,
  Zap
} from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import type { ComponentType, ReactNode } from 'react';
import { Link } from 'react-router';

import { AdminAnalyticsComponent } from '~/components/dashboard/admin-analytics-component';
import { Card, CardContent, CardHeader } from '~/components/ui/card';
import type { MonitorPeriodos } from '~/types/monitor';

const MECHANICAL_EASE = [0.25, 0.1, 0.25, 1] as const;

type DashboardComponentProps = {
  periodos: MonitorPeriodos[];
};

const quickActions = [
  {
    title: 'Monitor Lecturas',
    description: 'Visualizar lecturas de medidores',
    icon: Activity,
    accent: 'border-chart-1 text-chart-1',
    href: '/dashboard/monitor/monitor-lecturas'
  },
  {
    title: 'Nuevo Contrato',
    description: 'Registrar contrato de servicio',
    icon: FileText,
    accent: 'border-chart-2 text-chart-2',
    href: '/dashboard/administracion/contratos/crear'
  },
  {
    title: 'Periodo Facturación',
    description: 'Gestionar periodos activos',
    icon: Settings,
    accent: 'border-chart-3 text-chart-3',
    href: '/dashboard/operaciones/periodo-facturacion'
  },
  {
    title: 'Clientes',
    description: 'Administrar clientes',
    icon: Activity,
    accent: 'border-chart-4 text-chart-4',
    href: '/dashboard/administracion/clientes'
  },
  {
    title: 'Medidores',
    description: 'Gestión de medidores',
    icon: Zap,
    accent: 'border-chart-5 text-chart-5',
    href: '/dashboard/administracion/medidores'
  },
  {
    title: 'Configuración',
    description: 'Roles, permisos y ajustes',
    icon: Settings,
    accent: 'border-primary text-primary',
    href: '/dashboard/configuracion/roles-permisos'
  }
];

function PlaceholderMetricCard({
  label,
  icon: Icon,
  accentClass,
  value,
  description,
  badge
}: {
  label: string;
  icon: ComponentType<{ className?: string }>;
  accentClass: string;
  value: ReactNode;
  description?: ReactNode;
  badge?: ReactNode;
}) {
  return (
    <Card
      className={`border-t-2 ${accentClass} overflow-hidden h-full flex flex-col`}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1.5 pt-3 px-4">
        <span className="text-[0.65rem] font-bold tracking-wider uppercase text-muted-foreground">
          {label}
        </span>
        <div className="flex h-6 w-6 items-center justify-center rounded bg-accent text-accent-foreground">
          <Icon className="h-3.5 w-3.5" />
        </div>
      </CardHeader>
      <CardContent className="px-4 pb-3 flex flex-col gap-1 flex-1">
        <div className="text-2xl sm:text-3xl font-black font-mono tracking-tight">
          {value}
        </div>
        {description}
        {badge}
      </CardContent>
    </Card>
  );
}

export default function DashboardComponent({
  periodos
}: DashboardComponentProps) {
  return (
    <div className="flex flex-col gap-4 sm:gap-5 p-3 sm:p-5 lg:p-6">
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: MECHANICAL_EASE }}
        className="flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary">
            <Zap className="h-4 w-4 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-sm sm:text-base font-black tracking-tight uppercase">
              Panel de Control
            </h1>
            <p className="text-[0.65rem] text-muted-foreground font-bold tracking-wider uppercase">
              Resumen operacional
            </p>
          </div>
        </div>
      </motion.div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, delay: 0, ease: MECHANICAL_EASE }}
          >
            <PlaceholderMetricCard
              label="Período Actual"
              icon={FileText}
              accentClass="border-t-energy"
              value={<span>{periodos[0]?.text ?? '--'}</span>}
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, delay: 0.06, ease: MECHANICAL_EASE }}
          >
            <PlaceholderMetricCard
              label="Sectores Pendientes"
              icon={Activity}
              accentClass="border-t-chart-1"
              value={<span>---</span>}
              description={
                <span className="text-[0.65rem] text-muted-foreground uppercase tracking-wider font-bold">
                  Espacio para lecturas por procesar
                </span>
              }
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, delay: 0.12, ease: MECHANICAL_EASE }}
          >
            <PlaceholderMetricCard
              label="Límite Invierno"
              icon={Snowflake}
              accentClass="border-t-chart-4"
              value={
                <>
                  <span>---</span>
                  <span className="text-base font-light text-muted-foreground ml-1">
                    m³
                  </span>
                </>
              }
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, delay: 0.18, ease: MECHANICAL_EASE }}
          >
            <PlaceholderMetricCard
              label="Cortes Totales"
              icon={Power}
              accentClass="border-t-destructive"
              value={<span>---</span>}
              badge={
                <div className="flex items-center gap-2">
                  <span className="text-[0.6rem] font-bold tracking-wider uppercase px-1.5 py-0.5 rounded-sm bg-destructive/10 text-destructive border border-destructive/20">
                    -- cortados
                  </span>
                  <span className="text-[0.6rem] font-bold tracking-wider uppercase px-1.5 py-0.5 rounded-sm bg-chart-2/10 text-chart-2 border border-chart-2/20">
                    -- liberados
                  </span>
                </div>
              }
            />
          </motion.div>
        </AnimatePresence>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.3, ease: MECHANICAL_EASE }}
      >
        <div className="flex items-center gap-2.5 mb-3">
          <div className="flex h-6 w-6 items-center justify-center rounded bg-accent text-accent-foreground">
            <Zap className="h-3.5 w-3.5" />
          </div>
          <span className="text-xs font-bold tracking-wide uppercase">
            Accesos Rápidos
          </span>
        </div>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {quickActions.map((action, index) => (
            <motion.div
              key={action.href}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{
                duration: 0.2,
                delay: 0.35 + index * 0.04,
                ease: MECHANICAL_EASE
              }}
            >
              <Link
                to={action.href}
                className={`group flex items-center gap-3 p-3 rounded-md border-l-2 ${action.accent} bg-card hover:bg-accent/40 transition-all duration-150 border border-l-2 border-border`}
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded bg-accent/80 text-accent-foreground transition-colors group-hover:bg-accent">
                  <action.icon className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold tracking-tight truncate">
                    {action.title}
                  </div>
                  <div className="text-[0.65rem] text-muted-foreground truncate">
                    {action.description}
                  </div>
                </div>
                <ArrowRight className="h-3 w-3 text-muted-foreground opacity-0 -translate-x-1 transition-all duration-150 group-hover:opacity-100 group-hover:translate-x-0 shrink-0" />
              </Link>
            </motion.div>
          ))}
        </div>
      </motion.div>

      <div className="industrial-divider" />

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.5, ease: MECHANICAL_EASE }}
        className="space-y-3"
      >
        <div className="flex items-center gap-2.5">
          <div className="flex h-6 w-6 items-center justify-center rounded bg-accent text-accent-foreground">
            <Settings className="h-3.5 w-3.5" />
          </div>
          <span className="text-xs font-bold tracking-wide uppercase">
            Panel de Administración
          </span>
        </div>
        <AdminAnalyticsComponent />
      </motion.div>
    </div>
  );
}
