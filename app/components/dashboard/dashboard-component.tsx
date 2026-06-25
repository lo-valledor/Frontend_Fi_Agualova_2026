import NumberFlow, { continuous } from '@number-flow/react';
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
import { useEffect, useState } from 'react';
import { Link } from 'react-router';

import { AdminAnalyticsComponent } from '~/components/dashboard/admin-analytics-component';
import { Card, CardContent, CardHeader } from '~/components/ui/card';
import { usePrefetchMultiple } from '~/hooks/shared/use-prefetch';

const MECHANICAL_EASE = [0.25, 0.1, 0.25, 1] as const;

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

function renderPeriodoActual(
  loading: boolean,
  periodoActual: { mes: number; anio: number; estado: string }
) {
  if (loading) {
    return <span className="animate-pulse text-muted-foreground">---</span>;
  }

  if (periodoActual.mes > 0) {
    return (
      <span>
        {periodoActual.mes.toString().padStart(2, '0')}/{periodoActual.anio}
      </span>
    );
  }

  return <span className="text-sm text-destructive">Sin período</span>;
}

export default function DashboardComponent() {
  usePrefetchMultiple(
    [
      '/dashboard/administracion/contratos',
      '/dashboard/administracion/clientes',
      '/dashboard/administracion/medidores',
      '/dashboard/monitor/lecturas',
      '/dashboard/operaciones/periodo-facturacion'
    ],
    2000,
    1000
  );

  const [dashboardData, setDashboardData] = useState({
    periodoActual: { mes: 0, anio: 0, estado: 'Sin período' },
    lecturasPendientes: 0,
    totalesCorte: {
      pendiente: 0,
      liberado: 0,
      cortado: 0,
      reposicionSolicitada: 0,
      total: 0
    },
    fechaHora: new Date(),
    loading: false
  });

  const [displayData] = useState({
    lecturasPendientes: 0,
    totalesCorte: {
      pendiente: 0,
      liberado: 0,
      cortado: 0,
      reposicionSolicitada: 0,
      total: 0
    },
    limiteInvierno: 0
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setDashboardData((prev) => ({ ...prev, fechaHora: new Date() }));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const statCards = [
    {
      label: 'Período Actual',
      icon: FileText,
      accentClass: 'border-t-energy',
      content: (
        <div className="text-2xl sm:text-3xl font-black font-mono tracking-tight">
          {renderPeriodoActual(
            dashboardData.loading,
            dashboardData.periodoActual
          )}
        </div>
      ),
      sub: (
        <div className="flex gap-1.5">
          {dashboardData.periodoActual.mes > 0 && !dashboardData.loading && (
            <div className="energy-dot-sm" />
          )}
          <span className="text-[0.65rem] text-muted-foreground uppercase tracking-wider font-bold">
            {dashboardData.periodoActual.estado}
          </span>
        </div>
      )
    },
    {
      label: 'Sectores Pendientes',
      icon: Activity,
      accentClass: 'border-t-chart-1',
      content: (
        <div className="text-2xl sm:text-3xl font-black font-mono tracking-tight">
          {dashboardData.loading ? (
            <span className="animate-pulse text-muted-foreground">---</span>
          ) : (
            <NumberFlow
              value={displayData.lecturasPendientes}
              format={{
                useGrouping: true,
                minimumFractionDigits: 0,
                maximumFractionDigits: 0
              }}
              transformTiming={{
                duration: 1200,
                easing: 'cubic-bezier(0.4, 0.0, 0.2, 1)'
              }}
              plugins={[continuous]}
              className="tabular-nums"
            />
          )}
        </div>
      ),
      sub: (
        <div>
          <span className="text-[0.65rem] text-muted-foreground uppercase tracking-wider font-bold">
            Lecturas por procesar
          </span>
        </div>
      )
    },
    {
      label: 'Límite Invierno',
      icon: Snowflake,
      accentClass: 'border-t-chart-4',
      content: (
        <div className="text-2xl sm:text-3xl font-black font-mono tracking-tight">
          {dashboardData.loading ? (
            <span className="animate-pulse text-muted-foreground">---</span>
          ) : (
            <>
              <NumberFlow
                value={displayData.limiteInvierno}
                format={{
                  useGrouping: true,
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0
                }}
                transformTiming={{
                  duration: 1500,
                  easing: 'cubic-bezier(0.4, 0.0, 0.2, 1)'
                }}
                plugins={[continuous]}
                className="tabular-nums"
              />
              <span className="text-base font-light text-muted-foreground ml-1">
                m³
              </span>
            </>
          )}
        </div>
      ),
      sub: (
        <div>
          <span className="text-[0.65rem] text-muted-foreground uppercase tracking-wider font-bold">
            Sobrecargo invierno
          </span>
        </div>
      )
    },
    {
      label: 'Cortes Totales',
      icon: Power,
      accentClass: 'border-t-destructive',
      content: (
        <div className="text-2xl sm:text-3xl font-black font-mono tracking-tight">
          {dashboardData.loading ? (
            <span className="animate-pulse text-muted-foreground">---</span>
          ) : (
            <NumberFlow
              value={displayData.totalesCorte.total}
              format={{
                useGrouping: true,
                minimumFractionDigits: 0,
                maximumFractionDigits: 0
              }}
              transformTiming={{
                duration: 1800,
                easing: 'cubic-bezier(0.4, 0.0, 0.2, 1)'
              }}
              plugins={[continuous]}
              className="tabular-nums"
            />
          )}
        </div>
      ),
      sub: (
        <div className="flex items-center gap-2">
          <span className="text-[0.6rem] font-bold tracking-wider uppercase px-1.5 py-0.5 rounded-sm bg-destructive/10 text-destructive border border-destructive/20">
            {displayData.totalesCorte.cortado} cortados
          </span>
          <span className="text-[0.6rem] font-bold tracking-wider uppercase px-1.5 py-0.5 rounded-sm bg-chart-2/10 text-chart-2 border border-chart-2/20">
            {displayData.totalesCorte.liberado} liberados
          </span>
        </div>
      )
    }
  ];

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
          {statCards.map((card, index) => (
            <motion.div
              key={card.label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.25,
                delay: index * 0.06,
                ease: MECHANICAL_EASE
              }}
            >
              <Card
                className={`border-t-2 ${card.accentClass} overflow-hidden h-full flex flex-col`}
              >
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1.5 pt-3 px-4">
                  <span className="text-[0.65rem] font-bold tracking-wider uppercase text-muted-foreground">
                    {card.label}
                  </span>
                  <div className="flex h-6 w-6 items-center justify-center rounded bg-accent text-accent-foreground">
                    <card.icon className="h-3.5 w-3.5" />
                  </div>
                </CardHeader>
                <CardContent className="px-4 pb-3 flex flex-col gap-1 flex-1">
                  {card.content}
                  {card.sub}
                </CardContent>
              </Card>
            </motion.div>
          ))}
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
